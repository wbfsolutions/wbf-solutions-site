import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./firebase.js";

/* =========================================================
   MAIN INIT
========================================================= */
window.addEventListener("DOMContentLoaded", () => {

  /* =========================
     AUTH STATE
  ========================= */
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const logoutLink = document.getElementById("logoutLink");
  const userName = document.getElementById("userName");

  function resetNavbar() {
    if (loginLink) loginLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "none";

    if (userName) {
      userName.style.display = "none";
      userName.textContent = "";
    }
  }

  resetNavbar();

  onAuthStateChanged(auth, (user) => {

    const loggedIn = !!user;

    console.log("AUTH STATE:", user);

    if (loggedIn) {

      if (loginLink) loginLink.style.display = "none";
      if (signupLink) signupLink.style.display = "none";
      if (logoutLink) logoutLink.style.display = "inline-block";

      if (userName) {
        userName.style.display = "inline-block";
        userName.textContent = user.displayName || user.email || "User";
      }

    } else {
      resetNavbar();
    }
  });

  /* =========================
     LOGOUT
  ========================= */
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  /* =========================
     SIDE MENU
  ========================= */
  window.toggleMenu = function () {

    const menu = document.querySelector(".side-menu");
    const overlay = document.querySelector(".overlay");

    if (!menu || !overlay) return;

    menu.classList.toggle("open");
    overlay.classList.toggle("show");
  };

  const sideLogout = document.getElementById("sideLogout");

  if (sideLogout) {
    sideLogout.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  /* =========================
     FORGOT PASSWORD
  ========================= */
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
        if (successBox) successBox.textContent = "Reset email sent.";
      } catch (err) {
        if (errorBox) errorBox.textContent = err.message;
      }
    });
  }

  /* =========================
     HERO SLIDER
  ========================= */
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

  /* =========================
     COMPANY TOGGLE
  ========================= */
  const accountType = document.querySelector("#accountType");
  const companyField = document.querySelector("#companyName");

  if (accountType && companyField) {

    function toggleCompanyField() {
      const isCompany = accountType.value === "company";

      companyField.style.setProperty(
        "display",
        isCompany ? "block" : "none",
        "important"
      );

      if (!isCompany) {
        companyField.value = "";
      }
    }

    accountType.addEventListener("change", toggleCompanyField);
    toggleCompanyField();
  }

});

/* =========================================================
   SIGN UP FUNCTION
========================================================= */
window.signUp = async function () {

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confirmPassword = document.getElementById("confirmPassword")?.value;
  const errorBox = document.getElementById("error");

  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.color = "#ff6b6b";
  }

  const acceptLegal = document.getElementById("acceptLegal");

  if (!acceptLegal?.checked) {
    errorBox.textContent = "You must accept the Terms and Privacy Policy.";
    return;
  }

  if (!name || !email || !password || !confirmPassword) {
    errorBox.textContent = "Please fill in all required fields.";
    return;
  }

  if (password !== confirmPassword) {
    errorBox.textContent = "Passwords do not match.";
    return;
  }

  try {

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredential.user, {
      displayName: name
    });

    // SAVE TO FIRESTORE MAILING LIST
await setDoc(doc(db, "mailingList", userCredential.user.uid), {
  name: name,
  email: email,
  accountType: document.getElementById("accountType")?.value || "private",
  companyName: document.getElementById("companyName")?.value || null,
  country: document.getElementById("country")?.value || "",
  subscribed: document.getElementById("newsletterOptIn")?.checked || false,
  createdAt: serverTimestamp()
});

    // send verification email
    await sendEmailVerification(userCredential.user);

    // force logout until verified
    await signOut(auth);

    // show clear user message
    if (errorBox) {
      errorBox.style.color = "#4F7CFF";
      errorBox.textContent =
        "Account created successfully!\n\nA verification email has been sent.\nPlease verify your email before logging in.";
    }

    // redirect to login AFTER message is visible
    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);

  } catch (err) {
    console.error(err);

    if (errorBox) {
      errorBox.style.color = "#ff6b6b";
      errorBox.textContent = err.message;
    }
  }
};

window.signInWithGoogle = async function () {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    console.log("Google user:", result.user);

    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};