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

## Where things stand

**Phase 1 — code-complete**, with one item that can't be built further
without a live Clerk dashboard (phone-OTP sign-in needs an SMS provider
configured there first). Everything else — auth (email/password + Google),
dashboard, tasks, reminders, expenses, push notifications, and a profile
screen with sign-out — has real code behind it, not just UI mockups.

**Phase 2 — in progress.** Two features done: cascading reminders (module
#8) and a unified calendar (module #9), both picked deliberately because
they build on Phase 1 data with no new external accounts needed — unlike
almost everything else left in Phase 2, which needs Ollama, Cloudinary, or
native voice modules.

- **`mobile/`** — Expo Router app: Clerk auth (sign-in, sign-up, password
  reset, Google SSO), a 6-tab shell (Home/Tasks/Reminders/Calendar/
  Expenses/Profile) with full CRUD against the backend, task due dates, FCM
  push notification registration, expiry cascades, and now a month-agenda
  calendar merging tasks/reminders/expiry dates into one view. `npm install`
  and `npx tsc --noEmit` both pass cleanly — see `mobile/README.md` for what
  that does and doesn't prove, and for a workflow change worth knowing about
  (native Firebase code means Expo Go alone isn't enough anymore — a dev
  client build is needed to actually test push on a device).
- **`backend/`** — Spring Boot: Clerk JWT verification, full CRUD for
  tasks/reminders/expenses, a scheduler that turns due reminders into real
  push notifications, a profile update endpoint, `/api/reminder-chains` for
  cascades, and now `/api/calendar` (a read-only merge of the three date-
  bearing sources — nothing new stored). Neon Postgres schema live for
  every table in the original spec plus `device_tokens` and
  `reminder_chains`. See `backend/README.md`.
- **Deployment**: a `Dockerfile` exists for Render (no native Java runtime
  in Render's deploy tooling, so Docker is the path). Two Render deploy
  attempts happened mid-project and are documented in the commit history
  for reference, but deploying is being handled by the project owner
  directly rather than through this session from here on.
- **Not done yet**: phone OTP sign-in, expense analytics, document manager,
  "Ask LifeSathi", voice input, AI voice briefing, smart suggestions (the
  rest of Phase 2), and everything in Phase 3–4.

## Tech stack

React Native · Spring Boot · PostgreSQL (Neon) · Clerk · Ollama (self-hosted
AI, Phase 2+) · OpenStreetMap · Firebase Cloud Messaging · Render. All
free-tier / open-source; MIT/Apache-2.0/BSD dependencies only.
