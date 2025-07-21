// scripts/seed.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { students, professors, mockEvaluations, adminUser } from '../src/lib/data';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjusaUy50vZ4Lgn9i-7IoJMqn4JRGHSvI",
  authDomain: "seminariocontrol-8ffed.firebaseapp.com",
  projectId: "seminariocontrol-8ffed",
  storageBucket: "seminariocontrol-8ffed.firebasestorage.app",
  messagingSenderId: "19125559936",
  appId: "1:19125559936:web:c3e9f69e552132a524bc65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  console.log('Seeding database...');

  // Seed students
  console.log('Seeding students...');
  for (const student of students) {
    // Using student.id as the document ID
    await setDoc(doc(db, 'students', student.id), student);
  }
  console.log('Students seeded.');

  // Seed professors
  console.log('Seeding professors...');
  // Add admin user first
  await setDoc(doc(db, 'professors', adminUser.id), adminUser);
  for (const professor of professors) {
    await setDoc(doc(db, 'professors', professor.id), professor);
  }
  console.log('Professors seeded.');

  // Seed evaluations
  console.log('Seeding evaluations...');
  for (const evaluation of mockEvaluations) {
    await setDoc(doc(db, 'evaluations', evaluation.id), evaluation);
  }
  console.log('Evaluations seeded.');
  
  console.log('Database seeding complete.');
}

seedDatabase().catch(console.error);
