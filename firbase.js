import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAO1tAvioumWF9OmYXmSjF_QrAIXP2DBnI",
  authDomain: "wbf-solutions.firebaseapp.com",
  projectId: "wbf-solutions",
  storageBucket: "wbf-solutions.firebasestorage.app",
  messagingSenderId: "111875431730",
  appId: "1:111875431730:web:9d46f5f79c6c2a7f208b2b",
  measurementId: "G-6BN4FV7FXC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth (login system)
export const auth = getAuth(app);

// Database (users: name + email)
export const db = getFirestore(app);