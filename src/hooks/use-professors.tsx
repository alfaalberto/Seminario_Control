"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { professors as initialProfessors, type Professor } from '@/lib/data';

interface ProfessorsContextType {
  professors: Professor[];
  addProfessor: (professor: Professor) => void;
  updateProfessor: (professor: Professor) => void;
  deleteProfessor: (professorId: string) => void;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professors, setProfessors] = useState<Professor[]>(initialProfessors);

  const addProfessor = (professor: Professor) => {
    setProfessors(prev => [...prev, professor]);
  };

  const updateProfessor = (updatedProfessor: Professor) => {
    setProfessors(prev => prev.map(p => p.id === updatedProfessor.id ? updatedProfessor : p));
  };

  const deleteProfessor = (professorId: string) => {
    setProfessors(prev => prev.filter(p => p.id !== professorId));
  };

  return (
    <ProfessorsContext.Provider value={{ professors, addProfessor, updateProfessor, deleteProfessor }}>
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
