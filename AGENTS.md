# Project working instructions

Read docs/PROJECT_GUIDE.md for product requirements and docs/BACKBONE_STATUS.md for current completion gates before choosing the next building unit.

User priority: the tool must be VERY simple to use. Keep the routine Today → Focus → Save result. Prefer progressive setup and optional detail; do not make supporting screens mandatory daily steps. Update docs/USER_GUIDE.md when user-facing behavior changes.

Branding, colors, typography, and decorative polish are deferred until the backbone is complete. Continue necessary usability, accessibility, responsiveness, and reliability work.

Track verified backbone progress in docs/BACKBONE_STATUS.md. Explicitly notify the user when all completion gates are actually met, before starting the branding/interface-polish pass. The manual browser prototype alone is not the completed backbone.

Preserve existing user data. Run appropriate checks for each change. Use separate sample browser storage for mutation tests. Inspect the current browser state before reloading a user tab; leave active focus sessions untouched.
