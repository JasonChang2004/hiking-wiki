import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC4qSIZpDf3V_jTeLmq4LMArdIDzFLxn1o",
  authDomain: "hiking-wiki.firebaseapp.com",
  projectId: "hiking-wiki",
  storageBucket: "hiking-wiki.firebasestorage.app",
  messagingSenderId: "583216528006",
  appId: "1:583216528006:web:328433b8aa1190d4662f07",
  measurementId: "G-JJ52EW7YE7"
};

export const app = initializeApp(firebaseConfig); // ⬅️ 一定要 export app！
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const functions = getFunctions(app);
export const storage = getStorage(app);
