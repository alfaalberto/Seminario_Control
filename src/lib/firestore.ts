// src/lib/firestore.ts
import { db, auth } from './firebase';
import { collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import type { Professor, Student, Evaluation } from './data';
import { adminUser as fallbackAdmin, professors as fallbackProfessors, students as fallbackStudents, mockEvaluations as fallbackEvaluations } from './data';


export const seedInitialData = async () => {
    console.log("Starting data seeding process...");
    await seedUsers();
    await seedStudents();
    await seedEvaluations();
    console.log("Data seeding process completed successfully.");
};


// --- Users (Professors & Admin) ---
const usersCollection = collection(db, 'users');

const seedUsers = async () => {
    const allUsersToSeed = [fallbackAdmin, ...fallbackProfessors];
    
    for (const userSeed of allUsersToSeed) {
        if (!userSeed.email || !userSeed.password) {
            console.warn(`Skipping user seed for ${userSeed.name} due to missing email or password.`);
            continue;
        }

        try {
            // Check if user profile exists in Firestore by email
            const userQuery = query(usersCollection, where("email", "==", userSeed.email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                console.log(`User profile for ${userSeed.email} not found. Attempting to create Auth user and Firestore profile...`);
                
                // This will create the user in Firebase Auth.
                // It might throw 'auth/email-already-in-use', which we catch below.
                const userCredential = await createUserWithEmailAndPassword(auth, userSeed.email, userSeed.password);
                const authUser = userCredential.user;

                // Create user profile in Firestore, using the UID from Auth.
                const userProfile: Professor = {
                    id: authUser.uid,
                    name: userSeed.name,
                    email: userSeed.email,
                    department: userSeed.department,
                    role: userSeed.role,
                };
                await setDoc(doc(db, 'users', authUser.uid), userProfile);
                console.log(`Successfully created user and profile for: ${userSeed.email}`);
            } else {
                 console.log(`User profile for ${userSeed.email} already exists. Seeding skipped.`);
            }

        } catch (error: any) {
            // This is a common case: Auth user exists but Firestore doc was deleted.
            if (error.code === 'auth/email-already-in-use') {
                console.warn(`Auth user ${userSeed.email} already exists, but profile was missing. Re-creating profile.`);
                try {
                    // We need the UID, so we have to sign in briefly to get it.
                    const userCredential = await signInWithEmailAndPassword(auth, userSeed.email, userSeed.password);
                    const authUser = userCredential.user;
                    
                     const userProfile: Professor = {
                        id: authUser.uid,
                        name: userSeed.name,
                        email: userSeed.email,
                        department: userSeed.department,
                        role: userSeed.role,
                    };

                    await setDoc(doc(db, 'users', authUser.uid), userProfile, { merge: true }); // Use merge to be safe
                    console.log(`Successfully re-synced profile for ${userSeed.email}`);
                    // Sign out the temporary user if it's not the currently logged-in one
                    if (auth.currentUser && auth.currentUser.uid === authUser.uid) {
                        await auth.signOut();
                    }

                } catch (syncError) {
                    console.error(`Failed to re-sync profile for ${userSeed.email}:`, syncError);
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
    // Exclude password from update object as it's not stored in Firestore
    const { password, ...userData } = user;
    await updateDoc(userDoc, { ...userData });
};

export const deleteUser = async (userId: string): Promise<void> => {
    // Client-side SDK cannot delete Auth users. This action only deletes the Firestore profile.
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
            const docRef = doc(studentsCollection);
            batch.set(docRef, { ...student, id: docRef.id });
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
             const docRef = doc(evaluationsCollection);
             batch.set(docRef, {...evaluation, id: docRef.id});
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
