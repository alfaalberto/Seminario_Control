// src/lib/firestore.ts
import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from "firebase/firestore";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";
import { adminUser, professors, students, mockEvaluations } from "./data";

// A flag to prevent running seeding multiple times
let isSeeding = false;

// Function to seed initial data
export async function seedInitialData() {
  if (isSeeding) return;
  isSeeding = true;
  console.log("Starting data seeding process...");

  try {
    // Check if users collection is empty. If not, assume data is seeded.
    const usersSnapshot = await getDocs(collection(db, "users"));
    if (!usersSnapshot.empty) {
      console.log("Data already exists. Skipping seeding.");
      isSeeding = false;
      return;
    }

    console.log("No users found. Seeding initial data...");

    const allUsersToSeed = [adminUser, ...professors];
    const batch = writeBatch(db);

    // Create Auth users and Firestore user profiles
    for (const userSeed of allUsersToSeed) {
      try {
        // Step 1: Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, userSeed.email!, userSeed.password!);
        const authUser = userCredential.user;

        // Step 2: Create user profile in Firestore
        const userDocRef = doc(db, "users", authUser.uid);
        const { password, ...profileData } = userSeed;
        batch.set(userDocRef, profileData);

        console.log(`Successfully created Auth user and profile for ${userSeed.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`User ${userSeed.email} already exists in Auth. Skipping Auth creation.`);
          // If user exists, we still want to ensure their profile is there.
          // This requires signing in to get their UID, which is complex here.
          // For simplicity, we assume if auth exists, profile does too, based on the initial check.
        } else {
          console.error(`Error creating user ${userSeed.email}:`, error);
        }
      }
    }

    // Seed students
    for (const student of students) {
        const studentDocRef = doc(collection(db, "students"));
        batch.set(studentDocRef, student);
    }
    console.log("Students seeded.");

    // Seed evaluations
    for (const evaluation of mockEvaluations) {
        const evalDocRef = doc(collection(db, "evaluations"));
        batch.set(evalDocRef, evaluation);
    }
    console.log("Evaluations seeded.");

    // Commit the batch
    await batch.commit();
    console.log("Batch commit successful. Data seeding complete.");

  } catch (error) {
    console.error("An error occurred during the data seeding process:", error);
  } finally {
    isSeeding = false;
  }
}
