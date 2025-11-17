import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "welcome.html";
  }
});
