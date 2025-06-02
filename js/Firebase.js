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

// Firebase Initialization (should be in Fireb

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Improved Cart Manager with Error Handling
class CartManager {
  static CART_KEY = "cartItems_v2"; // Changed key to avoid conflicts with old data

  static getCart() {
    try {
      const cart = localStorage.getItem(this.CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error("Failed to read cart:", error);
      localStorage.removeItem(this.CART_KEY); // Clear corrupt data
      return [];
    }
  }

  static saveCart(cartItems) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cartItems));
      return true;
    } catch (error) {
      console.error("Failed to save cart:", error);
      return false;
    }
  }

  static addItem(newItem) {
    if (!newItem || !newItem.id) {
      console.error("Invalid item format:", newItem);
      return false;
    }

    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.id === newItem.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += newItem.quantity;
    } else {
      // Validate required fields
      if (!newItem.name || !newItem.price) {
        console.error("Missing required item fields:", newItem);
        return false;
      }
      cart.push(newItem);
    }

    return this.saveCart(cart);
  }
}

// Enhanced Add to Cart Functionality
async function handleAddToCart(button) {
  try {
    // 1. Validate quantity
    const quantityElement = button.parentElement.querySelector(".quantity");
    if (!quantityElement) {
      throw new Error("Quantity element not found");
    }

    const quantity = parseInt(quantityElement.textContent);
    if (isNaN(quantity)) {
      throw new Error("Invalid quantity value");
    }
    if (quantity <= 0) {
      alert("Please select at least 1 quantity");
      return false;
    }

    // 2. Check authentication
    const user = await new Promise((resolve) => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (!user) {
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${currentUrl}`;
      return false;
    }

    // 3. Get item details with validation
    const itemElement = button.closest(".menu-item");
    if (!itemElement) {
      throw new Error("Menu item container not found");
    }

    const itemName = itemElement.querySelector(".item-name")?.textContent;
    const itemPrice = itemElement.querySelector(".item-price")?.textContent;
    const itemImage = itemElement.querySelector("img")?.src || "";
    const itemId =
      itemElement.dataset.id ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!itemName || !itemPrice) {
      throw new Error("Missing required item information");
    }

    // 4. Create cart item
    const cartItem = {
      id: itemId,
      name: itemName,
      price: itemPrice,
      quantity: quantity,
      image: itemImage,
      addedAt: new Date().toISOString(),
    };

    // 5. Add to cart
    const success = CartManager.addItem(cartItem);
    if (!success) {
      throw new Error("Failed to save item to cart");
    }

    // 6. Show success feedback
    showCartNotification(`${quantity} ${itemName} added to cart!`);
    return true;
  } catch (error) {
    console.error("Add to cart error:", error);
    showCartNotification("Failed to add item to cart", true);
    return false;
  }
}

// UI Feedback Functions
function showCartNotification(message, isError = false) {
  // Remove existing notifications
  const existing = document.querySelector(".cart-notification");
  if (existing) existing.remove();

  // Create new notification
  const notification = document.createElement("div");
  notification.className = `cart-notification ${isError ? "error" : "success"}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize Add to Cart Buttons
function initializeCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    // Remove existing listeners to prevent duplicates
    button.removeEventListener("click", handleAddToCart);
    button.addEventListener("click", () => handleAddToCart(button));
  });
}

// Add CSS for notifications
function addNotificationStyles() {
  const styleId = "cart-notification-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .cart-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: fadeIn 0.3s;
      color: white;
      transition: opacity 0.3s;
    }
    .cart-notification.success {
      background: #28a745;
    }
    .cart-notification.error {
      background: #dc3545;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize everything when DOM loads
document.addEventListener("DOMContentLoaded", () => {
  addNotificationStyles();
  initializeCartButtons();
});

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
