'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthCookie, removeAuthCookie, setAuthCookie } from '@/lib/utils/cookies';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'business' ;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authData = getAuthCookie();
    if (authData) {
      setUser(authData.user);
      setToken(authData.token);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string, user: User) => {
    setAuthCookie(token, user);
    setUser(user);
    setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    removeAuthCookie();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
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