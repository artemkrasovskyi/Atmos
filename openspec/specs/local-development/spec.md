# Local Development

## Purpose

Let a developer install, run, build, and check the Atmos foundation from a clean checkout with the existing pnpm workspace and local containers.

## Metadata

- Status: Approved; Source change: `initialize-atmos-foundation`; Approved: 2026-10-27.

## Requirements

### Requirement: IAF-DEV-REQ-001 — Reproducible workspace
The repository SHALL provide documented root install, build, typecheck, and development commands using its declared pnpm version, lockfile, workspace packages, and Turborepo dependency order.

#### Scenario: IAF-DEV-AC-001 — Clean workspace check
- **GIVEN** a clean checkout with documented prerequisites
- **WHEN** the frozen install, build, and typecheck commands run
- **THEN** they succeed without preexisting generated package output or lockfile changes.

### Requirement: IAF-DEV-REQ-002 — Direct application development
The documented local workflow SHALL run web and API directly with pnpm while PostgreSQL and Redis run locally, and SHALL make frontend and backend source edits observable through development reload.

#### Scenario: IAF-DEV-AC-002 — Check direct-development setup
- **WHEN** the documented direct-development commands, workspace scripts, Vite proxy, and frontend/backend watcher configuration are reviewed alongside the isolated route and API health tests
- **THEN** the configured commands target the web and API applications, `/api` routes to the documented local API address, and the watcher configuration covers frontend and backend source edits.

### Requirement: IAF-DEV-REQ-003 — Four-service Compose environment
Docker Compose SHALL run web, API, PostgreSQL, and Redis locally with observable health checks. PostgreSQL and Redis probes SHALL report their own availability independently of the API health endpoint.

#### Scenario: IAF-DEV-AC-003 — Check local stack configuration
- **WHEN** the Compose definition passes configuration validation and the service and Dockerfile definitions are inspected
- **THEN** web, API, PostgreSQL, and Redis are configured with the documented build/start paths and health checks
- **AND** web-origin `/` and `/api` routing targets the configured frontend and API services.

#### Scenario: IAF-DEV-AC-004 — Check independent dependency probes
- **WHEN** the PostgreSQL and Redis health-check definitions are inspected and the isolated API health test uses unavailable dependency endpoints
- **THEN** each dependency has its own probe that does not use API health
- **AND** the isolated API health response follows IAF-BE-REQ-001.

### Requirement: IAF-DEV-REQ-004 — Safe foundation configuration
Tracked examples and setup documentation SHALL identify required foundation variables and host/container values without real secrets or future-feature credentials. Local secret files SHALL be ignored, and server connection values SHALL not enter the browser bundle.

#### Scenario: IAF-DEV-AC-005 — Configure a fresh checkout
- **WHEN** tracked environment examples, setup instructions, startup validation tests, ignore rules, and generated frontend assets are checked
- **THEN** only foundation settings are required, with no Weather, Auth, Mapbox, or Prisma-model setup
- **AND** tracked examples contain no real credentials, local secret files are ignored, and server connection values are absent from frontend assets.

### Requirement: IAF-DEV-REQ-005 — Foundation verification evidence
Verification SHALL record the outcomes of install, build, typecheck, shared-schema parsing, isolated API health and frontend route tests, and Compose configuration validation; failed or unavailable checks SHALL remain visible. A running browser, host application, or Compose stack is not required for Foundation acceptance.

#### Scenario: IAF-DEV-AC-006 — Review verification results
- **WHEN** the implementation is submitted for review
- **THEN** each required check has a recorded result or an explicit reason it was not run
- **AND** failures are not reported as passes.

#### Scenario: IAF-DEV-AC-007 — Production frontend API routing

- **WHEN** the production frontend image configuration and build output are inspected
- **THEN** the Nginx configuration serves the built frontend, proxies `/api/*` to the NestJS service, and falls back to `index.html` for client-side routes
- **AND** that production proxy configuration does not depend on the Vite development proxy.
