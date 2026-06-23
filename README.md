# Nordic Auto Care Web v13

Based on v12. Removes the backend footer block from all backend modules so the backend no longer shows the bottom “Nordic Auto Care / Tak for din tid og tillid / Åbn kundeside” footer.

Customer site: `/`
Backend: `/backend`
Prototype PIN: `2026`

Build tested with:

```bash
npm install --no-audit --no-fund --legacy-peer-deps --ignore-scripts
npm run build
```


## v14 icons
Added favicon, Apple touch icons, PWA icon files and web manifest for Vercel deployment.


## v15 homescreen icon fix
Added explicit iOS apple-touch-icon links, apple-touch-icon-precomposed, extra iOS icon sizes, root favicon files, and expanded web manifest. Existing homescreen shortcuts may need to be deleted and re-added because iOS caches icons.
