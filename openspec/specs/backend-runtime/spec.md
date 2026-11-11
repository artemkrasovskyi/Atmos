# Backend Runtime

## Purpose

Provide a locally runnable Atmos API with predictable startup and a small health contract for foundation smoke checks.

## Metadata

- Status: Approved; Source change: `initialize-atmos-foundation`; Approved: 2026-10-27.

## Requirements

### Requirement: IAF-BE-REQ-001 — API health response
After successful startup, the API SHALL serve unauthenticated `GET /api/health` with HTTP 200 and the shared-schema-valid JSON body `{ "status": "ok" }`, without an envelope or version prefix. Under approved decision `IAF-BE-ASM-001`, dependency outages SHALL NOT change this process-liveness response.

#### Scenario: IAF-BE-AC-001 — Health succeeds
- **WHEN** a client requests `GET /api/health` from a running API
- **THEN** it receives HTTP 200 and exactly `{ "status": "ok" }` as JSON.

#### Scenario: IAF-BE-AC-002 — Health is independent of dependencies
- **GIVEN** valid API configuration with PostgreSQL and Redis endpoints that are unavailable to the isolated test
- **WHEN** a Jest HTTP smoke test requests `GET /api/health` without connecting to either dependency
- **THEN** it receives HTTP 200 and exactly `{ "status": "ok" }`.

### Requirement: IAF-BE-REQ-002 — Validated foundation startup
The API SHALL validate documented foundation environment settings before accepting requests. Missing or malformed required values SHALL prevent startup and produce diagnostics that identify invalid setting names without exposing their values or credentials.

#### Scenario: IAF-BE-AC-003 — Valid configuration
- **WHEN** the API starts with valid documented local or test settings and no future-feature credentials
- **THEN** it begins serving `GET /api/health`.

#### Scenario: IAF-BE-AC-004 — Invalid configuration
- **WHEN** a required setting is absent or malformed
- **THEN** the API exits unsuccessfully before accepting requests
- **AND** diagnostics identify the affected setting without printing its value or any credentials.
