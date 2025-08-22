'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/lib/utils/cookies';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('AuthContext - Initializing authentication...');
        // Check authentication status from server
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        console.log('AuthContext - /api/auth/me response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('AuthContext - /api/auth/me response data:', data);
          if (data.authenticated && data.user) {
            console.log('AuthContext - Setting authenticated user:', data.user);
            setUser(data.user);
            setIsAuthenticated(true);
            // Note: Token is not accessible on client-side for security
          } else {
            console.log('AuthContext - User not authenticated from server');
          }
        } else {
          console.log('AuthContext - /api/auth/me failed with status:', response.status);
        }
      } catch (error) {
        console.error('AuthContext - Error initializing auth:', error);
      } finally {
        console.log('AuthContext - Setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (token: string, user: AuthUser) => {
    // The server sets the cookies, we just update the client state
    setUser(user);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear client-side state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } else {
        // Token refresh failed, logout user
        await logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      loading,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}