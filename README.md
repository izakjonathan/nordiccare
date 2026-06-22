# Nordic Auto Care Web v5

Next.js + Tailwind customer webpage and open order operations backend.

## v5 changes
- Built from `nordic-auto-care-web-v4-order-backend-open.zip`.
- Expanded the backend from a basic order list into an operations system.
- Added backend tabs: Overview, Pipeline, Calendar, Customers, Backup.
- Added order search across customer, phone, email, car, registration, and order ID.
- Added payment status, priority, responsible person, activity log, and stronger KPI cards.
- Added full backend editing for customer info, invoice info, car details, package, services, extras, and notes.
- Added add/remove cars directly inside existing orders.
- Added calendar-style daily order view.
- Added customer summary list.
- Added JSON export/import backup for local order data.

## Important
The backend is intentionally open and still uses browser localStorage. This is good for design/prototype testing, but it is not a shared production database yet.

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```
