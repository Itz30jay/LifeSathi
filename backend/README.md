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
- **`/api/me`**: the only business endpoint so far — proves the auth chain
  works and just-in-time-provisions a `users` row. Tasks/reminders/expenses
  endpoints come next, per phase order.

## Note on verification

This was written and checked against Spring Boot 4.1 / Spring Security 7.1
docs (via Context7) rather than assumed from memory, since this is a newer
major version than commonly-cached training knowledge. It has **not** been
compiled in this environment — the sandbox used to build it has no route to
Maven Central, only to a small allowlist of package registries. Run
`mvn compile` and `mvn test` locally as the first real check.
