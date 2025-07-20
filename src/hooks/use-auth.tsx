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
    // This function runs once when the app loads.
    const initializeApp = async () => {
      // It ensures our default users/students/evaluations exist before anything else happens.
      await seedInitialData();

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFirebaseUser(user);
          const userProfile = await getUserById(user.uid);
          if (userProfile) {
            setAuthenticatedUser(userProfile);
          } else {
            console.error("User exists in Auth but not in Firestore DB.");
            setAuthenticatedUser(null);
            await signOut(auth); // Log out if profile is missing
          }
        } else {
          setFirebaseUser(null);
          setAuthenticatedUser(null);
        }
        setIsAuthLoading(false);
      });
      
      // Return the unsubscribe function to be called on cleanup
      return unsubscribe;
    };

    let unsubscribe: () => void;
    initializeApp().then(unsub => {
      if (unsub) unsubscribe = unsub;
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
