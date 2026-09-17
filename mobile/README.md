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

**Push notifications changed the dev workflow.** `@react-native-firebase/*`
needs native code, so the app can no longer run in plain Expo Go — it needs
a custom dev client (`npx expo prebuild` + a local or EAS build). EAS
Build's free tier covers this but has a monthly build-count limit. Also
worth knowing: `@react-native-firebase/messaging` v26 moved to a fully
modular API (`getToken(messaging, ...)` rather than the older
`messaging().getToken()` singleton style) and deprecated its own
`requestPermission()` — confirmed by reading the installed package's own
type definitions rather than assumed, since it would have been an easy
thing to get wrong from memory. Permission requests go through
`expo-notifications` instead (see `src/lib/pushNotifications.ts`).

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
  lib/pushNotifications.ts  FCM token registration + foreground message handling
```

One new dependency this pass: `@react-native-community/datetimepicker` (MIT,
Expo-compatible from SDK 52+) — reminders fundamentally need a real date/time
picker, there's no reasonable way around it. Everything else in `theme`/
`components` was reused rather than adding a picker/UI-kit library.

For push notifications: `@react-native-firebase/app` + `@react-native-firebase/messaging`
(Apache-2.0) for FCM itself, plus `expo-notifications` (MIT) for permission
requests specifically — see the note below on why two libraries are involved.

## Still open (flagged, not added silently)

- **Icon library** and **custom font linking** (Manrope/Inter) — cosmetic,
  deferred since they weren't needed to get real data flowing. Tab bar is
  text-only for the same reason.
- **Clerk Dashboard setting to check once a real Clerk app exists**: native
  apps can't render a CAPTCHA challenge, so if bot protection is on by
  default, `signUp.create()` may need the "Native API" option enabled in
  Clerk Dashboard → Configure → Attack protection. Not something to fix in
  code — just a setting to check when Clerk is actually connected.
- **A real Firebase project** — same category of blocker as Clerk (needs a
  human in a browser, no MCP connector for it). Until then, push setup fails
  silently on launch (caught and logged, doesn't crash the app — see the
  try/catch in `app/(app)/_layout.tsx`).
- **`google-services.json`** — gitignored, needs adding once a Firebase
  Android app exists (Firebase Console → Project Settings → your app →
  download `google-services.json` → drop it in `mobile/`).
- **A dev client build** — needed the first time to actually test push
  notifications on a device, since Expo Go can't load native Firebase code.
