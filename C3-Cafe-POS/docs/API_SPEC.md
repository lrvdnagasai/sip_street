# C³ Cafe POS System - API Specification

## System & Health

### Root Endpoint
`GET /`

**Response (200 OK)**
```json
{
  "app": "C3 Cafe POS",
  "version": "1.0.0",
  "status": "Running"
}
```

### Health Check
`GET /health`

**Response (200 OK)**
```json
{
  "status": "Healthy",
  "database": "Connected"
}
```

---

## Authentication APIs

### 1. User Login
`POST /api/auth/login`

---

### 2. User Logout
`POST /api/auth/logout`

---

### 3. Get Current User Profile
`GET /api/auth/me`

---

### 4. Change Password
`POST /api/auth/change-password`

---

## Category Management APIs

### 1. List Categories
`GET /api/categories?include_inactive={boolean}`

---

### 2. Get Category Details
`GET /api/categories/{id}`

---

### 3. Create Category
`POST /api/categories`

---

### 4. Update Category
`PUT /api/categories/{id}`

---

### 5. Disable Category (Soft Delete)
`PATCH /api/categories/{id}/disable`

---

### 6. Enable Category
`PATCH /api/categories/{id}/enable`

---

## Product Management APIs

### 1. List Products
`GET /api/products?category_id={int}&product_type={enum}&is_available={boolean}&include_inactive={boolean}&search={string}`

---

### 2. Get Product Details
`GET /api/products/{id}`

---

### 3. Create Product
`POST /api/products`

---

### 4. Update Product
`PUT /api/products/{id}`

---

### 5. Toggle / Set Product Availability
`PATCH /api/products/{id}/availability?is_available={boolean}`

---

### 6. Disable Product (Soft Delete)
`PATCH /api/products/{id}/disable`

---

### 7. Enable Product
`PATCH /api/products/{id}/enable`

---

## Billing & POS Terminal APIs

### 1. List Terminal Products
`GET /api/billing/products?category_id={int}&search={string}`

---

### 2. Create Invoice
`POST /api/billing/invoice`

---

### 3. Get Invoice Details
`GET /api/billing/invoices/{id}`

---

### 4. Get Invoice History
`GET /api/billing/history?limit={int}`

---

## Receipt Generation & Printing APIs

### 1. Get Receipt Data by Invoice ID
`GET /api/receipts/{invoice_id}`

---

### 2. Get Receipt Data by Invoice Number
`GET /api/receipts/by-number/{invoice_number}`

---

### 3. Record Receipt Print Audit
`PATCH /api/receipts/{invoice_id}/printed`

---

## Expense Management APIs

### 1. List Expenses
`GET /api/expenses?category={enum}&payment_mode={enum}&search={string}&include_inactive={boolean}&start_date={string}&end_date={string}`

---

### 2. Get Expense Summary Metrics
`GET /api/expenses/summary`

---

### 3. Get Expense Details
`GET /api/expenses/{id}`

---

### 4. Create Expense
`POST /api/expenses`

---

### 5. Update Expense
`PUT /api/expenses/{id}`

---

### 6. Soft Disable Expense
`PATCH /api/expenses/{id}/disable`

---

### 7. Re-enable Expense
`PATCH /api/expenses/{id}/enable`

---

## Business Performance Dashboard APIs

### 1. Summary Cards Metrics
`GET /api/dashboard/summary?filter_type={enum}&start_date={string}&end_date={string}`

---

### 2. Payment Method Breakdown
`GET /api/dashboard/payment-summary?filter_type={enum}&start_date={string}&end_date={string}`

---

### 3. Top Selling Products
`GET /api/dashboard/top-products?filter_type={enum}&start_date={string}&end_date={string}&limit={int}`

---

### 4. Hourly Sales Distribution
`GET /api/dashboard/hourly-sales?filter_type={enum}&start_date={string}&end_date={string}`

---

### 5. Recent Transactions Log
`GET /api/dashboard/recent-transactions?limit={int}`

---

## Reports & Business Intelligence APIs

### 1. Sales Report
`GET /api/reports/sales?filter_type={enum}&start_date={string}&end_date={string}`

---

### 2. Expense Report
`GET /api/reports/expenses?filter_type={enum}&start_date={string}&end_date={string}`

---

### 3. Net Profit Report
`GET /api/reports/profit?filter_type={enum}&start_date={string}&end_date={string}`

---

### 4. Product Performance Report
`GET /api/reports/products?filter_type={enum}&start_date={string}&end_date={string}`

---

### 5. Category Performance Report
`GET /api/reports/categories?filter_type={enum}&start_date={string}&end_date={string}`

---

### 6. Cashier Performance Report
`GET /api/reports/cashiers?filter_type={enum}&start_date={string}&end_date={string}`

---

### 7. Payment Method Report
`GET /api/reports/payments?filter_type={enum}&start_date={string}&end_date={string}`

---

## Data Backup & Restore APIs

### 1. Get Backup Storage Summary
`GET /api/backup/summary`

---

### 2. Get Backup History List
`GET /api/backup/history`

---

### 3. Create Database Backup
`POST /api/backup/create`

---

### 4. Validate Backup Archive
`POST /api/backup/validate?backup_name={string}`

---

### 5. Restore Database from Backup
`POST /api/backup/restore`

---

### 6. Upload External Backup File
`POST /api/backup/upload`

---

### 7. Download Backup Archive
`GET /api/backup/download/{backup_name}`

---

### 8. Delete Backup File
`DELETE /api/backup/{backup_name}`

---

## Application Settings APIs

### 1. Get Application Settings
`GET /api/settings`

*Requires active authentication.*

**Response (200 OK)**
```json
{
  "id": 1,
  "cafe_name": "C³ Cafe",
  "owner_name": "Admin Owner",
  "phone_number": "+91 9876543210",
  "email": "contact@c3cafe.com",
  "gst_number": null,
  "address": "123 Coffee Street, Tech Hub, Bengaluru",
  "logo_path": null,
  "receipt_width": "80mm",
  "receipt_footer": "Thank You! Visit Again",
  "currency_symbol": "₹",
  "show_print_count": false,
  "default_backup_format": "ZIP",
  "default_backup_location": "database/backups",
  "auto_backup_on_exit": false,
  "max_backup_count": 30,
  "app_theme": "System",
  "language": "English",
  "timezone": "Asia/Kolkata",
  "date_format": "DD/MM/YYYY",
  "time_format": "12 Hour",
  "opening_time": "08:00",
  "closing_time": "22:00"
}
```

---

### 2. Update Application Settings
`PUT /api/settings`

*Requires Admin role (`ADMIN`).*

**Request Body**
```json
{
  "cafe_name": "Sip Street Cafe",
  "phone_number": "+91 9999988888",
  "receipt_width": "58mm",
  "opening_time": "07:00",
  "closing_time": "23:00"
}
```

---

### 3. Reset Settings to Factory Defaults
`POST /api/settings/reset`

*Requires Admin role (`ADMIN`). Restores all parameters to initial factory default values.*