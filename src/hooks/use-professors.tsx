// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { professors as initialProfessors, type Professor, adminUser as initialAdmin } from '@/lib/data';

interface ProfessorsContextType {
  professors: Professor[];
  adminUser: Professor;
  addProfessor: (professor: Professor) => void;
  updateProfessor: (professor: Professor) => void;
  deleteProfessor: (professorId: string) => void;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professors, setProfessors] = useState<Professor[]>(() => {
     if (typeof window === 'undefined') {
      return initialProfessors;
    }
    try {
      const storedProfessors = localStorage.getItem('professors');
      return storedProfessors ? JSON.parse(storedProfessors) : initialProfessors;
    } catch (error) {
      console.error("Failed to parse professors from localStorage", error);
      return initialProfessors;
    }
  });
  
  const [adminUser, setAdminUser] = useState<Professor>(() => {
     if (typeof window === 'undefined') {
      return initialAdmin;
    }
    try {
      const storedAdmin = localStorage.getItem('adminUser');
      return storedAdmin ? JSON.parse(storedAdmin) : initialAdmin;
    } catch (error) {
      console.error("Failed to parse admin user from localStorage", error);
      return initialAdmin;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('professors', JSON.stringify(professors));
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  }, [professors, adminUser]);

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

  const deleteProfessor = (professorId: string) => {
    setProfessors(prev => prev.filter(p => p.id !== professorId));
  };

  return (
    <ProfessorsContext.Provider value={{ professors, adminUser, addProfessor, updateProfessor, deleteProfessor }}>
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
