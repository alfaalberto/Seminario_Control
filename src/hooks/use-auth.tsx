// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { adminUser, professors as mockProfessors, type Professor } from '@/lib/data';
import { useToast } from './use-toast';

// Simulate a delay to mimic network latency
const fakeApiCall = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

interface AuthContextType {
  authenticatedUser: Professor | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (email: string, pass: string) => Promise<Professor | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use local mock data as the base
const initialUsers: Professor[] = [
  { ...adminUser, id: 'admin' },
  ...mockProfessors.map((p, i) => ({ ...p, id: `prof-${i}`}))
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Start loading until session is checked
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem('authenticatedUser');
      if (storedUser) {
        setAuthenticatedUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from sessionStorage", error);
    }
    setIsAuthLoading(false);
  }, []);
  
  const login = async (email: string, pass: string): Promise<Professor | null> => {
    setIsAuthLoading(true);
    await fakeApiCall(500); // Simulate network delay

    // Get persisted users from session storage if they exist
    const persistedUsersString = sessionStorage.getItem('allUsers');
    const allUsers = persistedUsersString ? JSON.parse(persistedUsersString) : initialUsers;

    const foundUser = allUsers.find((user: Professor) => user.email === email && user.password === pass);

    if (foundUser) {
      setAuthenticatedUser(foundUser);
      sessionStorage.setItem('authenticatedUser', JSON.stringify(foundUser));
      setIsAuthLoading(false);
      return foundUser;
    }
    
    toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: "Las credenciales proporcionadas son incorrectas.",
    });
    setIsAuthLoading(false);
    return null;
  };

  const logout = () => {
    setAuthenticatedUser(null);
    sessionStorage.removeItem('authenticatedUser'); // Clear session storage on logout
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
