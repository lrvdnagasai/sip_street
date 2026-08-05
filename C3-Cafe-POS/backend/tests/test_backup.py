import os
import zipfile
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
from app.services.backup_service import BackupService
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


def test_backup_creation_and_validation(db_session, tmp_path):
    # Setup dummy live DB file for testing
    dummy_db = tmp_path / "dummy_c3_pos.db"
    import sqlite3
    conn = sqlite3.connect(dummy_db)
    conn.execute("CREATE TABLE test_tbl (id INT)")
    conn.commit()
    conn.close()

    # Monkeypatch live db path
    BackupService.get_live_db_path = lambda: str(dummy_db)
    BackupService.BACKUP_DIR = str(tmp_path / "backups")

    # 1. Create ZIP backup
    zip_meta = BackupService.create_backup(created_by_username="admin_tester", custom_name="Unit_Test_ZIP", backup_format="ZIP")
    assert zip_meta.backup_name.endswith(".zip")
    assert zip_meta.created_by == "admin_tester"
    assert os.path.exists(os.path.join(BackupService.BACKUP_DIR, zip_meta.backup_name))

    # 2. Validate valid ZIP backup
    is_valid, err_msg, meta = BackupService.validate_backup_file(os.path.join(BackupService.BACKUP_DIR, zip_meta.backup_name))
    assert is_valid is True
    assert err_msg is None
    assert meta is not None

    # 3. Create corrupted file and test rejection
    corrupted_zip_path = os.path.join(BackupService.BACKUP_DIR, "corrupted_backup.zip")
    with zipfile.ZipFile(corrupted_zip_path, "w") as zf:
        zf.writestr("c3_pos.db", b"CORRUPTED_NON_SQLITE_DATA")

    is_valid_c, err_c, _ = BackupService.validate_backup_file(corrupted_zip_path)
    assert is_valid_c is False
    assert "Corrupted backup" in err_c or "header" in err_c


def test_backup_restore_and_rejection(tmp_path):
    dummy_db = tmp_path / "live_pos.db"
    import sqlite3
    conn = sqlite3.connect(dummy_db)
    conn.execute("CREATE TABLE live_table (id INT)")
    conn.commit()
    conn.close()

    BackupService.get_live_db_path = lambda: str(dummy_db)
    BackupService.BACKUP_DIR = str(tmp_path / "backups")

    # Create valid backup
    valid_meta = BackupService.create_backup("admin", custom_name="Valid_Before_Restore", backup_format="ZIP")

    # Restore from valid backup -> Sceeds
    success, msg = BackupService.restore_backup(valid_meta.backup_name)
    assert success is True

    # Attempt to restore corrupted backup -> Raises 400
    corrupted_path = os.path.join(BackupService.BACKUP_DIR, "fake_corrupt.zip")
    with open(corrupted_path, "wb") as f:
        f.write(b"INVALID_ZIP_BYTES")

    with pytest.raises(Exception) as exc_info:
        BackupService.restore_backup("fake_corrupt.zip")
    assert "400" in str(exc_info.value) or "invalid or corrupted" in str(exc_info.value)


@pytest.fixture
def client_with_backup_setup():
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
    UserService.create_user(db, username="cashier_bk", full_name="Cashier Backup", password="cashierpassword123", role=UserRole.CASHIER)
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


def test_backup_api_authorization(client_with_backup_setup):
    client = client_with_backup_setup

    # 1. Unauthenticated -> 401
    assert client.get("/api/backup/history").status_code == 401

    # 2. Login as Cashier -> 403 Forbidden
    client.post("/api/auth/login", json={"username": "cashier_bk", "password": "cashierpassword123"})
    assert client.get("/api/backup/history").status_code == 403
    assert client.post("/api/backup/create", json={}).status_code == 403

    # 3. Logout & Login as Admin -> 200/201 OK
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})

    assert client.get("/api/backup/summary").status_code == 200
    assert client.get("/api/backup/history").status_code == 200

    create_res = client.post("/api/backup/create", json={"custom_name": "API_Test", "backup_format": "ZIP"})
    assert create_res.status_code == 201
    bk_name = create_res.json()["backup_name"]

    val_res = client.post(f"/api/backup/validate?backup_name={bk_name}")
    assert val_res.status_code == 200
    assert val_res.json()["is_valid"] is True

    download_res = client.get(f"/api/backup/download/{bk_name}")
    assert download_res.status_code == 200

    del_res = client.delete(f"/api/backup/{bk_name}")
    assert del_res.status_code == 200
