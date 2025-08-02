import { auth } from "./Firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

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
    } catch (error) {
      alert("❌ لاگ ان کی خرابی: " + error.message);
    }
  });
}

// Authentication state UI handling
const loginBtn = document.querySelector(".login-btn");
const signupBtn = document.querySelector(".signup-btn");
const loggedInUser = document.getElementById("loggedInUser");
const userNameSpan = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  // Optional if you use it elsewhere

  if (user) {
    loginBtn && (loginBtn.style.display = "none");
    signupBtn && (signupBtn.style.display = "none");
    loggedInUser && (loggedInUser.style.display = "inline");
    userNameSpan && (userNameSpan.textContent = user.email.split("@")[0]);

    // Redirect from login/signup pages if logged in
    if (
      window.location.pathname.includes("login.html") ||
      window.location.pathname.includes("signup.html")
    ) {
      window.location.href = "index.html";
    }
  } else {
    loginBtn && (loginBtn.style.display = "inline-block");
    signupBtn && (signupBtn.style.display = "inline-block");
    loggedInUser && (loggedInUser.style.display = "none");

    // Redirect to login if on protected page
    const protectedPages = ["deshboard.html", "Checkout.html", "cart.html"];
    const isProtected = protectedPages.some((page) =>
      window.location.pathname.includes(page)
    );
    if (isProtected) {
      window.location.href = "login.html";
    }
  }
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      alert("You have been logged out.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed.");
    }
  });
}

// Export it so other files can import
