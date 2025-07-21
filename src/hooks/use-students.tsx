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

const getInitialStudents = (): Student[] => {
  if (typeof window === 'undefined') {
    return mockStudents;
  }
  try {
    const storedStudents = sessionStorage.getItem('allStudents');
    return storedStudents ? JSON.parse(storedStudents) : mockStudents;
  } catch (error) {
    console.error("Failed to parse students from sessionStorage", error);
    return mockStudents;
  }
};

const updateSessionStorage = (students: Student[]) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('allStudents', JSON.stringify(students));
  }
}

export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>(getInitialStudents);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();
  
  // Initialize sessionStorage on first load if it's not already set
  useEffect(() => {
     if (typeof window !== 'undefined' && !sessionStorage.getItem('allStudents')) {
      updateSessionStorage(mockStudents);
    }
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      setIsLoading(true);
      // Simulate fetching data, which now comes from sessionStorage-backed state
      setTimeout(() => {
        setStudents(getInitialStudents());
        setIsLoading(false);
      }, 300);
    } else {
      setStudents([]);
      setIsLoading(false);
    }
  }, [authenticatedUser]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
     const newStudent = {
      ...student,
      id: `student-${Date.now()}` // Create a temporary unique ID
    };
    const updatedStudents = [...students, newStudent].sort((a, b) => a.name.localeCompare(b.name));
    setStudents(updatedStudents);
    updateSessionStorage(updatedStudents);
  };

  const updateStudent = async (updatedStudent: Student) => {
    const updatedStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    setStudents(updatedStudents);
    updateSessionStorage(updatedStudents);
  };

  const deleteStudent = async (studentId: string) => {
    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    updateSessionStorage(updatedStudents);
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
