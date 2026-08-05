from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.core.security import verify_password
from app.dependencies import get_db
from app.dependencies.auth import require_login
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    MessageResponse,
    UserResponse,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user with username and password, starting a session."""
    user = UserService.verify_password(db, payload.username, payload.password)
    if not user:
        logger.warning(f"Login Failure: Invalid credentials for username '{payload.username}'.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    # Set session cookie data
    request.session["user_id"] = user.id
    logger.info(f"Login Success: User '{user.username}' (Role: {user.role.value}) logged in.")

    return LoginResponse(
        success=True,
        message="Login successful",
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(request: Request, current_user: User = Depends(require_login)):
    """Logout current user and clear authenticated session."""
    logger.info(f"Logout: User '{current_user.username}' logged out.")
    request.session.clear()
    return LogoutResponse(
        success=True,
        message="Logged out successfully",
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(require_login)):
    """Retrieve profile details for the currently logged-in user."""
    return UserResponse.model_validate(current_user)


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Change password for the currently logged-in user."""
    if not verify_password(payload.current_password, current_user.password_hash):
        logger.warning(f"Password Change Failure: Incorrect current password for user '{current_user.username}'.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password cannot be the same as current password.",
        )

    try:
        UserService.update_user(db, current_user.id, password=payload.new_password)
        logger.info(f"Password Change: User '{current_user.username}' updated password successfully.")
        return MessageResponse(
            success=True,
            message="Password changed successfully",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
