import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, typography, spacing } from '../theme';
import TextField from '../components/TextField';
import SegmentedControl from '../components/SegmentedControl';
import PrimaryButton from '../components/PrimaryButton';

export type PreferredLanguage = 'en' | 'hi' | 'or';

export type ProfileData = {
  email: string;
  fullName: string | null;
  preferredLanguage: PreferredLanguage;
  monthlyBudget: number | null;
};

type Props = {
  profile: ProfileData;
  saving?: boolean;
  onSave: (update: { fullName: string; preferredLanguage: PreferredLanguage; monthlyBudget: number | null }) => void;
  onSignOut: () => void;
};

const LANGUAGE_OPTIONS: { value: PreferredLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'or', label: 'ଓଡ଼ିଆ' },
];

export default function ProfileScreen({ profile, saving = false, onSave, onSignOut }: Props) {
  const [fullName, setFullName] = useState(profile.fullName ?? '');
  const [language, setLanguage] = useState<PreferredLanguage>(profile.preferredLanguage);
  const [budget, setBudget] = useState(profile.monthlyBudget != null ? String(profile.monthlyBudget) : '');

  // Re-sync local form state if the underlying profile changes (e.g. after
  // a save round-trips through the server and comes back).
  useEffect(() => {
    setFullName(profile.fullName ?? '');
    setLanguage(profile.preferredLanguage);
    setBudget(profile.monthlyBudget != null ? String(profile.monthlyBudget) : '');
  }, [profile]);

  const parsedBudget = budget.trim() === '' ? null : Number(budget);
  const budgetIsValid = parsedBudget === null || (Number.isFinite(parsedBudget) && parsedBudget >= 0);

  const submit = () => {
    if (!budgetIsValid) return;
    onSave({ fullName: fullName.trim(), preferredLanguage: language, monthlyBudget: parsedBudget });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>Profile</Text>

        <TextField label="Name" value={fullName} onChangeText={setFullName} placeholder="Your name" />

        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>Email</Text>
          <Text style={styles.readOnlyValue}>{profile.email}</Text>
          <Text style={styles.readOnlyHint}>Managed by your sign-in provider — not editable here.</Text>
        </View>

        <Text style={styles.fieldLabel}>Language</Text>
        <SegmentedControl options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />
        <Text style={styles.fieldHint}>
          Sets your preference — the app itself doesn't fully translate on this yet.
        </Text>

        <TextField
          label="Monthly budget"
          value={budget}
          onChangeText={setBudget}
          placeholder="e.g. 25000"
          keyboardType="decimal-pad"
        />
        {!budgetIsValid && <Text style={styles.errorText}>Enter a valid amount, or leave it blank.</Text>}
        <Text style={styles.fieldHint}>Used for the spend progress bar on Home and Expenses.</Text>

        <PrimaryButton label="Save changes" onPress={submit} disabled={!budgetIsValid} loading={saving} />

        <View style={styles.divider} />

        <PrimaryButton label="Sign out" onPress={onSignOut} variant="secondary" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl - 4, paddingTop: spacing.xl, paddingBottom: spacing.xxxl },
  headerTitle: { fontSize: 20, color: colors.ink, marginBottom: spacing.lg, ...typography.heading },
  readOnlyField: { marginBottom: spacing.lg },
  readOnlyLabel: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs + 2, ...typography.bodyMedium },
  readOnlyValue: { fontSize: 14, color: colors.textFaint },
  readOnlyHint: { fontSize: 11, color: colors.textFaint, marginTop: 3, fontStyle: 'italic' },
  fieldLabel: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.xs + 2, ...typography.bodyMedium },
  fieldHint: { fontSize: 11, color: colors.textFaint, marginTop: spacing.xs, marginBottom: spacing.lg },
  errorText: { fontSize: 11.5, color: colors.coral, marginTop: -spacing.sm, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.borderSoft, marginVertical: spacing.xl },
});
