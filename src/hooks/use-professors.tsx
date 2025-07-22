// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser, updatePassword, signOut } from 'firebase/auth';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

// Define a more robust Professor type that matches Firestore data
export interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'professor';
}

interface ProfessorsContextType {
  professors: Professor[];
  adminUser: Professor | null;
  isLoading: boolean;
  addProfessor: (professorData: Omit<Professor, 'id' | 'role'> & { password: string }) => Promise<void>;
  updateProfessor: (professor: Professor & { password?: string }) => Promise<void>;
  deleteProfessor: (professorId: string) => Promise<void>;
  refreshProfessors: () => void;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [allUsers, setAllUsers] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();
  const { toast } = useToast();

  const adminUser = allUsers.find(u => u.role === 'admin') || null;
  const professors = allUsers.filter(u => u.role === 'professor');

  const refreshProfessors = useCallback(async () => {
    if (!authenticatedUser) {
      setAllUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const usersColRef = collection(db, 'users');
      // Fetch both professors and admin users
      const q = query(usersColRef, where("role", "in", ["professor", "admin"]));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: Professor[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Professor[];
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching professors:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar usuarios",
        description: "No se pudieron cargar los profesores y administradores.",
      });
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedUser, toast]);

  useEffect(() => {
    refreshProfessors();
  }, [authenticatedUser, refreshProfessors]);

  const addProfessor = async (professorData: Omit<Professor, 'id' | 'role'> & { password: string }) => {
    setIsLoading(true);
    try {
      // 1. Create user in Firebase Authentication
      // This is a client-side operation for now. For production, consider using a Cloud Function
      // to create users and assign custom claims/roles more securely.
      const userCredential = await createUserWithEmailAndPassword(auth, professorData.email, professorData.password);
      const user = userCredential.user;

      // 2. Save professor profile to Firestore with role 'professor'
      await setDoc(doc(db, "users", user.uid), {
        email: professorData.email,
        name: professorData.name,
        department: professorData.department,
        role: 'professor', 
        createdAt: new Date(),
      });
      toast({
        title: "Profesor Agregado",
        description: "El nuevo profesor ha sido agregado a la lista y su cuenta creada.",
      });
      refreshProfessors(); // Refresh the list after adding
    } catch (error: any) {
      console.error("Error adding professor:", error);
      let errorMessage = "No se pudo agregar al profesor. Inténtalo de nuevo.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está registrado.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
      }
      toast({
        variant: "destructive",
        title: "Error al agregar profesor",
        description: errorMessage,
      });
      throw error; // Re-throw to allow component to handle loading state
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfessor = async (updatedProfessor: Professor & { password?: string }) => {
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", updatedProfessor.id);
      const dataToUpdate: Partial<Professor> = {
        name: updatedProfessor.name,
        email: updatedProfessor.email,
        department: updatedProfessor.department,
        // role: updatedProfessor.role, // Role update should be handled carefully, usually via admin SDK
      };

      // Handle password update if provided
      if (updatedProfessor.password) {
        // This part would ideally be handled by a Cloud Function for security
        // if an admin is updating another user's password.
        // For now, it will try to update the password of the *currently authenticated user*.
        // A proper solution would involve re-authenticating the admin user or using a Cloud Function.
        if (auth.currentUser && auth.currentUser.uid === updatedProfessor.id) {
          await updatePassword(auth.currentUser, updatedProfessor.password);
          toast({
            title: "Contraseña Actualizada",
            description: "Tu contraseña ha sido actualizada.",
          });
        } else {
          console.warn("Cannot update password for another user directly from client. Use Cloud Function.");
          toast({
            variant: "destructive",
            title: "Error de seguridad",
            description: "No puedes cambiar la contraseña de otro usuario directamente. Contacta al administrador.",
          });
           // Do not throw error, allow other data to be updated
        }
      }

      await updateDoc(userDocRef, dataToUpdate);
      toast({
        title: "Usuario Actualizado",
        description: "La información del usuario ha sido actualizada.",
      });
      refreshProfessors(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating professor:", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar usuario",
        description: "No se pudo actualizar la información del usuario. Inténtalo de nuevo.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProfessor = async (professorId: string) => {
    setIsLoading(true);
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", professorId));

      // Delete user from Firebase Authentication
      // WARNING: This client-side deleteUser only works for the *currently authenticated user*.
      // To delete other users (e.g., by an admin), you MUST use a Firebase Cloud Function
      // with the Firebase Admin SDK. Doing it directly from the client is a security risk and won't work.
      if (auth.currentUser && auth.currentUser.uid === professorId) {
        await deleteUser(auth.currentUser);
        // If the current user is deleted, they will be logged out.
        await signOut(auth); // Explicitly sign out
        toast({
            title: "Tu cuenta ha sido eliminada",
            description: "Has eliminado tu propia cuenta. Serás redirigido.",
        });
      } else {
         console.warn("Cannot delete other user from Firebase Auth directly from client. Use Cloud Function.");
         toast({
            variant: "destructive",
            title: "Error de seguridad",
            description: "No puedes eliminar la cuenta de otro usuario directamente. Contacta al administrador.",
         });
      }

      toast({
        title: "Usuario Eliminado",
        description: "El usuario ha sido eliminado de la lista.",
      });
      refreshProfessors(); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting professor:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar usuario",
        description: "No se pudo eliminar al usuario. Inténtalo de nuevo.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfessorsContext.Provider value={{ professors, adminUser, isLoading, addProfessor, updateProfessor, deleteProfessor, refreshProfessors }}>
      {children}
    </ProfessorsContext.Provider>
  );
};

export const useProfessors = () => {
  const context = useContext(ProfessorsContext);
  if (context === undefined) {
    throw new Error('useProfessors must be used within a ProfessorsProvider');
  }
  return context;
};
