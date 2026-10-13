# Fifth unit: Today and Daily Planning

Implemented 2026-10-13, extending PROJECT_GUIDE sections 7.3 and 7.4. This is a manual daily-planning slice with existing branding retained.

## Behavior

Select Today or Prepare tomorrow. Choose up to three distinct existing actions, an optional available-minute budget, and a planning note. Drafts persist independently from saved plans. Save plan explicitly applies priority changes. A plan with zero priorities is supported for a lighter day.

Known task estimates cannot exceed the stated available minutes. Unknown estimates are counted and labeled; passing validation does not prove sufficient capacity. No provider calendar availability is checked, and no calendar event is created.

Saved priorities retain task IDs and title/estimate snapshots. Current task titles and status stay synchronized with Inbox and Quick Start, while historical plan estimates remain the values saved at planning time. Today's tasks can be completed/reopened or opened in Focus. An active-session shortcut opens the current attempt instead of starting another.

The daily summary shows saved priorities, their current completion status, and logged focus attempts ended today. It is a factual summary, not an AI briefing or evidence of focus quality.

## Recovery and reflection

Earlier saved priorities whose tasks remain open are deduplicated by task and offered for review in Inbox. They are not copied into a later plan. Users may select them explicitly or leave them open. Plans remain keyed to browser-local calendar dates; tomorrow's saved plan becomes today's record on that date.

Daily reflection drafts and explicitly saved notes persist by date. Saved plan and reflection history remains available in a details panel. Full-data export includes these records. Editing a saved plan replaces that date's plan; this prototype does not yet retain every plan revision. Select Today again or reload after a date rollover to view the new day.

## Validation and boundaries

Nineteen model tests pass. Daily tests cover local-date rollover, plan snapshot integrity, unknown estimates, distinct priority selection, capacity validation, lighter days, and unfinished-work deduplication without automatic carryover. Browser checks cover over-capacity rejection, draft reload, explicit saving, empty tomorrow, earlier-work review, reflection saving, correct Focus task selection, and task completion persistence.

This unit remains browser-local. Calendar integration, AI evening proposals/morning coaching, scheduling approval transactions, archive/defer actions, account persistence, and production notification delivery remain future work.
