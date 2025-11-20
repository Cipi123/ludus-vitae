import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { GameState } from '../types';

// ------------------------------------------------------------------
// IMPORTANT: REPLACE WITH YOUR OWN FIREBASE CONFIG
// Get this from: https://console.firebase.google.com/
// 1. Create Project -> 2. Add Web App -> 3. Copy Config
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase (Safe check to prevent crashing if config is dummy)
let app;
let auth: any;
let db: any;
let isConfigured = false;

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigured = true;
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

export const signInWithGoogle = async (): Promise<User | null> => {
  if (!isConfigured) {
    alert("Firebase is not configured. Please update services/firebase.ts with your keys.");
    return null;
  }
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return null;
  }
};

export const logOut = async () => {
  if (!isConfigured) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  if (!isConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// --- Cloud Persistence ---

export const saveToCloud = async (userId: string, state: GameState) => {
  if (!isConfigured || !db) return;
  try {
    const userRef = doc(db, "users", userId);
    // We save the whole state object as JSON or fields
    // Convert undefineds to nulls because Firestore hates undefined
    const cleanState = JSON.parse(JSON.stringify(state)); 
    await setDoc(userRef, { 
      gameState: cleanState,
      lastUpdated: new Date().toISOString() 
    }, { merge: true });
    console.log("Synced to Cloud");
  } catch (e) {
    console.error("Cloud Save Failed", e);
  }
};

export const loadFromCloud = async (userId: string): Promise<GameState | null> => {
  if (!isConfigured || !db) return null;
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.gameState as GameState;
    }
  } catch (e) {
    console.error("Cloud Load Failed", e);
  }
  return null;
};
