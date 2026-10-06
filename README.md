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

Docker starts three services:

- Postgres for development on port 5433
- Postgres for tests on port 5434 (data is discarded when the container stops)
- Redis on port 6379

## Run

```bash
pnpm start:dev
```

The API runs on http://localhost:3000.

## Checks

```bash
pnpm lint
pnpm format:check
pnpm test
pnpm test:e2e
pnpm build
```

End-to-end tests load `.env.test` and refuse to run unless `DATABASE_URL` points to a local `*_test` database.
