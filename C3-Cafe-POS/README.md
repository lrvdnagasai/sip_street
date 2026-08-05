# C³ Cafe POS System

> **C³ = Chai • Coffee • Conversations**

A lightweight offline Point of Sale (POS) application built specifically for **C³ Cafe**, an outdoor café in Hyderabad.

---

# Project Goal

Build a simple, fast, offline POS application that runs on an Android tablet.

The application should allow café staff to:

- Generate bills quickly
- Print receipts using a USB thermal printer
- Manage products
- Track sales
- Track expenses
- View analytics
- Work completely offline

This application is designed specifically for C³ Cafe and is **not intended to become a generic restaurant management system**.

---

# Version

Current Version

**1.0**

---

# Development Philosophy

This project is being developed by a single developer with AI assistance.

Priorities:

- Simplicity
- Maintainability
- Readability
- Modular architecture
- Offline-first
- Fast user experience

Avoid unnecessary complexity.

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Zustand
- TanStack Query

## Backend

- Python
- FastAPI

## Database

- SQLite

## ORM

- SQLAlchemy

## Charts

- Chart.js

## Receipt Printing

- ESC/POS compatible USB Thermal Printer

## Deployment

Progressive Web App (PWA)

## IDE

Visual Studio Code

## Version Control

Git

---

# Target Device

Primary Device

Android Tablet

Requirements

- Landscape Mode
- Touch Friendly UI
- Offline Operation
- USB OTG Support
- USB Thermal Printer

---

# Users

## Admin

Can

- Login
- Billing
- Product Management
- Reports
- Analytics
- Expense Management
- Settings
- Backup
- Restore
- Receipt Reprint

---

## Cashier

Can

- Login
- Generate Bills
- Print Receipts
- Reprint Receipts
- View Dashboard

Cannot

- Edit Products
- Change Settings
- Restore Backup

---

# Version 1.0 Features

## Authentication

- Login
- Logout

---

## Dashboard

Displays

- Today's Sales
- Bills Generated
- Average Bill
- Today's Expenses
- Today's Profit
- Best Selling Item

---

## Billing

Categories

- Tea
- Coffee
- Hot Milk
- Snacks

Functions

- Add Item
- Increase Quantity
- Decrease Quantity
- Remove Item
- Clear Cart

Payment

- Cash
- UPI
- Card

Actions

- Save Bill
- Print Bill

---

## Receipt Printing

USB Thermal Printer

Receipt contains

- Cafe Name
- Bill Number
- Date
- Time
- Items
- Quantity
- Price
- Total
- Payment Method
- Footer Message

---

## Product Management

Admin Only

Functions

- Add Product
- Edit Product
- Disable Product
- Delete Product

---

## Expenses

Functions

- Add Expense
- Edit Expense
- Delete Expense

Categories

- Milk
- Tea Powder
- Coffee Powder
- Sugar
- Gas
- Electricity
- Miscellaneous

---

## Reports

Daily

Weekly

Monthly

Displays

- Revenue
- Expenses
- Profit
- Bills
- Average Bill
- Best Selling Items

---

## Analytics

- Revenue by Category
- Top Selling Products
- Sales by Hour
- Sales Trend

---

## Settings

- Cafe Details
- Receipt Footer
- Printer Settings
- Backup
- Restore

---

## Receipt Reprint

Search by

- Bill Number
- Date

Reprint Receipt

---

# Version 1.0 Exclusions

The following features are intentionally excluded.

- Inventory Management
- Discounts
- Coupons
- Customer Database
- Kitchen Display
- Customer Display
- Cloud Sync
- Multi Branch
- Employee Attendance
- Supplier Management

Do not implement these unless explicitly approved.

---

# Product Categories

Tea

- Regular Tea
- Ginger Tea
- Elaichi Tea
- Green Tea
- Lemon Tea
- Badam Tea

Coffee

