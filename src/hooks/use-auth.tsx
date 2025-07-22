// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase'; // Import auth and db
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'professor' | 'student'; // Add 'student' role
  name?: string; // Add name field
  // Add any other user-specific fields here
}

interface AuthContextType {
  authenticatedUser: UserProfile | null;
  isAdmin: boolean;
  isAuthLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setAuthenticatedUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: userData.role,
            name: userData.name || '',
          });
        } else {
          // If no user document, assume a default role or handle error
          console.warn("User document not found for:", firebaseUser.uid);
          setAuthenticatedUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: 'student', // Default to student if no role found in Firestore
            name: firebaseUser.displayName || '',
          });
        }
      } else {
        setAuthenticatedUser(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setIsAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: userData.role,
          name: userData.name || '',
        };
        setAuthenticatedUser(userProfile);
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido, ${userProfile.name || userProfile.email}.`,
        });
        return userProfile;
      } else {
        // This case should ideally not happen if user documents are created upon registration
        console.error("User document not found after successful login:", firebaseUser.uid);
        toast({
          variant: "destructive",
          title: "Error de inicio de sesión",
          description: "No se encontró el perfil de usuario. Contacte al administrador.",
        });
        await signOut(auth); // Log out the user if profile is missing
        return null;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Ocurrió un error desconocido al iniciar sesión.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Credenciales incorrectas. Por favor, verifica tu email y contraseña.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "El formato del email es inválido.";
      }
      toast({
        variant: "destructive",
        title: "Error de inicio de sesión",
        description: errorMessage,
      });
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    setIsAuthLoading(true);
    try {
      await signOut(auth);
      setAuthenticatedUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
      });
    } finally {
      setIsAuthLoading(false);
    }
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
