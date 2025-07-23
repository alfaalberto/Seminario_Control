// src/hooks/use-evaluations.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Evaluation } from '@/lib/data';
import { mockEvaluations } from '@/lib/data';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query
} from 'firebase/firestore';
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
    if (!authenticatedUser) {
      setEvaluations([]);
      return;
    }
    setIsLoading(true);
    const q = query(collection(db, 'evaluations'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evaluationsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Evaluation[];
      setEvaluations(evaluationsData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [authenticatedUser]);
  
  const refreshEvaluations = () => {}

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    await addDoc(collection(db, 'evaluations'), evaluation);
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