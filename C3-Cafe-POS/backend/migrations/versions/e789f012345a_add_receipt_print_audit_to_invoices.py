"""add receipt print audit to invoices

Revision ID: e789f012345a
Revises: c19d4e56789f
Create Date: 2026-08-05 17:07:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e789f012345a'
down_revision: Union[str, None] = 'c19d4e56789f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('invoices', sa.Column('print_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('invoices', sa.Column('last_printed_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('invoices', 'last_printed_at')
    op.drop_column('invoices', 'print_count')
