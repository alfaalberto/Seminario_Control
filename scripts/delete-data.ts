import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Path to your service account key file
const serviceAccount = require("../path/to/your/serviceAccountKey.json"); // <<< IMPORTANT: Update this path!

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deleteCollection(collectionPath: string) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();

  if (snapshot.empty) {
    console.log(`No documents found in collection: ${collectionPath}`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`All documents deleted from collection: ${collectionPath}`);
}

async function deleteAllData() {
  try {
    console.log("Starting data deletion process...");
    await deleteCollection("evaluations");
    await deleteCollection("students");
    await deleteCollection("professors");
    console.log("All specified data has been deleted from Firestore.");
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}

deleteAllData();
