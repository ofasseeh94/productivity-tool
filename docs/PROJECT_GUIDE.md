# Master Project Guide: AI Productivity App

**Version:** 1.0\
**As of:** 2026-10-12\
**Lifecycle:** Discovery → MVP scoping → UX → Architecture → Delivery → Validation\
**Authority:** This file is the canonical project reference. For individual decision history see `DECISIONS.md`; for work tracking see GitHub Issues and `ROADMAP.md`.

> **Document maintenance:** Keep this guide readable, not an exhaustive transcript. Edit relevant sections after an accepted decision. Document its reason in the decision register. Track implementation changes via PRs and the changelog. Never silently overwrite an earlier decision.

## 1. Product definition

### 1.1 Mission
Help individuals translate meaningful long-range ambitions into realistic, measurable, controllable activities; schedule them around their real commitments; follow through with helpful AI accountability; and understand progress relative to their own historical performance.

### 1.2 Value proposition
A single AI-supported planning and execution experience integrating: (1) goals, (2) a true multi-account unified calendar, (3) tasks and focused time blocks, (4) accountable execution, and (5) evidence-based progress review. The user should not need to operate five disconnected tools or continually rebuild the same plan.

### 1.3 Design principles
1. **Reduce friction:** minimal data entry, quick capture, pre-populated context, one-tap updates, gradual onboarding.
2. **User agency:** AI recommends and explains; all calendar changes require explicit approval.
3. **Realistic capacity:** schedule around *all* authorized calendars, work boundaries, protected time and buffer needs, not just visible gaps.
4. **Process and outcome:** distinguish actions within one's control from aspirational outcomes.
5. **Measure honestly:** elapsed timer time is not evidence of focused work; planned time is not achieved output.
6. **Constructive accountability:** no guilt or punitive streaks; preserve partial progress and learn from meaningful patterns.
7. **Sustainable effort:** do not aim for total calendar occupancy; protect recovery and life priorities.
8. **Trustworthy integrations:** least privilege, permission transparency, revocation, provenance, sync health.
9. **Product breadth, initial narrow validation:** built for a broad audience, tested with one demanding real-world user first.

### 1.4 Success proposition
A new user should be able to capture one ambition and begin the first meaningful action in about ten minutes without filling out an entire life profile. A returning user should quickly find their next commitment, complete or resume it, and see credible progress over time.

## 2. Target users and jobs to be done

**Initial target:** people balancing professional, personal, fitness, learning, or financial goals across multiple calendars and roles. Life categories are user-defined, not prescribed.

**Core jobs:**
- Turn a vague goal into an achievable, measured, time-aware plan.
- See the entire day in one calendar while preserving each provider's data ownership.
- Allocate meaningful goal work into available time without double-booking.
- Capture tasks without immediately deciding where each belongs.
- Stay engaged through focus sessions and recover from interruptions.
- Understand whether today's actions are improving consistency and milestones over weeks and months.

**Not positioning:** a generic chatbot, another to-do list, or a system designed to maximize hours worked.

## 3. Product information hierarchy

`Life Area → Seasonal Goal → Milestone / Habit / Outcome Metric → Task → (optional) Calendar Block → Focus Session → Execution Record → Review Insight`

- **Life area:** user-defined thematic category; can be renamed or archived.
- **Seasonal goal:** chosen horizon (e.g., 6 weeks / 3 months / 6 months), desired outcome, rationale, measures and status.
- **Milestone:** verifiable intermediate deliverable.
- **Habit:** repeated controllable behavior with frequency criteria.
- **Task:** discrete actionable unit; can be linked to a goal or standalone.
- **Calendar block:** approved reservation of time for a task/group; external events retain their owner and calendar source.
- **Focus session:** actual execution attempt; may start scheduled or spontaneously.
- **Execution record:** activity and outcome facts, including partial effort and interruption history.
- **Insight:** derived observation with transparent evidence and user-editable preferences.

