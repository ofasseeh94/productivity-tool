# Project Roadmap

**Status:** proposed delivery stages, pending scope and architecture decisions. This is not a delivery promise or timeline.

| Phase | Goal | Core deliverable | Exit criterion | Status |
|---|---|---|---|---|
| 0. Discovery | Establish concept and product rules | Master guide + decisions | Major journeys aligned | Consolidated |
| 1. MVP scope | Specify first real user test | Prioritized scope and acceptance tests | Scope approved | Not started |
| 2. UX | Translate flows into screens/states | Onboarding, Today, Calendar, Focus, Progress prototypes | Core journeys reviewed | Not started |
| 3. Architecture | Resolve feasibility and nonfunctional design | Provider/API, data, AI, privacy, auth architecture | Technical decisions reviewed | Not started |
| 4. Foundation | Persistent multi-user application | Identity, data model, permissions and settings | Core data integrity tested | Not started |
| 5. Goal loop | Goal → tasks → planning | Goal Architect, milestones, Inbox | Complete first-goal journey | Not started |
| 6. Calendar loop | Unified view + approval-first changes | Calendar sync, availability, approval transaction | No unapproved writes in tests | Not started |
| 7. Execution loop | Focus and accountability | Timer, checks, interruptions, results | Accurate records and recovery | Not started |
| 8. Feedback loop | Learn from actual behavior | Dashboard, reviews, self-comparison | Useful and accurate trend views | Not started |
| 9. Pilot | Test with real workflows | Bug fixes, reliability, UX feedback | Pilot acceptance tests met | Not started |

## Work-tracking convention

- One GitHub issue per meaningful task or behavior, with clear acceptance criteria.
- Labels suggested: `type:feature`, `type:bug`, `type:docs`, `type:research`, `area:goals`, `area:calendar`, `area:focus`, `area:ai`, `area:dashboard`, `area:privacy`, `priority:p0`, `priority:p1`, `priority:p2`.
- Project stages correspond to GitHub Milestones or Projects once configured.
- Every implementation PR references an issue, lists tested scenarios, and notes whether `PROJECT_GUIDE.md`, `DECISIONS.md` or `CHANGELOG.md` needs updating.

## First backlog candidates

1. Define MVP acceptance tests and selected initial calendar providers.
2. Prototype progressive onboarding and first goal creation.
3. Define unified calendar event ownership, visibility and busy semantics.
4. Prototype review/approve/revalidate scheduling transaction.
5. Prototype evening plan and morning briefing.
6. Prototype planning inbox and grouped microtasks.
7. Prototype focus flow and hybrid check-ins.
8. Define progress calculations and transparent chart labels.
9. Write privacy/consent requirements for calendar and later email integrations.
10. Conduct early usability sessions and record findings.

## First delivered slice

2026-10-12: Quick Start browser prototype implemented for issue #1. See [unit specification](QUICK_START.md) for behavior, validation, and limitations. This partial goal-loop slice does not complete the full MVP or persistent multi-user foundation.

2026-10-13: Planning Inbox prototype added: manual capture, optional goal links and estimates, editing, completion, filters, first-action synchronization, and complete browser-data export. See [unit specification](PLANNING_INBOX.md).

2026-10-13: Task-linked focus-session prototype added, including pause/resume, reload recovery, explicit outcome capture, resumption notes, and execution history. See [unit specification](FOCUS_SESSIONS.md). AI coaching and checkpoint delivery remain future work.

2026-10-13: Progress and Review prototype added: session summaries, preceding-period timer comparison, daily effort table, current task snapshots, manual milestone achievement, and persistent reflections. See [unit specification](PROGRESS_REVIEW.md).

2026-10-13: Today and Daily Planning prototype added: explicit priority plans, stated capacity, tomorrow preparation, earlier-work review, Focus shortcuts, and dated reflections. See [unit specification](DAILY_PLANNING.md).

2026-10-13: Saved-goal management added with explicit edits/status, draft recovery, original-ambition preservation, definition history, and linked-task handoff. See [unit specification](GOAL_MANAGEMENT.md).

2026-10-13: Full-data Backup and Restore added, including structure validation, preview, explicit replacement, pre-restore backup, and unfinished-session protection. See [unit specification](BACKUP_RESTORE.md).

## Current completion checkpoint

The manual browser workflow is implemented; the full backbone is incomplete. Use [BACKBONE_STATUS.md](BACKBONE_STATUS.md) for the remaining completion gates and the user's simplicity/branding instructions. The phase table above describes full phase deliverables; prototype slices do not complete those phases.
