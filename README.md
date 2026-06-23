# Nordic Auto Care Web v8

Next.js + Tailwind prototype for Nordic Auto Care.

## Routes

- `/` customer frontend
- `/backend` separated backend
- Backend prototype PIN: `2026`

## v8 changes

Built from `nordic-auto-care-web-v7-invoice-module.zip`.

- Adds a fixed bottom order/footer card on the customer frontend when an order draft exists.
- The order footer card can expand/collapse.
- Expanded order footer shows all current draft information:
  - selected package per car
  - included package items
  - extra standalone services
  - tillæg/extras
  - car info and notes
  - contact info
  - invoice info
  - preferred date/time
  - total price
- Footer card can submit the booking form directly or jump back to edit.
- Package selection cards in the booking form now show the same included item overview as the package overview section further down the page.
- Backend and invoice module from v7 are kept.

## Local development

```bash
npm install
npm run dev
```

Open customer frontend:

```text
http://localhost:3000
```

Open backend:

```text
http://localhost:3000/backend
```

## Build test

```bash
npm run build
```

Build passes successfully.
