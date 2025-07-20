// src/hooks/use-evaluations.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Evaluation } from '@/lib/data';
import { getEvaluations, addEvaluation as addEvaluationService } from '@/lib/firestore';
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

  const fetchEvaluations = useCallback(async () => {
    setIsLoading(true);
    try {
      const evaluationList = await getEvaluations();
      setEvaluations(evaluationList);
    } catch (error) {
      console.error("Error fetching evaluations from Firestore:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
        fetchEvaluations();
    }
  }, [authenticatedUser, fetchEvaluations]);

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    try {
        await addEvaluationService(evaluation);
        fetchEvaluations(); // Refresh list after adding
    } catch (error) {
        console.error("Error adding evaluation:", error);
        throw error;
    }
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
