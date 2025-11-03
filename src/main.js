import { onAuthReady } from "./authentication.js";

function showDashboard() {
  // Wait for Firebase to determine the current authentication state.
  // onAuthReady() runs the callback once Firebase finishes checking the signed-in user.
  onAuthReady((user) => {
    if (!user) {
      // If no user is signed in → redirect back to login page.
      location.href = "index.html";
      return;
    }

    // If a user is logged in:
    // Use their display name if available, otherwise show their email.
    const name = user.displayName || user.email;

    // Query for the element at the time we need it (safer if script runs before DOM)
    const nameElement = document.getElementById("name-goes-here");
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}

showDashboard();
