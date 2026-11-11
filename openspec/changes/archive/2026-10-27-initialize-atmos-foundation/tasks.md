# Tasks

The project owner approved the Foundation requirements, design, and implementation plan on 2026-10-23. All Foundation implementation tasks are delegated to AI, including the NestJS bootstrap. `GET /api/health` is process liveness independent of PostgreSQL and Redis (`IAF-BE-ASM-001`), and the NestJS compiler is `tsc`. Manual Backend implementation begins with the future Weather API change.

The 2026-10-27 verification-plan revision removes mandatory checks in a running browser, host development stack, or Compose stack at the project owner's request. The project owner explicitly approved this revised plan (v2) on 2026-10-27; completed task checkboxes record implementation history, not independent AC passes.

## 1. Workspace baseline — AI

- [x] IAF-TASK-001 — 1.1 Extend the existing pnpm workspace/Turbo root scripts for install, build, typecheck, and development; verify package discovery and dependency order with `pnpm install --frozen-lockfile` and the root build/typecheck commands. (IAF-DEV-REQ-001)
- [x] IAF-TASK-002 — 1.2 Document the supported Node/pnpm versions and direct setup commands in the README; verify every documented command is present in root scripts. (IAF-DEV-REQ-001)

## 2. Shared health contract — AI

- [x] IAF-TASK-003 — 2.1 Create `packages/contracts` with one Zod health schema/type and package exports consumable by API and browser; verify `{ "status": "ok" }` succeeds and missing, numeric, or different `status` fails in focused schema tests, and check emitted runtime/type exports. (IAF-CON-REQ-001)
- [x] IAF-TASK-004 — 2.2 Add a clean build path that builds contracts before consumers, plus a brief package usage note; from cleared generated output, verify both consumers resolve the runtime schema and type, and that API and browser-targeted checks execute parsing. (IAF-CON-REQ-002)

## 3. NestJS runtime — AI

- [x] IAF-TASK-005 — 3.1 Scaffold `apps/api` with NestJS on Node, the unversioned `/api` prefix, and `GET /api/health` using the shared schema; verify a Jest HTTP smoke test returns HTTP 200 and exactly `{ "status": "ok" }` without authentication. (IAF-BE-REQ-001)
- [x] IAF-TASK-006 — 3.2 Add foundation startup validation with `@nestjs/config` and Zod for the documented runtime, port, PostgreSQL URL, and Redis URL values; verify valid local/test settings without future-feature credentials serve health, while each invalid/missing required setting exits unsuccessfully before listening and diagnostics name the setting without exposing values or credentials. (IAF-BE-REQ-002)
- [x] IAF-TASK-007 — 3.3 Document the health response as process liveness and API development commands; use an isolated Jest HTTP smoke test with unreachable PostgreSQL and Redis endpoints to verify health remains HTTP 200 with exactly `{ "status": "ok" }`. (IAF-BE-REQ-001)

## 4. Frontend technical route — AI

- [x] IAF-TASK-008 — 4.1 Scaffold `apps/web` with React, TypeScript, Vite, and TanStack Router; mount a technical `/` route with an Atmos identifier; verify root rendering in an isolated router test and confirm development and production builds succeed. (IAF-FE-REQ-001)
- [x] IAF-TASK-009 — 4.2 Configure the development `/api` proxy and a browser-targeted check that executes the shared health schema; verify valid/invalid payload parsing in development and build output without server-only imports. (IAF-FE-REQ-003)
- [x] IAF-TASK-010 — 4.3 Check that the root route renders without feature credentials, weather values, provider calls, or product controls; verify this in the route smoke check and document its technical-only purpose. (IAF-FE-REQ-002)

## 5. Local containers and configuration — AI

- [x] IAF-TASK-011 — 5.1 Add root-context multi-stage web/API Dockerfiles and Compose services for web, API, PostgreSQL, and Redis, with separate dependency probes and persistent local data volumes; verify `docker compose config`, production image builds, and static service/probe/volume wiring. Configure the production web image with Nginx, including static asset serving, SPA fallback, and reverse proxy from `/api/*` to `http://api:3000`. Keep the Vite development server and its proxy configuration for development. (IAF-DEV-REQ-003)
- [x] IAF-TASK-012 — 5.2 Add safe tracked environment examples, ignore local secrets, and document host/container addresses, direct pnpm development, Compose start/stop, and reload behavior; inspect documented host web/API scripts, Vite proxy and watcher settings alongside isolated route and API health tests, compile the source paths, check startup validation tests and examples for foundation-only settings, inspect ignore rules, and check built browser assets for absent backend connection values. (IAF-DEV-REQ-002, IAF-DEV-REQ-004)

## 6. Cross-service verification — AI

- [x] IAF-TASK-013 — 6.1 In an isolated clean checkout or equivalent copy without generated package/application output, run frozen install without lockfile changes, root build/typecheck, shared-schema parsing, isolated API health and frontend route tests, `docker compose config`, and production image builds; record each result or reason unavailable, keeping failures visible. (IAF-CON-REQ-002, IAF-DEV-REQ-005)
- [x] IAF-TASK-014 — 6.2 Inspect `docker compose config` and Dockerfiles to confirm four services, independent PostgreSQL and Redis health probes, web/API probes, dependency wiring and volumes. Inspect Nginx production configuration and built image artifacts to confirm `/api/*` proxying to `http://api:3000` without the Vite proxy, plus SPA fallback to `index.html`; cross-check isolated API health and route tests. (IAF-DEV-REQ-003, IAF-BE-REQ-001)

