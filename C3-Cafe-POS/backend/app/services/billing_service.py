from decimal import Decimal
from typing import Dict, List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.category import Category
from app.models.invoice import Invoice, InvoiceItem, InvoiceStatus, PaymentMode
from app.models.product import Product
from app.models.user import User


class BillingService:
    """Service layer handling billing, order calculation, invoice generation, and receipt history."""

    @classmethod
    def get_billing_products(
        cls,
        db: Session,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[Product]:
        """Retrieve active and available products for POS billing terminal."""
        query = db.query(Product).join(Category).filter(
            Product.is_active == True,
            Product.is_available == True,
            Category.is_active == True,
        )

        if category_id is not None:
            query = query.filter(Product.category_id == category_id)

        if search and search.strip():
            term = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Product.name).like(term),
                    func.lower(Product.description).like(term),
                    func.lower(Product.sku).like(term),
                )
            )

        return query.order_by(
            Category.display_order.asc(),
            Category.name.asc(),
            Product.display_order.asc(),
            Product.name.asc(),
        ).all()

    @classmethod
    def generate_invoice_number(cls, db: Session) -> str:
        """Generate unique auto-incremented invoice number (e.g., INV000001)."""
        max_id = db.query(func.max(Invoice.id)).scalar() or 0
        counter = max_id + 1
        while True:
            candidate_number = f"INV{counter:06d}"
            existing = db.query(Invoice).filter(Invoice.invoice_number == candidate_number).first()
            if not existing:
                return candidate_number
            counter += 1

    @classmethod
    def create_invoice(
        cls,
        db: Session,
        cashier_id: int,
        items_data: List[Dict],
        payment_mode: PaymentMode = PaymentMode.CASH,
        amount_received: Decimal = Decimal("0.00"),
        customer_name: Optional[str] = "Walk-in Customer",
    ) -> Invoice:
        """Create and complete a new sale invoice transaction."""
        cashier = db.query(User).filter(User.id == cashier_id, User.is_active == True).first()
        if not cashier:
            raise ValueError("Invalid or inactive cashier account.")

        if not items_data:
            raise ValueError("Invoice must contain at least one item.")

        subtotal = Decimal("0.00")
        item_entities = []

        for item_in in items_data:
            product_id = item_in.get("product_id")
            quantity = item_in.get("quantity", 1)

            if not product_id:
                raise ValueError("Product ID is required for each line item.")

            if quantity < 1 or quantity > 999:
                raise ValueError("Line item quantity must be between 1 and 999.")

            product = db.query(Product).filter(Product.id == product_id).first()
            if not product:
                raise ValueError(f"Product with ID {product_id} not found.")

            if not product.is_active or not product.is_available:
                raise ValueError(f"Product '{product.name}' is currently unavailable for billing.")

            line_total = product.price * Decimal(quantity)
            subtotal += line_total

            item_entities.append(
                InvoiceItem(
                    product_id=product.id,
                    product_name=product.name,
                    unit_price=product.price,
                    quantity=quantity,
                    line_total=line_total,
                )
            )

        grand_total = subtotal

        if amount_received < grand_total:
            raise ValueError(
                f"Amount received (₹{amount_received:.2f}) is less than grand total (₹{grand_total:.2f})."
            )

        balance_amount = amount_received - grand_total
        invoice_number = cls.generate_invoice_number(db)

        cust_name = customer_name.strip() if customer_name and customer_name.strip() else "Walk-in Customer"

        invoice = Invoice(
            invoice_number=invoice_number,
            cashier_id=cashier_id,
            customer_name=cust_name,
            payment_mode=payment_mode,
            subtotal=subtotal,
            grand_total=grand_total,
            amount_received=amount_received,
            balance_amount=balance_amount,
            status=InvoiceStatus.COMPLETED,
            items=item_entities,
        )

        db.add(invoice)
        db.commit()
        db.refresh(invoice)

        logger.info(
            f"Invoice Created: {invoice.invoice_number} | Grand Total: ₹{invoice.grand_total:.2f} | "
            f"Payment: {invoice.payment_mode.value} | Cashier: {cashier.username}"
        )
        return invoice

    @staticmethod
    def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
        """Retrieve single invoice with items by ID."""
        return db.query(Invoice).filter(Invoice.id == invoice_id).first()

    @staticmethod
    def get_invoice_history(db: Session, limit: int = 50) -> List[Invoice]:
        """Retrieve recent invoices ordered by creation date descending."""
        return db.query(Invoice).order_by(Invoice.created_at.desc()).limit(limit).all()
