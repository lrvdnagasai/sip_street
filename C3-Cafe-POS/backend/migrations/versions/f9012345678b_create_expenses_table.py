"""create expenses table

Revision ID: f9012345678b
Revises: e789f012345a
Create Date: 2026-08-05 17:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9012345678b'
down_revision: Union[str, None] = 'e789f012345a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'expenses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('expense_date', sa.Date(), nullable=False),
        sa.Column('category', sa.Enum(
            'RAW_MATERIAL', 'MILK', 'COFFEE', 'VEGETABLES', 'PACKAGING',
            'SALARY', 'ELECTRICITY', 'RENT', 'INTERNET', 'MAINTENANCE', 'MISCELLANEOUS',
            name='expensecategory'
        ), nullable=False),
        sa.Column('description', sa.String(length=200), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('payment_mode', sa.Enum('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', name='expensepaymentmode'), server_default='CASH', nullable=False),
        sa.Column('receipt_number', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('PAID', name='expensestatus'), server_default='PAID', nullable=False),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_expenses_id'), 'expenses', ['id'], unique=False)
    op.create_index(op.f('ix_expenses_category'), 'expenses', ['category'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_expenses_category'), table_name='expenses')
    op.drop_index(op.f('ix_expenses_id'), table_name='expenses')
    op.drop_table('expenses')