## 4. Confirmed product decisions

1. Web-first with persistent accounts/data; native apps are a possible later expansion.
2. Initial product targets broader users, validated through founder usage.
3. Onboarding offers **Quick Start / One Goal** and **Full Life Overview**; completion is progressive, never mandatory upfront.
4. Dynamic life categories and seasonal goals; AI combines SMART and NICE (Near-term, Input-based, Controllable, Energising) framing.
5. Active, proactive AI coach: challenges vague or infeasible goals, follows up on execution, does not punish missed work.
6. Hybrid home dashboard: today's schedule/priorities together with goal progress.
7. Multiple authorized calendars are combined in one chronological view without duplicating events into accounts.
8. Dedicated productivity calendar is the default destination; users may choose another write-authorized calendar.
9. **Approval-first scheduling:** every creation, modification, reschedule or deletion requires clear user approval, including previously approved productivity blocks.
10. Conflict recovery: seek the **best uninterrupted replacement of original duration within the remainder of the current week**, constrained by deadlines and protected time; do not just choose the earliest gap.
11. Hybrid task planning: significant work gets suggested blocks; small actions stay on a task list or can be grouped into an optional block.
12. Evening preparation with a short morning confirmation/briefing; no repeated approval for unchanged events.
13. Active focus coach with **hybrid checkpoints**: gentle routine check-ins and stronger support on reported trouble, without automatically pausing the timer.
14. History tracks planned versus actual effort, execution and milestone outcomes; self-comparison rather than social comparison.

*The full audit trail and remaining questions are in `DECISIONS.md`.*

## 5. Onboarding user journey

### 5.1 Entry point
First screen: “Start where you are. You don't need to organize everything today.” Two paths:
- **Quick Start (recommended):** capture one ambition → clarify time horizon and available capacity → refine goal → approve initial plan → propose first action.
- **Life Overview:** user creates/selects categories, captures aspirations, then prioritizes one active goal and proceeds to a first action.

Both paths save partial progress. Allow account/calendar setup to be deferred; manual availability works initially. Later prompts add details contextually, never as a mandatory form wall.

### 5.2 AI Goal Architect
1. Capture the original aspiration verbatim.
2. Determine goal type: project, habit, performance target, outcome, maintenance.
3. Clarify desired outcome, timeframe, importance and controllability.
4. Suggest a SMART outcome and NICE input commitments; explicitly separate external outcomes from controllable actions.
5. Define milestones, frequency, measures, dependencies, time estimates.
6. Compare estimated hours with actual weekly capacity and other priorities.
7. Challenge infeasible scope; propose smaller scope, longer horizon or lower priority.
8. Ask user to approve/refine the goal definition before task creation and calendar suggestions.

### 5.3 Activation target
New user ends onboarding able to take one real first action without completing the whole profile.

## 6. Unified calendar specification

### 6.1 Multi-source view
- Connect authorized personal, work and shared calendars where provider support exists.
- Merge display and availability, **not** provider event storage; retain stable source identifiers.
- Display all-day, recurring and timed events, including early morning and evening.
- Allow visual filters by calendar but hidden busy events continue to constrain planning.
- Support free/busy-only calendars where full details aren't authorized.
- Show connection state and last reliable synchronization; stale/inaccessible sources reduce confidence in availability recommendations.

### 6.2 Calendar availability semantics
Classify, with user correction, events as fixed, flexible, focus, protected or informational. Respect explicit working hours, sleep/quiet hours, travel, buffers, personal boundaries and provider busy/free flags. An open period during work hours is not automatically free for personal activities.

### 6.3 Default destination
New approved focus blocks go to a **dedicated productivity calendar** by default. If an account/provider cannot support the chosen destination, show the limitation and offer a user-approved alternative. A user can explicitly choose any authorized writable calendar.

