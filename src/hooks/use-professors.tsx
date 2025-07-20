// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [adminUser, setAdminUser] = useState<Professor>(initialAdmin);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage only on the client side
    try {
      const storedProfessors = localStorage.getItem('professors');
      if (storedProfessors) {
        setProfessors(JSON.parse(storedProfessors));
      } else {
        setProfessors(initialProfessors);
      }
      
      const storedAdmin = localStorage.getItem('adminUser');
      if (storedAdmin) {
        setAdminUser(JSON.parse(storedAdmin));
      } else {
        setAdminUser(initialAdmin);
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage", error);
      setProfessors(initialProfessors);
      setAdminUser(initialAdmin);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever data changes, but only after initial load
    if (isLoaded) {
      try {
        localStorage.setItem('professors', JSON.stringify(professors));
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
    }
  }, [professors, adminUser, isLoaded]);

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
