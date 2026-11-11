# Design

## Context

See `proposal.md` for motivation. The Foundation requirements, design, and implementation plan were approved by the project owner on 2026-10-23, with all Foundation implementation tasks delegated to AI, including the NestJS bootstrap. Manual Backend implementation begins with the future Weather API change. At planning time, the inspected repository already declared pnpm 12.14.0, Turbo 2.11.9, workspace globs and Turbo build/dev/typecheck/lint tasks; no application or contracts sources existed. Reuse those files and the lockfile. AGENTS.md and claude.md require approval and explicit AI delegation.

On 2026-10-27, the project owner requested removal of mandatory verification in a running environment and explicitly approved the revised Foundation requirements, design, and implementation plan (v2). The 2026-10-23 approval remains in the decision history. Runtime architecture and expected application behavior are unchanged. Approval of the revision does not establish an independent verification result.

## Goals / Non-Goals

**Goals:** Connect one technical TanStack Router root route, one NestJS health endpoint and one shared runtime schema through reproducible workspace and local container workflows.

**Non-Goals:** Weather, Auth, Prisma models/migrations, product UI, general error contracts/filters, provider calls, cloud deployment and future-feature dependencies. The technical root route needs no invented product design or Figma editing.

## Decisions

### IAF-TDEC-001 — Workspace and shared package

**Problem:** Consumers must resolve executable contracts from a clean checkout. **Decision:** Use `apps/web` (`@atmos/web`), `apps/api` (`@atmos/api`) and `packages/contracts` (`@atmos/contracts`) with `workspace:*` dependencies. Build contracts before consumers; expose ESM/CommonJS runtime entry points and declarations using TypeScript output, with Zod as the package's only runtime dependency. Bootstrap contracts once before starting development watchers. **Rationale:** Supports Vite and conventional NestJS without application-to-application imports. **Alternative:** source aliases require runtime loaders and hide package-boundary errors. **Affected Tasks:** IAF-TASK-001–004, 013. **Constraints:** health schema only; document contract-change reload behavior.

### IAF-TDEC-002 — Minimal NestJS bootstrap

**Problem:** The Foundation requires explicit compiler and probe semantics. **Decision:** Use `tsc`, standard NestJS Logger, `/api` global prefix and a registered health controller returning schema-validated `{ "status": "ok" }`. `GET /api/health` reports process liveness independently of PostgreSQL and Redis availability, consistent with IAF-BE-ASM-001. The project owner approved these choices on 2026-10-23. **Rationale:** A small learning foundation needs neither dependency clients nor readiness orchestration. **Alternatives:** SWC adds a compiler choice; dependency-aware readiness adds clients and failure semantics, requiring a revised approved spec. **Affected Tasks:** IAF-TASK-005–007. **Constraints:** no readiness claim.

### IAF-TDEC-003 — Startup configuration only

**Problem:** Invalid environment values must not start a misleadingly healthy process. **Decision:** Validate foundation settings with `@nestjs/config` and Zod before listening: `NODE_ENV` (development/test/production), integer `PORT` (1–65535), PostgreSQL `DATABASE_URL` and Redis `REDIS_URL`. Supply explicit valid examples/test inputs; diagnostics identify bad keys without values. No future-feature credentials are required. **Rationale:** Establishes safe startup boundaries without DB/Redis client functionality. **Alternative:** accepting unchecked strings delays failure into future features. **Affected Tasks:** IAF-TASK-005, 006. **Constraints:** examples contain local placeholders only; no secret values in browser variables or logs.

### IAF-TDEC-004 — Technical route and local routing

**Problem:** Router wiring and browser contract compatibility need observable checks without product UI. **Decision:** Mount TanStack Router with a root route rendering an Atmos identifier. Use an isolated browser-targeted test for route rendering and shared schema parsing; do not add product screens or status widgets. Vite proxies `/api` to `http://localhost:3000` directly and `http://api:3000` in Compose; web defaults to 5173. **Rationale:** The route test and configuration inspection cover the root route and proxy wiring while container hostnames stay server-side. **Alternative:** browser cross-origin URLs need premature CORS configuration. **Affected Tasks:** IAF-TASK-008–010, 014. **Constraints:** no external providers, Router state features or unused feature libraries. **Production routing:** The production frontend container SHALL use Nginx to serve the Vite static build and reverse-proxy `/api/*` requests to the NestJS service at `http://api:3000`. Nginx SHALL provide SPA fallback to `index.html` for client-side routes. The Vite development proxy SHALL only be used in development.

### IAF-TDEC-005 — Four-service local environment

**Problem:** Local infrastructure and application reload must work reproducibly. **Decision:** Root-context multi-stage web/API Dockerfiles use frozen pnpm installs; Compose selects development targets with source mounts and separate dependency storage. PostgreSQL/Redis use named data volumes and native probes; web/API probes request `/` and `/api/health`. Provide production build targets (compiled Node API and served static web assets) without designing deployment ingress. **Rationale:** Retains practical reload while checking image builds. **Alternative:** production-only local containers slow iteration; dev-only images miss the architecture's build requirement. **Affected Tasks:** IAF-TASK-011–014. **Constraints:** pin tested image/runtime versions, exclude secrets/host dependencies from build context; no migration execution without a schema. **Production web image:** Use a multi-stage Dockerfile. The build stage SHALL compile the React application with Vite. The production stage SHALL use Nginx to serve the generated static files and proxy `/api/*` to the NestJS container using the Docker Compose service name `api`. The development stage SHALL continue using the Vite development server with HMR.

## Risks / Trade-offs

- [Foundation ownership and future Backend boundaries] → All Foundation tasks, including NestJS bootstrap, are AI-owned under the 2026-10-23 approval. Manual Backend implementation begins with the future Weather API change and follows that change's task ownership.
- [Package exports or mounts break reload/build] → Verify both consumers from clean output and production image targets; inspect development watch and mount configuration.
- [Liveness mistaken for readiness] → Document semantics, inspect independent dependency probes, and use an isolated API HTTP test with unavailable dependency endpoints.

## Migration Plan

No business data or deployed application needs migration. Implement workspace/contracts, API, web, then containers. Document setup, direct development, builds, tests and shutdown in each owning task. Shutdown preserves named volumes; deleting local data requires explicit intent. Rollback reverts foundation implementation while preserving existing context and user data. Cloud rollout remains deferred.
