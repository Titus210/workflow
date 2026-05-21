# IP Workflow Tracker Backend

A Django + Django Ninja backend for an IP Workflow Tracker application.

## Features

- **Authentication**: JWT-based login/logout with role-based access control (Admin, Reviewer, Applicant)
- **Application Management**: Full CRUD operations with workflow state machine
- **Dashboard**: Statistics, trends, distribution, and recent applications
- **Settings**: Profile management, password change, notifications, app settings, team management, session handling
- **Activity Logging**: Complete audit trail of all application status changes
- **Role-Based Access Control**: Fine-grained permissions for different user roles
- **RESTful API**: Clean, consistent API endpoints with proper error handling

## Technology Stack

- Django 5.0.6
- Django Ninja 1.2.0
- Django Ninja JWT 5.3.5
- Django CORS Headers
- Python-dotenv
- PostgreSQL (SQLite for development)
- PyJWT

## Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   └── api.py
└── apps/
    ├── __init__.py
    ├── accounts/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── schemas.py
    │   └── api.py
    ├── applications/
    │   ├── __init__.py
    │   ├── models.py
    │   ├── schemas.py
    │   ├── api.py
    │   ├── services.py
    │   ├── signals.py
    │   └── utils.py
    ├── dashboard/
    │   ├── __init__.py
    │   ├── api.py
    │   └── schemas.py
    └── settings_app/
        ├── __init__.py
        ├── api.py
        └── schemas.py
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file in the backend root directory with:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database (SQLite for development)
# For PostgreSQL, uncomment and set:
# DB_NAME=your_db_name
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_HOST=localhost
# DB_PORT=5432

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_LIFETIME=3600  # 1 hour in seconds
JWT_REFRESH_TOKEN_LIFETIME=2592000  # 30 days in seconds
```

### 5. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://localhost:8000/api/v1/`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login/` - Login with email and password
- `POST /api/v1/auth/logout/` - Logout
- `GET /api/v1/auth/me/` - Get current user profile

### User Management
- `GET /api/v1/auth/users/` - List all users (Admin/Reviewer only)
- `PUT /api/v1/auth/users/{user_id}/` - Update user (Admin/Reviewer only)

### Applications
- `GET /api/v1/applications/` - List applications (with filters: status, search, page, pageSize)
- `GET /api/v1/applications/{id}/` - Get single application
- `POST /api/v1/applications/` - Create new application (draft)
- `PUT /api/v1/applications/{id}/` - Update application (only DRAFT/NEED_MORE_INFO)
- `DELETE /api/v1/applications/{id}/` - Delete application (only DRAFT)
- `POST /api/v1/applications/{id}/submit/` - Submit application (DRAFT/NEED_MORE_INFO → SUBMITTED)
- `POST /api/v1/applications/{id}/start-review/` - Start review (SUBMITTED → UNDER_REVIEW, Reviewer/Admin only)
- `POST /api/v1/applications/{id}/withdraw/` - Withdraw application (SUBMITTED → DRAFT)
- `POST /api/v1/applications/{id}/decision/` - Make decision (UNDER_REVIEW → APPROVED/REJECTED/NEED_MORE_INFO, Reviewer/Admin only, comment required for REJECTED/NEED_MORE_INFO)
- `POST /api/v1/applications/{id}/status/` - Kanban shortcut status update (validates transition)
- `GET /api/v1/applications/{id}/activity/` - Get activity log for application

### Dashboard
- `GET /api/v1/dashboard/stats/` - Get dashboard statistics
- `GET /api/v1/dashboard/trends/?period=7d|30d|90d` - Get trend data
- `GET /api/v1/dashboard/distribution/` - Get status distribution with colors
- `GET /api/v1/dashboard/recent/` - Get 5 most recent applications

### Settings
- `GET /api/v1/settings/profile/` - Get current user profile
- `PUT /api/v1/settings/profile/` - Update profile
- `POST /api/v1/settings/password/` - Change password
- `GET /api/v1/settings/notifications/` - Get notification preferences
- `PUT /api/v1/settings/notifications/` - Update notification preferences
- `GET /api/v1/settings/app/` - Get application settings
- `PUT /api/v1/settings/app/` - Update application settings
- `GET /api/v1/settings/team/` - Get all team members
- `GET /api/v1/settings/sessions/` - Get active sessions
- `DELETE /api/v1/settings/sessions/{id}/` - Terminate session

## Error Response Format

All errors return a consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

HTTP Status codes: 400, 401, 403, 404, 409, 500

## Workflow State Machine

The application follows this state transition diagram:

```
DRAFT → SUBMITTED → UNDER_REVIEW → {APPROVED, REJECTED, NEED_MORE_INFO}
                      ↑              ↓
                      └──────────────┘
                         WITHDRAW
```

- Only DRAFT and NEED_MORE_INFO applications can be edited
- Comments are REQUIRED for REJECTED and NEED_MORE_INFO decisions
- APPROVED and REJECTED are terminal states
- Every status change creates an ActivityLogEntry
- Only Reviewers and Admins can start review and make decisions

## Running Tests

```bash
export DJANGO_SETTINGS_MODULE=config.settings
python -m pytest tests/ -v
```

## API Documentation

Once the server is running, visit:
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`
- Swagger UI: `http://localhost:8000/api/v1/docs`

## Database Indexes

For performance, the following indexes are created:
- tracking_number (unique)
- status
- created_at
- applicant_email

## Admin Interface

Django admin is available at `http://localhost:8000/admin/` for managing all models directly.

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| SECRET_KEY | Django secret key | your-secret-key-here |
| DEBUG | Debug mode | True |
| ALLOWED_HOSTS | Allowed hosts | localhost,127.0.0.1,0.0.0.0 |
| JWT_SECRET_KEY | JWT signing key | SECRET_KEY value |
| JWT_ACCESS_TOKEN_LIFETIME | Access token lifetime (seconds) | 3600 |
| JWT_REFRESH_TOKEN_LIFETIME | Refresh token lifetime (seconds) | 2592000 |
| DB_NAME | Database name (PostgreSQL) | your_db_name |
| DB_USER | Database user (PostgreSQL) | your_db_user |
| DB_PASSWORD | Database password (PostgreSQL) | your_db_password |
| DB_HOST | Database host (PostgreSQL) | localhost |
| DB_PORT | Database port (PostgreSQL) | 5432 |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.