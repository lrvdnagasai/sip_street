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
from app.models.invoice import PaymentMode
from app.models.product import ProductType
from app.models.user import UserRole
from app.services.billing_service import BillingService
from app.services.category_service import CategoryService
from app.services.dashboard_service import DashboardService
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


def test_dashboard_service_aggregations(db_session):
    admin = UserService.create_user(
        db_session, username="dash_admin", full_name="Dash Admin", password="Password123", role=UserRole.ADMIN
    )
    cat = CategoryService.create_category(db_session, name="Hot Drinks")
    p1 = ProductService.create_product(db_session, category_id=cat.id, name="Espresso", price=Decimal("100.00"), product_type=ProductType.BEVERAGE)
    p2 = ProductService.create_product(db_session, category_id=cat.id, name="Cappuccino", price=Decimal("150.00"), product_type=ProductType.BEVERAGE)

    # Order 1: 2 x Espresso (200) CASH
    BillingService.create_invoice(
        db=db_session,
        cashier_id=admin.id,
        items_data=[{"product_id": p1.id, "quantity": 2}],
        payment_mode=PaymentMode.CASH,
        amount_received=Decimal("200.00"),
    )

    # Order 2: 1 x Cappuccino (150) UPI
    BillingService.create_invoice(
        db=db_session,
        cashier_id=admin.id,
        items_data=[{"product_id": p2.id, "quantity": 1}],
        payment_mode=PaymentMode.UPI,
        amount_received=Decimal("150.00"),
    )

    # 1. Summary
    summary = DashboardService.get_summary(db_session, filter_type="TODAY")
    assert summary.total_sales == Decimal("350.00")
    assert summary.total_orders == 2
    assert summary.average_bill_value == Decimal("175.00")
    assert summary.products_sold == 3

    # 2. Payment summary
    pay = DashboardService.get_payment_summary(db_session, filter_type="TODAY")
    assert pay.total_amount == Decimal("350.00")
    assert len(pay.breakdown) == 3

    cash_item = next(b for b in pay.breakdown if b.mode == "CASH")
    assert cash_item.amount == Decimal("200.00")
    assert cash_item.count == 1

    upi_item = next(b for b in pay.breakdown if b.mode == "UPI")
    assert upi_item.amount == Decimal("150.00")
    assert upi_item.count == 1

    # 3. Top products
    top = DashboardService.get_top_products(db_session, filter_type="TODAY")
    assert len(top) == 2
    assert top[0].product_name == "Espresso"
    assert top[0].quantity_sold == 2

    # 4. Hourly sales
    hourly = DashboardService.get_hourly_sales(db_session, filter_type="TODAY")
    assert len(hourly) == 15

    # 5. Recent transactions
    txs = DashboardService.get_recent_transactions(db_session)
    assert len(txs) == 2


@pytest.fixture
def client_with_dashboard_setup():
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
    UserService.create_user(db, username="cashier_test", full_name="Cashier Test", password="cashierpassword123", role=UserRole.CASHIER)
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


def test_dashboard_api_authorization(client_with_dashboard_setup):
    client = client_with_dashboard_setup

    # 1. Unauthenticated -> 401
    assert client.get("/api/dashboard/summary").status_code == 401

    # 2. Login as Cashier -> 403 Forbidden
    client.post("/api/auth/login", json={"username": "cashier_test", "password": "cashierpassword123"})
    forbidden_res = client.get("/api/dashboard/summary")
    assert forbidden_res.status_code == 403

    # 3. Logout & Login as Admin -> 200 OK
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    assert client.get("/api/dashboard/summary").status_code == 200
    assert client.get("/api/dashboard/payment-summary").status_code == 200
    assert client.get("/api/dashboard/top-products").status_code == 200
    assert client.get("/api/dashboard/hourly-sales").status_code == 200
    assert client.get("/api/dashboard/recent-transactions").status_code == 200
