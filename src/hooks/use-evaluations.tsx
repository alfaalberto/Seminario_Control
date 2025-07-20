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
  // Initialize with an empty array for SSR consistency.
  // Data will be loaded on the client-side in useEffect.
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    // This code runs only on the client after the initial render.
    try {
      const storedEvaluations = localStorage.getItem('evaluations');
      if (storedEvaluations) {
        setEvaluations(JSON.parse(storedEvaluations));
      } else {
        // If localStorage is empty, use mock data and save it for future client-side loads.
        setEvaluations(mockEvaluations);
        localStorage.setItem('evaluations', JSON.stringify(mockEvaluations));
      }
    } catch (error) {
      console.error("Failed to load/parse evaluations from localStorage", error);
      // Fallback to mock data if there's an error during parsing.
      setEvaluations(mockEvaluations);
    }
  }, []); // Empty dependency array means this effect runs once after the initial render.

  useEffect(() => {
    // Save to localStorage whenever evaluations change, but only on the client.
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('evaluations', JSON.stringify(evaluations));
      } catch (error) {
         console.error("Failed to save evaluations to localStorage", error);
      }
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
