import enum
from decimal import Decimal
from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.database.mixins import TimestampMixin


class ProductType(str, enum.Enum):
    """Product type enumeration for reporting and categorization."""
    BEVERAGE = "BEVERAGE"
    VEG = "VEG"
    NON_VEG = "NON_VEG"


class Product(Base, TimestampMixin):
    """Product entity representing catalog items available for sale."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    sku = Column(String(30), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    description = Column(String(300), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    product_type = Column(Enum(ProductType), default=ProductType.BEVERAGE, nullable=False)
    image_path = Column(String(255), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    category = relationship("Category", backref="products")

    def __repr__(self):
        return f"<Product id={self.id} sku='{self.sku}' name='{self.name}' price={self.price}>"
