import { loginUser, signupUser, authErrorMessage } from "./authentication.js";

function initAuthUI() {
  const alertEl = document.getElementById("authAlert");
  const loginView = document.getElementById("loginView");
  const signupView = document.getElementById("signupView");
  const toSignupBtn = document.getElementById("toSignup");
  const toLoginBtn = document.getElementById("toLogin");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const redirectUrl = "index.html";

  function setVisible(el, visible) {
    el.classList.toggle("d-none", !visible);
  }

  let errorTimeout;
  function showError(msg) {
    alertEl.textContent = msg || "";
    alertEl.classList.remove("d-none");
    clearTimeout(errorTimeout);
    errorTimeout = setTimeout(hideError, 5000);
  }

  function hideError() {
    alertEl.classList.add("d-none");
    alertEl.textContent = "";
  }

  function setSubmitDisabled(form, disabled) {
    const btn = form.querySelector("button[type='submit']");
    if (btn) btn.disabled = disabled;
  }

  toSignupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setVisible(loginView, false);
    setVisible(signupView, true);
  });

  toLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setVisible(signupView, false);
    setVisible(loginView, true);
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) return showError("Please fill all fields");

    setSubmitDisabled(loginForm, true);
    try {
      await loginUser(email, password);
      location.href = redirectUrl;
    } catch (err) {
      showError(authErrorMessage(err));
    } finally {
      setSubmitDisabled(loginForm, false);
    }
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;

    if (!name || !email || !password)
      return showError("Please fill all fields");

    setSubmitDisabled(signupForm, true);
    try {
      await signupUser(name, email, password);
      location.href = redirectUrl;
    } catch (err) {
      showError(authErrorMessage(err));
    } finally {
      setSubmitDisabled(signupForm, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", initAuthUI);
