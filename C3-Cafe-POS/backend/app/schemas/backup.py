from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class BackupMetadata(BaseModel):
    """Metadata schema for backup archives."""
    backup_name: str
    created_by: str
    created_at: datetime
    file_size_bytes: int
    file_size_human: str
    app_version: str
    db_version: str
    sha256_checksum: str
    format: str  # "ZIP" or "DB"


class BackupCreateRequest(BaseModel):
    """Request schema for creating a new database backup."""
    custom_name: Optional[str] = Field(default=None, max_length=100, description="Optional custom label for backup file")
    backup_format: str = Field(default="ZIP", description="ZIP or DB format")


class BackupValidateResponse(BaseModel):
    """Response schema for backup validation check."""
    filename: str
    is_valid: bool
    error_message: Optional[str] = None
    metadata: Optional[BackupMetadata] = None


class BackupSummaryResponse(BaseModel):
    """Summary metrics for backup storage."""
    latest_backup_date: Optional[datetime] = None
    total_backups: int = 0
    total_storage_bytes: int = 0
    total_storage_human: str = "0 B"
    live_db_size_bytes: int = 0
    live_db_size_human: str = "0 B"


class BackupRestoreRequest(BaseModel):
    """Request schema for database restoration."""
    backup_name: str
    confirm: bool = Field(..., description="Must be set to True to acknowledge replacing live database")
