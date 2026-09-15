import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, Urgency, urgencyColor } from '../theme';

type Props = {
  title: string;
  subtitle: string;
  urgency: Urgency;
  isLast?: boolean;
};

/**
 * One row in the "Needs your attention" list — this is the app's core
 * differentiator (proactive, not passive), so it gets top billing on the
 * dashboard rather than being one card among many.
 *
 * Color is currently the only urgency signal. Swap in a real icon per
 * `urgency` once an icon package is approved — see the FONT NOTE in
 * theme/index.ts for the same kind of decision (don't add a dependency
 * silently; flag it first per project rules).
 */
export default function AttentionCard({ title, subtitle, urgency, isLast }: Props) {
  return (
    <View
      style={[styles.row, { borderLeftColor: urgencyColor[urgency] }, !isLast && styles.divider]}
    >
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderLeftWidth: 3,
    paddingLeft: spacing.md - 2,
    paddingVertical: spacing.sm - 1,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  textBlock: { flex: 1 },
  title: { fontSize: 13, color: colors.ink, ...typography.bodyMedium },
  subtitle: { fontSize: 11.5, color: colors.textFaint, marginTop: 2, ...typography.body },
});
