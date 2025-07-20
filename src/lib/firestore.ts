// src/lib/firestore.ts
import { db, auth } from './firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser as deleteAuthUser } from "firebase/auth";
import type { Professor, Student, Evaluation } from './data';
import { adminUser as fallbackAdmin, professors as fallbackProfessors, students as fallbackStudents, mockEvaluations as fallbackEvaluations } from './data';

// --- Seed Initial Data ---

let isSeeding = false;
let seedPromise: Promise<void> | null = null;

export const seedInitialData = () => {
    if (!seedPromise) {
        seedPromise = (async () => {
            if (isSeeding) return;
            isSeeding = true;
            try {
                await seedUsers();
                await seedStudents();
                await seedEvaluations();
            } catch (error) {
                console.error("Error during initial data seeding:", error);
                // Re-throw the error to be caught by the caller in useAuth
                throw new Error("Failed to seed initial data.");
            } finally {
                isSeeding = false;
            }
        })();
    }
    return seedPromise;
};


// --- Users (Professors & Admin) ---

const usersCollection = collection(db, 'users');

// Robustly seeds users, ensuring the admin user and professors always exist.
const seedUsers = async () => {
    console.log("Checking if default users need to be seeded...");
    const allUsersToSeed = [fallbackAdmin, ...fallbackProfessors];
    
    for (const userSeed of allUsersToSeed) {
        try {
            if (!userSeed.email || !userSeed.password) continue;

            // Check if user profile exists in Firestore by email
            const userQuery = query(usersCollection, where("email", "==", userSeed.email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                console.log(`User ${userSeed.email} not found. Creating Auth user and Firestore profile...`);
                
                // Step 1: Create user in Firebase Authentication
                const userCredential = await createUserWithEmailAndPassword(auth, userSeed.email, userSeed.password);
                const authUser = userCredential.user;

                // Step 2: Create user profile in Firestore, using the UID from Auth as the document ID
                const userProfile: Professor = {
                    id: authUser.uid, // Use the real Auth UID
                    name: userSeed.name,
                    email: userSeed.email,
                    department: userSeed.department,
                    role: userSeed.role,
                };
                await setDoc(doc(db, 'users', authUser.uid), userProfile);
                console.log(`Successfully created user: ${userSeed.email} with UID ${authUser.uid}`);
            } else {
                 console.log(`User profile for ${userSeed.email} already exists. Seeding skipped for this user.`);
            }

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.warn(`Auth user ${userSeed.email} already exists. Skipping Auth creation.`);
                // This is not an error, the user might exist in Auth but not in Firestore,
                // The check for userSnapshot.empty() should handle creating the Firestore doc if needed.
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

    const userProfile: Professor = {
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
            const docRef = doc(collection(db, 'students')); // Create with auto-generated ID
            batch.set(docRef, { ...student, id: docRef.id }); // Add the auto-ID to the document data
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
             const docRef = doc(collection(db, 'evaluations')); // Create with auto-generated ID
             batch.set(docRef, {...evaluation, id: docRef.id}); // Add the auto-ID to the document data
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

    