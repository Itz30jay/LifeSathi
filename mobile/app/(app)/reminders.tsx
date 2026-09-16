import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import RemindersScreen, { type ReminderItem } from '../../src/screens/RemindersScreen';
import { createReminder, deleteReminder, fetchReminders, setReminderActive, type ReminderResponse } from '../../src/api/reminders';
import { colors } from '../../src/theme';

function toItem(r: ReminderResponse): ReminderItem {
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    remindAtLabel: new Date(r.remindAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    recurrenceInterval: r.recurrenceInterval,
    active: r.active,
  };
}

export default function RemindersRoute() {
  const { getToken } = useAuth();
  const [reminders, setReminders] = useState<ReminderItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const remote = await fetchReminders(token);
      setReminders(remote.map(toItem));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load reminders.');
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (input: {
    title: string;
    type: ReminderItem['type'];
    remindAt: Date;
    recurrenceInterval: ReminderItem['recurrenceInterval'];
  }) => {
    setCreating(true);
    try {
      const token = await getToken();
      const created = await createReminder(token, {
        title: input.title,
        type: input.type,
        remindAt: input.remindAt.toISOString(),
        recurrenceInterval: input.recurrenceInterval ?? undefined,
      });
      setReminders((prev) => [toItem(created), ...(prev ?? [])]);
    } catch (err: any) {
      setError(err?.message ?? 'Could not add that reminder.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setReminders((prev) => prev?.map((r) => (r.id === id ? { ...r, active } : r)) ?? null);
    const token = await getToken();
    await setReminderActive(token, id, active).catch(() => load());
  };

  const handleDelete = async (id: string) => {
    setReminders((prev) => prev?.filter((r) => r.id !== id) ?? null);
    const token = await getToken();
    await deleteReminder(token, id).catch(() => load());
  };

  if (error && !reminders) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!reminders) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return (
    <RemindersScreen
      reminders={reminders}
      creating={creating}
      onCreate={handleCreate}
      onToggleActive={handleToggleActive}
      onDelete={handleDelete}
    />
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
