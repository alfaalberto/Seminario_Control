"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockEvaluations, type Evaluation } from '@/lib/data';

interface EvaluationsContextType {
  evaluations: Evaluation[];
  addEvaluation: (evaluation: Evaluation) => void;
}

const EvaluationsContext = createContext<EvaluationsContextType | undefined>(undefined);

export const EvaluationsProvider = ({ children }: { children: ReactNode }) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);

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
