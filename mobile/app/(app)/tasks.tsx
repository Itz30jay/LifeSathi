import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import TasksScreen, { type TaskItem } from '../../src/screens/TasksScreen';
import { createTask, deleteTask, fetchTasks, setTaskCompleted } from '../../src/api/tasks';
import { colors } from '../../src/theme';

export default function TasksRoute() {
  const { getToken } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const remote = await fetchTasks(token);
      setTasks(remote.map((t) => ({ id: t.id, title: t.title, priority: t.priority, completed: t.completed })));
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load tasks.');
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (input: { title: string; priority: TaskItem['priority'] }) => {
    setCreating(true);
    try {
      const token = await getToken();
      const created = await createTask(token, { title: input.title, priority: input.priority });
      setTasks((prev) => [
        { id: created.id, title: created.title, priority: created.priority, completed: created.completed },
        ...(prev ?? []),
      ]);
    } catch (err: any) {
      setError(err?.message ?? 'Could not add that task.');
    } finally {
      setCreating(false);
    }
  };

  // Optimistic: update local state immediately, roll back via a full
  // reload only if the request actually fails.
  const handleToggle = async (id: string, completed: boolean) => {
    setTasks((prev) => prev?.map((t) => (t.id === id ? { ...t, completed } : t)) ?? null);
    const token = await getToken();
    await setTaskCompleted(token, id, completed).catch(() => load());
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev?.filter((t) => t.id !== id) ?? null);
    const token = await getToken();
    await deleteTask(token, id).catch(() => load());
  };

  if (error && !tasks) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!tasks) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return (
    <TasksScreen
      tasks={tasks}
      creating={creating}
      onCreate={handleCreate}
      onToggleComplete={handleToggle}
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
