/**
 * LifeSathi design tokens.
 *
 * Palette rationale: Indigo Night grounds "trust/security" surfaces (headers,
 * emergency mode later). Marigold is the ONE primary accent — used for the
 * main CTA and for "needs attention" urgency — never used decoratively.
 * Teal reads as "money / calm / positive". Coral is reserved for genuinely
 * urgent items only (overdue bills, SOS in Phase 3) so it keeps its alarm
 * value instead of becoming background noise.
 *
 * FONT NOTE: Manrope + Inter are not bundled with React Native by default.
 * Add the .ttf files under `assets/fonts/` and link them (Expo: `expo-font`
 * + `useFonts`; bare RN: `react-native.config.js` + `npx react-native-asset`).
 * Until linked, `fontFamily` below falls back to the OS default font —
 * nothing breaks, it just won't match the mockup yet.
 */

export const colors = {
  indigo: '#1B2A4A', // headers, dark surfaces
  marigold: '#F2A93B', // primary CTA, "soon" urgency
  amber: '#D98F1B', // darker marigold for text/borders (AA contrast on sand)
  teal: '#0F6E5C', // money/positive, "fine" urgency, links
  coral: '#E1583F', // urgent-only (overdue, SOS) — never decorative
  sand: '#FBF7F0', // app background
  white: '#FFFFFF',
  ink: '#22201D', // primary text (warm black, not pure #000)
  textMuted: '#6B675F', // secondary text
  textFaint: '#8A8477', // tertiary text / placeholders
  border: '#E3DDD0', // hairline dividers, input borders
  borderSoft: '#EFE9DC', // list-row dividers
  disabled: '#C9C2B0',
} as const;

export const typography = {
  heading: { fontFamily: 'Manrope-Bold', fontWeight: '700' as const },
  headingSemibold: { fontFamily: 'Manrope-SemiBold', fontWeight: '600' as const },
  body: { fontFamily: 'Inter-Regular', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'Inter-Medium', fontWeight: '500' as const },
  bodySemibold: { fontFamily: 'Inter-SemiBold', fontWeight: '600' as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radii = { sm: 8, md: 10, lg: 16, full: 999 };

export type Urgency = 'urgent' | 'soon' | 'fine';

export const urgencyColor: Record<Urgency, string> = {
  urgent: colors.coral,
  soon: colors.amber,
  fine: colors.teal,
};
