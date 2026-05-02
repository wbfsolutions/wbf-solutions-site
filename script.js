/* =========================================================
   WBF SOLUTIONS - CLEAN GLOBAL SCRIPT.JS
   Supports:
   - Navbar auth state
   - Avatar / account menu
   - Logout
   - Signup
   - Google Sign In
   - Forgot password
   - Quote form (Firestore + Storage)
   - Mobile / side menus
========================================================= */

import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


/* =========================================================
   DOM READY
========================================================= */
window.addEventListener("DOMContentLoaded", () => {

  setupMenus();
  setupNavbarAuth();
  setupForgotPassword();
  setupQuoteForm();
  setupHeroSlider();
  setupAccountTypeToggle();

});


/* =========================================================
   MENU SYSTEM
========================================================= */
function setupMenus() {

  const sideMenu = document.getElementById("sideMenu");
  const accountMenu = document.getElementById("accountMenu");
  const overlay = document.querySelector(".overlay");

  window.toggleMenu = function () {
    accountMenu?.classList.remove("open");
    sideMenu?.classList.toggle("open");
    overlay?.classList.toggle("show");
  };

  window.openAccountMenu = function () {
    sideMenu?.classList.remove("open");
    accountMenu?.classList.add("open");
    overlay?.classList.add("show");
  };

  window.closeMenus = function () {
    sideMenu?.classList.remove("open");
    accountMenu?.classList.remove("open");
    overlay?.classList.remove("show");
  };

  overlay?.addEventListener("click", closeMenus);
}


/* =========================================================
   NAVBAR AUTH STATE
========================================================= */
function setupNavbarAuth() {

  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const avatar = document.getElementById("userAvatar");

  const accountAvatar = document.getElementById("accountAvatar");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");

  const accountLogout = document.getElementById("accountLogout");

  onAuthStateChanged(auth, (user) => {

    if (!user) {

      if (loginLink) loginLink.style.display = "inline-block";
      if (signupLink) signupLink.style.display = "inline-block";

      if (avatar) {
        avatar.style.display = "none";
        avatar.src = "imagefiles/default-avatar.png";
      }

      if (accountName) accountName.textContent = "Guest";
      if (accountEmail) accountEmail.textContent = "";
      if (accountAvatar) {
        accountAvatar.src = "imagefiles/default-avatar.png";
      }

      return;
    }

    // logged in
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";

    if (avatar) {
      avatar.style.display = "inline-block";
      avatar.src =
        user.photoURL || "imagefiles/default-avatar.png";

      avatar.onclick = () => {
        closeMenus();
        openAccountMenu();
      };
    }

    if (accountAvatar) {
      accountAvatar.src =
        user.photoURL || "imagefiles/default-avatar.png";
    }

    if (accountName) {
      accountName.textContent =
        user.displayName || "User";
    }

    if (accountEmail) {
      accountEmail.textContent =
        user.email || "";
    }

  });

  if (accountLogout) {
    accountLogout.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
}


/* =========================================================
   SIGNUP
========================================================= */
window.signUp = async function () {

  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confirmPassword =
    document.getElementById("confirmPassword")?.value;

  const accountType =
    document.getElementById("accountType")?.value || "private";

  const companyName =
    document.getElementById("companyName")?.value || "";

  const country =
    document.getElementById("country")?.value || "";

  const subscribed =
    document.getElementById("newsletterOptIn")?.checked || false;

  const acceptLegal =
    document.getElementById("acceptLegal");

  const errorBox = document.getElementById("error");

  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.color = "#ff6b6b";
  }

  if (!acceptLegal?.checked) {
    errorBox.textContent =
      "You must accept the Terms and Privacy Policy.";
    return;
  }

  if (!name || !email || !password || !confirmPassword) {
    errorBox.textContent =
      "Please complete all required fields.";
    return;
  }

  if (password !== confirmPassword) {
    errorBox.textContent =
      "Passwords do not match.";
    return;
  }

  try {

    const cred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await updateProfile(cred.user, {
      displayName: name
    });

    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      accountType,
      companyName,
      country,
      subscribed,
      createdAt: serverTimestamp()
    });

    await sendEmailVerification(cred.user);

    await signOut(auth);

    errorBox.style.color = "#4F7CFF";
    errorBox.textContent =
      "Account created. Verify your email before login.";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2500);

  } catch (err) {
    errorBox.textContent = err.message;
  }
};


/* =========================================================
   GOOGLE SIGN IN
========================================================= */
window.signInWithGoogle = async function () {

  try {

    const provider = new GoogleAuthProvider();

    const result =
      await signInWithPopup(auth, provider);

    const user = result.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        createdAt: serverTimestamp()
      },
      { merge: true }
    );

    window.location.href = "index.html";

  } catch (err) {
    alert(err.message);
  }
};


