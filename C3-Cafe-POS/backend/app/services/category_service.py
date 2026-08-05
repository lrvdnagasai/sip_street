from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.category import Category


class CategoryService:
    """Service layer handling product category database operations."""

    @staticmethod
    def validate_name(name: str) -> str:
        """Validate and sanitize category name."""
        if not name or not name.strip():
            raise ValueError("Category name cannot be empty.")
        sanitized = name.strip()
        if len(sanitized) > 50:
            raise ValueError("Category name maximum length is 50 characters.")
        return sanitized

    @classmethod
    def get_categories(cls, db: Session, include_inactive: bool = False) -> List[Category]:
        """Retrieve categories ordered by display_order ascending and then name ascending."""
        query = db.query(Category)
        if not include_inactive:
            query = query.filter(Category.is_active == True)
        return query.order_by(Category.display_order.asc(), Category.name.asc()).all()

    @staticmethod
    def get_category(db: Session, category_id: int) -> Optional[Category]:
        """Retrieve a single category by primary key ID."""
        return db.query(Category).filter(Category.id == category_id).first()

    @classmethod
    def get_by_name(cls, db: Session, name: str) -> Optional[Category]:
        """Retrieve a category by case-insensitive name match."""
        if not name:
            return None
        sanitized = name.strip().lower()
        return db.query(Category).filter(func.lower(Category.name) == sanitized).first()

    @classmethod
    def create_category(
        cls,
        db: Session,
        name: str,
        description: Optional[str] = None,
        display_order: int = 0,
    ) -> Category:
        """Create a new product category."""
        sanitized_name = cls.validate_name(name)
        if display_order < 0:
            raise ValueError("Display order must be greater than or equal to 0.")

        existing = cls.get_by_name(db, sanitized_name)
        if existing:
            raise ValueError(f"Category with name '{sanitized_name}' already exists.")

        category = Category(
            name=sanitized_name,
            description=description.strip() if description else None,
            display_order=display_order,
            is_active=True,
        )
        db.add(category)
        db.commit()
        db.refresh(category)

        logger.info(f"Category Created: '{category.name}' (ID: {category.id}, Order: {category.display_order})")
        return category

    @classmethod
    def update_category(
        cls,
        db: Session,
        category_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        display_order: Optional[int] = None,
    ) -> Optional[Category]:
        """Update an existing category's attributes."""
        category = cls.get_category(db, category_id)
        if not category:
            return None

        if name is not None:
            sanitized_name = cls.validate_name(name)
            # Check case-insensitive duplicate against other categories
            existing = (
                db.query(Category)
                .filter(func.lower(Category.name) == sanitized_name.lower(), Category.id != category_id)
                .first()
            )
            if existing:
                raise ValueError(f"Category with name '{sanitized_name}' already exists.")
            category.name = sanitized_name

        if description is not None:
            category.description = description.strip() if description.strip() else None

        if display_order is not None:
            if display_order < 0:
                raise ValueError("Display order must be greater than or equal to 0.")
            category.display_order = display_order

        db.commit()
        db.refresh(category)
        logger.info(f"Category Updated: '{category.name}' (ID: {category.id})")
        return category

    @classmethod
    def set_active_status(cls, db: Session, category_id: int, is_active: bool) -> Optional[Category]:
        """Enable or soft-disable a category."""
        category = cls.get_category(db, category_id)
        if not category:
            return None

        category.is_active = is_active
        db.commit()
        db.refresh(category)
        action = "Enabled" if is_active else "Disabled"
        logger.info(f"Category {action}: '{category.name}' (ID: {category.id})")
        return category
