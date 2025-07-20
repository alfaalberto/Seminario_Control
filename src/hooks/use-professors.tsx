// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Professor } from '@/lib/data';
import { adminUser as mockAdmin, professors as mockProfessors } from '@/lib/data';
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
  const [allUsers, setAllUsers] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();
  
  const adminUser = allUsers.find(u => u.role === 'admin') || null;
  const professors = allUsers.filter(u => u.role === 'professor');

  const refreshProfessors = () => {
      if (authenticatedUser) {
        setIsLoading(true);
        setTimeout(() => {
           const initialUsers = [
            { ...mockAdmin, id: 'admin' },
            ...mockProfessors.map((p, i) => ({ ...p, id: `prof-${i}`}))
          ];
          setAllUsers(initialUsers);
          setIsLoading(false);
        }, 300);
      }
  }

  useEffect(() => {
    if (authenticatedUser) {
      refreshProfessors();
    } else {
      setAllUsers([]);
    }
  }, [authenticatedUser]);

  const addProfessor = async (professor: Omit<Professor, 'id'>) => {
    const newProfessor = { ...professor, id: `prof-${Date.now()}` };
    setAllUsers(prev => [...prev, newProfessor]);
  };

  const updateProfessor = async (updatedProfessor: Professor) => {
    setAllUsers(prev => prev.map(p => p.id === updatedProfessor.id ? updatedProfessor : p));
  };

  const deleteProfessor = async (professorId: string) => {
    setAllUsers(prev => prev.filter(p => p.id !== professorId));
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