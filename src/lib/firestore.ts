// src/lib/firestore.ts
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";
import { adminUser, professors, students, mockEvaluations } from "./data";

let isSeeding = false;

// This function now only seeds non-user data. User seeding is handled by seedUsers.
export async function seedInitialData() {
  if (isSeeding) return;
  isSeeding = true;
  console.log("Starting non-user data seeding process...");

  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    if (studentsSnap.empty) {
        console.log("Seeding students and evaluations...");
        const batch = writeBatch(db);
        
        students.forEach(student => {
            const docRef = doc(collection(db, "students"));
            batch.set(docRef, student);
        });

        mockEvaluations.forEach(evaluation => {
            const docRef = doc(collection(db, "evaluations"));
            batch.set(docRef, evaluation);
        });

        await batch.commit();
        console.log("Students and evaluations seeded successfully.");
    } else {
        console.log("Student data already exists. Skipping non-user seeding.");
    }

    // We will now also seed the user accounts if they don't exist
    await seedUsers();

  } catch (error) {
    console.error("An error occurred during data seeding:", error);
  } finally {
    isSeeding = false;
  }
}

// A more robust function to create users if they don't exist in Auth.
export async function seedUsers() {
    console.log("Checking and seeding users...");
    const allUsersToSeed = [adminUser, ...professors];
    const usersCollectionRef = collection(db, "users");

    for (const userSeed of allUsersToSeed) {
        try {
            // This is a simplified check. A more robust check would query Firestore by email.
            // For this app, we assume if auth user exists, so does the profile.
            // The main goal is to create the Auth user.
            await createUserWithEmailAndPassword(auth, userSeed.email!, userSeed.password!);
            console.log(`Auth user for ${userSeed.email} did not exist and was created.`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                // This is expected and fine.
                console.log(`Auth user for ${userSeed.email} already exists.`);
            } else {
                // Log other errors
                console.error(`Error trying to create auth user ${userSeed.email}:`, error);
            }
        }
    }

    // Now, let's ensure Firestore profiles exist.
    // This is more complex because we need the UID after creation/login.
    // The current app logic fetches the profile on login, which is sufficient for now.
    // A more advanced seeding would use Firebase Admin SDK on a server.
    console.log("User check complete.");
}
