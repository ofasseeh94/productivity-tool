# First unit: Quick Start

User approved this first unit on 2026-10-12. Tracking: GitHub issue #1.

## Delivered behavior

1. Capture the original ambition and optional user-defined life area.
2. Define a recognizable outcome, a 1–52 week horizon, and weekly capacity.
3. Specify a milestone and a first controllable action with an estimate.
4. Review and explicitly save the plan before creating the goal and task.
5. Mark the task complete independently of milestone or outcome progress.

Drafts survive reloads and back navigation. Saved goals remain available while another goal is drafted. Browser storage failures produce a visible notice. Saved goals can be exported as JSON. Completing a task does not claim that the goal is complete.

## Implementation boundary

This unit uses HTML, CSS, JavaScript modules, and localStorage without dependencies. Node serves local assets and runs model tests. This choice supports an initial workflow prototype; it does not settle the production framework, database, identity, hosting, or AI provider. No external calendars or account data are accessed. Manual prompts guide refinement; an AI coach is not implemented.

Data is local to the browser, device, and origin. JSON export is a backup, with no import yet. Production accounts, durable storage, editing saved goals, AI refinement, scheduling, and focus sessions require later units. Momentum is a provisional preview name.

## Validation

- Node tests cover missing required values, invalid horizons, task duration versus weekly capacity, and separate task/milestone/outcome semantics.
- Browser journey checked: empty ambition rejection, ambition capture, draft restoration after reload, plan review, explicit save, and task completion retained after reload.
- Static server returns HTTP 200; JavaScript syntax checks pass.

## Next unit candidates

Review the first workflow with actual goals, then define saved-goal editing and the task inbox. Choose account and persistent-data architecture before treating browser storage as production persistence.
