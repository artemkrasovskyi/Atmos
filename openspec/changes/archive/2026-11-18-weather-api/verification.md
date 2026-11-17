# Weather API verification

## Metadata

- Feature: `weather-api` (`WAPI`)
- Cycle ID: `WAPI-VC-001`; operation: VERIFY; pass: 1; REVERIFY attempt: 0; maximum automatic attempt: 2
- Acceptance baseline: WAPI-BE, WAPI-FE, WAPI-CON Approved v1; WAPI-PLAN-001 Approved v1
- Checked revision: uncommitted working tree on 2026-10-27; repository has no `HEAD` commit
- Scope: currently visible Weather API implementation, Foundation regressions, approved ACs; complete Git change history is unavailable because the repository has no commit
- Authorized environment: local read-only checks; no mutable runtime or migration environment was supplied

## Current verdict

**GAPS_FOUND.** The backend weather/search implementation and routes, and the frontend weather journey, are absent. The shared contract accepts invalid seven-day/time-zone data. Existing Foundation tests do not verify Weather API behavior.

This verdict records the full-feature pass on 2026-10-27. A **scoped review of MANUAL WAPI-TASK-002/003/004** on 2026-11-18 appears in the addendum below; it does not replace this historical pass or establish a full-feature REVERIFY verdict.

Next actions, in order: **AWAITING_USER_APPROVAL** for corrections linked to WAPI-VER-001 through WAPI-VER-004; **PROVIDE_MISSING_EVIDENCE** for fresh build and real-provider integration once implementation exists. MANUAL production work in WAPI-TASK-002/003/004 belongs to the project owner under the approved plan; the verifier makes no implementation assignment.

## REQ / AC verification matrix

Each row is a mandatory entry in WAPI-PLAN-001 section 8. `FAIL` means the required observable path is absent or invalid; `NOT_VERIFIED` means sufficient evidence is lacking. The owner is the single Verification Owner TASK in the plan.

| REQ | AC | Owner | Method | Entry / AC | Evidence |
|---|---|---|---|---|---|
| WAPI-CON-REQ-001 | WAPI-CON-AC-001 | WAPI-TASK-001 | API_CONTRACT | NOT_VERIFIED | Schema fixtures pass, but API/browser consumers are absent and no fresh dual build ran. |
| WAPI-CON-REQ-001 | WAPI-CON-AC-002 | WAPI-TASK-001 | API_CONTRACT | NOT_VERIFIED | Schema distinguishes empty/error; HTTP and browser outcomes are absent. |
| WAPI-CON-REQ-002 | WAPI-CON-AC-003 | WAPI-TASK-001 | API_CONTRACT | FAIL | Schema accepts duplicate dates and `Bogus/Zone`; see WAPI-VER-004. API/browser consumers absent. |
| WAPI-CON-REQ-002 | WAPI-CON-AC-004 | WAPI-TASK-001 | API_CONTRACT | NOT_VERIFIED | Fixture distinguishes `0` and `null`; API/browser validation absent. |
| WAPI-BE-REQ-001 | WAPI-BE-AC-001 | WAPI-TASK-005 | INTEGRATION | FAIL | No location provider/service/controller. |
| WAPI-BE-REQ-002 | WAPI-BE-AC-002 | WAPI-TASK-005 | INTEGRATION | FAIL | No search route or location service. |
| WAPI-BE-REQ-002 | WAPI-BE-AC-003 | WAPI-TASK-005 | INTEGRATION | FAIL | No search route/error mapping. |
| WAPI-BE-REQ-003 | WAPI-BE-AC-004 | WAPI-TASK-006 | INTEGRATION + RUNTIME_CHECK | FAIL / NOT_VERIFIED | Selected-ID path absent; real-provider runtime check unavailable. |
| WAPI-BE-REQ-003 | WAPI-BE-AC-005 | WAPI-TASK-006 | INTEGRATION | FAIL | No location-ID weather route. |
| WAPI-BE-REQ-004 | WAPI-BE-AC-006 | WAPI-TASK-006 | INTEGRATION + RUNTIME_CHECK | FAIL / NOT_VERIFIED | Current-weather behavior absent; real-provider runtime check unavailable. |
| WAPI-BE-REQ-004 | WAPI-BE-AC-007 | WAPI-TASK-006 | UNIT | FAIL | WeatherService absent. |
| WAPI-BE-REQ-005 | WAPI-BE-AC-008 | WAPI-TASK-006 | INTEGRATION + RUNTIME_CHECK | FAIL / NOT_VERIFIED | Forecast behavior absent; real-provider runtime check unavailable. |
| WAPI-BE-REQ-005 | WAPI-BE-AC-009 | WAPI-TASK-006 | UNIT | FAIL | Forecast normalization absent. |
| WAPI-BE-REQ-006 | WAPI-BE-AC-010 | WAPI-TASK-006 | INTEGRATION | FAIL | Weather provider and failure path absent. |
| WAPI-FE-REQ-001 | WAPI-FE-AC-001 | WAPI-TASK-011 | INTEGRATION | FAIL | Root renders only `Atmos`; no search/selection UI. |
| WAPI-FE-REQ-001 | WAPI-FE-AC-002 | WAPI-TASK-011 | INTEGRATION | FAIL | No search states. |
| WAPI-FE-REQ-002 | WAPI-FE-AC-003 | WAPI-TASK-011 | UNIT | FAIL | No selection state or weather client. |
| WAPI-FE-REQ-002 | WAPI-FE-AC-004 | WAPI-TASK-011 | UNIT | FAIL | No pending/retry behavior. |
| WAPI-FE-REQ-002 | WAPI-FE-AC-005 | WAPI-TASK-011 | UNIT | FAIL | No latest-selection rule. |
| WAPI-FE-REQ-003 | WAPI-FE-AC-006 | WAPI-TASK-011 | INTEGRATION | FAIL | No Kyiv initial load or saved selection. |
| WAPI-FE-REQ-003 | WAPI-FE-AC-007 | WAPI-TASK-011 | UNIT | FAIL | No success-only persistence/fallback. |
| WAPI-FE-REQ-004 | WAPI-FE-AC-008 | WAPI-TASK-011 | INTEGRATION | FAIL | No forecast-day view. |
| WAPI-FE-REQ-005 | WAPI-FE-AC-009 | WAPI-TASK-011 | INTEGRATION + RUNTIME_CHECK | FAIL / NOT_VERIFIED | No browser journey; real-provider runtime check unavailable. |
| WAPI-FE-REQ-006 | WAPI-FE-AC-010 | WAPI-TASK-011 | UNIT | NOT_VERIFIED | No weather surface/client or required idle/focus/reconnect test; absence of requests on the placeholder is not a PASS. |

