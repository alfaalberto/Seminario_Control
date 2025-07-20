// src/hooks/use-students.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';
import type { Student } from '@/lib/data';
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

  const fetchStudents = async () => {
    if (!authenticatedUser) {
        setStudents([]);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
        const studentsCollection = collection(db, "students");
        const q = query(studentsCollection, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Student));
        setStudents(studentsData);
    } catch (error) {
        console.error("Error fetching students:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [authenticatedUser]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
        await addDoc(collection(db, "students"), student);
        fetchStudents();
    } catch (error) {
        console.error("Error adding student:", error);
        throw error;
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    try {
        const studentDoc = doc(db, "students", updatedStudent.id);
        const { id, ...dataToUpdate } = updatedStudent;
        await updateDoc(studentDoc, dataToUpdate);
        fetchStudents();
    } catch (error) {
        console.error("Error updating student:", error);
        throw error;
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
        await deleteDoc(doc(db, "students", studentId));
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
