// auth.js - Authentication state management

// Check if user is logged in (you would typically check with your backend)
function checkLoginStatus() {
  // For demo purposes, we'll use localStorage
  // In real app, you would verify with your backend
  return localStorage.getItem("isLoggedIn") === "true";
}

// Get logged in user's name (if any)
function getLoggedInUser() {
  return localStorage.getItem("userName") || "User";
}

// Update the navbar based on login status
function updateNavbar() {
  const isLoggedIn = checkLoginStatus();
  const authButtons = document.getElementById("authButtons");
  const loggedInUser = document.getElementById("loggedInUser");
  const userNameSpan = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (isLoggedIn) {
    // Hide login/signup buttons
    authButtons.querySelector(".login-btn").style.display = "none";
    authButtons.querySelector(".signup-btn").style.display = "none";

    // Show logged in user info
    loggedInUser.style.display = "flex";
    userNameSpan.textContent = getLoggedInUser();

    // Logout button functionality
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logoutUser();
    });
  } else {
    // Show login/signup buttons
    authButtons.querySelector(".login-btn").style.display = "inline-block";
    authButtons.querySelector(".signup-btn").style.display = "inline-block";

    // Hide logged in user info
    loggedInUser.style.display = "none";
  }
}

// Login function (call this after successful login)
function loginUser(userName) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userName", userName || "User");
  updateNavbar();
}

// Logout function
function logoutUser() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userName");
  updateNavbar();
  // Redirect to home page after logout
  window.location.href = "index.html";
}

// Initialize navbar on page load
document.addEventListener("DOMContentLoaded", function () {
  updateNavbar();
});

// Example usage: Simulate login

// In login.html
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form values
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Simple validation
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  // Here you would typically send data to server for authentication
  // For demo, we'll simulate successful login
  loginUser(email.split("@")[0]); // Use the part before @ as username

  alert("Login successful! Redirecting...");

  // Redirect to home page after login
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
});

// In signup.html
document.getElementById("signupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form values
  const fullName = document.getElementById("fullName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Simple validation
  if (!fullName || !email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if (password.length < 8) {
    alert("Password must be at least 8 characters");
    return;
  }

  if (!document.getElementById("terms").checked) {
    alert("You must agree to the terms and conditions");
    return;
  }

  // Here you would typically send data to server
  // For demo, we'll simulate successful signup and login
  loginUser(fullName);

  alert("Account created successfully! Redirecting...");

  // Redirect to home page after signup
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
});
