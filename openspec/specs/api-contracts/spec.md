# API Contracts

## Purpose

Provide shared executable health and Weather API contracts that both the browser application and API can import from `packages/contracts`.

## Metadata

- Status: Approved; Source changes: `initialize-atmos-foundation` and `weather-api`; Weather API requirements approved: 2026-10-27.

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

### Requirement: WAPI-CON-REQ-001 — Shared identifiable location result
Status: Active. Shared browser/server contract definitions SHALL represent each search result with a selection reference, city, country, and optional region, and SHALL preserve the distinction between an empty match set and invalid-input or search-failure outcomes. Source: product input, City search; `docs/architecture.md` API and contracts.

#### Scenario: WAPI-CON-AC-001 — Location result validation
Covers: WAPI-CON-REQ-001.
- **WHEN** API and browser validate a search result
- **THEN** they agree on the selection reference, city, country and optional region; a result missing a required identifier or place label is rejected.

#### Scenario: WAPI-CON-AC-002 — Distinct search outcomes
Covers: WAPI-CON-REQ-001.
- **WHEN** an empty match set, invalid search input, or provider failure is represented
- **THEN** consumers can distinguish the three outcomes without treating an error as an empty success.

### Requirement: WAPI-CON-REQ-002 — Shared weather result with missing-value fidelity
Status: Active. Shared browser/server contract definitions SHALL identify the selected location, its time zone, current observation time, available current measurements and their units, hourly entries, and seven local daily forecast dates. A source value that is unavailable SHALL remain distinguishable from a measured zero. Source: product input, Current weather and Forecast; `docs/architecture.md` API and contracts.

#### Scenario: WAPI-CON-AC-003 — Weather result validation
Covers: WAPI-CON-REQ-002.
- **WHEN** API and browser validate a weather result for a selected location
- **THEN** they agree on location identity, time zone, observation timestamp, measurement/unit meaning, hourly entries and local daily dates.

#### Scenario: WAPI-CON-AC-004 — Missing is not zero
Covers: WAPI-CON-REQ-002.
- **WHEN** a weather measurement is unavailable in source data
- **THEN** the contract represents that absence distinctly from a valid numeric zero in both API and browser validation.
