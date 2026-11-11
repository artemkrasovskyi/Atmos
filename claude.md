# Atmos — Claude Code Instructions

Read and follow @AGENTS.md.

## OpenSpec

Use the project's OpenSpec workflow for planning,
implementation, verification, and archiving.

Do not create or modify implementation specifications
unless explicitly working in the designated
specification/planning role.

## Task Ownership

Respect MANUAL and AI task assignments defined
in the approved OpenSpec change.

Never implement MANUAL Backend tasks without
explicit permission.

# Atmos — Claude Code

Read and follow @AGENTS.md.

Use the installed OpenSpec skills for all
non-trivial feature changes.

Automatically select the appropriate OpenSpec
workflow based on the user's request.

Do not implement anything before the OpenSpec
change and plan are approved.

## Implementation Context

- Each new OpenSpec change should start in a fresh implementation session.
- The agent must reconstruct project context from AGENTS.md,
  docs/, approved OpenSpec artifacts, and the current codebase.
- Do not rely on decisions from previous agent conversations
  unless they are documented in the repository.
- Continue within the same session for related tasks when practical.
- Implementation verification must be performed independently,
  without relying on the Implementer's conversation history.
