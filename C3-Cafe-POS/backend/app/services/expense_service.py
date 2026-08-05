from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.expense import Expense, ExpenseCategory, ExpensePaymentMode
from app.schemas.expense import ExpenseCreate, ExpenseSummaryResponse, ExpenseUpdate


class ExpenseService:
    """Service layer managing business logic and database persistence for operational expenses."""

    @classmethod
    def get_expenses(
        cls,
        db: Session,
        category: Optional[ExpenseCategory] = None,
        payment_mode: Optional[ExpensePaymentMode] = None,
        search: Optional[str] = None,
        include_inactive: bool = False,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[Expense]:
        """Retrieve filtered expenses list."""
        query = db.query(Expense)

        if not include_inactive:
            query = query.filter(Expense.is_active == True)

        if category:
            query = query.filter(Expense.category == category)

        if payment_mode:
            query = query.filter(Expense.payment_mode == payment_mode)

        if start_date:
            try:
                s_d = datetime.strptime(start_date.strip(), "%Y-%m-%d").date()
                query = query.filter(Expense.expense_date >= s_d)
            except ValueError:
                pass

        if end_date:
            try:
                e_d = datetime.strptime(end_date.strip(), "%Y-%m-%d").date()
                query = query.filter(Expense.expense_date <= e_d)
            except ValueError:
                pass

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Expense.description.ilike(term),
                    Expense.receipt_number.ilike(term),
                    Expense.notes.ilike(term),
                )
            )

        return query.order_by(Expense.expense_date.desc(), Expense.id.desc()).all()

    @classmethod
    def get_expense(cls, db: Session, expense_id: int) -> Expense:
        """Retrieve single expense by ID or raise 404."""
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense with ID {expense_id} not found.",
            )
        return expense

    @classmethod
    def create_expense(cls, db: Session, expense_in: ExpenseCreate) -> Expense:
        """Record a new expense."""
        exp_date = expense_in.expense_date or date.today()

        expense = Expense(
            expense_date=exp_date,
            category=expense_in.category,
            description=expense_in.description.strip(),
            amount=expense_in.amount,
            payment_mode=expense_in.payment_mode,
            receipt_number=expense_in.receipt_number.strip() if expense_in.receipt_number else None,
            notes=expense_in.notes.strip() if expense_in.notes else None,
            is_active=True,
        )

        db.add(expense)
        db.commit()
        db.refresh(expense)

        logger.info(f"Expense Created: ID {expense.id} | Cat: {expense.category.value} | Amount: ₹{expense.amount}")
        return expense

    @classmethod
    def update_expense(cls, db: Session, expense_id: int, expense_in: ExpenseUpdate) -> Expense:
        """Update fields of an existing expense."""
        expense = cls.get_expense(db, expense_id)

        update_data = expense_in.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if value is not None:
                if isinstance(value, str):
                    value = value.strip()
                setattr(expense, field, value)

        db.commit()
        db.refresh(expense)

        logger.info(f"Expense Updated: ID {expense.id}")
        return expense

    @classmethod
    def set_expense_active(cls, db: Session, expense_id: int, is_active: bool) -> Expense:
        """Soft-disable or re-enable an expense."""
        expense = cls.get_expense(db, expense_id)
        expense.is_active = is_active
        db.commit()
        db.refresh(expense)

        action = "Enabled" if is_active else "Disabled"
        logger.info(f"Expense {action}: ID {expense.id}")
        return expense

    @classmethod
    def get_expense_summary(cls, db: Session) -> ExpenseSummaryResponse:
        """Retrieve aggregated summary metrics for expenses."""
        today = date.today()
        first_of_month = date(today.year, today.month, 1)

        # 1. Today's Expenses
        todays_expenses = (
            db.query(func.sum(Expense.amount))
            .filter(Expense.is_active == True, Expense.expense_date == today)
            .scalar()
            or Decimal("0.00")
        )

        # 2. This Month Expenses
        this_month_expenses = (
            db.query(func.sum(Expense.amount))
            .filter(
                Expense.is_active == True,
                Expense.expense_date >= first_of_month,
                Expense.expense_date <= today,
            )
            .scalar()
            or Decimal("0.00")
        )

        # 3. Total Active Expenses
        total_expenses = (
            db.query(func.sum(Expense.amount))
            .filter(Expense.is_active == True)
            .scalar()
            or Decimal("0.00")
        )

        # 4. Average Daily Expense (for active days or current month days)
        day_of_month = today.day
        avg_daily = this_month_expenses / Decimal(day_of_month) if day_of_month > 0 else Decimal("0.00")

        return ExpenseSummaryResponse(
            todays_expenses=todays_expenses,
            this_month_expenses=this_month_expenses,
            total_expenses=total_expenses,
            avg_daily_expense=avg_daily,
        )
