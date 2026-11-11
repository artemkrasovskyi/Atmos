# Weather API implementation plan

## 1. Metadata

- Feature: Weather API; Feature ID: weather-api; Feature Prefix: WAPI.
- Plan ID: WAPI-PLAN-001; Status: Approved; Version: 1; Created: 2026-10-27; Updated: 2026-10-27; Approved: 2026-10-27; Language: English.
- Source specifications: specs/weather-backend/spec.md (WAPI-BE, Approved v1), specs/weather-frontend/spec.md (WAPI-FE, Approved v1), specs/api-contracts/spec.md (WAPI-CON, Approved v1).
- Project context: Atmos pnpm/Turborepo monorepo and archived Foundation; output: openspec/changes/weather-api/tasks.md.
- Execution strategy: SEQUENTIAL. All checkboxes below are initially uncompleted plan items. They do not record implementation or verification results.
- Final verification responsibility: independent Implementation Verifier. The Verification Owner TASK for each AC coordinates the check and evidence; it does not declare PASS. MANUAL service implementation may be handed to the next task before its checkbox is completed; those checkboxes stay open until the dependent AI-owned Backend tests provide verification.

## 2. Technical summary and referenced requirements

Implement the approved request path in design.md: shared Zod contracts, owner-led provider and domain services, AI-owned Backend tests and HTTP wiring, then a minimal Atmos-only client and technical weather surface. Decisions WAPI-BE-DEC-001 and WAPI-BE-DEC-002 are binding. WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003, WAPI-TDEC-004, WAPI-TDEC-005, WAPI-TDEC-006 define selected identity, contract/error shape, data/time normalization, ownership seam, frontend state, and integration checks.

Active coverage: WAPI-BE-REQ-001, WAPI-BE-REQ-002, WAPI-BE-REQ-003, WAPI-BE-REQ-004, WAPI-BE-REQ-005, WAPI-BE-REQ-006 (WAPI-BE-AC-001, WAPI-BE-AC-002, WAPI-BE-AC-003, WAPI-BE-AC-004, WAPI-BE-AC-005, WAPI-BE-AC-006, WAPI-BE-AC-007, WAPI-BE-AC-008, WAPI-BE-AC-009, WAPI-BE-AC-010), WAPI-FE-REQ-001, WAPI-FE-REQ-002, WAPI-FE-REQ-003, WAPI-FE-REQ-004, WAPI-FE-REQ-005, WAPI-FE-REQ-006 (WAPI-FE-AC-001, WAPI-FE-AC-002, WAPI-FE-AC-003, WAPI-FE-AC-004, WAPI-FE-AC-005, WAPI-FE-AC-006, WAPI-FE-AC-007, WAPI-FE-AC-008, WAPI-FE-AC-009, WAPI-FE-AC-010), and WAPI-CON-REQ-001, WAPI-CON-REQ-002 (WAPI-CON-AC-001, WAPI-CON-AC-002, WAPI-CON-AC-003, WAPI-CON-AC-004). No Redis weather/geocoding cache, stale fallback, refresh cooldown, product Dashboard, Mapbox, Auth, Prisma, or cloud work is included.

## 3. Existing architecture and integration boundaries

The API currently registers only the Foundation health controller in apps/api/src/app.module.ts and applies the unversioned /api prefix in main.ts. The web root route lives in apps/web/src/router.tsx and Vite already proxies /api to the API. packages/contracts exports only the health schema. New routes must preserve /api/health; new package exports must preserve the health export. Backend services will make provider calls without Redis or PostgreSQL clients. New frontend dependencies are limited to approved Axios, TanStack Query, and Zustand, with their installation justified by the client-state architecture.

## 4. Technical decisions

See WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003, WAPI-TDEC-004, WAPI-TDEC-005, WAPI-TDEC-006 in design.md. The proposed public surface is GET /api/locations/search?q=... and GET /api/weather?locationId=... with provider geocoding ID as the stable selection reference. Successful weather exposes location, timeZone, current, hourly, daily, and units. Feature-specific HTTP error codes distinguish invalid search, invalid/unknown selection, and upstream failures. Current and forecast measurements use canonical units and null for unavailable values. UTC instants plus the returned IANA zone determine local forecast dates. These are implementation choices under the approved REQ/AC, not new product requirements.

## 5. Implementation tasks

### WAPI-TASK-001: Define shared Weather API contracts — AI

- [x] WAPI-TASK-001 — Add location-search, weather, and scoped error Zod schemas/types in packages/contracts with browser/API exports; verify valid, malformed, missing-versus-zero, and dual-consumer fixtures through package tests and build.

