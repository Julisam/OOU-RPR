# OOU Research Productivity Portal - Backend

This backend is a Django + Django REST Framework API for the Research Productivity Portal.

It supports:
- Authentication with JWT
- Profile management
- Research activity CRUD (publications, conferences, grants, patents, innovations)
- **Fellowships & Appointments** (national academy fellowships, international professional fellowships, visiting professorships)
- **Research Profile** (research awards, editorial appointments, research group memberships)
- Role-based analytics/reporting for:
  - Lecturer (personal dashboards)
  - HOD (department-level)
  - Dean (faculty-level)
  - Admin/DVC (institution-level)

## Tech Stack
- Python 3.13
- Django 6.1.1
- Django REST Framework 3.18.1
- djangorestframework-simplejwt
- SQLite (default) or external DB via env vars

## Project Structure
- `manage.py`: Django entrypoint
- `backend/settings.py`: project settings
- `api/models.py`: core domain models (including new fellowship/profile models)
- `api/serializers.py`: DRF serializers
- `api/views.py`: API endpoints + analytics/reporting logic
- `api/urls.py`: API routes
- `api/migrations/`: database migrations

## Local Setup
1. Create and activate a virtual environment.
2. Install dependencies:
```bash
pip install -r requirements.txt
```
3. Configure env vars in `backend/.env` (or shell):
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `DB_ENGINE`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `CORS_ALLOWED_ORIGINS`
- `STATIC_URL`, `STATIC_ROOT`
4. Run migrations:
```bash
python manage.py migrate
```
5. Start server:
```bash
python manage.py runserver
```

API base locally is typically:
- `http://127.0.0.1:8000/api/`

## Key API Endpoints
- `POST /api/token/`
- `POST /api/token/refresh/`
- `GET/PUT /api/profile/`
- `POST /api/change-password/`
- `GET/POST /api/research-activities/`
- `GET /api/stats/`
- `GET /api/annual-report/`
- `GET /api/hod-report/`
- `GET /api/dean-report/`
- `GET /api/admin-report/`
- **New:** `GET/POST /api/national-academy-fellowships/`
- **New:** `GET/POST /api/international-professional-fellowships/`
- **New:** `GET/POST /api/visiting-professorships/`
- **New:** `GET/POST /api/research-awards/`
- **New:** `GET/POST /api/editorial-appointments/`
- **New:** `GET/POST /api/research-group-memberships/`
- `GET /api/journal-index-statuses/`

## Roles and Access
- `lecturer`: personal data and analytics
- `hod`: department report
- `dean`: faculty report
- `admin`, `dvc`: institution report

Role checks are enforced server-side in report endpoints.

## Deployment (cPanel + Gunicorn + Apache Proxy)
Typical deployment flow:
1. Pull backend code to server.
2. Install dependencies in virtualenv.
3. Run migrations.
4. Collect static files (if enabled).
5. Run Gunicorn with systemd service.
6. Reverse proxy `/api/` and `/admin/` through Apache to Gunicorn socket.

Reference operational examples exist in the repo file:
- `proxies`

## Production Notes
- Do not cache authenticated API responses (`/api/*`).
- Set API responses with no-store/private cache controls at proxy/app level.
- Keep `SECRET_KEY` and DB credentials in environment variables.
- Restrict `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.

## Developer Notes
- Some model changes may require DB migrations (e.g., new `0005`, `0006` migrations).
- Reporting endpoints are aggregate-heavy; keep payloads compact to avoid large responses.
- New fellowship/profile endpoints follow the same JWT auth pattern as existing routes.