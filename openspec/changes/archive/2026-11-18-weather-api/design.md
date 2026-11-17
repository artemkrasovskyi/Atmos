# Design: Weather API

Status: Approved v1 by the project owner on 2026-10-27.

## Context

See proposal.md for motivation. The three Weather API delta specs are Approved v1 on 2026-10-27. The repository currently has a Foundation-only NestJS app (health controller), a TanStack Router root route, and a Zod package exporting the health contract. No weather, location, client data, database, or Redis application logic exists. Approved decisions WAPI-BE-DEC-001 and WAPI-BE-DEC-002 respectively defer caching and reserve core provider/domain implementation for the owner while assigning every Backend test to AI. The project owner approved this design and its implementation plan on 2026-10-27.

## Goals / Non-Goals

**Goals:** Connect a selected geocoding result to current, hourly, and seven-day weather through the Atmos API; preserve source fidelity and location-local dates; make the minimal browser journey testable. Define seams so AI-owned contracts, controllers, frontend, and tests do not implement MANUAL provider or WeatherService logic.

**Non-Goals:** Redis weather/geocoding cache, stale fallback, cooldown, Prisma entities, authentication, Mapbox, Dashboard layout, unit controls, generic API framework, background polling, and cloud rollout. Existing PostgreSQL/Redis Compose services stay part of Foundation but are not dependencies of the weather request path.

## Decisions

### WAPI-TDEC-001 — Selected location identity

**Problem:** A city name cannot identify the selected place or survive a later visit. **Decision:** Expose Open-Meteo geocoding's positive integer ID as a decimal string selection reference. Search returns that ID with city, country, countryCode, optional region, and IANA time zone. GET /api/weather accepts locationId, resolves the ID through the provider's geocoding get-by-ID endpoint, then requests weather for the resolved coordinates. Persist only the last successfully loaded ID in the browser. Reject malformed IDs and report an unknown or removed ID distinctly; never fall back to a name match. **Rationale:** The provider documents unique geocoding IDs and lookup by ID, so the backend can rehydrate coordinates after reload without a new database or client-controlled coordinates. **Alternative:** Client-submitted coordinates and labels can be altered and do not give a stable provider identity. **Affected tasks:** WAPI-TASK-001–007, 009–012. **Constraint:** The provider adapter and ID-resolution logic are MANUAL.

### WAPI-TDEC-002 — Scoped REST and shared contracts

**Problem:** Search success, empty results, validation failures, and provider failures must remain different to both apps. **Decision:** Use the existing unversioned /api prefix with GET /api/locations/search?q=... and GET /api/weather?locationId=.... Search success is HTTP 200 with a locations array, including an empty array for no results. Weather success is HTTP 200 with location, timeZone, current, hourly, daily, and units. Feature errors use a small shared code/message/statusCode shape: INVALID_SEARCH and INVALID_LOCATION_ID (400), LOCATION_NOT_FOUND (404), SEARCH_UNAVAILABLE and WEATHER_UNAVAILABLE (502). Controller-side validation and exception mapping are AI work; provider/domain errors originate in MANUAL services. Export Zod schemas and inferred types from packages/contracts and validate outbound payloads at the API boundary and inbound payloads in the browser. **Rationale:** Matches the approved no-envelope REST architecture and avoids adding a general exception filter for unrelated future features. **Alternative:** Treating all failures as empty success would violate approved ACs. **Affected tasks:** WAPI-TASK-001, 003–008, 012.

### WAPI-TDEC-003 — Provider data and local time

**Problem:** Forecast arrays and timestamps must retain missing values and local-day meaning. **Decision:** The MANUAL provider adapter requests current, hourly, and daily data from the generic Open-Meteo Forecast API using selected coordinates, forecast_days=7, the location's IANA time zone, and Unix timestamps for instants. The MANUAL WeatherService normalizes instants to UTC ISO strings, emits seven local calendar dates, preserves unavailable measurements as null, and never substitutes zero. Required current measurements are temperature, apparent temperature, weather code, humidity, wind speed/direction, precipitation, and sea-level pressure when supplied. Hourly and daily entries carry the fields needed for a technical selected-day view; units identify canonical Celsius, km/h, mm, hPa, degrees and percent values. A missing entire daily measurement remains null for its date; a missing current observation or unusable provider result is a failure. The frontend groups hourly instants with the returned IANA time zone, not the host time zone. **Rationale:** Canonical units keep this stage small while allowing later preference conversion. Unix instants avoid fixed-offset errors around daylight saving boundaries. **Alternatives:** Client-side provider calls breach architecture; filling gaps with zero invents observations. **Affected tasks:** WAPI-TASK-001–002, 004, 006, 010–012. **Constraint:** Exact Dashboard card fields and hourly cutoff remain deferred; full local-day hourly data is available.

