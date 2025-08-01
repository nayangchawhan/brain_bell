// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAOlEyucbW6wOSfNEEiqTAsUvtT4idOGSU",
  authDomain: "brainbell-56067.firebaseapp.com",
  databaseURL: "https://brainbell-56067-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "brainbell-56067",
  storageBucket: "brainbell-56067.firebasestorage.app",
  messagingSenderId: "927287633504",
  appId: "1:927287633504:web:8154aa3f43959e4df8c505"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);

export { auth, googleProvider, database  };
