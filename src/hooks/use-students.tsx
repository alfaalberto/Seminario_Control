// src/hooks/use-students.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Student } from '@/lib/data';
import { getStudents, addStudent as addStudentService, updateStudent as updateStudentService, deleteStudent as deleteStudentService } from '@/lib/firestore';
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


  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const studentList = await getStudents();
      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students from Firestore:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(authenticatedUser) {
        fetchStudents();
    }
  }, [authenticatedUser, fetchStudents]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
        await addStudentService(student);
        fetchStudents();
    } catch (error) {
        console.error("Error adding student:", error);
        throw error;
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
        await updateStudentService(updatedStudent);
        fetchStudents();
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
        await deleteStudentService(studentId);
        fetchStudents();
    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }
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