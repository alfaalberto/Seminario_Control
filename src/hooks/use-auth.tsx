// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Professor } from '@/lib/data';
import { adminUser, professors } from '@/lib/data'; // Import mock data
import { useToast } from './use-toast';

// This is a simplified mock of Firebase User for type consistency
interface MockUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  authenticatedUser: Professor | null;
  firebaseUser: MockUser | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  isInitializing: boolean; 
  login: (email: string, pass: string) => Promise<Professor | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Combine admin and professors for login check
const allMockUsers = [
    { ...adminUser, id: 'admin', password: '123456' }, 
    ...professors.map((p, i) => ({ ...p, id: `prof-${i}`, password: 'password123' }))
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<MockUser | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false); // No async init needed now
  const { toast } = useToast();

  useEffect(() => {
    // Simulate checking for a logged-in user from a previous session
    setIsAuthLoading(false); 
  }, []);

  const login = async (email: string, pass: string): Promise<Professor | null> => {
    setIsAuthLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = allMockUsers.find(u => u.email === email && u.password === pass);

    if (foundUser) {
      const userProfile: Professor = {
        id: foundUser.id,
        name: foundUser.name,
        department: foundUser.department,
        email: foundUser.email,
        role: foundUser.role,
      };
      const mockFirebaseUser: MockUser = {
        uid: foundUser.id,
        email: foundUser.email,
      }

      setAuthenticatedUser(userProfile);
      setFirebaseUser(mockFirebaseUser);
      setIsAuthLoading(false);
      return userProfile;
    } else {
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: "Las credenciales proporcionadas son incorrectas.",
      });
      setIsAuthLoading(false);
      return null;
    }
  };

  const logout = () => {
    setAuthenticatedUser(null);
    setFirebaseUser(null);
  };

  const isAdmin = authenticatedUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ firebaseUser, authenticatedUser, isAdmin, isAuthLoading, isInitializing, login, logout }}>
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