REQ aggregate: WAPI-BE-REQ-001–006, WAPI-FE-REQ-001–005, and WAPI-CON-REQ-002 **FAIL**; WAPI-FE-REQ-006 and WAPI-CON-REQ-001 **NOT_VERIFIED**. Exact counts: 12 FAIL, 2 NOT_VERIFIED. AC aggregate: 20 FAIL, 4 NOT_VERIFIED.

## Technical TASK verification

| TASK | Required check | Status | Evidence |
|---|---|---|---|
| WAPI-TASK-001 | API_CONTRACT, BUILD | FAIL | 25 contract tests pass; CJS/ESM preexisting outputs import; current schema accepts invalid dates/time zone, and fresh build was not run because package script deletes/writes project `dist`. |
| WAPI-TASK-002–004 | Provider/location/weather behavior | Pending | Production files absent; MANUAL ownership retained. |
| WAPI-TASK-005–007 | Backend tests and routes | Pending | Only Foundation Jest files exist. |
| WAPI-TASK-008–011 | Client/state/UI and tests | Pending | Only Foundation web files exist. |
| WAPI-TASK-012 | Real-provider smoke and root checks | Pending | Integrated path absent; no smoke performed. |

## Current VER findings

### WAPI-VER-001: Backend search and weather path absent

- Type: IMPLEMENTATION; Severity: MAJOR; Finding Status: OPEN
- User Decision: PENDING; Decision Revision: None; Decision Applicability: NOT_APPLICABLE
- REQ: WAPI-BE-REQ-001–006; AC: WAPI-BE-AC-001–010; TASK: WAPI-TASK-002–007, WAPI-TASK-012
- Expected: Real provider lookup, normalized service behavior, registered unauthenticated search/weather routes, and explicit failure outcomes.
- Actual: `apps/api/src/app.module.ts:4-9` registers only `HealthController`; no weather, locations, or provider production files exist under `apps/api/src`.
- Evidence: file inventory and source inspection at uncommitted 2026-10-27 working tree.
- Impact: Every backend Weather API AC lacks the required route/behavior.
- Suggested Action: Complete approved MANUAL provider/location/WeatherService tasks through the owner and approved AI controller integration; independently reverify.
- History: Created in WAPI-VC-001 pass 1.

### WAPI-VER-002: Frontend weather journey absent

- Type: IMPLEMENTATION; Severity: MAJOR; Finding Status: OPEN
- User Decision: PENDING; Decision Revision: None; Decision Applicability: NOT_APPLICABLE
- REQ: WAPI-FE-REQ-001–005; AC: WAPI-FE-AC-001–009; TASK: WAPI-TASK-008–011
- Expected: Search, selection, successful-location state, persistence, day view, retry, and Atmos API calls.
- Actual: `apps/web/src/router.tsx:5-10` renders only `Atmos`; `apps/web/src/main.tsx:6-9` has only router wiring. `apps/web/package.json:14-20` lacks planned Axios, Query, and Zustand dependencies.
- Evidence: source and package inspection at uncommitted 2026-10-27 working tree.
- Impact: The user cannot complete the minimal weather journey.
- Suggested Action: Complete approved AI frontend tasks and reverify state and integration behavior.
- History: Created in WAPI-VC-001 pass 1.

### WAPI-VER-003: Weather API acceptance tests absent

- Type: TEST_GAP; Severity: MAJOR; Finding Status: OPEN
- User Decision: PENDING; Decision Revision: None; Decision Applicability: NOT_APPLICABLE
- REQ: WAPI-BE-REQ-001–006, WAPI-FE-REQ-001–006; AC: WAPI-BE-AC-001–010, WAPI-FE-AC-001–010; TASK: WAPI-TASK-005–007, WAPI-TASK-011
- Expected: Provider, service, HTTP, and frontend scenario checks required by WAPI-PLAN-001 section 8.
- Actual: API Jest runs only two Foundation suites (11 tests); web Vitest runs one Foundation suite (2 tests). No Weather API test files exist in those apps.
- Evidence: executed `pnpm --filter @atmos/api test` and `pnpm --filter @atmos/web test`, both exit 0; inspected file inventory.
- Impact: Green app suites cannot prove any Weather API AC, including no-polling behavior.
- Suggested Action: Add the approved AI-owned tests after the corresponding behavior exists, then inspect assertion quality and rerun.
- History: Created in WAPI-VC-001 pass 1.

