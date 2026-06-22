# Nordic Auto Care Web

Mobile-first Next.js + Tailwind app for Nordic Auto Care.

## Current build
v4-order-backend-open

## Included
- Customer-facing booking/request form
- Package selection and custom standalone service selection
- Extras/tillæg
- Multiple cars in one request
- Contact and invoice information
- Preferred date and time
- Open admin/backend order dashboard
- Order status workflow, internal notes, date/time assignment and local persistence

## Important
The backend is intentionally open for now and uses browser localStorage as the first prototype. For production, connect the order flow to Supabase, a database, or an email/API endpoint so requests are shared across devices.

## Commands
npm install
npm run build
npm run dev
