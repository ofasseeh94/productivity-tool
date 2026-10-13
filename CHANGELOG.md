# Changelog

Follow a human-readable change log. Record shipped functionality separately from documentation revisions.

## [Unreleased]

### Documentation
- 2026-10-12: Initial product discovery consolidation: master guide, decision register and phased roadmap.

- 2026-10-12: Published the foundation to the public productivity-tool repository; added work-item, bug-report, and pull-request templates.

### Application
- 2026-10-12: Added the Quick Start browser prototype: ambition-to-plan flow, explicit save, persistent drafts and goals, first-task completion, capacity validation, and JSON export. No live integrations yet.

### Planning Inbox prototype — 2026-10-13
- Added standalone and goal-linked task capture, explicit task editing, completion/reopening, and filters.
- Preserved Quick Start first-action identity and existing browser data; added full-data export.

### Focus sessions prototype — 2026-10-13
- Added task-linked focus setup, timestamp-based timing, pause/resume and interruption records.
- Added reload recovery, explicit session outcomes, resumption notes, self-reported focused time, and persistent history.
- Completed outcomes synchronize task status; partial/stopped records retain effort without completing tasks.

### Progress and Review prototype — 2026-10-13
- Added explicit 7/28-day session summaries, adjacent-period timer comparison, daily effort data, and focused-report coverage.
- Added independent milestone achievement and persistent review drafts/history; preserved previous unit data.

### Today and Daily Planning prototype — 2026-10-13
- Added explicit today/tomorrow plans with up to three priorities, optional capacity checks, and plan drafts.
- Added synchronized task completion, Focus shortcuts, unfinished earlier-priority review without automatic carryover, and dated reflections/history.

### Goal Management prototype — 2026-10-13
- Added saved-goal editing, explicit outcome status, draft recovery/cancel, and previous-definition history.
- Preserved original ambitions and task identities; changed milestone definitions require fresh achievement verification.
- Added linked-task capture handoff and goal status in Progress.

### Backup and Restore — 2026-10-13
- Added full-data export and validated backup inspection with preview counts.
- Added explicit replacement confirmation, pre-restore download, session recovery, and failed-persistence rollback.

### Local accounts and durable storage — 2026-10-13
- Added registration/sign-in/sign-out, explicit migration, isolated per-user SQLite records, revision conflicts, pending-save recovery, and confirmed account deletion.
- Preserved the existing browser-only workspace. Public hosting and cross-device sync remain later.