### WAPI-VER-004: Shared weather schema admits invalid local forecast

- Type: BEHAVIOR; Severity: MAJOR; Finding Status: OPEN
- User Decision: PENDING; Decision Revision: None; Decision Applicability: NOT_APPLICABLE
- REQ: WAPI-CON-REQ-002; AC: WAPI-CON-AC-003; TASK: WAPI-TASK-001
- Expected: Contract validates seven local forecast dates and selected location's IANA time zone.
- Actual: `packages/contracts/src/weather.ts:51-55` requires array length seven but not distinct dates; `location.ts:12` and `weather.ts:51` accept any nonempty zone string. `weatherResponseSchema.safeParse` returned `true` for seven copies of `2026-10-27`, empty hourly data, and `Bogus/Zone`.
- Evidence: direct read-only Node parse of existing ESM output at uncommitted 2026-10-27 working tree; current test at `packages/contracts/src/weather.test.ts:76-88` checks six dates but not duplicates/zone validity.
- Impact: Both consumers can accept data that violates the local seven-day identity promised by the contract.
- Suggested Action: Tighten the shared schema and tests within approved WAPI-TASK-001 scope, then verify both module outputs.
- History: Created in WAPI-VC-001 pass 1.

## Deviations and unplanned changes

No material technical deviation was established from the visible Weather API files. Complete unplanned-change coverage is not claimable: there is no Git `HEAD` and most workspace files are untracked. No unrelated change is asserted as a finding.

## Pending manual checks

None specified as `MANUAL_UI`. Required real-provider `RUNTIME_CHECK` entries remain unverified for WAPI-BE-AC-004/006/008 and WAPI-FE-AC-009.

## Coverage summary

- Planned coverage: 24/24 active ACs (100%) have an approved owner and method in WAPI-PLAN-001.
- Verified coverage: 0/24 active ACs (0%) have all mandatory checks PASS.

## Verification run history

### WAPI-VC-001, pass 1, 2026-10-27

- Operation: VERIFY; REVERIFY attempt 0; checked uncommitted working tree with no `HEAD`.
- Commands: `git --no-optional-locks status --short`; `git rev-parse HEAD` (fails: no HEAD); `rg --files`; `pnpm --filter @atmos/contracts test` (25/25 pass); `pnpm --filter @atmos/contracts typecheck` (pass); `pnpm --filter @atmos/api test` (11/11 Foundation tests pass); `pnpm --filter @atmos/web test` (2/2 Foundation tests pass); API/web typecheck (pass); read-only CJS/ESM module import checks (pass); direct ESM schema parse of invalid local forecast (accepted).
- An initial `pnpm --filter @atmos/api test -- --runInBand` was misforwarded as a Jest pattern and found no tests; rerun without the extra argument passed. It is not a product test failure.
- Fresh `build` commands were not run: package scripts delete/recreate `dist`, which would modify project files under the verifier read-only rule. Existing outputs do not prove a fresh build.
- Findings created: WAPI-VER-001 through WAPI-VER-004. No prior verification history or user decisions existed.
- Repository integrity: Git status before and after checks was unchanged. Ignored/generated artifact integrity is not fully confirmed. No processes remain running from this verification.

## Scoped MANUAL implementation review addendum — 2026-11-18

This is a limited, read-only review of WAPI-TASK-002, WAPI-TASK-003, and WAPI-TASK-004 against WAPI-BE Approved v1 and WAPI-PLAN-001 Approved v1. It is **not** a new full-feature VERIFY or REVERIFY pass. The historical cycle counter remains WAPI-VC-001 pass 1, REVERIFY attempt 0. No AC or TASK is newly marked PASS, and the full-feature coverage percentages above are not recalculated. No real-provider smoke check was performed. Checked revision: `38d7b5736552364bd1ec0e397056c48e9aa1d680` plus the uncommitted working tree on 2026-11-18; the exact combined tree has no commit identifier.

### Scoped findings and AC evidence

