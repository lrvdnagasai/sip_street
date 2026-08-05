from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/api/settings", tags=["Application Settings"])


@router.get("", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve active singleton application settings."""
    return SettingsService.get_settings(db)


@router.put("", response_model=SettingsResponse)
def update_settings(
    settings_data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update application settings."""
    return SettingsService.update_settings(db, settings_data)


@router.post("/reset", response_model=SettingsResponse)
def reset_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Reset application settings to factory default values."""
    return SettingsService.reset_to_defaults(db)
