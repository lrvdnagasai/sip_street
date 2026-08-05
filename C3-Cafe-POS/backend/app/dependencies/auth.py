from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.dependencies.db import get_db
from app.models.user import User, UserRole
from app.services.user_service import UserService


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Retrieve the currently authenticated user from session cookie."""
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )

    user = UserService.get_user(db, user_id)
    if not user or not user.is_active:
        logger.warning(f"Unauthorized Access: Session user_id={user_id} not found or inactive.")
        request.session.clear()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalid or user inactive.",
        )

    return user


def require_login(current_user: User = Depends(get_current_user)) -> User:
    """Dependency enforcing that a user is logged in."""
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency enforcing Admin role authorization."""
    if current_user.role != UserRole.ADMIN:
        logger.warning(
            f"Unauthorized Access Attempt: User '{current_user.username}' (Role: {current_user.role.value}) attempted to access Admin endpoint."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required.",
        )
    return current_user


def require_cashier(current_user: User = Depends(get_current_user)) -> User:
    """Dependency enforcing Cashier or Admin role authorization."""
    if current_user.role not in (UserRole.CASHIER, UserRole.ADMIN):
        logger.warning(
            f"Unauthorized Access Attempt: User '{current_user.username}' (Role: {current_user.role.value}) attempted to access Cashier endpoint."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Cashier or Administrator privileges required.",
        )
    return current_user
