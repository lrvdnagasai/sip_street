from pydantic import BaseModel, Field
from app.models.user import UserRole


class LoginRequest(BaseModel):
    """Schema for user login request."""
    username: str = Field(..., min_length=1, description="Username for login")
    password: str = Field(..., min_length=1, description="Plain text password")


class UserResponse(BaseModel):
    """Schema for user details response."""
    id: int
    username: str
    full_name: str
    role: UserRole

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    """Schema for successful login response."""
    success: bool = True
    message: str = "Login successful"
    user: UserResponse


class LogoutResponse(BaseModel):
    """Schema for logout response."""
    success: bool = True
    message: str = "Logged out successfully"


class ChangePasswordRequest(BaseModel):
    """Schema for password change request."""
    current_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password (8-100 characters)")


class MessageResponse(BaseModel):
    """Generic message response schema."""
    success: bool = True
    message: str
