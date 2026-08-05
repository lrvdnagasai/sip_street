# C³ Cafe POS
# Changelog

All notable changes to this project are documented here.

---

## POS-001 - Project Initialization
Date: YYYY-MM-DD

### Added
- Created project structure.
- Initialized Git repository.
- Created backend and frontend folders.

---

## POS-002 - Repository Setup
Date: YYYY-MM-DD

### Added
- Git configuration.
- Initial documentation.
- README.md.

---

## POS-003 - FastAPI Foundation
Date: YYYY-MM-DD

### Added
- FastAPI application.
- Configuration management.
- Logging.
- Health endpoint.
- CORS.
- Environment configuration.

### Tests
- Health endpoint verified.
- Root endpoint verified.

---

## POS-004 - React Foundation
Date: YYYY-MM-DD

### Added
- React 19 + Vite.
- Tailwind CSS.
- React Router.
- Zustand.
- Axios.
- Main layout.
- Home page.

### Tests
- Production build successful.
- Backend connectivity verified.

---

## POS-005 - Database Foundation
Date: YYYY-MM-DD

### Added
- SQLite integration.
- SQLAlchemy setup.
- Alembic migrations.
- Database initialization.
- Database connection health check.

### Tests
- Database connection tests.
- Migration verification.
- Health endpoint verification.

---

## POS-006 - User Management
Date: YYYY-MM-DD

### Added
- User model.
- UserRole enum.
- Password hashing (bcrypt).
- UserService.
- Default Admin Seeder.
- Alembic migration for users.

### Changed
- Database initialization now seeds default administrator.

### Tests
- User CRUD tests.
- Password verification tests.
- Seeder tests.

---

## POS-007 - Authentication Backend
Date: YYYY-MM-DD

### Added
- Login API.
- Logout API.
- Current User API.
- Change Password API.
- Role authorization.
- Session authentication.

### Changed
- Authentication middleware.
- API protection.

### Tests
- Login.
- Logout.
- Authorization.
- Password change.
- Protected routes.

---

## POS-008 - Frontend Authentication
Date: YYYY-MM-DD

### Added
- Login page.
- Authentication store.
- Authentication service.
- ProtectedRoute.
- Loading screen.
- Unauthorized page.
- Application shell.
- Header.
- Sidebar.
- Footer.
- Dashboard placeholder.

### Changed
- Axios configured with credentials.
- Application startup session verification.

### Tests
- Login.
- Logout.
- Session persistence.
- Protected routes.
- Username remember.
- Production build.

---

## POS-009 - Category Management
Date: YYYY-MM-DD

### Added
- Category model.
- Category service.
- Category APIs.
- Category migration.
- Category frontend.
- Category search.
- Category modal.
- Category store.

### Changed
- Sidebar navigation updated.
- Default Cashier account seeded.

### Tests
- Category CRUD.
- Duplicate validation.
- Search.
- Permissions.
- Frontend build.

---

## POS-010 - Product Management
Date: 2026-08-05

### Added
- Product database model with `ProductType` enum (`BEVERAGE`, `VEG`, `NON_VEG`), auto-generated SKU, and `is_available` billing state.
- `ProductService` layer with case-insensitive name uniqueness within category, SKU validation/generation, and active category assignment checks.
- Product REST APIs (`/api/products`) supporting search, category filter, product type filter, availability filter, and Admin/Cashier authorization rules.
- Alembic migration for `products` table (`842abef1234a_create_products_table.py`).
- Frontend `productService` and `useProductStore` Zustand state management.
- `ProductsPage` and `ProductModal` with instant search, multi-filter dropdowns, placeholder icon badges, and availability toggle controls.

### Changed
- Sidebar navigation updated to enable `Products` link.
- AppRouter updated with `/products` protected route.

