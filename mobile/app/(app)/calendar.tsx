import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import CalendarScreen, { type CalendarDayGroup } from '../../src/screens/CalendarScreen';
import { fetchCalendarMonth, type CalendarEventResponse } from '../../src/api/calendar';
import { colors } from '../../src/theme';

function groupByDay(events: CalendarEventResponse[]): CalendarDayGroup[] {
  const today = new Date();
  const todayKey = today.toDateString();

  const byDate = new Map<string, CalendarEventResponse[]>();
  for (const event of events) {
    const date = new Date(event.date);
    const key = date.toDateString();
    const bucket = byDate.get(key) ?? [];
    bucket.push(event);
    byDate.set(key, bucket);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([dateKey, dayEvents]) => ({
      dateKey,
      dateLabel: new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
      isToday: dateKey === todayKey,
      events: dayEvents.map((e) => ({ id: e.id, type: e.type, title: e.title })),
    }));
}

export default function CalendarRoute() {
  const { getToken } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // JS months are 0-based, API is 1-based
  const [days, setDays] = useState<CalendarDayGroup[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setDays(null);
    try {
      const token = await getToken();
      const events = await fetchCalendarMonth(token, year, month);
      setDays(groupByDay(events));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load the calendar.');
    }
  }, [getToken, year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  if (error && !days) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!days) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return (
    <CalendarScreen monthLabel={monthLabel} days={days} onPrevMonth={goToPrevMonth} onNextMonth={goToNextMonth} />
  );
}

const styles = {
  center: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.sand,
    padding: 24,
  },
  errorText: { color: colors.coral, textAlign: 'center' as const },
};
