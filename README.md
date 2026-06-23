# Nordic Auto Care Web v9 — Backend Footer Dock

Built from v8 frontend order footer baseline.

## Run locally

```bash
npm install
npm run dev
```

Customer frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:3000/backend
```

Prototype backend PIN:

```text
2026
```

## v9 changes

- Rebuilt backend navigation as a fixed footer dock inspired by EventOS.
- Added backend modules:
  - New orders
  - Calendar
  - Invoices
  - Completed orders
  - Services
  - Company information
  - Backup
- New orders appear as collapsible cards with full editable order info.
- New orders can be accepted with one button, changing status to confirmed and opening a prefilled confirmation email to the customer.
- Calendar shows accepted orders only, ordered by planned date/time, with collapsible cards and order-status dropdown.
- Order statuses now use a clearer workflow:
  - Ny
  - Bekræftet
  - Planlagt
  - I gang
  - Udført
  - Faktura sendt
  - Betaling modtaget
  - Annulleret
- Invoices module shows confirmed/active/completed orders and keeps invoice creation/sending workflow.
- Sending an invoice automatically changes the linked order to `Faktura sendt`.
- Marking an invoice paid automatically changes the linked order to `Betaling modtaget`.
- Completed orders module is split into:
  - Faktura sendt / afventer betaling
  - Betaling modtaget
- Services module lets packages, standalone services and add-ons be edited/added as drafts before publishing.
- Company information module lets contact and invoice information be edited and saved locally.

## Prototype note

This version still uses browser localStorage for data persistence and mailto links for sending emails. A real production version should connect the customer frontend and backend to a database and email provider.
