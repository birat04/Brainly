# Brainly

A full-stack content management and sharing platform ("second brain") built with Node.js, Express, TypeScript, MongoDB, and React.

## Features

- **Auth**: Sign up & sign in with JWT
- **Content**: Create, view, delete content (video, article, image)
- **Share**: Generate unique shareable links for your content
- **API**: RESTful, versioned (`/api/v1`), standardized responses
- **Security**: Helmet, rate limiting, CORS, validation
- **DevOps**: Docker, health endpoint, graceful shutdown

## Tech Stack

| Layer    | Stack                         |
|----------|-------------------------------|
| Backend  | Node, Express, TypeScript     |
| DB       | MongoDB (Mongoose)            |
| Auth     | JWT (bcrypt passwords)        |
| Frontend | React, Vite, Tailwind         |
| Deploy   | Docker, Vercel-ready          |

## Project Structure

```
backend/
  src/
    app.ts              # Express app
    server.ts           # Entry, DB connect, graceful shutdown
    config/             # env, db, logger
    middleware/         # auth, validate, errorHandler
    utils/              # ApiError, response, asyncHandler, random
    modules/
      auth/             # signup, signin
      users/            # user model
      content/          # content CRUD
      share/            # share links
    routes/index.ts     # /api/v1 mounting
    types/express.d.ts
  tests/                # Jest + Supertest
  Dockerfile
frontend/
  src/
    pages/              # SignIn, SignUp, Dashboard
    components/
    config.ts
```

## API Endpoints

| Method | Path                    | Auth | Description           |
|--------|-------------------------|------|-----------------------|
| GET    | /health                 | No   | Health check          |
| POST   | /api/v1/auth/signup     | No   | Create user, get JWT  |
| POST   | /api/v1/auth/signin     | No   | Get JWT               |
| GET    | /api/v1/content         | Yes  | List user content     |
| POST   | /api/v1/content         | Yes  | Create content        |
| DELETE | /api/v1/content         | Yes  | Delete content        |
| POST   | /api/v1/brain/share     | Yes  | Create share link     |
| GET    | /api/v1/brain/:hash     | No   | Get shared content    |

## Getting Started

### Local

1. **Backend**
   ```sh
   cd backend
   cp .env.example .env   # set JWT_PASSWORD, optional MONGO_URI
   npm install
   npm run dev
   ```

2. **Frontend**
   ```sh
   cd frontend
   npm install
   npm run dev
   ```

### Docker

```sh
docker-compose up --build
```

API at `http://localhost:3000`, MongoDB at `27017`.

### Tests

```sh
cd backend && npm test
```

## Environment

See `backend/.env.example` for required vars. `MONGO_URI` defaults to `mongodb://127.0.0.1:27017/brainly` if unset.

## License

MIT
