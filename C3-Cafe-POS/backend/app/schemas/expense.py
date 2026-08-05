from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

from app.models.expense import ExpenseCategory, ExpensePaymentMode, ExpenseStatus


class ExpenseCreate(BaseModel):
    """Schema for recording a new operational expense."""
    expense_date: Optional[date] = Field(default=None, description="Expense date (defaults to today)")
    category: ExpenseCategory = Field(..., description="Category classification")
    description: str = Field(..., min_length=1, max_length=200, description="Expense description (max 200 chars)")
    amount: Decimal = Field(..., gt=0, description="Amount spent (must be greater than 0)")
    payment_mode: ExpensePaymentMode = Field(default=ExpensePaymentMode.CASH, description="Payment mode")
    receipt_number: Optional[str] = Field(default=None, max_length=100, description="Optional vendor receipt/invoice #")
    notes: Optional[str] = Field(default=None, max_length=500, description="Optional additional notes")


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense."""
    expense_date: Optional[date] = None
    category: Optional[ExpenseCategory] = None
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[Decimal] = Field(None, gt=0)
    payment_mode: Optional[ExpensePaymentMode] = None
    receipt_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=500)


class ExpenseResponse(BaseModel):
    """Schema for expense entity response."""
    id: int
    expense_date: date
    category: ExpenseCategory
    description: str
    amount: Decimal
    payment_mode: ExpensePaymentMode
    receipt_number: Optional[str] = None
    status: ExpenseStatus
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExpenseSummaryResponse(BaseModel):
    """Summary KPI metrics for expenses."""
    todays_expenses: Decimal = Decimal("0.00")
    this_month_expenses: Decimal = Decimal("0.00")
    total_expenses: Decimal = Decimal("0.00")
    avg_daily_expense: Decimal = Decimal("0.00")
