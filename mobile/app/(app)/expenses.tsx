import { useAuth } from '@clerk/expo';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ExpensesScreen, { type ExpenseItem } from '../../src/screens/ExpensesScreen';
import { createExpense, deleteExpense, fetchExpenseSummary, fetchExpenses } from '../../src/api/expenses';
import { colors } from '../../src/theme';

export default function ExpensesRoute() {
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseItem[] | null>(null);
  const [monthTotal, setMonthTotal] = useState(0);
  const [monthBudget, setMonthBudget] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const token = await getToken();
      const [remote, summary] = await Promise.all([
        fetchExpenses(token, 'MONTHLY'),
        fetchExpenseSummary(token, 'MONTHLY'),
      ]);
      setExpenses(
        remote.map((e) => ({
          id: e.id,
          amount: e.amount,
          category: e.category,
          note: e.note,
          spentAt: new Date(e.spentAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        }))
      );
      setMonthTotal(summary.total);
      setMonthBudget(summary.budget);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? 'Could not load expenses.');
    }
  }, [getToken]);

  useEffect(() => {
    void load();
  }, [load]);

  // Re-pulls everything after a write instead of updating local state
  // optimistically — the month total/budget-% is a derived aggregate, and
  // recomputing it client-side would just duplicate ExpenseService's logic
  // and risk drifting from it. Simpler and always correct, at the cost of a
  // network round trip per action.
  const handleCreate = async (input: { amount: number; category: string; note: string }) => {
    setCreating(true);
    try {
      const token = await getToken();
      await createExpense(token, { amount: input.amount, category: input.category, note: input.note || undefined });
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Could not add that expense.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = await getToken();
    await deleteExpense(token, id).catch(() => {});
    await load();
  };

  if (error && !expenses) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!expenses) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return (
    <ExpensesScreen
      expenses={expenses}
      monthTotal={monthTotal}
      monthBudget={monthBudget}
      creating={creating}
      onCreate={handleCreate}
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
