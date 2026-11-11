# Frontend Runtime

## Purpose

Provide a runnable technical browser entry point before Atmos product screens are implemented.

## Metadata

- Status: Approved; Source change: `initialize-atmos-foundation`; Approved: 2026-10-27.

## Requirements

### Requirement: IAF-FE-REQ-001 — Technical root route
Status: Active. When the frontend is served in development or from its production build, `/` SHALL resolve through TanStack Router and render a minimal Atmos identifier without an uncaught application error.
Source: current foundation request; docs/architecture.md, Chosen technology.

#### Scenario: IAF-FE-AC-001 — Verify root routing without a served browser
Covers: IAF-FE-REQ-001.
- **WHEN** the root route is rendered in an isolated router test and the development and production frontend builds are checked
- **THEN** `/` resolves through TanStack Router, renders the Atmos identifier without an uncaught error, and both builds complete with the route included.

### Requirement: IAF-FE-REQ-002 — Technical shell has no product dependencies
Status: Active. The technical root SHALL render without feature credentials, fabricated weather data, or unfinished product controls.
Source: current foundation request; docs/product.md, Vision and scope.

#### Scenario: IAF-FE-AC-002 — Load without feature integrations
Covers: IAF-FE-REQ-002.
- **WHEN** the root loads without map, weather, or authentication configuration
- **THEN** it renders successfully without calling those providers or showing product controls or sample weather.

### Requirement: IAF-FE-REQ-003 — Browser-compatible health contract
Status: Active. The frontend SHALL be able to import and execute the shared health schema in browser-targeted development and build verification without server-only runtime dependencies.
Source: docs/architecture.md, API and contracts; Verification expectations.

#### Scenario: IAF-FE-AC-003 — Verify shared schema in browser target
Covers: IAF-FE-REQ-003.
- **WHEN** browser-targeted verification parses valid and invalid health payloads using the shared package
- **THEN** valid health is accepted and malformed health is rejected
- **AND** both development and production builds resolve the shared export.
