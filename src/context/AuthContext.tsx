import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authService,
  SafeUserProfile,
  LoginCredentials,
  RegisterInput,
  RegisterResult,
} from '../services/authService';
import { ApiError } from '../services/apiClient';

interface AuthContextType {
  user: SafeUserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<SafeUserProfile>;
  register: (data: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<SafeUserProfile | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const inFlightCheckRef = React.useRef<Promise<SafeUserProfile | null> | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkSession = useCallback(async (): Promise<SafeUserProfile | null> => {
    if (inFlightCheckRef.current) {
      return inFlightCheckRef.current;
    }

    setIsLoading(true);

    const promise = (async () => {
      try {
        const profile = await authService.getMe();
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem('naba_logged_out');
          } catch {
            // Non-blocking fallback
          }
        }
        setUser(profile);
        // Ensure CSRF token is warm for future state-changing requests
        try {
          await authService.getCsrf();
        } catch {
          // Non-blocking CSRF refresh
        }
        return profile;
      } catch {
        setUser(null);
        setError(null);
        return null;
      } finally {
        setIsLoading(false);
        inFlightCheckRef.current = null;
      }
    })();

    inFlightCheckRef.current = promise;
    return promise;
  }, []);

  const refreshUser = useCallback(async (): Promise<SafeUserProfile | null> => {
    return checkSession();
  }, [checkSession]);

  // Initial session verification on boot and authoritative bfcache restoration handling
  useEffect(() => {
    // Authoritative initial server session check
    checkSession();

    // Revalidate server session when page is restored from browser Back/Forward Cache (bfcache)
    // or through history back_forward document traversal
    const handlePageShow = (event: PageTransitionEvent) => {
      let isBackForwardNav = false;
      if (typeof window !== 'undefined' && window.performance) {
        const navEntries = window.performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          isBackForwardNav =
            (navEntries[0] as PerformanceNavigationTiming).type === 'back_forward';
        }
      }

      if (event.persisted || isBackForwardNav) {
        checkSession();
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [checkSession]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<SafeUserProfile> => {
    setError(null);
    try {
      const result = await authService.login(credentials);
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('naba_logged_out');
        } catch {
          // Non-blocking fallback
        }
      }
      setUser(result.user);
      return result.user;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg = apiErr.message || 'Login failed';
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(async (data: RegisterInput): Promise<RegisterResult> => {
    setError(null);
    try {
      return await authService.register(data);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const msg = apiErr.message || 'Registration failed';
      setError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    // Immediately mark logged out and clear in-memory user and error state so no stale state persists
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('naba_logged_out', 'true');
      } catch {
        // Safe fallback
      }
    }
    setUser(null);
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
