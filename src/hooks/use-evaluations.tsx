// src/hooks/use-evaluations.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Evaluation } from '@/lib/data';
import { mockEvaluations } from '@/lib/data'; // Import mock data
import { useAuth } from './use-auth';

interface EvaluationsContextType {
  evaluations: Evaluation[];
  isLoading: boolean;
  addEvaluation: (evaluation: Omit<Evaluation, 'id'>) => Promise<void>;
  refreshEvaluations: () => void;
}

const EvaluationsContext = createContext<EvaluationsContextType | undefined>(undefined);

export const EvaluationsProvider = ({ children }: { children: ReactNode }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();

  const fetchEvaluations = () => {
    setIsLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setEvaluations(mockEvaluations);
      setIsLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (authenticatedUser) {
        fetchEvaluations();
    }
  }, [authenticatedUser]);

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    console.log("Adding evaluation (mock):", evaluation);
    const newEvaluation = {
      ...evaluation,
      id: `eval${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvaluations(prev => [newEvaluation, ...prev]);
  };

  return (
    <EvaluationsContext.Provider value={{ evaluations, isLoading, addEvaluation, refreshEvaluations: fetchEvaluations }}>
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
