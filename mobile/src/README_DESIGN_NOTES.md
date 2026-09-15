# LifeSathi mobile UI — design notes (Phase 1 preview)

Two screens built as pure presentation components (no navigation, no API
calls, no auth SDK) so they can be reviewed and adjusted before wiring up
Spring Boot / Clerk: `LoginScreen.tsx`, `DashboardScreen.tsx`.

## What's here
- `theme/index.ts` — color, type, spacing tokens. Comments explain the
  palette rationale (Indigo Night / Marigold / Teal / Coral).
- `components/` — `PrimaryButton`, `TextField`, `AttentionCard`, `TaskRow`.
  Split out because the "attention list" and "tasks" patterns repeat on
  other Phase 1/2 screens (calendar, reminders).
- `screens/LoginScreen.tsx`, `screens/DashboardScreen.tsx`.

## Open decisions — not yet added, flagging per project rules
None of these are in the agreed stack, so none were added silently:

1. **Custom fonts (Manrope + Inter).** Currently declared in `theme/index.ts`
   but the `.ttf` files aren't linked yet — text renders in the OS default
   font until they are. Free (SIL Open Font License), just needs the asset
   step.
2. **Icon library.** Screens currently use plain shapes/text (a checkmark
   character, colored dots) instead of icons for the bell, tab bar, and
   attention-list glyphs. Suggest `lucide-react-native` or
   `react-native-vector-icons` — both MIT-licensed and free — but didn't
   add either without confirming.
3. **Navigation library.** Not in the original stack list. `react-navigation`
   (MIT) is the standard choice when we get to wiring screens together.

Let me know if you want me to go ahead and add any of these now, or leave
them for the Phase 1 backend-wiring pass.
