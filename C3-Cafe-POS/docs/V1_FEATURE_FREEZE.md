# C³ Cafe POS System
# Version 1.0 Feature Freeze

**Project Status:** Frozen for Version 1.0

**Purpose**

This document defines the exact scope of Version 1.0 of the C³ Cafe POS System.

Any feature not listed under "Included Features" will NOT be implemented in Version 1.0.

New ideas should be documented separately for Version 1.1 or Version 2.0.

---

# Project Vision

Build a lightweight, offline-first Point of Sale (POS) system for a Coffee & Tea Cafe that runs locally on an Android tablet and provides a fast, simple, and reliable billing experience.

The application should require minimal training and allow a cashier to generate bills in a few taps.

---

# Target Hardware

## Primary Device

Android Tablet

Landscape Mode

10–12 inch display

---

## Printer

USB Thermal Receipt Printer

58mm or 80mm paper

---

## Deployment

Offline

Local SQLite Database

No internet required

---

# User Roles

Only two roles will exist.

## Admin

Permissions

- Login
- Dashboard
- Billing
- Product Management
- Category Management
- Expense Management
- Reports
- User Management
- Settings
- Backup & Restore
- Receipt Reprint

---

## Cashier

Permissions

- Login
- Billing
- Dashboard
- Receipt Reprint

Cashier cannot

- Delete Products
- Edit Products
- Manage Users
- Change Settings
- View Financial Reports
- Restore Backup

---

# Included Features

## Authentication

- Local Login
- Username & Password
- BCrypt Password Hashing
- Role Based Access

---

## Dashboard

- Today's Sales
- Weekly Sales
- Monthly Sales
- Total Bills
- Average Bill Value
- Top Selling Products

---

## Billing

- Quick Billing
- Product Search
- Category Tabs
- Quantity Modification
- Discount
- Order Notes
- Receipt Generation
- Receipt Reprint
- Cash Payment

---

## Product Management

- Categories
- Products
- Enable/Disable Product
- Product Price
- Product Image (Optional)

---

## Category Management

- Add Category
- Edit Category
- Disable Category

Categories are dynamic.

They are NOT hardcoded.

---

## Receipt Printing

- USB Thermal Printer
- Cafe Logo
- Bill Number
- Date & Time
- Item List
- Quantity
- Price
- Total
- Footer Message

---

## Reports

- Daily Sales
- Weekly Sales
- Monthly Sales
- Product-wise Sales
- Category-wise Sales
- Hour-wise Sales

---

## Expense Management

- Add Expense
- Edit Expense
- Expense Categories
- Daily Expense Report

---

## User Management

Admin only

- Create User
- Edit User
- Disable User
- Reset Password

---

## Settings

- Cafe Name
- Address
- Phone Number
- Receipt Footer
- Currency
- Printer Settings

---

## Backup

- Manual Backup
- Manual Restore

SQLite Database Backup

---

# Technical Stack

Backend

- FastAPI
- SQLAlchemy
- SQLite
- Alembic

Frontend

- React
- Vite
- Tailwind CSS
- Zustand
- Axios

---

# Security

- BCrypt Password Hashing
- Role Based Authorization
- Input Validation
- SQLAlchemy ORM
- No Plain Text Passwords

---

# Performance Goals

Application Startup

< 5 seconds

Bill Generation

< 2 seconds

Receipt Printing

< 3 seconds

Search

Instant

---

# Database

SQLite

Single Local Database

No Cloud Database

---

# Out of Scope (Version 1.0)

The following features are intentionally excluded.

## Inventory Management

- Stock
- Purchase Orders
- Vendors
- Low Stock Alerts
- Inventory Tracking

---

## Customer Management

- Customer Profiles
- Loyalty Program
- Membership
- Reward Points
- Wallet

---

## Online Features

- Cloud Sync
- Multi-device Sync
- Online Ordering
- Food Delivery Integration
- Payment Gateway
- QR Ordering

---

## Multi Branch

- Multiple Shops
- Centralized Database
- Branch Reports

---

## Advanced Billing

- GST Invoice
- Split Bills
- Table Management
- Kitchen Display System (KDS)
- Customer Display System (CDS)

---

## Advanced Analytics

- AI Sales Prediction
- Demand Forecasting
- Employee Productivity Analytics

---

## Notifications

- SMS
- Email
- WhatsApp

---

## Mobile Apps

- Customer Mobile App
- Delivery App

---

## Integrations

- Tally
- Zoho Books
- SAP
- Razorpay
- PhonePe
- Google Pay API

---

# Version 1.1 Candidates

Future enhancements

- Inventory
- Barcode Scanner
- QR Code Menu
- UPI QR Payment Tracking
- GST Billing
- Loyalty Program
- Cloud Backup
- Kitchen Display System
- Customer Display Screen
- Multiple Branches
- Mobile Dashboard

---

# Development Principles

1. Keep the UI simple.

2. Minimize the number of clicks.

3. Optimize for speed.

4. Design for tablet landscape mode.

5. Offline-first architecture.

6. Modular backend.

7. Modular frontend.

8. Production-ready code.

9. Test every completed task.

10. No feature creep during Version 1.0.

---
# User Experience Principles

The POS should feel fast and effortless.

- Maximum 3 taps to generate a regular bill.
- Large touch-friendly buttons for tablet use.
- High-contrast UI for indoor and outdoor lighting.
- Consistent color theme inspired by coffee and tea.
- Responsive layout optimized for 10–12 inch tablets.
- Every screen should prioritize speed over visual complexity.
- Avoid unnecessary popups and confirmation dialogs.
- Frequently used actions should always be immediately accessible.

---


# Definition of Version 1.0 Complete

Version 1.0 is complete when:

- User can login.
- Products can be managed.
- Categories can be managed.
- Bills can be generated.
- Receipts can be printed.
- Expenses can be managed.
- Reports are available.
- Backup and Restore work.
- Admin and Cashier permissions work.
- The application runs completely offline.
- The system is stable enough for daily cafe operations.

No additional features will be added before Version 1.0 is complete.

Any new ideas will be scheduled for Version 1.1.