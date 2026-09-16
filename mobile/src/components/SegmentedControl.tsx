import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '../theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Row of pill buttons — used wherever a request has a small fixed enum (priority, reminder type, recurrence). */
export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs + 2 },
  pill: {
    flex: 1,
    height: 38,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  pillSelected: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  label: { fontSize: 13, color: colors.textMuted, ...typography.bodyMedium },
  labelSelected: { color: colors.white },
});
