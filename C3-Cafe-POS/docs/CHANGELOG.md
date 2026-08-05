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