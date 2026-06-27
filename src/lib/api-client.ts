import { createApiErrorFromResponse } from '@/features/platform/lib/api-error';

const BASE_URL = '/api';

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const requestUrl = `${BASE_URL}${endpoint}`;
  const res = await fetch(requestUrl, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    throw await createApiErrorFromResponse(res, requestUrl);
  }

  return res.json() as Promise<T>;
}
