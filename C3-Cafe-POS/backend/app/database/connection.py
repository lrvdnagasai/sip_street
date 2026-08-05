from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from app.config import settings
from app.core.logging_config import logger


def get_engine_url() -> str:
    """Resolve database URL and ensure parent directories exist for SQLite."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite:///./"):
        relative_path = db_url.replace("sqlite:///./", "")
        db_file_path = Path(__file__).resolve().parent.parent.parent / relative_path
        db_file_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_file_path}"
    return db_url


engine_url = get_engine_url()
connect_args = {"check_same_thread": False} if "sqlite" in engine_url else {}

engine: Engine = create_engine(engine_url, connect_args=connect_args)


def check_db_connection() -> bool:
    """Check database connectivity by executing a simple query."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False
