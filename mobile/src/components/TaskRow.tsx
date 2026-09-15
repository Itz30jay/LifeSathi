import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

type Props = {
  label: string;
  done: boolean;
  onToggle: () => void;
};

/** Checklist row for the dashboard's "Today's tasks" section. */
export default function TaskRow({ label, done, onToggle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      style={styles.row}
    >
      <View style={[styles.checkbox, done && styles.checkboxDone]}>
        {done && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={[styles.label, done && styles.labelDone]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.disabled,
  },
  checkboxDone: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: colors.white, fontSize: 10, lineHeight: 11 },
  label: { fontSize: 13, color: colors.ink, ...typography.body },
  labelDone: { color: colors.disabled, textDecorationLine: 'line-through' },
});
