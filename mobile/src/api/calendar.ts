import { apiFetch } from './client';

export type CalendarEventType = 'TASK' | 'REMINDER' | 'EXPIRY';

// Mirrors backend/.../calendar/CalendarEventResponse.java
export interface CalendarEventResponse {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string; // ISO instant
}

export function fetchCalendarMonth(token: string | null, year: number, month: number): Promise<CalendarEventResponse[]> {
  return apiFetch<CalendarEventResponse[]>(`/api/calendar?year=${year}&month=${month}`, { token });
}
