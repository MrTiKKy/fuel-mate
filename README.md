# Car Companion

Production-ready Progressive Web App for mobile-first car management.

Offline-first. Dark mode by default. Data stays on device (IndexedDB).

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
- Lucide React · React Hook Form · Zod · IndexedDB (`idb`) · Recharts
- `@ducanh2912/next-pwa` · ESLint · Prettier

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (includes service worker) |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript check |

## Structure

```
src/
  app/                 # Routes (App Router)
  components/
    layout/            # Shell, nav, header
    shared/            # Reusable app components
    ui/                # shadcn/ui primitives
    providers/         # Theme, etc.
  features/            # Feature modules (to be filled in)
  hooks/
  lib/
    constants/
    db/                # IndexedDB layer (stub)
    formatters/
    validations/
  types/
public/
  icons/               # PWA icons
```

## Features (planned)

- Dashboard · Cars · Fuel Log · Calculators · Statistics
- Service Tracker · Settings · Backup / Restore

Foundation only — business logic lands feature by feature.
