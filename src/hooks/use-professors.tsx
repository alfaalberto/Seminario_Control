// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { professors as initialProfessors, type Professor, adminUser as initialAdmin } from '@/lib/data';

interface ProfessorsContextType {
  professors: Professor[];
  adminUser: Professor;
  addProfessor: (professor: Professor) => void;
  updateProfessor: (professor: Professor) => void;
  deleteProfessor: (professorId: string) => void;
  updateAdmin: (admin: Professor) => void;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professors, setProfessors] = useState<Professor[]>(initialProfessors);
  const [adminUser, setAdminUser] = useState<Professor>(initialAdmin);

  const addProfessor = (professor: Professor) => {
    setProfessors(prev => [...prev, professor]);
  };

  const updateProfessor = (updatedProfessor: Professor) => {
    if (updatedProfessor.id === adminUser.id) {
      setAdminUser(updatedProfessor);
    } else {
      setProfessors(prev => prev.map(p => p.id === updatedProfessor.id ? updatedProfessor : p));
    }
  };
  
  const updateAdmin = useCallback((admin: Professor) => {
    setAdminUser(admin);
  }, []);

  const deleteProfessor = (professorId: string) => {
    setProfessors(prev => prev.filter(p => p.id !== professorId));
  };

  return (
    <ProfessorsContext.Provider value={{ professors, adminUser, addProfessor, updateProfessor, deleteProfessor, updateAdmin }}>
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
