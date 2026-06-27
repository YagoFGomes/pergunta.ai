import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCurrentUser, loginWithCredentials, registerUser } from '@/features/auth/api/service';
import { loginCreate, meRetrieve, registerCreate } from '@/lib/api/generated/endpoints';
import { setStoredAuthTokens } from '@/lib/auth/session';

vi.mock('@/lib/api/generated/endpoints', () => ({
  loginCreate: vi.fn(),
  meRetrieve: vi.fn(),
  registerCreate: vi.fn(),
  logoutCreate: vi.fn(),
  refreshCreate: vi.fn(),
  onboardingTrialTenantCreate: vi.fn()
}));

vi.mock('@/lib/auth/session', () => ({
  clearStoredAuthTokens: vi.fn(),
  getRefreshToken: vi.fn(),
  refreshAccessTokenDirect: vi.fn(),
  setStoredAuthTokens: vi.fn()
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loginWithCredentials saves tokens and returns current user', async () => {
    vi.mocked(loginCreate).mockResolvedValue({
      access: 'access-token',
      refresh: 'refresh-token'
    } as never);

    const currentUser = {
      id: '1',
      email: 'user@example.com',
      first_name: 'User',
      last_name: 'Example',
      is_active: true,
      current_tenant: null,
      memberships: []
    };

    vi.mocked(meRetrieve).mockResolvedValue(currentUser as never);

    const result = await loginWithCredentials({
      email: 'user@example.com',
      password: '12345678'
    });

    expect(setStoredAuthTokens).toHaveBeenCalledWith({
      accessToken: 'access-token',
      refreshToken: 'refresh-token'
    });
    expect(result).toEqual(currentUser);
  });

  it('loginWithCredentials throws when backend does not return tokens', async () => {
    vi.mocked(loginCreate).mockResolvedValue({
      data: { detail: 'invalid credentials' },
      status: 400,
      headers: new Headers()
    } as never);

    await expect(
      loginWithCredentials({
        email: 'user@example.com',
        password: 'wrong'
      })
    ).rejects.toThrow('Unable to sign in.');
  });

  it('registerUser delegates payload to registerCreate', async () => {
    vi.mocked(registerCreate).mockResolvedValue({
      data: {
        id: '1',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User'
      },
      status: 201,
      headers: new Headers()
    } as never);

    await registerUser({
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      password: 'strong-pass'
    });

    expect(registerCreate).toHaveBeenCalledWith({
      email: 'new@example.com',
      first_name: 'New',
      last_name: 'User',
      password: 'strong-pass'
    });
  });

  it('fetchCurrentUser throws when endpoint returns empty payload', async () => {
    vi.mocked(meRetrieve).mockResolvedValue(null as never);

    await expect(fetchCurrentUser()).rejects.toThrow('Unable to load the current user.');
  });
});
