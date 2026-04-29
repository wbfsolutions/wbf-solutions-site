import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    accountName.textContent = "Guest";
    return;
  }

  let name = user.displayName;

  // fallback to Firestore if missing
  if (!name) {
    const docRef = doc(db, "mailingList", user.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      name = snap.data().name;
    }
  }

  accountName.textContent = name || "User";
});

onAuthStateChanged(auth, (user) => {

  const accountAvatar = document.getElementById("accountAvatar");
  const accountName = document.getElementById("accountName");
  const accountEmail = document.getElementById("accountEmail");

  if (!user) {
    resetNavbar();

    if (accountName) accountName.textContent = "Guest";
    if (accountEmail) accountEmail.textContent = "";
    if (accountAvatar) accountAvatar.src = "imagefiles/default-avatar.png";

    return;
  }

  // NAVBAR STATE
  if (loginLink) loginLink.style.display = "none";
  if (signupLink) signupLink.style.display = "none";

  if (avatar) {
    avatar.style.display = "inline-block";
    avatar.src = user.photoURL || "imagefiles/default-avatar.png";

    avatar.onclick = () => {
      closeMenus();
      openAccountMenu();
    };
  }

  // 🔥 ACCOUNT MENU DATA (NEW)
  if (accountAvatar) {
    accountAvatar.src = user.photoURL || "imagefiles/default-avatar.png";
  }

  if (accountName) {
    accountName.textContent = user.displayName || "User";
  }

  if (accountEmail) {
    accountEmail.textContent = user.email || "";
  }
});

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
     📱 MENU SYSTEM (FIXED CLEAN VERSION)
  ========================================================= */

  window.openAccountMenu = function () {
    const menu = document.getElementById("accountMenu");
    const overlay = document.querySelector(".overlay");

    if (!menu || !overlay) return;

    menu.classList.add("open");
    overlay.classList.add("show");

    document.querySelector(".side-menu")?.classList.remove("open");
  };

  window.toggleMenu = function () {
    const menu = document.querySelector(".side-menu");
    const accountMenu = document.getElementById("accountMenu");
    const overlay = document.querySelector(".overlay");

    if (!menu || !overlay) return;

    accountMenu?.classList.remove("open");

    menu.classList.toggle("open");
    overlay.classList.toggle("show");
  };

  window.closeMenus = function () {
    document.querySelector(".side-menu")?.classList.remove("open");
    document.getElementById("accountMenu")?.classList.remove("open");
    document.querySelector(".overlay")?.classList.remove("show");
  };

  // overlay click closes everything
  document.querySelector(".overlay")?.addEventListener("click", closeMenus);

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

      // SINGLE CLEAN CLICK HANDLER
      avatar.onclick = () => {
        closeMenus();
        openAccountMenu();
      };
    }
  });

  /* =========================================================
     🚪 LOGOUT SYSTEM
  ========================================================= */
  if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
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
     🏢 ACCOUNT TYPE TOGGLE
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
   🌐 GOOGLE SIGN-IN
========================================================= */
window.signInWithGoogle = async function () {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

/* =========================================================
   📝 SIGN UP SYSTEM (UNCHANGED)
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
      name,
      email,
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

//acount menu log-out
const accountLogout = document.getElementById("accountLogout");

if (accountLogout) {
  accountLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}

await updateProfile(userCredential.user, {
  displayName: name
});

await userCredential.user.reload(); // 🔥 ensures displayName is available

const mobileLogin = document.getElementById("mobileLogin");

onAuthStateChanged(auth, (user) => {

  if (!mobileLogin) return;

  if (user) {
    mobileLogin.textContent = user.displayName || "Account";
    mobileLogin.href = "profile.html";
  } else {
    mobileLogin.textContent = "Sign In";
    mobileLogin.href = "login.html";
  }
});

window.toggleMenu = function () {
  document.getElementById("accountMenu")?.classList.remove("open");
  document.getElementById("sideMenu")?.classList.toggle("open");
};

window.openAccountMenu = function () {
  document.getElementById("sideMenu")?.classList.remove("open");
  document.getElementById("accountMenu")?.classList.add("open");
};

window.toggleMoreMenu = function () {
  const menu = document.getElementById("moreMenu");
  if (!menu) return;

  menu.style.display = menu.style.display === "block" ? "none" : "block";
};

window.toggleMoreMenu = function () {
  const menu = document.getElementById("moreMenu");
  if (!menu) return;

  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
};
window.toggleMobileMenu = function () {
  document.getElementById("mobileMenu").classList.toggle("open");
  document.getElementById("desktopMenu").classList.remove("open");
};

window.toggleDesktopMenu = function () {
  document.getElementById("desktopMenu").classList.toggle("open");
  document.getElementById("mobileMenu").classList.remove("open");
};

window.closeMenus = function () {
  document.getElementById("mobileMenu")?.classList.remove("open");
  document.getElementById("desktopMenu")?.classList.remove("open");
};