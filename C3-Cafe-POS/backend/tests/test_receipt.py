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
from app.services.receipt_service import ReceiptService
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


def test_receipt_service_retrieval(db_session):
    # Setup user and products
    cashier = UserService.create_user(
        db_session,
        username="receipt_cashier",
        full_name="Receipt Cashier",
        password="CashierPassword123",
        role=UserRole.CASHIER,
    )
    cat = CategoryService.create_category(db_session, name="Snacks", display_order=1)
    p1 = ProductService.create_product(
        db_session,
        category_id=cat.id,
        name="French Fries",
        price=Decimal("70.00"),
        product_type=ProductType.VEG,
    )

    # Create invoice
    invoice = BillingService.create_invoice(
        db=db_session,
        cashier_id=cashier.id,
        items_data=[{"product_id": p1.id, "quantity": 2}],
        payment_mode=PaymentMode.CASH,
        amount_received=Decimal("150.00"),
        customer_name="Bob",
    )

    # 1. Verify defaults
    assert invoice.print_count == 0
    assert invoice.last_printed_at is None

    # 2. Retrieve receipt by ID
    receipt_data = ReceiptService.get_receipt_data(db_session, invoice.id)
    assert receipt_data is not None
    assert receipt_data.cafe_info.name == "C³ CAFE POS"
    assert receipt_data.invoice.invoice_number == "INV000001"
    assert receipt_data.invoice.print_count == 0
    assert receipt_data.invoice.last_printed_at is None

    # 3. Record print action
    audit1 = ReceiptService.record_print(db_session, invoice.id)
    assert audit1.print_count == 1
    assert audit1.last_printed_at is not None

    # 4. Record reprint action
    audit2 = ReceiptService.record_print(db_session, invoice.id)
    assert audit2.print_count == 2
    assert audit2.last_printed_at >= audit1.last_printed_at


@pytest.fixture
def client_with_receipt_setup():
    """Fixture initializing TestClient with a completed invoice ready for receipt testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = TestingSessionLocal()
    seed_default_admin(db=db)

    cat = CategoryService.create_category(db, name="Drinks", display_order=1)
    p = ProductService.create_product(db, category_id=cat.id, name="Cold Coffee", price=Decimal("60.00"))
    inv = BillingService.create_invoice(
        db=db,
        cashier_id=1,
        items_data=[{"product_id": p.id, "quantity": 1}],
        amount_received=Decimal("100.00"),
    )
    invoice_id = inv.id
    db.close()

    def override_get_db():
        db_s = TestingSessionLocal()
        try:
            yield db_s
        finally:
            db_s.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client, invoice_id

    app.dependency_overrides.clear()


def test_receipt_api_endpoints(client_with_receipt_setup):
    client, invoice_id = client_with_receipt_setup

    # Unauthenticated access -> 401
    assert client.get(f"/api/receipts/{invoice_id}").status_code == 401

    # Login as Admin
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    # GET /api/receipts/{invoice_id}
    res = client.get(f"/api/receipts/{invoice_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["invoice"]["print_count"] == 0
    assert data["invoice"]["last_printed_at"] is None

    # PATCH /api/receipts/{invoice_id}/printed
    patch_res = client.patch(f"/api/receipts/{invoice_id}/printed")
    assert patch_res.status_code == 200
    audit_data = patch_res.json()
    assert audit_data["print_count"] == 1
    assert audit_data["last_printed_at"] is not None

    # GET /api/receipts/{invoice_id} again -> verify updated count
    res_after = client.get(f"/api/receipts/{invoice_id}")
    assert res_after.json()["invoice"]["print_count"] == 1
