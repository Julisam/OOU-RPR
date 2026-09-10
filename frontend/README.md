# OOU Research Productivity Portal - Frontend

This frontend is a React + Vite application for managing and analyzing research productivity records.

It provides:
- Authentication and protected navigation
- Profile management
- Research activity management (publications, conferences, grants, patents, innovations)
- **Fellowships & Appointments** management (national academy fellowships, international professional fellowships, visiting professorships)
- **Research Profile** management (research awards, editorial appointments, research group memberships)
- Analytics/reporting dashboards for:
  - Personal dashboard
  - HOD report (department-level)
  - Dean report (faculty-level)
  - Admin report (institution-level)

## Tech Stack
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts (for charts)

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Create `.env` in `frontend/` with:
```bash
VITE_API_URL=http://127.0.0.1:8000/api/
```
3. Run development server:
```bash
npm run dev
```
4. Build for production:
```bash
npm run build
```

## App Routes
- `/login`
- `/dashboard`
- `/my-research`
- `/profile`
- `/my-account` **(new)** - Fellowships & Appointments & Research Profile
- `/annual-report`
- `/productivity-metrics`
- `/hod-report`
- `/dean-report`
- `/admin-report`
- `/export-data`
- `/change-password`

## Auth Model
- Access and refresh tokens are stored in localStorage.
- Axios interceptor auto-attaches `Authorization: Bearer <token>`.
- Expired access tokens are refreshed using `/token/refresh/`.

## Deployment
Typical frontend deployment:
1. Build:
```bash
npm run build
```
2. Deploy generated static files to your web root.
3. Configure SPA rewrite so unknown routes resolve to `index.html`.
4. Ensure API base URL points to your production backend (`VITE_API_URL`).

Reference server/rewrite examples are available in:
- `proxies`

## Production Notes
- Do not cache authenticated API responses for dynamic report pages.
- Ensure frontend and backend URLs are aligned for CORS and JWT flow.
- Use HTTPS in production.