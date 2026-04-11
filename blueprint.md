# Animal Welfare Certified Farm Inspection System (AWCFIS)

## Overview
A web-based platform for managing and conducting animal welfare inspections for farms. The system supports three distinct roles: Administrator, Inspector, and Farm Owner, each with specific workflows.

## Features & Roles
### 1. Administrator
- **User Management**: Grant 'Inspector' or 'Farm Owner' permissions to accounts.
- **Inspection Item Management**: Register and edit the criteria for farm inspections (categories, descriptions, max scores).
- **Dashboard**: Overview of registered farms and inspection statuses.

### 2. Inspector
- **Conduct Inspection**: Access the official checklist registered by the Admin.
- **Scoring**: Assign scores, pass/fail status, and add comments for each item.
- **Final Submission**: Submit the official report to the system.

### 3. Farm Owner
- **Self-Assessment (Virtual Scoring)**: Use the same official criteria to perform mock inspections.
- **Compliance Check**: Identify areas for improvement based on the criteria before official inspections.

## Technical Stack
- **HTML5**: Multi-page structure for clear separation of concerns.
- **CSS3**: Modern Baseline features (Container Queries, `:has()`, Flexbox/Grid).
- **JavaScript (ES Modules)**: Modular logic for storage, UI, and business rules.
- **Persistence**: `localStorage` for data retention across sessions.
- **Web Components**: Reusable `app-header` and `app-footer` for consistent navigation.

## Design System
- **Color Palette**: 
  - Primary: `#2e7d32` (Forest Green)
  - Secondary: `#f1f8e9` (Light Mint)
  - Accent: `#ff9800` (Amber for warnings/notices)
- **Typography**: Clean, readable sans-serif (Inter/Roboto).
- **Icons**: SVG-based iconography for categories.

## Implementation Details
### 1. Style & Design
- Responsive layouts for mobile and desktop.
- High contrast and accessible UI (A11Y).
- "Nature-inspired" visual aesthetic.

### 2. Current Implementation Plan
- [x] Create `blueprint.md`.
- [x] Create `style.css` with a nature-inspired design system.
- [x] Implement `js/storage.js` for CRUD operations.
- [x] Build the Gateway (`index.html`) and Shared Header Web Component.
- [x] Build the Admin Dashboard (`admin.html`) with management forms.
- [x] Build the Inspector Interface (`inspector.html`) with scoring logic.
- [x] Build the Farm Owner Interface (`owner.html`) for virtual scoring.
- [x] Verify all functionalities and responsive design.
- [x] Deploy via `git push`.
