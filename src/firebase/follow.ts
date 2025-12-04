// src/firebase/follow.ts
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
  } from "firebase/firestore";
  import { db } from "./config";
  
  const followCollection = collection(db, "follows");
  
  /** Seguir um atleta */
  export async function followUser(followerId: string, targetId: string) {
    const ref = doc(db, "follows", `${followerId}_${targetId}`);
    await setDoc(ref, {
      followerId,
      targetId,
      createdAt: new Date(),
    });
  }
  
  /** Deixar de seguir um atleta */
  export async function unfollowUser(followerId: string, targetId: string) {
    const ref = doc(db, "follows", `${followerId}_${targetId}`);
    await deleteDoc(ref);
  }
  
  /** Verifica se o usuário já segue o atleta */
  export async function isFollowing(followerId: string, targetId: string) {
    const ref = doc(db, "follows", `${followerId}_${targetId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }
  
  /** Contar seguidores */
  export async function getFollowersCount(targetId: string) {
    const q = await getDocs(followCollection);
    return q.docs.filter((d) => d.data().targetId === targetId).length;
  }
  