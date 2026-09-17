# LifeSathi backend

Spring Boot 4.1 REST API. Auth is fully delegated to Clerk — this service
verifies Clerk-issued JWTs, it never stores a password.

## Run locally

1. `cp .env.example .env` and fill in the real values (ask whoever set up
   the Neon project for the DB password; Clerk values come from the Clerk
   Dashboard once a Clerk application exists — see note below).
2. Export the `.env` vars into your shell (or use a plugin like
   `spring-dotenv` / your IDE's env-file support — not added as a dependency
   yet since it's a convenience, not a requirement; flag if you want it).
3. `mvn spring-boot:run`
4. `curl http://localhost:8080/api/health` should return `{"status":"ok",...}`.

## What's actually wired up vs. stubbed

- **Database**: real — points at the Neon Postgres project created via the
  Neon MCP tool this session (`users`, `tasks`, `reminders`, `expenses`,
  `notifications` tables exist).
- **Auth**: the verification side is real (JWKS-based JWT check, issuer +
  azp validation). It has NOT been tested against a real Clerk instance yet
  because no Clerk application has been created in this session — Clerk
  wasn't in the set of MCP tools connected for this conversation. Next step
  once Clerk is connected: create the Clerk app, drop its Frontend API URL
  into `.env`, and hit `/api/me` with a real session token from the mobile
  app to confirm end-to-end.
- **`/api/me`**: proves the auth chain works and just-in-time-provisions a
  `users` row.
- **`/api/tasks`**: full CRUD + `PATCH /{id}/completed`. Priority defaults to
  `MEDIUM` if omitted.
- **`/api/reminders`**: full CRUD + `PATCH /{id}/active` (pause/resume).
  `type=RECURRING` requires `recurrenceInterval`; `type=ONE_TIME` requires it
  be omitted — enforced server-side with a 400, mirroring the DB's
  `recurring_needs_interval` CHECK constraint. Cascading multi-offset
  reminders (45/30/15/7/1-day chains) are Phase 2, not built here.
- **`/api/expenses`**: full CRUD, plus `GET /api/expenses?period=MONTHLY` and
  `GET /api/expenses/summary?period=MONTHLY` (the latter backs the
  dashboard's spend widget — returns total, budget from `users.monthly_budget`,
  and count for the period). `period` is `DAILY` | `WEEKLY` | `MONTHLY`,
  case-sensitive. Period boundaries are computed in `Asia/Kolkata` — see the
  comment in `ExpenseService` for why that's a reasonable fixed default for
  now rather than genuinely per-user timezone logic.
- Every list/update/delete endpoint scopes its query by the authenticated
  user's id, not just the row id — see the comment on `findByIdAndUserId` in
  each repository for why that matters.
- **`/api/device-tokens`**: POST to register a device's FCM token (upsert by
  token, so a device switching accounts moves over rather than duplicating),
  DELETE to unregister on sign-out.
- **`/api/notifications`**: read-only history of what's actually been sent
  to the user (as opposed to what's merely scheduled).
- **Reminder → push notification loop**: `ReminderNotificationScheduler`
  polls once a minute for reminders whose time has arrived, sends a push via
  `PushNotificationService`, records a `Notification` row, and either
  deactivates the reminder (ONE_TIME) or advances it to its next occurrence
  (RECURRING). This is what makes a "reminder" actually remind you, rather
  than just being a to-do list entry with a timestamp.
- **Firebase isn't configured yet** — no Firebase project exists in this
  workspace (no MCP connector for Firebase, same situation as Clerk). Until
  `FIREBASE_SERVICE_ACCOUNT_BASE64` is set, `PushNotificationService` no-ops
  with a log line rather than crashing the app — see `FirebaseConfig`.

## Note on verification

This was written and checked against Spring Boot 4.1 / Spring Security 7.1
docs (via Context7) rather than assumed from memory, since this is a newer
major version than commonly-cached training knowledge. It has **not** been
compiled in this environment — the sandbox used to build it has no route to
Maven Central, only to a small allowlist of package registries. Run
`mvn compile` and `mvn test` locally as the first real check.

Two more version-specific things worth knowing about, found while adding
push notifications:

- **`org.springframework.lang.Nullable` is deprecated** as of Spring
  Framework 7 (which Boot 4.1 uses) in favor of `org.jspecify.annotations.Nullable`
  — the latter is what `FirebaseConfig`/`PushNotificationService` use. No
  extra Maven dependency needed; JSpecify comes in transitively via Spring
  Framework itself.
- **Firebase Admin SDK 9.10.0 deprecated `Message.Builder.setToken()`** in
  favor of Firebase Installation IDs (FIDs) — a distinct concept from the
  registration tokens client SDKs still hand back, and not yet mainstream.
  `PushNotificationService` still uses `setToken()` deliberately (deprecated,
  not removed) with a comment explaining why.