### Tests
- Backend unit tests for `ProductService` and Product APIs (`28 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-011 - Billing & POS Terminal
Date: 2026-08-05

### Added
- `Invoice` and `InvoiceItem` database models with `PaymentMode` (`CASH`, `UPI`, `CARD`), `InvoiceStatus` (`COMPLETED`), auto-incremented invoice numbers (`INV000001`), historical product price/name snapshot storage, and `c19d4e56789f_create_invoices_tables.py` Alembic migration.
- `BillingService` database layer handling terminal product queries (active + available items), invoice creation, tendered amount validation (`amount_received >= grand_total`), and receipt history.
- REST APIs (`/api/billing/products`, `/api/billing/invoice`, `/api/billing/invoices/{id}`, `/api/billing/history`).
- Frontend `billingService` and `useBillingStore` Zustand state store.
- Tablet-optimized 3-column `BillingPage` with category filter bar, touch-friendly product card catalog grid, quantity controls (`-` / qty / `+`), payment mode selector, quick cash presets (`₹50`, `₹100`, `₹200`, `₹500`, `Exact`), and change due calculation.
- Printable `ReceiptModal` displaying complete sale receipt format (`INV000001`, line items, cashier name, customer name, totals, payment, change due).

### Changed
- Sidebar navigation updated to enable `Billing` link.
- AppRouter updated with `/billing` protected route.

### Tests
- Backend unit tests for `BillingService` and Billing APIs (`30 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-012 - Receipt Generation & Printing
Date: 2026-08-05

### Added
- `ReceiptService` backend service and schemas (`ReceiptResponse`, `CafeInfo`) retrieving formatted receipt datasets from completed invoices by ID or invoice number (`INV000001`).
- REST APIs (`GET /api/receipts/{invoice_id}`, `GET /api/receipts/by-number/{invoice_number}`).
- Frontend `receiptService`, modular `Receipt.jsx` component, `ReceiptPreviewModal.jsx` dialog, and `ReceiptsPage.jsx` receipt history/reprint screen.
- Support for 80mm standard and 58mm compact thermal paper layouts with live toggle.
- Browser print support (`window.print()`) with print CSS media queries ensuring only thermal receipt paper content is printed (stripping sidebar, headers, footers, and action buttons).
- Reprint functionality allowing any completed invoice from transaction history to be reprinted without mutating data.

### Changed
- Sidebar navigation updated to enable `Receipts` link.
- AppRouter updated with `/receipts` protected route.

### Tests
- Backend unit tests for `ReceiptService` and Receipt APIs (`32 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-012.1 - Receipt Print Audit & Tracking
Date: 2026-08-05

### Added
- Database enhancement adding `print_count` (INTEGER, Default 0) and `last_printed_at` (DATETIME, Nullable) to `invoices` table via Alembic migration `e789f012345a_add_receipt_print_audit_to_invoices.py`.
- `ReceiptService.record_print` method incrementing `print_count` and recording current UTC timestamp on `last_printed_at`.
- Print audit REST API (`PATCH /api/receipts/{invoice_id}/printed`).
- `ReceiptPreviewModal` UI displaying live `Printed: X Times` counter and `Last Printed: [Timestamp / Never]` audit metadata, updating immediately after initial print or reprint.
- `ReceiptsPage` history table enhanced with **Print Count** badge and **Last Printed** timestamp columns.

### Tests
- Backend unit tests for default print count, increment tracking, timestamp updates, and `PATCH /api/receipts/{invoice_id}/printed` endpoint (`32 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-013 - Dashboard
Date: 2026-08-05

### Added
- `DashboardService` backend layer computing real-time business performance analytics (Total Sales, Total Orders, Average Bill Value, Products Sold, Payment Mode Breakdown, Top 10 Selling Products, Hourly Sales Distribution between 08:00 and 22:00, and Recent Transactions).
- REST APIs (`/api/dashboard/summary`, `/api/dashboard/payment-summary`, `/api/dashboard/top-products`, `/api/dashboard/hourly-sales`, `/api/dashboard/recent-transactions`) protected by `require_admin` dependency.
- Frontend `dashboardService` and `useDashboardStore` Zustand state store.
- Date Range Filter bar supporting `Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, and `Custom Range` date pickers.
- 30-second Auto Refresh mechanism with manual refresh button and last refreshed timestamp indicator.
- Recharts-powered `HourlySalesChart` (Bar Chart) and `PaymentBreakdownWidget` (Donut Chart & progress bars).
- `SummaryCards` KPI cards and `TopProductsWidget` table.
- Cashier role redirect: cashiers attempting to access `/` are automatically redirected to `/billing`.

### Tests
- Backend unit tests for `DashboardService` aggregations and Admin/Cashier role authorization (`34 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-014 - Expense Management
Date: 2026-08-05

### Added
- `Expense` database model and `ExpenseCategory` enum (`RAW_MATERIAL`, `MILK`, `COFFEE`, `VEGETABLES`, `PACKAGING`, `SALARY`, `ELECTRICITY`, `RENT`, `INTERNET`, `MAINTENANCE`, `MISCELLANEOUS`).
- Alembic migration `f9012345678b_create_expenses_table.py`.
- `ExpenseService` database service layer implementing expense CRUD, instant case-insensitive search, multi-field filtering, soft disable/enable, and aggregated summary metrics (Today's Expenses, This Month Expenses, Total Active Expenses, Average Daily Expense).
- Expense REST APIs (`/api/expenses`, `/api/expenses/summary`, `/api/expenses/{id}`, `/api/expenses/{id}/disable`, `/api/expenses/{id}/enable`) protected by `require_admin` dependency.
- Dashboard integration adding `todays_expenses` and `net_sales` (`total_sales - todays_expenses`) to `/api/dashboard/summary` and Dashboard `SummaryCards`.
- Frontend `expenseService`, `useExpenseStore` Zustand store, `ExpenseModal` dialog, and `ExpensesPage` with KPI summary cards, filter toolbar, and expense data table.
- Enabled `Expenses` in `Sidebar.jsx` and registered `/expenses` protected route in `router/index.jsx`.

### Tests
- Backend unit tests for `ExpenseService`, Expense APIs, and Dashboard integration (`37 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-015 - Reports & Business Intelligence
Date: 2026-08-05

### Added
- `ReportService` backend analytics engine executing dynamic calculations without duplicate database tables across 7 business intelligence reports: Sales, Expense, Net Profit, Product Performance, Category Performance, Cashier Performance, and Payment Method Breakdown.
- Report REST APIs (`/api/reports/sales`, `/api/reports/expenses`, `/api/reports/profit`, `/api/reports/products`, `/api/reports/categories`, `/api/reports/cashiers`, `/api/reports/payments`) protected by `require_admin` dependency.
- Frontend `reportService`, `useReportStore` Zustand store, `csvExport.js` utility, and `ReportsPage` featuring top executive summary metrics and 7 dedicated analytics tabs (`SalesTab`, `ExpensesTab`, `ProfitTab`, `ProductsTab`, `CategoriesTab`, `CashiersTab`, `PaymentsTab`).
- Recharts visualizations: sales revenue trends, expense daily trends, gross sales vs expenses vs net profit, category breakdown charts, top product sales charts, and payment mode donut charts.
- Export to CSV utility enabling instant download of report data for offline analysis.
- Browser print support (`window.print()`) with print CSS media query isolation.
- Dashboard integration adding "Open Reports & BI" action button on the Admin Dashboard page linking directly to `/reports`.
- Enabled `Reports` in `Sidebar.jsx` and registered `/reports` protected route in `router/index.jsx`.

### Tests
- Backend unit tests for `ReportService`, Report APIs, profit margin calculations, cashier aggregations, and Admin/Cashier authorization (`39 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-016 - Data Backup & Restore
Date: 2026-08-05

### Added
- `BackupService` database backup & restoration engine supporting offline backup generation, format compressed ZIP (`.zip`) and raw database (`.db`), SHA-256 checksum integrity verification, and automatic safety pre-restore database snapshots.
- Backup REST APIs (`/api/backup/summary`, `/api/backup/history`, `/api/backup/create`, `/api/backup/validate`, `/api/backup/restore`, `/api/backup/upload`, `/api/backup/download/{backup_name}`, `/api/backup/{backup_name}`) protected by `require_admin` dependency.
- Validation guard rejecting invalid, non-SQLite, empty, or corrupted backup archives with HTTP 400 Bad Request.
- Frontend `backupService`, `useBackupStore` Zustand store, `BackupSummaryCards`, `CreateBackupModal`, `RestoreConfirmModal`, `BackupHistoryTable`, and `BackupPage`.
- Dashboard integration adding "Quick Backup" action button on the Admin Dashboard page linking directly to `/backup`.
- Enabled `Backup & Restore` in `Sidebar.jsx` and registered `/backup` protected route in `router/index.jsx`.
- Installed `python-multipart` dependency for backend multipart backup file upload processing.

### Tests
- Backend unit tests for `BackupService`, ZIP/DB creation, integrity validation, corrupted archive rejection, database restore, and Admin/Cashier authorization (`42 passed`).
- Frontend production build verified (`npm run build`).

---

## POS-017 - Application Settings
Date: 2026-08-05

### Added
- `Settings` singleton database model and Alembic migration `f9012345678c_create_settings_table.py` eliminating hardcoded business configuration.
- Auto-seeding mechanism seeding default settings on initial database load.
- `SettingsService` database service layer and REST APIs (`GET /api/settings`, `PUT /api/settings`, `POST /api/settings/reset`).
- Integration across modules:
  - **Receipt Module**: Consumes `cafe_name`, `address`, `phone_number`, `gst_number`, `currency_symbol`, `receipt_footer`, `receipt_width`, and `show_print_count` dynamically.
  - **Dashboard Module**: Consumes `opening_time` and `closing_time` for operating hours distribution.
  - **Backup Module**: Reads default backup format and retention settings.
- Frontend `settingsService`, `useSettingsStore` Zustand store, 5 section components (`BusinessInfoSection`, `ReceiptSettingsSection`, `BackupSettingsSection`, `AppSettingsSection`, `BusinessHoursSection`), and `SettingsPage`.
- Enabled `Settings` in `Sidebar.jsx` and registered `/settings` protected route in `router/index.jsx`.

### Tests
- Backend unit tests for `SettingsService`, default auto-seeding, update operations, reset to factory defaults, and Admin/Cashier authorization (`44 passed`).
- Frontend production build verified (`npm run build`).