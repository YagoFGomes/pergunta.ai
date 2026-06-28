'use client';

import {
  authRefreshClaimsCreate,
  loginCreate,
  logoutCreate,
  refreshCreate,
  meRetrieve,
  onboardingTrialTenantCreate,
  registerCreate
} from '@/lib/api/generated/endpoints';
import type {
  CurrentUser,
  ErrorResponse,
  Login,
  TokenBlacklistRequest,
  TokenPairResponse,
  TokenRefreshResponse,
  TrialTenantOnboarding
} from '@/lib/api/generated/model';
import {
  clearStoredAuthTokens,
  getRefreshToken,
  refreshAccessTokenDirect,
  setStoredAuthTokens
} from '@/lib/auth/session';

function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Authentication request failed.';
}

export async function loginWithCredentials(credentials: Login): Promise<CurrentUser> {
  const tokenPair = (await loginCreate(credentials)) as unknown as TokenPairResponse;

  if (!tokenPair?.access || !tokenPair?.refresh) {
    throw new Error('Unable to sign in.');
  }

  setStoredAuthTokens({
    accessToken: tokenPair.access,
    refreshToken: tokenPair.refresh
  });

  return await fetchCurrentUser();
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  const currentUser = (await meRetrieve()) as unknown as CurrentUser;

  if (!currentUser) {
    throw new Error('Unable to load the current user.');
  }

  return currentUser;
}

export async function refreshSession(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  try {
    const refreshedTokenPair = (await refreshCreate({
      refresh: refreshToken
    })) as unknown as TokenRefreshResponse;
    const refreshedToken = refreshedTokenPair.access;

    if (!refreshedToken) {
      throw new Error('Unable to refresh session.');
    }

    setStoredAuthTokens({
      accessToken: refreshedToken,
      refreshToken
    });
    return refreshedToken;
  } catch (error) {
    const refreshed = await refreshAccessTokenDirect(refreshToken);
    setStoredAuthTokens({
      accessToken: refreshed.access,
      refreshToken
    });
    return refreshed.access;
  }
}

export async function logoutFromApi(): Promise<void> {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await logoutCreate({ refresh: refreshToken } satisfies TokenBlacklistRequest);
    } catch (error) {
      console.warn(parseErrorMessage(error));
    }
  }

  clearStoredAuthTokens();
}

export async function registerUser(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
}): Promise<void> {
  const payload: Parameters<typeof registerCreate>[0] = {
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    password: data.password
  } as never;

  await registerCreate(payload);
}

export async function onboardTenant(data: TrialTenantOnboarding): Promise<void> {
  await onboardingTrialTenantCreate(data);
}

/**
 * Re-issues a fresh JWT pair re-reading the user's tenant memberships from the DB.
 * Must be called after onboarding só the new tenant_id claim is included in the tokens.
 * Uses POST /api/auth/refresh-claims/ which is in TenantMiddleware public_paths,
 * só it works even when the current token has tenant_id: null.
 */
export async function refreshClaims(): Promise<void> {
  const result = (await authRefreshClaimsCreate()) as unknown as {
    access: string;
    refresh: string;
  };

  if (!result?.access || !result?.refresh) {
    throw new Error('Unable to refresh JWT claims after onboarding.');
  }

  setStoredAuthTokens({ accessToken: result.access, refreshToken: result.refresh });
}
