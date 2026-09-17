# Garage+

Production-ready Progressive Web App for complete vehicle management.

Offline-first UI with IndexedDB, plus optional cloud sync to **Neon Postgres** after login.

## Auth choice

**Auth.js (NextAuth v5) + Credentials (email/password)**

- `session.user.id` === `users.id` in Neon (used as `user_id` on all domain rows)
- No Clerk account required
- Passwords stored as `users.password_hash` (bcrypt)

## Environment

Copy `.env.example` → `.env.local`:

```env
DATABASE_URL=postgresql://...neon...
AUTH_SECRET=generate-with-openssl-rand-hex-32
AUTH_URL=http://localhost:3000
USE_CLOUD_DB=true
```

Vercel: set the same keys in Project → Environment Variables.

Generate secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Getting started

Use **Node 20 LTS** (not 24). The repo has an `.nvmrc`:

```bash
nvm use
npm install
npm run dev
```

**Important:** do not keep the project on iCloud Desktop (`~/Desktop/...`). Next.js file watching hangs there. Prefer a local folder such as `~/Developer/tripbuddy`.

App: [http://127.0.0.1:3000](http://127.0.0.1:3000)

Open [http://localhost:3000](http://localhost:3000). You must create an account before using the app.

## Test migration (IndexedDB → Neon)

1. (Optional) Use the app briefly without cloud… if you already have local data in IndexedDB, keep it.
2. Open the app → **Fă-ți un cont** / login.
3. If local data exists and cloud is empty → automatic migrate (`merge`, idempotent upsert by id + `user_id`).
4. If both local and cloud have data → choose **Unește / Folosește cloud / Folosește local**.
5. IndexedDB is **not deleted**; after success the UI hydrates from Neon for that user.
6. Reload → data comes from Neon snapshot filtered by `user_id`.
7. Log in as a second account → you must not see the first account’s rows.
8. Re-run migrate / re-login → no duplicate rows (upsert on primary key).

Flags (browser):

- `localStorage['garage-plus:migration-completed:<userId>'] = '1'`
- `localStorage['garage-plus:data-mode'] = 'cloud'`

## API

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/auth/[...nextauth]` | — | Auth.js handlers |
| `GET/POST /api/migrate` | required | Summary / one-time IDB dump → Neon |
| `GET /api/me/snapshot` | required | Full user dataset (`user_id` scoped) |
| `GET /api/db/health` | — | Neon ping |

## Database

Tables (managed in Neon SQL editor): `users`, `cars`, `fuel_entries`, `service_records`, `documents`, `document_files`, `saved_calculations`, `user_settings`.

Reference schema: `prisma/schema.prisma` (documentation / future Prisma client). Runtime queries use `@neondatabase/serverless` via `src/lib/db/neon.ts`.

Do **not** run destructive `prisma migrate` against production tables without review.

## Stack

- Next.js 15 · TypeScript · Tailwind · shadcn/ui
- IndexedDB (`idb`) · Neon · Auth.js · Framer Motion · Recharts · PWA
