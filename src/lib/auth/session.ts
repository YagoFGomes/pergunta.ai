import type { TokenRefreshResponse } from '@/lib/api/generated/model';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_COOKIE = 'pergunta_access_token';
const REFRESH_TOKEN_COOKIE = 'pergunta_refresh_token';
const AUTH_STORAGE_KEY = 'pergunta_auth_tokens';
const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined';
}

function readCookie(cookieName: string): string | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

function writeCookie(cookieName: string, value: string, maxAge = DEFAULT_COOKIE_MAX_AGE): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  document.cookie = [
    `${cookieName}=${encodeURIComponent(value)}`,
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${maxAge}`
  ].join('; ');
}

function deleteCookie(cookieName: string): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  document.cookie = [`${cookieName}=`, 'Path=/', 'SameSite=Lax', 'Max-Age=0'].join('; ');
}

export function getStoredAuthTokens(): AuthTokens | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const storageValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (storageValue) {
    try {
      const parsed = JSON.parse(storageValue) as AuthTokens;
      if (parsed.accessToken && parsed.refreshToken) {
        return parsed;
      }
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  const accessToken = readCookie(ACCESS_TOKEN_COOKIE);
  const refreshToken = readCookie(REFRESH_TOKEN_COOKIE);

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  return null;
}

export function setStoredAuthTokens(tokens: AuthTokens): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
  writeCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken);
  writeCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, 60 * 60 * 24 * 30);
}

export function clearStoredAuthTokens(): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  deleteCookie(ACCESS_TOKEN_COOKIE);
  deleteCookie(REFRESH_TOKEN_COOKIE);
}

export function getAccessToken(): string | null {
  return getStoredAuthTokens()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getStoredAuthTokens()?.refreshToken ?? null;
}

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
}

export async function refreshAccessTokenDirect(
  refreshToken: string
): Promise<TokenRefreshResponse> {
  const response = await fetch('/api/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh: refreshToken })
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as TokenRefreshResponse;
}
