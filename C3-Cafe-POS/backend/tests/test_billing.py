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


def test_billing_service_creation_and_validation(db_session):
    # Setup user
    cashier = UserService.create_user(
        db_session,
        username="billing_cashier",
        full_name="Billing Cashier",
        password="CashierPassword123",
        role=UserRole.CASHIER,
    )

    # Setup categories and products
    cat = CategoryService.create_category(db_session, name="Hot Beverages", display_order=1)
    p1 = ProductService.create_product(
        db_session,
        category_id=cat.id,
        name="Filter Coffee",
        price=Decimal("40.00"),
        product_type=ProductType.BEVERAGE,
    )
    p2 = ProductService.create_product(
        db_session,
        category_id=cat.id,
        name="Masala Tea",
        price=Decimal("25.00"),
        product_type=ProductType.BEVERAGE,
    )

    # 1. Billing products query
    billing_prods = BillingService.get_billing_products(db_session)
    assert len(billing_prods) == 2

    # 2. Create valid invoice
    items_data = [
        {"product_id": p1.id, "quantity": 2},  # 2 x 40 = 80
        {"product_id": p2.id, "quantity": 1},  # 1 x 25 = 25
    ]
    inv = BillingService.create_invoice(
        db=db_session,
        cashier_id=cashier.id,
        items_data=items_data,
        payment_mode=PaymentMode.CASH,
        amount_received=Decimal("200.00"),
        customer_name="John Doe",
    )

    assert inv.id is not None
    assert inv.invoice_number == "INV000001"
    assert inv.subtotal == Decimal("105.00")
    assert inv.grand_total == Decimal("105.00")
    assert inv.amount_received == Decimal("200.00")
    assert inv.balance_amount == Decimal("95.00")
    assert len(inv.items) == 2
    assert inv.items[0].product_name == "Filter Coffee"
    assert inv.items[0].unit_price == Decimal("40.00")

    # 3. Insufficient payment validation error
    with pytest.raises(ValueError, match="less than grand total"):
        BillingService.create_invoice(
            db=db_session,
            cashier_id=cashier.id,
            items_data=[{"product_id": p1.id, "quantity": 1}],
            amount_received=Decimal("10.00"),  # Less than price 40
        )

    # 4. Unavailable product error
    ProductService.set_availability(db_session, p2.id, is_available=False)
    with pytest.raises(ValueError, match="unavailable for billing"):
        BillingService.create_invoice(
            db=db_session,
            cashier_id=cashier.id,
            items_data=[{"product_id": p2.id, "quantity": 1}],
            amount_received=Decimal("50.00"),
        )

    # 5. History check
    history = BillingService.get_invoice_history(db_session)
    assert len(history) == 1
    assert history[0].invoice_number == "INV000001"


@pytest.fixture
def client_with_billing_setup():
    """Fixture initializing TestClient with seeded Admin/Cashier and a test product."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = TestingSessionLocal()
    seed_default_admin(db=db)

    cat = CategoryService.create_category(db, name="Quick Snacks", display_order=1)
    p = ProductService.create_product(
        db,
        category_id=cat.id,
        name="Samosa",
        price=Decimal("20.00"),
        product_type=ProductType.VEG,
    )
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


def test_billing_api_endpoints(client_with_billing_setup):
    # Login as Cashier
    client_with_billing_setup.post("/api/auth/login", json={"username": "cashier1", "password": "cashier123"})

    # 1. GET /api/billing/products
    prod_res = client_with_billing_setup.get("/api/billing/products")
    assert prod_res.status_code == 200
    prods = prod_res.json()
    assert len(prods) == 1
    assert prods[0]["name"] == "Samosa"

    # 2. POST /api/billing/invoice
    invoice_payload = {
        "items": [{"product_id": prods[0]["id"], "quantity": 3}],
        "payment_mode": "CASH",
        "amount_received": 100.00,
        "customer_name": "Alice",
    }
    create_res = client_with_billing_setup.post("/api/billing/invoice", json=invoice_payload)
    assert create_res.status_code == 201
    inv = create_res.json()
    assert inv["invoice_number"] == "INV000001"
    assert float(inv["grand_total"]) == 60.0
    assert float(inv["amount_received"]) == 100.0
    assert float(inv["balance_amount"]) == 40.0
    assert len(inv["items"]) == 1

    # 3. GET /api/billing/invoices/{id}
    get_res = client_with_billing_setup.get(f"/api/billing/invoices/{inv['id']}")
    assert get_res.status_code == 200
    assert get_res.json()["invoice_number"] == "INV000001"

    # 4. GET /api/billing/history
    history_res = client_with_billing_setup.get("/api/billing/history")
    assert history_res.status_code == 200
    assert len(history_res.json()) == 1
