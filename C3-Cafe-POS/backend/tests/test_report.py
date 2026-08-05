from decimal import Decimal
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.seeder import seed_default_admin
from app.dependencies import get_db
from app.main import app
from app.models.expense import ExpenseCategory, ExpensePaymentMode
from app.models.invoice import PaymentMode
from app.models.product import ProductType
from app.models.user import UserRole
from app.schemas.expense import ExpenseCreate
from app.services.billing_service import BillingService
from app.services.category_service import CategoryService
from app.services.expense_service import ExpenseService
from app.services.product_service import ProductService
from app.services.report_service import ReportService
from app.services.user_service import UserService


@pytest.fixture
def db_session():
    """Fixture providing an isolated in-memory SQLite database session."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_report_service_calculations(db_session):
    admin = UserService.create_user(
        db_session, username="rep_admin", full_name="Report Admin", password="Password123", role=UserRole.ADMIN
    )
    cat = CategoryService.create_category(db_session, name="Hot Beverages")
    p1 = ProductService.create_product(db_session, category_id=cat.id, name="Filter Coffee", price=Decimal("100.00"), product_type=ProductType.BEVERAGE)

    # 1. Invoice: 2 x Coffee = 200.00 CASH
    BillingService.create_invoice(
        db=db_session,
        cashier_id=admin.id,
        items_data=[{"product_id": p1.id, "quantity": 2}],
        payment_mode=PaymentMode.CASH,
        amount_received=Decimal("200.00"),
    )

    # 2. Expense: 50.00 Milk
    ExpenseService.create_expense(
        db_session,
        ExpenseCreate(
            category=ExpenseCategory.MILK,
            description="Fresh Milk 1L",
            amount=Decimal("50.00"),
            payment_mode=ExpensePaymentMode.CASH,
        ),
    )

    # Sales Report
    sales_rep = ReportService.get_sales_report(db_session, filter_type="TODAY")
    assert sales_rep.total_sales == Decimal("200.00")
    assert sales_rep.total_orders == 1
    assert sales_rep.products_sold == 2

    # Expense Report
    exp_rep = ReportService.get_expense_report(db_session, filter_type="TODAY")
    assert exp_rep.total_expenses == Decimal("50.00")
    assert len(exp_rep.category_breakdown) == 1

    # Profit Report
    profit_rep = ReportService.get_profit_report(db_session, filter_type="TODAY")
    assert profit_rep.gross_sales == Decimal("200.00")
    assert profit_rep.total_expenses == Decimal("50.00")
    assert profit_rep.net_profit == Decimal("150.00")
    assert profit_rep.profit_margin_pct == 75.0

    # Product Report
    prod_rep = ReportService.get_product_report(db_session, filter_type="TODAY")
    assert len(prod_rep.top_products) == 1
    assert prod_rep.top_products[0].product_name == "Filter Coffee"
    assert prod_rep.top_products[0].quantity_sold == 2

    # Category Report
    cat_rep = ReportService.get_category_report(db_session, filter_type="TODAY")
    assert cat_rep.top_category_name == "Hot Beverages"
    assert len(cat_rep.items) == 1

    # Cashier Report
    cashier_rep = ReportService.get_cashier_report(db_session, filter_type="TODAY")
    assert len(cashier_rep.items) == 1
    assert cashier_rep.items[0].cashier_name == "Report Admin"
    assert cashier_rep.items[0].revenue == Decimal("200.00")

    # Payment Report
    pay_rep = ReportService.get_payment_report(db_session, filter_type="TODAY")
    assert pay_rep.total_amount == Decimal("200.00")
    assert len(pay_rep.items) == 3


@pytest.fixture
def client_with_report_setup():
    """Fixture initializing TestClient with Admin and Cashier accounts."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = TestingSessionLocal()
    seed_default_admin(db=db)
    UserService.create_user(db, username="cashier_rep", full_name="Cashier Rep", password="cashierpassword123", role=UserRole.CASHIER)
    db.close()

    def override_get_db():
        db_s = TestingSessionLocal()
        try:
            yield db_s
        finally:
            db_s.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_report_api_authorization(client_with_report_setup):
    client = client_with_report_setup

    endpoints = [
        "/api/reports/sales",
        "/api/reports/expenses",
        "/api/reports/profit",
        "/api/reports/products",
        "/api/reports/categories",
        "/api/reports/cashiers",
        "/api/reports/payments",
    ]

    # 1. Unauthenticated -> 401
    for ep in endpoints:
        assert client.get(ep).status_code == 401

    # 2. Login as Cashier -> 403 Forbidden
    client.post("/api/auth/login", json={"username": "cashier_rep", "password": "cashierpassword123"})
    for ep in endpoints:
        assert client.get(ep).status_code == 403

    # 3. Logout & Login as Admin -> 200 OK
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    for ep in endpoints:
        assert client.get(ep).status_code == 200
