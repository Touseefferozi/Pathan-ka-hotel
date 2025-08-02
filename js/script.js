// General scripts for the website
import { onAuthStateChanged, auth, db } from "./auth.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
      if (!itemElement) {
        console.error(
          "Cart processing error: Could not find parent '.menu-item' element."
        );
        alert(
          "An error occurred while adding item to cart: Invalid item structure."
        );
        return;
      }

      const itemNameElement = itemElement.querySelector(".item-name");
      const itemPriceElement = itemElement.querySelector(".item-price");
      const itemImageElement = itemElement.querySelector("img");

      if (!itemNameElement || !itemPriceElement) {
        console.error(
          "Cart processing error: Could not find item name or price elements."
        );
        alert(
          "An error occurred while adding item to cart: Missing item details."
        );
        return;
      }

      const cartItem = {
        name: itemNameElement.textContent,
        price: parseFloat(itemPriceElement.textContent.replace("$", "")),
        quantity: quantity,
        image: itemImageElement?.src || "",
        addedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await addToFirestoreCart(user.uid, cartItem);

      // Also update local storage for immediate UI updates
      updateLocalCart(cartItem);

      window.location.href = "cart.html";
    } catch (error) {
      console.error("Cart processing error:", error);
      alert("An error occurred while adding item to cart");
    }
  });
});

