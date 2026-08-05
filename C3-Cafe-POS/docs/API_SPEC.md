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

*Requires active session (Admin or Cashier).*

**Returns**: Active and available products only (`is_active=True`, `is_available=True`, `category.is_active=True`).

**Response (200 OK)**
```json
[
  {
    "id": 1,
    "category_id": 1,
    "category_name": "Beverages",
    "sku": "PRD000001",
    "name": "Masala Chai",
    "description": "Hot brewed Indian tea with spices",
    "price": "25.00",
    "display_order": 0,
    "product_type": "BEVERAGE",
    "image_path": null,
    "is_available": true,
    "is_active": true,
    "created_at": "2026-08-05T15:00:00Z",
    "updated_at": "2026-08-05T15:00:00Z"
  }
]
```

---

### 2. Create Invoice
`POST /api/billing/invoice`

*Requires active session.*

**Request Body**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "payment_mode": "CASH",
  "amount_received": 100.00,
  "customer_name": "John Doe"
}
```

**Response (201 Created)**
```json
{
  "id": 1,
  "invoice_number": "INV000001",
  "cashier_id": 2,
  "cashier_name": "Default Cashier",
  "customer_name": "John Doe",
  "payment_mode": "CASH",
  "subtotal": "50.00",
  "grand_total": "50.00",
  "amount_received": "100.00",
  "balance_amount": "50.00",
  "status": "COMPLETED",
  "created_at": "2026-08-05T15:20:00Z",
  "items": [
    {
      "id": 1,
      "invoice_id": 1,
      "product_id": 1,
      "product_name": "Masala Chai",
      "unit_price": "25.00",
      "quantity": 2,
      "line_total": "50.00",
      "created_at": "2026-08-05T15:20:00Z"
    }
  ]
}
```

---

### 3. Get Invoice Details
`GET /api/billing/invoices/{id}`

*Requires active session.*

---

### 4. Get Invoice History
`GET /api/billing/history?limit={int}`

*Requires active session.*