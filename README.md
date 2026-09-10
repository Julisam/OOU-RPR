# OOU Research Productivity Portal

A full-stack web application for managing research productivity records across an institution.

## Overview

The portal provides a complete workflow for faculty, department heads, deans, and administrators to track research activities, fellowships, awards, editorial roles, and research group memberships. It features role-based dashboards, analytics/reporting, and a modern account management interface.

## Architecture

- **Backend**: Django 6.1.1 + Django REST Framework + JWT authentication
- **Frontend**: React 19 + Vite + Tailwind CSS + React Router
- **Database**: SQLite (default) or external DB via environment variables
- **API**: RESTful endpoints under `/api/`

## Features

### Public-Facing
- Research activity tracking (publications, conferences, grants, patents, innovations)
- Role-based reporting dashboards (lecturer, HOD, dean, admin)

### Account Sections
- **Profile** – personal academic information
- **My Research** – research activities with filtering and CRUD
- **My Account** – two new sections:
  - **Fellowships & Appointments** – national academy fellowships, international professional fellowships, visiting professorships
  - **Research Profile** – research awards, editorial appointments, research group memberships

## Local Development

### Backend
```bash
cd backend
source .venv/bin/activate    # or: python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# Configure .env (see backend/.env.example if present)
python manage.py migrate
python manage.py runserver
# API at http://127.0.0.1:8000/api/
```

### Frontend
```bash
cd frontend
npm install
# Create .env with:
# VITE_API_URL=http://127.0.0.1:8000/api/
npm run dev
# Frontend at http://localhost:5173/
```

### Build Production
```bash
# Backend: python manage.py collectstatic && deployment steps
# Frontend: npm run build (outputs to ./frontend/dist/)
```

## API Base URLs
- Development: `http://127.0.0.1:8000/api/`
- Production: configure `VITE_API_URL` in frontend `.env` and `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS` in backend

## Roles
- `lecturer`: personal data and analytics
- `hod`: department-level report
- `dean`: faculty-level report
- `admin`, `dvc`: institution-level report

## Deployment
Typical flow:
1. Pull code to production server.
2. Backend: create venv, `pip install -r requirements.txt`, run migrations, collect static, run Gunicorn behind Apache/Nginx reverse proxy.
3. Frontend: `npm run build`, deploy static files, configure SPA rewrite so unknown routes resolve to `index.html`.
4. Ensure `CORS_ALLOWED_ORIGINS` and `VITE_API_URL` are aligned for JWT auth flow.

## Production Notes
- Do not cache authenticated API responses (`/api/*`).
- Keep `SECRET_KEY` and DB credentials in environment variables.
- Restrict `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`.
- Use HTTPS in production.
- Reference operational examples in the repo file: `proxies`