from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SettingsResponse(BaseModel):
    """Response schema for application settings."""
    id: int
    # Business Information
    cafe_name: str
    owner_name: str
    phone_number: str
    email: str
    gst_number: Optional[str] = None
    address: str
    logo_path: Optional[str] = None

    # Receipt Settings
    receipt_width: str  # "58mm" or "80mm"
    receipt_footer: str
    currency_symbol: str
    show_print_count: bool

    # Backup Settings
    default_backup_format: str  # "ZIP" or "DB"
    default_backup_location: str
    auto_backup_on_exit: bool
    max_backup_count: int

    # Application Settings
    app_theme: str  # "Light", "Dark", "System"
    language: str
    timezone: str
    date_format: str
    time_format: str

    # Business Hours
    opening_time: str
    closing_time: str

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    """Update schema for application settings."""
    # Business Information
    cafe_name: Optional[str] = Field(default=None, max_length=100)
    owner_name: Optional[str] = Field(default=None, max_length=100)
    phone_number: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    gst_number: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=255)
    logo_path: Optional[str] = Field(default=None, max_length=255)

    # Receipt Settings
    receipt_width: Optional[str] = Field(default=None, pattern="^(58mm|80mm)$")
    receipt_footer: Optional[str] = Field(default=None, max_length=255)
    currency_symbol: Optional[str] = Field(default=None, max_length=10)
    show_print_count: Optional[bool] = None

    # Backup Settings
    default_backup_format: Optional[str] = Field(default=None, pattern="^(ZIP|DB)$")
    default_backup_location: Optional[str] = Field(default=None, max_length=255)
    auto_backup_on_exit: Optional[bool] = None
    max_backup_count: Optional[int] = Field(default=None, ge=1, le=100)

    # Application Settings
    app_theme: Optional[str] = Field(default=None, pattern="^(Light|Dark|System)$")
    language: Optional[str] = Field(default=None, max_length=20)
    timezone: Optional[str] = Field(default=None, max_length=50)
    date_format: Optional[str] = Field(default=None, max_length=20)
    time_format: Optional[str] = Field(default=None, pattern="^(12 Hour|24 Hour)$")

    # Business Hours
    opening_time: Optional[str] = Field(default=None, pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$")
    closing_time: Optional[str] = Field(default=None, pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$")
