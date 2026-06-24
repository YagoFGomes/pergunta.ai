const env =
  (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? {};

const API_BASE_URL =
  env.NEXT_PUBLIC_API_URL ?? env.NEXT_PUBLIC_BACKEND_API_URL ?? 'http://localhost:8000';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const requestUrl = url.startsWith('http')
    ? url
    : `${normalizeBaseUrl(API_BASE_URL)}${url}`;

  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Some endpoints can respond without a JSON body (e.g. 204).
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
