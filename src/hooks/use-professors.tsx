// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Professor } from '@/lib/data';
import { adminUser as mockAdmin, professors as mockProfessors } from '@/lib/data';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { useAuth } from './use-auth';

interface ProfessorsContextType {
  professors: Professor[];
  adminUser: Professor | null;
  isLoading: boolean;
  addProfessor: (professor: Omit<Professor, 'id'>) => Promise<void>;
  updateProfessor: (professor: Professor) => Promise<void>;
  deleteProfessor: (professorId: string) => Promise<void>;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

// Firestore: No usar datos mock, la fuente es la colección 'users'



export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [allUsers, setAllUsers] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();
  
  const adminUser = allUsers.find(u => u.role === 'admin') || null;
  const professors = allUsers.filter(u => u.role === 'professor');

  // Firestore: Escuchar cambios en tiempo real de la colección 'users'
  useEffect(() => {
    if (!authenticatedUser) {
      setAllUsers([]);
      return;
    }
    setIsLoading(true);
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Professor[];
      setAllUsers(users);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [authenticatedUser]);

  const addProfessor = async (professor: Omit<Professor, 'id'>) => {
    await addDoc(collection(db, 'users'), professor);
  };

  const updateProfessor = async (updatedProfessor: Professor) => {
    const ref = doc(db, 'users', updatedProfessor.id);
    const { id, ...data } = updatedProfessor;
    await updateDoc(ref, data);
  };

  const deleteProfessor = async (professorId: string) => {
    const ref = doc(db, 'users', professorId);
    await deleteDoc(ref);
  };

  return (
    <ProfessorsContext.Provider value={{ professors, adminUser, isLoading, addProfessor, updateProfessor, deleteProfessor }}>
      {children}
    </ProfessorsContext.Provider>
  );
};

// Firestore migration complete for professors
export const useProfessors = () => {
  const context = useContext(ProfessorsContext);
  if (context === undefined) {
    throw new Error('useProfessors must be used within a ProfessorsProvider');
  }
  return context;
};
