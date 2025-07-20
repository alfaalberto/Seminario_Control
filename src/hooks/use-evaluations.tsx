// src/hooks/use-evaluations.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockEvaluations, type Evaluation } from '@/lib/data';

interface EvaluationsContextType {
  evaluations: Evaluation[];
  addEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsContext = createContext<EvaluationsContextType | undefined>(undefined);

export const EvaluationsProvider = ({ children }: { children: ReactNode }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(() => {
    if (typeof window === 'undefined') {
      return mockEvaluations;
    }
    try {
      const storedEvaluations = localStorage.getItem('evaluations');
      return storedEvaluations ? JSON.parse(storedEvaluations) : mockEvaluations;
    } catch (error) {
      console.error("Failed to parse evaluations from localStorage", error);
      return mockEvaluations;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('evaluations', JSON.stringify(evaluations));
    } catch (error) {
       console.error("Failed to save evaluations to localStorage", error);
    }
  }, [evaluations]);


  const addEvaluation = (evaluation: Evaluation) => {
    setEvaluations(prev => [...prev, evaluation]);
  };

  return (
    <EvaluationsContext.Provider value={{ evaluations, addEvaluation }}>
      {children}
    </EvaluationsContext.Provider>
  );
};

export const useEvaluations = () => {
  const context = useContext(EvaluationsContext);
  if (context === undefined) {
    throw new Error('useEvaluations must be used within an EvaluationsProvider');
  }
  return context;
};