- **WAPI-VER-001 remains OPEN** (IMPLEMENTATION/INTEGRATION, MAJOR; WAPI-TASK-002/003/004; WAPI-BE-AC-001–010). The backend services now exist, superseding the *absence* observation in the 2026-10-27 finding, but the required search and weather behavior is still unverified and materially defective. `apps/api/src/weather/weather.service.ts:34-39` parses an object containing only `location`, `current`, `hourly`, and `daily`; `packages/contracts/src/weather.ts:49-56` also requires `timeZone` and `units`. `apps/api/src/weather/weather.helpers.ts:43-53` emits numeric `id`, `name`, `admin1`, and `timezone`, whereas `packages/contracts/src/location.ts:4-12` requires decimal-string `id`, `city`, optional `region`, and `timeZone`. Thus even a valid provider forecast cannot pass the shared response parse. This is direct source evidence of failure for the selected-location/current/forecast success path (WAPI-BE-AC-004, WAPI-BE-AC-006, WAPI-BE-AC-008); it does not prove any other AC PASS.
- **WAPI-VER-001, search outcome evidence** (WAPI-TASK-002/003; WAPI-BE-AC-001–003). `apps/api/src/weather/weather.service.ts:14-18` returns a bare location array using the incompatible normalization above; the approved shape is `{ locations: [...] }` (`packages/contracts/src/location.ts:15-18`). Neither this method nor `apps/api/src/open-meteo/open-meteo.service.ts:22-31` trims input or maps invalid input and provider failures to the distinct scoped outcomes in `openspec/changes/weather-api/design.md:21-23`. `apps/api/src/open-meteo/open-meteo-schemas.ts:176-178` defaults a missing provider `results` field to `[]`, so a malformed provider response can be reported as a valid empty search. The method preserves distinct numeric provider IDs in its map, but the public selection contract is not satisfied.
- **WAPI-VER-001, provider and forecast evidence** (WAPI-TASK-002/004; WAPI-BE-AC-005, WAPI-BE-AC-007–010). `apps/api/src/open-meteo/open-meteo.service.ts:33-38` uses a numeric ID rather than the approved decimal-string selection reference and has no typed unknown-ID outcome. Its forecast request at lines 39-83 relies on `timezone: "auto"` and `forecast_days: 7` defaults (`open-meteo-schemas.ts:7-8`), but does not request the selected IANA time zone or `timeformat=unixtime` required by `design.md:25-27`. `apps/api/src/weather/weather.helpers.ts:3-41` passes provider times through without conversion to UTC instants; hourly entries omit contract-required `apparentTemperature` and include extra fields, while daily entries include extra fields (`packages/contracts/src/weather.ts:29-47` uses strict objects). Indexing unequal provider arrays at `weather.helpers.ts:17-41` can yield `undefined` rather than the required `null` gap. The provider service has no explicit bounded timeout or typed mapping for network, HTTP, malformed-payload, or unavailable-weather failure at `open-meteo.service.ts:22-84`. These paths need deterministic tests; their runtime outcomes are not inferred as PASS from static review.
- **WAPI-VER-003 remains OPEN** (TEST_GAP, MAJOR; WAPI-TASK-005/006 as AI-owned test evidence for these MANUAL tasks). `apps/api/src/open-meteo/open-meteo.service.spec.ts:7-17` and `apps/api/src/weather/weather.service.spec.ts:7-17` only assert provider construction, omit dependency mocks, and do not exercise search, ID lookup, normalization, missing values, time zones, or failure behavior. Their failing construction checks are not behavioral evidence. This scoped review does not implement or assign MANUAL fixes.

### Checks and integrity

- `pnpm --filter @atmos/api typecheck`: exit 0.
- `pnpm --filter @atmos/api test --runInBand --no-cache`: exit 1; 6 of 6 suites failed, 6 tests failed and 9 passed. Failures include missing `OPEN_METEO_FORECAST_URL`/`OPEN_METEO_GEOCODING_URL` in existing environment/health tests and unresolved dependencies in service construction tests. Passing tests do not establish any listed MANUAL-task AC.
- API build was not run because `apps/api/package.json:7` deletes and recreates project `dist`. No mutable runtime environment or live-provider check was authorized for this review.
- `git --no-optional-locks status --short` before and after the read-only checks was unchanged. The only persistent edit for this addendum is this `verification.md`; ignored/generated artifact integrity is not fully confirmed. No server or long-lived process was started.

Next action for this scoped review: **AWAITING_USER_APPROVAL** for corrections to the existing WAPI-VER-001 and WAPI-VER-003 findings; then perform a cycle-consistent REVERIFY of affected ACs and mandatory checks. Full-feature status and unrelated findings require independent reassessment when that broader verification is requested.

## Scoped MANUAL implementation REVERIFY — 2026-11-18

**GAPS_FOUND for this scope.** This is WAPI-VC-001 pass 2, REVERIFY attempt 1 (authorized automatic limit 2), against the same Approved v1 WAPI-BE/WAPI-CON specifications and WAPI-PLAN-001. It rechecks WAPI-TASK-002/003/004 and affected contract behavior after the preceding scoped review. The checked revision is `38d7b5736552364bd1ec0e397056c48e9aa1d680` plus the uncommitted working tree; the combined tree has no stable commit ID. There is no complete change-scope baseline for changes between the two same-day scoped reviews. No full-feature AC matrix, historical full-feature verdict, or coverage percentage above is replaced by this limited result. The approved verification owners remain WAPI-TASK-005 for WAPI-BE-AC-001–003 and WAPI-TASK-006 for WAPI-BE-AC-004–010; the MANUAL tasks are implementation contributors, not verification owners.

### Rechecked evidence and finding disposition

