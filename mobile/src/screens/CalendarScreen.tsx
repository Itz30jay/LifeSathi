import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { colors, typography, spacing, calendarEventColor, type CalendarEventType } from '../theme';

export type CalendarEventItem = {
  id: string;
  type: CalendarEventType;
  title: string;
};

export type CalendarDayGroup = {
  dateKey: string; // stable key for the list, e.g. "2026-09-21"
  dateLabel: string; // e.g. "Mon, 21 Sep"
  isToday: boolean;
  events: CalendarEventItem[];
};

type Props = {
  monthLabel: string; // e.g. "September 2026"
  days: CalendarDayGroup[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

const TYPE_LABEL: Record<CalendarEventType, string> = {
  TASK: 'Task',
  REMINDER: 'Reminder',
  EXPIRY: 'Expires',
};

export default function CalendarScreen({ monthLabel, days, onPrevMonth, onNextMonth }: Props) {
  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Pressable onPress={onPrevMonth} hitSlop={12} style={styles.navButton}>
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{monthLabel}</Text>
        <Pressable onPress={onNextMonth} hitSlop={12} style={styles.navButton}>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={days}
        keyExtractor={(day) => day.dateKey}
        ListEmptyComponent={<Text style={styles.emptyState}>Nothing scheduled this month.</Text>}
        renderItem={({ item: day }) => (
          <View style={styles.dayGroup}>
            <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
              {day.dateLabel}
              {day.isToday ? ' · Today' : ''}
            </Text>
            {day.events.map((event) => (
              <View key={event.id} style={styles.eventRow}>
                <View style={[styles.eventDot, { backgroundColor: calendarEventColor[event.type] }]} />
                <Text style={styles.eventType}>{TYPE_LABEL[event.type]}</Text>
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl - 4,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  navButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  navArrow: { fontSize: 22, color: colors.indigo, ...typography.heading },
  headerTitle: { fontSize: 17, color: colors.ink, ...typography.heading },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl - 4, paddingBottom: spacing.xl },
  emptyState: { fontSize: 12.5, color: colors.textFaint, fontStyle: 'italic', marginTop: spacing.lg, textAlign: 'center' },
  dayGroup: { marginBottom: spacing.md },
  dayLabel: { fontSize: 12.5, color: colors.textMuted, marginBottom: spacing.xs + 2, ...typography.bodyMedium },
  dayLabelToday: { color: colors.marigold },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: spacing.sm - 1,
    paddingHorizontal: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  eventDot: { width: 7, height: 7, borderRadius: 3.5 },
  eventType: { fontSize: 10.5, color: colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.3, width: 56 },
  eventTitle: { flex: 1, fontSize: 13.5, color: colors.ink, ...typography.body },
});