### 6.4 Approval transaction
1. AI proposes specific added/moved/deleted events, showing exact day/time/duration/time zone, destination and any other effects.
2. User approves individual changes or a precisely enumerated batch; reject/defer/edit are available.
3. Re-check permissions and up-to-date conflicts before writing.
4. Apply only authorized changes; report actual success/failure per event. If partial batch execution occurs, clearly describe completed versus pending changes.
5. Retain change audit: source event, old/new values, reason, approval reference, operation result and timestamp.
6. Offer reversal via another explicitly approved, revalidated transaction.

**Never:** silently move external meetings, invite participants, send emails, or overwrite non-owned events.

### 6.5 Conflict policy
- Detect overlap between any current busy commitment and flexible/productivity blocks.
- Prefer proposing movement of the flexible block while leaving new fixed meetings unchanged.
- Keep full requested uninterrupted duration; preserve deadlines and protected hours.
- Rank feasible slots during the **remainder of current user-defined calendar week** by focus suitability, available buffers, user preferences, deadline proximity and minimal disruption.
- Show one recommended slot plus a few alternatives with succinct reasons.
- If no valid slot exists, report none; request permission to widen window, split task, or reassess deadline, not silently violate the original instruction.
- For recurring blocks, default to moving only the affected occurrence.
- Pending conflicts remain visible in **Needs Approval**; send time-sensitive alerts only when necessary.

## 7. Tasks, Planning Inbox and daily dashboard

### 7.1 Planning Inbox
Quick-capture natural-language tasks; parse multi-item input into separate proposals. Preserve source and avoid overconfident due dates. Unscheduled work stays in an inbox without pressuring the user to book every minute.

### 7.2 Task-to-calendar policy
- Deep/priority/goal-related work: suggest uninterrupted calendar blocks.
- Small administrative tasks: checklist, or optional grouped administrative time block.
- Grouped tasks retain individual checkboxes, results, estimates and history.
- Any scheduling suggestion is just a proposal until approved.

### 7.3 Daily navigation
Suggested primary tabs: **Today**, **Calendar**, **Goals**, **Progress**; persistent Quick Capture; secondary Planning Inbox, Focus Mode, Pending Approvals and Settings.

**Today screen:** AI briefing; next commitment; two to three meaningful priorities; quick-task checklist; next focus block and start control; at-a-glance seasonal-goal progress; pending decisions. Avoid endless lists and decorative metrics.

### 7.4 Planning rhythm
**Weekly:** suggest allocation of time for active seasonal commitments.\
**Evening:** prepare tomorrow from current calendar, carried-over work, urgency, protected time and realistic capacity; ask approval only for specific schedule modifications.\
**Morning:** short confirmation briefing, orientation, newly emerged exceptions, optional readiness check; unchanged decisions are not reapproved.\
**During day:** log activity and present conflict/recovery options.\
**Evening review:** concise execution summary, task triage and optional reflection; feed into next proposals.

Unfinished work is *not* automatically copied indefinitely. AI asks whether to resume, re-estimate, simplify, defer, remove, or propose a slot. Preserve original commitment and effort history.

## 8. Focus and accountability engine

### 8.1 Pre-session
One-tap start from linked calendar block; optional ad hoc “Focus now”. Load task, goal, planned minutes and user-approved intended outcome. Allow optional objective refinement and duration adjustment without forcing redundant fields.

### 8.2 Active coaching policy — confirmed
- Routine engagement prompts are gentle, dismissible and non-blocking. Timer continues unless user pauses.
- More prominent supportive intervention is warranted when user **reports** distraction, blockage or interruption, or opts into extra help; do not infer distraction merely from an ignored prompt.
- For repeated reported difficulties, offer small next-step breakdowns, a five-minute restart, pause or recovery action. Do not escalate into coercive interruptions.
- Allow user to snooze/disable prompts and reduce frequency during flow states.
- Starting candidate checkpoint rhythm: midpoint of 25-minute sessions; two lightweight checks across 60 minutes. Validate experimentally, not as an evidence-proven standard.

