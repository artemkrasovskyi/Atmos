# Atmos — Decision Log

**Purpose:** concise record of approved decisions and open questions, not an implementation specification. Proposed ideas are not approved.

## Product — Approved

- MVP: desktop-first Overview, Historical Analytics, account/favorites; live Open-Meteo data; Mapbox maps.
- Visual language: dark charcoal/navy + soft-blue accents; approved Overview Figma direction Light Map Focus (variant 2); Figma read-only to agent at implementation.
- Default first city Kyiv; persist last successfully selected city; city change commits only after weather success.
- 7-day forecast; day selection updates hourly/selected-day details. Favorites exclusively account-bound.
- No scheduled weather polling and no refetch triggered by tab focus/network reconnect; explicit user-driven requests, including manual Refresh.
- Account login/signup/preferences in modals; guest can use weather and analytics.
- Email verification, manual Google linking, password reset, location comparison, alerts, developer API, weather map layers, arbitrary map-click selection, export and advanced chart interactivity outside MVP.

## Stack and infrastructure — Approved

- pnpm workspaces + Turborepo, Docker and Docker Compose from start, cloud hosting eventually but no provider commitment (AWS candidate).
- Frontend: React, TypeScript, Vite, TanStack Router, TanStack Query, Zustand + Persist/localStorage (only last successful city and units), Tailwind CSS, shadcn/ui, Recharts, Mapbox GL JS, Axios.
- Backend: Node.js, NestJS Modular Monolith, feature modules; PostgreSQL + Prisma direct service injection; Redis cache and sessions; isolated OpenMeteoService and CacheService; built-in NestJS Logger; `@nestjs/config` + Zod.
- REST API under `/api` with no versioning and no obligatory `data/meta` success wrapper. Shared Zod contract package, global exception filter + standardized errors.
- Fresh TTL: current 10m, forecast 30m, historical 24h, location lookup 7d. Extra stale retention: current 1h, forecast 6h, historical 7d, lookup 30d. Stale-if-error, one upstream attempt, no automatic retry. Manual Refresh bypasses cache, 5m Redis-based per-city cooldown plus general protection.
- Passport.js/NestJS Guards, email/password + Google OAuth, Argon2id; Redis session cookie HttpOnly, sliding 7 days no absolute expiry. SameSite + Origin check + CSRF token; basic in-memory @nestjs/throttler keyed by IP in MVP.
- Google link by provider `sub`; auto-link to matching local account only if Atmos email confirmed and Google authoritative; given email verification deferred, no unsafe auto-link to unverified local accounts.
- DB conceptual four entities: User, OAuthAccount, Location, Favorite; uniqueness for provider identity and user/location favorite pairs, no permanent weather observations table.
- Minimum tests: a few backend Jest unit/smoke, Playwright critical E2E, fuller integration tests deferred.
- OpenSpec from day one; frontend and backend specifications are separate. A separate agent authors OpenSpec specs/proposals/tasks. Some backend functionality will be implemented manually for learning; task owner is decided per change, and AI must not implement manually assigned tasks without explicit permission.

## Foundation change — Approved 2026-10-23

- The user formally approved the current requirements, design, and implementation plan for OpenSpec change `initialize-atmos-foundation`.
- All Foundation implementation tasks, including NestJS Bootstrap, are owned by AI. Manual backend implementation begins with the future Weather API change.
- `GET /api/health` reports process liveness independently of PostgreSQL and Redis availability.
- NestJS uses `tsc` as its compiler.

## Foundation verification revision — Approved 2026-10-27

- The user requested removal of mandatory checks in a real running environment from `initialize-atmos-foundation` artifacts, then approved the revised Draft v2 requirements and plan. Acceptance checks may use automated tests, clean builds and static configuration inspection instead of a running browser, direct host stack, Compose outage or production Nginx origin.
- This revises the verification baseline only. The 2026-10-23 architecture and ownership decisions remain in force. Historical verification results are not promoted to PASS.
- The project owner directly instructed synchronization and archiving of this change. `AGENTS.md` now allows archiving on direct owner instruction even when verification is incomplete or blocked; the archived report must retain its actual status.

## Weather API staging — Approved 2026-10-27

- `WAPI-BE-DEC-001`: Redis weather/geocoding caching, stale-if-error behavior, and manual refresh cooldown are deferred from the Weather API stage. The existing caching architecture and TTL decisions remain the target for a later OpenSpec change. Source: project owner clarification on 2026-10-27.
- `WAPI-BE-DEC-002`: The owner implements core Open-Meteo provider integration, weather interpretation/normalization, and WeatherService behavior (or equivalents) as MANUAL work. All Weather API Backend tests, including tests for that core logic, belong to AI. Writing tests does not authorize AI to implement MANUAL core behavior. Source: project owner clarification on 2026-10-27.
- The project owner approved the `weather-api` requirements and acceptance criteria, then the technical design and implementation plan, on 2026-10-27. The five non-blocking requirements questions were dispositioned in the approved `WAPI-TDEC-001`–`006` decisions. The plan has three MANUAL core-service tasks and nine AI tasks, including all Backend tests; task execution and verification remain outstanding.

## Deferred / open decisions

- Cloud vendor, deployment layout, pricing, CI/CD; Figma connector setup; actual Figma URL.
- Exact weather fields/cards, history KPI and precise time presets/provider coverage, hour cut-off.
- API schemas outside the approved Weather API scope and final DB migration details.
- Eventual production password recovery/account deletion policy.

## Work conventions

Changes to these decisions should be approved by the user and carried into OpenSpec by the separate specification agent before implementation. Avoid asking for approval of trivial defaults; ask for significant architecture/security/scope/tradeoff changes.
