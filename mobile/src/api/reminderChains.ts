import { apiFetch } from './client';
import type { ReminderResponse } from './reminders';

// Mirrors backend/.../reminder/chain/ReminderChainResponse.java
export interface ReminderChainResponse {
  id: string;
  title: string;
  targetDate: string;
  active: boolean;
  reminders: ReminderResponse[];
}

export interface ReminderChainRequest {
  title: string;
  targetDate: string;
}

export function fetchReminderChains(token: string | null): Promise<ReminderChainResponse[]> {
  return apiFetch<ReminderChainResponse[]>('/api/reminder-chains', { token });
}

export function createReminderChain(token: string | null, request: ReminderChainRequest): Promise<ReminderChainResponse> {
  return apiFetch<ReminderChainResponse>('/api/reminder-chains', { method: 'POST', body: request, token });
}

export function cancelReminderChain(token: string | null, id: string): Promise<void> {
  return apiFetch<void>(`/api/reminder-chains/${id}`, { method: 'DELETE', token });
}
