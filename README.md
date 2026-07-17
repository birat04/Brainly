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
- `types/` — shared TypeScript types

## Deploy

- **Vercel**: rename the project to `cortexly` (or keep the old slug and update DNS). Set `NEXT_PUBLIC_APP_URL` to the production domain.
- **GitHub**: rename the repository from `Brainly` to `Cortexly` (Settings → General → Repository name). Existing clones keep working via GitHub’s redirect.

## License

MIT
