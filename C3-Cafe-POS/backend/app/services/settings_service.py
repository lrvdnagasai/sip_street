from sqlalchemy.orm import Session
from app.core.logging_config import logger
from app.models.settings import Settings
from app.schemas.settings import SettingsUpdate


class SettingsService:
    """Service layer managing application configuration settings."""

    DEFAULT_VALUES = {
        "cafe_name": "C³ Cafe",
        "owner_name": "Admin Owner",
        "phone_number": "+91 9876543210",
        "email": "contact@c3cafe.com",
        "gst_number": None,
        "address": "123 Coffee Street, Tech Hub, Bengaluru",
        "logo_path": None,
        "receipt_width": "80mm",
        "receipt_footer": "Thank You! Visit Again",
        "currency_symbol": "₹",
        "show_print_count": False,
        "default_backup_format": "ZIP",
        "default_backup_location": "database/backups",
        "auto_backup_on_exit": False,
        "max_backup_count": 30,
        "app_theme": "System",
        "language": "English",
        "timezone": "Asia/Kolkata",
        "date_format": "DD/MM/YYYY",
        "time_format": "12 Hour",
        "opening_time": "08:00",
        "closing_time": "22:00",
    }

    @classmethod
    def get_settings(cls, db: Session) -> Settings:
        """Retrieve singleton settings record, auto-seeding defaults if missing."""
        settings = db.query(Settings).first()
        if not settings:
            logger.info("Initializing default singleton application settings...")
            settings = Settings(id=1, **cls.DEFAULT_VALUES)
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    @classmethod
    def update_settings(cls, db: Session, settings_data: SettingsUpdate) -> Settings:
        """Update singleton application settings record."""
        settings = cls.get_settings(db)
        update_dict = settings_data.model_dump(exclude_unset=True)

        for key, value in update_dict.items():
            if hasattr(settings, key) and value is not None:
                setattr(settings, key, value)

        db.commit()
        db.refresh(settings)
        logger.info("Application settings updated successfully.")
        return settings

    @classmethod
    def reset_to_defaults(cls, db: Session) -> Settings:
        """Reset singleton application settings to factory default values."""
        settings = cls.get_settings(db)
        for key, value in cls.DEFAULT_VALUES.items():
            setattr(settings, key, value)

        db.commit()
        db.refresh(settings)
        logger.info("Application settings reset to factory defaults.")
        return settings
