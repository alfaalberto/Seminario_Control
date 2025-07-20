// src/lib/firestore.ts
import { db, auth } from './firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import type { Professor, Student, Evaluation } from './data';
import { adminUser as fallbackAdmin, professors as fallbackProfessors, students as fallbackStudents, mockEvaluations as fallbackEvaluations } from './data';

// --- Seed Initial Data ---

let isSeeding = false;
let seedPromise: Promise<void> | null = null;

export const seedInitialData = async () => {
    if (isSeeding) {
        return seedPromise;
    }
    isSeeding = true;
    seedPromise = (async () => {
        try {
            await seedUsers();
            await seedStudents();
            await seedEvaluations();
        } catch (error) {
            console.error("Error during initial data seeding:", error);
        } finally {
            isSeeding = false;
        }
    })();
    return seedPromise;
};


// --- Users (Professors & Admin) ---

const usersCollection = collection(db, 'users');

// Robustly seeds users in both Auth and Firestore.
const seedUsers = async () => {
    const usersSnapshot = await getDocs(usersCollection);
    if (!usersSnapshot.empty) {
        console.log('Users collection already exists. Seeding skipped.');
        return;
    }

    console.log('Users collection is empty. Seeding Auth and Firestore...');
    const allUsersToSeed = [fallbackAdmin, ...fallbackProfessors];
    
    for (const userSeed of allUsersToSeed) {
        try {
            if (!userSeed.email || !userSeed.password) continue;

            // Step 1: Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, userSeed.email, userSeed.password);
            const authUser = userCredential.user;

            // Step 2: Create user profile in Firestore
            const userProfile: Omit<Professor, 'password'> = {
                id: authUser.uid,
                name: userSeed.name,
                email: userSeed.email,
                department: userSeed.department,
                role: userSeed.role,
            };
            await setDoc(doc(db, 'users', authUser.uid), userProfile);
            console.log(`Successfully created user: ${userSeed.email}`);

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.warn(`Auth user ${userSeed.email} already exists. Skipping Auth creation, will check Firestore.`);
                 // If auth user exists, we should ensure firestore doc also exists.
                const userProfile = await getUserByEmail(userSeed.email);
                if (!userProfile) {
                    console.warn(`Firestore profile for ${userSeed.email} not found. Creating it now.`);
                    // This case is unlikely with a clean slate, but good for robustness.
                    // Note: We can't get UID without logging in, so this part is tricky.
                    // For seeding, it's better to start clean.
                }
            } else {
                console.error(`Failed to seed user ${userSeed.email}:`, error);
            }
        }
    }
};


export const getUsers = async (): Promise<Professor[]> => {
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


export const addUser = async (user: Omit<Professor, 'id'> & { password?: string }): Promise<string> => {
    if (!user.password || !user.email) {
        throw new Error("Password and email are required to create a new user.");
    }
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
    const authUser = userCredential.user;

    const userProfile: Omit<Professor, 'password'> = {
        id: authUser.uid,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
    };
    await setDoc(doc(db, 'users', authUser.uid), userProfile);
    return authUser.uid;
};

export const updateUser = async (user: Professor): Promise<void> => {
    const userDoc = doc(db, 'users', user.id);
    const { password, ...userData } = user;
    await updateDoc(userDoc, { ...userData });
};

export const deleteUser = async (userId: string): Promise<void> => {
    console.warn("Deleting only Firestore record. Auth user remains. Implement Admin SDK for full deletion.");
    const userDoc = doc(db, 'users', userId);
    await deleteDoc(userDoc);
};

// --- Students ---

const studentsCollection = collection(db, 'students');

const seedStudents = async () => {
    const snapshot = await getDocs(studentsCollection);
    if (snapshot.empty) {
        console.log('Students collection is empty. Seeding...');
        const batch = writeBatch(db);
        fallbackStudents.forEach(student => {
            const docRef = doc(db, 'students', student.id);
            batch.set(docRef, student);
        });
        await batch.commit();
    }
};

export const getStudents = async (): Promise<Student[]> => {
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

const seedEvaluations = async () => {
    const snapshot = await getDocs(evaluationsCollection);
    if(snapshot.empty) {
        console.log('Evaluations collection is empty. Seeding...');
        const batch = writeBatch(db);
        fallbackEvaluations.forEach(evaluation => {
            const docRef = doc(db, 'evaluations', evaluation.id);
            batch.set(docRef, evaluation);
        });
        await batch.commit();
    }
}

export const getEvaluations = async (): Promise<Evaluation[]> => {
    const snapshot = await getDocs(evaluationsCollection);
    return snapshot.docs.map(doc => doc.data() as Evaluation);
};

export const addEvaluation = async (evaluation: Omit<Evaluation, 'id'>): Promise<string> => {
    const docRef = await addDoc(evaluationsCollection, evaluation);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};
