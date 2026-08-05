from sqlalchemy import text
from app.core.logging_config import logger
from app.database.base import Base
from app.database.connection import engine, check_db_connection
from app.database.seeder import seed_default_admin
import app.models  # Ensure models are registered with Base metadata


def init_db() -> None:
    """Initialize database and create schema tables if defined."""
    logger.info("Database Initialization")
    try:
        Base.metadata.create_all(bind=engine)
        
        # Execute a write transaction to ensure SQLite database file header is fully written
        with engine.begin() as connection:
            connection.execute(text("PRAGMA user_version = 1;"))

        if check_db_connection():
            logger.info("Database Connected")
            seed_default_admin()
        else:
            logger.error("Failed to verify database connection after initialization")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise e

