import { getCurrentUser } from "./supabase.js";

const user = await getCurrentUser();
if (user) {
  window.location.href = "dashboard.html";
}

import { signUp } from "./supabase.js";

document.getElementById("signupBtn").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorText = document.getElementById("signupError");
  const successText = document.getElementById("signupSuccess");

  errorText.classList.add("hidden");
  successText.classList.add("hidden");

  if (!name || !email || !password) {
    errorText.textContent = "All fields are required.";
    errorText.classList.remove("hidden");
    return;
  }

  try {
    await signUp(email, password, name);
    successText.textContent = "Account created! Please check your email to verify.";
    successText.classList.remove("hidden");

    // Optional: auto-redirect after a short delay
    setTimeout(() => (window.location.href = "login.html"), 2500);
  } catch (err) {
    errorText.textContent = err.message || "Sign up failed. Try again.";
    errorText.classList.remove("hidden");
  }
};
