from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    """KPI summary cards metrics."""
    total_sales: Decimal = Field(default=Decimal("0.00"), description="Total sales revenue")
    total_orders: int = Field(default=0, description="Total number of completed orders")
    average_bill_value: Decimal = Field(default=Decimal("0.00"), description="Average invoice value")
    products_sold: int = Field(default=0, description="Total quantity of individual items sold")
    todays_expenses: Decimal = Field(default=Decimal("0.00"), description="Total operational expenses in period")
    net_sales: Decimal = Field(default=Decimal("0.00"), description="Net revenue (Total Sales - Expenses)")


class PaymentMethodBreakdown(BaseModel):
    """Payment breakdown by mode (CASH, UPI, CARD)."""
    mode: str
    amount: Decimal = Decimal("0.00")
    percentage: float = 0.0
    count: int = 0


class PaymentSummaryResponse(BaseModel):
    """Payment summary metrics response."""
    total_amount: Decimal = Decimal("0.00")
    breakdown: List[PaymentMethodBreakdown] = []


class TopProductItem(BaseModel):
    """Top selling product metrics item."""
    product_id: Optional[int] = None
    product_name: str
    quantity_sold: int
    revenue: Decimal


class HourlySalesItem(BaseModel):
    """Hourly sales chart bucket."""
    hour: str  # e.g., "08:00", "09:00"
    sales: Decimal = Decimal("0.00")
    order_count: int = 0


class RecentTransactionItem(BaseModel):
    """Recent transaction log item."""
    id: int
    invoice_number: str
    created_at: datetime
    cashier_name: Optional[str] = None
    customer_name: Optional[str] = None
    grand_total: Decimal
    payment_mode: str
    print_count: int = 0

    model_config = {"from_attributes": True}
