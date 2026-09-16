import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, typography, spacing, radii, priorityColor, type TaskPriority } from '../theme';
import SegmentedControl from '../components/SegmentedControl';
import PrimaryButton from '../components/PrimaryButton';

export type TaskItem = {
  id: string;
  title: string;
  priority: TaskPriority;
  completed: boolean;
  dueDate: string | null; // ISO instant, or null if none set
};

type NewTask = { title: string; priority: TaskPriority; dueDate: Date | null };

type Props = {
  tasks: TaskItem[];
  creating?: boolean;
  onCreate: (task: NewTask) => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export default function TasksScreen({ tasks, creating = false, onCreate, onToggleComplete, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const submit = () => {
    if (!title.trim()) return;
    onCreate({ title: title.trim(), priority, dueDate });
    setTitle('');
    setPriority('MEDIUM');
    setDueDate(null);
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'set' && date) setDueDate(date);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Text style={styles.headerSubtitle}>
          {pending.length === 0 ? 'All done for now' : `${pending.length} pending`}
        </Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={[...pending, ...completed]}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyState}>No tasks yet — add your first one below.</Text>}
        renderItem={({ item }) => {
          const overdue = !item.completed && item.dueDate !== null && isOverdue(item.dueDate);
          return (
            <View style={styles.row}>
              <Pressable
                onPress={() => onToggleComplete(item.id, !item.completed)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: item.completed }}
                style={[styles.checkbox, item.completed && styles.checkboxDone]}
              >
                {item.completed && <Text style={styles.check}>✓</Text>}
              </Pressable>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor[item.priority] }]} />
              <View style={styles.rowTextBlock}>
                <Text style={[styles.rowLabel, item.completed && styles.rowLabelDone]} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.dueDate && (
                  <Text style={[styles.rowDueDate, overdue && styles.rowDueDateOverdue]}>
                    {overdue ? 'Overdue · ' : 'Due '}
                    {formatDueDate(item.dueDate)}
                  </Text>
                )}
              </View>
              <Pressable onPress={() => onDelete(item.id)} hitSlop={8}>
                <Text style={styles.deleteLabel}>Remove</Text>
              </Pressable>
            </View>
          );
        }}
      />

      <View style={styles.form}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Add a task…"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <SegmentedControl options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />

        <View style={styles.dueDateRow}>
          <Pressable onPress={() => setShowPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonLabel}>
              {dueDate
                ? dueDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                : 'No due date'}
            </Text>
          </Pressable>
          {dueDate && (
            <Pressable onPress={() => setDueDate(null)} hitSlop={8}>
              <Text style={styles.clearLabel}>Clear</Text>
            </Pressable>
          )}
        </View>
        {showPicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handlePickerChange}
          />
        )}
        {showPicker && Platform.OS === 'ios' && (
          <PrimaryButton label="Done" variant="secondary" onPress={() => setShowPicker(false)} />
        )}

        <PrimaryButton label="Add task" onPress={submit} disabled={!title.trim()} loading={creating} />
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
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.disabled, alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: colors.teal, borderColor: colors.teal },
  check: { color: colors.white, fontSize: 12, lineHeight: 13 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  rowTextBlock: { flex: 1 },
  rowLabel: { fontSize: 14, color: colors.ink, ...typography.body },
  rowLabelDone: { color: colors.disabled, textDecorationLine: 'line-through' },
  rowDueDate: { fontSize: 11.5, color: colors.textFaint, marginTop: 1 },
  rowDueDateOverdue: { color: colors.coral, ...typography.bodyMedium },
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
  dueDateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  dateButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    justifyContent: 'center',
    backgroundColor: colors.sand,
  },
  dateButtonLabel: { fontSize: 14, color: colors.ink },
  clearLabel: { fontSize: 12, color: colors.coral, ...typography.bodyMedium },
});
