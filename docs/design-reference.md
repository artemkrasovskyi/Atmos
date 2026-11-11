# Atmos — Design Reference

**Status:** Design direction selected. The actual Figma URL is not included here; insert it once available. Do not fabricate it.

## Source of truth

Figma is the primary source for the visual implementation of screens that have approved mockups. Provide agents read-only access when implementation starts. Changes to visuals not covered by Figma should be explicitly reviewed for consequential deviations, not invented as if approved. No automatic editing of Figma.

- **Figma file URL: https://www.figma.com/design/i0FXJtXZgBgX5KnSEUbeR4/Untitled?node-id=3-271&p=f&t=4xEHyWSvjQD7fvXX-0**
- **Agent access:** TODO — configure read-only Figma integration and verify accessible frames at coding time.
- **Existing approved direction:** desktop Overview with expanded/collapsed sidebar, Light Map Focus variant 2. User intentionally stopped further polish to begin implementation.
- **Historical Analytics:** broad concept approved (four small KPI cards, up to four charts in a 2×2 grid), but exact widget values and full final frame details remain open.

## Overview layout

- Left collapsible navigation with Overview, Historical Analytics, favorites, bottom profile/settings access.
- Compact top header.
- Large center Mapbox map. Search and map controls overlaid over map. The Figma map background is a **placeholder**; replace it with live Mapbox tiles at runtime.
- Seven day forecast cards directly below map.
- Right-side persistent stack: Current Weather, Hourly Forecast, Selected Day Details.
- Responsive priority: desktop first; full mobile layout beyond MVP.

## Styling principles

Minimal charcoal/navy dark visual treatment, soft blue highlights, readable dense data, airy spacing, limited decoration. Weather illustrations soft, semi-3D/slightly cartoon-like. UI primitives use Tailwind CSS + shadcn/ui, historical charts use Recharts shadcn chart wrappers, map uses Mapbox GL JS.

## Interaction rules

- New city applies only on successful weather load; old city and data remain visible in flight and on failure.
- Selected forecast day updates hourly/details panels; current conditions do not change to historic/day selection.
- Guest can view all weather/analytics; favorite actions prompt login. No add-favorite button on sidebar: icon adjacent to active location name.
- Navigating to Overview recenters map. Arbitrary map clicks don't select cities.
- Auth and preferences are modals, not standalone pages.
- Skeleton/local loading/error/retry/empty and stale-data indication must be designed with the feature, including accessibility and clear timestamp for stale conditions.

## Handoff context for future design work

The separate specification/design agent should locate the exact approved Figma frames when working on a UI feature and flag missing/ambiguous states. Do not treat generated concept images as more authoritative than actual approved Figma. Web/API code must not use placeholder weather values for production behavior.
