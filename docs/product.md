# Atmos — Product Context

**Status:** Consolidated product decisions from discussion; not an implementation specification. No product code is implied to exist.

## Vision and scope

Atmos is a desktop-first weather analytics product with an interactive location map, current conditions, 7-day forecast, historical visualization, favorites, and authentication. Real weather/geocoding data comes from Open-Meteo. The objective is both a usable MVP and a learning project focused on NestJS backend fundamentals. Avoid dummy weather responses in the shipped application.

### UX direction

Dark charcoal/navy, restrained light-blue accents, soft slightly 3D weather illustrations. Overview is the visual starting point; Figma is authoritative for available approved UI mocks. Full mobile experience and exact card content are not yet designed.

## MVP pages and surfaces

### Overview

- Collapsible sidebar: Overview, Historical Analytics; favorites appear for authenticated users; profile/account access at bottom. Guest can use weather features.
- Compact header; large interactive Mapbox map with search and map controls overlaid; seven daily cards below map; persistent right column with Current Weather, Hourly Forecast, and Selected Day Details.
- Map shows active city and clickable favorite markers; user may pan/zoom, but arbitrary map clicks do **not** select a location. Reopening Overview recenters map on the active city at default zoom; viewport is not persisted.
- Header/search result shows city + region + country and can be selected immediately (no preview or confirmation).

### Historical Analytics

- Shares the globally active city with Overview. Changing city on one page updates the other.
- Four compact KPIs (exact metrics deferred) and up to four regular charts in a 2×2 layout: temperature, precipitation, wind, and provisional humidity.
- Preset date ranges only (candidate 30 days, 90 days, 12 months, 5 years; final availability/periods depend on provider checks). Automatic daily/monthly resolution and metric-appropriate aggregation; no user-controlled granularity.
- Chart hover tooltips and point/bar emphasis. No chart zoom, synchronized cursors, fullscreen, custom date-picker, export, or interactive legend toggling in MVP.
- Filter changes apply immediately, show prior valid data during loading, and only accept the newest outstanding request result. Period selection remains independent of page navigation.
- Partial historical coverage must display available measurements with genuine gaps and a notice about missing dates; KPIs use available records only. Never fabricate missing values or substitute zero. Empty state when nothing is available.

### Auth, account, favorites

- Modal Sign In / Sign Up: email/password and Google OAuth via NestJS; successful auth preserves current location/page/day/period.
- Email confirmation **not required in MVP**. Email verification, password recovery and manual Google linking are explicitly deferred; avoid nonfunctional links. This is a known account-recovery limitation before public release.
- User stays signed in via sliding 7-day Redis session (no absolute expiry), subject to cookie validity and server revocation. Logout invalidates server session but preserves guest-compatible city/unit settings.
- Account & Preferences modal shows display name/email, edit display name, units, logout; no avatar/email/password changing. Guest only sees preferences.
- Favorites exist **only** for authenticated accounts, persisted in PostgreSQL, without local guest favorites or merge-on-login. Favorite icon beside active city toggles save/remove; sidebar navigates favorites. Attempting favorite as guest opens auth modal. Removing active city from favorites does not change active city.
- OAuth conflict: existing Google `sub` signs in; first-time Google identity can create an account if email unused. Matching existing unverified local email does not auto-link or sign in as that account. Automatic linking requires a verified Atmos email and authoritative Google email verification; email verification isn't implemented in MVP, so this linking is largely unavailable in MVP. No manual linking until later.

## Functional requirements and acceptance criteria

### Weather / navigation

- **WD-01:** Initial location is last *successfully* viewed city persisted locally, or Kyiv on first visit/unavailable saved location. Guest behavior identical.
- **WD-02:** Search displays location, region and country. Selecting a result requests its data without confirmation; selected *active* city changes only upon successful weather load.
- **WD-03:** Forecast has 7 daily selections. Default today; changing day updates Hourly Forecast and Selected Day Details from loaded data. Current Weather always refers to current conditions. Exact hourly cut-off remains an open detail.
- **WD-04:** Marker for active city; favorites markers selectable. No arbitrary map-click selection or weather map layers.
- **WD-05:** Favorite toggle at active city name. Guest triggers auth. Sidebar favorites switch city using same safe loading behavior.
- **WD-06:** No polling. Requests on app opening, successful city selection workflow, relevant page/period data needs, or manual refresh. Day selection is client-side.
- **WD-07:** Unit changes apply app-wide, persist between visits even as guest and do not reset city/day/period. Temperature °C/°F, wind km/h/mph/m/s, precipitation mm/in, pressure hPa/mmHg. Defaults °C, km/h, mm, hPa.
- **WD-08:** During city switch retain former city and weather until new data loads; if request fails, stay on previous city, surface Retry and do not overwrite last-city persistence.

