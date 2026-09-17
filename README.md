# LifeSathi

"Everything important in life, in one place." Personal life-management app —
proactive reminders, expenses, documents, emergency response, tasks, and an
AI assistant in one platform.

## Structure: monorepo

```
LifeSathi/
├── mobile/    React Native app
├── backend/   Spring Boot REST API
└── docs/      (reserved — architecture notes, ADRs, etc. as they come up)
```

**Why one repo instead of two:** this is a single small team (effectively
one AI-assisted developer at this stage) shipping one product where the
frontend and backend evolve together — a new field on `expenses` almost
always touches both the migration and the RN screen in the same change.
A monorepo keeps that change atomic (one commit, one PR) and keeps API
contract drift visible immediately instead of across two repos with their
own version histories to reconcile. The usual argument *for* separate repos
— independent teams needing independent release cadences and access
control — doesn't apply yet. If the project grows a separate mobile team
and backend team later, splitting is a mechanical `git subtree split`, not
a redesign.

## Where things stand (Phase 1, in progress)

- **`mobile/`** — Expo Router app with real Clerk auth (sign-in, sign-up,
  password reset, Google SSO), a 5-tab shell (Home/Tasks/Reminders/
  Expenses/Profile) with full CRUD against the backend, task due dates, FCM
  push notification registration, and now a Profile tab (edit name/language/
  monthly budget, sign out — including unregistering the device's push
  token). `npm install` and `npx tsc --noEmit` both pass cleanly — see
  `mobile/README.md` for what that does and doesn't prove, and for a
  workflow change worth knowing about (native Firebase code means Expo Go
  alone isn't enough anymore — a dev client build is needed to actually
  test push on a device).
- **`backend/`** — Spring Boot skeleton with Clerk JWT verification, full
  CRUD for tasks/reminders/expenses, a scheduler that turns due reminders
  into real push notifications via Firebase Admin SDK, and now a profile
  update endpoint (`PUT /api/me`). Neon Postgres schema live for all Phase 1
  tables. See `backend/README.md`.
- **Phase 1 module status**: every module has code now except phone-OTP
  sign-in specifically (email/password and Google are both wired) — that
  needs an SMS provider configured in a live Clerk dashboard before there's
  anything to build against, same category of blocker as the rest of Clerk.
  Sign-out was a real gap until this pass: there was previously no way to
  leave the app once signed in.
- **Deployment**: a `Dockerfile` exists for Render (no native Java runtime
  in Render's deploy tooling, so Docker is the path). Two Render deploy
  attempts happened mid-project and are documented in the commit history
  for reference, but deploying is being handled by the project owner
  directly rather than through this session from here on.
- **Not done yet**: phone OTP sign-in (blocked on a live Clerk dashboard),
  and everything in Phase 2+. Following the phase-order rule rather than
  building ahead.

## Tech stack

React Native · Spring Boot · PostgreSQL (Neon) · Clerk · Ollama (self-hosted
AI, Phase 2+) · OpenStreetMap · Firebase Cloud Messaging · Render. All
free-tier / open-source; MIT/Apache-2.0/BSD dependencies only.
