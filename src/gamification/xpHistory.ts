import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export interface XPEvent {
  id: string;
  type: string;
  description: string;
  xp: number;
  date: string;
  icon?: string;
}

export async function addXPEvent(uid: string, event: XPEvent) {
  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return;

  const data = userDoc.data();
  const history = data.xpHistory || [];

  const updated = [...history, event];

  await updateDoc(userRef, {
    xpHistory: updated
  });
}
