from typing import Optional
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.core.security import hash_password, verify_password as check_password
from app.models.user import User, UserRole


class UserService:
    """Service layer handling user management database operations."""

    @staticmethod
    def validate_username(username: str) -> str:
        """Validate and sanitize username (lowercase, no spaces)."""
        if not username or not username.strip():
            raise ValueError("Username cannot be empty.")
        sanitized = username.strip().lower()
        if " " in sanitized:
            raise ValueError("Username cannot contain spaces.")
        if len(sanitized) > 50:
            raise ValueError("Username maximum length is 50 characters.")
        return sanitized

    @classmethod
    def create_user(
        cls,
        db: Session,
        username: str,
        full_name: str,
        password: str,
        role: UserRole,
        is_active: bool = True,
    ) -> User:
        """Create a new user with hashed password."""
        sanitized_username = cls.validate_username(username)
        if not full_name or not full_name.strip():
            raise ValueError("Full name cannot be empty.")

        existing_user = cls.get_by_username(db, sanitized_username)
        if existing_user:
            raise ValueError(f"Username '{sanitized_username}' already exists.")

        hashed_pwd = hash_password(password)
        user = User(
            username=sanitized_username,
            full_name=full_name.strip(),
            password_hash=hashed_pwd,
            role=role,
            is_active=is_active,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        logger.info(f"User Created: {user.username} (Role: {user.role.value})")
        return user

    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Retrieve a user by primary key ID."""
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def get_by_username(cls, db: Session, username: str) -> Optional[User]:
        """Retrieve a user by username (case-insensitive search)."""
        if not username:
            return None
        sanitized_username = username.strip().lower()
        return db.query(User).filter(User.username == sanitized_username).first()

    @classmethod
    def update_user(
        cls,
        db: Session,
        user_id: int,
        full_name: Optional[str] = None,
        password: Optional[str] = None,
        role: Optional[UserRole] = None,
    ) -> Optional[User]:
        """Update an existing user's details."""
        user = cls.get_user(db, user_id)
        if not user:
            return None

        if full_name is not None:
            if not full_name.strip():
                raise ValueError("Full name cannot be empty.")
            user.full_name = full_name.strip()

        if role is not None:
            user.role = role

        if password is not None:
            user.password_hash = hash_password(password)

        db.commit()
        db.refresh(user)
        logger.info(f"User Updated: {user.username}")
        return user

    @classmethod
    def disable_user(cls, db: Session, user_id: int) -> Optional[User]:
        """Disable a user account (set is_active = False)."""
        user = cls.get_user(db, user_id)
        if not user:
            return None

        user.is_active = False
        db.commit()
        db.refresh(user)
        logger.info(f"User Disabled: {user.username}")
        return user

    @classmethod
    def verify_password(cls, db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate a user by verifying username, active status, and password."""
        user = cls.get_by_username(db, username)
        if not user:
            logger.warning(f"Password Verification Failure: User '{username}' not found.")
            return None

        if not user.is_active:
            logger.warning(f"Password Verification Failure: User '{username}' is disabled.")
            return None

        if check_password(password, user.password_hash):
            return user

        logger.warning(f"Password Verification Failure: Invalid password for user '{username}'.")
        return None
