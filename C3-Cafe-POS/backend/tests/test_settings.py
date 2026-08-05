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
from app.schemas.settings import SettingsUpdate
from app.services.settings_service import SettingsService
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


def test_default_settings_seeding_and_crud(db_session):
    # 1. First fetch auto-seeds default settings
    settings = SettingsService.get_settings(db_session)
    assert settings.cafe_name == "C³ Cafe"
    assert settings.receipt_width == "80mm"
    assert settings.currency_symbol == "₹"
    assert settings.opening_time == "08:00"
    assert settings.closing_time == "22:00"

    # 2. Update settings
    updated = SettingsService.update_settings(
        db_session,
        SettingsUpdate(
            cafe_name="Sip Street Cafe",
            phone_number="+91 9999988888",
            opening_time="07:00",
            closing_time="23:00",
            receipt_width="58mm",
        ),
    )
    assert updated.cafe_name == "Sip Street Cafe"
    assert updated.phone_number == "+91 9999988888"
    assert updated.opening_time == "07:00"
    assert updated.receipt_width == "58mm"

    # 3. Reset to defaults
    reset_st = SettingsService.reset_to_defaults(db_session)
    assert reset_st.cafe_name == "C³ Cafe"
    assert reset_st.receipt_width == "80mm"
    assert reset_st.opening_time == "08:00"


@pytest.fixture
def client_with_settings_setup():
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
    UserService.create_user(db, username="cashier_st", full_name="Cashier Settings", password="cashierpassword123", role=UserRole.CASHIER)
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


def test_settings_api_authorization(client_with_settings_setup):
    client = client_with_settings_setup

    # 1. Unauthenticated -> 401
    assert client.get("/api/settings").status_code == 401
    assert client.put("/api/settings", json={"cafe_name": "Test"}).status_code == 401

    # 2. Cashier can GET settings (for receipt/billing view), but cannot PUT/RESET -> 403
    client.post("/api/auth/login", json={"username": "cashier_st", "password": "cashierpassword123"})
    assert client.get("/api/settings").status_code == 200
    assert client.put("/api/settings", json={"cafe_name": "Hack Cafe"}).status_code == 403
    assert client.post("/api/settings/reset").status_code == 403

    # 3. Admin can GET, PUT, and RESET settings -> 200
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    get_res = client.get("/api/settings")
    assert get_res.status_code == 200
    assert get_res.json()["cafe_name"] == "C³ Cafe"

    put_res = client.put("/api/settings", json={"cafe_name": "Updated Admin Cafe"})
    assert put_res.status_code == 200
    assert put_res.json()["cafe_name"] == "Updated Admin Cafe"

    reset_res = client.post("/api/settings/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["cafe_name"] == "C³ Cafe"
