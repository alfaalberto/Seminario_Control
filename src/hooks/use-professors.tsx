// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Professor } from '@/lib/data';
import { adminUser as mockAdmin, professors as mockProfessors } from '@/lib/data'; // Import mock data
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

  const fetchUsers = () => {
    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setAdminUser({ ...mockAdmin, id: 'admin' });
      setProfessors(mockProfessors.map((p, i) => ({ ...p, id: `prof-${i}` })));
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (authenticatedUser) {
        fetchUsers();
    }
  }, [authenticatedUser]);

  const addProfessor = async (professor: Omit<Professor, 'id'>) => {
    const newProfessor = { ...professor, id: `prof-${Date.now()}` };
    setProfessors(prev => [...prev, newProfessor]);
    console.log("Adding professor (mock):", newProfessor);
  };

  const updateProfessor = async (updatedProfessor: Professor) => {
    setProfessors(prev => prev.map(p => p.id === updatedProfessor.id ? updatedProfessor : p));
    if (updatedProfessor.id === 'admin') {
      setAdminUser(updatedProfessor);
    }
    console.log("Updating professor (mock):", updatedProfessor);
  };

  const deleteProfessor = async (professorId: string) => {
    setProfessors(prev => prev.filter(p => p.id !== professorId));
    console.log("Deleting professor (mock):", professorId);
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
