// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";
import type { Professor } from '@/lib/data';
import { getUserById } from '@/lib/firestore';
import { app } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  authenticatedUser: Professor | null;
  firebaseUser: User | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (email: string, pass: string) => Promise<Professor | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const auth = getAuth(app);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        // User is signed in, now get their profile from Firestore
        const userProfile = await getUserById(user.uid);
        if (userProfile) {
          setAuthenticatedUser(userProfile);
        } else {
          // This case should ideally not happen if user creation is handled correctly.
          console.error("User exists in Auth but not in Firestore DB.");
          setAuthenticatedUser(null);
        }
      } else {
        // User is signed out
        setFirebaseUser(null);
        setAuthenticatedUser(null);
      }
      setIsAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
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
    }
  };

  const logout = async () => {
    await signOut(auth);
    setAuthenticatedUser(null);
    setFirebaseUser(null);
  };

  const isAdmin = authenticatedUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ firebaseUser, authenticatedUser, isAdmin, isAuthLoading, login, logout }}>
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
