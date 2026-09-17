# Database (Neon)

Garage+ uses IndexedDB for the offline UI cache and **Neon Postgres** as cloud source of truth after login.

## Setup

1. Neon project + tables (already created in SQL editor).
2. `.env.local`:

```env
DATABASE_URL=...
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
```

3. Runtime client: `src/lib/db/neon.ts` (`getSql()`).
4. Reference schema (docs / future Prisma): `prisma/schema.prisma` — **do not** run destructive migrate against live tables without review.

## Auth + migrate

See root `README.md` — Auth.js Credentials, `POST /api/migrate`, `GET /api/me/snapshot`.

All cloud queries filter by `session.user.id` === `user_id`.
