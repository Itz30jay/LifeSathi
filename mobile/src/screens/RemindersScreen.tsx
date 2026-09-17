import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, typography, spacing, radii } from '../theme';
import SegmentedControl from '../components/SegmentedControl';
import PrimaryButton from '../components/PrimaryButton';

export type ReminderType = 'ONE_TIME' | 'RECURRING';
export type RecurrenceInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type ReminderItem = {
  id: string;
  title: string;
  type: ReminderType;
  remindAtLabel: string; // pre-formatted by the container — screen doesn't own date formatting
  recurrenceInterval: RecurrenceInterval | null;
  active: boolean;
};

export type ReminderChainOffset = {
  id: string;
  offsetDays: number;
  remindAtLabel: string;
  active: boolean;
};

export type ReminderChainItem = {
  id: string;
  title: string;
  targetDateLabel: string;
  active: boolean;
  offsets: ReminderChainOffset[];
};

type NewReminder = {
  title: string;
  type: ReminderType;
  remindAt: Date;
  recurrenceInterval: RecurrenceInterval | null;
};

type NewChain = { title: string; targetDate: Date };

type Props = {
  standaloneReminders: ReminderItem[];
  chains: ReminderChainItem[];
  creating?: boolean;
  onCreateStandalone: (reminder: NewReminder) => void;
  onCreateChain: (chain: NewChain) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onCancelChain: (chainId: string) => void;
};

const TYPE_OPTIONS: { value: ReminderType; label: string }[] = [
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'RECURRING', label: 'Recurring' },
];

