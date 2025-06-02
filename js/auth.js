import { auth } from "./Firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, // Import onAuthStateChanged
  signOut // Import signOut for logout functionality
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import { updateNavbar } from "./script.js"; // Import updateNavbar from script.js

// 🔒 Signup Handler
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("❌ پاس ورڈز مماثل نہیں ہیں!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ سائن اپ کامیاب!");
      window.location.href = "login.html";
    } catch (error) {
    alert("❌ سائن اپ کی خرابی: " + error.message);
    }
  });
}

// 🔓 Login Handler
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ لاگ ان کامیاب!");
      // Redirect is handled by onAuthStateChanged listener below
    } catch (error) {
    alert("❌ لاگ ان کی خرابی: " + error.message);
    }
  });
}

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
  updateNavbar(); // Call updateNavbar whenever auth state changes

  // Redirect logged-in users from login/signup pages
  if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
    window.location.href = "index.html";
  }

  // Redirect logged-out users from protected pages (e.g., dashboard, checkout)
  // Add more protected pages as needed
  const protectedPages = ['deshboard.html', 'Checkout.html', 'cart.html'];
  const isProtectedPage = protectedPages.some(page => window.location.pathname.includes(page));

  if (!user && isProtectedPage) {
      window.location.href = "login.html";
  }
});

// Handle logout globally
document.addEventListener("click", async (e) => {
    if (e.target && e.target.id === 'logoutBtn') {
        e.preventDefault();
        try {
            await signOut(auth);
            // Redirect is handled by onAuthStateChanged listener
        } catch (error) {
            alert("❌ Logout error: " + error.message);
        }
    }
});
