import os
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_admin
from app.models.user import User
from app.schemas.backup import (
    BackupCreateRequest,
    BackupMetadata,
    BackupRestoreRequest,
    BackupSummaryResponse,
    BackupValidateResponse,
)
from app.services.backup_service import BackupService

router = APIRouter(prefix="/api/backup", tags=["Backup & Restore"])


@router.get("/summary", response_model=BackupSummaryResponse)
def get_backup_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve backup storage summary metrics."""
    return BackupService.get_backup_summary()


@router.get("/history", response_model=List[BackupMetadata])
def get_backup_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve history list of all backup archives."""
    return BackupService.get_backup_history()


@router.post("/create", response_model=BackupMetadata, status_code=status.HTTP_201_CREATED)
def create_backup(
    request: BackupCreateRequest = BackupCreateRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new database backup archive (ZIP or DB)."""
    return BackupService.create_backup(
        created_by_username=current_user.username,
        custom_name=request.custom_name,
        backup_format=request.backup_format,
    )


@router.post("/validate", response_model=BackupValidateResponse)
def validate_backup(
    backup_name: str = Query(..., description="Target backup filename to validate"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Validate archive format and checksum integrity for a backup file."""
    backup_dir = BackupService._ensure_backup_dir()
    backup_path = os.path.join(backup_dir, backup_name)

    is_valid, err_msg, metadata = BackupService.validate_backup_file(backup_path)

    return BackupValidateResponse(
        filename=backup_name,
        is_valid=is_valid,
        error_message=err_msg,
        metadata=metadata,
    )


@router.post("/restore")
def restore_backup(
    request: BackupRestoreRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Restore active database from a validated backup file."""
    if not request.confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation required before replacing live database.",
        )

    success, message = BackupService.restore_backup(request.backup_name)
    return {"message": message, "restart_required": False}


@router.post("/upload", response_model=BackupMetadata, status_code=status.HTTP_201_CREATED)
async def upload_backup(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Upload an external backup file (.zip or .db) to history."""
    if not (file.filename.endswith(".zip") or file.filename.endswith(".db")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .zip and .db backup files are accepted.",
        )

    backup_dir = BackupService._ensure_backup_dir()
    target_path = os.path.join(backup_dir, file.filename)

    with open(target_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    is_valid, err_msg, metadata = BackupService.validate_backup_file(target_path)
    if not is_valid:
        os.remove(target_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file failed backup validation: {err_msg}",
        )

    return metadata


@router.get("/download/{backup_name}")
def download_backup(
    backup_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Download a backup file archive."""
    backup_dir = BackupService._ensure_backup_dir()
    backup_path = os.path.join(backup_dir, backup_name)

    if not os.path.exists(backup_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Backup file '{backup_name}' not found.",
        )

    media_type = "application/zip" if backup_name.endswith(".zip") else "application/x-sqlite3"
    return FileResponse(path=backup_path, filename=backup_name, media_type=media_type)


@router.delete("/{backup_name}")
def delete_backup(
    backup_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a backup file from history."""
    BackupService.delete_backup(backup_name)
    return {"message": f"Backup file '{backup_name}' successfully deleted."}
