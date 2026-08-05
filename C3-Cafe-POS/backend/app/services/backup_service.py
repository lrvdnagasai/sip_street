import hashlib
import json
import os
import shutil
import sqlite3
import zipfile
from datetime import datetime
from typing import List, Optional, Tuple
from fastapi import HTTPException, status

from app.config import settings
from app.core.logging_config import logger
from app.schemas.backup import BackupMetadata, BackupSummaryResponse


class BackupService:
    """Service layer managing database backup generation, integrity validation, and restoration."""

    BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "database", "backups"))

    @classmethod
    def _ensure_backup_dir(cls) -> str:
        """Ensure local backup storage directory exists."""
        if not os.path.exists(cls.BACKUP_DIR):
            os.makedirs(cls.BACKUP_DIR, exist_ok=True)
        return cls.BACKUP_DIR

    @classmethod
    def get_live_db_path(cls) -> str:
        """Resolve absolute file path to the active SQLite database file."""
        # Convert sqlite:///./database/c3_pos.db to absolute file path
        raw_url = settings.DATABASE_URL.replace("sqlite:///", "")
        if raw_url.startswith("./"):
            raw_url = raw_url[2:]
        abs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", raw_url))
        return abs_path

    @classmethod
    def calculate_sha256(cls, file_path: str) -> str:
        """Compute SHA-256 digest hash of a file."""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    @classmethod
    def format_size(cls, size_bytes: int) -> str:
        """Format byte count into human-readable size string."""
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        elif size_bytes < 1024 * 1024 * 1024:
            return f"{size_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{size_bytes / (1024 * 1024 * 1024):.2f} GB"

    @classmethod
    def create_backup(
        cls,
        created_by_username: str,
        custom_name: Optional[str] = None,
        backup_format: str = "ZIP",
    ) -> BackupMetadata:
        """Create a full database backup archive (ZIP or DB)."""
        backup_dir = cls._ensure_backup_dir()
        live_db_path = cls.get_live_db_path()

        if not os.path.exists(live_db_path):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Live SQLite database file not found.",
            )

        timestamp_str = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        sanitized_custom = "".join(c for c in custom_name.strip() if c.isalnum() or c in ("_", "-")).rstrip() if custom_name else ""
        
        name_suffix = f"_{sanitized_custom}" if sanitized_custom else ""
        file_format = backup_format.upper() if backup_format else "ZIP"

        if file_format == "ZIP":
            filename = f"c3_pos_backup_{timestamp_str}{name_suffix}.zip"
        else:
            filename = f"c3_pos_backup_{timestamp_str}{name_suffix}.db"

        backup_file_path = os.path.join(backup_dir, filename)

        # Compute checksum of live database file
        db_checksum = cls.calculate_sha256(live_db_path)
        db_size = os.path.getsize(live_db_path)
        created_at_dt = datetime.now()

        metadata_dict = {
            "backup_name": filename,
            "created_by": created_by_username,
            "created_at": created_at_dt.isoformat(),
            "file_size_bytes": db_size,
            "app_version": settings.APP_VERSION,
            "db_version": "1.0.0",
            "sha256_checksum": db_checksum,
            "format": file_format,
        }

        if file_format == "ZIP":
            with zipfile.ZipFile(backup_file_path, "w", zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(live_db_path, arcname="c3_pos.db")
                zipf.writestr("metadata.json", json.dumps(metadata_dict, indent=2))
        else:
            shutil.copy2(live_db_path, backup_file_path)

        final_size = os.path.getsize(backup_file_path)
        metadata_dict["file_size_bytes"] = final_size

        logger.info(f"Database Backup Created: {filename} ({cls.format_size(final_size)}) by {created_by_username}")

        return BackupMetadata(
            backup_name=filename,
            created_by=created_by_username,
            created_at=created_at_dt,
            file_size_bytes=final_size,
            file_size_human=cls.format_size(final_size),
            app_version=settings.APP_VERSION,
            db_version="1.0.0",
            sha256_checksum=db_checksum,
            format=file_format,
        )

    @classmethod
    def validate_backup_file(cls, backup_path: str) -> Tuple[bool, Optional[str], Optional[BackupMetadata]]:
        """Validate integrity and schema of a backup archive file."""
        if not os.path.exists(backup_path):
            return False, f"File not found: {os.path.basename(backup_path)}", None

        filename = os.path.basename(backup_path)
        file_size = os.path.getsize(backup_path)

        if file_size == 0:
            return False, "Backup file is completely empty (0 bytes).", None

        # Check if file is HTML or JSON error response instead of binary archive
        try:
            with open(backup_path, "rb") as f:
                first_bytes = f.read(100)
                if first_bytes.startswith(b"<!DOCTYPE") or first_bytes.startswith(b"<html") or first_bytes.startswith(b"{\"detail\""):
                    return False, "The file contains HTML/JSON text rather than a valid binary database or ZIP archive.", None
        except Exception:
            pass

        if filename.endswith(".zip"):
            if not zipfile.is_zipfile(backup_path):
                return False, "File is not a valid ZIP archive.", None

            try:
                with zipfile.ZipFile(backup_path, "r") as zipf:
                    file_list = zipf.namelist()
                    if "c3_pos.db" not in file_list:
                        return False, "ZIP archive is missing 'c3_pos.db' database file.", None

                    metadata = None
                    if "metadata.json" in file_list:
                        try:
                            meta_bytes = zipf.read("metadata.json")
                            meta_json = json.loads(meta_bytes.decode("utf-8"))
                            metadata = BackupMetadata(
                                backup_name=meta_json.get("backup_name", filename),
                                created_by=meta_json.get("created_by", "Unknown"),
                                created_at=datetime.fromisoformat(meta_json["created_at"]) if "created_at" in meta_json else datetime.now(),
                                file_size_bytes=file_size,
                                file_size_human=cls.format_size(file_size),
                                app_version=meta_json.get("app_version", "1.0.0"),
                                db_version=meta_json.get("db_version", "1.0.0"),
                                sha256_checksum=meta_json.get("sha256_checksum", ""),
                                format="ZIP",
                            )
                        except Exception:
                            pass

                    # Read extracted DB bytes and verify SQLite header
                    db_bytes = zipf.read("c3_pos.db")
                    if not db_bytes.startswith(b"SQLite format 3\x00"):
                        return False, "Corrupted backup: extracted database is not a valid SQLite database.", None

                    # Check checksum match if metadata present
                    if metadata and metadata.sha256_checksum:
                        extracted_hash = hashlib.sha256(db_bytes).hexdigest()
                        if extracted_hash != metadata.sha256_checksum:
                            return False, "Corrupted backup: SHA-256 checksum mismatch detected.", None

                    if not metadata:
                        metadata = BackupMetadata(
                            backup_name=filename,
                            created_by="Unknown",
                            created_at=datetime.fromtimestamp(os.path.getmtime(backup_path)),
                            file_size_bytes=file_size,
                            file_size_human=cls.format_size(file_size),
                            app_version="1.0.0",
                            db_version="1.0.0",
                            sha256_checksum=hashlib.sha256(db_bytes).hexdigest(),
                            format="ZIP",
                        )

                    return True, None, metadata

            except Exception as e:
                return False, f"Failed to extract or validate ZIP archive: {str(e)}", None

        elif filename.endswith(".db"):
            try:
                with open(backup_path, "rb") as f:
                    header = f.read(16)
                    if not header.startswith(b"SQLite format 3\x00"):
                        return False, "File is not a valid SQLite database (header mismatch).", None

                # Perform SQLite integrity check
                conn = sqlite3.connect(backup_path)
                cursor = conn.cursor()
                cursor.execute("PRAGMA quick_check")
                check_result = cursor.fetchone()
                conn.close()

                if not check_result or check_result[0] != "ok":
                    return False, f"SQLite integrity check failed: {check_result[0] if check_result else 'error'}", None

                metadata = BackupMetadata(
                    backup_name=filename,
                    created_by="Admin",
                    created_at=datetime.fromtimestamp(os.path.getmtime(backup_path)),
                    file_size_bytes=file_size,
                    file_size_human=cls.format_size(file_size),
                    app_version="1.0.0",
                    db_version="1.0.0",
                    sha256_checksum=cls.calculate_sha256(backup_path),
                    format="DB",
                )
                return True, None, metadata

            except Exception as e:
                return False, f"Database integrity check failed: {str(e)}", None

        else:
            return False, "Unsupported file extension. Only .zip and .db backups are supported.", None

    @classmethod
    def restore_backup(cls, backup_name: str) -> Tuple[bool, str]:
        """Restore active SQLite database from a validated backup archive."""
        backup_dir = cls._ensure_backup_dir()
        backup_path = os.path.join(backup_dir, backup_name)

        is_valid, err_msg, _ = cls.validate_backup_file(backup_path)
        if not is_valid:
            logger.error(f"Restore Rejected: {backup_name} - {err_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot restore invalid or corrupted backup: {err_msg}",
            )

        live_db_path = cls.get_live_db_path()

        # 1. Create a safety auto-backup of the current database before replacing
        if os.path.exists(live_db_path):
            safety_name = f"pre_restore_safety_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.db"
            safety_path = os.path.join(backup_dir, safety_name)
            shutil.copy2(live_db_path, safety_path)
            logger.info(f"Safety pre-restore backup created: {safety_name}")

        # 2. Extract and restore target DB
        if backup_name.endswith(".zip"):
            with zipfile.ZipFile(backup_path, "r") as zipf:
                zipf.extract("c3_pos.db", path=os.path.dirname(live_db_path))
        else:
            shutil.copy2(backup_path, live_db_path)

        logger.info(f"Database Successfully Restored from Backup: {backup_name}")
        return True, f"Database restored successfully from '{backup_name}'."

    @classmethod
    def get_backup_history(cls) -> List[BackupMetadata]:
        """Retrieve list of all backup files sorted by creation date."""
        backup_dir = cls._ensure_backup_dir()
        history = []

        if not os.path.exists(backup_dir):
            return history

        for fname in os.listdir(backup_dir):
            if fname.endswith(".zip") or fname.endswith(".db"):
                fpath = os.path.join(backup_dir, fname)
                _, _, meta = cls.validate_backup_file(fpath)
                if meta:
                    history.append(meta)

        history.sort(key=lambda x: x.created_at, reverse=True)
        return history

    @classmethod
    def get_backup_summary(cls) -> BackupSummaryResponse:
        """Retrieve aggregate summary metrics for backup storage."""
        history = cls.get_backup_history()
        live_db_path = cls.get_live_db_path()

        live_size = os.path.getsize(live_db_path) if os.path.exists(live_db_path) else 0
        total_storage = sum([b.file_size_bytes for b in history])
        latest_date = history[0].created_at if history else None

        return BackupSummaryResponse(
            latest_backup_date=latest_date,
            total_backups=len(history),
            total_storage_bytes=total_storage,
            total_storage_human=cls.format_size(total_storage),
            live_db_size_bytes=live_size,
            live_db_size_human=cls.format_size(live_size),
        )

    @classmethod
    def delete_backup(cls, backup_name: str) -> bool:
        """Delete a backup file from storage history."""
        backup_dir = cls._ensure_backup_dir()
        backup_path = os.path.join(backup_dir, backup_name)

        if not os.path.exists(backup_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Backup file '{backup_name}' not found.",
            )

        os.remove(backup_path)
        logger.info(f"Backup File Deleted: {backup_name}")
        return True
