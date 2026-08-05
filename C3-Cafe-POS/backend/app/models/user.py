import enum
from sqlalchemy import String, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.mixins import TimestampMixin, SoftDeleteMixin


class UserRole(str, enum.Enum):
    """User role enumeration for C³ Cafe POS System."""
    ADMIN = "ADMIN"
    CASHIER = "CASHIER"


class User(Base, TimestampMixin, SoftDeleteMixin):
    """User database model."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)

    def __repr__(self) -> str:
        return f"<User id={self.id} username='{self.username}' role='{self.role.value}'>"
