

# IP Workflow Tracker — Frontend

A React + TypeScript dashboard for managing intellectual property applications (patents, trademarks, copyrights, recordations, renewals) through a structured review workflow.

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Application Pages](#application-pages)
6. [Workflow & State Machine](#workflow--state-machine)
7. [Design System](#design-system)
8. [Authentication](#authentication)
9. [Theming (Light & Dark Mode)](#theming)
10. [Keyboard Shortcuts](#keyboard-shortcuts)
11. [Backend Integration](#backend-integration)

---

## Overview

The IP Workflow Tracker digitizes the lifecycle of an intellectual property application — from draft creation to final approval or rejection — replacing paper forms, email chains, and spreadsheets with a single source of truth.

**Core concept:** Each application is a state machine. It moves through defined stages (`DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED / NEED_MORE_INFO`) and the system enforces which transitions are legal at any point.

### Roles

- **Applicant** — creates and submits applications, responds to "Need More Info" requests.
- **Reviewer** — reviews submitted applications and renders decisions.
- **Admin** — manages team, settings, and has full visibility.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS (CSS-variable driven theming) |
| Charts | recharts |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Icons | lucide-react |
| Toasts | sonner |
| Motion | framer-motion (restrained; modals and drawers only) |

---

## Project Structure

```
src/
├── App.tsx                      # Router, providers, global modals
├── index.css                    # Tailwind imports, CSS variables (light/dark tokens)
├── tailwind.config.js           # Color tokens wired to CSS variables
│
├── api/                         # ALL data fetching lives here (no fetch in components)
│   ├── apiClient.js             # Centralized fetch wrapper, base URL, headers, errors
│   ├── applicationsApi.js       # Application CRUD + workflow actions
│   ├── dashboardApi.js          # Stats, trends, distribution
│   ├── settingsApi.js           # Profile, security, notifications, team
│   ├── authApi.js               # Login, logout, current user
│   └── mockData.js              # In-memory mock dataset (replace with backend)
│
├── context/
│   ├── AuthContext.tsx          # User session, login/logout, localStorage persistence
│   └── ThemeContext.tsx         # Light/dark theme, localStorage persistence
│
├── components/
│   ├── auth/ProtectedRoute.tsx
│   ├── layout/                  # AppLayout, Sidebar, Header
│   ├── ui/                      # Button, Card, Input, Modal, StatusBadge, Tooltip, …
│   ├── dashboard/               # StatsRow, TrendsChart, StatusDonut, RecentApplicationsTable
│   ├── applications/            # Table, FilterBar, Form, DetailHeader, Timeline, Modal
│   └── settings/                # 5 setting tabs
│
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ApplicationsListPage.tsx
│   ├── ApplicationDetailPage.tsx
│   ├── ApplicationCreatePage.tsx
│   ├── ApplicationEditPage.tsx
│   ├── KanbanPage.tsx
│   ├── SettingsPage.tsx
│   └── DocsPage.tsx
│
├── lib/
│   ├── statusUtils.ts           # Status labels, colors, transitions, action buttons
│   └── formatters.ts            # Date and relative-time formatting
│
└── types/
    └── application.ts           # Application, Status enum, ApplicationType enum, ActivityLogEntry
```

### Centralized API Architecture

**All HTTP calls must go through `src/api/`.** Components import named functions from the domain-specific files (e.g. `getApplications`, `submitApplication`) — they never call `fetch` directly. This keeps:

- Auth headers, base URL, and error handling in one place (`apiClient.js`)
- Easy swap from mock to real backend (only the api/ files change)
- Testable, type-safe data layer

---

## Getting Started

```bash
npm install
npm run dev
```

Default login: **any email + any password** (mock auth). Real backend integration is described in `API_INTEGRATION.md`.

---

## Application Pages

### `/login` — Login Page
Centered card with email, password, remember-me, and forgot password placeholder. Redirects to the page the user originally tried to visit, or `/dashboard`.

### `/dashboard` — Dashboard
- 4 stat cards: Total Applications, Pending Review, Approved This Month, Rejected This Month (with month-over-month deltas)
- Application trends bar chart (7d / 30d / 90d toggle)
- Status distribution donut chart
- Recent applications table (last 5)
- Quick actions: New Application, View All Applications

### `/applications` — Applications List
- Full table: Tracking Number, Applicant Name, Company Name, Type, Status, Created Date
- Filter bar: status dropdown + search by name/tracking number
- Pagination (10 per page)
- Click row to view details

### `/applications/:id` — Application Detail
- Tracking number (monospace) + status badge in header
- Action buttons that vary by status (see [Workflow](#workflow--state-machine))
- Two-column layout:
  - Left: Application Details (label/value grid) + Reviewer Decision card (if reviewed)
  - Right: Activity Timeline (vertical, dotted)

### `/applications/create` and `/applications/:id/edit`
- Form: Applicant Name, Email, Company, Type, Description
- Inline validation, character count on description
- Edit is blocked unless status is `DRAFT` or `NEED_MORE_INFO`

### `/kanban` — Kanban Board
- 6 columns (one per status)
- Drag cards between columns to update status
- Invalid transitions blocked with warning toast
- Eye icon on each card → opens detail page
- Optimistic update with rollback on API failure

### `/settings` — Settings
Five tabs:
1. **Profile** — name, email, avatar
2. **Security** — change password, 2FA toggle, active sessions
3. **Notifications** — email/push toggles, digest frequency
4. **Application Settings** — default type, auto-assign, comment required
5. **Team** — team members table with role badges

### `/docs` — User Guide
Step-by-step instructions for end users. (Developer API docs live in `API_INTEGRATION.md`.)

---

## Workflow & State Machine

### Statuses

| Status | Meaning |
|--------|---------|
| `DRAFT` | Editable, not yet submitted |
| `SUBMITTED` | In queue, waiting for reviewer |
| `UNDER_REVIEW` | Reviewer is examining |
| `NEED_MORE_INFO` | Reviewer requested changes; applicant can edit |
| `APPROVED` | Terminal — finalized success |
| `REJECTED` | Terminal — finalized rejection |

### Allowed Transitions

```
DRAFT          → SUBMITTED
SUBMITTED      → UNDER_REVIEW
SUBMITTED      → DRAFT                (via Withdraw)
UNDER_REVIEW   → APPROVED | REJECTED | NEED_MORE_INFO
NEED_MORE_INFO → SUBMITTED            (via Resubmit, after edit)
APPROVED       → (terminal, locked)
REJECTED       → (terminal, locked)
```

These rules live in `lib/statusUtils.ts` as `allowedTransitions` and are enforced by:
- Action buttons (only legal actions are rendered)
- Kanban drag-and-drop (illegal drops show a toast and revert)
- Edit page (redirects with error if status is not `DRAFT` or `NEED_MORE_INFO`)
- The backend MUST also enforce these rules — see `API_INTEGRATION.md`.

### Actions by Status

| Status | Available Actions |
|--------|-------------------|
| DRAFT | Edit, Submit, Delete |
| SUBMITTED | Start Review, Withdraw |
| UNDER_REVIEW | Approve, Reject (comment required), Need More Info (comment required) |
| NEED_MORE_INFO | Edit, Resubmit |
| APPROVED / REJECTED | View only |

---

## Design System

### Constraints (intentional, do not violate)
- **Border radius:** max 4px anywhere
- **Shadows:** none, or `shadow-sm` only for modals
- **Colors:** single accent (`#2563EB`), neutral grays, status colors
- **No gradients**
- **Badges:** square or `rounded-sm` with tinted bg + border (not solid pills)

### Color Tokens (CSS variables in `index.css`)

| Token | Light | Dark |
|-------|-------|------|
| `--accent` | `#2563EB` | `#2563EB` |
| `--text-primary` | `#111827` | `#F9FAFB` |
| `--text-secondary` | `#6B7280` | `#9CA3AF` |
| `--page` | `#F9FAFB` | `#0B0F17` |
| `--card-bg` | `#FFFFFF` | `#111827` |
| `--border-color` | `#E5E7EB` | `#1F2937` |
| `--success` | `#22C55E` | `#22C55E` |
| `--error` | `#EF4444` | `#EF4444` |

Tailwind utility classes (`bg-page`, `text-text-primary`, `border-border-color`, etc.) automatically swap when the `dark` class is toggled on `<html>`.

### Status Colors

| Status | Color |
|--------|-------|
| Draft | gray (`#6B7280`) |
| Submitted | blue (`#3B82F6`) |
| Under Review | yellow (`#EAB308`) |
| Need More Info | orange (`#F97316`) |
| Approved | green (`#22C55E`) |
| Rejected | red (`#EF4444`) |

---

## Authentication

`AuthContext` (`src/context/AuthContext.tsx`) holds the current user and exposes `login()`, `logout()`, `isAuthenticated`. Sessions are persisted to `localStorage` when "Remember Me" is checked.

`ProtectedRoute` wraps every authenticated route. Unauthenticated users are redirected to `/login` with the original destination stored in `location.state.from`.

The mock implementation accepts any non-empty email/password. See `API_INTEGRATION.md` for replacing this with a real backend (JWT, session cookies, etc.).

---

## Theming

`ThemeContext` (`src/context/ThemeContext.tsx`) controls `'light' | 'dark'`, persisted in `localStorage`. The default on first visit is **light**. Toggle via the sun/moon icon in the header.

Toggling adds/removes the `dark` class on `<html>`, which swaps the CSS variables. All Tailwind classes that reference these tokens update automatically.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Create new application |
| `/` | Focus search bar |
| `?` | Show keyboard shortcuts help |

Shortcuts are ignored when typing in inputs/textareas.

---

## Backend Integration

This frontend ships with mock data in `api/mockData.js`. To wire it to a real backend, only the files in `src/api/` need to change. See **`API_INTEGRATION.md`** for the complete backend contract: endpoint shapes, request/response payloads, data models, workflow validation rules, and a recommended Django/Django Ninja implementation.

