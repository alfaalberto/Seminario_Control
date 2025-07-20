// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import type { Professor } from '@/lib/data';
import { getUserById, seedInitialData } from '@/lib/firestore';
import { app } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  authenticatedUser: Professor | null;
  firebaseUser: User | null;
  isAdmin: boolean;
  isAuthLoading: boolean; // For session changes
  isInitializing: boolean; // For initial app setup and data seeding
  login: (email: string, pass: string) => Promise<Professor | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true); // New state
  const { toast } = useToast();

  useEffect(() => {
    // This function runs once when the app loads.
    const initializeApp = async () => {
      setIsInitializing(true);
      try {
        await seedInitialData();
        console.log("Initial data seeding process completed.");
      } catch (error) {
        console.error("Critical error during data seeding:", error);
        toast({
          variant: "destructive",
          title: "Error de Inicialización",
          description: "No se pudieron cargar los datos iniciales de la aplicación.",
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        const userProfile = await getUserById(user.uid);
        if (userProfile) {
          setAuthenticatedUser(userProfile);
        } else {
          console.error("User exists in Auth but not in Firestore DB. Logging out.");
          setAuthenticatedUser(null);
          await signOut(auth);
        }
      } else {
        setFirebaseUser(null);
        setAuthenticatedUser(null);
      }
      setIsAuthLoading(false);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const login = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const userProfile = await getUserById(user.uid);
      if (userProfile) {
        setAuthenticatedUser(userProfile);
        return userProfile;
      }
       toast({
        variant: "destructive",
        title: "Error de Perfil",
        description: "No se encontró un perfil para este usuario.",
      });
      return null;
    } catch (error: any) {
      console.error("Firebase Auth Error:", error.code);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "Las credenciales proporcionadas son incorrectas.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error Inesperado",
          description: "Ocurrió un error al intentar iniciar sesión.",
        });
      }
      return null;
    } finally {
        setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
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
