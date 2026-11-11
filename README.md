# Atmos

Weather analytics platform (pnpm + Turborepo monorepo). Current state: technical foundation only — a placeholder web route, a liveness endpoint and a shared health contract.

| Path | Package | Purpose |
|---|---|---|
| `apps/web` | `@atmos/web` | React + Vite + TanStack Router. `/` is a technical-only route that renders an "Atmos" heading; it has no product UI, weather data or provider calls. |
| `apps/api` | `@atmos/api` | NestJS (ESM, compiled with `tsc`), global prefix `/api`. |
| `packages/contracts` | `@atmos/contracts` | Shared Zod schemas. Currently `healthResponseSchema` / `HealthResponse`. Import from `@atmos/contracts` in both apps; it is built (ESM + CJS + types) before consumers by Turbo. |

## Prerequisites

Node.js >= 22 (tested on 24), pnpm 12.14.0 (pinned via `packageManager`; use Corepack), Docker for the Compose workflow.

## Commands

```sh
pnpm install --frozen-lockfile   # install
pnpm build                       # build contracts, then api + web
pnpm typecheck
pnpm test
pnpm dev                         # contracts watch + api (tsx watch) + web (Vite)
pnpm clean                       # remove generated output
```

## Configuration

Copy `.env.example` to `apps/api/.env` (ignored by git). The API requires `NODE_ENV`, `PORT`, `DATABASE_URL` (PostgreSQL) and `REDIS_URL`; it refuses to start, naming the offending keys but not their values, if any is missing or invalid. The `apps/api/.env` file is not loaded automatically: export the variables in your shell (e.g. `set -a; . ./.env; set +a`) before `pnpm dev`. Backend connection values are server-side only and are never part of the browser bundle.

## Direct development (pnpm on host)

Run PostgreSQL on `localhost:5432` and Redis on `localhost:6379` (e.g. `docker compose up -d postgres redis`), then `pnpm dev`.
- Web: http://localhost:5173 — Vite proxies `/api` to `http://localhost:3000` (override with `API_PROXY_TARGET`).
- API: http://localhost:3000/api/health.
- Edits to web or API sources reload automatically. After editing `packages/contracts`, the contracts watcher rebuilds; dependents pick it up on reload.

## Docker Compose

```sh
docker compose up -d --build --wait    # dev stack: web :5173 (HMR), api :3000, postgres, redis
docker compose down                    # stop; named volumes (postgres-data, redis-data) are kept
docker compose down -v                 # also delete local data (explicit intent only)

# Production images: Nginx web on :8080 (static files, SPA fallback, /api/* -> http://api:3000)
docker compose -f compose.yaml -f compose.prod.yaml up -d --build --wait
```

Inside Compose the API uses `postgres:5432` / `redis:6379`; the Vite dev server proxies to `http://api:3000`. Dev containers bind-mount `src` directories, so source edits reload. The containerized API dev command runs `tsc --watch` (polling) plus `node --watch`; host `pnpm dev` uses `tsx watch`, which does not emit decorator metadata — move host dev to `tsc` as well before adding constructor-injected providers.

## Health semantics

`GET /api/health` returns HTTP 200 `{ "status": "ok" }` without authentication. It reports **process liveness only**: it stays 200 while PostgreSQL or Redis are down. Dependency availability is observed through their own Compose health checks (`docker compose ps`).

## Foundation verification record

Timestamped command results from a clean run: `openspec/changes/initialize-atmos-foundation/evidence.md` (author-run; the repository has no commit yet, so no revision hash exists).


| Check | Result |
|---|---|
| `rm -rf node_modules` + `pnpm install --frozen-lockfile` | pass (required `allowBuilds` in `pnpm-workspace.yaml`) |
| `pnpm build`, `pnpm typecheck` | pass |
| `pnpm test` (contracts 6, web 2, api 11) | pass |
| API start with valid env → `/api/health` | 200 `{"status":"ok"}` |
| API start with invalid/missing env | exits non-zero, keys only in message |
| `docker compose up --build --wait` (dev) | 4/4 healthy |
| Dev `/` and `/api/health` via `:5173`; source edit served by Vite | pass |
| Stop postgres / stop redis separately | Compose state `Exited (0)`; `/api/health` stayed 200 |
| Prod images via Nginx `:8080`: `/`, `/api/health`, `/some/client/route` | 200, 200 `{"status":"ok"}`, 200 (React shell, not 404) |
| Backend connection strings in browser assets | none found |
| Not run | browser-based HMR visual check; manual edit-reload of API/contracts in containers |
