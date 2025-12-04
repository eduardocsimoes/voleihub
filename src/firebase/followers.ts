// src/firebase/followers.ts
import { db } from "./config";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export interface FollowerInfo {
  uid: string;
  name: string;
  photoURL?: string;
}

// -----------------------------
// SEGUIR ATLETA
// -----------------------------
export async function followUser(myUid: string, targetUid: string, info: FollowerInfo) {
  await setDoc(
    doc(db, "users", targetUid, "followers", myUid),
    { ...info, createdAt: serverTimestamp() }
  );

  await setDoc(
    doc(db, "users", myUid, "following", targetUid),
    { ...info, createdAt: serverTimestamp() }
  );
}

// -----------------------------
// DEIXAR DE SEGUIR
// -----------------------------
export async function unfollowUser(myUid: string, targetUid: string) {
  await deleteDoc(doc(db, "users", targetUid, "followers", myUid));
  await deleteDoc(doc(db, "users", myUid, "following", targetUid));
}

// -----------------------------
// VERIFICAR SE EU SIGO ALGUÉM
// -----------------------------
export async function isFollowing(myUid: string, targetUid: string) {
  const snap = await getDoc(doc(db, "users", myUid, "following", targetUid));
  return snap.exists();
}

// -----------------------------
// LISTA DE SEGUIDORES
// -----------------------------
export async function getFollowers(uid: string) {
  const snap = await getDocs(collection(db, "users", uid, "followers"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as FollowerInfo[];
}

// -----------------------------
// LISTA DE SEGUINDO
// -----------------------------
export async function getFollowing(uid: string) {
  const snap = await getDocs(collection(db, "users", uid, "following"));
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as FollowerInfo[];
}
