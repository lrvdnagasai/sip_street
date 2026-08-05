from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base schema for Category attributes."""
    name: str = Field(..., min_length=1, max_length=50, description="Category name (max 50 chars)")
    description: Optional[str] = Field(default=None, max_length=200, description="Optional description (max 200 chars)")
    display_order: int = Field(default=0, ge=0, description="Display order for sorting (>= 0)")


class CategoryCreate(CategoryBase):
    """Schema for creating a new category."""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating an existing category."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    description: Optional[str] = Field(default=None, max_length=200)
    display_order: Optional[int] = Field(default=None, ge=0)


class CategoryResponse(BaseModel):
    """Schema for returning category details."""
    id: int
    name: str
    description: Optional[str] = None
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
