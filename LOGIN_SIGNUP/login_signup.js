const API = "https://krishi-suraksha.onrender.com/api";

/* ELEMENTS */
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotForm = document.getElementById("forgotForm");

const title = document.getElementById("title");
const roleText = document.getElementById("roleText");

/* INPUTS */
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPhone = document.getElementById("signupPhone");
const signupPassword = document.getElementById("signupPassword");

const forgotEmail = document.getElementById("forgotEmail");
const newPassword = document.getElementById("newPassword");

/* ROLE */
const params = new URLSearchParams(window.location.search);
const role = params.get("role");

if (!role) {
  showToast("Role not selected", "error");
  window.location.href = "../ROLES_SELECTION/roles.html";
}

roleText.innerText = "Role: " + role.toUpperCase();

if (role === "admin") {
  signupTab.style.display = "none";
  loginTab.classList.add("active");
}

/* UTIL FUNCTIONS */
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

/* TAB SWITCH */
loginTab.onclick = showLogin;
signupTab.onclick = showSignup;

function showLogin() {
  title.innerText = "Login";

  loginForm.classList.add("active");
  signupForm.classList.remove("active");
  forgotForm.classList.remove("active");

  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  document.querySelector(".tabs").style.display = "flex";
}

function showSignup() {
  title.innerText = "Signup";

  signupForm.classList.add("active");
  loginForm.classList.remove("active");
  forgotForm.classList.remove("active");

  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  document.querySelector(".tabs").style.display = "flex";
}

function showForgot() {
  title.innerText = "Reset Password";

  forgotForm.classList.add("active");
  loginForm.classList.remove("active");
  signupForm.classList.remove("active");

  document.querySelector(".tabs").style.display = "none";
}

/* ================= LOGIN ================= */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value.trim();

  if (!isValidEmail(email)) {
    showToast("Enter valid email", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error, "error");
      return;
    }
    localStorage.setItem("user", JSON.stringify(data));

    sessionStorage.setItem("userId", data.id);
    sessionStorage.setItem("loggedInUser", data.name || data.email);
    sessionStorage.setItem("role", data.role);

    showToast("Login successful", "success");

if (data.role === "admin") {
  sessionStorage.setItem("adminLoggedIn", true);
  window.location.href = "../ADMIN/admin_dashboard.html";
} else if (data.role === "farmer") {
  window.location.href = "../FARMER/farmer_dashboard.html";
} else {
  window.location.href = "../BUYER/buyer_dashboard.html";
}

  } catch {
    showToast("Server error", "error");
  }
});

/* ================= SIGNUP ================= */
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = signupName.value.trim();
  const email = signupEmail.value.trim().toLowerCase();
  const phone = signupPhone.value.trim();
  const password = signupPassword.value.trim();

  const confirmPassword = document.getElementById("confirmPassword");

  if (password !== confirmPassword.value.trim()) {
    showToast("Passwords do not match", "error");
  return;
  }
  if (!name || !email || !phone || !password) {
    showToast("All fields required", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showToast("Invalid email", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      credentials: "include",
      body: JSON.stringify({ name, email, phone, password, role })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error, "error");
      return;
    }

    showToast("Signup successful", "success");
    showLogin();

  } catch {
    showToast("Server error", "error");
  }
});

/* ================= FORGOT ================= */
forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = forgotEmail.value.trim().toLowerCase();
  const password = newPassword.value.trim();

  if (!isValidEmail(email)) {
    showToast("Invalid email", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/forgot-password`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        email,
        newPassword: password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error, "error");
      return;
    }

    showToast("Password updated successfully!", "success");
    showLogin();

  } catch {
    showToast("Server error", "error");
  }
});