/* =========================================================
   FORGOT PASSWORD
========================================================= */
function setupForgotPassword() {

  const forgot =
    document.getElementById("forgotPassword");

  if (!forgot) return;

  forgot.addEventListener("click", async (e) => {

    e.preventDefault();

    const email =
      document.getElementById("email")?.value.trim();

    const errorBox =
      document.getElementById("error");

    const successBox =
      document.getElementById("success");

    if (errorBox) errorBox.textContent = "";
    if (successBox) successBox.textContent = "";

    if (!email) {
      errorBox.textContent =
        "Enter your email first.";
      return;
    }

    try {

      await sendPasswordResetEmail(auth, email);

      if (successBox) {
        successBox.textContent =
          "Password reset email sent.";
      }

    } catch (err) {
      errorBox.textContent = err.message;
    }

  });
}


/* =========================================================
   QUOTE FORM
========================================================= */
function setupQuoteForm() {

  const form = document.getElementById("quoteForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const msg =
      document.getElementById("formMessage");

    msg.textContent = "";
    msg.style.color = "#94A3B8";

    try {

      const fileInput =
        document.getElementById("projectImages");

      const files = fileInput?.files || [];

      const data = {
        name:
          document.getElementById("name")?.value.trim(),
        email:
          document.getElementById("email")?.value.trim(),
        projectTitle:
          document.getElementById("projectTitle")?.value.trim(),
        description:
          document.getElementById("description")?.value.trim(),
        dimensions:
          document.getElementById("dimensions")?.value.trim(),
        materials:
          document.getElementById("materials")?.value.trim(),
        tolerances:
          document.getElementById("tolerances")?.value.trim(),
        deadline:
          document.getElementById("deadline")?.value.trim(),
        budget:
          document.getElementById("budget")?.value.trim(),
        notes:
          document.getElementById("notes")?.value.trim(),
        fileURLs: [],
        status: "new",
        createdAt: serverTimestamp()
      };

      if (
        !data.name ||
        !data.email ||
        !data.projectTitle ||
        !data.description
      ) {
        msg.style.color = "#ff6b6b";
        msg.textContent =
          "Please fill all required fields.";
        return;
      }

      msg.textContent = "Uploading files...";

      for (let i = 0; i < files.length; i++) {

        const file = files[i];

        if (!file.type.startsWith("image/")) continue;

        const storageRef = ref(
          storage,
          `quotes/${Date.now()}_${file.name}`
        );

        const snap =
          await uploadBytes(storageRef, file);

        const url =
          await getDownloadURL(snap.ref);

        data.fileURLs.push(url);
      }

      msg.textContent = "Submitting request...";

      await addDoc(
        collection(db, "quotes"),
        data
      );

      msg.style.color = "#4F7CFF";
      msg.textContent =
        "Quote request submitted successfully.";

      form.reset();

    } catch (err) {
      msg.style.color = "#ff6b6b";
      msg.textContent = err.message;
    }

  });
}


/* =========================================================
   HERO SLIDER
========================================================= */
function setupHeroSlider() {

  const slides =
    document.querySelectorAll(".hero-slide");

  if (!slides.length) return;

  let current = 0;

  slides[0].classList.add("active");

  setInterval(() => {

    slides[current].classList.remove("active");

    current =
      (current + 1) % slides.length;

    slides[current].classList.add("active");

  }, 4000);
}


/* =========================================================
   ACCOUNT TYPE TOGGLE
========================================================= */
function setupAccountTypeToggle() {

  const type =
    document.getElementById("accountType");

  const company =
    document.getElementById("companyName");

  if (!type || !company) return;

  function run() {

    if (type.value === "company") {
      company.style.display = "block";
    } else {
      company.style.display = "none";
      company.value = "";
    }
  }

  type.addEventListener("change", run);

  run();
}

window.runMobileSearch = function () {
  const input = document.getElementById("mobileSearchInput");
  const results = document.getElementById("mobileSearchResults");

  if (!input || !results) return;

  const query = input.value.trim().toLowerCase();

  if (!query) {
    results.style.display = "none";
    return;
  }

  results.style.display = "block";
  results.innerHTML = `
    <div class="search-item">Searching for: ${query}</div>
  `;
};

// =========================================================
// ACCORDION FIX (GLOBAL SCOPE)
// =========================================================
window.toggleAccordion = function (btn) {
  const item = btn.closest(".accordion-item");
  if (!item) return;

  // close others
  document.querySelectorAll(".accordion-item").forEach(el => {
    if (el !== item) el.classList.remove("active");
  });

  // toggle current
  item.classList.toggle("active");
};

// =========================================================
// ANNOUNCEMENT BANNER SYSTEM
// =========================================================

window.showBanner = function (message, link) {
  const banner = document.getElementById("siteBanner");
  const text = document.getElementById("bannerLink");

  if (!banner || !text) return;

  text.textContent = message;
  text.href = link || "#";

  banner.classList.remove("hidden");
  document.body.classList.add("banner-active");
};

window.addEventListener("DOMContentLoaded", () => {
  showBanner("🎮 New game just dropped on Google Play — download now", "https://play.google.com/store/apps/details?id=com.wbfsolutions.bubblerun");
});