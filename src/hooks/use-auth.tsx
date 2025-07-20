// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type User as FirebaseUser } from "firebase/auth";
import { adminUser, professors, type Professor } from '@/lib/data';
import { useToast } from './use-toast';

// Simulate a delay to mimic network latency
const fakeApiCall = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

interface AuthContextType {
  authenticatedUser: Professor | null;
  firebaseUser: FirebaseUser | null; // Keep type for consistency, but it will be null
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (email: string, pass: string) => Promise<Professor | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use local mock data
const allUsers: Professor[] = [
  { ...adminUser, id: 'admin' },
  ...professors.map((p, i) => ({ ...p, id: `prof-${i}`}))
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false); // No initial loading needed
  const { toast } = useToast();
  
  const login = async (email: string, pass: string): Promise<Professor | null> => {
    setIsAuthLoading(true);
    await fakeApiCall(500); // Simulate network delay

    const foundUser = allUsers.find(user => user.email === email && user.password === pass);

    if (foundUser) {
      setAuthenticatedUser(foundUser);
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
  };

  const isAdmin = authenticatedUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ firebaseUser: null, authenticatedUser, isAdmin, isAuthLoading, login, logout }}>
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
