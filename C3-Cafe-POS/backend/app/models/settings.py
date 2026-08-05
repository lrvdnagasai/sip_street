from sqlalchemy import Boolean, Column, Integer, String
from app.database.base import Base


class Settings(Base):
    """Singleton configuration table storing business info, receipt formatting, backup defaults, and application operating parameters."""

    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)

    # Business Information
    cafe_name = Column(String(100), nullable=False, default="C³ Cafe")
    owner_name = Column(String(100), nullable=False, default="Admin Owner")
    phone_number = Column(String(20), nullable=False, default="+91 9876543210")
    email = Column(String(100), nullable=False, default="contact@c3cafe.com")
    gst_number = Column(String(50), nullable=True, default=None)
    address = Column(String(255), nullable=False, default="123 Coffee Street, Tech Hub, Bengaluru")
    logo_path = Column(String(255), nullable=True, default=None)

    # Receipt Settings
    receipt_width = Column(String(10), nullable=False, default="80mm")  # "58mm" or "80mm"
    receipt_footer = Column(String(255), nullable=False, default="Thank You! Visit Again")
    currency_symbol = Column(String(10), nullable=False, default="₹")
    show_print_count = Column(Boolean, nullable=False, default=False)

    # Backup Settings
    default_backup_format = Column(String(10), nullable=False, default="ZIP")  # "ZIP" or "DB"
    default_backup_location = Column(String(255), nullable=False, default="database/backups")
    auto_backup_on_exit = Column(Boolean, nullable=False, default=False)
    max_backup_count = Column(Integer, nullable=False, default=30)

    # Application Settings
    app_theme = Column(String(20), nullable=False, default="System")  # "Light", "Dark", "System"
    language = Column(String(20), nullable=False, default="English")
    timezone = Column(String(50), nullable=False, default="Asia/Kolkata")
    date_format = Column(String(20), nullable=False, default="DD/MM/YYYY")
    time_format = Column(String(20), nullable=False, default="12 Hour")  # "12 Hour" or "24 Hour"

    # Business Hours
    opening_time = Column(String(10), nullable=False, default="08:00")
    closing_time = Column(String(10), nullable=False, default="22:00")
