# Seventh unit: Backup and Restore

Implemented 2026-10-13 to protect the browser-local prototype's working records.

## Behavior

Download full backup exports goals, tasks, sessions, plans, reflections, and drafts. Inspect a JSON file or paste its contents. A validated preview shows record counts and the existing records that will be replaced. Restore is replacement, not merge, and requires an explicit checkbox confirmation. Goal-only exports are not accepted; use full-data export from Inbox or Backup.

Before replacement the app offers the current data as a download. Browser download settings can affect saving; retain the downloaded copy. Current unfinished sessions must be ended and logged before restoration. Imported running sessions recover paused; imported review sessions remain awaiting their outcome. Successfully restored data opens Today.

The replacement is saved before rerendering. If browser storage rejects it, previous in-memory state is reinstated and an error is displayed. Full backups remain local, unencrypted JSON files. No uploads, accounts, or calendar changes occur.

## Validation

Limits: 5 MB selected file / five million pasted characters and 10,000 combined goals/tasks. Parser validates supported version, required drafts, goal/task identifiers and references, session history, active sessions, and nested plan/reflection/revision structures. Unsupported top-level fields are discarded. New optional records get empty defaults for older full-data exports.

Twenty-nine model tests pass, including valid legacy/full exports, incompatible and malformed JSON, duplicate IDs, missing references, invalid nested records, reserved keys, and paused recovery. Browser checks verify export, malformed rejection, inspection counts for a real sample backup from previous units, explicit confirmation gating, successful replacement, and restored persistence after reload. Mutation checks use separate sample storage.

## Boundaries

This supports full-data replacement only, with no merge, goal-only import, encryption, or cloud synchronization. Browser downloads are offered rather than verified as a durable external copy. Other open tabs are not synchronized; close duplicate app tabs before restoring. Backups contain personal planning data and should be stored appropriately.
