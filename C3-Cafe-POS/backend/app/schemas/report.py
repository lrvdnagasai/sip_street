from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class TrendPoint(BaseModel):
    """Daily or hourly trend data point."""
    label: str  # e.g., "08:00" or "2026-08-05"
    sales: Decimal = Decimal("0.00")
    expenses: Decimal = Decimal("0.00")
    orders: int = 0


class SalesReportResponse(BaseModel):
    """Sales analytics report data."""
    total_sales: Decimal = Decimal("0.00")
    total_orders: int = 0
    average_bill: Decimal = Decimal("0.00")
    products_sold: int = 0
    trend_data: List[TrendPoint] = []


class CategoryExpensePoint(BaseModel):
    """Category breakdown for expense report."""
    category: str
    amount: Decimal = Decimal("0.00")
    percentage: float = 0.0


class ExpenseReportResponse(BaseModel):
    """Expense analytics report data."""
    total_expenses: Decimal = Decimal("0.00")
    total_count: int = 0
    category_breakdown: List[CategoryExpensePoint] = []
    trend_data: List[TrendPoint] = []


class ProfitTrendPoint(BaseModel):
    """Profit trend data point."""
    label: str
    gross_sales: Decimal = Decimal("0.00")
    expenses: Decimal = Decimal("0.00")
    net_profit: Decimal = Decimal("0.00")


class ProfitReportResponse(BaseModel):
    """Net profit analytics report data."""
    gross_sales: Decimal = Decimal("0.00")
    total_expenses: Decimal = Decimal("0.00")
    net_profit: Decimal = Decimal("0.00")
    profit_margin_pct: float = 0.0
    trend_data: List[ProfitTrendPoint] = []


class ProductReportItem(BaseModel):
    """Individual product performance metric item."""
    product_id: Optional[int] = None
    product_name: str
    category_name: str
    quantity_sold: int = 0
    revenue: Decimal = Decimal("0.00")
    avg_price: Decimal = Decimal("0.00")


class ProductReportResponse(BaseModel):
    """Product performance report data."""
    top_products: List[ProductReportItem] = []
    least_products: List[ProductReportItem] = []


class CategoryReportItem(BaseModel):
    """Category performance metric item."""
    category_id: Optional[int] = None
    category_name: str
    total_orders: int = 0
    quantity_sold: int = 0
    revenue: Decimal = Decimal("0.00")
    percentage: float = 0.0


class CategoryReportResponse(BaseModel):
    """Category performance report data."""
    top_category_name: Optional[str] = None
    items: List[CategoryReportItem] = []


class CashierReportItem(BaseModel):
    """Cashier activity performance metric item."""
    cashier_id: int
    cashier_name: str
    orders_processed: int = 0
    revenue: Decimal = Decimal("0.00")
    average_bill: Decimal = Decimal("0.00")
    print_count: int = 0


class CashierReportResponse(BaseModel):
    """Cashier performance report data."""
    items: List[CashierReportItem] = []


class PaymentReportItem(BaseModel):
    """Payment method report item."""
    mode: str
    amount: Decimal = Decimal("0.00")
    percentage: float = 0.0
    count: int = 0


class PaymentReportResponse(BaseModel):
    """Payment breakdown report data."""
    total_amount: Decimal = Decimal("0.00")
    items: List[PaymentReportItem] = []
