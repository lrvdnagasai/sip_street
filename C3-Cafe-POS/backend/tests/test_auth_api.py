import pytest
from fastapi import APIRouter, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.seeder import seed_default_admin
from app.dependencies import get_db
from app.dependencies.auth import require_admin, require_cashier, require_login
from app.main import app
from app.models.user import User, UserRole
from app.services.user_service import UserService

# Create dummy endpoints for verifying authorization dependencies
dummy_auth_router = APIRouter(prefix="/api/test", tags=["Testing"])


@dummy_auth_router.get("/protected")
def protected_route(current_user: User = Depends(require_login)):
    return {"message": f"Hello {current_user.username}"}


@dummy_auth_router.get("/admin-only")
def admin_only_route(current_user: User = Depends(require_admin)):
    return {"message": f"Admin area accessed by {current_user.username}"}


@dummy_auth_router.get("/cashier-or-admin")
def cashier_route(current_user: User = Depends(require_cashier)):
    return {"message": f"Cashier area accessed by {current_user.username}"}


app.include_router(dummy_auth_router)


@pytest.fixture
def client_with_db():
    """Fixture initializing TestClient with an isolated in-memory database using StaticPool."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Seed default admin user
    db = TestingSessionLocal()
    seed_default_admin(db=db)

    # Ensure cashier1 exists and password matches CashierPassword123
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

    # Create disabled user
    UserService.create_user(
        db=db,
        username="disabled_user",
        full_name="Disabled User",
        password="DisabledPassword123",
        role=UserRole.CASHIER,
        is_active=False,
    )
    db.close()

    def override_get_db():
        db_session = TestingSessionLocal()
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_login_success(client_with_db):
    response = client_with_db.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Login successful"
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "ADMIN"
    assert "password_hash" not in data["user"]


def test_login_invalid_credentials(client_with_db):
    # Wrong password
    response = client_with_db.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]

    # Unknown user
    response = client_with_db.post(
        "/api/auth/login",
        json={"username": "unknownuser", "password": "admin123"},
    )
    assert response.status_code == 401


def test_login_disabled_user(client_with_db):
    response = client_with_db.post(
        "/api/auth/login",
        json={"username": "disabled_user", "password": "DisabledPassword123"},
    )
    assert response.status_code == 401


def test_get_current_user_me(client_with_db):
    # Unauthenticated request
    unauth_res = client_with_db.get("/api/auth/me")
    assert unauth_res.status_code == 401

    # Login first
    login_res = client_with_db.post(
        "/api/auth/login",
        json={"username": "cashier1", "password": "CashierPassword123"},
    )
    assert login_res.status_code == 200

    # Authenticated request
    me_res = client_with_db.get("/api/auth/me")
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["username"] == "cashier1"
    assert me_data["role"] == "CASHIER"
    assert "password_hash" not in me_data


def test_logout(client_with_db):
    # Login
    client_with_db.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )

    # Logout
    logout_res = client_with_db.post("/api/auth/logout")
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # Check that session is cleared
    me_res = client_with_db.get("/api/auth/me")
    assert me_res.status_code == 401


def test_change_password(client_with_db):
    # Login as cashier1
    client_with_db.post(
        "/api/auth/login",
        json={"username": "cashier1", "password": "CashierPassword123"},
    )

    # Attempt password change with wrong current password
    wrong_pwd_res = client_with_db.post(
        "/api/auth/change-password",
        json={"current_password": "WrongPassword123", "new_password": "NewSecretPassword123"},
    )
    assert wrong_pwd_res.status_code == 400
    assert "Current password is incorrect" in wrong_pwd_res.json()["detail"]

    # Attempt password change with same password
    same_pwd_res = client_with_db.post(
        "/api/auth/change-password",
        json={"current_password": "CashierPassword123", "new_password": "CashierPassword123"},
    )
    assert same_pwd_res.status_code == 400
    assert "cannot be the same" in same_pwd_res.json()["detail"]

    # Successful password change
    change_res = client_with_db.post(
        "/api/auth/change-password",
        json={"current_password": "CashierPassword123", "new_password": "BrandNewPassword123"},
    )
    assert change_res.status_code == 200
    assert change_res.json()["success"] is True

    # Logout and login with new password
    client_with_db.post("/api/auth/logout")

    new_login_res = client_with_db.post(
        "/api/auth/login",
        json={"username": "cashier1", "password": "BrandNewPassword123"},
    )
    assert new_login_res.status_code == 200


def test_role_authorization_dependencies(client_with_db):
    # Unauthenticated access
    assert client_with_db.get("/api/test/protected").status_code == 401
    assert client_with_db.get("/api/test/admin-only").status_code == 401

    # Login as Cashier
    client_with_db.post(
        "/api/auth/login",
        json={"username": "cashier1", "password": "CashierPassword123"},
    )

    # Cashier accessing protected route -> 200
    assert client_with_db.get("/api/test/protected").status_code == 200

    # Cashier accessing cashier/admin route -> 200
    assert client_with_db.get("/api/test/cashier-or-admin").status_code == 200

    # Cashier accessing admin-only route -> 403 Forbidden
    admin_access_res = client_with_db.get("/api/test/admin-only")
    assert admin_access_res.status_code == 403
    assert "Administrator privileges required" in admin_access_res.json()["detail"]

    # Switch to Admin
    client_with_db.post("/api/auth/logout")
    client_with_db.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"},
    )

    # Admin accessing admin-only route -> 200
    assert client_with_db.get("/api/test/admin-only").status_code == 200
