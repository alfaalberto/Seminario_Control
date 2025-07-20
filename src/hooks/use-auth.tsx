// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Professor } from '@/lib/data';
import { getUserById } from '@/lib/firestore'; // We'll use this to re-validate the user

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
    const checkUserSession = async () => {
      try {
        const storedUserId = localStorage.getItem('authenticatedUserId');
        if (storedUserId) {
          // Re-fetch user from Firestore to ensure data is fresh
          const userFromDb = await getUserById(storedUserId);
          if (userFromDb) {
            setAuthenticatedUser(userFromDb);
          } else {
            // User not found in DB, clear session
            localStorage.removeItem('authenticatedUserId');
          }
        }
      } catch (error) {
        console.error("Failed to process user session", error);
        localStorage.removeItem('authenticatedUserId');
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkUserSession();
  }, []);

  const login = (user: Professor) => {
    setAuthenticatedUser(user);
    localStorage.setItem('authenticatedUserId', user.id);
  };

  const logout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem('authenticatedUserId');
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