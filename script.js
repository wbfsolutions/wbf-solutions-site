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
   🔷 MAIN APP INITIALIZATION
========================================================= */
window.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     🔐 NAVBAR AUTH STATE + AVATAR SYSTEM
  ========================================================= */
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const logoutLink = document.getElementById("logoutLink");
  const userName = document.getElementById("userName");
  const avatar = document.getElementById("userAvatar");

  function resetNavbar() {
    if (loginLink) loginLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "none";

    if (userName) {
      userName.style.display = "none";
      userName.textContent = "";
    }

    if (avatar) {
      avatar.style.display = "none";
      avatar.src = "imagefiles/default-avatar.png";
    }
  }

  onAuthStateChanged(auth, (user) => {

  if (!user) {
    resetNavbar();
    return;
  }

  if (loginLink) loginLink.style.display = "none";
  if (signupLink) signupLink.style.display = "none";
  if (logoutLink) logoutLink.style.display = "inline-block";

  if (userName) {
    userName.style.display = "none";
  }

  if (avatar) {
    avatar.style.display = "inline-block";

    avatar.src = "imagefiles/default-avatar.png";

    avatar.onerror = () => {
      avatar.src = "imagefiles/default-avatar.png";
    };

    avatar.onclick = () => toggleMenu();
  }
});

  onAuthStateChanged(auth, (user) => {

    const loggedIn = !!user;

    if (loggedIn) {

      if (loginLink) loginLink.style.display = "none";
      if (signupLink) signupLink.style.display = "none";
      if (logoutLink) logoutLink.style.display = "inline-block";

      if (userName) {
        userName.style.display = "none";
      }

      /* =========================
         AVATAR HANDLING (FIXED)
      ========================= */
if (avatar) {
  avatar.style.display = "inline-block";

  avatar.src = "imagefiles/default-avatar.png";

  avatar.onerror = () => {
    avatar.src = "imagefiles/default-avatar.png";
  };

  avatar.onclick = () => toggleMenu();
}

    } else {
      resetNavbar();
    }
  });

  /* =========================================================
     🚪 LOGOUT SYSTEM (TOP NAV)
  ========================================================= */
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  /* =========================================================
     📱 SIDE MENU SYSTEM
  ========================================================= */
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

  /* =========================================================
     🔑 FORGOT PASSWORD SYSTEM
  ========================================================= */
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

  /* =========================================================
     🎞 HERO SLIDER SYSTEM
  ========================================================= */
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

  /* =========================================================
     🏢 ACCOUNT TYPE TOGGLE (COMPANY FIELD)
  ========================================================= */
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
   🔐 AUTH FUNCTIONS (UNCHANGED CORE LOGIC)
========================================================= */


window.signInWithGoogle = async function () { /* unchanged */ };


/* =========================================================
   📝 SIGN UP SYSTEM (FULL FUNCTION - UNCHANGED)
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

    await setDoc(doc(db, "mailingList", userCredential.user.uid), {
      name: name,
      email: email,
      accountType: document.getElementById("accountType")?.value || "private",
      companyName: document.getElementById("companyName")?.value || null,
      country: document.getElementById("country")?.value || "",
      subscribed: document.getElementById("newsletterOptIn")?.checked || false,
      createdAt: serverTimestamp()
    });

    await sendEmailVerification(userCredential.user);
    await signOut(auth);

    if (errorBox) {
      errorBox.style.color = "#4F7CFF";
      errorBox.textContent =
        "Account created successfully!\n\nA verification email has been sent.\nPlease verify your email before logging in.";
    }

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


/* =========================================================
   🌐 GOOGLE SIGN-IN
========================================================= */
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


/* =========================================================
   🔎 SEARCH SYSTEM (UNCHANGED)
========================================================= */

const searchItems = [
  { title: "Home", url: "index.html", keywords: ["home", "main"] },
  { title: "Portfolio", url: "portfolio.html", keywords: ["portfolio", "projects", "work", "cad"] },
  { title: "Store", url: "store.html", keywords: ["store", "shop", "buy", "files", "stl", "obj", "fbx"] },
  { title: "Contact", url: "contact.html", keywords: ["contact", "quote", "help", "email"] },
  { title: "CAD Design Service", url: "contact.html", keywords: ["cad", "design", "mechanical", "custom"] },
  { title: "3D Modeling Service", url: "contact.html", keywords: ["3d", "modeling", "render", "fbx"] },
  { title: "STL Download Files", url: "store.html", keywords: ["stl", "printable", "3d print"] },
  { title: "OBJ Model Files", url: "store.html", keywords: ["obj", "mesh"] },
  { title: "FBX Assets", url: "store.html", keywords: ["fbx", "game asset"] }
];

let lastRendered = "";

window.runSearch = function () {

  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");

  if (!input || !results) return;

  const query = input.value.trim().toLowerCase();

  if (query.length < 2) {
    results.style.display = "none";
    return;
  }

  const matches = searchItems.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.keywords.some(k => k.includes(query))
  );

  let html = "";

  if (matches.length > 0) {
    html = matches.map(item => `
      <div class="search-item" onclick="window.location.href='${item.url}'">
        ${item.title}
      </div>
    `).join("");
  } else {
    html = `<div class="search-item no-result">No results found</div>`;
  }

  if (html === lastRendered) return;

  lastRendered = html;

  results.innerHTML = html;
  results.style.display = "block";
};


/* =========================================================
   ⌨ SEARCH INPUT HANDLER (DEBOUNCED)
========================================================= */

let searchTimeout = null;

document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");

  if (!input || !results) return;

  input.addEventListener("input", () => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      runSearch();
    }, 250);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimeout);
      runSearch();
    }
  });

  document.addEventListener("click", (e) => {
    const box = document.querySelector(".nav-search");
    if (!box || !results) return;

    if (!box.contains(e.target)) {
      results.style.display = "none";
    }
  });
});