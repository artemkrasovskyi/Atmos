# Proposal

## Why

Atmos has approved architecture documentation and a partial pnpm/Turborepo skeleton, but no runnable applications. A small, verifiable local foundation is needed before product features can be developed.

## What Changes

- Extend the existing pnpm/Turbo workspace with React, TypeScript, Vite, and TanStack Router serving a minimal technical root route.
- Add a Node.js/NestJS runtime with validated foundation configuration and `GET /api/health`.
- Establish `packages/contracts` with a shared runtime Zod health schema and corresponding TypeScript type.
- Provide Docker Compose for web, API, PostgreSQL, and Redis, plus documented local development and build verification.
- Keep Weather, Auth, Prisma models/migrations, product UI, additional endpoints, and cloud deployment outside this change. General error contracts and global exception-filter behavior are deferred to the relevant API feature change.

## Capabilities

### New Capabilities

- `frontend-runtime`: Technical application root route and browser build compatibility.
- `backend-runtime`: Validated API startup and health response.
- `api-contracts`: Shared executable health contract across browser and server.
- `local-development`: Workspace build/development workflows and four-service local environment.

### Modified Capabilities

None; no canonical specifications exist.

## Impact

Future implementation will affect root workspace configuration, `apps/web`, `apps/api`, `packages/contracts`, container definitions, environment examples, and development documentation. It will reuse the approved stack and existing package-manager configuration.

The requirements, design, and implementation plan for this Foundation change were approved on 2026-10-23. All Foundation implementation tasks are assigned to AI, including NestJS Bootstrap; manually owned Backend work begins with the future Weather API change. The approved `GET /api/health` contract is process liveness independent of PostgreSQL and Redis, and the NestJS compiler choice for Foundation is `tsc`.

On 2026-10-27 the project owner directed a revision of the Foundation verification requirements to remove mandatory checks in a real running environment and approved the resulting Draft v2 requirements and plan. This does not change the implementation scope or the 2026-10-23 architecture decisions. The owner then directly instructed synchronization and archiving; historical verification results remain unchanged.
