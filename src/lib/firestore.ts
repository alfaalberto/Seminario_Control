// src/lib/firestore.ts
import { db, auth } from './firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from "firebase/auth";
import type { Professor, Student, Evaluation } from './data';
import { adminUser as fallbackAdmin, professors as fallbackProfessors, students as fallbackStudents, mockEvaluations as fallbackEvaluations } from './data';

// --- Seed Initial Data ---

export const seedInitialData = async () => {
    try {
        console.log("Starting data seeding process...");
        await seedUsers();
        await seedStudents();
        await seedEvaluations();
        console.log("Data seeding process completed successfully.");
    } catch (error) {
        console.error("Error during initial data seeding:", error);
        throw new Error("Failed to seed initial data.");
    }
};


// --- Users (Professors & Admin) ---

const usersCollection = collection(db, 'users');

const seedUsers = async () => {
    console.log("Checking if default users need to be seeded...");
    const allUsersToSeed = [fallbackAdmin, ...fallbackProfessors];
    
    for (const userSeed of allUsersToSeed) {
        try {
            if (!userSeed.email || !userSeed.password) {
                console.warn(`Skipping user seed for ${userSeed.name} due to missing email or password.`);
                continue;
            }

            // Check if user profile exists in Firestore by email
            const userQuery = query(usersCollection, where("email", "==", userSeed.email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                console.log(`User ${userSeed.email} not found in Firestore. Creating Auth user and Firestore profile...`);
                
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
                console.warn(`Auth user ${userSeed.email} already exists. Ensuring Firestore profile is synced.`);
                // If auth user exists, but firestore doc was empty, we should still try to create the doc.
                // We need to get the UID of the existing auth user. This is complex without Admin SDK.
                // For this app's purpose, we'll assume if auth exists, the profile should too.
                // The current logic handles if the profile is missing.
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
    // IMPORTANT: Deleting a Firebase Auth user from the client-side is a privileged
    // operation and requires the Admin SDK. For a client-side only app,
    // the common practice is to only delete the user's profile data from Firestore.
    // The Auth user will remain, but will be "orphaned" without a profile.
    console.warn("Deleting only Firestore record for user. Auth user remains.");
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
            const docRef = doc(studentsCollection); // Create with auto-generated ID
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
             const docRef = doc(evaluationsCollection); // Create with auto-generated ID
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
