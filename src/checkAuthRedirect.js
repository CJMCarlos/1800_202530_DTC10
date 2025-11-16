import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // already logged in
    window.location.href = "index.html";
  }
});
