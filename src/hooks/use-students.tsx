// src/hooks/use-students.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Student } from '@/lib/data';
import { students as mockStudents } from '@/lib/data';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query
} from 'firebase/firestore';
import { useAuth } from './use-auth';

interface StudentsContextType {
  students: Student[];
  isLoading: boolean;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

// Firestore: No usar datos mock, la fuente es la colección 'students'


export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();

  // Firestore: Escuchar cambios en tiempo real de la colección 'students'
  useEffect(() => {
    if (!authenticatedUser) {
      setStudents([]);
      return;
    }
    setIsLoading(true);
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Student[];
      setStudents(studentsData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [authenticatedUser]);

  const addStudent = async (student: Omit<Student, 'id'>) => {
    await addDoc(collection(db, 'students'), student);
  };

  const updateStudent = async (updatedStudent: Student) => {
    const ref = doc(db, 'students', updatedStudent.id);
    const { id, ...data } = updatedStudent;
    await updateDoc(ref, data);
  };

  const deleteStudent = async (studentId: string) => {
    const ref = doc(db, 'students', studentId);
    await deleteDoc(ref);
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
