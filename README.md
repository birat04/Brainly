# Cortexly

Content management and sharing (“second brain”) as a **single Next.js 16** app: App Router UI, API routes, MongoDB, and JWT auth.

Formerly known as **Brainly** — this repository and product are now **Cortexly**.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **Data**: MongoDB (native driver), database name `cortexly`
- **Auth**: JWT (`jose`) + bcryptjs
- **UI**: Tailwind CSS, Radix/shadcn-style components, Framer Motion, Sonner

## Quick start

1. Environment (recommended):

   ```sh
   cp .env.example .env.local
   ```

   Set at least `MONGODB_URI` and `JWT_SECRET`. For local development, if you omit `MONGODB_URI`, the app defaults to `mongodb://127.0.0.1:27017/cortexly` (MongoDB must be running).

   Set `NEXT_PUBLIC_APP_URL` to your deployed origin (e.g. `https://cortexly.vercel.app`) so share links use the correct base URL.

2. Optional — create DB indexes:

   ```sh
   npm run setup-db
   ```

3. Run the app:

   ```sh
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Migrating from Brainly (database rename)

The app now uses the MongoDB database name `cortexly` (previously `brainly`). If you have existing data:

```js
// mongosh — copy collections into the new DB, then verify before dropping the old one
db.getSiblingDB("brainly").getCollectionNames().forEach((name) => {
  db.getSiblingDB("brainly")[name].aggregate([
    { $match: {} },
    { $out: { db: "cortexly", coll: name } },
  ]);
});
```

Or point `MONGODB_URI` at a cluster and ensure the `cortexly` database exists with your migrated collections. Atlas users can also rename via backup/restore.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Next.js dev server       |
| `npm run build`| Production build         |
| `npm run start`| Production server        |
| `npm run lint` | ESLint                   |
| `npm run setup-db` | MongoDB indexes (tsx) |

## Layout

- `app/` — pages, layouts, API routes (`app/api/...`)
- `components/` — UI and feature components
- `hooks/` — client hooks (`useAuth`, `useContent`, etc.)
- `lib/` — DB, auth, axios, validations, API helpers
  - `lib/services/` — business logic (auth, content, user, workspace)
  - `lib/repos/` — Mongo collection accessors + document types
  - `lib/api/http.ts` — response envelope helpers
- `types/` — shared TypeScript types
- `scripts/` — DB indexes + migrations

### Workspaces

Every user gets a personal workspace on signup/signin. Content is scoped by
`workspaceId` (with dual-read for legacy rows). Backfill existing data:

```sh
npm run setup-db
npm run migrate-workspaces          # or: npm run migrate-workspaces -- --dry-run
```

### Auth sessions

Access tokens last **15 minutes** (HttpOnly `access_token` cookie + Bearer).
Refresh tokens last **30 days** (HttpOnly `refresh_token`, hashed in `sessions`).
`POST /api/auth/refresh` rotates the refresh token; logout and password change revoke sessions.

### Billing (Stripe)

Plans: **Free** (25 items), **Pro** (1,000), **Enterprise** (unlimited / sales).
Set Stripe env vars (see `.env.example`), then point a webhook to
`/api/billing/webhook` for `checkout.session.completed`,
`customer.subscription.*`, and `invoice.payment_failed`.
Content creation is blocked when the workspace hits its plan limit.

### Security & search

- Rate limits on auth, content create, and billing (in-memory locally; set
  `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for production).
- Same-origin checks on mutating cookie-authenticated routes.
- Security headers via `next.config.ts`.
- Content search uses MongoDB text index (title/tags/description/body) with regex fallback.
- Health: `GET /api/health` (Mongo ping).

## Deploy

- **Vercel**: rename the project to `cortexly` (or keep the old slug and update DNS). Set `NEXT_PUBLIC_APP_URL` to the production domain.
- **GitHub**: rename the repository from `Brainly` to `Cortexly` (Settings → General → Repository name). Existing clones keep working via GitHub’s redirect.

## License

MIT
