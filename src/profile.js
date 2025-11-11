import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, updatePassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateDisplayName } from "./authentication.js";

// -------------------------
// PROFILE PICTURE HANDLING
// -------------------------

const profilePictureDisplay = document.getElementById("profilePictureDisplay");
const profilePictureInput = document.getElementById("profilePictureInput");
const editProfilePicBtn = document.getElementById("editProfilePicBtn");

// load profile picture from Firestore on page load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().profilePicture) {
        profilePictureDisplay.src = userDoc.data().profilePicture;
      } else {
        // use default profile icon (SVG as data URI)
        setDefaultProfilePicture();
      }
    } catch (err) {
      console.error("Error loading profile picture:", err);
      setDefaultProfilePicture();
    }

    // Load current username into placeholder
    const usernameInput = document.getElementById("usernameInput");
    usernameInput.placeholder = user.displayName || "Enter your username";
    usernameInput.value = "";

    // Set password placeholder
    const passwordInput = document.getElementById("passwordInput");
    passwordInput.placeholder = "Leave blank to keep current password";
    passwordInput.value = "";
  } else {
    window.location.href = "login.html";
  }
});

function setDefaultProfilePicture() {
  // use a default SVG as data URI (profile icon)
  const defaultSvg = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="#51624f"/>
      <path d="M6 20c0-4 4-6 6-6s6 2 6 6" fill="#51624f"/>
    </svg>
  `;
  const encoded = encodeURIComponent(defaultSvg);
  profilePictureDisplay.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
}

// open file picker when edit button is clicked
editProfilePicBtn.addEventListener("click", () => {
  profilePictureInput.click();
});

// handle file selection
profilePictureInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // validate file type
  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");
    return;
  }

  // validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must be less than 5MB.");
    return;
  }

  try {
    // convert image to base64 data URI
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUri = event.target.result;
      profilePictureDisplay.src = imageDataUri;

      // save to Firestore
      const user = auth.currentUser;
      if (user) {
        try {
          await setDoc(
            doc(db, "users", user.uid),
            { profilePicture: imageDataUri },
            { merge: true }
          );
          console.log("Profile picture saved!");
        } catch (err) {
          console.error("Error saving profile picture:", err);
          alert("Failed to save profile picture. Please try again.");
        }
      }
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Error processing image:", err);
    alert("Failed to process image. Please try again.");
  }
});

// ------------------------------------
// USERNAME AND PASSWORD FORM HANDLING
// ------------------------------------

const profileForm = document.getElementById("profileForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");

const MAX_USERNAME_LENGTH = 13;

// save button click handler
saveProfileBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // clear previous errors
  usernameError.textContent = "";
  usernameError.classList.remove("show");
  passwordError.textContent = "";
  passwordError.classList.remove("show");

  const newUsername = usernameInput.value.trim();
  const newPassword = passwordInput.value.trim();
  const user = auth.currentUser;

  if (!user) {
    alert("Please sign in to update your profile.");
    return;
  }

  // Validate username
  if (!newUsername) {
    usernameError.textContent = "Username cannot be empty.";
    usernameError.classList.add("show");
    return;
  }

  if (newUsername.length > MAX_USERNAME_LENGTH) {
    usernameError.textContent = `Username must be ${MAX_USERNAME_LENGTH} characters or fewer.`;
    usernameError.classList.add("show");
    return;
  }

  try {
    // update username if changed
    if (newUsername !== (user.displayName || "")) {
      await updateDisplayName(newUsername);
    }

    // update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters.";
        passwordError.classList.add("show");
        return;
      }
      await updatePassword(user, newPassword);
      passwordInput.value = ""; // clear password field after success
    }

    alert("Profile updated successfully!");
  } catch (err) {
    console.error("Error updating profile:", err);
    if (err.code === "auth/weak-password") {
      passwordError.textContent =
        "Password too weak. Use at least 6 characters.";
      passwordError.classList.add("show");
    } else if (err.code === "auth/requires-recent-login") {
      alert(
        "For security, please log out and log in again before changing your password."
      );
    } else {
      alert("Failed to update profile. See console for details.");
    }
  }
});

// ============================================================================
// LOGOUT HANDLING
// ============================================================================

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Error logging out:", err);
    alert("Failed to log out. Please try again.");
  }
});
