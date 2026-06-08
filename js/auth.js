import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { showToast } from './main.js';
import { fetchAndRenderWatchlist } from './db.js';

const provider = new GoogleAuthProvider();

// Login / Signup Logic
export const handleAuth = (isLogin = true) => {
  const name = document.getElementById("signup-name")?.value?.trim() || "";
  const username = document.getElementById("signup-username")?.value?.trim() || "";
  const userId = document.getElementById("signup-userid")?.value?.trim() || "";
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password")?.value || "";

  if (isLogin) {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => showToast("Logged in successfully!", "success"))
      .catch((err) => showToast(friendlyAuthError(err), "error"));
  } else {
    if (!name || !username || !userId) {
      showToast("Please fill Name, Username, and Email ID.", "error");
      return;
    }
    if (!username || !userId) {
      showToast("Please enter Username and User ID / Email.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(async ({ user }) => {
        try {
          await updateProfile(user, { displayName: username });
        } catch {}
        showToast("Account created!", "success");
      })
      .catch((err) => showToast(friendlyAuthError(err), "error"));
  }
};

// Google Login
export const handleGoogleLogin = () => {
  signInWithPopup(auth, provider)
    .then(() => showToast("Google Login Success!", "success"))
    .catch((err) => showToast(friendlyAuthError(err), "error"));
};

// Auth State Monitor
onAuthStateChanged(auth, (user) => {
  const authContainer = document.getElementById("auth-container");
  const profileContainer = document.getElementById("profile-container");
  
  if (user) {
    if(authContainer) authContainer.style.display = "none";
    if(profileContainer) profileContainer.style.display = "block";
    fetchAndRenderWatchlist();
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    if (nameEl) nameEl.textContent = user.displayName ? `Name: ${user.displayName}` : '';
    if (emailEl) emailEl.textContent = `Email: ${user.email || user.uid}`;
    if (typeof window.startQuizAfterAuth === "function") {
      window.startQuizAfterAuth();
    }
  } else {
    if(authContainer) authContainer.style.display = "block";
    if(profileContainer) profileContainer.style.display = "none";
  }
});

export const handleLogout = () => signOut(auth).then(() => showToast("Logged out.", "success"));

function friendlyAuthError(err) {
  const code = err?.code || "";
  if (code.includes("auth/unauthorized-domain")) {
    return "Firebase blocked this domain. Add your current site to Firebase Auth > Authorized domains.";
  }
  if (code.includes("auth/invalid-email")) return "Please enter a valid email address.";
  if (code.includes("auth/missing-password")) return "Please enter a password.";
  if (code.includes("auth/weak-password")) return "Password should be at least 6 characters.";
  if (code.includes("auth/email-already-in-use")) return "This email is already registered.";
  if (code.includes("auth/invalid-credential")) return "Incorrect email or password.";
  return err?.message || "Something went wrong.";
}
