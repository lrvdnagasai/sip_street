import enum
from decimal import Decimal
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import relationship

from app.database.base import Base


class PaymentMode(str, enum.Enum):
    """Payment mode options for completed billing invoices."""
    CASH = "CASH"
    UPI = "UPI"
    CARD = "CARD"


class InvoiceStatus(str, enum.Enum):
    """Invoice completion status."""
    COMPLETED = "COMPLETED"


class Invoice(Base):
    """Invoice entity representing completed customer sale transactions."""
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_number = Column(String(30), unique=True, nullable=False, index=True)
    cashier_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    customer_name = Column(String(100), default="Walk-in Customer", nullable=True)
    payment_mode = Column(Enum(PaymentMode), default=PaymentMode.CASH, nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
    grand_total = Column(Numeric(10, 2), nullable=False)
    amount_received = Column(Numeric(10, 2), nullable=False)
    balance_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(InvoiceStatus), default=InvoiceStatus.COMPLETED, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    cashier = relationship("User")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Invoice id={self.id} number='{self.invoice_number}' total={self.grand_total}>"


class InvoiceItem(Base):
    """Invoice item line entity capturing historical product price and quantity snapshot."""
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = Column(String(80), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    line_total = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product")

    def __repr__(self):
        return f"<InvoiceItem id={self.id} product='{self.product_name}' qty={self.quantity} total={self.line_total}>"
