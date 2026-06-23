# Nordic Auto Care Web v11

Built from v10 readable backend dock.

## Changes in v11

- Fixed backend module mobile scaling.
- Added overflow guards so backend modules cannot expand wider than the phone screen.
- Added responsive backend section headings, including the Company Information/Firma module.
- Reduced mobile backend padding and panel sizing where needed.
- Kept the readable horizontal backend dock from v10.

## Run locally

```bash
npm install
npm run dev
```

Customer frontend:

```txt
http://localhost:3000
```

Backend:

```txt
http://localhost:3000/backend
```

Prototype backend PIN:

```txt
2026
```

## Build test

Production build was tested successfully with:

```bash
npm run build
```