- **WAPI-VER-001 remains OPEN** (MAJOR, implementation/integration; WAPI-BE-AC-001–010, WAPI-TASK-002/003/004). Search now returns `{ locations: ... }` (`apps/api/src/weather/weather.service.ts:14-18`), and the normalized city/country labels are closer to the contract (`apps/api/src/weather/weather.helpers.ts:43-50`). The result still has a numeric `id`, lacks optional provider `admin1` as `region`, and therefore fails the decimal-string ID contract (`packages/contracts/src/location.ts:4-12`). Duplicate-name results can retain distinct *numeric provider* IDs, but no API response fixture or behavioral test validates WAPI-BE-AC-001. A missing provider `results` property still becomes an empty success (`apps/api/src/open-meteo/open-meteo-schemas.ts:176-178`). Neither search method trims/validates a nonblank query or maps provider failure to the approved `INVALID_SEARCH`/`SEARCH_UNAVAILABLE` outcomes (`apps/api/src/weather/weather.service.ts:14-18`, `apps/api/src/open-meteo/open-meteo.service.ts:22-31`). Thus WAPI-BE-AC-002/003 have no valid passing evidence, and the malformed upstream response can be misreported as empty success.
- **WAPI-VER-001 remains OPEN for selected weather** (WAPI-BE-AC-004–010). The service resolves the supplied number via get-by-ID and uses returned coordinates (`apps/api/src/weather/weather.service.ts:26-32`), but `getCityById` has no positive decimal-string validation or typed unknown-ID mapping (`apps/api/src/open-meteo/open-meteo.service.ts:33-38`). The registered controller uses `/api/weather/weather?id=...` and `/api/weather/cities?q=...`, while approved routes are `/api/weather?locationId=...` and `/api/locations/search?q=...` (`apps/api/src/weather/weather.controller.ts:4-20`, `apps/api/src/main.ts:10`, `openspec/changes/weather-api/design.md:21-23`). The service's outbound `weatherResponseSchema.parse` necessarily rejects the current assembled object: it has numeric `location.id`; hourly entries omit required `apparentTemperature` and add strict-schema extras; daily entries add strict-schema extras (`apps/api/src/weather/weather.service.ts:34-39`, `apps/api/src/weather/weather.helpers.ts:17-50`, `packages/contracts/src/weather.ts:29-54`). Hence even a complete provider response cannot produce the approved successful weather payload. The forecast request still uses default `timezone: "auto"`, has no Unix time format or explicit selected IANA zone (`apps/api/src/open-meteo/open-meteo.service.ts:39-82`, `apps/api/src/open-meteo/open-meteo-schemas.ts:7-8`); current/hourly times are passed through unchanged instead of normalized to UTC instants (`apps/api/src/weather/weather.helpers.ts:3-26`). Weather units are absent from the returned object. Array indexing can yield `undefined` for partial provider arrays instead of `null` (`apps/api/src/weather/weather.helpers.ts:17-40`). Provider network, HTTP, unknown-location and unusable-weather errors are not mapped to the scoped response codes in these services. Static inspection supports failure of the success path and leaves other runtime outcomes unverified; no real-provider check was performed.
- **WAPI-VER-003 remains OPEN** (MAJOR, TEST_GAP; WAPI-TASK-005/006/007). The provider and WeatherService specs still assert only construction, do not supply required dependencies, and do not test the AC behavior (`apps/api/src/open-meteo/open-meteo.service.spec.ts:7-17`, `apps/api/src/weather/weather.service.spec.ts:7-17`). The controller specs likewise only assert construction (`apps/api/src/weather/weather.controller.spec.ts:8-19`, `apps/api/src/open-meteo/open-meteo.controller.spec.ts:8-19`). This is not valid evidence for any scoped backend AC.
- **WAPI-VER-004 remains OPEN with new evidence** (MAJOR, BEHAVIOR; WAPI-CON-AC-003/004, WAPI-TASK-001). Since the preceding review, `weatherResponseSchema` omits top-level `timeZone` and `units` entirely (`packages/contracts/src/weather.ts:49-54`), contrary to WAPI-CON-REQ-002, WAPI-TDEC-002/003, and the existing valid contract fixture (`packages/contracts/src/weather.test.ts:17-27`). Its strict object now rejects that fixture; 2 contract tests fail. The earlier duplicate-date/IANA-validation gap also remains (`packages/contracts/src/location.ts:12`, `packages/contracts/src/weather.ts:53`). This is an affected shared-contract regression, not a separate new VER ID.

No scoped backend AC is newly marked PASS: WAPI-BE-AC-004/006/008 success paths fail by direct schema/route inspection; WAPI-BE-AC-001–003/005/007/009/010 lack the required passing behavioral evidence, with the defects above noted. WAPI-CON-AC-003 fails in the changed shared contract; WAPI-CON-AC-004 has no passing current contract-test evidence. The exact existing full-feature AC/REQ counts and percentages above are historical, not current totals.

### Checks, scope, and integrity

- `pnpm --filter @atmos/api typecheck`: exit 0. This establishes TypeScript compatibility only.
- `pnpm --filter @atmos/api test --runInBand --no-cache`: exit 1; 6/6 suites failed, 6 tests failed, 9 passed. Existing health/environment tests fail because `OPEN_METEO_FORECAST_URL` and `OPEN_METEO_GEOCODING_URL` are required but absent from their fixtures; service/controller construction specs fail on missing injected dependencies. No passing backend Weather API behavior assertion was found.
- `pnpm --filter @atmos/contracts test`: exit 1; 23 passed, 2 failed. The valid weather fixture is rejected because `timeZone` and `units` are unrecognized (`packages/contracts/src/weather.test.ts:65,69`; `packages/contracts/src/weather.ts:49-54`). The remaining passing tests do not establish these missing fields or the complete API/browser path.
- API build was not run: its script removes and recreates `dist` (`apps/api/package.json:7`), outside the verifier's read-only project scope. No live-provider, mutable runtime, or migration check ran. No process started by this review remains running.
- Git baseline and closing status show the same tracked/untracked path list, including pre-existing source, contract, Postman, and verification modifications. The only intentional persistent write by this run is this addendum. Full ignored/generated-artifact integrity and complete unplanned-change coverage are not confirmed. Postman artifacts changed outside the MANUAL task files (`postman/collections/atmos-api/forecast.request.yaml`, `cities.request.yaml`); their relationship to the broader approved plan was not assessed in this scoped pass.

**Next actions:** AWAITING_USER_APPROVAL for corrections to the existing WAPI-VER-001, WAPI-VER-003, and WAPI-VER-004 findings; PROVIDE_MISSING_EVIDENCE for deterministic backend behavior tests and a bounded real-provider smoke check when the integration is ready. Any further fix REVERIFY in WAPI-VC-001 uses attempt 2 unless a material approved acceptance change establishes a new cycle.

