from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_admin, require_login
from app.models.product import ProductType
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/api/products", tags=["Products"])


def _to_response(product) -> ProductResponse:
    """Helper to convert Product model to ProductResponse with category_name."""
    res = ProductResponse.model_validate(product)
    res.category_name = product.category.name if product.category else None
    return res


@router.get("", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[int] = Query(None, description="Filter by Category ID"),
    product_type: Optional[ProductType] = Query(None, description="Filter by Product Type (BEVERAGE, VEG, NON_VEG)"),
    is_available: Optional[bool] = Query(None, description="Filter by availability status"),
    include_inactive: bool = Query(False, description="Include disabled products (Admin view)"),
    search: Optional[str] = Query(None, description="Instant search term (name, description, or SKU)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve all products matching query filters."""
    products = ProductService.get_products(
        db=db,
        category_id=category_id,
        product_type=product_type,
        is_available=is_available,
        include_inactive=include_inactive,
        search=search,
    )
    return [_to_response(p) for p in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve details for a single product."""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )
    return _to_response(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Create a new product record (Admin only)."""
    try:
        product = ProductService.create_product(
            db=db,
            category_id=payload.category_id,
            name=payload.name,
            price=payload.price,
            description=payload.description,
            display_order=payload.display_order,
            product_type=payload.product_type,
            sku=payload.sku,
            image_path=payload.image_path,
            is_available=payload.is_available,
        )
        return _to_response(product)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Update an existing product (Admin only)."""
    try:
        product = ProductService.update_product(
            db=db,
            product_id=product_id,
            category_id=payload.category_id,
            name=payload.name,
            price=payload.price,
            description=payload.description,
            display_order=payload.display_order,
            product_type=payload.product_type,
            sku=payload.sku,
            image_path=payload.image_path,
            is_available=payload.is_available,
        )
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found.",
            )
        return _to_response(product)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch("/{product_id}/availability", response_model=ProductResponse)
def toggle_product_availability(
    product_id: int,
    is_available: Optional[bool] = Query(None, description="Explicit availability status; toggles if omitted"),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Toggle or set product billing availability (Admin only)."""
    product = ProductService.get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )

    target_status = not product.is_available if is_available is None else is_available
    updated = ProductService.set_availability(db, product_id, is_available=target_status)
    return _to_response(updated)


@router.patch("/{product_id}/disable", response_model=ProductResponse)
def disable_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Soft disable a product (Admin only)."""
    product = ProductService.set_active_status(db, product_id, is_active=False)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )
    return _to_response(product)


@router.patch("/{product_id}/enable", response_model=ProductResponse)
def enable_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Enable a product (Admin only)."""
    product = ProductService.set_active_status(db, product_id, is_active=True)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found.",
        )
    return _to_response(product)
