import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import DashboardScreen, { type AttentionItem, type Task } from '../../src/screens/DashboardScreen';
import { fetchProfile } from '../../src/api/profile';
import { fetchTasks, setTaskCompleted } from '../../src/api/tasks';
import { fetchReminders } from '../../src/api/reminders';
import { fetchExpenseSummary } from '../../src/api/expenses';
import { deriveAttentionItems } from '../../src/lib/attention';
import { colors } from '../../src/theme';

interface DashboardData {
  userName: string;
  tasks: Task[];
  attention: AttentionItem[];
  monthSpend: number;
  monthBudget: number | null;
}

export default function DashboardRoute() {
  const { getToken } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const [profile, tasks, reminders, summary] = await Promise.all([
        fetchProfile(token),
        fetchTasks(token),
        fetchReminders(token),
        fetchExpenseSummary(token, 'MONTHLY'),
      ]);

      setData({
        userName: profile.fullName ?? profile.email.split('@')[0],
        tasks: tasks.map((t) => ({ id: t.id, label: t.title, done: t.completed })),
        attention: deriveAttentionItems(reminders),
        monthSpend: summary.total,
        monthBudget: summary.budget,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load your dashboard.');
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  // TaskRow already flips its own local checkbox state optimistically
  // (see components/TaskRow.tsx); this just persists that decision. A
  // rollback-on-failure toast is a reasonable follow-up, not done here.
  const handleTaskToggle = async (taskId: string, done: boolean) => {
    const token = await getToken();
    await setTaskCompleted(token, taskId, done).catch(() => {
      /* best-effort for now */
    });
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <DashboardScreen
      userName={data.userName}
      dateLabel={dateLabel}
      attentionItems={data.attention}
      initialTasks={data.tasks}
      monthSpend={data.monthSpend}
      monthBudget={data.monthBudget}
      onTaskToggle={handleTaskToggle}
    />
  );
}

const styles = {
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sand,
    padding: 24,
  } as const,
  errorText: { color: colors.coral, textAlign: 'center' as const, fontSize: 14 },
};
