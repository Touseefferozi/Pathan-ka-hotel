// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBbl2BEn6dYAhig1haBftR4mVfgQscepp8",
  authDomain: "future-synapse-450311-r9.firebaseapp.com",
  projectId: "future-synapse-450311-r9",
  storageBucket: "future-synapse-450311-r9.firebasestorage.app",
  messagingSenderId: "435043783229",
  appId: "1:435043783229:web:398401abe99eac2eb8d054",
  measurementId: "G-S3XXGR0PMP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Cart Manager
class CartManager {
  static CART_KEY = "cartItems_v2";

  static getCart() {
    try {
      const cart = localStorage.getItem(this.CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (err) {
      console.error("Corrupted cart, clearing...", err);
      localStorage.removeItem(this.CART_KEY);
      return [];
    }
  }

  static saveCart(cartItems) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cartItems));
      return true;
    } catch (err) {
      console.error("Error saving cart:", err);
      return false;
    }
  }

  static addItem(newItem) {
    if (!newItem || !newItem.id || !newItem.name || !newItem.price) {
      console.error("Invalid item", newItem);
      return false;
    }

    const cart = this.getCart();
    const existing = cart.find((item) => item.id === newItem.id);

    if (existing) {
      existing.quantity += newItem.quantity;
    } else {
      cart.push(newItem);
    }

    return this.saveCart(cart);
  }
}

// Add to cart with auth check
async function handleAddToCart(button) {
  try {
    const quantityElement = button.parentElement.querySelector(".quantity");
    const quantity = parseInt(quantityElement?.textContent || 0);
    if (quantity <= 0) return alert("Select at least 1 quantity");

    const user = await new Promise((resolve) =>
      onAuthStateChanged(auth, (u) => {
        resolve(u);
      })
    );
    if (!user) {
      window.location.href = `login.html?redirect=${encodeURIComponent(
        location.href
      )}`;
      return;
    }

    const itemElement = button.closest(".menu-item");
    const name = itemElement?.querySelector(".item-name")?.textContent;
    const price = itemElement?.querySelector(".item-price")?.textContent;
    const image = itemElement?.querySelector("img")?.src || "";
    const id =
      itemElement?.dataset.id ||
      `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (!name || !price) throw new Error("Missing item info");

    const item = {
      id,
      name,
      price,
      quantity,
      image,
      addedAt: new Date().toISOString(),
    };

    if (CartManager.addItem(item)) {
      showCartNotification(`${quantity} ${name} added to cart!`);
    } else {
      throw new Error("Add to cart failed");
    }
  } catch (err) {
    console.error(err);
    showCartNotification("Failed to add item to cart", true);
  }
}

// Notifications
function showCartNotification(message, isError = false) {
  const existing = document.querySelector(".cart-notification");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = `cart-notification ${isError ? "error" : "success"}`;
  div.textContent = message;
  document.body.appendChild(div);

  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

function addNotificationStyles() {
  if (document.getElementById("cart-notification-styles")) return;
  const style = document.createElement("style");
  style.id = "cart-notification-styles";
  style.textContent = `
    .cart-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      color: white;
      transition: opacity 0.3s;
      animation: fadeIn 0.3s;
    }
    .cart-notification.success { background: #28a745; }
    .cart-notification.error { background: #dc3545; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// Attach listeners
function initializeCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.removeEventListener("click", () => handleAddToCart(button)); // Avoid duplicate binding
    button.addEventListener("click", () => handleAddToCart(button));
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  addNotificationStyles();
  initializeCartButtons();
});

// Export Firebase auth
export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
};
