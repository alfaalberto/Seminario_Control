// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Professor } from '@/lib/data';
import { useAuth } from './use-auth';

interface ProfessorsContextType {
  professors: Professor[];
  adminUser: Professor | null;
  isLoading: boolean;
  addProfessor: (professor: Omit<Professor, 'id'>) => Promise<void>;
  updateProfessor: (professor: Professor) => Promise<void>;
  deleteProfessor: (professorId: string) => Promise<void>;
  refreshProfessors: () => void;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [adminUser, setAdminUser] = useState<Professor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();

  const fetchUsers = async () => {
     if (!authenticatedUser) {
        setProfessors([]);
        setAdminUser(null);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection);
      const querySnapshot = await getDocs(q);
      const usersData: Professor[] = [];
      querySnapshot.forEach(doc => {
          usersData.push({ id: doc.id, ...doc.data() } as Professor);
      });
      
      const admin = usersData.find(u => u.role === 'admin') || null;
      const profs = usersData.filter(u => u.role === 'professor');
      
      setAdminUser(admin);
      setProfessors(profs);

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [authenticatedUser]);

  const addProfessor = async (professor: Omit<Professor, 'id'>) => {
    // Note: This only creates the Firestore record. The Auth user should be created separately.
    // For this app, we're simplifying and assuming auth user creation is handled elsewhere or not needed for this step.
    try {
      const usersCollection = collection(db, "users");
      await addDoc(usersCollection, professor);
      fetchUsers();
    } catch(error) {
       console.error("Error adding professor:", error);
       throw error;
    }
  };

  const updateProfessor = async (updatedProfessor: Professor) => {
    try {
      const professorDocRef = doc(db, "users", updatedProfessor.id);
      const { id, ...dataToUpdate } = updatedProfessor;
      await updateDoc(professorDocRef, dataToUpdate);
      fetchUsers();
    } catch (error) {
      console.error("Error updating professor:", error);
      throw error;
    }
  };

  const deleteProfessor = async (professorId: string) => {
     try {
      const professorDocRef = doc(db, "users", professorId);
      await deleteDoc(professorDocRef);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting professor:", error);
      throw error;
    }
  };

  return (
    <ProfessorsContext.Provider value={{ professors, adminUser, isLoading, addProfessor, updateProfessor, deleteProfessor, refreshProfessors: fetchUsers }}>
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
