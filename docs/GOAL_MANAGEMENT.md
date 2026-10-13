# Sixth unit: Saved-goal management

Implemented 2026-10-13 as the next goal-loop unit. The visual style remains unchanged.

## Behavior

Goals provides a dedicated view of saved definitions, the original ambition, milestone state, and current linked-task counts. Edit outcome, user-defined life area, horizon, weekly effort, milestone, and goal status. Status is Active or Completed, explicitly confirmed by the user. Completing or reopening a goal never completes or reopens its tasks.

Edits are persisted as separate drafts. Reload or goal navigation keeps those drafts available through Edit goal. Save goal changes applies the new definition; Cancel and discard edits removes the draft. A no-change save does not create a revision record.

Changing milestone wording resets the achieved state for fresh verification. This consequence is explained before saving. Previous goal definitions retain milestone achievement and status in the history, with change timestamps. Original ambition, goal identity, creation timestamp, first task, task completion, session snapshots, and daily plan snapshots are preserved.

Add linked task opens Inbox with the selected goal prefilled, preserving any existing capture draft title/estimate. The task still requires explicit capture. Other units display the current goal outcome; Progress also labels explicitly confirmed completion.

## Validation

Twenty-three model tests pass. New tests verify definition history, original ambition and task identity preservation, milestone reset, explicit status changes independent of tasks, invalid edits, and no-change saves. Browser checks verify draft reload, invalid horizon rejection, explicit save and history persistence, milestone reset, cancellation, and the correct linked-task handoff.

## Boundaries

Local browser persistence and exports remain the storage mechanism. Horizons remain planning durations rather than calculated deadlines. Goal revisions are inspectable but not automatically reversible; a user can edit the current definition again. Multiple milestones, archive/delete, AI goal refinement, provider scheduling, and production accounts are future work.
