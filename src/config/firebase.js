import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCZ9wcj0Fp1wWWiXuZy_-ksUHyk3tgFWzM",
  authDomain: "lokl-9d6a5.firebaseapp.com",
  projectId: "lokl-9d6a5",
  storageBucket: "lokl-9d6a5.appspot.com",
  messagingSenderId: "774328469407",
  appId: "1:774328469407:web:d719ce96d5d0df07fb1faa",
  measurementId: "G-GHP5CFL3PP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export {
  auth,
  db,
  storage,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
  updateDoc,
};
