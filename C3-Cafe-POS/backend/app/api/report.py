from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_admin
from app.models.user import User
from app.schemas.report import (
    CashierReportResponse,
    CategoryReportResponse,
    ExpenseReportResponse,
    PaymentReportResponse,
    ProductReportResponse,
    ProfitReportResponse,
    SalesReportResponse,
)
from app.services.report_service import ReportService

router = APIRouter(prefix="/api/reports", tags=["Reports & BI"])


@router.get("/sales", response_model=SalesReportResponse)
def get_sales_report(
    filter_type: str = Query("TODAY", description="TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, CUSTOM"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve dynamic Sales report metrics and trend data."""
    return ReportService.get_sales_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/expenses", response_model=ExpenseReportResponse)
def get_expense_report(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve dynamic Expense report metrics, category breakdown, and trend data."""
    return ReportService.get_expense_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/profit", response_model=ProfitReportResponse)
def get_profit_report(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve dynamic Net Profit report (Gross Sales - Expenses) and margin percentage."""
    return ReportService.get_profit_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/products", response_model=ProductReportResponse)
def get_product_report(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve top selling and least selling menu items performance."""
    return ReportService.get_product_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/categories", response_model=CategoryReportResponse)
def get_category_report(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve category sales revenue distribution."""
    return ReportService.get_category_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/cashiers", response_model=CashierReportResponse)
def get_cashier_report(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve cashier order processing performance and receipt print audit count."""
    return ReportService.get_cashier_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/payments", response_model=PaymentReportResponse)
def get_payment_report(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve payment mode distribution and percentages."""
    return ReportService.get_payment_report(db, filter_type=filter_type, start_date=start_date, end_date=end_date)
