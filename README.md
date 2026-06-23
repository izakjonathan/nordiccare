# Nordic Auto Care Web v7

Built from `nordic-auto-care-web-v6-separated-backend.zip`.

## Routes

- `/` — standalone customer booking/request frontend.
- `/backend` — separated backend with prototype PIN gate.

Prototype backend PIN: `2026`

## Added in v7

Backend invoice module prepared for customer invoices:

- new `Faktura` backend tab
- create invoice drafts from existing orders
- invoice numbers generated as `NAC-YYYY-0001`
- editable invoice customer, company, CVR, invoice address and email
- editable invoice lines, quantities and prices
- due date field
- invoice statuses: Kladde, Sendt, Betalt, Forfalden, Annulleret
- send invoice action opens a prefilled email to the customer and marks invoice as sent
- mark invoice paid action updates invoice status and linked order payment/status
- invoice status overview with draft/sent/paid/open amount
- invoices saved locally in browser localStorage for prototype use

## Notes

This is still a frontend/localStorage prototype. Sending invoices currently opens the user's email client with a prefilled invoice email. A real production invoice flow should connect to a database, an email provider and/or a Danish accounting system such as e-conomic, Dinero or Billy.

## Development

```bash
npm install
npm run dev
```

## Build test

```bash
npm run build
```

Production build tested successfully.
