import { onAuthReady } from "./authentication.js";

function showDashboard() {
  // Wait for Firebase Auth to initialize and check login state
  onAuthReady((user) => {
    const nameElement = document.getElementById("name-goes-here");
    if (!nameElement) return; // Exit if element not found

    if (user) {
      // If user is signed in, show their name or email
      const name = user.displayName || user.email;
      nameElement.textContent = `${name}!`;
    } else {
      // If no user is signed in, show default text
      nameElement.textContent = "friend";
    }
  });
}

showDashboard();