### 8.3 Session states
Prepared → Running ↔ Paused → Completed / Partially completed / Stopped. Track actual timestamps, pause reasons if known, interruption observations and one optional resumption note (“Where did you stop?”). A paused session and an ended partial session are different states.

### 8.4 Completion capture
One short check: session outcome (completed / partial / not completed), focus-quality category (optional), any remaining work and resumption note. Keep subtasks completed, focus attempts and interruptions even when the overall task remains open.

### 8.5 Measurement integrity
Store: scheduled duration, wall-clock elapsed, paused, unpaused, **user-confirmed focused time if available**, task result and milestone changes separately. Never label unpaused time as verified concentration.

## 9. Progress and analytics

Measure separately:
1. **Inputs:** planned sessions and controllable actions performed.
2. **Execution:** completion, reschedule/interruptions, task recovery and schedule reliability.
3. **Outputs/milestones:** actual deliverables and goal-specific measures.
4. **Outcomes:** longer-term effects, including uncertain or externally influenced results.
5. **Personal evolution:** recent rolling periods versus relevant earlier baselines; show numerator, denominator and period.

Represent progress as charts of actual vs target and clearly stated interpretations. A 42% time-to-plan ratio is **not** 42% goal completion. Support qualitative measures with explicit subjectivity. Rest and sustainability are not categorized as failures.

## 10. AI coach contract

**Allowed without approval:** interpret user-authorized data; assemble candidate plans; find conflicts; estimate effort with uncertainty; offer coaching; write non-calendar internal progress records when user directly logs work.\
**Requires explicit approval:** create/change/delete any calendar event; change task or goal commitments that materially affect the plan; publish external commitments; send or modify external communications.\
**Never silently:** treat inferred behavior as confirmed preference; expose private work events to another calendar; claim a connector is synchronized when it is not; claim timer duration proves effort; assign blame from isolated misses.

The coach should distinguish facts, estimates and suggestions, briefly explain recommendations, avoid excessive questions and respect notification limits/quiet hours. User can inspect, correct, or reject inferred preferences.

## 11. External integrations and privacy

Calendar and email scopes are separate and optional. Consent is provider-based, permission-specific and revocable. Minimize stored copies of external private data, keep source metadata where needed for syncing, and avoid forwarding sensitive descriptions into another calendar. Email-derived tasks are **suggestions** until accepted. Enable export/deletion and audit changes. The implementation must later specify encryption, authentication, provider token custody, retention, backups, incident handling and permission models.

## 12. Initial MVP proposal (not yet formally approved)

MVP should demonstrate the complete: **Goal → Plan → Calendar → Focus → Log → Review → Adapt** loop.

**Candidate MVP:** accounts and persistent data; one-goal quick onboarding plus optional life areas; AI goal refinement and milestones; multi-calendar unified view for selected initial provider(s); planning inbox and hybrid tasks; explicit approval transactions; daily briefing and planning; focus timer/check-ins/interruption preservation; basic personal progress graph; weekly review.

**Likely later:** full email task extraction, wider calendar provider support, native mobile apps, device-level distraction blocking, elaborate analytics, commercial pricing and team features.

**Scope warning:** exact providers, notification delivery and web background-timer behavior must be validated during technical feasibility work; never promise native-level control from an ordinary browser.

## 13. Quality and acceptance scenarios

These are proposed end-to-end tests before calling the first release usable:

