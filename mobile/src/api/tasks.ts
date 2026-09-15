import { apiFetch } from './client';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

// Mirrors backend/.../task/TaskResponse.java
export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
}

export interface TaskRequest {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export function fetchTasks(token: string | null): Promise<TaskResponse[]> {
  return apiFetch<TaskResponse[]>('/api/tasks', { token });
}

export function createTask(token: string | null, request: TaskRequest): Promise<TaskResponse> {
  return apiFetch<TaskResponse>('/api/tasks', { method: 'POST', body: request, token });
}

export function updateTask(token: string | null, id: string, request: TaskRequest): Promise<TaskResponse> {
  return apiFetch<TaskResponse>(`/api/tasks/${id}`, { method: 'PUT', body: request, token });
}

export function setTaskCompleted(token: string | null, id: string, completed: boolean): Promise<TaskResponse> {
  return apiFetch<TaskResponse>(`/api/tasks/${id}/completed`, { method: 'PATCH', body: { completed }, token });
}

export function deleteTask(token: string | null, id: string): Promise<void> {
  return apiFetch<void>(`/api/tasks/${id}`, { method: 'DELETE', token });
}
