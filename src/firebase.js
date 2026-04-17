import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmT2YyhaTJxR4pLqsNZuOw9y7mpsYnfrM",
  authDomain: "evently-9578a.firebaseapp.com",
  projectId: "evently-9578a",
  storageBucket: "evently-9578a.firebasestorage.app",
  messagingSenderId: "561926772097",
  appId: "1:561926772097:web:f7969e17d30818820ec480",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