## Scoped MANUAL implementation REVERIFY — 2026-11-18, pass 3

**Scoped verdict: ESCALATED.** This is WAPI-VC-001 pass 3, REVERIFY attempt 2, the highest automatically authorized attempt. The baseline remains Approved v1 WAPI-BE/WAPI-CON specifications and WAPI-PLAN-001. Scope is WAPI-TASK-002/003/004 and their affected contract/test evidence, not a replacement for the historical full-feature matrix or coverage counts. Checked revision: `38d7b5736552364bd1ec0e397056c48e9aa1d680` plus the 2026-11-18 uncommitted working tree; the combined tree has no commit ID. Complete file-level change scope between pass 2 and this pass was unavailable; full unplanned-change and regression coverage is not claimed. Verification ownership remains WAPI-TASK-005 for WAPI-BE-AC-001–003 and WAPI-TASK-006 for WAPI-BE-AC-004–010.

### Current scoped results and stable finding dispositions

- **WAPI-VER-001 remains OPEN** (IMPLEMENTATION/INTEGRATION, MAJOR; decision PENDING, applicability NOT_APPLICABLE; WAPI-BE-AC-001–010; WAPI-TASK-002/003/004). The search service returns the required outer `{ locations }` shape, but `normalizeLocation` emits a numeric provider ID and drops available `admin1` (`apps/api/src/weather/weather.helpers.ts:43-50`), whereas the shared location contract requires a positive decimal-string ID and supports `region` (`packages/contracts/src/location.ts:3-12`). Search input is neither trimmed nor mapped to `INVALID_SEARCH`, and upstream errors are not mapped to `SEARCH_UNAVAILABLE` (`apps/api/src/weather/weather.service.ts:14-18`, `apps/api/src/open-meteo/open-meteo.service.ts:22-31`); a missing `results` property parses as an empty match set (`apps/api/src/open-meteo/open-meteo-schemas.ts:176-178`). These defects prevent valid evidence for WAPI-BE-AC-001–003.
- **WAPI-VER-001 remains OPEN for selected weather** (WAPI-BE-AC-004–010). `getWeather` resolves a numeric ID to provider coordinates, but the approved request is a decimal-string `locationId`; the registered route instead expects `/api/weather/weather?id=...` (`apps/api/src/weather/weather.controller.ts:4-15`, `apps/api/src/weather/weather.service.ts:26-32`; approved `design.md:17-23`). No explicit invalid/unknown-ID or upstream weather error mapping exists in the MANUAL services (`apps/api/src/open-meteo/open-meteo.service.ts:33-38,75-83`, `apps/api/src/weather/weather.service.ts:26-39`). The forecast request defaults to `timezone: "auto"` and omits `timeformat=unixtime` and the resolved city's IANA zone (`apps/api/src/open-meteo/open-meteo-schemas.ts:7-8`, `apps/api/src/open-meteo/open-meteo.service.ts:39-81`). Current/hourly provider times are passed through without UTC normalization (`apps/api/src/weather/weather.helpers.ts:3-26`). The strict shared weather schema requires `hourly.apparentTemperature` and rejects extra hourly/daily fields, while the assembled response has no units and a numeric location ID (`packages/contracts/src/weather.ts:29-54`, `apps/api/src/weather/weather.helpers.ts:17-50`, `apps/api/src/weather/weather.service.ts:34-39`). A complete provider payload therefore cannot pass the outbound weather parse. WAPI-BE-AC-004/006/008 success paths are FAIL on this direct code evidence; the other scoped ACs have no valid PASS evidence, with the stated defects affecting their outcomes.
- **Partial-array change within WAPI-VER-001:** `normalizeHourly` now applies `?? null` to each indexed measurement (`apps/api/src/weather/weather.helpers.ts:17-26`), preserving measured zero and making a short hourly measurement array yield `null` for that entry. This addresses the prior *hourly index-to-undefined* observation in isolation, but no behavioral test proves the full WAPI-BE-AC-009 path and the result still fails the strict hourly schema. `normalizeDaily` continues to index measurement arrays without a null fallback (`weather.helpers.ts:29-40`); a shorter daily measurement array yields `undefined`, which is rejected rather than preserved as the required `null` gap. Current measurements also require all provider keys as number-or-null (`apps/api/src/open-meteo/open-meteo-schemas.ts:57-71`), so an omitted current key fails parsing instead of becoming a missing measurement in a successful result (WAPI-BE-AC-007). No WAPI-BE-AC-007 or WAPI-BE-AC-009 PASS is claimed.
- **WAPI-VER-003 remains OPEN** (TEST_GAP, MAJOR; decision PENDING, applicability NOT_APPLICABLE; WAPI-TASK-005/006/007). Provider and WeatherService specs still assert only construction without dependency mocks or behavioral assertions (`apps/api/src/open-meteo/open-meteo.service.spec.ts:7-17`, `apps/api/src/weather/weather.service.spec.ts:7-17`). The API suite fails before these specs exercise search, selection, time, null gaps, or failure outcomes. No required provider/service/HTTP entry has valid passing evidence.
- **WAPI-VER-004 remains OPEN** (BEHAVIOR, MAJOR; decision PENDING, applicability NOT_APPLICABLE; WAPI-CON-AC-003/004; WAPI-TASK-001). The shared `weatherResponseSchema` still omits top-level `timeZone` and `units` (`packages/contracts/src/weather.ts:49-54`) contrary to WAPI-CON-REQ-002 and WAPI-TDEC-002/003. Its strict parser rejects the existing valid fixture carrying those fields; the corresponding two tests fail (`packages/contracts/src/weather.test.ts:17-27,63-74`). The prior duplicate-date/IANA-zone validation gap also remains (`packages/contracts/src/weather.ts:49-54`, `packages/contracts/src/location.ts:12`). WAPI-CON-AC-003 is FAIL; WAPI-CON-AC-004 has no passing current contract-test evidence.

