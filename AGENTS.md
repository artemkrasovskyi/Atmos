# Atmos — Agent Instructions

## Project Context

Before planning or implementing changes, read:

- docs/product.md
- docs/architecture.md
- docs/decisions.md
- docs/development-workflow.md

For UI-related work, also read:

- docs/design-reference.md

## Development Workflow

- Follow OpenSpec for feature development.
- Do not implement features without an approved OpenSpec change.
- Specifications and implementation plans are created
  by dedicated planning agents.
- Keep Frontend and Backend specifications separate.
- Do not introduce architectural changes without approval.

## Task Ownership

- Some Backend tasks are implemented manually
  by the project owner for learning purposes.
- Never implement MANUAL tasks unless explicitly requested.
- For MANUAL tasks, provide explanations, guidance,
  code review, and verification when requested.
- Implement only explicitly delegated AI tasks.

## Implementation Rules

- Follow the approved architecture.
- Reuse shared Zod contracts.
- Do not introduce unnecessary abstractions.
- Do not modify unrelated functionality.
- Do not introduce new dependencies without justification.
- Never expose secrets or credentials.

## Verification

- Verify completed work against the approved specification.
- Run relevant builds and tests.
- Report failed checks and incomplete requirements.
- Do not mark tasks completed without verification.

## OpenSpec Workflow

OpenSpec is mandatory for all non-trivial changes.

Before implementation:
1. Read docs/product.md, docs/architecture.md,
   docs/decisions.md and docs/development-workflow.md.
2. Check existing OpenSpec specifications and changes.
3. If no approved change exists, use the installed
   OpenSpec proposal skill to create one.
4. Keep frontend and backend specifications separate.
5. Do not start implementation until the change
   and implementation plan are approved.

During implementation:
- Follow the approved OpenSpec tasks.
- Respect MANUAL and AI task ownership.
- Never implement MANUAL backend tasks without
  explicit permission.

After implementation:
- Verify against the approved specifications.
- Archive the OpenSpec change after approval and verification.
- If the project owner directly instructs archiving, the change may be archived even when verification is incomplete or blocked. Record the verification status accurately; never treat archiving as a PASS result.

Do not bypass OpenSpec for feature development.

## Implementation Context

- Each new OpenSpec change should start in a fresh implementation session.
- The agent must reconstruct project context from AGENTS.md,
  docs/, approved OpenSpec artifacts, and the current codebase.
- Do not rely on decisions from previous agent conversations
  unless they are documented in the repository.
- Continue within the same session for related tasks when practical.
- Implementation verification must be performed independently,
  without relying on the Implementer's conversation history.
