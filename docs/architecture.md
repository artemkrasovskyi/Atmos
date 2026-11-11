# Atmos — Technical Architecture

**Status:** Consolidated approved technical decisions, not an implementation design or OpenSpec spec. Changes to significant choices require user approval.

## Overview

Modular monolith on NestJS; React SPA; independent containers in a pnpm/Turborepo monorepo. Browser requests Atmos REST API, **never Open-Meteo directly**. Backend uses CacheService and OpenMeteoService; Redis stores weather cache and sessions; PostgreSQL stores durable user/favorite data.

### Chosen technology

| Layer | Choice |
|---|---|
| Repository | pnpm workspaces + Turborepo |
| Web | React + TypeScript + Vite + TanStack Router |
| Data/UI state | TanStack Query + Zustand; Zustand Persist/localStorage only for successful city and units |
| UI | Tailwind CSS + shadcn/ui, design from Figma |
| Chart/map | Recharts via shadcn/ui Charts; Mapbox GL JS |
| HTTP | Axios, withCredentials as required, centralized HTTP/error logic |
| Server | Node.js + NestJS + TypeScript, feature-oriented modular monolith |
| Persistence | PostgreSQL + Prisma; direct PrismaService injection into feature services (no mandatory repository layer) |
| Cache/sessions | Redis; custom cache-aside CacheService for weather; separate session store |
| Weather/geocoding | Open-Meteo, via isolated OpenMeteoService |
| Contract | REST + shared Zod schemas in `packages/contracts`; no mandatory OpenAPI client generation |
| Authentication | Passport strategies + NestJS Guards, email/password + Google OIDC; Argon2id |
| Config/logging | @nestjs/config + Zod; standard NestJS Logger |
| Testing | Minimal Jest backend smoke/unit, Playwright critical browser E2E; further integration tests deferred |
| Infra | Docker, Docker Compose locally; cloud provider/deployment architecture deferred (AWS candidate) |
| SDD | OpenSpec from day one; frontend/backend specifications separate; OpenSpec specs and tasks authored by a separate agent |

## System request paths

1. Search in the Weather API stage: React/Axios → `GET /api/locations/search` → LocationsService → OpenMeteoService geocoding API → normalized Zod-compatible REST JSON. A later caching change inserts CacheService into this path.
2. Weather in the Weather API stage: React/TanStack Query → `GET /api/weather` → WeatherController → WeatherService → OpenMeteoService → normalized data → React. A later caching change adds cache-aside Redis behavior between WeatherService and OpenMeteoService.
3. Forecast data is provided with current conditions for the initial slice. When caching is introduced later, maintain **distinct freshness policies** where data is independently cached. That change must resolve how composite cache entries respect separate current/forecast TTL rather than silently reducing them to a single arbitrary TTL.
4. Auth (later): Passport/NestJS guards → Prisma user/account models → Redis session + HttpOnly session cookie. Google credentials are handled server-side.
5. Favorites (later): authenticated endpoints → FavoritesService → Prisma/PostgreSQL. PostgreSQL does not participate in ordinary weather reads.

## API and contracts

- Prefix `/api`; no `/v1` URI prefix in MVP.
- JSON success responses are payloads directly, no mandatory `data` envelope. `204` permitted for deletes.
- Unified API error `{ code, message, statusCode, details? }` via global NestJS exception filter; safe generic `INTERNAL_ERROR` for unexpected conditions. Zod error shape belongs in shared contracts.
- Shared schemas must be explicit about inputs and outputs, have no runtime client-only/backend-only dependencies, and be validated at API boundaries. TypeScript's type checking does not validate HTTP JSON.
- Generated OpenAPI is optional future enhancement; do not silently change source of truth.
- Initial endpoints: `/api/health`, `/api/locations/search?q=...`, `/api/weather?locationId=...`. API ID and schema details are future change work, not completed contracts.
- Axios uses credentials where required, safe CSRF handling and normalized error transformation; Query handles server state, not Zustand.

## Client state and data loading

- Zustand: globally active city (commit only after successful fetch), selected forecast day, sidebar and analytics selections.
- Zustand Persist/localStorage: last successfully selected city and units only; no session IDs, tokens, secrets or full weather responses.
- TanStack Query: keyed weather, history, favorites/account server data; `staleTime: Infinity` as a starting policy; disable focus/reconnect/interval refetch and automatic mount refetch for already cached data; explicitly load new/missing query keys on intended navigation/actions. Control concurrency so stale city responses cannot overwrite newly selected city.
- Default city Kyiv if none successfully persisted. Recenter map when opening Overview. Unit conversion on frontend from canonical backend units.
- Initial sign-in and account settings are modals, not standalone pages.

## Backend modules (illustrative, subject to feature-level design)

`auth`, `users`, `locations`, `favorites`, `weather`, `analytics`, `database`, `cache`, `integrations/open-meteo`, `config`, `common`. Controllers accept HTTP; services hold feature rules; integration client isolates provider APIs; CacheService isolates Redis mechanics. Inject PrismaService directly as needed. Avoid speculative interfaces/repository wrappers.

