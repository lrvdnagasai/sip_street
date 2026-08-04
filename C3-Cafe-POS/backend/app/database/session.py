from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Parse database path from DATABASE_URL and ensure parent directory exists
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///./"):
    relative_path = db_url.replace("sqlite:///./", "")
    db_file_path = Path(__file__).resolve().parent.parent.parent / relative_path
    db_file_path.parent.mkdir(parents=True, exist_ok=True)
    engine_url = f"sqlite:///{db_file_path}"
else:
    engine_url = db_url

# SQLite specific connect arguments
connect_args = {"check_same_thread": False} if "sqlite" in engine_url else {}

engine = create_engine(engine_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