Status: Planned. Purpose: establish the shared wire boundary before manual services or consumers. Covers: WAPI-CON-REQ-001, WAPI-CON-REQ-002. Supports: WAPI-TASK-002, WAPI-TASK-003, WAPI-TASK-004, WAPI-TASK-005, WAPI-TASK-006, WAPI-TASK-007, WAPI-TASK-008, WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011, WAPI-TASK-012. Acceptance Criteria: WAPI-CON-AC-001, WAPI-CON-AC-002, WAPI-CON-AC-003, WAPI-CON-AC-004. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003.

Technical Approach: keep the existing health export; define a decimal provider ID, city/country/countryCode/optional region, an empty locations array as successful search, feature error codes, and the weather shape in design.md. Numeric measurements are finite numbers or null, never a coerced zero. Define local date and UTC instant validation without requiring provider or Node runtime imports.

Expected Changes: packages/contracts/src location/weather/error modules, index export, focused tests. Integration Points: NEW package exports consumed by both apps; EXISTING health schema export remains intact. Dependencies: None.

Verification: Target WAPI-TASK-001; Method API_CONTRACT and BUILD; Expected Result both ESM/CJS package outputs resolve the schemas and malformed fixtures fail; Test Work create; Test Location packages/contracts/src/*.test.ts; Evidence passing schema tests and clean package build. Completion Conditions: new schemas/types/export and tests are present; health contract regression passes.

### WAPI-TASK-002: Implement Open-Meteo transport and lookup — MANUAL

- [ ] WAPI-TASK-002 — Owner implements OpenMeteoService search, get-by-ID, and seven-day forecast calls using real provider responses; verify through AI-owned WAPI-TASK-005 fixtures and the later smoke check, without AI filling in provider behavior.

Status: Planned. Purpose: obtain actual geocoding and forecast data at the provider boundary. Covers: WAPI-BE-REQ-001, WAPI-BE-REQ-002, WAPI-BE-REQ-003, WAPI-BE-REQ-005, WAPI-BE-REQ-006. Supports: WAPI-TASK-003, WAPI-TASK-004, WAPI-TASK-005, WAPI-TASK-006, WAPI-TASK-007. Acceptance Criteria: WAPI-BE-AC-001, WAPI-BE-AC-002, WAPI-BE-AC-003, WAPI-BE-AC-004, WAPI-BE-AC-005, WAPI-BE-AC-008, WAPI-BE-AC-009, WAPI-BE-AC-010. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-003, WAPI-TDEC-004.

Technical Approach: use Node built-in fetch with a bounded timeout and the documented Open-Meteo search, get-by-ID and generic forecast endpoints; request seven days, selected time zone, and canonical units. Handle network, HTTP, malformed payload, and missing-ID outcomes as typed service failures. Do not add Redis/DB, fake data, or automatic polling.

Expected Changes: apps/api/src/integrations/open-meteo provider module/service (exact names may follow Nest conventions). Integration Points: NEW injectable provider service consumed by WAPI-TASK-003 and WAPI-TASK-004; no public route in this task. Dependencies: WAPI-TASK-001.

Verification: Target WAPI-TASK-002; Method INTEGRATION; Expected Result AI fixtures observe correct provider URLs, identity, response/error handling; Test Work create by WAPI-TASK-005; Test Location apps/api/test or src/integrations/open-meteo/*.spec.ts; Evidence WAPI-TASK-005 output. Completion Conditions: owner delivers provider transport and lookup implementation, exposes agreed methods, and AI provider tests pass. Ownership of those tests is exclusively WAPI-TASK-005.

### WAPI-TASK-003: Implement location search behavior — MANUAL

- [ ] WAPI-TASK-003 — Owner implements location search normalization and distinct empty/invalid/provider-failure outcomes using WAPI-TASK-002; verify with AI-owned WAPI-TASK-005 cases for duplicate city names and each outcome.

Status: Planned. Purpose: make a search result an unambiguous selectable place. Covers: WAPI-BE-REQ-001, WAPI-BE-REQ-002. Supports: WAPI-TASK-005, WAPI-TASK-007. Acceptance Criteria: WAPI-BE-AC-001, WAPI-BE-AC-002, WAPI-BE-AC-003. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-004.

Technical Approach: trim and validate queries, normalize provider IDs and city/country/region/time zone, preserve distinct same-name IDs, return an empty successful list for no matches, and emit typed failures for invalid/provider cases. The core normalization remains owner-authored.

Expected Changes: apps/api/src/locations service/domain files. Integration Points: NEW injectable search service consumed by WAPI-TASK-007. Dependencies: WAPI-TASK-002.

Verification: Target WAPI-TASK-003; Method UNIT; Expected Result deterministic AI tests distinguish duplicate IDs, empty, invalid and provider failure; Test Work create by WAPI-TASK-005; Test Location apps/api/src/locations/*.spec.ts; Evidence WAPI-TASK-005 output. Completion Conditions: owner delivers location behavior; AI tests pass without AI editing service logic.

### WAPI-TASK-004: Implement selected-location weather behavior — MANUAL

- [ ] WAPI-TASK-004 — Owner implements WeatherService ID resolution, current/hourly/daily normalization and explicit failures; verify with AI-owned WAPI-TASK-006 fixtures for source fidelity, local dates, gaps, invalid IDs and upstream failure.

Status: Planned. Purpose: assemble real weather for the exact selected location. Covers: WAPI-BE-REQ-003, WAPI-BE-REQ-004, WAPI-BE-REQ-005, WAPI-BE-REQ-006. Supports: WAPI-TASK-006, WAPI-TASK-007. Acceptance Criteria: WAPI-BE-AC-004, WAPI-BE-AC-005, WAPI-BE-AC-006, WAPI-BE-AC-007, WAPI-BE-AC-008, WAPI-BE-AC-009, WAPI-BE-AC-010. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-003, WAPI-TDEC-004.

Technical Approach: resolve the geocoding ID through the provider, request forecast for that location, align hourly/daily arrays by time, emit UTC instants and seven local dates, keep missing measurements null, and reject unusable current/provider results. No guessed location or invented measurement is allowed.

Expected Changes: apps/api/src/weather service/domain files. Integration Points: NEW injectable WeatherService consumed by WAPI-TASK-007; EXISTING Foundation health behavior remains independent. Dependencies: WAPI-TASK-002.

Verification: Target WAPI-TASK-004; Method UNIT; Expected Result AI tests assert exact identity, measured zero versus null, seven dates, timezone boundaries, and explicit failure; Test Work create by WAPI-TASK-006; Test Location apps/api/src/weather/*.spec.ts; Evidence WAPI-TASK-006 output. Completion Conditions: owner delivers core weather behavior; AI tests pass without AI implementing that logic.

### WAPI-TASK-005: Test provider and location behavior — AI

- [ ] WAPI-TASK-005 — Create Backend Jest fixtures/tests for OpenMeteoService and location search, including same-name places, ID lookup, empty/invalid search and provider failures; verify the suite against the owner's implementation without changing MANUAL production files.

Status: Planned. Purpose: own Backend tests for provider/geocoding and search. Covers: WAPI-BE-REQ-001, WAPI-BE-REQ-002, WAPI-BE-REQ-003. Supports: WAPI-TASK-007. Acceptance Criteria: WAPI-BE-AC-001, WAPI-BE-AC-002, WAPI-BE-AC-003, WAPI-BE-AC-004, WAPI-BE-AC-005. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003, WAPI-TDEC-004.

Technical Approach: mock provider HTTP at the transport boundary and use representative geocoding responses; assert request parameters and typed domain outcomes. Do not create a fake production provider.

Expected Changes: apps/api/src/integrations/open-meteo/*.spec.ts, apps/api/src/locations/*.spec.ts or apps/api/test equivalents. Integration Points: EXISTING Jest test runner; NONE to production route, which WAPI-TASK-007 owns. Dependencies: WAPI-TASK-002, WAPI-TASK-003.

Verification: Target WAPI-TASK-005; Method UNIT and INTEGRATION; Expected Result duplicate cities remain distinct and search failures are not empty successes; Test Work create; Test Location apps/api/src/integrations/open-meteo and src/locations; Evidence direct Jest output. Completion Conditions: all provider/location Backend tests are AI-authored and passing; no MANUAL service logic is edited. Verification Owner for WAPI-BE-AC-001, WAPI-BE-AC-002, WAPI-BE-AC-003.

### WAPI-TASK-006: Test WeatherService behavior — AI

- [ ] WAPI-TASK-006 — Create Backend Jest tests for selected ID, current fields, seven local dates, partial/missing values and provider failure; verify the owner's WeatherService without changing MANUAL production files.

Status: Planned. Purpose: own Backend tests for core weather domain behavior. Covers: WAPI-BE-REQ-003, WAPI-BE-REQ-004, WAPI-BE-REQ-005, WAPI-BE-REQ-006. Supports: WAPI-TASK-007, WAPI-TASK-012. Acceptance Criteria: WAPI-BE-AC-004, WAPI-BE-AC-005, WAPI-BE-AC-006, WAPI-BE-AC-007, WAPI-BE-AC-008, WAPI-BE-AC-009, WAPI-BE-AC-010. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-003, WAPI-TDEC-004.

Technical Approach: inject deterministic provider fixtures for two same-name cities, non-UTC local date boundary, null and measured-zero values, and unavailable upstream. Assert exact selection identity, no fallback weather, and required error states.

Expected Changes: apps/api/src/weather/*.spec.ts or apps/api/test/weather*.spec.ts. Integration Points: EXISTING Jest runner; NONE to production HTTP, owned by WAPI-TASK-007. Dependencies: WAPI-TASK-004.

Verification: Target WAPI-TASK-006; Method UNIT and INTEGRATION; Expected Result all listed domain outcomes match approved ACs; Test Work create; Test Location apps/api/src/weather or apps/api/test; Evidence direct Jest output. Completion Conditions: all WeatherService Backend tests are AI-authored and passing; no MANUAL service logic is edited. Verification Owner for WAPI-BE-AC-004, WAPI-BE-AC-005, WAPI-BE-AC-006, WAPI-BE-AC-007, WAPI-BE-AC-008, WAPI-BE-AC-009, WAPI-BE-AC-010, coordinating WAPI-TASK-007 and WAPI-TASK-012 contributions.

### WAPI-TASK-007: Connect NestJS routes and HTTP tests — AI

- [ ] WAPI-TASK-007 — Register location/weather modules and controllers under the existing /api prefix, validate shared responses and map scoped errors; add AI-owned HTTP tests for search, weather and health regression and verify API build/typecheck/Jest.

Status: Planned. Purpose: expose the owner-led services without implementing their behavior. Covers: WAPI-BE-REQ-001, WAPI-BE-REQ-002, WAPI-BE-REQ-003, WAPI-BE-REQ-006. Supports: WAPI-TASK-008, WAPI-TASK-012. Acceptance Criteria: WAPI-BE-AC-001, WAPI-BE-AC-002, WAPI-BE-AC-003, WAPI-BE-AC-004, WAPI-BE-AC-005, WAPI-BE-AC-010. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-004.

Technical Approach: bind controller query validation, provider/service injection and feature error-to-HTTP mapping; parse success payloads with contracts. Tests use mocked services and assert status/body plus unauthenticated access. Do not edit MANUAL provider, location, or WeatherService logic.

Expected Changes: apps/api/src/app.module.ts, apps/api/src/locations/*.controller.ts, apps/api/src/weather/*.controller.ts, scoped HTTP error adapter and apps/api/test/*.spec.ts. Integration Points: NEW /api/locations/search and /api/weather registrations; EXISTING /api/health remains 200 and unversioned. Dependencies: WAPI-TASK-001, WAPI-TASK-003, WAPI-TASK-004, WAPI-TASK-005, WAPI-TASK-006.

Verification: Target WAPI-TASK-007; Method INTEGRATION, TYPECHECK and BUILD; Expected Result HTTP tests distinguish empty/invalid/upstream failures and selected weather while health regresses cleanly; Test Work create/extend; Test Location apps/api/test; Evidence direct Jest, typecheck and build output. Completion Conditions: both routes are registered and tested; no credentials or provider internals are exposed in errors.

### WAPI-TASK-008: Add Atmos-only frontend data client — AI

- [ ] WAPI-TASK-008 — Add Axios and TanStack Query for explicit search/weather requests through relative /api URLs, parse shared schemas and map typed errors; verify client tests, typecheck and absence of direct Open-Meteo browser calls.

Status: Planned. Purpose: connect browser code to Atmos REST contracts. Covers: WAPI-FE-REQ-001, WAPI-FE-REQ-005, WAPI-FE-REQ-006. Supports: WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011. Acceptance Criteria: WAPI-FE-AC-001, WAPI-FE-AC-002, WAPI-FE-AC-009, WAPI-FE-AC-010. Technical Decisions: WAPI-TDEC-002, WAPI-TDEC-005.

Technical Approach: use relative API paths through the existing Vite proxy and production Nginx route, Zod-validate success/error payloads, disable automatic focus/reconnect/interval refetch and automatic cached-query mount refetch. Justified new dependencies are the architecture-approved HTTP/query libraries.

Expected Changes: apps/web/package.json/lockfile, src/api client and query setup, main.tsx provider wiring. Integration Points: NEW Query provider and Atmos API calls; EXISTING Vite/Nginx /api proxy remains unchanged. Dependencies: WAPI-TASK-001, WAPI-TASK-007.

Verification: Target WAPI-TASK-008; Method UNIT and TYPECHECK; Expected Result client distinguishes empty, invalid, and provider failures and never targets Open-Meteo from browser code; Test Work create; Test Location apps/web/src/api/*.test.ts; Evidence Vitest/typecheck and source inspection. Completion Conditions: client and query wiring are usable by the technical surface, with no polling.

### WAPI-TASK-009: Preserve successful location and switching state — AI

- [ ] WAPI-TASK-009 — Add Zustand selection state with last-successful ID persistence, Kyiv fallback, retry and newest-request commit rules; verify first visit, return visit, failure and concurrent selection tests.

Status: Planned. Purpose: keep the active weather stable across pending/failed selections. Covers: WAPI-FE-REQ-002, WAPI-FE-REQ-003, WAPI-FE-REQ-006. Supports: WAPI-TASK-010, WAPI-TASK-011. Acceptance Criteria: WAPI-FE-AC-003, WAPI-FE-AC-004, WAPI-FE-AC-005, WAPI-FE-AC-006, WAPI-FE-AC-007, WAPI-FE-AC-010. Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-005.

Technical Approach: persist only the successful location ID, keep active weather/day transient, use a selection generation token to ignore stale completions, and rehydrate via ID on return. Resolve the first-use Kyiv result by city plus UA country code; surface a failure if no specific result exists.

Expected Changes: apps/web/package.json/lockfile for Zustand, src/weather selection state and tests. Integration Points: NEW state consumer in WAPI-TASK-010; EXISTING technical root remains routable. Dependencies: WAPI-TASK-008.

Verification: Target WAPI-TASK-009; Method UNIT; Expected Result pending/failed changes do not commit or persist and successful latest choice resets day; Test Work create; Test Location apps/web/src/weather/*.test.ts; Evidence Vitest output. Completion Conditions: state behavior passes deterministic storage and deferred-promise tests.

### WAPI-TASK-010: Render the minimal weather journey — AI

- [ ] WAPI-TASK-010 — Extend the technical root with search/results, current and forecast data, day selection, loading/error/retry states; verify local-day details change without replacing current weather and no Dashboard, map or polished widgets appear.

Status: Planned. Purpose: expose the approved browser journey. Covers: WAPI-FE-REQ-001, WAPI-FE-REQ-004, WAPI-FE-REQ-005. Supports: WAPI-TASK-011, WAPI-TASK-012. Acceptance Criteria: WAPI-FE-AC-001, WAPI-FE-AC-002, WAPI-FE-AC-008, WAPI-FE-AC-009. Technical Decisions: WAPI-TDEC-003, WAPI-TDEC-005.

Technical Approach: use the API client and selection state; render city/region/country labels and explicit states. Group UTC hourly instants by returned IANA zone for the chosen daily date; keep current observation separate. Render null as unavailable, not zero. No unit controls or product layout.

Expected Changes: apps/web/src/router.tsx or a small weather technical component, component tests. Integration Points: EXISTING TanStack Router / route now renders the technical journey; NEW client/state component call sites. Dependencies: WAPI-TASK-009.

Verification: Target WAPI-TASK-010; Method UNIT; Expected Result selected-day details, current observation and missing-state rendering match specs; Test Work create; Test Location apps/web/src/*.test.tsx or src/weather; Evidence Vitest output. Completion Conditions: technical route supports search-to-weather and retry while Foundation route/build remains valid.

### WAPI-TASK-011: Test frontend behavior — AI

- [ ] WAPI-TASK-011 — Complete frontend Vitest/Testing Library coverage for search states, switching, persistence, day selection, missing values and no polling; verify all WAPI-FE-AC-001, WAPI-FE-AC-002, WAPI-FE-AC-003, WAPI-FE-AC-004, WAPI-FE-AC-005, WAPI-FE-AC-006, WAPI-FE-AC-007, WAPI-FE-AC-008, WAPI-FE-AC-009, WAPI-FE-AC-010 scenarios with mocked Atmos responses.

Status: Planned. Purpose: coordinate all frontend acceptance checks. Covers: WAPI-FE-REQ-001, WAPI-FE-REQ-002, WAPI-FE-REQ-003, WAPI-FE-REQ-004, WAPI-FE-REQ-005, WAPI-FE-REQ-006. Supports: WAPI-TASK-012. Acceptance Criteria: WAPI-FE-AC-001, WAPI-FE-AC-002, WAPI-FE-AC-003, WAPI-FE-AC-004, WAPI-FE-AC-005, WAPI-FE-AC-006, WAPI-FE-AC-007, WAPI-FE-AC-008, WAPI-FE-AC-009, WAPI-FE-AC-010. Technical Decisions: WAPI-TDEC-003, WAPI-TDEC-005, WAPI-TDEC-006.

Technical Approach: test the mounted router with a fake Atmos API client and controlled promises; verify the actual technical surface plus state, including old-response races and guest localStorage. No fabricated production weather.

Expected Changes: apps/web/src weather/root tests and fixtures. Integration Points: EXISTING Vitest and root router; no new production connection. Dependencies: WAPI-TASK-010.

Verification: Target WAPI-TASK-011; Method UNIT and INTEGRATION; Expected Result all frontend state/result scenarios pass and no focus/timer requests occur; Test Work create/extend; Test Location apps/web/src/*.test.tsx and src/weather; Evidence direct Vitest output. Completion Conditions: frontend acceptance tests pass, build/typecheck pass. Verification Owner for WAPI-FE-AC-001, WAPI-FE-AC-002, WAPI-FE-AC-003, WAPI-FE-AC-004, WAPI-FE-AC-005, WAPI-FE-AC-006, WAPI-FE-AC-007, WAPI-FE-AC-008, WAPI-FE-AC-009, WAPI-FE-AC-010, coordinating WAPI-TASK-012 real-provider contribution.

### WAPI-TASK-012: Run cross-system real-provider smoke — AI

- [ ] WAPI-TASK-012 — Record a bounded search → selected ID → real Open-Meteo weather smoke through the Atmos API/web origin plus root build/test/typecheck results; verify location identity, current observation, seven local dates and explicit error paths, recording any unavailable check as unverified.

Status: Planned. Purpose: demonstrate the integrated path without calling Open-Meteo from the browser. Covers: WAPI-BE-REQ-003, WAPI-BE-REQ-004, WAPI-BE-REQ-005, WAPI-FE-REQ-005, WAPI-CON-REQ-001, WAPI-CON-REQ-002. Supports: None. Acceptance Criteria: WAPI-BE-AC-004, 006, 008 and WAPI-FE-AC-009 (contributor entries). Technical Decisions: WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003, WAPI-TDEC-004, WAPI-TDEC-005, WAPI-TDEC-006.

Technical Approach: follow a short documented command sequence with real provider access, using a selected search-result ID; request via the host frontend /api origin, inspect JSON with shared schemas, and preserve command/output evidence. Run frozen/build/typecheck/test checks, confirm both applications parse shared contracts, and check health regression. Never convert an unavailable provider check into PASS.

Expected Changes: Weather API smoke instructions/evidence under the change or README, limited test/build configuration only if needed. Integration Points: NEW complete browser-origin /api request path through Vite/Nginx proxy and Nest controllers to provider; EXISTING health/contract exports regressions. Dependencies: WAPI-TASK-005, WAPI-TASK-006, WAPI-TASK-007, WAPI-TASK-008, WAPI-TASK-011.

Verification: Target WAPI-TASK-012; Method RUNTIME_CHECK and BUILD; Expected Result a real selected place returns matching current/hourly/seven-day data through Atmos or an explicit unverified reason is recorded; Test Work not applicable for bounded command check; Test Location documented smoke commands; Evidence command transcript, validated response, build/typecheck/test output. Completion Conditions: integration commands and results are recorded faithfully and no required failing/unavailable AC is marked passed.

## 6. Dependencies and execution plan

Order: 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010 → 011 → 012. WAPI-TASK-004 could technically proceed after 002 while 003 is in progress, but the planned sequential handoff keeps the MANUAL service contracts stable and avoids overlapping Backend files. WAPI-TASK-005 and WAPI-TASK-006 are AI-only tests after their MANUAL implementations. WAPI-TASK-007 cannot complete until both MANUAL services exist. No dependency or Supports cycles exist.

The project owner receives the WAPI-TASK-002, WAPI-TASK-003, WAPI-TASK-004 boundaries and returns implementations for AI testing/review. AI must not fill those services while waiting. If the owner asks for help, AI may explain or review without editing MANUAL production code unless expressly delegated. Plan approval precedes any task execution.

## 7. Integration and rollout

New package exports feed API response parsing and browser parsing. AppModule registers controllers/services under the already configured /api prefix. The frontend adds relative /api calls to the existing root route and Vite/Nginx routing. Shared errors distinguish invalid, unknown, empty, and upstream failure states. The API health endpoint, health contract, and Foundation scripts remain working. There is no schema migration, backfill, feature flag, or deployment target in this change. Rollback removes new routes/client calls and retains Foundation files. Real-provider smoke is read-only and must not write credentials.

## 8. Verification strategy and AC coverage

Each row is one AC verification entry with exactly one Verification Owner TASK. AI owns creation of all Backend tests; MANUAL tasks supply production behavior. Independent Implementation Verifier decides actual results. RUNTIME_CHECK entries are required for the stated real-provider journey; if the environment cannot run them, record NOT_VERIFIED or BLOCKED rather than PASS. All other entries use isolated fixtures, tests, schema validation, or builds. Test Work is create/extend for UNIT, INTEGRATION and API_CONTRACT entries; not applicable for command-only RUNTIME_CHECK. Evidence is test output or the stated command transcript, never a task checkbox.

| REQ | AC / Target | Implementing TASKs | Verification Owner TASK (OWNER) | Method and expected result | Test Work / Location | Evidence |
|---|---|---|---|---|---|---|
| WAPI-CON-REQ-001 | WAPI-CON-AC-001 | WAPI-TASK-001, WAPI-TASK-003, WAPI-TASK-007, WAPI-TASK-008, WAPI-TASK-012 | WAPI-TASK-001 | API_CONTRACT: same required ID/place labels accepted by API/browser; missing rejected | create; packages/contracts/src/*.test.ts | schema test and dual build |
| WAPI-CON-REQ-001 | WAPI-CON-AC-002 | WAPI-TASK-001, WAPI-TASK-003, WAPI-TASK-007, WAPI-TASK-008, WAPI-TASK-012 | WAPI-TASK-001 | API_CONTRACT: empty success differs from invalid and provider error | create; packages/contracts/src/*.test.ts | schema test |
| WAPI-CON-REQ-002 | WAPI-CON-AC-003 | WAPI-TASK-001, WAPI-TASK-004, WAPI-TASK-007, WAPI-TASK-008, WAPI-TASK-012 | WAPI-TASK-001 | API_CONTRACT: identity, time zone, observation, units, hours and local dates validate in both consumers | create; packages/contracts/src/*.test.ts | schema test and build |
| WAPI-CON-REQ-002 | WAPI-CON-AC-004 | WAPI-TASK-001, WAPI-TASK-004, WAPI-TASK-008, WAPI-TASK-012 | WAPI-TASK-001 | API_CONTRACT: null and measured zero stay distinct in API/browser parsing | create; packages/contracts/src/*.test.ts | schema test |
| WAPI-BE-REQ-001 | WAPI-BE-AC-001 | WAPI-TASK-002, WAPI-TASK-003, WAPI-TASK-005, WAPI-TASK-007 | WAPI-TASK-005 | INTEGRATION: same-name cities return distinct IDs and labels | create; apps/api/src/locations/*.spec.ts | Jest fixture output |
| WAPI-BE-REQ-002 | WAPI-BE-AC-002 | WAPI-TASK-002, WAPI-TASK-003, WAPI-TASK-005, WAPI-TASK-007 | WAPI-TASK-005 | INTEGRATION: no match is 200 empty list | create; apps/api/src/locations/*.spec.ts and test HTTP | Jest output |
| WAPI-BE-REQ-002 | WAPI-BE-AC-003 | WAPI-TASK-002, WAPI-TASK-003, WAPI-TASK-005, WAPI-TASK-007 | WAPI-TASK-005 | INTEGRATION: invalid search and upstream failure have distinct non-success codes | create; apps/api/src/locations/*.spec.ts and test HTTP | Jest output |
| WAPI-BE-REQ-003 | WAPI-BE-AC-004 | WAPI-TASK-002, WAPI-TASK-004, WAPI-TASK-005, WAPI-TASK-006, WAPI-TASK-007, WAPI-TASK-012 | WAPI-TASK-006 | INTEGRATION + RUNTIME_CHECK: selected ID governs place and actual provider result without auth | create; apps/api/src/weather/*.spec.ts; command-only smoke | Jest and real-provider transcript |
| WAPI-BE-REQ-003 | WAPI-BE-AC-005 | WAPI-TASK-002, WAPI-TASK-004, WAPI-TASK-006, WAPI-TASK-007 | WAPI-TASK-006 | INTEGRATION: malformed/unknown ID fails without guessed weather | create; apps/api/src/weather/*.spec.ts and test HTTP | Jest output |
| WAPI-BE-REQ-004 | WAPI-BE-AC-006 | WAPI-TASK-002, WAPI-TASK-004, WAPI-TASK-006, WAPI-TASK-007, WAPI-TASK-012 | WAPI-TASK-006 | INTEGRATION + RUNTIME_CHECK: listed current values, units, observation and place match provider | create; apps/api/src/weather/*.spec.ts; command-only smoke | Jest and real-provider transcript |
| WAPI-BE-REQ-004 | WAPI-BE-AC-007 | WAPI-TASK-004, WAPI-TASK-006 | WAPI-TASK-006 | UNIT: absent value stays null and measured zero stays zero | create; apps/api/src/weather/*.spec.ts | Jest output |
| WAPI-BE-REQ-005 | WAPI-BE-AC-008 | WAPI-TASK-002, WAPI-TASK-004, WAPI-TASK-006, WAPI-TASK-012 | WAPI-TASK-006 | INTEGRATION + RUNTIME_CHECK: seven local dates, hourly entries and IANA zone | create; apps/api/src/weather/*.spec.ts; command-only smoke | Jest and real-provider transcript |
| WAPI-BE-REQ-005 | WAPI-BE-AC-009 | WAPI-TASK-004, WAPI-TASK-006 | WAPI-TASK-006 | UNIT: partial hourly/daily gaps remain identifiable, not zero | create; apps/api/src/weather/*.spec.ts | Jest output |
| WAPI-BE-REQ-006 | WAPI-BE-AC-010 | WAPI-TASK-002, WAPI-TASK-004, WAPI-TASK-006, WAPI-TASK-007 | WAPI-TASK-006 | INTEGRATION: provider failure returns non-success, no successful weather payload | create; apps/api/src/weather/*.spec.ts and test HTTP | Jest output |
| WAPI-FE-REQ-001 | WAPI-FE-AC-001 | WAPI-TASK-008, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | INTEGRATION: same-name result labels and selection target distinct IDs | create; apps/web/src/*.test.tsx | Vitest router output |
| WAPI-FE-REQ-001 | WAPI-FE-AC-002 | WAPI-TASK-008, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | INTEGRATION: loading, empty, invalid and failure states differ | create; apps/web/src/*.test.tsx | Vitest router output |
| WAPI-FE-REQ-002 | WAPI-FE-AC-003 | WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | UNIT: old active stays pending; success commits new and local today | create; apps/web/src/weather/*.test.ts | Vitest output |
| WAPI-FE-REQ-002 | WAPI-FE-AC-004 | WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | UNIT: failure keeps old data and retry targets pending ID | create; apps/web/src/weather/*.test.ts | Vitest output |
| WAPI-FE-REQ-002 | WAPI-FE-AC-005 | WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | UNIT: older completion cannot overwrite latest chosen city | create; apps/web/src/weather/*.test.ts | Vitest deferred-promise output |
| WAPI-FE-REQ-003 | WAPI-FE-AC-006 | WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | INTEGRATION: first guest loads Kyiv; return uses successful saved ID | create; apps/web/src/*.test.tsx | Vitest/localStorage output |
| WAPI-FE-REQ-003 | WAPI-FE-AC-007 | WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | UNIT: failed selection does not persist; unusable ID falls back to Kyiv | create; apps/web/src/weather/*.test.ts | Vitest output |
| WAPI-FE-REQ-004 | WAPI-FE-AC-008 | WAPI-TASK-010, WAPI-TASK-011 | WAPI-TASK-011 | INTEGRATION: selected local day changes details but not current | create; apps/web/src/*.test.tsx | Vitest output |
| WAPI-FE-REQ-005 | WAPI-FE-AC-009 | WAPI-TASK-008, WAPI-TASK-010, WAPI-TASK-011, WAPI-TASK-012 | WAPI-TASK-011 | INTEGRATION + RUNTIME_CHECK: browser uses Atmos route, states and missing values; real request traverses frontend origin/API/provider | create; apps/web/src/*.test.tsx; command-only smoke | Vitest and real-provider transcript |
| WAPI-FE-REQ-006 | WAPI-FE-AC-010 | WAPI-TASK-008, WAPI-TASK-009, WAPI-TASK-011 | WAPI-TASK-011 | UNIT: idle/focus/reconnect trigger no weather request | create; apps/web/src/weather/*.test.ts | Vitest fake-timer output |

The Verification Owner TASK column uses full stable IDs. Each entry's required method/evidence is the complete check for that AC; where two methods are listed, both are required and WAPI-TASK-012 supplies the real-provider contributor entry. No AC has a second owner. The verifier may report a technical TASK failure separately even when its AC evidence is partial.

## 9. Risks, questions, and change history

The five non-blocking product questions in proposal.md are answered for this stage by WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003, WAPI-TDEC-004, WAPI-TDEC-005 as recorded in design.md; none requires changing an approved REQ or AC. No blocking TQ is open. Risks and mitigations are in design.md. The project owner approved this plan on 2026-10-27; approval does not mark any task or AC complete.

- 2026-10-27: Created WAPI-PLAN-001 Draft v1 from Approved v1 specs and decisions WAPI-BE-DEC-001/002. Added WAPI-TASK-001, WAPI-TASK-002, WAPI-TASK-003, WAPI-TASK-004, WAPI-TASK-005, WAPI-TASK-006, WAPI-TASK-007, WAPI-TASK-008, WAPI-TASK-009, WAPI-TASK-010, WAPI-TASK-011, WAPI-TASK-012 and WAPI-TDEC-001, WAPI-TDEC-002, WAPI-TDEC-003, WAPI-TDEC-004, WAPI-TDEC-005, WAPI-TDEC-006; no implementation progress or verification result is claimed.
- 2026-10-27: Project owner approved design.md and WAPI-PLAN-001 v1. No task checkbox, implementation evidence, or AC result changed.

## Workflow follow-up

- Design.md and tasks.md were explicitly approved on 2026-10-27; follow the approved plan before implementation.
- After implementation, obtain independent verification against approved ACs; archive according to AGENTS.md and direct owner instructions.
