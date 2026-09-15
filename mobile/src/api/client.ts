const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** Clerk session JWT, or null while signed out / still loading. */
  token: string | null;
}

/**
 * Thin fetch wrapper: attaches the Bearer token, JSON-encodes the body,
 * and turns non-2xx responses into a catchable ApiError instead of a
 * silently-resolved response the caller has to remember to check.
 */
export async function apiFetch<T>(path: string, { method = 'GET', body, token }: RequestOptions): Promise<T> {
  if (!BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not set — copy .env.example to .env and fill it in.');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new ApiError(response.status, text || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
