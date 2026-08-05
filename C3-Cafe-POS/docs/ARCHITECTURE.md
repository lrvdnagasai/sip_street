# C³ Cafe POS
# Software Architecture
Version 1.0

---

# Purpose

This document defines the software architecture of the C³ Cafe POS System.

All future development must follow this architecture.

Goals

- Simple
- Modular
- Maintainable
- Offline First
- Scalable

---

# Architecture Overview

The application follows a layered architecture.

```

```
React UI

↓

Zustand Store

↓

Services

↓

Axios

↓

FastAPI REST API

↓

Business Services

↓

SQLAlchemy ORM

↓

SQLite Database

```

Each layer has a single responsibility.

---

# High Level Modules

Frontend

- Authentication
- Categories
- Products
- Billing
- Dashboard
- Reports
- Expenses
- Settings

Backend

- Authentication
- User Management
- Category Management
- Product Management
- Billing
- Reports
- Expenses
- Backup

Database

SQLite

---

# Backend Architecture

```

API

↓

Schemas

↓

Services

↓

Models

↓

Database

```

Responsibilities

API

Receives HTTP requests.

No business logic.

Only

- Validation
- Response formatting

---

Schemas

Pydantic request/response models.

No business logic.

---

Services

Contains all business logic.

Examples

- Billing calculations
- Product validation
- Authentication

No SQL inside API routes.

---

Models

SQLAlchemy models.

Only database representation.

---

Database

SQLite

SQLAlchemy

Alembic

---

# Frontend Architecture

```

Pages

↓

Components

↓

Store (Zustand)

↓

Services

↓

Backend API

```

Responsibilities

Pages

Application screens.

No API calls.

---

Components

Reusable UI.

No business logic.

---

Store

Application state.

Authentication.

Current User.

Future Cart State.

---

Services

Axios communication.

Only HTTP requests.

---

# Folder Structure

```

backend/

app/

api/

models/

schemas/

services/

database/

core/

frontend/

src/

components/

layouts/

pages/

services/

store/

features/

hooks/

utils/

```

---

# Routing

Public

/login

Protected

/

Dashboard

Categories

Products

Billing

Reports

Expenses

Settings

Protected routes always use

ProtectedRoute

Never duplicate authentication checks.

---

# Authentication Flow

```

Login Page

↓

POST /api/auth/login

↓

Backend Verification

↓

Session Cookie

↓

GET /api/auth/me

↓

Authenticated User

↓

ProtectedRoute

↓

Application

```

---

# Authorization

Roles

ADMIN

CASHIER

Permissions handled centrally.

Never hardcode permissions inside pages.

---

# State Management

Zustand

Stores

- User
- Authentication
- Loading

Future

- Cart
- Billing
- Settings

Do not duplicate state.

---

# API Design Principles

REST

JSON

Consistent responses.

HTTP status codes.

Validation using Pydantic.

No SQL in routes.

---

# Database Principles

SQLite

SQLAlchemy ORM

Alembic

Every table should include

- id
- created_at
- updated_at
- is_active (where appropriate)

Use relationships.

Avoid duplicate data.

---

# Error Handling

Frontend

Friendly messages.

Backend

Meaningful HTTP status codes.

Never expose stack traces.

---

# Logging

Backend logs

- Startup
- Shutdown
- Login
- Logout
- Errors

Never log

- Passwords
- Tokens
- Secrets

---

# Security

BCrypt

Role based authorization.

Parameterized queries.

No plain text passwords.

Session authentication.

---

# Coding Standards

Backend

- Type hints
- Small functions
- One responsibility per function
- Business logic inside services

Frontend

- Functional components
- Reusable components
- No duplicated code
- Keep components small

---

# Development Workflow

Every task follows

Requirements

↓

Implementation

↓

Build

↓

Automated Tests

↓

Manual Verification

↓

Approval

↓

Git Commit

↓

Next Task

Never skip testing.

---

# Git Strategy

One commit per POS task.

Example

```

POS-009: Category Management

```

Tag major milestones.

Example

```

v0.1-foundation

```

---

# AI Development Workflow

Before every implementation

Read

- README.md
- V1_FEATURE_FREEZE.md
- API_SPEC.md
- UI_STYLE_GUIDE.md
- ARCHITECTURE.md

Implement only the requested POS task.

Do not implement future tasks.

Do not change existing architecture unless explicitly requested.

---

# Design Principles

Keep it simple.

Build reusable components.

Avoid premature optimization.

Prefer clarity over cleverness.

Keep Version 1.0 focused.

---

# Future Expansion

The architecture should support future additions without major redesign.

Possible future versions

- Inventory
- GST Billing
- QR Ordering
- Cloud Sync
- Multi-Branch
- Customer Loyalty

These should extend the current architecture rather than replace it.

---

# Definition of Good Architecture

A new developer should be able to understand the project within 30 minutes.

Adding a new feature should require minimal changes to existing code.

Business logic should exist in exactly one place.

UI should remain consistent.

The application should remain modular, testable, and maintainable.