// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '@/lib/firebase';
import { seedInitialData } from '@/lib/firestore'; // We still need this for other data
import type { Professor } from '@/lib/data';
import { useToast } from './use-toast';

interface AuthContextType {
  authenticatedUser: Professor | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (email: string, pass: string) => Promise<Professor | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<Professor | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast();
  
  // This effect will run once on mount to seed non-user data if necessary
  useEffect(() => {
    const initializeData = async () => {
        try {
            await seedInitialData();
        } catch (error) {
            console.error("Error during initial data seeding:", error);
        }
    };
    initializeData();
  }, []);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setAuthenticatedUser({ id: userDocSnap.id, ...userDocSnap.data() } as Professor);
        } else {
          setAuthenticatedUser(null);
        }
      } else {
        setFirebaseUser(null);
        setAuthenticatedUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<Professor | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = { id: userDocSnap.id, ...userDocSnap.data() } as Professor;
        setAuthenticatedUser(userProfile);
        setFirebaseUser(user);
        return userProfile;
      }
      // If user exists in Auth but not Firestore, something is wrong.
      // For a robust system, we might create the profile here. For now, we deny login.
      toast({
        variant: "destructive",
        title: "Error de Perfil",
        description: "El usuario existe pero no se encontró su perfil en la base de datos.",
      });
      await signOut(auth);
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
            description: "Ocurrió un error. Por favor, revisa la consola para más detalles.",
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

  // We remove isInitializing and pass a simplified value set
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