## Relational model (conceptual; not a migration)

- `User`: unique normalized email, displayName?, passwordHash?, emailVerified (default false), timestamps. Google-only users may have null passwordHash.
- `OAuthAccount`: user FK, provider, providerAccountId (`sub`), unique provider/account identifier; delete with user.
- `Location`: own UUID, unique stable Open-Meteo geocoding provider ID, name, optional region, country code, latitude, longitude, timezone; saved when persistently needed, not for every search.
- `Favorite`: user FK, location FK, unique `(userId, locationId)`, createdAt; deleted with user, location retained when removed from favorite.
- Real ID types, email normalization, optional fields and indexes decided in corresponding OpenSpec changes. No permanent weather-record tables in MVP.

## Redis caching and upstream resilience

The project owner deferred Redis weather/geocoding caching, stale-if-error behavior, and manual refresh cooldown from the Weather API stage on 2026-10-27. The design below remains the approved target for a later change; it is not a requirement for the current Weather API change.

| Record | Fresh | Extra stale retention |
|---|---|---|
| Current conditions | 600s | 3,600s |
| Hourly + daily forecast | 1,800s | 21,600s |
| Historical analytics | 86,400s | 604,800s |
| Geocoding | 604,800s | 2,592,000s |

- Cache-aside: return fresh on hit; expired/miss invokes Open-Meteo once; on upstream failure may serve retained stale copy marked `stale: true` with `updatedAt`/fetched timestamp. No background polling or upstream automatic retries.
- Store effective freshness expiry *within* value or as separate keys, and physically retain through fresh+extra-stale duration. TTL semantics must be tested for boundaries.
- Forced Refresh: bypass fresh weather cache, request upstream, update successful cached fields, preserve former good data on error; never report stale fallback as a successful fresh refresh.
- Forced per-city cooldown 300s via Redis, shared globally among users; atomic locking / dedup of same-city overlapping refresh requests. Failed upstream attempt should not establish a new full cooldown. Reply 429 with Retry-After while limited. General abuse protection independent of per-city throttle.
- Session Redis keys and weather-cache keys must be separated by prefix/namespace and lifetime. Cache failures should be handled deliberately; session-store failure must **not** silently authenticate anyone.

## Authentication / security baseline

- Passport/NestJS guards + Argon2id; server-side Redis sessions with sliding inactivity TTL 7 days, no absolute session expiry. Destroy session on logout and rotate session ID after authentication. Session cookie HttpOnly, Secure in production, SameSite Lax by default (deployment domain decisions may require changes).
- CSRF defense in depth: SameSite + trusted Origin check + CSRF token for state-changing cookie-authenticated requests. Validate CORS allowlist and trusted reverse proxy addresses; cookie settings and CSRF/OAuth callback details verified against actual domain topology.
- Google sign-in lookup by verified provider identity (`sub`), not email. Auto-link only if existing Atmos email was verified AND Google is authoritative for that address; conflict otherwise. No email verification, manual linking, or password reset within MVP; no dead-end UI links. Google OAuth/OIDC state and token validation required.
- `@nestjs/throttler` IP-based in-memory limits for MVP authentication; real-client IP behind reverse proxy must be configured; distribute via Redis if adding multiple API replicas.
- Never log passwords, credentials, auth cookies, tokens or sensitive headers; NestJS Logger to stdout/stderr for Docker.

## Env / Docker / cloud

- `@nestjs/config` with Zod startup validation, separate local/test/prod config and tracked `.env.example` without secrets. Example variables: `DATABASE_URL`, `REDIS_URL`, Google OAuth credentials, allowed origins, session secret, Mapbox public browser token, current/forecast/history/geocoding fresh and extra-stale TTLs, `WEATHER_REFRESH_COOLDOWN=300`.
- Local Docker Compose services: web, api, PostgreSQL, Redis. Multi-stage images targeted for production, with reproducible pnpm installs and a dedicated migration deployment phase. Docker Compose development should remain practical with hot reload/mounts or documented scripts.
- The user may also run web/api directly via pnpm for faster debug. Cloud choice, managed DB/Redis, hosting design, CI/CD and networking remain **deferred**; AWS is only a possible provider.

## Verification expectations

- Foundation: verify install, build, typecheck, shared contracts, API health and environment validation with automated checks; inspect development scripts, Docker Compose and production routing configuration without requiring a running browser, host application stack, dependency outage or Compose environment. Runtime behavior remains part of the Foundation design.
- Feature-level: verify acceptance against specs, minimal backend Jest tests where meaningful, Playwright happy-path/critical UX after UI exists. No component-by-component/frontend unit coverage policy. No mandatory coverage percentage. Future Testcontainers may be introduced in a later change.

## Deferred architecture questions

- NestJS compiler: tsc vs SWC not yet ratified.
- More detailed Open-Meteo response mapping (weather fields and availability), data model location identity/timezone resolution, map keys/config, history aggregation/KPI decisions.
- Full production security review (account recovery, deployment origins/proxies, email risks), CI/CD and cloud provider selection.
