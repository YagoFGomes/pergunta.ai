'use client';

import type { CurrentUser, Login } from '@/lib/api/generated/model';
import { clearStoredAuthTokens, getStoredAuthTokens } from '@/lib/auth/session';
import {
  fetchCurrentUser,
  loginWithCredentials,
  logoutFromApi,
  refreshSession
} from '../api/service';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const tokens = getStoredAuthTokens();

      if (!tokens) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        clearStoredAuthTokens();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login: async (credentials: Login) => {
        const currentUser = await loginWithCredentials(credentials);
        setUser(currentUser);
        return currentUser;
      },
      logout: async () => {
        await logoutFromApi();
        setUser(null);
      },
      refresh: async () => {
        await refreshSession();
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      },
      setUser
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
