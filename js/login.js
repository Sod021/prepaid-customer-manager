import { signIn } from "./supabase.js";

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorText = document.getElementById("loginError");

  if (!email || !password) {
    errorText.textContent = "Please enter both email and password.";
    errorText.classList.remove("hidden");
    return;
  }

  try {
    await signIn(email, password);
    window.location.href = "index.html"; // redirect to main dashboard
  } catch (err) {
    errorText.textContent = err.message || "Login failed. Please check your credentials.";
    errorText.classList.remove("hidden");
  }
};
