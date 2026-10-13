# AI Productivity App

**Status:** Quick Start browser prototype available; full MVP and production architecture pending.\
**Document version:** 1.0 (2026-10-12)

An AI-supported personal execution and accountability system combining seasonal goals, a unified multi-calendar view, approval-first scheduling, focused execution, and progress against one's previous performance.

## Repository

[ofasseeh94/productivity-tool](https://github.com/ofasseeh94/productivity-tool) is the public project repository. This folder is its local checkout, with the documentation baseline on the main branch.

## Start here

Read [the master project guide](docs/PROJECT_GUIDE.md). It is the canonical reference for the product concept, confirmed decisions, workflows, scope, delivery process and outstanding questions.

## Run the first unit

Requires Node.js 22 or later. No dependency installation is needed.

~~~sh
npm run dev
~~~

Open http://127.0.0.1:5173. Run validation with npm test.

Quick Start captures an ambition, outcome, horizon, weekly capacity, milestone, and first task. Review before saving; drafts and goals persist in this browser. Task completion is separate from goal completion. Export goals as JSON for a backup.

This is a local prototype with guided manual planning, not AI refinement or account-backed storage. Browser data is specific to this origin and device and can be lost when browser data is cleared. Calendar integration and cross-device sync are future units. The preview name Momentum is provisional.

## Tracking

- [Decision register](docs/DECISIONS.md): decisions, rationale and status.
- [Delivery roadmap](docs/ROADMAP.md): phases, deliverables and exit criteria.
- [Change log](CHANGELOG.md): changes to specifications and software.
- GitHub Issues: one issue for each actionable unit of work; PRs reference issue numbers and documentation updates.

## Working agreement

No architecture or tech stack is approved yet. No calendar or email access is assumed. Proposed calendar edits always require explicit user approval. Product requirements are distinguished from implementation suggestions in the guide.

## Planning Inbox

Select Planning Inbox in the local preview to capture standalone or goal-linked tasks, edit estimates, and complete or reopen actions. Quick Start first actions appear in the same list. Export all data includes inbox tasks and goals. See [unit specification](docs/PLANNING_INBOX.md).

## Focus sessions

Use Focus beside Quick Start and Planning Inbox, or a task's Focus button. Start, pause/resume, end, and log completed/partial/stopped attempts with a resumption note. Session history persists locally and is included in the inbox's full-data export. See [unit specification](docs/FOCUS_SESSIONS.md).

## Progress and Review

Select Progress to review logged sessions over 7 or 28 calendar days, compare timer time with the preceding period, inspect current task status, explicitly mark milestones, and save reflections. See [unit specification](docs/PROGRESS_REVIEW.md).

## Today and Daily Planning

Use Today to select up to three priorities, state available time, prepare tomorrow, open Focus, and save a daily reflection. Existing tasks stay synchronized. No calendar scheduling occurs. See [unit specification](docs/DAILY_PLANNING.md).

## Goal Management

Use Goals to edit saved definitions, confirm or reopen goal outcomes, inspect previous definitions, and capture linked tasks. Drafts require an explicit save. See [unit specification](docs/GOAL_MANAGEMENT.md).
