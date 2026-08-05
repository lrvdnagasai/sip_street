import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models.user import UserRole
from app.services.user_service import UserService


@pytest.fixture
def db_session():
    """Fixture providing an in-memory SQLite database session for unit tests."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_create_user(db_session):
    user = UserService.create_user(
        db=db_session,
        username=" Cashier1 ",
        full_name="John Cashier",
        password="CashierPassword123",
        role=UserRole.CASHIER,
    )

    assert user.id is not None
    assert user.username == "cashier1"  # Trimmed and lowercased
    assert user.full_name == "John Cashier"
    assert user.role == UserRole.CASHIER
    assert user.is_active is True
    assert user.created_at is not None
    assert user.updated_at is not None


def test_username_validation_errors(db_session):
    with pytest.raises(ValueError, match="Username cannot contain spaces"):
        UserService.create_user(
            db=db_session,
            username="invalid user",
            full_name="Invalid User",
            password="Password123",
            role=UserRole.CASHIER,
        )

    with pytest.raises(ValueError, match="Username cannot be empty"):
        UserService.create_user(
            db=db_session,
            username="   ",
            full_name="Empty User",
            password="Password123",
            role=UserRole.CASHIER,
        )


def test_duplicate_username_prevention(db_session):
    UserService.create_user(
        db=db_session,
        username="duplicate_user",
        full_name="First User",
        password="Password123",
        role=UserRole.CASHIER,
    )

    with pytest.raises(ValueError, match="already exists"):
        UserService.create_user(
            db=db_session,
            username="DUPLICATE_USER",  # Case insensitive duplicate
            full_name="Second User",
            password="Password123",
            role=UserRole.CASHIER,
        )


def test_get_user_methods(db_session):
    created = UserService.create_user(
        db=db_session,
        username="test_lookup",
        full_name="Test Lookup",
        password="Password123",
        role=UserRole.ADMIN,
    )

    by_id = UserService.get_user(db_session, created.id)
    assert by_id is not None
    assert by_id.username == "test_lookup"

    by_username = UserService.get_by_username(db_session, "TEST_LOOKUP")
    assert by_username is not None
    assert by_username.id == created.id


def test_verify_password_authentication(db_session):
    UserService.create_user(
        db=db_session,
        username="auth_user",
        full_name="Auth User",
        password="CorrectPassword123",
        role=UserRole.CASHIER,
    )

    auth_success = UserService.verify_password(db_session, "auth_user", "CorrectPassword123")
    assert auth_success is not None
    assert auth_success.username == "auth_user"

    auth_failure = UserService.verify_password(db_session, "auth_user", "WrongPassword123")
    assert auth_failure is None

    non_existent = UserService.verify_password(db_session, "non_existent", "CorrectPassword123")
    assert non_existent is None


def test_update_and_disable_user(db_session):
    user = UserService.create_user(
        db=db_session,
        username="updatable",
        full_name="Old Name",
        password="OldPassword123",
        role=UserRole.CASHIER,
    )

    updated = UserService.update_user(
        db=db_session,
        user_id=user.id,
        full_name="New Name",
        password="NewPassword123",
        role=UserRole.ADMIN,
    )
    assert updated.full_name == "New Name"
    assert updated.role == UserRole.ADMIN
    assert UserService.verify_password(db_session, "updatable", "NewPassword123") is not None

    disabled = UserService.disable_user(db_session, user.id)
    assert disabled.is_active is False
    assert UserService.verify_password(db_session, "updatable", "NewPassword123") is None