### Checks, integrity, and next action

- `pnpm --filter @atmos/api typecheck`: exit 0. `pnpm --filter @atmos/contracts typecheck`: exit 0. These establish type compatibility only.
- `pnpm --filter @atmos/api test --runInBand --no-cache`: exit 1; 6/6 suites failed, 6 tests failed, 9 passed. Health/environment fixtures lack the required Open-Meteo URL settings, and service/controller construction specs lack injected dependencies. Passing tests do not establish a scoped Weather API AC.
- `pnpm --filter @atmos/contracts test`: exit 1; 23 passed, 2 failed. The valid weather fixture is rejected for unrecognized `timeZone` and `units`.
- Fresh API/contracts builds were not run because package build scripts remove and recreate project `dist` (`apps/api/package.json`, `packages/contracts/package.json`), outside read-only verification scope. No authorized live-provider runtime check or real-provider smoke was performed. No long-lived process was started.
- Git tracked/untracked path list was unchanged before and after the read-only checks. The sole intended persistent project write is this report append. Ignored/generated artifact integrity is not fully confirmed. Pre-existing Postman and other uncommitted edits were not assessed as part of this MANUAL scope.

**Next actions:** AWAITING_USER_DECISION on the unresolved WAPI-VER-001/003/004 gaps and any specifically authorized additional attempt (cycle ID `WAPI-VC-001`, attempt number `3`, user attribution required); PROVIDE_MISSING_EVIDENCE for deterministic backend tests and the bounded real-provider smoke. No additional automatic correction or REVERIFY attempt is authorized by this report. Previous findings, decisions, cycle history, and full-feature coverage figures above remain historical and visible.

## Scoped MANUAL implementation REVERIFY — 2026-11-18, pass 4

**Scoped verdict: ESCALATED.** Cycle `WAPI-VC-001`, pass 4, REVERIFY attempt 3. The project owner's explicit request for another recheck after pass 3 was relayed by the Orchestrator and authorizes this exact additional attempt; it does not authorize attempt 4. Baseline: Approved v1 `WAPI-BE` and `WAPI-CON` requirements, Approved v1 `WAPI-PLAN-001`; no acceptance change or new cycle. Scope: MANUAL `WAPI-TASK-002/003/004`, their AI-owned test evidence, affected shared contracts, and route wiring. Checked revision: `38d7b5736552364bd1ec0e397056c48e9aa1d680` plus the current uncommitted working tree; this combined state has no commit ID. No complete between-pass diff baseline or full-feature regression scope was supplied. The initial full-feature matrix and coverage figures above remain historical, not current pass-4 results. Verification owners remain `WAPI-TASK-005` for `WAPI-BE-AC-001–003` and `WAPI-TASK-006` for `WAPI-BE-AC-004–010`.

### Scoped AC results and findings

| AC | Pass-4 status | Evidence and limitation |
|---|---|---|
| WAPI-BE-AC-001 | FAIL | `normalizeLocation` drops available `admin1` region (`weather.helpers.ts:43-51`); the required public search route is absent (`weather.controller.ts:4-20`). No duplicate-name behavior test passes. |
| WAPI-BE-AC-002 | NOT_VERIFIED | `{ locations: [] }` is returned for a true no-match provider result, but the required HTTP 200 path has no passing test; a malformed provider object without `results` is also coerced to empty (`open-meteo-schemas.ts:176-178`). |
| WAPI-BE-AC-003 | FAIL | Search query is untrimmed (`weather.service.ts:14-18`), whitespace passes `CitiesQuerySchema`'s `min(1)`, and provider failure has no scoped `SEARCH_UNAVAILABLE` mapping (`open-meteo.service.ts:22-31`). No required search error HTTP test passes. |
| WAPI-BE-AC-004 | FAIL | Registered route is `/api/weather/weather?id=...`, rather than `/api/weather?locationId=...` (`weather.controller.ts:4-15`); the assembled payload is rejected by the strict weather schema due to extra hourly/daily fields (`weather.helpers.ts:17-41`, `packages/contracts/src/weather.ts:29-53`). Required real-provider check was not run. |
| WAPI-BE-AC-005 | NOT_VERIFIED | `ParseIntPipe` and provider get-by-ID have no approved decimal-string/unknown-ID mapping (`weather.controller.ts:8-10`, `open-meteo.service.ts:33-38`); no behavioral HTTP fixture establishes the exact non-success outcome. |
| WAPI-BE-AC-006 | FAIL | Successful payload cannot pass outbound strict schema; it also omits top-level units (`weather.service.ts:34-39`, `packages/contracts/src/weather.ts:48-53`). Required real-provider check was not run. |
| WAPI-BE-AC-007 | FAIL | Omitted current provider measurement fails `CurrentSchema` instead of becoming an identifiable missing value (`open-meteo-schemas.ts:57-71`); no behavioral test validates zero/null fidelity. |
| WAPI-BE-AC-008 | FAIL | Forecast request uses `timezone: auto` default and omits `timeformat=unixtime`; current/hourly times pass through without UTC conversion, and the response omits top-level IANA zone (`open-meteo-schemas.ts:7-8`, `open-meteo.service.ts:39-82`, `weather.helpers.ts:3-26`, `weather.service.ts:34-39`). Required real-provider check was not run. |
| WAPI-BE-AC-009 | NOT_VERIFIED | `normalizeHourly` and now `normalizeDaily` use `?? null` for short numeric arrays (`weather.helpers.ts:17-41`), resolving the earlier index-to-`undefined` observation in isolation. No partial-data behavior test passes; full output still fails strict schema on extra fields. |
| WAPI-BE-AC-010 | NOT_VERIFIED | Provider failures are not mapped to `WEATHER_UNAVAILABLE` (`open-meteo.service.ts:33-83`, `weather.service.ts:26-39`); no HTTP failure fixture establishes the required result. |
| WAPI-CON-AC-001 | FAIL | `locationIdSchema` now coerces numeric and leading-zero IDs despite the approved decimal-string reference (`packages/contracts/src/location.ts:3-7`); two malformed-ID tests fail (`weather.test.ts:34-45`). |
| WAPI-CON-AC-003 | FAIL | Strict weather schema omits top-level `timeZone` and `units` and rejects the approved valid fixture; local-date uniqueness/IANA-zone validity remain unchecked (`packages/contracts/src/weather.ts:48-53`, `weather.test.ts:63-74`). |
| WAPI-CON-AC-004 | NOT_VERIFIED | The zero-versus-null test cannot reach its assertions because the valid fixture fails parsing (`weather.test.ts:68-73`); no complete passing API/browser validation evidence exists. |

