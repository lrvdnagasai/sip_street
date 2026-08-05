from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.database.session import SessionLocal
from app.models.user import UserRole
from app.services.user_service import UserService


def seed_default_admin(db: Session = None) -> None:
    """Seed default administrator and default cashier accounts if they do not exist."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        # Seed Admin
        existing_admin = UserService.get_by_username(db, "admin")
        if not existing_admin:
            UserService.create_user(
                db=db,
                username="admin",
                full_name="Administrator",
                password="admin123",
                role=UserRole.ADMIN,
                is_active=True,
            )
            logger.info("Admin Created: Default administrator account initialized.")
        else:
            logger.info("Default admin user already exists. Skipping admin seeding.")

        # Seed Cashier 1
        existing_cashier = UserService.get_by_username(db, "cashier1")
        if not existing_cashier:
            UserService.create_user(
                db=db,
                username="cashier1",
                full_name="Default Cashier",
                password="cashier123",
                role=UserRole.CASHIER,
                is_active=True,
            )
            logger.info("Cashier Created: Default cashier account (cashier1) initialized.")
        else:
            logger.info("Default cashier user (cashier1) already exists. Skipping cashier seeding.")

    except Exception as e:
        logger.error(f"Error seeding default users: {e}")
        db.rollback()
        raise e
    finally:
        if close_db:
            db.close()
