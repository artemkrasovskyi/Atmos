# API Contracts — Weather API Delta

## Purpose

Extend the existing shared health-contract package with browser/server contracts for the Weather API journey.

### Metadata

- Feature: Weather API; Feature ID: `weather-api`; Feature Prefix: `WAPI`.
- Spec ID: `api-contracts`; Spec Prefix: `WAPI-CON`; Parent Feature: `weather-api`.
- Status: Approved; Version: 1; Created: 2026-10-27; Approved: 2026-10-27; Language: English.
- Change history: initial Weather API requirements and acceptance criteria approved by the project owner on 2026-10-27.
- Sources: Atmos Weather API product input (2026-10-27); `docs/architecture.md` API and contracts; canonical `openspec/specs/api-contracts/spec.md`.
- Existing behavior: `IAF-CON-REQ-001` and `IAF-CON-REQ-002` define only the Foundation health contract and remain unchanged.

## ADDED Requirements

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

