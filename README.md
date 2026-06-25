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


## v16 backend homescreen fix
Removed forced `start_url: /` from the main manifest so iOS keeps the exact URL used when adding to Home Screen. Added a backend manifest and backend route metadata with `start_url: /backend`.


## v17 Vercel install network fix
Adds package-lock.json, .npmrc retry/timeout settings, packageManager, and explicit Vercel install/build commands to make Vercel installs more stable after npm registry ETIMEDOUT errors.


## v18 backend homescreen direct fix
Removed the global hardcoded frontend manifest link from root layout. The customer frontend now declares `/site.webmanifest` only on `/`, while `/backend` declares `/backend.webmanifest`, so iOS can add the backend shortcut with `start_url: /backend` instead of always opening `/`.


## v19 backend homescreen aliases
Adds direct backend-rendering aliases /admin, /backend-home and /backend-start. Removes root start_url from customer manifest to prevent iOS forcing / when a backend shortcut is added. Adds /version for deployment verification.


## v20 Vercel safe build
Based on v19. Stabilized deployment by using Next 15.5.6 instead of Next 16/Turbopack, React 19.1.0, Node 22.x, npm lockfile, simple npm ci Vercel install command, and retry/timeout npmrc settings. Build tested locally.

## v21 Vercel no npm ci
Fixes the Vercel error `npm error Exit handler never called` by avoiding `npm ci`. Vercel now uses `npm install --no-audit --no-fund --legacy-peer-deps`, Node 20.x, exact dependency versions, and npm retry/timeout settings.


## v22 Node 24 Vercel build
Based on v21. Updates package.json engines to Node 24.x, packageManager to npm 11.6.2, keeps npm install instead of npm ci, and keeps exact dependency versions and backend aliases.


## v23 Node 24 npm ci Vercel fix
Uses Node 24.x with a fresh package-lock.json and explicit `npm ci --no-audit --no-fund --legacy-peer-deps`. Tested local npm install, npm ci, and production build successfully.
