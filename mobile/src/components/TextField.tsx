import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, typography, radii, spacing } from '../theme';

type Props = TextInputProps & {
  label: string;
  rightAdornment?: React.ReactNode; // e.g. a "Forgot?" link next to the label
};

/** Labeled input matching the LifeSathi field style (used for phone/email/password). */
export default function TextField({ label, rightAdornment, style, ...inputProps }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightAdornment}
      </View>
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={[styles.input, style]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  label: { fontSize: 12, color: colors.textMuted, ...typography.bodyMedium },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
  },
});
