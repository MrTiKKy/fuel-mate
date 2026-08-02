# Garage+

Production-ready Progressive Web App for complete vehicle management.

Offline-first digital garage for fuel, documents, service, costs, and insights.
Dark mode by default. Data stays on device (IndexedDB).

## Stack

- Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
- Lucide React · React Hook Form · Zod · IndexedDB (`idb`) · Recharts · Framer Motion
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

## Features

- Vehicles, fuel log, service entries, statistics
- Documents vault (insurance, ITP, licenses, invoices)
- Calculators and local backups
- Rule-based Insights (no AI, unlocks with enough history)
