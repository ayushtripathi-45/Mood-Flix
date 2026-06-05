import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcmOw50l99pA-H-0p6MScQlUy3NjyiAMg",
  authDomain: "movie-flix-a6cff.firebaseapp.com",
  projectId: "movie-flix-a6cff",
  storageBucket: "movie-flix-a6cff.firebasestorage.app",
  messagingSenderId: "485307953625",
  appId: "1:485307953625:web:2c1bc80a80ec6fad8fa9c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getDatabase(app); // Ab ye Realtime Database ko refer karega