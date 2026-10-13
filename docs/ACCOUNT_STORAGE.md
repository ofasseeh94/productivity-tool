# Local accounts and durable storage

Implemented 2026-10-13. User chose local-first accounts/storage, with online hosting later.

## Use

Select Account. Create a username/password account. To copy the existing browser workspace into a new account, explicitly check the migration option before Create account. Without that option the account starts empty. Migration copies data; the original browser-only workspace is retained. Signing in loads that account's server records; signing out returns to the separate browser-only workspace.

Records are cached in the browser and saved to the local server automatically. The footer reports saving/saved state. Wait for Saved to account before clearing browser data. If saving fails, export a backup and reload to retry. Pending account-cache changes recover after reload; stale revisions are blocked instead of overwriting another session's work. The current UI remains single-workspace rather than live multi-tab synchronized.

Finish and save an active focus attempt before signing out or switching storage. Backup still exports the current workspace. Account deletion is under a details panel, requires the password and explicit confirmation, and removes owned server records/revisions/sessions. Export first. Other accounts and the original browser-only workspace remain separate.

## Storage and implementation

Requires Node.js 24.15 or later. Start with npm run dev. HTTP serves loopback only, at http://127.0.0.1:5173. The SQLite database defaults to `%LOCALAPPDATA%/ProductivityTool/accounts.sqlite` on Windows, outside the Git/Google Drive checkout. PRODUCTIVITY_DATA_DIR and PRODUCTIVITY_PORT override the local database directory and port. Changing the directory selects a different account database; it does not migrate one.

SQLite uses transactions, full synchronous writes, and WAL. Each account owns a versioned JSON workspace, with the last 20 save revisions retained internally. These revisions include frequent autosaves and are not a substitute for full exported backups or an OS/database backup. Persistent data must not be committed to Git. A backup of the live SQLite database must account for its WAL; use exported workspace backups for normal personal recovery.

Passwords use unique salts and asynchronous scrypt. Random session tokens are stored hashed, expire after seven days, and are revoked on sign-out. Cookies are HttpOnly and SameSite=Strict. All API writes require the matching local origin and JSON content type; authentication attempts are limited. Account ownership is derived from the session rather than supplied user IDs. Revision checks reject stale writes atomically. Incoming workspace data uses full-backup validation.

References: [Node SQLite](https://nodejs.org/api/sqlite.html), [Node 24 crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html). The built-in SQLite interface used here was checked against the installed Node runtime and tested directly.

## Validation

Tests cover password checks, hashed credentials, token expiry/revocation, account isolation, durable restart reads, revision conflicts, retained revisions, owned-record deletion, API authentication/origin checks, and pending-cache recovery. Browser tests on a separate port/database cover registration with explicit sample migration, account-only edits, sign-out preserving guest data, and sign-in restoring saved records. No real user account or migration was performed by the agent.

## Remaining production work

Local accounts are not cloud sync. This server is deliberately restricted to loopback and uses local HTTP. Do not expose it as a public production deployment. Online hosting needs HTTPS, production auth/recovery (including password reset or managed identity), deployment/storage/backups, provider-token custody, and further security/operational validation. Password-reset/email services, cross-device synchronization, and live multi-tab merging are not implemented. The backbone accounts gate remains partially complete.

Password length: 8–128 characters, per user preference. Existing accounts keep their passwords.
