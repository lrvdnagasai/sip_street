import enum
from decimal import Decimal
from sqlalchemy import Boolean, Column, Date, DateTime, Enum, Integer, Numeric, String, Text, func

from app.database.base import Base


class ExpenseCategory(str, enum.Enum):
    """Expense categorization options."""
    RAW_MATERIAL = "RAW_MATERIAL"
    MILK = "MILK"
    COFFEE = "COFFEE"
    VEGETABLES = "VEGETABLES"
    PACKAGING = "PACKAGING"
    SALARY = "SALARY"
    ELECTRICITY = "ELECTRICITY"
    RENT = "RENT"
    INTERNET = "INTERNET"
    MAINTENANCE = "MAINTENANCE"
    MISCELLANEOUS = "MISCELLANEOUS"


class ExpensePaymentMode(str, enum.Enum):
    """Payment mode options for expenses."""
    CASH = "CASH"
    UPI = "UPI"
    CARD = "CARD"
    BANK_TRANSFER = "BANK_TRANSFER"


class ExpenseStatus(str, enum.Enum):
    """Expense payment status."""
    PAID = "PAID"


class Expense(Base):
    """Expense entity for operational expenditure tracking."""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    expense_date = Column(Date, nullable=False, default=func.current_date())
    category = Column(Enum(ExpenseCategory), nullable=False, index=True)
    description = Column(String(200), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_mode = Column(Enum(ExpensePaymentMode), default=ExpensePaymentMode.CASH, nullable=False)
    receipt_number = Column(String(100), nullable=True)
    status = Column(Enum(ExpenseStatus), default=ExpenseStatus.PAID, nullable=False)
    notes = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Expense id={self.id} cat='{self.category}' amount={self.amount}>"
