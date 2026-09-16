# LifeSathi mobile

Expo (SDK 57) + Expo Router + Clerk. Screens are split into pure
presentation components (`src/screens/`) and route files (`app/`) that wire
them to real auth and API calls — see `src/README_DESIGN_NOTES.md` for the
original UI design rationale.

## Run locally

1. `cp .env.example .env` and fill in:
   - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` — from the Clerk Dashboard once a
     Clerk application exists (still not created in this project — Clerk's
     MCP tool only exposes SDK-snippet lookup, not application/account
     creation, so this step needs a human in the Clerk dashboard).
   - `EXPO_PUBLIC_API_BASE_URL` — your machine's LAN IP + port 8080 for
     local dev (not `localhost` — a phone/simulator can't reach your
     laptop's localhost), or the Render URL once the backend is deployed.
2. `npm install`
3. `npx expo start`

## What's actually verified vs. not

This is the one part of LifeSathi where verification was possible in the
build sandbox (npm registry was reachable; Maven Central for the backend
was not):

- `npm install` — succeeds cleanly, 806 packages, no dependency conflicts.
- `npx tsc --noEmit` — passes with zero errors across the whole app,
  including the new route/API files.
- `npx expo-doctor` — 19/21 checks pass. The 2 failures are both this
  sandbox's network allowlist blocking calls to Expo's servers (schema
  validation, React Native Directory lookup), not real project issues —
  re-run it yourself with normal network access for the full picture.
- **Not verified**: it hasn't actually run on a simulator/device, and
  can't — there's a real Clerk publishable key and a reachable backend
  required for that, neither of which exist yet in this session.

One real bug the type-checker caught and is worth knowing about: the
installed Clerk version's main `useSignIn` export now returns a newer
signal-based API shape (`{ errors, fetchStatus, signIn }`) instead of the
classic `{ isLoaded, signIn, setActive }` that Clerk's own current custom-
flow docs teach. The classic shape still exists at the `@clerk/expo/legacy`
subpath — that's what `app/sign-in.tsx` imports from, with a comment
explaining why. Worth re-checking next time Clerk is upgraded.

## Structure

```
app/                    Expo Router routes (file-based)
  _layout.tsx           Wraps everything in ClerkProvider
  index.tsx             Redirects to /sign-in or /(app)
  sign-in.tsx           Wires LoginScreen to real Clerk sign-in + Google SSO
  (app)/_layout.tsx     Tab bar (Home/Tasks/Reminders/Expenses) + auth guard
  (app)/index.tsx       Home/dashboard tab
  (app)/tasks.tsx       Task list + add form, full CRUD against the API
  (app)/reminders.tsx   Reminder list + add form (native date/time picker)
  (app)/expenses.tsx    Expense list + add form, re-pulls the month summary after writes
src/
  screens/              Presentation-only components (no auth/API calls)
  components/           Shared UI pieces (buttons, fields, list rows, segmented control)
  theme/                Design tokens
  api/                  Typed fetch wrappers, one file per backend resource
  lib/attention.ts      Derives the "needs your attention" list from reminders
                         (client-side stand-in for the Phase 2 cascading-
                         reminder feed — see the comment in that file)
```

One new dependency this pass: `@react-native-community/datetimepicker` (MIT,
Expo-compatible from SDK 52+) — reminders fundamentally need a real date/time
picker, there's no reasonable way around it. Everything else in `theme`/
`components` was reused rather than adding a picker/UI-kit library.

## Still open (flagged, not added silently)

- **Icon library** and **custom font linking** (Manrope/Inter) — cosmetic,
  deferred since they weren't needed to get real data flowing. Tab bar is
  text-only for the same reason.
- **Sign-up and password-reset flows** — real multi-step Clerk flows
  (email verification, etc.); `sign-in.tsx` shows "coming soon" for both
  rather than faking them.
- **FCM push notifications** — Phase 1 module #6, not started.
- **Task due dates** — the backend supports them; the add-task form doesn't
  expose a date field yet (kept the form to title + priority for this pass;
  same date-picker component from Reminders would cover it as a fast-follow).
