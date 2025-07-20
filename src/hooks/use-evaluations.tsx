// src/hooks/use-evaluations.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Evaluation } from '@/lib/data';
import { mockEvaluations } from '@/lib/data';
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

  useEffect(() => {
    if (authenticatedUser) {
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        setEvaluations(mockEvaluations);
        setIsLoading(false);
      }, 500);
    } else {
      setEvaluations([]);
    }
  }, [authenticatedUser]);
  
  const refreshEvaluations = () => {
     if (authenticatedUser) {
      setIsLoading(true);
      setTimeout(() => {
        setEvaluations(mockEvaluations);
        setIsLoading(false);
      }, 300);
    }
  }

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    const newEvaluation = {
      ...evaluation,
      id: `eval-${Date.now()}` // Create a temporary unique ID
    };
    setEvaluations(prev => [newEvaluation, ...prev]);
    // Note: This change will be lost on page refresh in this mock setup.
  };

  return (
    <EvaluationsContext.Provider value={{ evaluations, isLoading, addEvaluation, refreshEvaluations }}>
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