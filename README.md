# CardJolly API

NestJS backend for CardJolly.

## Requirements

- Node 24.21.0 (see `.nvmrc`)
- pnpm 11
- Docker

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
```

Then fill in the four empty secrets in `.env` (see Environment).

Docker starts three services:

- Postgres for development on port 5433
- Postgres for tests on port 5434 (data is discarded when the container stops)
- Redis on port 6379

## Environment

The app validates every variable at startup and refuses to start if any is missing or invalid.

`.env.example` leaves four secrets empty: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NEXTJS_REVALIDATE_SECRET` and `CARD_CODE_ENCRYPTION_KEY`. Generate a different value for each with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

The Resend and Cloudinary placeholders are enough until those integrations are built. Variables already set in the environment take precedence over `.env`. Tests ignore `.env` and use `.env.test`.

## Run

```bash
pnpm start:dev
```

The API runs on http://localhost:5000.

## Checks

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm test:e2e
pnpm build
```

End-to-end tests load `.env.test` and refuse to run unless `DATABASE_URL` points to a local `*_test` database.
