import {
  clearStoredAuthTokens,
  getAccessToken,
  getRefreshToken,
  refreshAccessTokenDirect,
  setStoredAuthTokens
} from '@/lib/auth/session';
import { createApiErrorFromResponse } from '@/features/platform/lib/api-error';

const BACKEND_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  ''
);

/**
 * Resolves the final URL for an API call.
 *
 * Browser: keeps relative path (/api/...) so requests go through the
 * Next.js catch-all proxy at src/app/api/[...path]/route.ts — same
 * origin, no CORS.
 *
 * Server (SSR/RSC): uses absolute backend URL directly (server-to-server,
 * no CORS involved).
 */
function resolveRequestUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }

  if (typeof window !== 'undefined') {
    return url; // browser — proxy handles the rest
  }

  return `${BACKEND_BASE_URL}${url}`; // server-side — go direct
}

export async function customFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const requestUrl = resolveRequestUrl(url);

  const headers = new Headers(options.headers ?? {});
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const isAuthEndpoint = /\/api\/(login|register|refresh|logout)\/?$/.test(requestUrl);

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
    throw await createApiErrorFromResponse(response, requestUrl);
  }

  // Some endpoints can respond without a JSON body (e.g. 204).
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
