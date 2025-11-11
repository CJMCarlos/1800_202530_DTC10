import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Helpers
function getTaskId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id"); // null or string
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("addEventForm");
  const titleInput = document.getElementById("eventName");
  const descInput = document.getElementById("eventDescription");
  const dateInput = document.getElementById("eventDate");
  const submitBtn = document.querySelector(".submit-btn");

  const taskId = getTaskId();
  let isEditMode = taskId !== null;

  // Edit mode: load task data
  if (isEditMode) {
    submitBtn.textContent = "Save Changes";

    const docRef = doc(db, "tasks", taskId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      alert("Task not found!");
      return;
    }

    const t = snap.data();

    titleInput.value = t.title;
    descInput.value = t.description || "";
    dateInput.value = t.dueDate || "";
  }

  // Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      dueDate: dateInput.value,
      ownerId: auth.currentUser.uid,
    };

    try {
      if (isEditMode) {
        // Update existing task
        await updateDoc(doc(db, "tasks", taskId), data);
      } else {
        // Create new task
        await addDoc(collection(db, "tasks"), {
          ...data,
          isCompleted: false,
          createdAt: serverTimestamp(),
        });
      }

      window.location.href = "event.html";
    } catch (err) {
      console.error(err);
      alert("Error saving task.");
    }
  });
});
