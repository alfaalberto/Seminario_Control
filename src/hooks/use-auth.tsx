// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Professor } from '@/lib/data';

interface AuthContextType {
  authenticatedUser: Professor | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (user: Professor) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('authenticatedUser');
    if (storedUser) {
      setAuthenticatedUser(JSON.parse(storedUser));
    }
    setIsAuthLoading(false);
  }, []);

  const login = (user: Professor) => {
    setAuthenticatedUser(user);
    sessionStorage.setItem('authenticatedUser', JSON.stringify(user));
  };

  const logout = () => {
    setAuthenticatedUser(null);
    sessionStorage.removeItem('authenticatedUser');
  };

  const isAdmin = authenticatedUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ authenticatedUser, isAdmin, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
