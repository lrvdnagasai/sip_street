from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.invoice import InvoiceStatus, PaymentMode


class InvoiceItemCreate(BaseModel):
    """Schema for individual item line in bill creation."""
    product_id: int = Field(..., description="ID of product being purchased")
    quantity: int = Field(..., ge=1, le=999, description="Item quantity (1 to 999)")


class InvoiceCreate(BaseModel):
    """Schema for creating a new billing invoice."""
    items: List[InvoiceItemCreate] = Field(..., min_length=1, description="List of items in bill")
    payment_mode: PaymentMode = Field(default=PaymentMode.CASH, description="Payment mode (CASH, UPI, CARD)")
    amount_received: Decimal = Field(..., ge=0, description="Amount tendered by customer")
    customer_name: Optional[str] = Field(default="Walk-in Customer", max_length=100, description="Customer name")


class InvoiceItemResponse(BaseModel):
    """Schema for invoice line item response."""
    id: int
    invoice_id: int
    product_id: Optional[int] = None
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    """Schema for completed invoice response."""
    id: int
    invoice_number: str
    cashier_id: int
    cashier_name: Optional[str] = None
    customer_name: Optional[str] = "Walk-in Customer"
    payment_mode: PaymentMode
    subtotal: Decimal
    grand_total: Decimal
    amount_received: Decimal
    balance_amount: Decimal
    status: InvoiceStatus
    created_at: datetime
    items: List[InvoiceItemResponse]

    model_config = {"from_attributes": True}
