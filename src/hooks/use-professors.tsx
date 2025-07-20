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

const initialUsers: Professor[] = [
    { ...mockAdmin, id: 'admin' },
    ...mockProfessors.map((p, i) => ({ ...p, id: `prof-${i}`}))
];


export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [allUsers, setAllUsers] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();
  
  const adminUser = allUsers.find(u => u.role === 'admin') || null;
  const professors = allUsers.filter(u => u.role === 'professor');

  const updateSessionStorage = (users: Professor[]) => {
     sessionStorage.setItem('allUsers', JSON.stringify(users));
  }

  const refreshProfessors = () => {
      if (authenticatedUser) {
        setIsLoading(true);
        setTimeout(() => {
           const persistedUsersString = sessionStorage.getItem('allUsers');
           const users = persistedUsersString ? JSON.parse(persistedUsersString) : initialUsers;
           setAllUsers(users);
           if (!persistedUsersString) {
             updateSessionStorage(users);
           }
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
    const updatedUsers = [...allUsers, newProfessor];
    setAllUsers(updatedUsers);
    updateSessionStorage(updatedUsers);
  };

  const updateProfessor = async (updatedProfessor: Professor) => {
    const updatedUsers = allUsers.map(p => p.id === updatedProfessor.id ? updatedProfessor : p);
    setAllUsers(updatedUsers);
    updateSessionStorage(updatedUsers);
  };

  const deleteProfessor = async (professorId: string) => {
    const updatedUsers = allUsers.filter(p => p.id !== professorId);
    setAllUsers(updatedUsers);
    updateSessionStorage(updatedUsers);
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