- **Onboarding:** a new user creates a concrete goal and executes a first action without mandatory comprehensive setup.
- **Unified calendar:** events from two authorized sources appear in one view with no duplicates; busy time still constrains availability when its calendar is visually hidden.
- **Scheduling:** all writes use approval, recheck availability and show trustworthy results; denied/deferred changes leave calendars untouched.
- **Conflict:** a meeting collides with a 60-minute focus event; AI finds best feasible uninterrupted replacement in current week, respects deadline/protected time, preserves original until confirmed.
- **Hybrid tasks:** three small tasks are grouped into one block but retain independent completion and history.
- **Focus:** partial session after interruption retains actual time, completed subtasks and resumption note; no false focused-time claim.
- **Progress:** charts separate planned effort, logged effort, milestone completion and outcomes; user can compare reasonable periods.
- **Reliability:** disconnected/stale calendar source triggers an explicit limitation rather than false availability assurance.
- **Recovery:** unfinished work is triaged rather than silently piled into tomorrow.

## 14. Product success measures (hypotheses to validate)

- Time from sign-up to first actionable plan and first session.
- Share of users who successfully connect a calendar (among users who choose to).
- Median interactions/taps to capture a task, start focus, log outcome, approve schedule.
- Weekly returning users who actually execute planned work (not just open dashboards).
- Proportion of planning suggestions approved/edited/rejected and why.
- Focus check-in usefulness and interruption burden.
- Frequency of duplicate/conflicting/erroneous events (target near zero).
- Accuracy and clarity of planned-versus-actual time presentation.
- User-rated usefulness and sustainability after several weeks.

These are **measurement proposals**, not achieved product metrics or fixed pass thresholds.

## 15. Delivery governance

### 15.1 Source of truth
- `docs/PROJECT_GUIDE.md`: current product requirements and behavior.
- `docs/DECISIONS.md`: accepted and superseded decisions with dates/rationale.
- `docs/ROADMAP.md`: stages, priorities, dependencies, acceptance gates.
- GitHub Issues: actionable features, bugs, questions and tasks; an issue has owner, acceptance criteria and status.
- Pull Requests: describe implementation, tests, requirements affected, linked issue and documentation changes.
- `CHANGELOG.md`: human-facing changes by release/version; not a copy of every commit.

### 15.2 Work loop
**Discover → Decide → Specify → Create issue → Design/build → Test → Review → Merge → Update guide/decision log/changelog → Close issue.**

### 15.3 Change request template
- Background/problem
- Proposed behavior and user impact
- Affected requirements/screens/integrations
- Alternatives considered
- Privacy/permission implications
- Acceptance criteria
- Decision and date
- GitHub issue / PR reference

### 15.4 Status taxonomy
`Proposed` / `Agreed` / `In design` / `In development` / `In validation` / `Released` / `Superseded`.

A discussion decision can be **Agreed** without being **Implemented**. Do not conflate the two.

## 16. Open questions and explicit non-decisions

**Before implementation:** repository name/ownership; public/private repository status; initial calendar providers; whether dedicated productivity calendar is app-hosted or provider-backed; supported device/browser matrix; checkpoint notification channel and web limitations; timezone/week-start policy; specific goal progress formulas; data retention/hosting; AI model, costs and consent boundaries; onboarding research; MVP size and release sequencing; accessibility and localization expectations.

**Not yet decided:** application framework, database, hosting, authentication, AI provider, calendar API implementation, revenue strategy or release date.

## 17. Next steps

1. Confirm/create GitHub repository and commit this documentation baseline.
2. Review and formally freeze MVP scope for first user-test release.
3. Map core screens and interaction states in a UX flow.
4. Create GitHub issues from defined user journeys and acceptance tests.
5. Evaluate calendar/provider, timer/notification and security constraints.
6. Choose architecture only after these constraints and MVP boundaries are explicit.
7. Build thin end-to-end prototype; validate daily workflow before adding breadth.

## 18. References and provenance

This guide synthesizes product discovery conversations through 2026-10-12 and ideas inspired by Ali Abdaal's *Feel-Good Productivity*, including SMART/NICE combination and sustainable productivity. The uploaded PDF was a Bookey summary, not the complete original text. The guide is a product specification based on our discussion, not a source of scientific evidence for particular checkpoint intervals or claims about product effectiveness.