## Requirement coverage

All Foundation implementation tasks are owned by `AI`. The verification owner is one existing task responsible for preparing the stated check and evidence for its AC. `Implementation Verifier` is the separate verification responsibility and determines results; the ownership map makes no pass claim.

| AC | Requirement | Implementing task(s) | Implementation owner | Verification owner task | Verification responsibility | Required action and evidence |
|---|---|---|---|---|---|---|
| IAF-CON-AC-001 | IAF-CON-REQ-001 | IAF-TASK-003 | AI | IAF-TASK-003 | Implementation Verifier | Focused schema test accepts `ok` and rejects missing, numeric, and other statuses; test output. |
| IAF-CON-AC-002 | IAF-CON-REQ-002 | IAF-TASK-004, IAF-TASK-013 | AI | IAF-TASK-004 | Implementation Verifier | Clear generated output; build both consumers and execute API/browser parsing; build and check output. |
| IAF-BE-AC-001 | IAF-BE-REQ-001 | IAF-TASK-005, IAF-TASK-014 | AI | IAF-TASK-005 | Implementation Verifier | Unauthenticated Jest HTTP smoke requests unversioned `/api/health`; HTTP 200 and exact JSON body in test output. |
| IAF-BE-AC-002 | IAF-BE-REQ-001 | IAF-TASK-007, IAF-TASK-014 | AI | IAF-TASK-007 | Implementation Verifier | Isolated Jest HTTP smoke test with unreachable dependency endpoints; HTTP 200 and exact body in test output. |
| IAF-BE-AC-003 | IAF-BE-REQ-002 | IAF-TASK-006 | AI | IAF-TASK-006 | Implementation Verifier | Start with valid local/test settings and no future credentials; health request and startup output. |
| IAF-BE-AC-004 | IAF-BE-REQ-002 | IAF-TASK-006 | AI | IAF-TASK-006 | Implementation Verifier | Omit or malform each required setting; failed exit before listening and redacted diagnostics. |
| IAF-FE-AC-001 | IAF-FE-REQ-001 | IAF-TASK-008 | AI | IAF-TASK-008 | Implementation Verifier | Isolated TanStack Router root-render test plus successful development and production builds; test and build output. |
| IAF-FE-AC-002 | IAF-FE-REQ-002 | IAF-TASK-010 | AI | IAF-TASK-010 | Implementation Verifier | Route smoke without feature config; rendered identifier and absence of provider calls, sample weather, and controls. |
| IAF-FE-AC-003 | IAF-FE-REQ-003 | IAF-TASK-009 | AI | IAF-TASK-009 | Implementation Verifier | Browser-targeted valid/invalid schema parsing in development and production build; check and build output. |
| IAF-DEV-AC-001 | IAF-DEV-REQ-001 | IAF-TASK-001, IAF-TASK-002, IAF-TASK-013 | AI | IAF-TASK-013 | Implementation Verifier | Clean-output frozen install, root build and typecheck; command results and unchanged lockfile. |
| IAF-DEV-AC-002 | IAF-DEV-REQ-002 | IAF-TASK-012, IAF-TASK-014 | AI | IAF-TASK-012 | Implementation Verifier | Inspect documented host scripts, proxy and watcher configuration alongside isolated route and API tests; compile web/API source paths and record configuration/build/test evidence. |
| IAF-DEV-AC-003 | IAF-DEV-REQ-003 | IAF-TASK-011, IAF-TASK-014 | AI | IAF-TASK-014 | Implementation Verifier | Validate Compose configuration and Dockerfiles for four services, health probes, volumes and web/API routing; config and inspection evidence. |
| IAF-DEV-AC-004 | IAF-DEV-REQ-003 | IAF-TASK-011, IAF-TASK-014 | AI | IAF-TASK-014 | Implementation Verifier | Inspect independent PostgreSQL/Redis probes and compare with isolated API HTTP test using unreachable dependency endpoints; configuration and test evidence. |
| IAF-DEV-AC-005 | IAF-DEV-REQ-004 | IAF-TASK-012 | AI | IAF-TASK-012 | Implementation Verifier | Inspect tracked examples, startup validation tests, ignored local secret files, documentation and built browser assets; no real credentials, future-feature setup or server connection values. |
| IAF-DEV-AC-006 | IAF-DEV-REQ-005 | IAF-TASK-013, IAF-TASK-014 | AI | IAF-TASK-013 | Implementation Verifier | Record frozen install, build, typecheck, schema/API/route tests, Compose config and image build outcomes or reasons unavailable; failures stay visible. |
| IAF-DEV-AC-007 | IAF-DEV-REQ-005 | IAF-TASK-011, IAF-TASK-014 | AI | IAF-TASK-014 | Implementation Verifier | Inspect Nginx production configuration and image artifacts for `/api/*` proxy to API, static assets and SPA fallback, independent of Vite proxy. |

## Workflow follow-up

- Foundation requirements, design, implementation plan, process-liveness semantics, `tsc` compiler choice, and AI task ownership were approved by the project owner on 2026-10-23.
- On 2026-10-27 the project owner approved the revision removing mandatory running-environment verification. This approval makes no new AC pass claim.
- The project owner directly requested archival on 2026-10-27. Under the direct-instruction exception in `AGENTS.md`, archive may proceed with the existing historical verification report retained and its status explicitly disclosed; archival does not convert any AC to PASS.
