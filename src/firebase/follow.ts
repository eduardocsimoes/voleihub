// src/firebase/follow.ts
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc
  } from "firebase/firestore";
  
  import { db } from "./config";
  
  /* ---------------------------------------------
     SEGUIR
  --------------------------------------------- */
  export async function followUser(followerId: string, targetId: string) {
    // adiciona em: follower -> seguindo
    await setDoc(doc(db, "users", followerId, "following", targetId), {
      uid: targetId,
      createdAt: new Date(),
    });
  
    // adiciona em: target -> seguidores
    await setDoc(doc(db, "users", targetId, "followers", followerId), {
      uid: followerId,
      createdAt: new Date(),
    });
  }
  
  /* ---------------------------------------------
     DEIXAR DE SEGUIR
  --------------------------------------------- */
  export async function unfollowUser(followerId: string, targetId: string) {
    // remove de: follower -> seguindo
    await deleteDoc(doc(db, "users", followerId, "following", targetId));
  
    // remove de: target -> seguidores
    await deleteDoc(doc(db, "users", targetId, "followers", followerId));
  }
  
  /* ---------------------------------------------
     VERIFICAR SE SEGUE
  --------------------------------------------- */
  export async function isFollowing(currentUid: string, targetUid: string) {
    const ref = doc(db, "users", currentUid, "following", targetUid);
    const snap = await getDoc(ref);
    return snap.exists();
  }
  
  /* ---------------------------------------------
     TOTAL SEGUIDORES
  --------------------------------------------- */
  export async function getFollowersCount(uid: string) {
    const colRef = collection(db, "users", uid, "followers");
    const snap = await getDocs(colRef);
    return snap.size;
  }
  
  /* ---------------------------------------------
     TOTAL SEGUINDO
  --------------------------------------------- */
  export async function getFollowingCount(uid: string) {
    const colRef = collection(db, "users", uid, "following");
    const snap = await getDocs(colRef);
    return snap.size;
  }
  
  /* ---------------------------------------------
     LISTA DE SEGUIDORES
  --------------------------------------------- */
  export interface FollowUserSummary {
    uid: string;
    name?: string;
    photoURL?: string;
    userType?: string;
  }
  
  export async function getFollowers(userId: string): Promise<FollowUserSummary[]> {
    const colRef = collection(db, "users", userId, "followers");
    const snap = await getDocs(colRef);
  
    return snap.docs.map(d => ({
      uid: d.id,
      ...(d.data() as any)
    }));
  }
  
  /* ---------------------------------------------
     LISTA DE SEGUINDO
  --------------------------------------------- */
  export async function getFollowing(userId: string): Promise<FollowUserSummary[]> {
    const colRef = collection(db, "users", userId, "following");
    const snap = await getDocs(colRef);
  
    return snap.docs.map(d => ({
      uid: d.id,
      ...(d.data() as any)
    }));
  }
  