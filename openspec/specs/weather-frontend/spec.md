# Weather Frontend

## Purpose

Expose a minimal technical journey from city search through selected-location weather without building the Weather Dashboard.

### Metadata

- Feature: Weather API; Feature ID: `weather-api`; Feature Prefix: `WAPI`.
- Spec ID: `weather-frontend`; Spec Prefix: `WAPI-FE`; Source change: `weather-api`.
- Status: Approved; Version: 1; Created: 2026-10-27; Approved: 2026-10-27; Language: English.
- Change history: initial Weather API requirements and acceptance criteria approved by the project owner on 2026-10-27.
- Sources: Atmos Weather API product input (2026-10-27); `docs/product.md` WD-01–03, WD-06–08; `docs/architecture.md` client state; `docs/design-reference.md` interaction rules.
- Scope: minimal search, selection, result and state verification surface; no Dashboard, map, polished widgets, authentication, favorites or unit-preference controls.

## Requirements

### Requirement: WAPI-FE-REQ-001 — Search and select a specific city
Status: Active. When the user enters a city name, the frontend SHALL obtain matching locations through Atmos and expose enough city/region/country information to select one specific result. It SHALL distinguish no matches, invalid input, loading, and search failure. Source: product input, City search and Minimal frontend integration; `docs/product.md` WD-02.

#### Scenario: WAPI-FE-AC-001 — Search results and selection
Covers: WAPI-FE-REQ-001.
- **WHEN** a query yields similarly named cities
- **THEN** the technical surface distinguishes them by available city, region, and country information and lets the user select one result.

#### Scenario: WAPI-FE-AC-002 — Search states
Covers: WAPI-FE-REQ-001.
- **WHEN** a search is loading, has no matches, has invalid input, or fails
- **THEN** each state can be distinguished without showing fabricated results.

### Requirement: WAPI-FE-REQ-002 — Keep active weather during switching
Status: Active. While a newly selected location's weather is loading, the last successfully loaded location and weather SHALL remain active. Only successful weather loading SHALL commit the new active location and reset the selected forecast day to local today. On failure, the old location/data remain accessible and retry is available. Source: product input, Switching cities; `docs/product.md` WD-02, WD-08.

#### Scenario: WAPI-FE-AC-003 — Pending then successful switch
Covers: WAPI-FE-REQ-002.
- **GIVEN** city A is active and city B is selected
- **WHEN** city B is loading, then succeeds
- **THEN** A stays active during loading, after which B becomes active and the selected day is B's local today.

#### Scenario: WAPI-FE-AC-004 — Failed switch and retry
Covers: WAPI-FE-REQ-002.
- **GIVEN** city A is active and city B is selected
- **WHEN** B's weather fails
- **THEN** A's location and data remain active, failure is distinguishable, and B can be retried without corrupting A.

#### Scenario: WAPI-FE-AC-005 — Latest selection wins
Covers: WAPI-FE-REQ-002.
- **WHEN** multiple city selections are in flight and an older response arrives after the latest selection
- **THEN** that older response does not replace the latest successfully selected active city or its weather.

### Requirement: WAPI-FE-REQ-003 — Initial and remembered location
Status: Active. On initial use without a usable saved successful selection, the frontend SHALL request Kyiv. After a successful selection, it SHALL remember that location across visits for guests as well as signed-in users; failed selections SHALL NOT replace it. Source: product input, Switching cities; `docs/product.md` WD-01, WD-08.

#### Scenario: WAPI-FE-AC-006 — First visit and return visit
Covers: WAPI-FE-REQ-003.
- **WHEN** a guest first visits without a usable saved location, then later returns after successfully selecting another city
- **THEN** the initial request targets Kyiv and the return visit requests the last successfully selected city.

#### Scenario: WAPI-FE-AC-007 — Failed selection does not persist
Covers: WAPI-FE-REQ-003.
- **WHEN** a new location's weather fails or its saved selection becomes unusable
- **THEN** a failed selection does not overwrite the prior successful location, and an unusable saved selection falls back to Kyiv.

### Requirement: WAPI-FE-REQ-004 — Selected forecast day
Status: Active. When the user selects one of the seven forecast dates, the frontend SHALL expose that local day's hourly details and available day information while current conditions continue to refer to the present observation. Source: product input, Hourly and seven-day forecast; `docs/product.md` WD-03.

#### Scenario: WAPI-FE-AC-008 — Day selection preserves current
Covers: WAPI-FE-REQ-004.
- **WHEN** the user selects a forecast date other than today
- **THEN** the selected day's hourly/details data change according to the location's time zone while current conditions remain the current observation.

### Requirement: WAPI-FE-REQ-005 — Minimal backend-mediated weather journey
Status: Active. The technical frontend SHALL request search and weather through Atmos, not Open-Meteo, and SHALL make loading, success, and failure distinguishable without a complete Dashboard. Missing measurements SHALL remain missing rather than displayed as zero. Source: product input, Minimal frontend integration and Existing product constraints; `docs/architecture.md` request paths.

#### Scenario: WAPI-FE-AC-009 — Journey and states
Covers: WAPI-FE-REQ-005.
- **WHEN** a user searches, selects a result, and receives weather or a retrieval failure
- **THEN** requests go through Atmos, the technical surface distinguishes loading/success/failure, and missing values are not rendered as zero.

### Requirement: WAPI-FE-REQ-006 — No periodic polling
Status: Active. This stage SHALL NOT introduce periodic background weather polling or automatic refetch on focus/reconnect. Source: product input, Existing product constraints; `docs/product.md` WD-06; `docs/architecture.md` client state.

#### Scenario: WAPI-FE-AC-010 — Idle and focus behavior
Covers: WAPI-FE-REQ-006.
- **WHEN** the user leaves the technical weather surface idle or returns focus without a new selection
- **THEN** no timed or focus-triggered weather request occurs.

