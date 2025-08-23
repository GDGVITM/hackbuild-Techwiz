'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/lib/utils/cookies';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const initializeAuth = async () => {
    try {
      console.log('AuthContext - Initializing authentication...');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      // Check authentication status from server
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('AuthContext - /api/auth/me response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext - /api/auth/me response data:', data);

        if (data.authenticated && data.user) {
          console.log('AuthContext - Setting authenticated user:', data.user);
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Try to get token from localStorage if available
          const storedToken = localStorage.getItem('authToken');
          console.log('AuthContext - Stored token from localStorage:', storedToken ? 'exists' : 'not found');
          if (storedToken) {
            setToken(storedToken);
          } else {
            console.log('AuthContext - No stored token found, authentication may be incomplete');
          }
        } else {
          console.log('AuthContext - User not authenticated from server');
          // Clear any stale data
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        }
      } else {
        console.log('AuthContext - /api/auth/me failed with status:', response.status);
        // Clear any stale data
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('AuthContext - Error initializing auth:', error);
      
      // Check if it's a timeout error
      if (error.name === 'AbortError') {
        console.log('AuthContext - Authentication check timed out, checking localStorage');
        // Try to get auth data from localStorage as fallback
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        
        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('AuthContext - Using stored auth data from localStorage');
            setUser(user);
            setToken(storedToken);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('AuthContext - Error parsing stored user data:', parseError);
            // Clear invalid data
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          }
        } else {
          // Clear any stale data
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      } else {
        // Clear any stale data on other errors
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    } finally {
      console.log('AuthContext - Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = (token: string, user: AuthUser) => {
    console.log('AuthContext - Login called with:', { user, hasToken: !!token, tokenLength: token?.length });
    setUser(user);
    setToken(token);
    setIsAuthenticated(true);
    // Store token and user data in localStorage as backup
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    console.log('AuthContext - Login completed, token and user data stored in localStorage');
  };

  const logout = async () => {
    try {
      console.log('AuthContext - Logout called');
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
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  };

  const refreshAuth = async () => {
    console.log('AuthContext - Refreshing authentication...');
    await initializeAuth();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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

