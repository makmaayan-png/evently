import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export async function saveEvent(userId, eventData) {
  const docRef = await addDoc(collection(db, "events"), {
    userId,
    ...eventData,
    createdAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function getUserEvents(userId) {
  const q = query(collection(db, "events"), where("userId", "==", userId));

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
