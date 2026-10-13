# Second unit: Planning Inbox

Implemented 2026-10-13, following the request to build the next unit. This extends the Quick Start prototype and PROJECT_GUIDE section 7.1.

## Behavior

- Capture one action with an optional minute estimate and optional existing goal link.
- Standalone actions do not need a goal, estimate, date, or calendar block.
- Edit titles, estimates, and goal links; save changes explicitly or cancel.
- Complete and reopen actions; filter Open, Completed, or All tasks.
- Show Quick Start first actions through their existing goal records. Their edits and completion remain synchronized with Quick Start. Their goal association is fixed.
- Persist new capture drafts and saved tasks across reloads, keeping existing Quick Start goals intact.
- Export all browser data, including goals, inbox tasks, and drafts, as JSON.

One task is captured per submission. No automatic due-date inference, scheduling, or goal completion occurs. A task estimate is not a weekly scheduling commitment.

## Data compatibility

The existing browser storage key and version remain unchanged. The payload adds tasks, taskDraft, and view fields with defaults for older records. Goal first actions remain in their original goal.task objects; no migration copies or duplicates them. Inbox task IDs are UUIDs, and first-action display IDs use a separate prefix.

## Validation

Seven model tests pass, covering existing goal validation, optional estimates, invalid task values, missing goal references, first-action identity and persistence, and independent goal-linked task completion. Browser checks verify empty task rejection, capture draft restoration, task creation, title/estimate edits, completed filtering, and reload persistence. Existing Quick Start goals and first actions display in the inbox.

## Boundaries

Browser-local prototype: no accounts or sync, natural-language task splitting, calendar integration, delete/archive, or import. In-progress task edits are only applied on Save changes; reload or navigation discards unsaved edits while preserving the separate capture draft. Completing actions does not mark milestones or goals complete.
