// src/hooks/use-students.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase'; // Import db
import { collection, doc, getDocs, setDoc, deleteDoc, query } from 'firebase/firestore'; // Import Firestore functions
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

// Define a more robust Student type that matches Firestore data
export interface Student {
  id: string;
  name: string;
  studentId: string; // Assuming a unique student ID
  program: string;
  // Add any other student-specific fields here
}

interface StudentsContextType {
  students: Student[];
  isLoading: boolean;
  addStudent: (studentData: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  refreshStudents: () => void;
}

const StudentsContext = createContext<StudentsContextType | undefined>(undefined);

export const StudentsProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authenticatedUser } = useAuth();
  const { toast } = useToast();

  const refreshStudents = useCallback(async () => {
    if (!authenticatedUser) {
      setStudents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const studentsColRef = collection(db, 'students');
      const querySnapshot = await getDocs(query(studentsColRef));
      const fetchedStudents: Student[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(fetchedStudents.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        variant: "destructive",
        title: "Error al cargar estudiantes",
        description: "No se pudieron cargar los estudiantes.",
      });
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedUser, toast]);

  useEffect(() => {
    refreshStudents();
  }, [authenticatedUser, refreshStudents]);

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    setIsLoading(true);
    try {
      // Check if a student with the same studentId already exists
      const q = query(collection(db, "students"), where("studentId", "==", studentData.studentId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("Un estudiante con este ID ya existe.");
      }

      const newDocRef = doc(collection(db, "students")); // Auto-generate ID
      await setDoc(newDocRef, {
        name: studentData.name,
        studentId: studentData.studentId,
        program: studentData.program,
        createdAt: new Date(),
      });
      toast({
        title: "Estudiante Agregado",
        description: "El nuevo estudiante ha sido agregado a la base de datos.",
      });
      refreshStudents(); // Refresh the list after adding
    } catch (error: any) {
      console.error("Error adding student:", error);
      let errorMessage = "No se pudo agregar al estudiante. Inténtalo de nuevo.";
      if (error.message.includes("este ID ya existe")) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error al agregar estudiante",
        description: errorMessage,
      });
      throw error; // Re-throw to allow component to handle loading state
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudent = async (updatedStudent: Student) => {
    setIsLoading(true);
    try {
      const studentDocRef = doc(db, "students", updatedStudent.id);
      await setDoc(studentDocRef, {
        name: updatedStudent.name,
        studentId: updatedStudent.studentId,
        program: updatedStudent.program,
      }, { merge: true }); // Use merge to update specific fields without overwriting the whole document

      toast({
        title: "Estudiante Actualizado",
        description: "La información del estudiante ha sido actualizada.",
      });
      refreshStudents(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        variant: "destructive",
        title: "Error al actualizar estudiante",
        description: "No se pudo actualizar la información del estudiante. Inténtalo de nuevo.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, "students", studentId));
      toast({
        title: "Estudiante Eliminado",
        description: "El estudiante ha sido eliminado de la lista.",
      });
      refreshStudents(); // Refresh the list after deleting
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar estudiante",
        description: "No se pudo eliminar al estudiante. Inténtalo de nuevo.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StudentsContext.Provider value={{ students, isLoading, addStudent, updateStudent, deleteStudent, refreshStudents }}>
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
