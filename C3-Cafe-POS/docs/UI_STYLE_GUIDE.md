# C³ Cafe POS
# UI Style Guide
Version 1.0

---

# Purpose

This document defines the visual design language for the C³ Cafe POS System.

All future frontend modules must follow this guide.

Goals

- Simple
- Fast
- Modern
- Minimal
- Tablet First
- Consistent

The application is optimized for a 10–12 inch Android tablet in Landscape Mode.

---

# Design Philosophy

The UI should feel like a premium coffee shop.

Inspired by

- Coffee
- Tea
- Wood
- Warm lighting
- Clean café interiors

Avoid excessive animations and unnecessary visual clutter.

The interface should prioritize speed and readability.

---

# Color Palette

## Primary

Coffee Brown

#5C3A21

Used for

- Header
- Sidebar
- Primary Buttons

---

## Background

Warm White

#F8F5F2

Used for

- Page Background
- Cards

---

## Accent

Cafe Gold

#C89B3C

Used for

- Highlights
- Active Menu
- Focus States

---

## Dark

Cafe Dark

#2E2E2E

Used for

- Text
- Icons

---

## Success

#2E7D32

Used for

- Success Messages
- Available Status

---

## Error

#C62828

Used for

- Validation Errors
- Delete Actions

---

## Warning

#F9A825

Used for

- Warnings

---

## Info

#1565C0

Used for

- Information

---

# Typography

Heading

24px

Bold

---

Sub Heading

18px

Semi Bold

---

Body

16px

Regular

---

Caption

13px

Regular

---

Buttons

16px

Semi Bold

---

# Layout

Landscape First

Sidebar

Fixed Width

240px

Header

64px Height

Footer

40px Height

Content

Scrollable

Padding

24px

Gap

16px

---

# Cards

Border Radius

12px

Padding

20px

Background

White

Shadow

Light

Spacing

16px

---

# Buttons

Primary

Coffee Brown

White Text

---

Secondary

White

Coffee Brown Border

Coffee Brown Text

---

Danger

Red

White Text

---

Disabled

Light Gray

No Shadow

---

Button Height

48px Minimum

Border Radius

10px

---

# Inputs

Height

48px

Border Radius

10px

Padding

12px

Font Size

16px

Focus

Accent Gold Border

---

# Sidebar

Width

240px

Fixed

Always Visible

No Collapse

No Hamburger Menu

---

Menu Item Height

52px

---

Active Item

Coffee Brown Background

Accent Gold Indicator

White Text

---

Inactive Item

Dark Text

Hover

Light Coffee Background

---

# Header

Height

64px

Contains

- Cafe Name
- Logged User
- User Role
- Logout Button

Always Visible

---

# Footer

Height

40px

Contains

- Version
- Offline Status

Always Visible

---

# Tables

Header

Coffee Brown

White Text

---

Row Height

52px

---

Actions

Edit

Delete

View

Always Right Aligned

---

Pagination

Bottom Right

---

# Forms

Label

Above Input

Required

Marked *

Spacing

16px

---

Maximum Width

600px

Centered

---

# Search

Always Visible

Top Right

Instant Search

---

# Dialogs

Border Radius

12px

Primary Action

Right Side

Danger Actions

Red Button

---

# Toast Notifications

Success

Green

Error

Red

Warning

Yellow

Info

Blue

Duration

3 Seconds

Top Right

---

# Empty States

Every page without data should display

- Simple Illustration/Icon
- Friendly Message
- Primary Action Button

Example

"No products available"

Button

"Add Product"

---

# Loading

Use one consistent loading component.

Centered.

Minimal.

No heavy animations.

---

# Icons

Use Lucide React Icons.

Icon Size

20px

Sidebar

22px

Buttons

18px

Tables

18px

---

# Dashboard Cards (Future)

Border Radius

12px

Large Number

Medium Title

Small Trend Indicator

---

# Responsive Rules

Primary Target

1280 × 800

Secondary

1920 × 1080

Do not optimize for mobile portrait.

Landscape only.

---

# Accessibility

Minimum touch target

48px

High Contrast

Readable Fonts

Keyboard Friendly

Visible Focus States

---

# UX Principles

Maximum 3 taps for common actions.

Frequently used actions should always be visible.

Avoid nested menus.

Avoid unnecessary popups.

Avoid hidden actions.

Keep screens clean.

---

# Animation

Minimal.

Fade only.

Duration

200ms

Avoid complex transitions.

---

# Consistency Rules

Every page should include

- Header
- Sidebar
- Footer

Every page should have

- Page Title
- Optional Subtitle
- Main Content

Buttons

Always same size.

Inputs

Always same style.

Tables

Always same layout.

Cards

Always same spacing.

---

# Future Modules

Every future screen must follow this guide.

Including

- Categories
- Products
- Billing
- Dashboard
- Reports
- Expenses
- Settings

No module should introduce its own design language.

---

# Definition of Good UI

The interface should feel

- Fast
- Premium
- Comfortable
- Professional

The cashier should be able to complete common tasks quickly with minimal training.

Consistency is more important than visual complexity.