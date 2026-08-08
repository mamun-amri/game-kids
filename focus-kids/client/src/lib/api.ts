import { getParentAuth } from './storage';
import type { ServerChild } from '../types';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getParentAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request gagal (${res.status})`);
  }
  return data as T;
}

export const api = {
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: { id: number; email: string; name: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(payload) },
    ),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: { id: number; email: string; name: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(payload) },
    ),

  children: () => request<ServerChild[]>('/children'),

  createChild: (payload: { name: string; age: number; avatar_id: string }) =>
    request<ServerChild>('/children', { method: 'POST', body: JSON.stringify(payload) }),

  deleteChild: (id: number) =>
    request<{ ok: boolean }>(`/children/${id}`, { method: 'DELETE' }),

  sync: (
    id: number,
    payload: {
      sessions: unknown[];
      achievements: string[];
      rewards: string[];
      streak: { current: number; best: number; lastDate: string };
    },
  ) => request<{ ok: boolean }>(`/children/${id}/sync`, { method: 'POST', body: JSON.stringify(payload) }),

  report: () => request<{ generated_at: string; children: unknown[] }>('/parent/report'),

  aiSummary: (childId: number) =>
    request<{ generated_at: string; source: 'ai' | 'heuristic'; summary: string }>(
      `/parent/ai-summary/${childId}`,
    ),
};
