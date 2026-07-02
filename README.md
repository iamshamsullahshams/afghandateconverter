# AfghanDate

A free, single-purpose web tool that converts dates between the **Afghan Solar
Hijri calendar** and the **Gregorian calendar**. Fully static, runs entirely in
the browser — no backend, no accounts, no tracking.

Live domain: **afghandate.xyz**

## Tech stack

- React + TypeScript + Vite
- Plain CSS with CSS variables (light + automatic dark theme)
- System font stacks only — zero web-font requests, no render-blocking assets

## Conversion algorithm

Date math lives in [`src/jalaali.ts`](src/jalaali.ts) — a faithful TypeScript
port of the well-known astronomical Jalaali algorithm (the `jalaali-js`
library by Behrang Noruzi Niya, derived from Kazimierz M. Borkowski's work).
The Afghan and Iranian Solar Hijri calendars are astronomically identical; only
the month names differ, so the same algorithm applies directly to Afghan dates.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # type-checks then bundles into dist/
npm run preview    # preview the production build locally
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel — the Vite preset is auto-detected (`vercel.json` pins it).
3. Add the custom domain `afghandate.xyz` in the project's Domains settings.

No environment variables or build secrets are required.

## Before launch — one asset to add

The Open Graph / Twitter preview references `public/og-image.png`
(1200×630). Drop that file into `public/` before launch so social shares render
a card. Everything else (favicon, robots.txt, sitemap.xml) is already in place.
