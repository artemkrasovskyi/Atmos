# Weather Backend

## Purpose

Return real, location-specific weather for the first Atmos search and selection journey.

### Metadata

- Feature: Weather API; Feature ID: `weather-api`; Feature Prefix: `WAPI`.
- Spec ID: `weather-backend`; Spec Prefix: `WAPI-BE`; Source change: `weather-api`.
- Status: Approved; Version: 1; Created: 2026-10-27; Approved: 2026-10-27; Language: English.
- Change history: initial Weather API requirements and acceptance criteria approved by the project owner on 2026-10-27; `WAPI-BE-DEC-001` and `WAPI-BE-DEC-002` are included in that approval.
- Sources: Atmos Weather API product input (2026-10-27); `docs/product.md` WD-01–03, WD-06–08; `docs/architecture.md` API and contracts; `docs/decisions.md`.
- Scope: unambiguous location search and selected-location current, hourly, seven-day weather from Open-Meteo; no Redis weather cache or refresh cooldown in this stage, per approved `WAPI-BE-DEC-001`.
- Ownership boundary (`WAPI-BE-DEC-002`): core provider integration, normalization, and WeatherService behavior or equivalents are MANUAL user-led implementation. All Backend tests in this stage, including tests of that core logic, are AI-owned; test work does not authorize AI to implement the MANUAL behavior. Exact task allocation follows approved requirements.

## Requirements

### Requirement: WAPI-BE-REQ-001 — Search identifiable locations
Status: Active. When a guest or signed-in client searches by city name, Atmos SHALL return matching locations identified by city name, country, region when available, and a stable selection reference so the client can distinguish similarly named places. Source: product input, City search and selection; `docs/product.md` WD-02.

#### Scenario: WAPI-BE-AC-001 — Matching cities
Covers: WAPI-BE-REQ-001.
- **WHEN** a valid query matches two locations with the same city name
- **THEN** each result includes its city, country, available region, and distinct selection reference.

### Requirement: WAPI-BE-REQ-002 — Distinguish search outcomes
Status: Active. Search SHALL distinguish no matches, invalid input, and provider/search failure as separate outcomes. Source: product input, City search and selection.

#### Scenario: WAPI-BE-AC-002 — Empty search
Covers: WAPI-BE-REQ-002.
- **WHEN** a valid search has no matches
- **THEN** the result is an empty match set rather than a validation or service error.

#### Scenario: WAPI-BE-AC-003 — Invalid and failed search
Covers: WAPI-BE-REQ-002.
- **WHEN** input is invalid or the search provider fails
- **THEN** each condition produces a distinguishable non-success outcome without fabricated locations.

### Requirement: WAPI-BE-REQ-003 — Fetch by selected location
Status: Active. When weather is requested, Atmos SHALL use a selected location reference from search, not an ambiguous city-name query, and obtain real weather from Open-Meteo without requiring authentication. Source: product input, Objective and City search; `docs/product.md` initial API surface; `docs/architecture.md` system request paths.

#### Scenario: WAPI-BE-AC-004 — Selected place governs weather
Covers: WAPI-BE-REQ-003.
- **GIVEN** two search results share a city name but identify different places
- **WHEN** the client requests weather for one selected result
- **THEN** the returned location and weather correspond to that result, and no authentication is required.

#### Scenario: WAPI-BE-AC-005 — Unknown selection
Covers: WAPI-BE-REQ-003.
- **WHEN** a selection reference is invalid or cannot identify a location
- **THEN** Atmos returns a distinguishable failure rather than weather for a guessed place.

### Requirement: WAPI-BE-REQ-004 — Current conditions with source fidelity
Status: Active. Successful selected-location weather SHALL identify the location and observation time, expose available current temperature, apparent temperature, condition/code, humidity, wind speed and direction, precipitation, and pressure with units, and preserve missing source values rather than inventing measurements or replacing them with zero. Source: product input, Current weather; `docs/product.md` WD-03, WD-07 and Vision.

#### Scenario: WAPI-BE-AC-006 — Current observation
Covers: WAPI-BE-REQ-004.
- **WHEN** Open-Meteo supplies the listed current fields for a selected location
- **THEN** the result identifies that location and observation time and faithfully provides those values with units.

#### Scenario: WAPI-BE-AC-007 — Missing current measurements
Covers: WAPI-BE-REQ-004.
- **WHEN** a listed source measurement is missing
- **THEN** the result identifies it as missing and does not substitute zero or a fabricated measurement.

### Requirement: WAPI-BE-REQ-005 — Location-local forecasts
Status: Active. Successful weather SHALL make hourly data and seven daily forecast dates available for the selected location, with dates and timestamps interpretable in that location's time zone. Partial or missing source data SHALL stay identifiable. Source: product input, Hourly and seven-day forecast; `docs/product.md` WD-03.

#### Scenario: WAPI-BE-AC-008 — Seven local days and hourly data
Covers: WAPI-BE-REQ-005.
- **WHEN** the provider supplies a complete seven-day forecast
- **THEN** the result contains seven distinct local forecast dates, relevant hourly entries, and the selected location's time zone.

#### Scenario: WAPI-BE-AC-009 — Partial forecast
Covers: WAPI-BE-REQ-005.
- **WHEN** the provider omits an hourly or daily measurement
- **THEN** the gap remains distinguishable from a measured zero and is not silently filled with invented weather.

### Requirement: WAPI-BE-REQ-006 — Weather failure is explicit
Status: Active. If the weather provider fails or usable weather cannot be obtained for a selected location, Atmos SHALL report failure rather than a successful fabricated or unrelated weather result. Source: product input, Switching cities and handling failures; `docs/product.md` WD-08.

#### Scenario: WAPI-BE-AC-010 — Upstream weather failure
Covers: WAPI-BE-REQ-006.
- **WHEN** Open-Meteo weather retrieval fails for a valid selection
- **THEN** the client receives a distinguishable failure and no invented successful weather payload.

