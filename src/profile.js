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

let profilePictureChanged = false;

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
    showNotification("Please select a valid image file.");
    return;
  }

  // validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification("Image size must be less than 5MB.");
    return;
  }

  try {
    // convert image to base64 data URI
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageDataUri = event.target.result;
      profilePictureDisplay.src = imageDataUri;
      profilePictureChanged = true;

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
          showNotification("Failed to save profile picture. Please try again.");
          profilePictureChanged = false;
        }
      }
    };
    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Error processing image:", err);
    showNotification("Failed to process image. Please try again.");
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
    showNotification("Please sign in to update your profile.");
    return;
  }

  // Validate username only if provided
  if (newUsername && newUsername.length > MAX_USERNAME_LENGTH) {
    usernameError.textContent = `Username must be ${MAX_USERNAME_LENGTH} characters or fewer.`;
    usernameError.classList.add("show");
    return;
  }

  try {
    let updated = false;

    // update username if provided and changed
    if (newUsername && newUsername !== (user.displayName || "")) {
      await updateDisplayName(newUsername);
      updated = true;
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
      updated = true;
    }

    // show success notification
    if (updated) {
      showNotification("Profile updated!");
    } else if (profilePictureChanged) {
      showNotification("Profile updated!");
      profilePictureChanged = false;
    } else {
      showNotification("No changes made");
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    if (err.code === "auth/weak-password") {
      passwordError.textContent =
        "Password too weak. Use at least 6 characters.";
      passwordError.classList.add("show");
    } else if (err.code === "auth/requires-recent-login") {
      showNotification("Please log out and log in again to change password");
    } else {
      showNotification("Profile updated!");
    }
  }
});

// logout
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Error logging out:", err);
    showNotification("Failed to log out. Please try again.");
  }
});

// show notification slide-in from top left
function showNotification(message) {
  // create notification element if it doesnt exist
  let notificationContainer = document.getElementById("notificationContainer");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notificationContainer";
    document.body.appendChild(notificationContainer);
  }

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notificationContainer.appendChild(notification);

  // animation effect
  setTimeout(() => {
    notification.classList.add("show");
  }, 50);

  // remove after 1.7 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 1700);
}