### WAPI-TDEC-004 — Owner boundary and integration seam

**Problem:** AI wiring and tests must coexist with owner-led NestJS learning work. **Decision:** AI defines shared contract types and feature HTTP/controller wiring. MANUAL owns OpenMeteoService geocoding/search/lookup/forecast calls, location result interpretation, and WeatherService normalization/assembly/error decisions. The two services expose the methods needed by controllers; AI does not create placeholder responses or edit their core behavior. AI writes all Backend Jest tests, including provider adapter, WeatherService, and HTTP tests, using fixtures and mocked upstream responses. Manual services are completed before the AI controller integration and final tests are considered complete. **Rationale:** Keeps the owner responsible for substantive backend behavior while providing independent test coverage. **Alternative:** AI implementing service logic in scaffolding would violate WAPI-BE-DEC-002. **Affected tasks:** WAPI-TASK-001–007, 012.

### WAPI-TDEC-005 — Minimal frontend state and initial location

**Problem:** City switching, persistence, and concurrent requests must not corrupt the active weather. **Decision:** Add Axios for the Atmos-only HTTP client, TanStack Query for explicit server requests, and Zustand with localStorage persistence of only the last successful location ID. Keep active weather and selected forecast date in non-persisted state. A monotonically increasing selection token prevents older completions from committing after a later choice; failed selections leave the active snapshot and saved ID intact and expose retry for the pending ID. On first use, search for Kyiv, Ukraine, select a result whose normalized city matches Kyiv and countryCode is UA, then request its weather; failure is explicit rather than choosing an arbitrary result. Rehydrate saved IDs through GET /api/weather; an unusable saved ID falls back to Kyiv. Disable interval, focus, reconnect, and automatic cached-query refetch. Render only a technical search/results/weather/day/error surface. **Rationale:** Matches approved client-state boundaries and preserves the successful selection invariant. **Alternative:** Persisting full weather would create stale or fabricated-looking data on return. **Affected tasks:** WAPI-TASK-008–012.

### WAPI-TDEC-006 — Verification and integration

**Problem:** Mocked unit tests alone cannot show the real provider path, and live provider behavior may be unavailable during automated checks. **Decision:** AI creates deterministic Zod, provider-fixture, service, HTTP and frontend tests. A bounded smoke procedure separately searches and selects one real location, requests weather through the API/web origin, checks provider-derived values and seven local dates, and records any unavailable network check explicitly without reporting it as passed. It does not require Redis or PostgreSQL availability for weather logic. A failed required check leaves the corresponding AC unverified for the independent verifier; no task checkbox or approval implies PASS. **Rationale:** Covers both deterministic edge cases and the stated real-data journey. **Alternative:** A mocked-only end-to-end claim would not establish provider connectivity. **Affected tasks:** WAPI-TASK-005–007, 011–012.

## Disposition of approved non-blocking questions

- WAPI-BE-Q-001: WAPI-TDEC-001 selects the documented provider geocoding ID and /v1/get lookup.
- WAPI-BE-Q-002: WAPI-TDEC-003 includes the listed current metrics and sea-level pressure; other Dashboard metrics remain deferred.
- WAPI-FE-Q-001: WAPI-TDEC-005 defers preference controls while keeping canonical measurement units explicit.
- WAPI-FE-Q-002: WAPI-TDEC-003 exposes the full selected local day's hourly data; a Dashboard cutoff remains deferred.
- WAPI-CON-Q-001: WAPI-TDEC-002 and WAPI-TDEC-003 establish the stage's public shapes and scoped error codes.

## Risks / Trade-offs

- [Geocoding ID removed or provider unavailable] → Return explicit failure; saved-ID fallback uses Kyiv only when the saved reference is unusable, without inventing a location.
- [Provider shape or array lengths vary] → MANUAL normalization validates shape and aligns entries by timestamp/date; AI tests malformed and partial fixtures.
- [Local time and daylight saving errors] → Keep UTC instants and IANA zone; AI tests a non-UTC zone and a day boundary.
- [AI tests inadvertently implement MANUAL logic] → Tests assert externally observable behavior and use fixtures; service production files remain MANUAL-owned.
- [Real-provider smoke cannot run] → Record BLOCKED or NOT_VERIFIED with reason; do not claim end-to-end PASS.
- [Dependencies exceed Foundation] → Add only approved client-state/network dependencies needed here; no cache or product UI libraries.

## Migration Plan

No data migration. Build contracts first, then owner-led services, controller registration, frontend integration, and tests. Existing /api/health and the Foundation technical root remain usable during incremental work. Rollback removes the new weather/location routes and technical frontend surface without altering Foundation contracts or infrastructure. The plan does not require a production deployment.

## References

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) documents search results, unique location IDs, and get-by-ID lookup.
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs) documents seven-day forecasts, current/hourly/daily variables, time format, and time-zone parameters.
