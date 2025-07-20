// src/hooks/use-evaluations.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Evaluation } from '@/lib/data';
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

  const fetchEvaluations = async () => {
    if (!authenticatedUser) {
        setEvaluations([]);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
        const evaluationsCollection = collection(db, "evaluations");
        const q = query(evaluationsCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const evalsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Evaluation));
        setEvaluations(evalsData);
    } catch (error) {
        console.error("Error fetching evaluations:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [authenticatedUser]);

  const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>) => {
    try {
      const evaluationsCollection = collection(db, "evaluations");
      await addDoc(evaluationsCollection, evaluation);
      fetchEvaluations(); // Refresh the list after adding
    } catch (error) {
      console.error("Error adding evaluation:", error);
      throw error; // Re-throw to be caught in the component
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
