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
      showNotification("Task not found!");
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
        showNotification("Task updated successfully!");
      } else {
        // Create new task
        await addDoc(collection(db, "tasks"), {
          ...data,
          isCompleted: false,
          createdAt: serverTimestamp(),
        });
        showNotification("Task created successfully!");
      }

      setTimeout(() => {
        window.location.href = "event.html";
      }, 1000);
    } catch (err) {
      console.error(err);
      showNotification("Error saving task.");
    }
  });
});

// Show notification slide-in from top
function showNotification(message) {
  // Create notification element if it doesn't exist
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

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 50);

  // Remove after 1.7 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 1700);
}
