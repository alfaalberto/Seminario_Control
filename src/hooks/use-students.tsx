// src/hooks/use-students.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Student } from '@/lib/data';
import { students as mockStudents } from '@/lib/data';
import { useAuth } from './use-auth';

interface StudentsContextType {
  students: Student[];
  isLoading: boolean;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();

  useEffect(() => {
    if (authenticatedUser) {
      setIsLoading(true);
      // Simulate fetching data
      setTimeout(() => {
        setStudents(mockStudents);
        setIsLoading(false);
      }, 500);
    } else {
      setStudents([]);
    }
  }, [authenticatedUser]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
     const newStudent = {
      ...student,
      id: `student-${Date.now()}` // Create a temporary unique ID
    };
    setStudents(prev => [...prev, newStudent].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateStudent = async (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const deleteStudent = async (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  return (
    <StudentsContext.Provider value={{ students, isLoading, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentsContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};