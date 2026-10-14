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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<SafeUserProfile | null> => {
    try {
      const profile = await authService.getMe();
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
      return null;
    }
  }, []);

  // Initial session verification on boot
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      try {
        const profile = await authService.getMe();
        if (isMounted) {
          setUser(profile);
          try {
            await authService.getCsrf();
          } catch {
            // Non-blocking
          }
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<SafeUserProfile> => {
    setError(null);
    try {
      const result = await authService.login(credentials);
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
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      setUser(null);
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
