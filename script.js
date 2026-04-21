import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.addEventListener("DOMContentLoaded", () => {

  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const logoutLink = document.getElementById("logoutLink");
  const userName = document.getElementById("userName");

  // ===============================
  // AUTH STATE
  // ===============================
  onAuthStateChanged(auth, (user) => {

    const loggedIn = !!user;

    if (loginLink) loginLink.style.display = loggedIn ? "none" : "inline-block";
    if (signupLink) signupLink.style.display = loggedIn ? "none" : "inline-block";
    if (logoutLink) logoutLink.style.display = loggedIn ? "inline-block" : "none";

    if (userName) {
      userName.style.display = loggedIn ? "inline-block" : "none";
      userName.textContent = user?.displayName || "User";
    }

  });

  // ===============================
  // LOGOUT (navbar)
  // ===============================
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // ===============================
  // SIDE MENU
  // ===============================
  window.toggleMenu = function () {

    const menu = document.getElementById("sideMenu");
    const overlay = document.getElementById("overlay");

    if (!menu || !overlay) return;

    menu.classList.toggle("open");
    overlay.classList.toggle("show");
  };

  // ===============================
  // SIDE MENU LOGOUT
  // ===============================
  const sideLogout = document.getElementById("sideLogout");

  if (sideLogout) {
    sideLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // ===============================
  // FORGOT PASSWORD
  // ===============================
  const forgotPassword = document.getElementById("forgotPassword");

  if (forgotPassword) {
    forgotPassword.addEventListener("click", async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email");
      const errorBox = document.getElementById("error");
      const successBox = document.getElementById("success");

      const email = emailInput?.value?.trim();

      if (errorBox) errorBox.textContent = "";
      if (successBox) successBox.textContent = "";

      if (!email) {
        if (errorBox) errorBox.textContent = "Enter your email first.";
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);

        if (successBox) {
          successBox.textContent = "Reset link sent to your email.";
        }

      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err.message;
        }
      }
    });
  }

  // ===============================
  // HERO SLIDER (SAFE)
  // ===============================
  const slides = document.querySelectorAll(".hero-slide");

  if (slides.length > 0) {

    let current = 0;

    slides.forEach((s, i) => {
      s.classList.toggle("active", i === 0);
    });

    setInterval(() => {

      slides[current].classList.remove("active");

      current = (current + 1) % slides.length;

      slides[current].classList.add("active");

    }, 4000);
  }

});