import { apiFetch } from './client';
import type { ExpensePeriod } from './expenses';

// Mirrors backend/.../expense/CategoryInsight.java
export interface CategoryInsight {
  category: string;
  currentTotal: number;
  previousTotal: number;
  /** Null when previousTotal is zero — "new this period", not a percentage. */
  percentChange: number | null;
}

// Mirrors backend/.../expense/ExpenseAnalyticsResponse.java
export interface ExpenseAnalyticsResponse {
  period: ExpensePeriod;
  currentTotal: number;
  previousTotal: number;
  overallPercentChange: number | null;
  categoryInsights: CategoryInsight[];
}

export function fetchExpenseAnalytics(
  token: string | null,
  period: ExpensePeriod = 'MONTHLY'
): Promise<ExpenseAnalyticsResponse> {
  return apiFetch<ExpenseAnalyticsResponse>(`/api/expenses/analytics?period=${period}`, { token });
}
