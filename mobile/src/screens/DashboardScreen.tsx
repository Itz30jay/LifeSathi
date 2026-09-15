import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';
import AttentionCard from '../components/AttentionCard';
import TaskRow from '../components/TaskRow';
import type { Urgency } from '../theme';

export type AttentionItem = { id: string; title: string; subtitle: string; urgency: Urgency };
export type Task = { id: string; label: string; done: boolean };

type Props = {
  userName: string;
  dateLabel: string;
  attentionItems: AttentionItem[];
  initialTasks: Task[];
  monthSpend: number;
  monthBudget: number;
  /** Called after a task is toggled locally — wire this to the real API in the backend pass. */
  onTaskToggle?: (taskId: string, done: boolean) => void;
};

/** Formats a number as Indian Rupees with Indian digit grouping, e.g. 18420 -> "₹18,420". */
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Dashboard screen. "Needs your attention" is rendered first and largest —
 * that list is LifeSathi's whole reason to exist (proactive, not passive),
 * so it should never get visually demoted below tasks or spend.
 *
 * Data comes in as props (no fetching here) so this stays a presentation
 * component; the real screen will wrap this with a data-loading container
 * once the API layer exists.
 */
export default function DashboardScreen({
  userName,
  dateLabel,
  attentionItems,
  initialTasks,
  monthSpend,
  monthBudget,
  onTaskToggle,
}: Props) {
  const [tasks, setTasks] = useState(initialTasks);

  const spendPct = useMemo(
    () => Math.min(100, Math.round((monthSpend / monthBudget) * 100)),
    [monthSpend, monthBudget]
  );

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, done: !t.done };
        onTaskToggle?.(id, next.done);
        return next;
      })
    );
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {userName}</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
        {/* Notification bell placeholder — wire to a real icon + unread badge
            once an icon library is approved (see theme/index.ts FONT NOTE) */}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Text style={styles.sectionLabel}>Needs your attention</Text>
        {attentionItems.length === 0 ? (
          <Text style={styles.emptyState}>Nothing urgent — you're on top of things.</Text>
        ) : (
          attentionItems.map((item, i) => (
            <AttentionCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              urgency={item.urgency}
              isLast={i === attentionItems.length - 1}
            />
          ))
        )}

        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>Today's tasks</Text>
        {tasks.map((t) => (
          <TaskRow key={t.id} label={t.label} done={t.done} onToggle={() => toggleTask(t.id)} />
        ))}

        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>This month's spend</Text>
        <View style={styles.spendRow}>
          <Text style={styles.spendAmount}>{formatINR(monthSpend)}</Text>
          <Text style={styles.spendOf}>of {formatINR(monthBudget)} budget</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${spendPct}%` }]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  header: {
    backgroundColor: colors.indigo,
    paddingHorizontal: spacing.xl - 4,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 16, color: colors.white, ...typography.heading },
  date: { fontSize: 11.5, color: '#AAB4C8', marginTop: 3 },
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: spacing.xl - 4,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionLabel: { fontSize: 13, color: colors.ink, marginBottom: spacing.sm + 2, ...typography.heading },
  sectionSpacing: { marginTop: spacing.lg + 2 },
  emptyState: { fontSize: 12.5, color: colors.textFaint, fontStyle: 'italic' },
  spendRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs + 2 },
  spendAmount: { fontSize: 20, color: colors.ink, ...typography.headingSemibold },
  spendOf: { fontSize: 11.5, color: colors.textFaint },
  progressTrack: { height: 6, backgroundColor: colors.borderSoft, borderRadius: 4, marginTop: spacing.sm },
  progressFill: { height: 6, backgroundColor: colors.teal, borderRadius: 4 },
});