- Filter Coffee
- Regular Coffee
- Black Coffee

Hot Milk

- Boost
- Horlicks
- Hot Chocolate

Snacks

- Osmania Biscuit
- Fine Biscuit
- Samosa
- Egg Puff
- Veg Puff
- Muffin

---

# UI Guidelines

Theme

Coffee Brown

Black

Warm White

Accent Gold

Design

- Clean
- Minimal
- Premium
- Large Buttons
- Large Fonts
- Minimal Icons
- Rounded Cards

Landscape Only

---

# Project Structure

```
C3-Cafe-POS/

backend/
frontend/

docs/

tests/

printer/

assets/

README.md
ROADMAP.md
CHANGELOG.md
```

---

# Backend Architecture

FastAPI

```
app/

api/

core/

database/

models/

schemas/

services/

utils/

main.py
```

Guidelines

- Routers should be thin.
- Business logic belongs in Services.
- Database access belongs in Database/Services.
- Keep modules independent.

---

# Frontend Architecture

```
components/

pages/

layouts/

hooks/

services/

store/

assets/
```

Guidelines

- Prefer reusable components.
- Keep business logic outside UI.
- Keep components small.

---

# Database

SQLite

Local database only.

No cloud database.

No internet required.

---

# Coding Standards

Python

- PEP8
- Type Hints
- Small Functions
- Clear Naming

React

- Functional Components
- Hooks
- Reusable Components

General

Readable code is preferred over clever code.

Avoid duplicate logic.

---

# API Standards

REST APIs

Use

- Proper HTTP Status Codes
- Pydantic Validation
- JSON Responses

---

# Logging

Use Python logging.

Log

- Startup
- Shutdown
- Errors
- Important Events

Avoid print() in production code.

---

# Error Handling

Never expose raw exceptions.

Return meaningful messages.

Log internal errors.

---

# Testing

Backend

pytest

Frontend

(Added later)

Every feature should be testable.

---

# Development Workflow

Every task follows the same process.

1. Pick a task from ROADMAP.md
2. Design the solution
3. Implement the feature
4. Test locally
5. Update CHANGELOG.md
6. Commit to Git

One task = One commit.

Example

```
POS-003 Setup FastAPI Backend
```

---

# AI Instructions

AI Coding Agent acts as the implementation engineer.

Before implementing any task:

- Read this README.
- Read ROADMAP.md.
- Understand the current task.
- Only implement the requested task.
- Do not implement future features.
- Do not modify unrelated files.
- Ask questions if requirements are unclear.

After completing a task:

- Explain what changed.
- List modified files.
- Provide testing steps.
- Suggest the next task.

---

# Current Progress

Completed

- POS-001 Create Project Structure
- POS-002 Create Git Repository
- POS-003 Setup FastAPI Backend
- POS-004 Setup React + Vite
- POS-005 Setup SQLite & SQLAlchemy
- POS-006 Authentication & Role Authorization
- POS-007 Category Management
- POS-008 Application Layout & Shell
- POS-009 Database Seeder
- POS-010 Product Management
- POS-011 Billing Terminal
- POS-012 Receipt Generation & Printing
- POS-012.1 Receipt Print Audit & Tracking
- POS-013 Business Performance Dashboard
- POS-014 Expense Management
- POS-015 Reports & Business Intelligence
- POS-016 Data Backup & Restore
- POS-017 Application & Business Settings
- POS-018 Production Readiness, UI Polish & Performance (v1.0 Ready)

---

# Future Versions

Version 1.1

- Inventory
- Discounts

Version 1.2

- Customer Database
- Loyalty Program

Version 2.0

- Cloud Sync
- Kitchen Display
- Customer Display
- Multi Branch

---

# Notes

This project is intentionally simple.

Every design decision should prioritize:

- Speed
- Simplicity
- Offline operation
- Easy maintenance
- Excellent user experience

When in doubt, choose the simpler solution.