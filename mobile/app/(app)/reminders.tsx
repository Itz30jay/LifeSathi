import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import RemindersScreen, { type ReminderItem, type ReminderChainItem } from '../../src/screens/RemindersScreen';
import {
  createReminder,
  deleteReminder,
  fetchReminders,
  setReminderActive,
  type ReminderResponse,
} from '../../src/api/reminders';
import {
  cancelReminderChain,
  createReminderChain,
  fetchReminderChains,
  type ReminderChainResponse,
} from '../../src/api/reminderChains';
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

function toChainItem(c: ReminderChainResponse): ReminderChainItem {
  return {
    id: c.id,
    title: c.title,
    targetDateLabel: new Date(c.targetDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }),
    active: c.active,
    offsets: c.reminders
      .slice()
      .sort((a, b) => (b.offsetDays ?? 0) - (a.offsetDays ?? 0))
      .map((r) => ({
        id: r.id,
        offsetDays: r.offsetDays ?? 0,
        remindAtLabel: new Date(r.remindAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        active: r.active,
      })),
  };
}

export default function RemindersRoute() {
  const { getToken } = useAuth();
  const [standalone, setStandalone] = useState<ReminderItem[] | null>(null);
  const [chains, setChains] = useState<ReminderChainItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const [reminders, remoteChains] = await Promise.all([fetchReminders(token), fetchReminderChains(token)]);
      // GET /api/reminders returns every reminder, cascade-generated ones
      // included -- only the ones with no chainId belong in this list.
      setStandalone(reminders.filter((r) => !r.chainId).map(toItem));
      setChains(remoteChains.map(toChainItem));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load reminders.');
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateStandalone = async (input: {
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
      setStandalone((prev) => [toItem(created), ...(prev ?? [])]);
    } catch (err: any) {
      setError(err?.message ?? 'Could not add that reminder.');
    } finally {
      setCreating(false);
    }
  };

  const handleCreateChain = async (input: { title: string; targetDate: Date }) => {
    setCreating(true);
    try {
      const token = await getToken();
      const created = await createReminderChain(token, {
        title: input.title,
        targetDate: input.targetDate.toISOString(),
      });
      setChains((prev) => [toChainItem(created), ...(prev ?? [])]);
    } catch (err: any) {
      setError(err?.message ?? 'Could not create that cascade.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setStandalone((prev) => prev?.map((r) => (r.id === id ? { ...r, active } : r)) ?? null);
    const token = await getToken();
    await setReminderActive(token, id, active).catch(() => load());
  };

  const handleDelete = async (id: string) => {
    setStandalone((prev) => prev?.filter((r) => r.id !== id) ?? null);
    const token = await getToken();
    await deleteReminder(token, id).catch(() => load());
  };

  const handleCancelChain = async (chainId: string) => {
    setChains(
      (prev) =>
        prev?.map((c) =>
          c.id === chainId ? { ...c, active: false, offsets: c.offsets.map((o) => ({ ...o, active: false })) } : c
        ) ?? null
    );
    const token = await getToken();
    await cancelReminderChain(token, chainId).catch(() => load());
  };

  if (error && !standalone && !chains) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!standalone || !chains) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return (
    <RemindersScreen
      standaloneReminders={standalone}
      chains={chains}
      creating={creating}
      onCreateStandalone={handleCreateStandalone}
      onCreateChain={handleCreateChain}
      onToggleActive={handleToggleActive}
      onDelete={handleDelete}
      onCancelChain={handleCancelChain}
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