`WAPI-VER-001` remains **OPEN** (IMPLEMENTATION/INTEGRATION, MAJOR; decision PENDING, applicability NOT_APPLICABLE; WAPI-BE-AC-001–010; WAPI-TASK-002/003/004). The prior daily short-array gap is resolved in source by `?? null`; route, search, selected-ID, source-fidelity, time-zone, output-schema, and error-outcome gaps above remain. `WAPI-VER-003` remains **OPEN** (TEST_GAP, MAJOR; decision PENDING, applicability NOT_APPLICABLE; WAPI-TASK-005/006/007). Provider, WeatherService, and controller specs still assert only construction without dependency mocks or behavior assertions (`apps/api/src/open-meteo/*.spec.ts`, `apps/api/src/weather/*.spec.ts`). `WAPI-VER-004` remains **OPEN** (BEHAVIOR, MAJOR; decision PENDING, applicability NOT_APPLICABLE; WAPI-CON-AC-003/004; WAPI-TASK-001). Weather response schema and fixtures still conflict on zone, units, and hourly shape. No prior user decision is present to carry forward.

#### WAPI-VER-005: Location ID contract accepts disallowed representations

- Type: BEHAVIOR; Severity: MAJOR; Finding Status: OPEN.
- User Decision: PENDING; Decision Revision: None; Decision Applicability: NOT_APPLICABLE.
- REQ: WAPI-CON-REQ-001; AC: WAPI-CON-AC-001; TASK: WAPI-TASK-001.
- Expected: Shared selection reference validates a positive decimal string, rejecting numeric and leading-zero representations under `WAPI-TDEC-001`.
- Actual: `z.coerce.number().int().positive()` accepts both and outputs a number.
- Evidence: `packages/contracts/src/location.ts:3-7`; `pnpm --filter @atmos/contracts test` failed the `numeric id` and `leading-zero id` cases on checked pass-4 tree.
- Impact: Browser/API agreement on stable wire identity and malformed reference rejection is weakened.
- Suggested Action: Reconcile the location ID schema with the approved decimal-string wire decision and retain tests for malformed forms.
- History: Created in `WAPI-VC-001` pass 4; no earlier decision.

### Checks, integrity, and next actions

- `pnpm --filter @atmos/api typecheck`: exit 0. `pnpm --filter @atmos/contracts typecheck`: exit 0. These establish type compatibility only.
- `pnpm --filter @atmos/api test --runInBand --no-cache`: exit 1; 6/6 suites failed, 6 tests failed, 9 passed. Health/environment fixtures omit the new Open-Meteo URL settings; provider/WeatherService/controller construction specs lack injected dependencies. No scoped backend behavior assertion passed.
- `pnpm --filter @atmos/contracts test`: exit 1; 4 failed, 21 passed. Two location-ID rejection cases fail; two valid-weather/zero-null cases fail because the strict parser rejects extra `timeZone`, `units`, and hourly `apparentTemperature` fields. The passing tests do not establish the affected ACs.
- Fresh API/contracts builds were not run because the scripts remove and recreate project `dist` (`apps/api/package.json`, `packages/contracts/package.json`), outside read-only verification scope. No live-provider smoke or mutable runtime check ran, so provider connectivity and actual weather values remain unverified. No long-lived process was started.
- Closing Git tracked/untracked path list matched the pre-check baseline; the only intentional persistent project write is this report append. Ignored/generated artifact integrity is not fully confirmed. Pre-existing Postman edits and full unplanned-change coverage remain outside this scoped review.

**Next actions, in order:** AWAITING_USER_DECISION on whether to authorize specifically `WAPI-VC-001` attempt 4, since gaps remain after the highest authorized attempt; AWAITING_USER_APPROVAL for any corrections to `WAPI-VER-001/003/004/005`; PROVIDE_MISSING_EVIDENCE for passing deterministic backend checks and the required bounded real-provider smoke. No further automatic correction or REVERIFY attempt is authorized by this report.
