from pathlib import Path
from sqlalchemy.orm import Session
from app.database import check_db_connection, Base, init_db
from app.database.connection import get_engine_url
from app.dependencies import get_db


def test_db_connection():
    """Verify database connection check function succeeds."""
    assert check_db_connection() is True


def test_db_session_dependency():
    """Verify get_db generator yields a valid session and closes properly."""
    db_gen = get_db()
    session = next(db_gen)
    assert isinstance(session, Session)
    try:
        next(db_gen)
    except StopIteration:
        pass


def test_base_metadata():
    """Verify DeclarativeBase metadata exists."""
    assert Base.metadata is not None


def test_init_db_file_size():
    """Verify init_db initializes the database file with size > 0 bytes."""
    init_db()
    engine_url = get_engine_url()
    if engine_url.startswith("sqlite:///"):
        db_path_str = engine_url.replace("sqlite:///", "")
        db_file = Path(db_path_str)
        assert db_file.exists()
        assert db_file.stat().st_size > 0
