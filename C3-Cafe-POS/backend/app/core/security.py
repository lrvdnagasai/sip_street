import bcrypt
from app.core.logging_config import logger


MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 100


def validate_password_length(password: str) -> None:
    """Validate password length constraint (min 8, max 100 chars)."""
    if not password or len(password) < MIN_PASSWORD_LENGTH or len(password) > MAX_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must be between {MIN_PASSWORD_LENGTH} and {MAX_PASSWORD_LENGTH} characters long."
        )


def hash_password(password: str) -> str:
    """Hash a plain text password using BCrypt."""
    validate_password_length(password)
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain text password against a BCrypt hash."""
    if not plain_password or not hashed_password:
        logger.warning("Password verification failure: Missing plain password or password hash.")
        return False
    try:
        is_valid = bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
        if not is_valid:
            logger.warning("Password verification failure: Password mismatch.")
        return is_valid
    except Exception as e:
        logger.warning(f"Password verification failure: Exception occurred - {e}")
        return False
