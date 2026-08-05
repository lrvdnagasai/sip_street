from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_login
from app.models.user import User
from app.schemas.billing import InvoiceCreate, InvoiceResponse
from app.schemas.product import ProductResponse
from app.services.billing_service import BillingService

router = APIRouter(prefix="/api/billing", tags=["Billing"])


def _to_invoice_response(invoice: Invoice) -> InvoiceResponse:
    """Format invoice model to response schema with cashier_name."""
    res = InvoiceResponse.model_validate(invoice)
    res.cashier_name = invoice.cashier.full_name or invoice.cashier.username if invoice.cashier else None
    return res


@router.get("/products", response_model=List[ProductResponse])
def get_billing_products(
    category_id: Optional[int] = Query(None, description="Filter active & available products by category ID"),
    search: Optional[str] = Query(None, description="Search active & available products by name or SKU"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve active & available products for POS terminal billing."""
    products = BillingService.get_billing_products(db, category_id=category_id, search=search)
    res_list = []
    for p in products:
        item = ProductResponse.model_validate(p)
        item.category_name = p.category.name if p.category else None
        res_list.append(item)
    return res_list


@router.post("/invoice", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    payload: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Create and complete a new sale invoice transaction."""
    try:
        items_dict = [{"product_id": item.product_id, "quantity": item.quantity} for item in payload.items]
        invoice = BillingService.create_invoice(
            db=db,
            cashier_id=current_user.id,
            items_data=items_dict,
            payment_mode=payload.payment_mode,
            amount_received=payload.amount_received,
            customer_name=payload.customer_name,
        )
        return _to_invoice_response(invoice)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve details for a single invoice by ID."""
    invoice = BillingService.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice with ID {invoice_id} not found.",
        )
    return _to_invoice_response(invoice)


@router.get("/history", response_model=List[InvoiceResponse])
def get_invoice_history(
    limit: int = Query(50, ge=1, le=200, description="Number of recent invoices to retrieve"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve recent completed invoice history."""
    invoices = BillingService.get_invoice_history(db, limit=limit)
    return [_to_invoice_response(inv) for inv in invoices]
