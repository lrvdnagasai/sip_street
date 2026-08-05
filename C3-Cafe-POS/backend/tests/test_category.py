import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.seeder import seed_default_admin
from app.dependencies import get_db
from app.main import app
from app.models.user import UserRole
from app.services.category_service import CategoryService
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


def test_category_service_crud(db_session):
    # Create category
    cat1 = CategoryService.create_category(db_session, name="Tea", description="Fresh Hot Tea", display_order=1)
    assert cat1.id is not None
    assert cat1.name == "Tea"
    assert cat1.display_order == 1
    assert cat1.is_active is True

    # Case-insensitive duplicate name prevention
    with pytest.raises(ValueError, match="already exists"):
        CategoryService.create_category(db_session, name="TEA", description="Duplicate Tea")

    # Create second category with display order 0
    cat2 = CategoryService.create_category(db_session, name="Coffee", description="South Filter Coffee", display_order=0)

    # Ordering check (display_order asc)
    categories = CategoryService.get_categories(db_session)
    assert len(categories) == 2
    assert categories[0].name == "Coffee"  # display_order 0
    assert categories[1].name == "Tea"     # display_order 1

    # Update category
    updated = CategoryService.update_category(db_session, cat1.id, name="Special Tea", display_order=5)
    assert updated.name == "Special Tea"
    assert updated.display_order == 5

    # Soft disable and enable
    disabled = CategoryService.set_active_status(db_session, cat1.id, is_active=False)
    assert disabled.is_active is False

    # Default get_categories excludes inactive
    active_only = CategoryService.get_categories(db_session, include_inactive=False)
    assert len(active_only) == 1
    assert active_only[0].name == "Coffee"

    # get_categories with include_inactive=True
    all_cats = CategoryService.get_categories(db_session, include_inactive=True)
    assert len(all_cats) == 2


@pytest.fixture
def client_with_roles():
    """Fixture initializing TestClient with seeded Admin and Cashier users."""
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
    else:
        UserService.update_user(db, cashier.id, password="CashierPassword123")

    # Seed default categories
    CategoryService.create_category(db, name="Tea", description="Tea items", display_order=1)
    CategoryService.create_category(db, name="Coffee", description="Coffee items", display_order=2)
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


def test_category_api_permissions(client_with_roles):
    # Unauthenticated list categories -> 401
    assert client_with_roles.get("/api/categories").status_code == 401

    # Login as Cashier
    client_with_roles.post("/api/auth/login", json={"username": "cashier1", "password": "CashierPassword123"})

    # Cashier can list categories
    list_res = client_with_roles.get("/api/categories")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 2

    # Cashier cannot create category -> 403
    create_res = client_with_roles.post("/api/categories", json={"name": "Snacks", "display_order": 3})
    assert create_res.status_code == 403

    # Cashier cannot update category -> 403
    update_res = client_with_roles.put("/api/categories/1", json={"name": "Updated Tea"})
    assert update_res.status_code == 403

    # Cashier cannot disable category -> 403
    disable_res = client_with_roles.patch("/api/categories/1/disable")
    assert disable_res.status_code == 403

    # Switch to Admin
    client_with_roles.post("/api/auth/logout")
    client_with_roles.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    # Admin creates category -> 201 Created
    admin_create_res = client_with_roles.post("/api/categories", json={"name": "Snacks", "description": "Crispy snacks", "display_order": 3})
    assert admin_create_res.status_code == 201
    created_id = admin_create_res.json()["id"]

    # Admin updates category -> 200 OK
    admin_update_res = client_with_roles.put(f"/api/categories/{created_id}", json={"name": "Hot Snacks"})
    assert admin_update_res.status_code == 200
    assert admin_update_res.json()["name"] == "Hot Snacks"

    # Admin disables category -> 200 OK
    admin_disable_res = client_with_roles.patch(f"/api/categories/{created_id}/disable")
    assert admin_disable_res.status_code == 200
    assert admin_disable_res.json()["is_active"] is False

    # Admin enables category -> 200 OK
    admin_enable_res = client_with_roles.patch(f"/api/categories/{created_id}/enable")
    assert admin_enable_res.status_code == 200
    assert admin_enable_res.json()["is_active"] is True
