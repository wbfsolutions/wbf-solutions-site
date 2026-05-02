console.log("🔥 Firebase loaded");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAO1tAvioumWF9OmYXmSjF_QrAIXP2DBnI",
  authDomain: "wbf-solutions.firebaseapp.com",
  projectId: "wbf-solutions",
  storageBucket: "wbf-solutions.firebasestorage.app",
  messagingSenderId: "111875431730",
  appId: "1:111875431730:web:9d46f5f79c6c2a7f208b2b",
  measurementId: "G-6BN4FV7FXC"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);