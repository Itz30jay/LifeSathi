import { apiFetch } from './client';

export type ExpensePeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// Mirrors backend/.../expense/ExpenseResponse.java
export interface ExpenseResponse {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  spentAt: string;
}

export interface ExpenseRequest {
  amount: number;
  category: string;
  note?: string | null;
  spentAt?: string | null;
}

// Mirrors backend/.../expense/ExpenseSummaryResponse.java
export interface ExpenseSummaryResponse {
  total: number;
  /** Only non-null for period=MONTHLY, and only if the user has set monthlyBudget. */
  budget: number | null;
  count: number;
  periodStart: string;
  periodEnd: string;
}

export function fetchExpenses(token: string | null, period: ExpensePeriod = 'MONTHLY'): Promise<ExpenseResponse[]> {
  return apiFetch<ExpenseResponse[]>(`/api/expenses?period=${period}`, { token });
}

export function fetchExpenseSummary(
  token: string | null,
  period: ExpensePeriod = 'MONTHLY'
): Promise<ExpenseSummaryResponse> {
  return apiFetch<ExpenseSummaryResponse>(`/api/expenses/summary?period=${period}`, { token });
}

export function createExpense(token: string | null, request: ExpenseRequest): Promise<ExpenseResponse> {
  return apiFetch<ExpenseResponse>('/api/expenses', { method: 'POST', body: request, token });
}

export function deleteExpense(token: string | null, id: string): Promise<void> {
  return apiFetch<void>(`/api/expenses/${id}`, { method: 'DELETE', token });
}
