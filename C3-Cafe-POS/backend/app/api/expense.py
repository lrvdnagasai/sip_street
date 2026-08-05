from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_admin
from app.models.expense import ExpenseCategory, ExpensePaymentMode
from app.models.user import User
from app.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseSummaryResponse,
    ExpenseUpdate,
)
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("", response_model=List[ExpenseResponse])
def get_expenses(
    category: Optional[ExpenseCategory] = Query(None, description="Category filter"),
    payment_mode: Optional[ExpensePaymentMode] = Query(None, description="Payment mode filter"),
    search: Optional[str] = Query(None, description="Search term across description, receipt #, notes"),
    include_inactive: bool = Query(False, description="Include soft-disabled expenses"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve expenses list with search and filters."""
    return ExpenseService.get_expenses(
        db,
        category=category,
        payment_mode=payment_mode,
        search=search,
        include_inactive=include_inactive,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/summary", response_model=ExpenseSummaryResponse)
def get_expense_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve expense KPI summary card metrics."""
    return ExpenseService.get_expense_summary(db)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve single expense by ID."""
    return ExpenseService.get_expense(db, expense_id)


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Record a new operational expense."""
    return ExpenseService.create_expense(db, expense_in)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update details of an existing expense."""
    return ExpenseService.update_expense(db, expense_id, expense_in)


@router.patch("/{expense_id}/disable", response_model=ExpenseResponse)
def disable_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Soft-disable an expense."""
    return ExpenseService.set_expense_active(db, expense_id, is_active=False)


@router.patch("/{expense_id}/enable", response_model=ExpenseResponse)
def enable_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Re-enable a soft-disabled expense."""
    return ExpenseService.set_expense_active(db, expense_id, is_active=True)