### Historical analytics

- **HA-01:** Only preset periods; candidate 30d/90d/12mo/5y subject to actual provider coverage.
- **HA-02:** Server-side appropriate aggregation; granularity chosen automatically, not by the user. Do not imply raw hourly points for all five years.
- **HA-03:** Tooltip and hovered-value emphasis, no advanced chart controls.
- **HA-04:** Filters auto-apply; preserve prior valid data in loading/error; latest filter combination wins.
- **HA-05:** Active city shared with Overview; historical period independently maintained in nonpersistent client state.
- **HA-06:** Missing dates represented as gaps and a warning; no fabricated values; calculate KPIs on available coverage.

### Auth and preferences

- **AA-01:** Email/password and Google OAuth in modal UI. Keep page, city and current selections across auth.
- **AA-02:** No compulsory verification to use registered account.
- **AA-03:** Forgot Password deferred; no dead UI action.
- **AA-04:** Account modal supports display-name editing, units, logout; guests get preferences.
- **AA-05:** Session remains alive when active; sliding 7d inactivity expiry with no absolute expiry. Logout server-side revoke.
- **AA-06:** Favorites isolated per account. No guest favorites nor merge.
- **ML-01:** Navigating back to Overview resets map center/zoom to active city default.

## Initial API surface agreed for first functional slice (context only)

1. `GET /api/health` — readiness/smoke health response (probe semantics refined during Foundation).
2. `GET /api/locations/search?q=Kyiv` — Open-Meteo geocoding results, normalized.
3. `GET /api/weather?locationId=...` — overview data: current, hourly and daily forecast plus location metadata and freshness state. Exact response fields/schema and stable location identifier resolved in the feature change.

All additional endpoints (auth, profile, favorites, analytics) will be specified just before implementing their capabilities. API prefix `/api` with **no version segment** and successful JSON responses without mandatory `data`/`meta` envelopes. Error responses are standardized separately.

## Resilience and caching (user-visible consequences)

- Current weather Redis fresh TTL 10min + **additional** stale retention 1h; forecast 30min + 6h; historical 24h + 7d; geocoding 7d + 30d.
- On cache miss/expiry try Open-Meteo **once**; if upstream failure, return stale backup when available and clearly mark stale plus last fetched time. If nothing is cached, show error.
- Explicit Refresh bypasses fresh Redis and requests Open-Meteo. On failure it must not falsely report success or overwrite previous good data. Per-city global Redis cooldown 5min for forced refresh, config-driven, HTTP 429 with Retry-After during cooldown, protect concurrent requests and broader abuse. No automatic upstream retries.
- Frontend disables automatic TanStack Query refetch on focus/reconnect/timer. Cache is memory-based; page/app opening and deliberate actions load as required.

## Excluded from MVP

Location comparison, alerts, Developer API, weather map overlays, coordinate-picking by clicking anywhere on map, advanced chart tools, export, full mobile design, password reset, email verification, manual account linking, periodic weather polling and comprehensive frontend unit/component suite.

## Known unresolved items — resolve near relevant implementation

- Exact Figma URL/read-only agent connector and completeness of designed screens.
- Weather cards' precise fields, icon mappings, accessible text and hourly cut-off.
- Historical KPI fields, final fourth chart and precise historical range compatibility with Open-Meteo endpoints/models, including geocoding/provider terms and quotas.
- Final REST schemas for weather and locations; location identifier representation (geocoding id vs coordinates) and stable timezone handling.
- User creation/login validation specifics; production account recovery and email enumeration/privacy protections.
- Cloud provider, cost ceilings, production domain topology/CORS and final cookie parameters.
- Actual code owner for each Backend implementation task, to be chosen feature by feature.
