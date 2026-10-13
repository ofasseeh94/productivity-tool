# Fourth unit: Progress and Review

Implemented 2026-10-13 as the first feedback slice from PROJECT_GUIDE section 9. The existing visual style remains provisional.

## Periods and measurements

Choose 7 or 28 calendar days, including today, in the browser's local timezone. Dates are displayed explicitly; comparisons use the immediately preceding window of equal calendar-day length. Sessions belong to the day they ended, including attempts crossing midnight. Active and unlogged attempts are excluded until their results are saved.

The summary counts completed, partial, and stopped attempts and separates intended session duration, unpaused timer time, paused time, and self-reported focused minutes. Missing focused reports remain unknown rather than zero. Report coverage shows the number of attempts supplying a focused-time value. No percentage change is inferred from an empty previous period. A daily table shows attempts and planned/unpaused minutes.

Completed attempts are not unique completed tasks. Current task counts, including Quick Start first actions and goal-linked inbox tasks, are labeled as snapshots across all dates. No historical completion timestamps exist in earlier units, so this view does not invent period-based task-completion counts. Goal outcomes and completion percentages are not derived from timer time or task counts.

## Milestones and reflection

Users explicitly mark their first milestone achieved or reopen it. This persists independently of task status and stores an update timestamp; marking a milestone does not complete linked tasks or the overall goal.

Review notes are saved against the exact rolling date window and length. Drafts persist on input. Saved reviews remain in the history when the current date or selected window changes. Full-data export includes reviews, drafts, and milestone status. Reflection is manual and does not automatically change commitments or schedule work.

## Validation and boundaries

Fifteen model tests pass, including date boundaries, adjacent periods, inclusion/exclusion of session outcomes, missing versus explicitly zero focused reports, independent milestones, and daily-to-period reconciliation. Browser checks verify existing sample session totals, draft reload, saved review history across period changes, and milestone persistence independently of task status.

This remains browser-local. Provider calendars, account persistence, AI review insights, customizable outcome measures, historical task-completion events, goal editing, and richer visual charts are future work. Saved drafts remain associated with their original date window; saved reviews are available in history.
