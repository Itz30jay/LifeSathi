import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, typography, spacing, radii } from '../theme';
import PrimaryButton from '../components/PrimaryButton';

export type ExpenseItem = {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  spentAt: string; // ISO instant, already formatted for display by the container
};

export type CategoryInsightItem = {
  category: string;
  currentTotal: number;
  percentChange: number | null; // null means "new this period" — see backend's CategoryInsight doc comment
};

export type ExpenseAnalytics = {
  overallPercentChange: number | null;
  categoryInsights: CategoryInsightItem[];
};

type NewExpense = { amount: number; category: string; note: string };

type Props = {
  expenses: ExpenseItem[];
  monthTotal: number;
  monthBudget: number | null;
  /** Null while analytics are still loading — the insights block is skipped, not shown empty. */
  analytics: ExpenseAnalytics | null;
  creating?: boolean;
  onCreate: (expense: NewExpense) => void;
  onDelete: (id: string) => void;
};

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

/** Purely factual phrasing — no "you should" language, matching the project's "factual, not advisory" rule. */
function describeChange(percentChange: number | null): string {
  if (percentChange === null) return 'new this month';
  const rounded = Math.round(Math.abs(percentChange));
  if (rounded === 0) return 'about the same as last month';
  return `${percentChange > 0 ? 'up' : 'down'} ${rounded}% vs last month`;
}

export default function ExpensesScreen({
  expenses,
  monthTotal,
  monthBudget,
  analytics,
  creating = false,
  onCreate,
  onDelete,
}: Props) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');

  const parsedAmount = Number(amount);
  const canSubmit = category.trim().length > 0 && amount.trim().length > 0 && parsedAmount > 0;

  const submit = () => {
    if (!canSubmit) return;
    onCreate({ amount: parsedAmount, category: category.trim(), note: note.trim() });
    setAmount('');
    setCategory('');
    setNote('');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expenses</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryAmount}>{formatINR(monthTotal)}</Text>
          <Text style={styles.summaryOf}>{monthBudget ? `of ${formatINR(monthBudget)} this month` : 'this month'}</Text>
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={expenses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          analytics && analytics.categoryInsights.length > 0 ? (
            <View style={styles.insightsCard}>
              <Text style={styles.insightsTitle}>
                Total spending is {describeChange(analytics.overallPercentChange)}
              </Text>
              {analytics.categoryInsights.slice(0, 5).map((insight) => (
                <View key={insight.category} style={styles.insightRow}>
                  <Text style={styles.insightCategory} numberOfLines={1}>
                    {insight.category}
                  </Text>
                  <Text style={styles.insightAmount}>{formatINR(insight.currentTotal)}</Text>
                  <Text
                    style={[
                      styles.insightChange,
                      insight.percentChange !== null && insight.percentChange > 0 && styles.insightChangeNotable,
                    ]}
                  >
                    {describeChange(insight.percentChange)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={<Text style={styles.emptyState}>No expenses logged yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowCategory}>{item.category}</Text>
              {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
              <Text style={styles.rowDate}>{item.spentAt}</Text>
            </View>
            <Text style={styles.rowAmount}>{formatINR(item.amount)}</Text>
            <Text onPress={() => onDelete(item.id)} style={styles.deleteLabel}>
              Remove
            </Text>
          </View>
        )}
      />

      <View style={styles.form}>
        <View style={styles.formRow}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            placeholderTextColor={colors.textFaint}
            keyboardType="decimal-pad"
            style={[styles.input, styles.amountInput]}
          />
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Category (e.g. Groceries)"
            placeholderTextColor={colors.textFaint}
            style={[styles.input, styles.categoryInput]}
          />
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Note (optional)"
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <PrimaryButton label="Add expense" onPress={submit} disabled={!canSubmit} loading={creating} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.sand },
  header: { paddingHorizontal: spacing.xl - 4, paddingTop: spacing.xl, paddingBottom: spacing.md },
  headerTitle: { fontSize: 20, color: colors.ink, ...typography.heading },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs + 2, marginTop: spacing.xs + 2 },
  summaryAmount: { fontSize: 22, color: colors.ink, ...typography.headingSemibold },
  summaryOf: { fontSize: 12, color: colors.textFaint },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl - 4, paddingBottom: spacing.md },
  insightsCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  insightsTitle: { fontSize: 13.5, color: colors.ink, marginBottom: spacing.sm, ...typography.bodyMedium },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs + 1 },
  insightCategory: { flex: 1, fontSize: 12.5, color: colors.textMuted },
  insightAmount: { fontSize: 12.5, color: colors.ink, ...typography.bodyMedium, fontVariant: ['tabular-nums'] },
  insightChange: { fontSize: 11, color: colors.textFaint, width: 92, textAlign: 'right' },
  insightChangeNotable: { color: colors.ink, ...typography.bodyMedium },
  emptyState: { fontSize: 12.5, color: colors.textFaint, fontStyle: 'italic', marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  rowText: { flex: 1 },
  rowCategory: { fontSize: 14, color: colors.ink, ...typography.bodyMedium },
  rowNote: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rowDate: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  rowAmount: { fontSize: 14, color: colors.ink, ...typography.bodySemibold, fontVariant: ['tabular-nums'] },
  deleteLabel: { fontSize: 12, color: colors.coral, ...typography.bodyMedium },
  form: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.sm + 2,
  },
  formRow: { flexDirection: 'row', gap: spacing.sm + 2 },
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
  amountInput: { width: 110 },
  categoryInput: { flex: 1 },
});
