import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

/* TODO: Do this type of stuff using a state manager */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
const firebase = initializeApp(firebaseConfig);

export function getFirebaseApp() {
  return firebase;
}

export function getFirebaseFirestore() {
  const firestore = getFirestore(firebase);
  connectFirestoreEmulator(firestore, "localhost", 9006);
  return firestore;
}

export function getFirebaseAuth() {
  const auth = getAuth(firebase);
  connectAuthEmulator(auth, "http://localhost:9001");
  return auth;
}

export function getFirebaseRealtimeDB() {
  const realtimeDB = getDatabase(firebase);
  connectDatabaseEmulator(realtimeDB, "localhost", 9003);
  return realtimeDB;
}
