# Nordic Auto Care Web v6

Next.js + Tailwind customer webpage and separated order backend.

## Routes

- `/` — standalone customer-facing frontend with booking/request flow and prices.
- `/backend` — separated backend/order operations area.

## Backend access

The backend is behind a simple prototype PIN gate.

- Admin PIN: `2026`

This is only a frontend/sessionStorage gate for the current prototype. For real customer use, replace it with proper authentication and a real database.

## Included in v6

- Customer frontend no longer links to backend.
- Backend has a link back to the customer frontend.
- Backend moved to `/backend` and is separate from the customer page.
- Backend has simple PIN screen so normal customers do not see operations tools.
- Existing v5 order tools kept: overview, pipeline, calendar, customers, backup/import, full editing, statuses, payment status, priority, responsible person and activity log.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```
