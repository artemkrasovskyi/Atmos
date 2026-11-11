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
