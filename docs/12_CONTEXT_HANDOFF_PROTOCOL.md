# 12_CONTEXT_HANDOFF_PROTOCOL.md

**Status:** 🟢 Defined
**Version:** 1.0 (Genesis)

## Objective
Ensure zero context loss when switching between humans or AI agents.

## Step-by-Step Handoff Process
1. **READ FIRST:** Always read `11_PROGRESS_STATE_KERNEL.md` to understand current status.
2. **CHECK LOGS:** Review `13_EXECUTION_LOG_AUDIT.md` for recent decisions/errors.
3. **UPDATE STATE:** Before stopping, update `11_PROGRESS_STATE_KERNEL.md`:
   - Change status of completed tasks to ✅.
   - Add new "Next Actions".
   - Note any blockers.
4. **LOG ACTION:** Append a summary of your work to `13_EXECUTION_LOG_AUDIT.md`.
5. **COMMIT:** Push changes to Git with message: `chore: update state kernel - [Your Name/Agent]`.

## Rules
- NEVER work on a module marked "Blocked" without resolving the blocker first.
- ALWAYS verify the "Immediate Next Steps" before starting new work.
