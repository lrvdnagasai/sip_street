from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.dependencies.auth import require_admin, require_login
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def get_categories(
    include_inactive: bool = Query(False, description="Include disabled categories (Admin view)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve all categories ordered by display_order ascending."""
    categories = CategoryService.get_categories(db, include_inactive=include_inactive)
    return [CategoryResponse.model_validate(c) for c in categories]


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_login),
):
    """Retrieve details for a single category."""
    category = CategoryService.get_category(db, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found.",
        )
    return CategoryResponse.model_validate(category)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Create a new category (Admin only)."""
    try:
        category = CategoryService.create_category(
            db=db,
            name=payload.name,
            description=payload.description,
            display_order=payload.display_order,
        )
        return CategoryResponse.model_validate(category)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Update an existing category (Admin only)."""
    try:
        category = CategoryService.update_category(
            db=db,
            category_id=category_id,
            name=payload.name,
            description=payload.description,
            display_order=payload.display_order,
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {category_id} not found.",
            )
        return CategoryResponse.model_validate(category)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch("/{category_id}/disable", response_model=CategoryResponse)
def disable_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Soft disable a category (Admin only)."""
    category = CategoryService.set_active_status(db, category_id, is_active=False)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found.",
        )
    return CategoryResponse.model_validate(category)


@router.patch("/{category_id}/enable", response_model=CategoryResponse)
def enable_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Enable a category (Admin only)."""
    category = CategoryService.set_active_status(db, category_id, is_active=True)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with ID {category_id} not found.",
        )
    return CategoryResponse.model_validate(category)
