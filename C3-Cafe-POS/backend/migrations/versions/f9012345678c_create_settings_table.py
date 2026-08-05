"""create_settings_table

Revision ID: f9012345678c
Revises: f9012345678b
Create Date: 2026-08-05 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f9012345678c'
down_revision: Union[str, None] = 'f9012345678b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cafe_name', sa.String(length=100), nullable=False, server_default='C³ Cafe'),
        sa.Column('owner_name', sa.String(length=100), nullable=False, server_default='Admin Owner'),
        sa.Column('phone_number', sa.String(length=20), nullable=False, server_default='+91 9876543210'),
        sa.Column('email', sa.String(length=100), nullable=False, server_default='contact@c3cafe.com'),
        sa.Column('gst_number', sa.String(length=50), nullable=True),
        sa.Column('address', sa.String(length=255), nullable=False, server_default='123 Coffee Street, Tech Hub, Bengaluru'),
        sa.Column('logo_path', sa.String(length=255), nullable=True),
        sa.Column('receipt_width', sa.String(length=10), nullable=False, server_default='80mm'),
        sa.Column('receipt_footer', sa.String(length=255), nullable=False, server_default='Thank You! Visit Again'),
        sa.Column('currency_symbol', sa.String(length=10), nullable=False, server_default='₹'),
        sa.Column('show_print_count', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('default_backup_format', sa.String(length=10), nullable=False, server_default='ZIP'),
        sa.Column('default_backup_location', sa.String(length=255), nullable=False, server_default='database/backups'),
        sa.Column('auto_backup_on_exit', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('max_backup_count', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('app_theme', sa.String(length=20), nullable=False, server_default='System'),
        sa.Column('language', sa.String(length=20), nullable=False, server_default='English'),
        sa.Column('timezone', sa.String(length=50), nullable=False, server_default='Asia/Kolkata'),
        sa.Column('date_format', sa.String(length=20), nullable=False, server_default='DD/MM/YYYY'),
        sa.Column('time_format', sa.String(length=20), nullable=False, server_default='12 Hour'),
        sa.Column('opening_time', sa.String(length=10), nullable=False, server_default='08:00'),
        sa.Column('closing_time', sa.String(length=10), nullable=False, server_default='22:00'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_settings_id'), 'settings', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_settings_id'), table_name='settings')
    op.drop_table('settings')