const INTERVAL_OPTIONS: { value: RecurrenceInterval; label: string }[] = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const FORM_MODE_OPTIONS: { value: 'single' | 'cascade'; label: string }[] = [
  { value: 'single', label: 'Single reminder' },
  { value: 'cascade', label: 'Expiry cascade' },
];

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function RemindersScreen({
  standaloneReminders,
  chains,
  creating = false,
  onCreateStandalone,
  onCreateChain,
  onToggleActive,
  onDelete,
  onCancelChain,
}: Props) {
  const [mode, setMode] = useState<'single' | 'cascade'>('single');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('ONE_TIME');
  const [interval, setInterval] = useState<RecurrenceInterval>('MONTHLY');
  const [remindAt, setRemindAt] = useState(() => new Date(Date.now() + ONE_HOUR_MS));
  const [targetDate, setTargetDate] = useState(() => new Date(Date.now() + ONE_WEEK_MS));
  const [showPicker, setShowPicker] = useState(false);

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    if (mode === 'cascade') {
      onCreateChain({ title: title.trim(), targetDate });
    } else {
      onCreateStandalone({
        title: title.trim(),
        type,
        remindAt,
        recurrenceInterval: type === 'RECURRING' ? interval : null,
      });
    }
    setTitle('');
    setType('ONE_TIME');
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type !== 'set' || !date) return;
    if (mode === 'cascade') setTargetDate(date);
    else setRemindAt(date);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
        <Text style={styles.headerSubtitle}>
          {chains.filter((c) => c.active).length} active expiry cascade
          {chains.filter((c) => c.active).length === 1 ? '' : 's'} ·{' '}
          {standaloneReminders.filter((r) => r.active).length} other
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={[{ kind: 'chains' as const }, { kind: 'standalone' as const }]}
        keyExtractor={(item) => item.kind}
        renderItem={({ item }) =>
          item.kind === 'chains' ? (
            <View>
              <Text style={styles.sectionLabel}>Expiry cascades</Text>
              {chains.length === 0 ? (
                <Text style={styles.emptyState}>
                  No cascades yet — give an expiry date below and get 45/30/15/7/1-day reminders automatically.
                </Text>
              ) : (
                chains.map((chain) => (
                  <View key={chain.id} style={styles.chainCard}>
                    <View style={styles.chainHeaderRow}>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{chain.title}</Text>
                        <Text style={styles.rowSubtitle}>Due {chain.targetDateLabel}</Text>
                      </View>
                      {chain.active && (
                        <Pressable onPress={() => onCancelChain(chain.id)} hitSlop={8}>
                          <Text style={styles.deleteLabel}>Cancel all</Text>
                        </Pressable>
                      )}
                    </View>
                    {chain.offsets.map((offset) => (
                      <View key={offset.id} style={styles.offsetRow}>
                        <View style={[styles.offsetDot, !offset.active && styles.offsetDotDone]} />
                        <Text style={[styles.offsetLabel, !offset.active && styles.offsetLabelDone]}>
                          {offset.offsetDays} day{offset.offsetDays === 1 ? '' : 's'} before · {offset.remindAtLabel}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))
              )}

              <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Other reminders</Text>
            </View>
          ) : (
            <View>
              {standaloneReminders.length === 0 ? (
                <Text style={styles.emptyState}>No standalone reminders.</Text>
              ) : (
                standaloneReminders.map((reminder) => (
                  <View key={reminder.id} style={[styles.row, !reminder.active && styles.rowPaused]}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{reminder.title}</Text>
                      <Text style={styles.rowSubtitle}>
                        {reminder.remindAtLabel}
                        {reminder.type === 'RECURRING' ? ` · repeats ${reminder.recurrenceInterval?.toLowerCase()}` : ''}
                      </Text>
                    </View>
                    <Pressable onPress={() => onToggleActive(reminder.id, !reminder.active)} hitSlop={8}>
                      <Text style={styles.pauseLabel}>{reminder.active ? 'Pause' : 'Resume'}</Text>
                    </Pressable>
                    <Pressable onPress={() => onDelete(reminder.id)} hitSlop={8}>
                      <Text style={styles.deleteLabel}>Remove</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          )
        }
      />

      <View style={styles.form}>
        <SegmentedControl options={FORM_MODE_OPTIONS} value={mode} onChange={setMode} />

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={mode === 'cascade' ? 'e.g. Car insurance renewal' : 'Remind me about…'}
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />

        {mode === 'single' && (
          <>
            <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
            {type === 'RECURRING' && (
              <SegmentedControl options={INTERVAL_OPTIONS} value={interval} onChange={setInterval} />
            )}
          </>
        )}

        <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonLabel}>
            {mode === 'cascade'
              ? `Expires ${targetDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
              : remindAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={mode === 'cascade' ? targetDate : remindAt}
            mode={mode === 'cascade' ? 'date' : 'datetime'}
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handlePickerChange}
          />
        )}
        {showPicker && Platform.OS === 'ios' && (
          <PrimaryButton label="Done" variant="secondary" onPress={() => setShowPicker(false)} />
        )}

        <PrimaryButton
          label={mode === 'cascade' ? 'Create cascade' : 'Add reminder'}
          onPress={submit}
          disabled={!canSubmit}
          loading={creating}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  header: { paddingHorizontal: spacing.xl - 4, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  headerTitle: { fontSize: 20, color: colors.ink, ...typography.heading },
  headerSubtitle: { fontSize: 12.5, color: colors.textFaint, marginTop: 2 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl - 4, paddingBottom: spacing.md },
  sectionLabel: { fontSize: 13, color: colors.ink, marginBottom: spacing.sm, ...typography.heading },
  sectionSpacing: { marginTop: spacing.lg },
  emptyState: { fontSize: 12.5, color: colors.textFaint, fontStyle: 'italic', marginBottom: spacing.sm },
  chainCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
  },
  chainHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  offsetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, marginTop: spacing.sm },
  offsetDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.marigold },
  offsetDotDone: { backgroundColor: colors.disabled },
  offsetLabel: { fontSize: 12, color: colors.textMuted },
  offsetLabelDone: { color: colors.disabled, textDecorationLine: 'line-through' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowPaused: { opacity: 0.5 },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 14, color: colors.ink, ...typography.bodyMedium },
  rowSubtitle: { fontSize: 11.5, color: colors.textFaint, marginTop: 2 },
  pauseLabel: { fontSize: 12, color: colors.teal, ...typography.bodyMedium },
  deleteLabel: { fontSize: 12, color: colors.coral, ...typography.bodyMedium },
  form: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.sm + 2,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.sand,
  },
  dateButton: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  dateButtonLabel: { fontSize: 14, color: colors.ink },
});
