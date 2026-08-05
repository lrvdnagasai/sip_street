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
from app.models.product import ProductType
from app.models.user import UserRole
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


def test_product_service_crud(db_session):
    # Setup categories
    cat1 = CategoryService.create_category(db_session, name="Beverages", display_order=1)
    cat2 = CategoryService.create_category(db_session, name="Snacks", display_order=2)
    inactive_cat = CategoryService.create_category(db_session, name="Old Menu", display_order=3)
    CategoryService.set_active_status(db_session, inactive_cat.id, is_active=False)

    # 1. Create product with auto-generated SKU
    p1 = ProductService.create_product(
        db_session,
        category_id=cat1.id,
        name="Masala Chai",
        price=Decimal("25.00"),
        product_type=ProductType.BEVERAGE,
        display_order=1,
    )
    assert p1.id is not None
    assert p1.sku == "PRD000001"
    assert p1.name == "Masala Chai"
    assert p1.price == Decimal("25.00")
    assert p1.is_available is True
    assert p1.is_active is True

    # 2. Create second product with explicit SKU
    p2 = ProductService.create_product(
        db_session,
        category_id=cat1.id,
        name="Espresso",
        price=Decimal("60.00"),
        product_type=ProductType.BEVERAGE,
        sku="COFFEE-001",
        display_order=0,
    )
    assert p2.sku == "COFFEE-001"

    # 3. Duplicate name in same category validation error
    with pytest.raises(ValueError, match="already exists in this category"):
        ProductService.create_product(
            db_session,
            category_id=cat1.id,
            name="masala chai",
            price=Decimal("30.00"),
        )

    # 4. Same name in DIFFERENT category is allowed
    p3 = ProductService.create_product(
        db_session,
        category_id=cat2.id,
        name="Masala Chai",  # Same name, different category
        price=Decimal("40.00"),
        product_type=ProductType.BEVERAGE,
    )
    assert p3.id is not None

    # 5. Invalid inactive category error
    with pytest.raises(ValueError, match="inactive category"):
        ProductService.create_product(
            db_session,
            category_id=inactive_cat.id,
            name="Archived Drink",
            price=Decimal("10.00"),
        )

    # 6. Invalid price error
    with pytest.raises(ValueError, match="greater than 0"):
        ProductService.create_product(
            db_session,
            category_id=cat1.id,
            name="Free Water",
            price=Decimal("0.00"),
        )

    # 7. Query filtering & ordering
    beverages = ProductService.get_products(db_session, category_id=cat1.id)
    assert len(beverages) == 2
    # Espresso has display_order 0, Masala Chai has display_order 1
    assert beverages[0].name == "Espresso"
    assert beverages[1].name == "Masala Chai"

    # 8. Instant Search
    search_results = ProductService.get_products(db_session, search="espresso")
    assert len(search_results) == 1
    assert search_results[0].sku == "COFFEE-001"

    # 9. Availability Toggle & Soft Disable
    ProductService.set_availability(db_session, p1.id, is_available=False)
    assert ProductService.get_product(db_session, p1.id).is_available is False

    ProductService.set_active_status(db_session, p1.id, is_active=False)
    assert ProductService.get_product(db_session, p1.id).is_active is False

    # Default get_products excludes inactive
    active_prods = ProductService.get_products(db_session, category_id=cat1.id)
    assert len(active_prods) == 1
    assert active_prods[0].name == "Espresso"


@pytest.fixture
def client_with_product_setup():
    """Fixture initializing TestClient with Admin and Cashier users and pre-seeded category & product."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = TestingSessionLocal()
    seed_default_admin(db=db)

    cashier = UserService.get_by_username(db, "cashier1")
    if not cashier:
        UserService.create_user(
            db=db,
            username="cashier1",
            full_name="Cashier One",
            password="CashierPassword123",
            role=UserRole.CASHIER,
        )

    cat = CategoryService.create_category(db, name="Hot Drinks", display_order=1)
    ProductService.create_product(db, category_id=cat.id, name="Cappuccino", price=Decimal("80.00"), product_type=ProductType.BEVERAGE)
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


def test_product_api_permissions(client_with_product_setup):
    # Unauthenticated list -> 401
    assert client_with_product_setup.get("/api/products").status_code == 401

    # Cashier Login
    client_with_product_setup.post("/api/auth/login", json={"username": "cashier1", "password": "cashier123"})

    # Cashier can list products
    res = client_with_product_setup.get("/api/products")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["name"] == "Cappuccino"

    # Cashier cannot create product -> 403
    create_res = client_with_product_setup.post("/api/products", json={"category_id": 1, "name": "Latte", "price": "90.00"})
    assert create_res.status_code == 403

    # Cashier cannot update product -> 403
    update_res = client_with_product_setup.put("/api/products/1", json={"name": "Updated Cappuccino"})
    assert update_res.status_code == 403

    # Cashier cannot toggle availability -> 403
    toggle_res = client_with_product_setup.patch("/api/products/1/availability")
    assert toggle_res.status_code == 403

    # Switch to Admin
    client_with_product_setup.post("/api/auth/logout")
    client_with_product_setup.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    # Admin creates product -> 201 Created
    admin_create = client_with_product_setup.post(
        "/api/products",
        json={
            "category_id": 1,
            "name": "Latte",
            "price": "95.00",
            "product_type": "BEVERAGE",
            "description": "Smooth espresso with steamed milk",
        },
    )
    assert admin_create.status_code == 201
    created_prod = admin_create.json()
    assert created_prod["name"] == "Latte"
    assert created_prod["sku"].startswith("PRD")

    # Admin updates product -> 200 OK
    admin_update = client_with_product_setup.put(
        f"/api/products/{created_prod['id']}",
        json={"price": "100.00"},
    )
    assert admin_update.status_code == 200
    assert float(admin_update.json()["price"]) == 100.0

    # Admin toggles availability -> 200 OK
    admin_avail = client_with_product_setup.patch(f"/api/products/{created_prod['id']}/availability?is_available=false")
    assert admin_avail.status_code == 200
    assert admin_avail.json()["is_available"] is False

    # Admin disables product -> 200 OK
    admin_disable = client_with_product_setup.patch(f"/api/products/{created_prod['id']}/disable")
    assert admin_disable.status_code == 200
    assert admin_disable.json()["is_active"] is False

    # Admin enables product -> 200 OK
    admin_enable = client_with_product_setup.patch(f"/api/products/{created_prod['id']}/enable")
    assert admin_enable.status_code == 200
    assert admin_enable.json()["is_active"] is True
