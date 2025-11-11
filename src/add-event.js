import { db, auth } from "./firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addEventForm");
  const titleInput = document.getElementById("eventName");
  const descInput = document.getElementById("eventDescription");
  const dateInput = document.getElementById("eventDate");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTask = {
      ownerId: auth.currentUser.uid,
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      dueDate: dateInput.value, // store duedate as string
    };

    try {
      await addDoc(collection(db, "tasks"), newTask);
      window.location.href = "event.html";
    } catch (err) {
      console.error("Error adding event:", err);
      alert("Failed to add event.");
    }
  });
});
