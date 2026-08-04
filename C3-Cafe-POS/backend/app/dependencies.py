from typing import Generator
from app.database.session import SessionLocal


def get_db() -> Generator:
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
