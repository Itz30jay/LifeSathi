<<<<<<< HEAD
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

- **`mobile/`** — Expo Router app with real Clerk auth (email/password +
  Google SSO) and a 4-tab shell (Home/Tasks/Reminders/Expenses), each tab
  doing full create/read/update/delete against the backend — not just the
  dashboard read-only view from the previous pass. `npm install` and
  `npx tsc --noEmit` both pass cleanly — see `mobile/README.md` for what
  that does and doesn't prove (no live Clerk key or reachable backend to
  actually run it against yet).
- **`backend/`** — Spring Boot skeleton with Clerk JWT verification, and
  full CRUD for tasks, reminders, and expenses (including the daily/weekly/
  monthly expense views and the dashboard spend summary). Neon Postgres
  schema live for the Phase 1 tables (`users`, `tasks`, `reminders`,
  `expenses`, `notifications`). See `backend/README.md` for what's real vs.
  stubbed.
- **Not done yet**: push notifications (FCM), sign-up/password-reset flows,
  task due dates in the UI, and everything in Phase 2+. Following the
  phase-order rule rather than building ahead.

## Tech stack

React Native · Spring Boot · PostgreSQL (Neon) · Clerk · Ollama (self-hosted
AI, Phase 2+) · OpenStreetMap · Firebase Cloud Messaging · Render. All
free-tier / open-source; MIT/Apache-2.0/BSD dependencies only.
=======
# LifeSathi
>>>>>>> ab2255442d016241626058163305b515cb010fb7
