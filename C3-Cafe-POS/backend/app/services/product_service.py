from decimal import Decimal
from typing import List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.logging_config import logger
from app.models.category import Category
from app.models.product import Product, ProductType


class ProductService:
    """Service layer handling product database operations and business rules."""

    @staticmethod
    def validate_name(name: str) -> str:
        """Validate and sanitize product name."""
        if not name or not name.strip():
            raise ValueError("Product name cannot be empty.")
        sanitized = name.strip()
        if len(sanitized) > 80:
            raise ValueError("Product name maximum length is 80 characters.")
        return sanitized

    @staticmethod
    def validate_price(price: Decimal) -> Decimal:
        """Validate product price."""
        if price is None:
            raise ValueError("Product price is required.")
        if price <= 0:
            raise ValueError("Product price must be greater than 0.")
        if price > Decimal("99999.99"):
            raise ValueError("Product price cannot exceed 99,999.99.")
        return price

    @staticmethod
    def validate_category(db: Session, category_id: int) -> Category:
        """Verify that category exists and is currently active."""
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise ValueError(f"Category with ID {category_id} does not exist.")
        if not category.is_active:
            raise ValueError(f"Cannot assign product to inactive category '{category.name}'.")
        return category

    @classmethod
    def validate_name_unique_in_category(
        cls,
        db: Session,
        category_id: int,
        name: str,
        exclude_product_id: Optional[int] = None,
    ) -> None:
        """Check case-insensitive product name uniqueness within the same category."""
        query = db.query(Product).filter(
            Product.category_id == category_id,
            func.lower(Product.name) == name.strip().lower(),
        )
        if exclude_product_id:
            query = query.filter(Product.id != exclude_product_id)
        if query.first():
            raise ValueError(f"Product with name '{name.strip()}' already exists in this category.")

    @classmethod
    def generate_sku(cls, db: Session) -> str:
        """Auto-generate a unique product SKU code (e.g. PRD000001)."""
        max_id = db.query(func.max(Product.id)).scalar() or 0
        counter = max_id + 1
        while True:
            candidate_sku = f"PRD{counter:06d}"
            existing = db.query(Product).filter(func.lower(Product.sku) == candidate_sku.lower()).first()
            if not existing:
                return candidate_sku
            counter += 1

    @classmethod
    def validate_sku_unique(
        cls,
        db: Session,
        sku: str,
        exclude_product_id: Optional[int] = None,
    ) -> str:
        """Validate and check case-insensitive SKU uniqueness."""
        if not sku or not sku.strip():
            raise ValueError("SKU cannot be empty.")
        sanitized_sku = sku.strip().upper()
        if len(sanitized_sku) > 30:
            raise ValueError("SKU maximum length is 30 characters.")

        query = db.query(Product).filter(func.lower(Product.sku) == sanitized_sku.lower())
        if exclude_product_id:
            query = query.filter(Product.id != exclude_product_id)
        if query.first():
            raise ValueError(f"Product SKU '{sanitized_sku}' already exists.")
        return sanitized_sku

    @classmethod
    def get_products(
        cls,
        db: Session,
        category_id: Optional[int] = None,
        product_type: Optional[ProductType] = None,
        is_available: Optional[bool] = None,
        include_inactive: bool = False,
        search: Optional[str] = None,
    ) -> List[Product]:
        """Retrieve products matching filters, ordered by Category display_order & Product display_order."""
        query = db.query(Product).join(Category)

        if not include_inactive:
            query = query.filter(Product.is_active == True)

        if category_id is not None:
            query = query.filter(Product.category_id == category_id)

        if product_type is not None:
            query = query.filter(Product.product_type == product_type)

        if is_available is not None:
            query = query.filter(Product.is_available == is_available)

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

    @staticmethod
    def get_product(db: Session, product_id: int) -> Optional[Product]:
        """Retrieve a single product by ID."""
        return db.query(Product).filter(Product.id == product_id).first()

    @classmethod
    def create_product(
        cls,
        db: Session,
        category_id: int,
        name: str,
        price: Decimal,
        description: Optional[str] = None,
        display_order: int = 0,
        product_type: ProductType = ProductType.BEVERAGE,
        sku: Optional[str] = None,
        image_path: Optional[str] = None,
        is_available: bool = True,
    ) -> Product:
        """Create a new product record."""
        sanitized_name = cls.validate_name(name)
        cls.validate_price(price)
        cls.validate_category(db, category_id)
        cls.validate_name_unique_in_category(db, category_id, sanitized_name)

        if display_order < 0:
            raise ValueError("Display order must be 0 or greater.")

        if sku and sku.strip():
            final_sku = cls.validate_sku_unique(db, sku)
        else:
            final_sku = cls.generate_sku(db)

        product = Product(
            category_id=category_id,
            sku=final_sku,
            name=sanitized_name,
            description=description.strip() if description and description.strip() else None,
            price=price,
            display_order=display_order,
            product_type=product_type,
            image_path=image_path.strip() if image_path and image_path.strip() else None,
            is_available=is_available,
            is_active=True,
        )
        db.add(product)
        db.commit()
        db.refresh(product)

        logger.info(f"Product Created: '{product.name}' (SKU: {product.sku}, ID: {product.id}, Price: {product.price})")
        return product

    @classmethod
    def update_product(
        cls,
        db: Session,
        product_id: int,
        category_id: Optional[int] = None,
        name: Optional[str] = None,
        price: Optional[Decimal] = None,
        description: Optional[str] = None,
        display_order: Optional[int] = None,
        product_type: Optional[ProductType] = None,
        sku: Optional[str] = None,
        image_path: Optional[str] = None,
        is_available: Optional[bool] = None,
    ) -> Optional[Product]:
        """Update an existing product's attributes."""
        product = cls.get_product(db, product_id)
        if not product:
            return None

        target_category_id = category_id if category_id is not None else product.category_id
        if category_id is not None and category_id != product.category_id:
            cls.validate_category(db, category_id)
            product.category_id = category_id

        target_name = name.strip() if name is not None else product.name
        if name is not None:
            target_name = cls.validate_name(name)
            product.name = target_name

        # Validate name uniqueness in target category
        cls.validate_name_unique_in_category(db, target_category_id, target_name, exclude_product_id=product_id)

        if price is not None:
            cls.validate_price(price)
            product.price = price

        if sku is not None and sku.strip() and sku.strip().upper() != product.sku:
            product.sku = cls.validate_sku_unique(db, sku, exclude_product_id=product_id)

        if description is not None:
            product.description = description.strip() if description.strip() else None

        if display_order is not None:
            if display_order < 0:
                raise ValueError("Display order must be 0 or greater.")
            product.display_order = display_order

        if product_type is not None:
            product.product_type = product_type

        if image_path is not None:
            product.image_path = image_path.strip() if image_path.strip() else None

        if is_available is not None:
            product.is_available = is_available

        db.commit()
        db.refresh(product)

        logger.info(f"Product Updated: '{product.name}' (SKU: {product.sku}, ID: {product.id})")
        return product

    @classmethod
    def set_availability(cls, db: Session, product_id: int, is_available: bool) -> Optional[Product]:
        """Toggle or set product billing availability status."""
        product = cls.get_product(db, product_id)
        if not product:
            return None

        product.is_available = is_available
        db.commit()
        db.refresh(product)

        status_str = "Available" if is_available else "Unavailable"
        logger.info(f"Product Availability Changed ({status_str}): '{product.name}' (ID: {product.id})")
        return product

    @classmethod
    def set_active_status(cls, db: Session, product_id: int, is_active: bool) -> Optional[Product]:
        """Enable or soft-disable a product."""
        product = cls.get_product(db, product_id)
        if not product:
            return None

        product.is_active = is_active
        db.commit()
        db.refresh(product)

        action = "Enabled" if is_active else "Disabled"
        logger.info(f"Product {action}: '{product.name}' (ID: {product.id})")
        return product
