// General scripts for the website

// Quantity controls functionality
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

  // Check if authButtons element exists before proceeding
  if (!authButtons) {
    console.warn(
      "Element with ID 'authButtons' not found. Navbar update skipped."
    );
    return;
  }

  if (isLoggedIn) {
    // Hide login/signup buttons
    const loginBtn = authButtons.querySelector(".login-btn");
    const signupBtn = authButtons.querySelector(".signup-btn");
    if (loginBtn) {
      loginBtn.style.display = "none";
    }
    if (signupBtn) {
      signupBtn.style.display = "none";
    }

    // Show logged in user info
    if (loggedInUser) {
      loggedInUser.style.display = "flex";
      if (userNameSpan) {
        userNameSpan.textContent = getLoggedInUser();
      }
    }

    // Logout button functionality
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        logoutUser();
      });
    }
  } else {
    // Show login/signup buttons
    const loginBtn = authButtons.querySelector(".login-btn");
    const signupBtn = authButtons.querySelector(".signup-btn");
    if (loginBtn) {
      loginBtn.style.display = "inline-block";
    }
    if (signupBtn) {
      signupBtn.style.display = "inline-block";
    }

    // Hide logged in user info
    if (loggedInUser) {
      loggedInUser.style.display = "none";
    }
  }
}

// Login function (call this after successful login)
function loginUser(userName) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userName", userName || "User");
  updateNavbar();
}


// Initialize navbar on page load
document.addEventListener("DOMContentLoaded", function () {
  updateNavbar();
});

// check out page

// close

// Quantity Control Functionality
document.querySelectorAll(".quantity-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const isPlus = this.classList.contains("plus");
    const quantityElement = this.parentElement.querySelector(".quantity");
    let quantity = parseInt(quantityElement.textContent);

    quantity = isPlus ? quantity + 1 : Math.max(0, quantity - 1);
    quantityElement.textContent = quantity;
  });
});

// Enhanced Add to Cart Functionality
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", async function () {
    try {
      // Validate quantity selection
      const quantity = parseInt(
        this.parentElement.querySelector(".quantity").textContent
      );
      if (quantity <= 0) {
        alert("Please select at least 1 quantity");
        return;
      }

      // Verify authentication status
      const user = await getCurrentUser();
      if (!user) {
        alert("Please login to add items to your cart");
        window.location.href = `login.html?redirect=${encodeURIComponent(
          window.location.href
        )}`;
        return;
      }

      // Process cart item
      const itemElement = this.closest(".menu-item");
      const cartItem = {
        name: itemElement.querySelector(".item-name").textContent,
        price: itemElement.querySelector(".item-price").textContent,
        quantity: quantity,
        image: itemElement.querySelector("img")?.src || "",
      };

      updateCart(cartItem);
      window.location.href = "cart.html";
    } catch (error) {
      console.error("Cart processing error:", error);
      alert("An error occurred while adding item to cart");
    }
  });
});

// Authentication State Management
async function updateAuthUI() {
  const authLinks = document.getElementById("auth-links");
  const user = await getCurrentUser();

  if (user) {
    authLinks.innerHTML = `
          <li class="nav-item">
              <span class="nav-link text-white">Welcome, ${
                user.displayName || "User"
              }</span>
          </li>
          <li class="nav-item">
              <button class="nav-link btn btn-link text-white" id="logout-btn">Logout</button>
          </li>
      `;

    document
      .getElementById("logout-btn")
      ?.addEventListener("click", handleLogout);
  } else {
    authLinks.innerHTML = `
          <li class="nav-item">
              <a class="nav-link text-white" href="login.html">Login</a>
          </li>
      `;
  }
}

// Helper Functions
async function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function updateCart(item) {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingIndex = cartItems.findIndex((i) => i.name === item.name);

  if (existingIndex >= 0) {
    cartItems[existingIndex].quantity += item.quantity;
  } else {
    cartItems.push(item);
  }

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

async function handleLogout() {
  try {
    await firebase.auth().signOut();
    localStorage.removeItem("cartItems");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

// Initialize UI on page load
document.addEventListener("DOMContentLoaded", updateAuthUI);
