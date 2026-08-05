from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.invoice import Invoice
from app.schemas.billing import InvoiceResponse
from app.schemas.receipt import CafeInfo, ReceiptPrintAuditResponse, ReceiptResponse


class ReceiptService:
    """Service layer handling receipt generation, formatting, and print audit tracking."""

    @classmethod
    def get_receipt_data(cls, db: Session, invoice_id: int) -> Optional[ReceiptResponse]:
        """Retrieve complete receipt dataset for a given invoice ID."""
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return None

        cashier_name = invoice.cashier.full_name or invoice.cashier.username if invoice.cashier else None
        inv_schema = InvoiceResponse.model_validate(invoice)
        inv_schema.cashier_name = cashier_name

        logger.info(f"Receipt Generated: Invoice #{invoice.invoice_number} (ID: {invoice.id})")
        return ReceiptResponse(
            cafe_info=CafeInfo(),
            invoice=inv_schema,
        )

    @classmethod
    def get_receipt_by_number(cls, db: Session, invoice_number: str) -> Optional[ReceiptResponse]:
        """Retrieve complete receipt dataset for a given invoice number."""
        invoice = db.query(Invoice).filter(Invoice.invoice_number == invoice_number.strip().upper()).first()
        if not invoice:
            return None

        cashier_name = invoice.cashier.full_name or invoice.cashier.username if invoice.cashier else None
        inv_schema = InvoiceResponse.model_validate(invoice)
        inv_schema.cashier_name = cashier_name

        return ReceiptResponse(
            cafe_info=CafeInfo(),
            invoice=inv_schema,
        )

    @classmethod
    def record_print(cls, db: Session, invoice_id: int) -> Optional[ReceiptPrintAuditResponse]:
        """Increment print_count and record last_printed_at timestamp for an invoice."""
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            return None

        invoice.print_count = (invoice.print_count or 0) + 1
        invoice.last_printed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(invoice)

        logger.info(
            f"Receipt Print Audit Recorded: Invoice #{invoice.invoice_number} | "
            f"Print Count: {invoice.print_count} | Last Printed: {invoice.last_printed_at}"
        )

        return ReceiptPrintAuditResponse(
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            print_count=invoice.print_count,
            last_printed_at=invoice.last_printed_at,
        )
