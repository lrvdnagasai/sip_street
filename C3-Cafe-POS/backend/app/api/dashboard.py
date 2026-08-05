from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_admin
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummary,
    HourlySalesItem,
    PaymentSummaryResponse,
    RecentTransactionItem,
    TopProductItem,
)
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    filter_type: str = Query("TODAY", description="Filter range: TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, CUSTOM"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD for CUSTOM filter"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD for CUSTOM filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve summary cards analytics (Sales, Orders, Avg Bill, Products Sold)."""
    return DashboardService.get_summary(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/payment-summary", response_model=PaymentSummaryResponse)
def get_payment_summary(
    filter_type: str = Query("TODAY", description="Filter range"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve payment method breakdown (CASH, UPI, CARD)."""
    return DashboardService.get_payment_summary(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/top-products", response_model=List[TopProductItem])
def get_top_products(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve top selling products by quantity sold."""
    return DashboardService.get_top_products(db, filter_type=filter_type, start_date=start_date, end_date=end_date, limit=limit)


@router.get("/hourly-sales", response_model=List[HourlySalesItem])
def get_hourly_sales(
    filter_type: str = Query("TODAY"),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve hourly sales distribution between 08:00 and 22:00."""
    return DashboardService.get_hourly_sales(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.get("/recent-transactions", response_model=List[RecentTransactionItem])
def get_recent_transactions(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Retrieve latest completed invoices log."""
    return DashboardService.get_recent_transactions(db, limit=limit)
