import {
  clearStoredAuthTokens,
  getAccessToken,
  getRefreshToken,
  refreshAccessTokenDirect,
  setStoredAuthTokens
} from '@/lib/auth/session';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const requestUrl = url.startsWith('http')
    ? url
    : typeof window !== 'undefined'
      ? url
      : `${normalizeBaseUrl(API_BASE_URL)}${url}`;

  const headers = new Headers(options.headers ?? {});
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const isAuthEndpoint = /\/api\/(login|refresh|logout)\/?$/.test(requestUrl);

  if (accessToken && !headers.has('Authorization') && !isAuthEndpoint) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const executeRequest = async () =>
    fetch(requestUrl, {
      ...options,
      headers
    });

  let response = await executeRequest();

  if (response.status === 401 && refreshToken && !isAuthEndpoint) {
    try {
      const refreshed = await refreshAccessTokenDirect(refreshToken);
      setStoredAuthTokens({
        accessToken: refreshed.access,
        refreshToken
      });

      headers.set('Authorization', `Bearer ${refreshed.access}`);
      response = await executeRequest();
    } catch {
      clearStoredAuthTokens();
    }
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Some endpoints can respond without a JSON body (e.g. 204).
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
