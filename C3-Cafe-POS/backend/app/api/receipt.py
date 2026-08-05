from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_login
from app.models.user import User
from app.schemas.receipt import ReceiptPrintAuditResponse, ReceiptResponse
from app.services.receipt_service import ReceiptService

router = APIRouter(prefix="/api/receipts", tags=["Receipts"])


@router.get("/{invoice_id}", response_model=ReceiptResponse)
def get_receipt(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve thermal receipt data for a completed invoice by ID."""
    receipt = ReceiptService.get_receipt_data(db, invoice_id)
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt for invoice ID {invoice_id} not found.",
        )
    return receipt


@router.get("/by-number/{invoice_number}", response_model=ReceiptResponse)
def get_receipt_by_number(
    invoice_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve thermal receipt data for a completed invoice by invoice number (e.g., INV000001)."""
    receipt = ReceiptService.get_receipt_by_number(db, invoice_number)
    if not receipt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Receipt for invoice number '{invoice_number}' not found.",
        )
    return receipt


@router.patch("/{invoice_id}/printed", response_model=ReceiptPrintAuditResponse)
def record_receipt_print(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Record a print or reprint action for an invoice, incrementing print_count and updating last_printed_at."""
    audit = ReceiptService.record_print(db, invoice_id)
    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID {invoice_id} not found.",
        )
    return audit
