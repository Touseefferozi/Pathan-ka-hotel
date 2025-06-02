import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbl2BEn6dYAhig1haBftR4mVfgQscepp8",
  authDomain: "future-synapse-450311-r9.firebaseapp.com",
  projectId: "future-synapse-450311-r9",
  storageBucket: "future-synapse-450311-r9.firebasestorage.app",
  messagingSenderId: "435043783229",
  appId: "1:435043783229:web:398401abe99eac2eb8d054",
  measurementId: "G-S3XXGR0PMP",
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};