// Add item to Firestore cart
async function addToFirestoreCart(userId, item) {
  try {
    const userCartRef = doc(db, "carts", userId);

    // Update the document by adding the new item to the items array
    await setDoc(
      userCartRef,
      {
        items: arrayUnion(item),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("Item added to Firestore cart");
  } catch (error) {
    console.error("Error adding to Firestore cart:", error);
    throw error;
  }
}

// Get user's cart from Firestore
async function getFirestoreCart(userId) {
  try {
    const userCartRef = doc(db, "carts", userId);
    const docSnap = await getDoc(userCartRef);

    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting Firestore cart:", error);
    return [];
  }
}

// Update local storage cart
function updateLocalCart(item) {
  const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  const existingIndex = cartItems.findIndex((i) => i.name === item.name);

  if (existingIndex >= 0) {
    cartItems[existingIndex].quantity += item.quantity;
  } else {
    cartItems.push(item);
  }

  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function handleLogout() {
  try {
    await signOut(auth);
    localStorage.removeItem("cartItems");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

// Initialize UI on page load
document.addEventListener("DOMContentLoaded", async function () {
  updateAuthUI();

  // If on cart page, load and display cart items
  if (window.location.pathname.includes("cart.html")) {
    await displayCartItems();
  }

  // If on checkout page, load and display order summary
  if (window.location.pathname.includes("Checkout.html")) {
    await displayOrderSummary();
    const placeOrderBtn = document.querySelector(".place-order-btn");
    if (placeOrderBtn) {
      placeOrderBtn.addEventListener("click", handlePlaceOrder);
    }
  }
});

// Display cart items on cart.html
async function displayCartItems() {
  const cartContainer = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");

  if (!cartContainer) return;

  const user = await getCurrentUser();
  let cartItems = [];

  if (user) {
    // Get items from Firestore
    cartItems = await getFirestoreCart(user.uid);
  } else {
    // Fallback to local storage
    cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  }

  if (cartItems.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty</p>";
    if (totalElement) totalElement.textContent = "$0.00";
    return;
  }

  let total = 0;
  let itemsHTML = "";

  cartItems.forEach((item) => {
    const priceValue = parseFloat(item.price.replace(/[^\d.-]/g, ''));
    const itemTotal = priceValue * item.quantity;
    total += itemTotal;

    itemsHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="80">
        <div>
          <h4>${item.name}</h4>
          <p>$${priceValue.toFixed(2)} × ${item.quantity}</p>
          <p>$${itemTotal.toFixed(2)}</p>
        </div>
        <div class="item-actions">
          <button class="delete-item" data-item-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = itemsHTML;
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;

  document.querySelectorAll(".delete-item").forEach(button => {
    button.addEventListener("click", function() {
      const itemId = this.dataset.itemId;
      removeItemFromCart(itemId, user ? user.uid : null);
    });
  });
}

// Remove item from cart (localStorage and Firestore)
async function removeItemFromCart(itemId, userId) {
    if (userId) {
        // Remove from Firestore
        const userCartRef = doc(db, "carts", userId);
        const docSnap = await getDoc(userCartRef);
        if (docSnap.exists()) {
            const currentItems = docSnap.data().items || [];
            const updatedItems = currentItems.filter(item => item.id !== itemId);
            await setDoc(userCartRef, { items: updatedItems, updatedAt: new Date().toISOString() }, { merge: true });
            console.log("Item removed from Firestore cart.");
        }
    }

    // Remove from local storage
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    cartItems = cartItems.filter(item => item.id !== itemId);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    
    // Refresh the cart display
    window.location.reload();
}


// Display order summary on Checkout.html
async function displayOrderSummary() {
  const orderSummaryItemsContainer = document.getElementById("order-summary-items");
  const orderTotalAmountSpan = document.getElementById("order-total-amount");

  if (!orderSummaryItemsContainer || !orderTotalAmountSpan) return;

  const user = await getCurrentUser();
  let cartItems = [];

  if (user) {
    cartItems = await getFirestoreCart(user.uid);
  } else {
    cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  }

  if (cartItems.length === 0) {
    orderSummaryItemsContainer.innerHTML = "<p>Your cart is empty. Please add items before checking out.</p>";
    orderTotalAmountSpan.textContent = "$0.00";
    // Optionally disable place order button
    const placeOrderBtn = document.querySelector(".place-order-btn");
    if (placeOrderBtn) placeOrderBtn.disabled = true;
    return;
  }

  let total = 0;
  let itemsHTML = "";

  cartItems.forEach((item) => {
    const priceValue = parseFloat(item.price.replace(/[^\d.-]/g, ''));
    const itemTotal = priceValue * item.quantity;
    total += itemTotal;

    itemsHTML += `
      <div class="summary-item">
        <span>${item.name} (x${item.quantity})</span>
        <span>$${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });

  orderSummaryItemsContainer.innerHTML = itemsHTML;
  orderTotalAmountSpan.textContent = `$${total.toFixed(2)}`;
}

// Handle placing an order
async function handlePlaceOrder() {
  const user = await getCurrentUser();
  let cartItems = [];

  if (user) {
    cartItems = await getFirestoreCart(user.uid);
  } else {
    cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty. Please add items before placing an order.");
    return;
  }

  // Simulate order processing (e.g., sending to a backend)
  console.log("Placing order for user:", user ? user.uid : "Guest");
  console.log("Order details:", cartItems);

  // Clear the cart after placing the order
  if (user) {
    const userCartRef = doc(db, "carts", user.uid);
    await setDoc(userCartRef, { items: [], updatedAt: new Date().toISOString() });
    console.log("Firestore cart cleared.");
  }
  localStorage.removeItem("cartItems");
  console.log("Local cart cleared.");

  alert("Order placed successfully!");
  window.location.href = "index.html?success=OrderPlaced"; // Redirect to home or confirmation page
}

// Display success message on cart page
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get("success");

  if (successMessage) {
    const messageElement = document.createElement("div");
    messageElement.className = "alert alert-success";
    messageElement.textContent = decodeURIComponent(successMessage);

    const cartContainer =
      document.getElementById("cart-container") || document.body;
    cartContainer.insertBefore(messageElement, cartContainer.firstChild);

    setTimeout(() => {
      messageElement.remove();
      const url = new URL(window.location);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url);
    }, 5000);
  }
});

// Navbar user state management
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".login-btn");
  const signupBtn = document.querySelector(".signup-btn");
  const loggedInUserDiv = document.getElementById("loggedInUser");
  const userNameSpan = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (signupBtn) signupBtn.style.display = "none";
      if (loggedInUserDiv) loggedInUserDiv.style.display = "block";
      if (userNameSpan)
        userNameSpan.textContent = user.displayName || user.email.split("@")[0];
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (signupBtn) signupBtn.style.display = "inline-block";
      if (loggedInUserDiv) loggedInUserDiv.style.display = "none";
    }
  });

  logoutBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      localStorage.removeItem("cartItems");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
});
