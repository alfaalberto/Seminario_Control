// src/hooks/use-professors.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Professor } from '@/lib/data';
import { getUsers, addUser, updateUser as updateUserService, deleteUser as deleteUserService } from '@/lib/firestore';
import { useAuth } from './use-auth';


interface ProfessorsContextType {
  professors: Professor[];
  adminUser: Professor | null;
  isLoading: boolean;
  addProfessor: (professor: Omit<Professor, 'id'>) => Promise<void>;
  updateProfessor: (professor: Professor) => Promise<void>;
  deleteProfessor: (professorId: string) => Promise<void>;
  refreshProfessors: () => void;
}

const ProfessorsContext = createContext<ProfessorsContextType | undefined>(undefined);

export const ProfessorsProvider = ({ children }: { children: ReactNode }) => {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [adminUser, setAdminUser] = useState<Professor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const allUsers = await getUsers();
      const admin = allUsers.find(u => u.role === 'admin') || null;
      const regularProfessors = allUsers.filter(u => u.role !== 'admin');
      setAdminUser(admin);
      setProfessors(regularProfessors);
    } catch (error) {
      console.error("Error fetching users from Firestore:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch users only when a user is authenticated to avoid unnecessary reads.
    if (authenticatedUser) {
        fetchUsers();
    }
  }, [authenticatedUser, fetchUsers]);

  const addProfessor = async (professor: Omit<Professor, 'id'>) => {
    try {
      await addUser(professor);
      fetchUsers(); // Refresh list after adding
    } catch (error) {
       console.error("Error adding professor:", error);
       throw error;
    }
  };

  const updateProfessor = async (updatedProfessor: Professor) => {
    try {
      await updateUserService(updatedProfessor);
      fetchUsers(); // Refresh list after updating
    } catch(error) {
       console.error("Error updating user:", error);
       throw error;
    }
  };

  const deleteProfessor = async (professorId: string) => {
    try {
        await deleteUserService(professorId);
        fetchUsers(); // Refresh list after deleting
    } catch (error) {
        console.error("Error deleting professor:", error);
        throw error;
    }
  };

  return (
    <ProfessorsContext.Provider value={{ professors, adminUser, isLoading, addProfessor, updateProfessor, deleteProfessor, refreshProfessors: fetchUsers }}>
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