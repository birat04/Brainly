# Brainly

Content management and sharing (“second brain”) as a **single Next.js 16** app: App Router UI, API routes, MongoDB, and JWT auth.

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict)
- **Data**: MongoDB (native driver)
- **Auth**: JWT (`jose`) + bcryptjs
- **UI**: Tailwind CSS, Radix/shadcn-style components, Framer Motion, Sonner

## Quick start

1. Environment (recommended):

   ```sh
   cp .env.example .env.local
   ```

   Set at least `MONGODB_URI` and `JWT_SECRET`. For local development, if you omit `MONGODB_URI`, the app defaults to `mongodb://127.0.0.1:27017/brainly` (MongoDB must be running).

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

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Next.js dev server       |
| `npm run build`| Production build         |
| `npm run start`| Start production server  |
| `npm run lint` | ESLint                   |
| `npm run setup-db` | MongoDB indexes (tsx) |

## Layout

- `app/` — pages, layouts, API routes (`app/api/...`)
- `components/` — UI and feature components
- `hooks/` — client hooks (`useAuth`, `useContent`, etc.)
- `lib/` — DB, auth, axios, validations, API helpers
- `types/` — shared TypeScript types

## License

MIT
