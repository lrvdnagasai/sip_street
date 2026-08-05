from datetime import date
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
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.services.billing_service import BillingService
from app.services.category_service import CategoryService
from app.services.dashboard_service import DashboardService
from app.services.expense_service import ExpenseService
from app.services.product_service import ProductService
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


def test_expense_service_crud_and_summary(db_session):
    # 1. Create expense
    exp1 = ExpenseService.create_expense(
        db_session,
        ExpenseCreate(
            category=ExpenseCategory.MILK,
            description="Daily Milk Purchase 10L",
            amount=Decimal("500.00"),
            payment_mode=ExpensePaymentMode.CASH,
            receipt_number="MILK-101",
            notes="Fresh dairy milk supply",
        ),
    )
    assert exp1.id is not None
    assert exp1.category == ExpenseCategory.MILK
    assert exp1.amount == Decimal("500.00")
    assert exp1.is_active is True

    # 2. Get single & list
    fetched = ExpenseService.get_expense(db_session, exp1.id)
    assert fetched.description == "Daily Milk Purchase 10L"

    all_exps = ExpenseService.get_expenses(db_session, search="Milk")
    assert len(all_exps) == 1

    # 3. Update expense
    updated = ExpenseService.update_expense(
        db_session,
        exp1.id,
        ExpenseUpdate(amount=Decimal("550.00"), description="Daily Milk Purchase 11L"),
    )
    assert updated.amount == Decimal("550.00")
    assert updated.description == "Daily Milk Purchase 11L"

    # 4. Soft disable & enable
    disabled = ExpenseService.set_expense_active(db_session, exp1.id, is_active=False)
    assert disabled.is_active is False
    assert len(ExpenseService.get_expenses(db_session, include_inactive=False)) == 0
    assert len(ExpenseService.get_expenses(db_session, include_inactive=True)) == 1

    enabled = ExpenseService.set_expense_active(db_session, exp1.id, is_active=True)
    assert enabled.is_active is True

    # 5. Summary metrics
    summary = ExpenseService.get_expense_summary(db_session)
    assert summary.todays_expenses == Decimal("550.00")
    assert summary.this_month_expenses == Decimal("550.00")


def test_expense_dashboard_integration(db_session):
    admin = UserService.create_user(
        db_session, username="exp_admin", full_name="Exp Admin", password="Password123", role=UserRole.ADMIN
    )
    cat = CategoryService.create_category(db_session, name="Beverages")
    p1 = ProductService.create_product(db_session, category_id=cat.id, name="Tea", price=Decimal("100.00"), product_type=ProductType.BEVERAGE)

    # Invoice: 2 x Tea = 200.00 Total Sales
    BillingService.create_invoice(
        db=db_session,
        cashier_id=admin.id,
        items_data=[{"product_id": p1.id, "quantity": 2}],
        payment_mode=PaymentMode.CASH,
        amount_received=Decimal("200.00"),
    )

    # Expense: 50.00 Milk
    ExpenseService.create_expense(
        db_session,
        ExpenseCreate(
            category=ExpenseCategory.MILK,
            description="Milk 1L",
            amount=Decimal("50.00"),
            payment_mode=ExpensePaymentMode.CASH,
        ),
    )

    dash_summary = DashboardService.get_summary(db_session, filter_type="TODAY")
    assert dash_summary.total_sales == Decimal("200.00")
    assert dash_summary.todays_expenses == Decimal("50.00")
    assert dash_summary.net_sales == Decimal("150.00")


@pytest.fixture
def client_with_expense_setup():
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
    UserService.create_user(db, username="cashier_exp", full_name="Cashier Exp", password="cashierpassword123", role=UserRole.CASHIER)
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


def test_expense_api_authorization(client_with_expense_setup):
    client = client_with_expense_setup

    # 1. Unauthenticated -> 401
    assert client.get("/api/expenses").status_code == 401

    # 2. Login as Cashier -> 403 Forbidden
    client.post("/api/auth/login", json={"username": "cashier_exp", "password": "cashierpassword123"})
    assert client.get("/api/expenses").status_code == 403
    assert client.post("/api/expenses", json={"category": "MILK", "description": "Milk", "amount": 50}).status_code == 403

    # 3. Logout & Login as Admin -> 200/201 OK
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    create_res = client.post(
        "/api/expenses",
        json={
            "category": "COFFEE",
            "description": "Coffee Beans 1kg",
            "amount": 850.00,
            "payment_mode": "UPI",
            "receipt_number": "COF-99",
        },
    )
    assert create_res.status_code == 201
    exp_id = create_res.json()["id"]

    assert client.get("/api/expenses").status_code == 200
    assert client.get("/api/expenses/summary").status_code == 200
    assert client.get(f"/api/expenses/{exp_id}").status_code == 200

    disable_res = client.patch(f"/api/expenses/{exp_id}/disable")
    assert disable_res.status_code == 200
    assert disable_res.json()["is_active"] is False

    enable_res = client.patch(f"/api/expenses/{exp_id}/enable")
    assert enable_res.status_code == 200
    assert enable_res.json()["is_active"] is True
