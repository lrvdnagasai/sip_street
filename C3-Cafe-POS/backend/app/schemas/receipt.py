from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.billing import InvoiceResponse


class CafeInfo(BaseModel):
    """Cafe metadata header details for receipts."""
    name: str = "C³ CAFE POS"
    tagline: str = "Taste the Freshness"
    address: str = "123 Sip Street, Tech Park"
    phone: str = "+91 98765 43210"


class ReceiptResponse(BaseModel):
    """Complete receipt response schema."""
    cafe_info: CafeInfo = Field(default_factory=CafeInfo)
    invoice: InvoiceResponse


class ReceiptPrintAuditResponse(BaseModel):
    """Response schema for receipt print audit confirmation."""
    invoice_id: int
    invoice_number: str
    print_count: int
    last_printed_at: datetime

    model_config = {"from_attributes": True}
