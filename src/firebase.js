// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}
export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function signUpEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
export async function signOut() {
  return fbSignOut(auth);
}
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

// Firestore helpers
export async function saveSheet(sheetId, payload) {
  await setDoc(doc(db, "sheets", sheetId), {
    ...payload,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
export async function getSheetOnce(sheetId) {
  const d = await getDoc(doc(db, "sheets", sheetId));
  return d.exists() ? d.data() : null;
}
export function subscribeSheet(sheetId, cb) {
  return onSnapshot(doc(db, "sheets", sheetId), snap => {
    if (snap.exists()) cb(snap.data());
    else cb(null);
  });
}
export async function updateSheet(sheetId, patch) {
  await updateDoc(doc(db, "sheets", sheetId), {
    ...patch,
    updatedAt: serverTimestamp()
  });
}
