# Third unit: Focus sessions and execution records

Implemented 2026-10-13. Extends PROJECT_GUIDE section 8 with the first execution slice. Existing branding and visual style retained per user preference.

## Behavior

Start from an open task in Planning Inbox or choose it in Focus. Set 1–240 minutes for the session independently of its task estimate. Only one active attempt can exist in this browser state.

Running sessions can pause/resume, with optional pause reasons. End and review freezes elapsed time, then explicitly log Task completed, Partially completed, or Stopped. Partial and stopped outcomes leave task status unchanged; completed marks its original task record done, including Quick Start first actions. Optional resumption notes and self-reported focused minutes are retained. The outcome defaults to partial.

History preserves task ID and title at the time of the attempt, timing facts, pauses, outcome, and notes. Later task edits do not rewrite earlier session titles. Full-data export from Planning Inbox includes active attempts, reflection drafts, and history.

## Timing and recovery

Elapsed time uses timestamp differences rather than counting interval callbacks. Switching between app units or backgrounding the tab does not pause a running session. Reaching planned time shows a non-blocking message without auto-completing or auto-pausing.

Closing or reloading the page pauses the attempt; the next visit offers Resume. Page-exit handlers save the last interval when possible. Abrupt closure recovers through the last persisted heartbeat and does not credit the unknown closed interval. Browser throttling can delay display updates and heartbeat saves. No background notification delivery is promised. This is one browser-local prototype, not a synchronized multi-tab or multi-device timer.

Planned minutes, wall-clock elapsed, paused time, and unpaused time are separate. Unpaused timer time is not verified focused work. Focused minutes are optional, explicitly self-reported, and cannot exceed unpaused elapsed time. The timer may continue while attention is elsewhere.

## Validation

Eleven model tests pass. Session tests exercise pause/resume accounting, interruption preservation, reload recovery, partial/stopped outcomes, notes, and rejection of invalid durations or impossible focused-time claims. Browser checks exercise task-linked setup, start, pause, resume, reload recovery, end/review, focused-time validation, partial-result persistence, and explicit task completion in the inbox.

## Next scope

AI coaching/checkpoints, scheduling, progress charts, accounts, durable server storage, session editing, and multi-tab conflict handling remain future work. Visual rebranding is deferred until the functional workflow is validated.
