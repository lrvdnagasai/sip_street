from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

from app.models.product import ProductType


class ProductBase(BaseModel):
    """Base schema for Product attributes."""
    category_id: int = Field(..., description="ID of active Category")
    sku: Optional[str] = Field(default=None, max_length=30, description="Unique SKU code (auto-generated if empty)")
    name: str = Field(..., min_length=1, max_length=80, description="Product name (max 80 chars)")
    description: Optional[str] = Field(default=None, max_length=300, description="Optional description (max 300 chars)")
    price: Decimal = Field(..., gt=0, le=99999.99, description="Product selling price (> 0 and <= 99999.99)")
    display_order: int = Field(default=0, ge=0, description="Display order for sorting (>= 0)")
    product_type: ProductType = Field(default=ProductType.BEVERAGE, description="Product type (BEVERAGE, VEG, NON_VEG)")
    image_path: Optional[str] = Field(default=None, max_length=255, description="Relative image file path")
    is_available: bool = Field(default=True, description="Availability for billing")


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""
    category_id: Optional[int] = None
    sku: Optional[str] = Field(default=None, max_length=30)
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    description: Optional[str] = Field(default=None, max_length=300)
    price: Optional[Decimal] = Field(default=None, gt=0, le=99999.99)
    display_order: Optional[int] = Field(default=None, ge=0)
    product_type: Optional[ProductType] = None
    image_path: Optional[str] = Field(default=None, max_length=255)
    is_available: Optional[bool] = None


class ProductResponse(BaseModel):
    """Schema for returning product details."""
    id: int
    category_id: int
    category_name: Optional[str] = None
    sku: str
    name: str
    description: Optional[str] = None
    price: Decimal
    display_order: int
    product_type: ProductType
    image_path: Optional[str] = None
    is_available: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
