import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.database.seeder import seed_default_admin
from app.models.user import UserRole
from app.services.user_service import UserService


@pytest.fixture
def db_session():
    """Fixture providing an in-memory SQLite database session."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_seed_default_admin_creates_admin(db_session):
    # Verify no admin exists initially
    admin = UserService.get_by_username(db_session, "admin")
    assert admin is None

    # Run seeder
    seed_default_admin(db=db_session)

    # Verify default admin account created
    admin = UserService.get_by_username(db_session, "admin")
    assert admin is not None
    assert admin.username == "admin"
    assert admin.full_name == "Administrator"
    assert admin.role == UserRole.ADMIN
    assert admin.is_active is True

    # Verify password verification works for default admin credentials
    verified = UserService.verify_password(db_session, "admin", "admin123")
    assert verified is not None
    assert verified.id == admin.id


def test_seed_default_admin_idempotent(db_session):
    # First seeding
    seed_default_admin(db=db_session)
    admin_first = UserService.get_by_username(db_session, "admin")

    # Second seeding attempt
    seed_default_admin(db=db_session)
    admin_second = UserService.get_by_username(db_session, "admin")

    # Should be the same record, no duplicate created
    assert admin_first.id == admin_second.id
