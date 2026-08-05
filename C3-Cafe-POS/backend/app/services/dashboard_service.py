from datetime import datetime, time, timedelta, timezone
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus, PaymentMode
from app.models.expense import Expense
from app.schemas.dashboard import (
    DashboardSummary,
    HourlySalesItem,
    PaymentMethodBreakdown,
    PaymentSummaryResponse,
    RecentTransactionItem,
    TopProductItem,
)


class DashboardService:
    """Service layer providing aggregated business insights and sales analytics."""

    @classmethod
    def _get_date_range(
        cls,
        filter_type: str = "TODAY",
        start_date_str: Optional[str] = None,
        end_date_str: Optional[str] = None,
    ) -> Tuple[datetime, datetime]:
        """Calculate start and end datetime bounds based on filter selection."""
        now = datetime.now()
        today = now.date()

        filter_upper = filter_type.strip().upper() if filter_type else "TODAY"

        if filter_upper == "YESTERDAY":
            yesterday = today - timedelta(days=1)
            start_dt = datetime.combine(yesterday, time.min)
            end_dt = datetime.combine(yesterday, time.max)
        elif filter_upper == "LAST_7_DAYS":
            start_dt = datetime.combine(today - timedelta(days=6), time.min)
            end_dt = datetime.combine(today, time.max)
        elif filter_upper == "LAST_30_DAYS":
            start_dt = datetime.combine(today - timedelta(days=29), time.min)
            end_dt = datetime.combine(today, time.max)
        elif filter_upper == "CUSTOM" and start_date_str:
            try:
                s_date = datetime.strptime(start_date_str.strip(), "%Y-%m-%d").date()
                e_date = datetime.strptime(end_date_str.strip(), "%Y-%m-%d").date() if end_date_str else s_date
                start_dt = datetime.combine(s_date, time.min)
                end_dt = datetime.combine(e_date, time.max)
            except ValueError:
                start_dt = datetime.combine(today, time.min)
                end_dt = datetime.combine(today, time.max)
        else:  # Default TODAY
            start_dt = datetime.combine(today, time.min)
            end_dt = datetime.combine(today, time.max)

        return start_dt, end_dt

    @classmethod
    def get_summary(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> DashboardSummary:
        """Retrieve total sales, order count, average bill, products sold, expenses, and net sales."""
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)

        inv_query = db.query(Invoice).filter(
            Invoice.status == InvoiceStatus.COMPLETED,
            Invoice.created_at >= start_dt,
            Invoice.created_at <= end_dt,
        )

        total_sales = inv_query.with_entities(func.sum(Invoice.grand_total)).scalar() or Decimal("0.00")
        total_orders = inv_query.count() or 0

        avg_bill = total_sales / Decimal(total_orders) if total_orders > 0 else Decimal("0.00")

        products_sold = (
            db.query(func.sum(InvoiceItem.quantity))
            .join(Invoice, InvoiceItem.invoice_id == Invoice.id)
            .filter(
                Invoice.status == InvoiceStatus.COMPLETED,
                Invoice.created_at >= start_dt,
                Invoice.created_at <= end_dt,
            )
            .scalar()
            or 0
        )

        # Operational expenses in the selected date range
        todays_expenses = (
            db.query(func.sum(Expense.amount))
            .filter(
                Expense.is_active == True,
                Expense.expense_date >= start_dt.date(),
                Expense.expense_date <= end_dt.date(),
            )
            .scalar()
            or Decimal("0.00")
        )

        net_sales = total_sales - todays_expenses

        return DashboardSummary(
            total_sales=total_sales,
            total_orders=total_orders,
            average_bill_value=avg_bill,
            products_sold=products_sold,
            todays_expenses=todays_expenses,
            net_sales=net_sales,
        )

    @classmethod
    def get_payment_summary(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> PaymentSummaryResponse:
        """Retrieve payment breakdown by CASH, UPI, and CARD modes."""
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)

        results = (
            db.query(
                Invoice.payment_mode,
                func.sum(Invoice.grand_total).label("sum_amount"),
                func.count(Invoice.id).label("count_orders"),
            )
            .filter(
                Invoice.status == InvoiceStatus.COMPLETED,
                Invoice.created_at >= start_dt,
                Invoice.created_at <= end_dt,
            )
            .group_by(Invoice.payment_mode)
            .all()
        )

        mode_map = {mode.value: {"amount": Decimal("0.00"), "count": 0} for mode in PaymentMode}
        total_amount = Decimal("0.00")

        for mode_enum, sum_amt, cnt in results:
            m_str = mode_enum.value if hasattr(mode_enum, "value") else str(mode_enum)
            amt = sum_amt or Decimal("0.00")
            mode_map[m_str] = {"amount": amt, "count": cnt or 0}
            total_amount += amt

        breakdown = []
        for m_str in ["CASH", "UPI", "CARD"]:
            amt = mode_map[m_str]["amount"]
            cnt = mode_map[m_str]["count"]
            pct = float((amt / total_amount) * 100) if total_amount > 0 else 0.0
            breakdown.append(
                PaymentMethodBreakdown(
                    mode=m_str,
                    amount=amt,
                    percentage=round(pct, 1),
                    count=cnt,
                )
            )

        return PaymentSummaryResponse(
            total_amount=total_amount,
            breakdown=breakdown,
        )

    @classmethod
    def get_top_products(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 10,
    ) -> List[TopProductItem]:
        """Retrieve top selling products ranked by quantity sold."""
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)

        results = (
            db.query(
                InvoiceItem.product_id,
                InvoiceItem.product_name,
                func.sum(InvoiceItem.quantity).label("total_qty"),
                func.sum(InvoiceItem.line_total).label("total_revenue"),
            )
            .join(Invoice, InvoiceItem.invoice_id == Invoice.id)
            .filter(
                Invoice.status == InvoiceStatus.COMPLETED,
                Invoice.created_at >= start_dt,
                Invoice.created_at <= end_dt,
            )
            .group_by(InvoiceItem.product_name)
            .order_by(func.sum(InvoiceItem.quantity).desc())
            .limit(limit)
            .all()
        )

        return [
            TopProductItem(
                product_id=p_id,
                product_name=p_name,
                quantity_sold=int(qty or 0),
                revenue=rev or Decimal("0.00"),
            )
            for p_id, p_name, qty, rev in results
        ]

    @classmethod
    def get_hourly_sales(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[HourlySalesItem]:
        """Retrieve hourly sales distribution between operating opening and closing hours."""
        from app.services.settings_service import SettingsService

        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)
        app_settings = SettingsService.get_settings(db)

        open_hr = int(app_settings.opening_time.split(":")[0]) if app_settings.opening_time else 8
        close_hr = int(app_settings.closing_time.split(":")[0]) if app_settings.closing_time else 22
        if close_hr <= open_hr:
            close_hr = open_hr + 1

        invoices = (
            db.query(
                extract("hour", Invoice.created_at).label("hr"),
                func.sum(Invoice.grand_total).label("total_sales"),
                func.count(Invoice.id).label("total_orders"),
            )
            .filter(
                Invoice.status == InvoiceStatus.COMPLETED,
                Invoice.created_at >= start_dt,
                Invoice.created_at <= end_dt,
            )
            .group_by(extract("hour", Invoice.created_at))
            .all()
        )

        hourly_map = {hr: {"sales": Decimal("0.00"), "count": 0} for hr in range(open_hr, close_hr + 1)}

        for hr_val, s_amt, c_cnt in invoices:
            if hr_val is not None:
                int_hr = int(hr_val)
                if int_hr in hourly_map:
                    hourly_map[int_hr] = {
                        "sales": s_amt or Decimal("0.00"),
                        "count": c_cnt or 0,
                    }

        hourly_list = []
        for hr in range(open_hr, close_hr + 1):
            label = f"{hr:02d}:00"
            hourly_list.append(
                HourlySalesItem(
                    hour=label,
                    sales=hourly_map[hr]["sales"],
                    order_count=hourly_map[hr]["count"],
                )
            )

        return hourly_list

    @classmethod
    def get_recent_transactions(cls, db: Session, limit: int = 10) -> List[RecentTransactionItem]:
        """Retrieve latest completed sales transactions."""
        invoices = (
            db.query(Invoice)
            .filter(Invoice.status == InvoiceStatus.COMPLETED)
            .order_by(Invoice.created_at.desc())
            .limit(limit)
            .all()
        )

        res_list = []
        for inv in invoices:
            c_name = inv.cashier.full_name or inv.cashier.username if inv.cashier else None
            p_mode = inv.payment_mode.value if hasattr(inv.payment_mode, "value") else str(inv.payment_mode)
            res_list.append(
                RecentTransactionItem(
                    id=inv.id,
                    invoice_number=inv.invoice_number,
                    created_at=inv.created_at,
                    cashier_name=c_name,
                    customer_name=inv.customer_name or "Walk-in Customer",
                    grand_total=inv.grand_total,
                    payment_mode=p_mode,
                    print_count=inv.print_count or 0,
                )
            )

        return res_list
