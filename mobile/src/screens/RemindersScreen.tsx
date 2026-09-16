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

type NewReminder = {
  title: string;
  type: ReminderType;
  remindAt: Date;
  recurrenceInterval: RecurrenceInterval | null;
};

type Props = {
  reminders: ReminderItem[];
  creating?: boolean;
  onCreate: (reminder: NewReminder) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
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

const ONE_HOUR_MS = 60 * 60 * 1000;

export default function RemindersScreen({ reminders, creating = false, onCreate, onToggleActive, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('ONE_TIME');
  const [interval, setInterval] = useState<RecurrenceInterval>('MONTHLY');
  const [remindAt, setRemindAt] = useState(() => new Date(Date.now() + ONE_HOUR_MS));
  const [showPicker, setShowPicker] = useState(false);

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onCreate({
      title: title.trim(),
      type,
      remindAt,
      recurrenceInterval: type === 'RECURRING' ? interval : null,
    });
    setTitle('');
    setType('ONE_TIME');
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && date) setRemindAt(date);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reminders</Text>
        <Text style={styles.headerSubtitle}>
          {reminders.filter((r) => r.active).length} active
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={reminders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyState}>No reminders yet — add one below.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.row, !item.active && styles.rowPaused]}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>
                {item.remindAtLabel}
                {item.type === 'RECURRING' ? ` · repeats ${item.recurrenceInterval?.toLowerCase()}` : ''}
              </Text>
            </View>
            <Pressable onPress={() => onToggleActive(item.id, !item.active)} hitSlop={8}>
              <Text style={styles.pauseLabel}>{item.active ? 'Pause' : 'Resume'}</Text>
            </Pressable>
            <Pressable onPress={() => onDelete(item.id)} hitSlop={8}>
              <Text style={styles.deleteLabel}>Remove</Text>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.form}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Remind me about…"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
        />

        <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />
        {type === 'RECURRING' && (
          <SegmentedControl options={INTERVAL_OPTIONS} value={interval} onChange={setInterval} />
        )}

        <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonLabel}>
            {remindAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>
        </Pressable>
        {showPicker && (
          <DateTimePicker
            value={remindAt}
            mode="datetime"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handlePickerChange}
          />
        )}
        {showPicker && Platform.OS === 'ios' && (
          <PrimaryButton label="Done" variant="secondary" onPress={() => setShowPicker(false)} />
        )}

        <PrimaryButton label="Add reminder" onPress={submit} disabled={!canSubmit} loading={creating} />
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
  emptyState: { fontSize: 12.5, color: colors.textFaint, fontStyle: 'italic', marginTop: spacing.lg },
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
