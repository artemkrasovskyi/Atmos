# Proposal: Weather API

## Why

The Foundation exposes a technical frontend route and health endpoint but cannot yet retrieve weather. This change provides the first functional journey: search for a city, select an unambiguous location, and receive real current conditions and forecasts through Atmos.

## What Changes

- Add location search with distinguishable results and explicit empty, invalid-input, and failure outcomes.
- Add selected-location current conditions, hourly forecast, and seven-day daily forecast from Open-Meteo, preserving missing values and location-local time meaning.
- Add shared browser/server contracts for those results and a minimal frontend integration that can demonstrate search, selection, loading, success, failure, retry, and day selection.
- Preserve the previous successful location and weather until a new selection succeeds; use Kyiv on first use and remember the last successful selection, including for guests.

## Capabilities

### New Capabilities

- `weather-backend`: Location search and selected-location current/hourly/daily weather behavior.
- `weather-frontend`: Minimal frontend weather journey and selection state.

### Modified Capabilities

- `api-contracts`: Add shared location-search and weather contracts alongside the existing health contract.

## Boundaries and ownership

Redis weather caching, stale-if-error, manual refresh cooldown, Historical Analytics, the full Weather Dashboard, Mapbox UI, authentication, favorites, profiles, and cloud deployment are outside this stage. The frontend calls Atmos, never Open-Meteo directly. No periodic background weather polling or fabricated measurements.

Under approved ownership decision `WAPI-BE-DEC-002`, the project owner will implement the core Open-Meteo provider integration, weather interpretation/normalization, and WeatherService behavior (or equivalents) as **MANUAL** work. **AI** owns all Backend tests in this stage, including tests for provider integration, normalization, and WeatherService behavior, as well as supporting module/controller wiring, shared contracts, minimal frontend integration, and configuration. AI-owned tests may define expected behavior or follow the owner's implementation; they do not authorize AI to implement or replace MANUAL core logic. The Implementation Planner will split this boundary into concrete dependency-ordered tasks.

## Architecture review

`WAPI-BE-DEC-001` (ACTIVE): On 2026-10-27, the project owner explicitly deferred Redis weather/geocoding caching, stale-if-error behavior, and manual refresh cooldown from the Weather API stage. `docs/decisions.md` records this approved staging decision, and `docs/architecture.md` distinguishes the initial uncached request paths from the later cache-aside target. The Weather API requirements were approved on 2026-10-27; no caching architecture is redesigned here.

## Questions resolved by approved design

### WAPI-BE-Q-001

Status: RESOLVED. Original severity: NON-BLOCKING. Resolved by: `WAPI-TDEC-001` in the design approved on 2026-10-27.

Question: What representation should the stable selected-location reference and public endpoint use?

Why it matters: The implementation design must choose a wire representation, but the requirement already fixes unambiguous selection and location-specific weather.

Suggested options: A. Opaque provider-backed identifier. B. Normalized location identity. C. Another stable representation.

Affected scenarios: WAPI-BE-AC-001, WAPI-BE-AC-004, WAPI-CON-AC-001.

### WAPI-BE-Q-002

Status: RESOLVED. Original severity: NON-BLOCKING. Resolved by: `WAPI-TDEC-003` in the design approved on 2026-10-27.

Question: Which additional current metrics beyond those listed in WAPI-BE-REQ-004 belong in this stage?

Why it matters: Exact Overview cards remain open in `docs/product.md`; the listed fields and missing-value rule already make this stage testable.

Suggested options: A. Listed fields only for this stage. B. Add other named source metrics. C. Defer decision until Dashboard.

Affected scenarios: WAPI-BE-AC-006, WAPI-CON-AC-003.

### WAPI-FE-Q-001

Status: RESOLVED. Original severity: NON-BLOCKING. Resolved by: `WAPI-TDEC-005` in the design approved on 2026-10-27.

Question: Should unit preference controls appear on the minimal technical surface or wait for the Weather Dashboard?

Why it matters: `docs/product.md` WD-07 defines product-wide preferences, while this stage asks for a minimal integration rather than presentation controls. The approved requirements require explicit value/unit meaning without adding controls.

Suggested options: A. Defer controls to Dashboard. B. Add minimal preference controls in this stage. C. Another limited unit behavior.

Affected scenarios: WAPI-FE-AC-009, WAPI-CON-AC-003.

### WAPI-FE-Q-002

Status: RESOLVED. Original severity: NON-BLOCKING. Resolved by: `WAPI-TDEC-003` in the design approved on 2026-10-27.

Question: What precise hourly cutoff should the future Dashboard use for today's details?

Why it matters: `docs/product.md` leaves this open; the current stage only requires location-local hourly data for each selectable forecast day.

Suggested options: A. Resolve during Dashboard planning. B. Set a cutoff in this change. C. Another presentation rule.

Affected scenarios: WAPI-FE-AC-008.

### WAPI-CON-Q-001

Status: RESOLVED. Original severity: NON-BLOCKING. Resolved by: `WAPI-TDEC-002` and `WAPI-TDEC-003` in the design approved on 2026-10-27.

Question: What exact public wire field names and error representation should the shared contracts use?

Why it matters: The approved architecture fixes shared Zod validation and no mandatory success envelope, while observable outcome distinctions are already specified.

Suggested options: A. Resolve with technical design. B. Agree explicit fields before design. C. Another contract convention.

Affected scenarios: WAPI-CON-AC-001–004.

## Status

Requirements, technical design, and implementation plan Approved v1 by the project owner on 2026-10-27. The five historical non-blocking questions above are resolved for this stage by approved `WAPI-TDEC-001`, `WAPI-TDEC-002`, `WAPI-TDEC-003`, and `WAPI-TDEC-005`; their original text and IDs remain for traceability. Approval does not mark implementation tasks or acceptance criteria complete.
