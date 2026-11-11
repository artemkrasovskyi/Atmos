# API Contracts

## Purpose

Provide one executable foundation health contract that both the browser application and API can import from `packages/contracts`.

## Metadata

- Status: Approved; Source change: `initialize-atmos-foundation`; Approved: 2026-10-27.

## Requirements

### Requirement: IAF-CON-REQ-001 — Shared health schema
The shared package SHALL export a Zod runtime schema and matching TypeScript type for a health response whose `status` is the literal string `ok`. Both applications SHALL consume the same package definition rather than duplicate it.

#### Scenario: IAF-CON-AC-001 — Parse valid and invalid responses
- **WHEN** a consumer parses `{ "status": "ok" }` with the shared schema
- **THEN** parsing succeeds
- **AND** parsing a missing, numeric, or different `status` fails.

### Requirement: IAF-CON-REQ-002 — Cross-runtime package resolution
The shared package SHALL resolve its runtime schema and type from both API and browser development and production builds without application-specific runtime dependencies or previously generated output in a clean checkout.

#### Scenario: IAF-CON-AC-002 — Clean consumer builds
- **GIVEN** a checkout without generated application or contract output
- **WHEN** the documented workspace build runs
- **THEN** both applications resolve the shared schema and its type
- **AND** runtime parsing works in API and browser-targeted verification.
