// src/lib/firestore.ts
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';
import type { Professor, Student, Evaluation } from './data';
import { adminUser as fallbackAdmin, professors as fallbackProfessors, students as fallbackStudents, mockEvaluations as fallbackEvaluations } from './data';

// --- Users (Professors & Admin) ---

const usersCollection = collection(db, 'users');

// Seed default users if the collection is empty
export const seedUsers = async () => {
    const snapshot = await getDocs(usersCollection);
    if (snapshot.empty) {
        console.log('Users collection is empty. Seeding...');
        // Ensure the full admin user object, including password, is used for seeding.
        const allUsers = [fallbackAdmin, ...fallbackProfessors];
        for (const user of allUsers) {
            // We use user.id as the document ID
            const userDocRef = doc(db, 'users', user.id);
            // The user object from data.ts (fallbackAdmin, fallbackProfessors) contains the password.
            await setDoc(userDocRef, user);
        }
    }
};

export const getUsers = async (): Promise<Professor[]> => {
    await seedUsers(); // Ensure data exists
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => doc.data() as Professor);
};

export const getUserById = async (id: string): Promise<Professor | null> => {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as Professor : null;
};

export const getUserByEmail = async (email: string): Promise<Professor | null> => {
    const q = query(usersCollection, where("email", "==", email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data() as Professor;
};


export const addUser = async (user: Omit<Professor, 'id'>): Promise<string> => {
    const docRef = await addDoc(usersCollection, user);
    // update the document to include its own ID.
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const updateUser = async (user: Professor): Promise<void> => {
    const userDoc = doc(db, 'users', user.id);
    await updateDoc(userDoc, { ...user });
};

export const deleteUser = async (userId: string): Promise<void> => {
    const userDoc = doc(db, 'users', userId);
    await deleteDoc(userDoc);
};

// --- Students ---

const studentsCollection = collection(db, 'students');

export const seedStudents = async () => {
    const snapshot = await getDocs(studentsCollection);
    if (snapshot.empty) {
        console.log('Students collection is empty. Seeding...');
        for (const student of fallbackStudents) {
             const studentDocRef = doc(db, 'students', student.id);
             await setDoc(studentDocRef, student);
        }
    }
};

export const getStudents = async (): Promise<Student[]> => {
    await seedStudents();
    const snapshot = await getDocs(studentsCollection);
    return snapshot.docs.map(doc => doc.data() as Student);
};

export const addStudent = async (student: Omit<Student, 'id'>): Promise<string> => {
    const docRef = await addDoc(studentsCollection, student);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const updateStudent = async (student: Student): Promise<void> => {
    const studentDoc = doc(db, 'students', student.id);
    await updateDoc(studentDoc, { ...student });
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    const studentDoc = doc(db, 'students', studentId);
    await deleteDoc(studentDoc);
};


// --- Evaluations ---

const evaluationsCollection = collection(db, 'evaluations');

export const seedEvaluations = async () => {
    const snapshot = await getDocs(evaluationsCollection);
    if(snapshot.empty) {
        console.log('Evaluations collection is empty. Seeding...');
        for (const evaluation of fallbackEvaluations) {
            const evalDocRef = doc(db, 'evaluations', evaluation.id);
            await setDoc(evalDocRef, evaluation);
        }
    }
}

export const getEvaluations = async (): Promise<Evaluation[]> => {
    await seedEvaluations();
    const snapshot = await getDocs(evaluationsCollection);
    return snapshot.docs.map(doc => doc.data() as Evaluation);
};

export const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>): Promise<string> => {
    const docRef = await addDoc(evaluationsCollection, evaluation);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};
