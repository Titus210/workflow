

# API Integration Guide

This document specifies **exactly** what the backend must provide for the IP Workflow Tracker frontend to work. It is the contract between frontend and backend.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication](#authentication)
3. [Data Models](#data-models)
4. [Workflow State Machine](#workflow-state-machine)
5. [API Endpoints](#api-endpoints)
   - [Auth](#auth-endpoints)
   - [Applications](#application-endpoints)
   - [Dashboard](#dashboard-endpoints)
   - [Settings](#settings-endpoints)
6. [Backend Validation Rules](#backend-validation-rules)
7. [Error Format](#error-format)
8. [Recommended Stack: Django + Django Ninja](#recommended-stack-django--django-ninja)
9. [Frontend API Layer](#frontend-api-layer)

---

## Architecture

```
┌─────────────────────────┐         ┌────────────────────────┐
│   React Frontend         │         │   Django Backend        │
│                          │         │                         │
│   src/api/apiClient.js   │ ◄─────► │   /api/v1/...          │
│   ├── applicationsApi    │  HTTPS  │   Django Ninja routers  │
│   ├── dashboardApi       │  JSON   │   ├── applications.py   │
│   ├── settingsApi        │         │   ├── dashboard.py      │
│   └── authApi            │         │   ├── settings.py       │
│                          │         │   └── auth.py           │
└─────────────────────────┘         └────────────────────────┘
```

### Principles
- **One base URL** configured in `apiClient.js` (`VITE_API_URL` env var)
- **JSON in, JSON out** — no form-encoded bodies
- **JWT bearer token** in `Authorization` header (or session cookie — pick one)
- **ISO-8601 timestamps** everywhere (UTC, `Z` suffix)
- **Workflow rules enforced on the backend** — never trust the client

---

## Authentication

### Method: JWT Bearer Token (recommended)

1. `POST /api/v1/auth/login/` with `{ email, password }` → returns `{ user, token, refreshToken }`
2. Frontend stores token (in memory or localStorage if "Remember Me")
3. Every subsequent request includes `Authorization: Bearer <token>`
4. Token expiry: 1 hour. Refresh token expiry: 30 days.

### Alternative: Session Cookies
If using Django session auth, ensure `credentials: 'include'` on fetch and configure CORS with `Access-Control-Allow-Credentials: true`.

---

## Data Models

### Status (Enum)
```
DRAFT
SUBMITTED
UNDER_REVIEW
NEED_MORE_INFO
APPROVED
REJECTED
```

### ApplicationType (Enum)
```
Recordation
Renewal
Change of Ownership
Change of Name
Discontinuation
```

### User
```typescript
{
  id: string;           // UUID
  name: string;
  email: string;
  role: "Admin" | "Reviewer" | "Applicant";
  avatar: string | null; // URL or null
  createdAt: string;     // ISO-8601
  lastActive: string;    // ISO-8601
}
```

### Application
```typescript
{
  id: string;                // UUID, server-generated
  trackingNumber: string;    // e.g. "APP-20240520-ABC123", server-generated, unique
  applicantName: string;     // required, max 200 chars
  applicantEmail: string;    // required, validated email
  companyName: string;       // required, max 200 chars
  applicationType: ApplicationType;
  description: string;       // required, max 1000 chars
  status: Status;            // server-controlled — clients cannot set this directly
  createdAt: string;         // ISO-8601, auto
  updatedAt: string;         // ISO-8601, auto
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;        // User name
  reviewerComment: string | null;
  reviewerDecision: "APPROVED" | "REJECTED" | "NEED_MORE_INFO" | null;
}
```

### ActivityLogEntry
```typescript
{
  id: string;
  applicationId: string;
  status: Status;        // status the application moved TO
  timestamp: string;     // ISO-8601
  user: string;          // name of the user who made the change
  comment: string | null;
}
```

### DashboardStats
```typescript
{
  totalApplications: number;
  pendingReview: number;         // count of SUBMITTED + UNDER_REVIEW
  approvedThisMonth: number;
  rejectedThisMonth: number;
  totalDelta: string;            // e.g. "+12%"
  pendingDelta: string;
  approvedDelta: string;
  rejectedDelta: string;
}
```

### TrendDataPoint
```typescript
{
  date: string;   // YYYY-MM-DD
  count: number;  // number of applications created that day
}
```

### NotificationPrefs
```typescript
{
  emailNotifications: boolean;
  pushNotifications: boolean;
  digestFrequency: "daily" | "weekly" | "never";
}
```

### AppSettings
```typescript
{
  defaultApplicationType: ApplicationType;
  autoAssignReviewer: boolean;
  commentRequired: boolean;
}
```

---

## Workflow State Machine

The backend MUST enforce these rules. The frontend enforces them too for UX, but the backend is the source of truth.

### Allowed Transitions

| From | Allowed To | Endpoint |
|------|-----------|----------|
| `DRAFT` | `SUBMITTED` | `POST /applications/{id}/submit/` |
| `DRAFT` | (deleted) | `DELETE /applications/{id}/` |
| `SUBMITTED` | `UNDER_REVIEW` | `POST /applications/{id}/start-review/` |
| `SUBMITTED` | `DRAFT` | `POST /applications/{id}/withdraw/` |
| `UNDER_REVIEW` | `APPROVED` / `REJECTED` / `NEED_MORE_INFO` | `POST /applications/{id}/decision/` |
| `NEED_MORE_INFO` | `SUBMITTED` | `POST /applications/{id}/submit/` |
| `APPROVED` | — | (terminal) |
| `REJECTED` | — | (terminal) |

### Edit Permissions
Applications may only be edited (`PUT /applications/{id}/`) when status is `DRAFT` or `NEED_MORE_INFO`. Any other status returns `403 Forbidden`.

### Comment Requirements
- `decision = REJECTED` → comment REQUIRED (non-empty)
- `decision = NEED_MORE_INFO` → comment REQUIRED (non-empty)
- `decision = APPROVED` → comment optional

---

## API Endpoints

Base URL: `/api/v1`

All responses are JSON. All timestamps are ISO-8601 UTC.

### Auth Endpoints

#### `POST /auth/login/`
**Request:**
```json
{ "email": "user@example.com", "password": "..." }
```
**Response 200:**
```json
{
  "user": { "id": "...", "name": "Alex Morgan", "email": "...", "role": "Admin" },
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```
**Errors:** `401` invalid credentials

#### `POST /auth/logout/`
Invalidates the current token. Response `204`.

#### `GET /auth/me/`
Returns the current user (based on Auth header). Response 200 returns `User`.

---

### Application Endpoints

#### `GET /applications/`
Query params: `status`, `search`, `page` (default 1), `pageSize` (default 10).

**Response 200:**
```json
{
  "data": [ /* Application[] */ ],
  "total": 47,
  "page": 1,
  "pageSize": 10
}
```

#### `GET /applications/{id}/`
**Response 200:** `Application`. **404** if not found.

#### `POST /applications/`
Create a new draft. The server assigns `id`, `trackingNumber`, `status = DRAFT`, `createdAt`.

**Request:**
```json
{
  "applicantName": "Sarah Johnson",
  "applicantEmail": "sarah@acme.com",
  "companyName": "Acme Corporation",
  "applicationType": "Recordation",
  "description": "..."
}
```
**Response 201:** the new `Application`.

#### `PUT /applications/{id}/`
Update an existing application. Allowed ONLY if status is `DRAFT` or `NEED_MORE_INFO`.

**Request:** same shape as POST (partial allowed).
**Response 200:** updated `Application`.
**Errors:** `403` if status is locked.

#### `DELETE /applications/{id}/`
Delete a draft. Allowed ONLY if status is `DRAFT`.
**Response 204.** **Errors:** `403` if not in `DRAFT`.

#### `POST /applications/{id}/submit/`
Transitions: `DRAFT → SUBMITTED` or `NEED_MORE_INFO → SUBMITTED`. Sets `submittedAt`. Appends activity log entry.

**Request:** empty body.
**Response 200:** updated `Application`.
**Errors:** `409` if invalid transition.

#### `POST /applications/{id}/start-review/`
Transition: `SUBMITTED → UNDER_REVIEW`. Appends activity log entry with the reviewer's name.

**Request:** empty body.
**Response 200:** updated `Application`.
**Errors:** `409` if not in `SUBMITTED`. `403` if user is not a Reviewer.

#### `POST /applications/{id}/withdraw/`
Transition: `SUBMITTED → DRAFT`.

**Request:** empty body.
**Response 200:** updated `Application`.
**Errors:** `409` if not in `SUBMITTED`.

#### `POST /applications/{id}/decision/`
Transition: `UNDER_REVIEW → APPROVED | REJECTED | NEED_MORE_INFO`. Sets `reviewedAt`, `reviewedBy`, `reviewerComment`, `reviewerDecision`.

**Request:**
```json
{
  "decision": "REJECTED",
  "comment": "Missing critical documentation."
}
```
**Response 200:** updated `Application`.
**Errors:**
- `400` if `decision` is `REJECTED` or `NEED_MORE_INFO` without comment
- `409` if not in `UNDER_REVIEW`
- `403` if user is not a Reviewer

#### `POST /applications/{id}/status/` (Kanban shortcut)
Used by the Kanban board to make valid transitions in one call. The backend MUST validate the transition against `allowedTransitions`. For decisions that require a comment, the frontend opens the reviewer modal first and calls `/decision/` instead — but if you support this endpoint, reject decision transitions that require comments here.

**Request:**
```json
{ "status": "UNDER_REVIEW" }
```
**Response 200:** updated `Application`.
**Errors:** `409` if invalid transition.

#### `GET /applications/{id}/activity/`
**Response 200:** `ActivityLogEntry[]` ordered oldest → newest.

---

### Dashboard Endpoints

#### `GET /dashboard/stats/`
**Response 200:** `DashboardStats`

#### `GET /dashboard/trends/?period=7d|30d|90d`
**Response 200:** `TrendDataPoint[]`

#### `GET /dashboard/distribution/`
**Response 200:**
```json
[
  { "status": "Draft", "count": 3, "color": "#6B7280" },
  { "status": "Submitted", "count": 5, "color": "#3B82F6" },
  ...
]
```

#### `GET /dashboard/recent/`
**Response 200:** the most recent 5 `Application` records.

---

### Settings Endpoints

#### `GET /settings/profile/` → `User`
#### `PUT /settings/profile/` — body: `{ name, email, avatar? }` → updated `User`
#### `POST /settings/password/` — body: `{ current, new }` → `204`. **400** if current password wrong.
#### `GET /settings/notifications/` → `NotificationPrefs`
#### `PUT /settings/notifications/` — body: `NotificationPrefs` → `NotificationPrefs`
#### `GET /settings/app/` → `AppSettings`
#### `PUT /settings/app/` — body: `AppSettings` → `AppSettings`
#### `GET /settings/team/` → `User[]`
#### `GET /settings/sessions/`
**Response 200:**
```json
[
  { "id": "...", "device": "Chrome on MacOS", "location": "SF, CA", "lastActive": "2 minutes ago", "current": true }
]
```
#### `DELETE /settings/sessions/{id}/` → `204`

---

## Backend Validation Rules

These are non-negotiable. The backend must enforce ALL of these:

1. **Tracking number** is server-generated, unique, format: `APP-YYYYMMDD-XXXXXX` (6 uppercase alphanumeric).
2. **`status` is read-only** via PUT — only the workflow endpoints (`/submit/`, `/decision/`, etc.) may change it.
3. **Edit lock:** PUT returns `403` unless status is `DRAFT` or `NEED_MORE_INFO`.
4. **Transition guard:** every workflow endpoint must check the current status against `allowedTransitions`. Return `409 Conflict` on invalid transitions.
5. **Comment guard:** decision endpoint must reject `REJECTED` or `NEED_MORE_INFO` decisions with empty/missing comment (`400`).
6. **Terminal lock:** `APPROVED` and `REJECTED` applications can NEVER be modified or transitioned. All workflow endpoints return `409`.
7. **Activity log:** every status change appends a row with `status`, `timestamp`, `user`, optional `comment`. Never delete activity log entries.
8. **Role guard:** only users with role `Reviewer` or `Admin` may call `/start-review/` and `/decision/`. Return `403` otherwise.
9. **Audit fields:** `createdAt` is set on creation and never updated. `updatedAt` is set on every modification.

---

## Error Format

All errors return JSON in this shape:

```json
{
  "error": "INVALID_TRANSITION",
  "message": "Cannot move from DRAFT to APPROVED.",
  "details": { "currentStatus": "DRAFT", "attempted": "APPROVED" }
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Validation error (missing/malformed fields) |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized / resource locked |
| 404 | Resource not found |
| 409 | Conflict (e.g. invalid workflow transition) |
| 500 | Server error |

---

## Recommended Stack: Django + Django Ninja

### Project Layout
```
backend/
├── manage.py
├── config/
│   ├── settings.py
│   └── urls.py
└── apps/
    ├── accounts/
    │   ├── models.py        # User (custom AbstractUser with role field)
    │   ├── schemas.py       # Ninja schemas
    │   └── api.py           # auth router
    ├── applications/
    │   ├── models.py        # Application, ActivityLogEntry
    │   ├── schemas.py
    │   ├── services.py      # transition logic (single source of truth)
    │   ├── api.py           # application router
    │   └── signals.py       # auto-create activity log entries
    ├── dashboard/
    │   └── api.py
    └── settings_app/
        └── api.py
```

### Key Models (sketch)
```python
class Application(models.Model):
    STATUS_CHOICES = [...]
    TYPE_CHOICES = [...]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    tracking_number = models.CharField(max_length=32, unique=True)
    applicant_name = models.CharField(max_length=200)
    applicant_email = models.EmailField()
    company_name = models.CharField(max_length=200)
    application_type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name="reviewed_applications")
    reviewer_comment = models.TextField(null=True, blank=True)
    reviewer_decision = models.CharField(max_length=20, null=True, blank=True)


class ActivityLogEntry(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="activity_log")
    status = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    comment = models.TextField(null=True, blank=True)
```

### Transition Service (single source of truth)
```python
# apps/applications/services.py

ALLOWED_TRANSITIONS = {
    "DRAFT":          {"SUBMITTED"},
    "SUBMITTED":      {"UNDER_REVIEW", "DRAFT"},  # DRAFT via withdraw
    "UNDER_REVIEW":   {"APPROVED", "REJECTED", "NEED_MORE_INFO"},
    "NEED_MORE_INFO": {"SUBMITTED"},
    "APPROVED":       set(),
    "REJECTED":       set(),
}

def transition(application, to_status, user, comment=None):
    if to_status not in ALLOWED_TRANSITIONS[application.status]:
        raise InvalidTransition(application.status, to_status)
    
    if to_status in ("REJECTED", "NEED_MORE_INFO") and not comment:
        raise CommentRequired()
    
    application.status = to_status
    if to_status == "SUBMITTED":
        application.submitted_at = timezone.now()
    if to_status in ("APPROVED", "REJECTED", "NEED_MORE_INFO"):
        application.reviewed_at = timezone.now()
        application.reviewed_by = user
        application.reviewer_comment = comment
        application.reviewer_decision = to_status
    application.save()
    
    ActivityLogEntry.objects.create(
        application=application, status=to_status,
        user=user, comment=comment,
    )
    return application
```

Every workflow endpoint (`submit`, `start-review`, `decision`, `withdraw`, Kanban `status`) calls `transition()`. This guarantees the rules are enforced identically everywhere.

### Tracking Number Generation
```python
def generate_tracking_number():
    today = timezone.now().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"APP-{today}-{suffix}"
```

---

## Frontend API Layer

When switching from mock data to real backend, only `src/api/` needs to change.

### `apiClient.js` — the only place that talks to fetch
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

function getToken() {
  return localStorage.getItem("token");
}

export async function apiClient(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch {}
    const error = new Error(body?.message || `Request failed: ${res.status}`);
    error.status = res.status;
    error.code = body?.error;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}
```

### Example: switching `applicationsApi.js` to real backend
```javascript
import { apiClient } from "./apiClient";

export const getApplications = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return apiClient(`/applications/?${params}`);
};

export const getApplication = (id) =>
  apiClient(`/applications/${id}/`);

export const createApplication = (data) =>
  apiClient(`/applications/`, { method: "POST", body: JSON.stringify(data) });

export const updateApplication = (id, data) =>
  apiClient(`/applications/${id}/`, { method: "PUT", body: JSON.stringify(data) });

export const submitApplication = (id) =>
  apiClient(`/applications/${id}/submit/`, { method: "POST" });

export const startReview = (id) =>
  apiClient(`/applications/${id}/start-review/`, { method: "POST" });

export const makeDecision = (id, decision, comment) =>
  apiClient(`/applications/${id}/decision/`, {
    method: "POST",
    body: JSON.stringify({ decision, comment }),
  });

export const deleteApplication = (id) =>
  apiClient(`/applications/${id}/`, { method: "DELETE" });

export const withdrawApplication = (id) =>
  apiClient(`/applications/${id}/withdraw/`, { method: "POST" });

export const updateApplicationStatus = (id, status) =>
  apiClient(`/applications/${id}/status/`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });

export const getActivityLog = (id) =>
  apiClient(`/applications/${id}/activity/`);
```

The component code stays exactly the same — they just import these functions.

### Environment Setup
Create `.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```

### CORS
If frontend and backend are on different origins, configure Django CORS:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_CREDENTIALS = True  # only if using cookies
```

---

## Migration Checklist

- [ ] Backend implements all endpoints and validation rules above
- [ ] Backend returns errors in the documented format
- [ ] Set `VITE_API_URL` in `.env`
- [ ] Replace bodies of files in `src/api/` with real `apiClient` calls (mock data files can be deleted)
- [ ] Update `AuthContext.login()` to call `POST /auth/login/` and store the returned token
- [ ] Add a request interceptor or 401 handler in `apiClient.js` to logout on expired tokens
- [ ] Test full workflow end-to-end: create → submit → review → decide → resubmit → approve/reject
- [ ] Test Kanban transitions including invalid moves
- [ ] Verify activity log entries are created for every transition

