from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.category import Category
from app.models.expense import Expense
from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus, PaymentMode
from app.models.product import Product
from app.models.user import User
from app.schemas.report import (
    CashierReportItem,
    CashierReportResponse,
    CategoryExpensePoint,
    CategoryReportItem,
    CategoryReportResponse,
    ExpenseReportResponse,
    PaymentReportItem,
    PaymentReportResponse,
    ProductReportItem,
    ProductReportResponse,
    ProfitReportResponse,
    ProfitTrendPoint,
    SalesReportResponse,
    TrendPoint,
)


class ReportService:
    """Service layer executing dynamic business intelligence analytics across transactions and expenses."""

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
    def get_sales_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> SalesReportResponse:
        """Dynamic sales performance report."""
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

        # Trend points (Daily or Hourly)
        trend_list = []
        is_single_day = (end_dt.date() - start_dt.date()).days == 0

        if is_single_day:
            # Hourly breakdown
            hourly_data = (
                db.query(
                    extract("hour", Invoice.created_at).label("hr"),
                    func.sum(Invoice.grand_total).label("sales"),
                    func.count(Invoice.id).label("cnt"),
                )
                .filter(
                    Invoice.status == InvoiceStatus.COMPLETED,
                    Invoice.created_at >= start_dt,
                    Invoice.created_at <= end_dt,
                )
                .group_by(extract("hour", Invoice.created_at))
                .all()
            )
            h_map = {h: (Decimal("0.00"), 0) for h in range(8, 23)}
            for hr, s_amt, c_cnt in hourly_data:
                if hr is not None and int(hr) in h_map:
                    h_map[int(hr)] = (s_amt or Decimal("0.00"), c_cnt or 0)

            for hr in range(8, 23):
                trend_list.append(
                    TrendPoint(
                        label=f"{hr:02d}:00",
                        sales=h_map[hr][0],
                        orders=h_map[hr][1],
                    )
                )
        else:
            # Daily breakdown
            daily_data = (
                db.query(
                    func.date(Invoice.created_at).label("dt"),
                    func.sum(Invoice.grand_total).label("sales"),
                    func.count(Invoice.id).label("cnt"),
                )
                .filter(
                    Invoice.status == InvoiceStatus.COMPLETED,
                    Invoice.created_at >= start_dt,
                    Invoice.created_at <= end_dt,
                )
                .group_by(func.date(Invoice.created_at))
                .all()
            )
            d_map = {str(dt_val): (s_amt or Decimal("0.00"), c_cnt or 0) for dt_val, s_amt, c_cnt in daily_data}

            curr = start_dt.date()
            while curr <= end_dt.date():
                c_str = curr.strftime("%Y-%m-%d")
                s_val, c_val = d_map.get(c_str, (Decimal("0.00"), 0))
                trend_list.append(TrendPoint(label=c_str, sales=s_val, orders=c_val))
                curr += timedelta(days=1)

        return SalesReportResponse(
            total_sales=total_sales,
            total_orders=total_orders,
            average_bill=avg_bill,
            products_sold=products_sold,
            trend_data=trend_list,
        )

    @classmethod
    def get_expense_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> ExpenseReportResponse:
        """Dynamic expense analysis report."""
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)

        exp_query = db.query(Expense).filter(
            Expense.is_active == True,
            Expense.expense_date >= start_dt.date(),
            Expense.expense_date <= end_dt.date(),
        )

        total_expenses = exp_query.with_entities(func.sum(Expense.amount)).scalar() or Decimal("0.00")
        total_count = exp_query.count() or 0

        # Category breakdown
        cat_data = (
            db.query(
                Expense.category,
                func.sum(Expense.amount).label("sum_amt"),
            )
            .filter(
                Expense.is_active == True,
                Expense.expense_date >= start_dt.date(),
                Expense.expense_date <= end_dt.date(),
            )
            .group_by(Expense.category)
            .all()
        )

        breakdown = []
        for cat_enum, s_amt in cat_data:
            c_str = cat_enum.value if hasattr(cat_enum, "value") else str(cat_enum)
            amt = s_amt or Decimal("0.00")
            pct = float((amt / total_expenses) * 100) if total_expenses > 0 else 0.0
            breakdown.append(
                CategoryExpensePoint(
                    category=c_str,
                    amount=amt,
                    percentage=round(pct, 1),
                )
            )

        # Daily expense trend
        daily_exp = (
            db.query(
                Expense.expense_date.label("dt"),
                func.sum(Expense.amount).label("expenses"),
            )
            .filter(
                Expense.is_active == True,
                Expense.expense_date >= start_dt.date(),
                Expense.expense_date <= end_dt.date(),
            )
            .group_by(Expense.expense_date)
            .all()
        )
        e_map = {dt_val.strftime("%Y-%m-%d"): (e_amt or Decimal("0.00")) for dt_val, e_amt in daily_exp if dt_val}

        trend_list = []
        curr = start_dt.date()
        while curr <= end_dt.date():
            c_str = curr.strftime("%Y-%m-%d")
            e_val = e_map.get(c_str, Decimal("0.00"))
            trend_list.append(TrendPoint(label=c_str, expenses=e_val))
            curr += timedelta(days=1)

        return ExpenseReportResponse(
            total_expenses=total_expenses,
            total_count=total_count,
            category_breakdown=breakdown,
            trend_data=trend_list,
        )

    @classmethod
    def get_profit_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> ProfitReportResponse:
        """Dynamic Net Profit report (Sales - Expenses)."""
        sales_rep = cls.get_sales_report(db, filter_type, start_date, end_date)
        exp_rep = cls.get_expense_report(db, filter_type, start_date, end_date)

        gross_sales = sales_rep.total_sales
        total_expenses = exp_rep.total_expenses
        net_profit = gross_sales - total_expenses

        profit_margin = float((net_profit / gross_sales) * 100) if gross_sales > 0 else 0.0

        # Combine sales and expenses trends by date
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)
        sales_map = {t.label: t.sales for t in sales_rep.trend_data}
        exp_map = {t.label: t.expenses for t in exp_rep.trend_data}

        trend_list = []
        is_single_day = (end_dt.date() - start_dt.date()).days == 0

        if is_single_day:
            for hr in range(8, 23):
                lbl = f"{hr:02d}:00"
                s_val = sales_map.get(lbl, Decimal("0.00"))
                e_val = total_expenses / Decimal(15) if total_expenses > 0 else Decimal("0.00")
                trend_list.append(
                    ProfitTrendPoint(
                        label=lbl,
                        gross_sales=s_val,
                        expenses=e_val,
                        net_profit=s_val - e_val,
                    )
                )
        else:
            curr = start_dt.date()
            while curr <= end_dt.date():
                c_str = curr.strftime("%Y-%m-%d")
                s_val = sales_map.get(c_str, Decimal("0.00"))
                e_val = exp_map.get(c_str, Decimal("0.00"))
                trend_list.append(
                    ProfitTrendPoint(
                        label=c_str,
                        gross_sales=s_val,
                        expenses=e_val,
                        net_profit=s_val - e_val,
                    )
                )
                curr += timedelta(days=1)

        return ProfitReportResponse(
            gross_sales=gross_sales,
            total_expenses=total_expenses,
            net_profit=net_profit,
            profit_margin_pct=round(profit_margin, 1),
            trend_data=trend_list,
        )

    @classmethod
    def get_product_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> ProductReportResponse:
        """Product performance report (Top selling & least selling menu items)."""
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
            .all()
        )

        all_items = []
        for p_id, p_name, qty, rev in results:
            total_qty = int(qty or 0)
            total_rev = rev or Decimal("0.00")
            avg_p = total_rev / Decimal(total_qty) if total_qty > 0 else Decimal("0.00")

            # Lookup category name from product
            cat_name = "Uncategorized"
            if p_id:
                prod = db.query(Product).filter(Product.id == p_id).first()
                if prod and prod.category:
                    cat_name = prod.category.name

            all_items.append(
                ProductReportItem(
                    product_id=p_id,
                    product_name=p_name,
                    category_name=cat_name,
                    quantity_sold=total_qty,
                    revenue=total_rev,
                    avg_price=avg_p,
                )
            )

        top_10 = all_items[:10]
        least_10 = list(reversed(all_items[-10:])) if len(all_items) > 10 else []

        return ProductReportResponse(
            top_products=top_10,
            least_products=least_10,
        )

    @classmethod
    def get_category_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> CategoryReportResponse:
        """Category performance report."""
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)

        results = (
            db.query(
                Category.id,
                Category.name,
                func.count(func.distinct(InvoiceItem.invoice_id)).label("order_cnt"),
                func.sum(InvoiceItem.quantity).label("total_qty"),
                func.sum(InvoiceItem.line_total).label("total_revenue"),
            )
            .join(Product, Product.category_id == Category.id)
            .join(InvoiceItem, InvoiceItem.product_id == Product.id)
            .join(Invoice, InvoiceItem.invoice_id == Invoice.id)
            .filter(
                Invoice.status == InvoiceStatus.COMPLETED,
                Invoice.created_at >= start_dt,
                Invoice.created_at <= end_dt,
            )
            .group_by(Category.id, Category.name)
            .order_by(func.sum(InvoiceItem.line_total).desc())
            .all()
        )

        grand_revenue = sum([rev or Decimal("0.00") for _, _, _, _, rev in results]) or Decimal("0.00")

        items = []
        top_cat = None

        for c_id, c_name, o_cnt, qty, rev in results:
            if top_cat is None:
                top_cat = c_name
            tot_rev = rev or Decimal("0.00")
            pct = float((tot_rev / grand_revenue) * 100) if grand_revenue > 0 else 0.0
            items.append(
                CategoryReportItem(
                    category_id=c_id,
                    category_name=c_name,
                    total_orders=o_cnt or 0,
                    quantity_sold=int(qty or 0),
                    revenue=tot_rev,
                    percentage=round(pct, 1),
                )
            )

        return CategoryReportResponse(
            top_category_name=top_cat,
            items=items,
        )

    @classmethod
    def get_cashier_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> CashierReportResponse:
        """Cashier performance report."""
        start_dt, end_dt = cls._get_date_range(filter_type, start_date, end_date)

        results = (
            db.query(
                User.id,
                User.full_name,
                User.username,
                func.count(Invoice.id).label("order_cnt"),
                func.sum(Invoice.grand_total).label("total_sales"),
                func.sum(Invoice.print_count).label("total_prints"),
            )
            .join(Invoice, Invoice.cashier_id == User.id)
            .filter(
                Invoice.status == InvoiceStatus.COMPLETED,
                Invoice.created_at >= start_dt,
                Invoice.created_at <= end_dt,
            )
            .group_by(User.id)
            .order_by(func.sum(Invoice.grand_total).desc())
            .all()
        )

        items = []
        for u_id, f_name, u_name, o_cnt, s_amt, p_cnt in results:
            c_name = f_name or u_name
            t_sales = s_amt or Decimal("0.00")
            cnt = o_cnt or 0
            avg_b = t_sales / Decimal(cnt) if cnt > 0 else Decimal("0.00")
            items.append(
                CashierReportItem(
                    cashier_id=u_id,
                    cashier_name=c_name,
                    orders_processed=cnt,
                    revenue=t_sales,
                    average_bill=avg_b,
                    print_count=p_cnt or 0,
                )
            )

        return CashierReportResponse(items=items)

    @classmethod
    def get_payment_report(
        cls,
        db: Session,
        filter_type: str = "TODAY",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> PaymentReportResponse:
        """Payment method breakdown report."""
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

        items = []
        for m_str in ["CASH", "UPI", "CARD"]:
            amt = mode_map[m_str]["amount"]
            cnt = mode_map[m_str]["count"]
            pct = float((amt / total_amount) * 100) if total_amount > 0 else 0.0
            items.append(
                PaymentReportItem(
                    mode=m_str,
                    amount=amt,
                    percentage=round(pct, 1),
                    count=cnt,
                )
            )

        return PaymentReportResponse(
            total_amount=total_amount,
            items=items,
        )
