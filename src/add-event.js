import { Timestamp } from "firebase/firestore";
import {
  addTaskForCurrentUser,
  getTaskById,
  updateTask,
} from "./tasksClient.js";

const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("addEventForm");
  const titleInput = document.getElementById("eventName");
  const descInput = document.getElementById("eventDescription");
  const dateInput = document.getElementById("eventDate");
  const title = document.querySelector("h3");
  const submitBtn = document.querySelector("button[type='submit']");

  if (taskId) {
    title.textContent = "Edit Task";
    submitBtn.textContent = "Save Changes";

    try {
      const task = await getTaskById(taskId);
      titleInput.value = task.title || "";
      descInput.value = task.description || "";
      if (task.dueDate?.seconds) {
        dateInput.value = new Date(task.dueDate.seconds * 1000)
          .toISOString()
          .split("T")[0];
      }
    } catch (err) {
      console.error("Failed to load task:", err);
      alert("Could not load task for editing.");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const taskData = {
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
      dueDate: dateInput.value
        ? Timestamp.fromDate(new Date(dateInput.value))
        : null,
    };

    try {
      if (taskId) {
        await updateTask(taskId, taskData);
        alert("Task updated successfully!");
      } else {
        await addTaskForCurrentUser(taskData);
        alert("Task added successfully!");
      }

      window.location.href = "event.html";
    } catch (err) {
      console.error("Failed to save task:", err);
      alert("Failed to save task. Please make sure you are signed in.");
    }
  });
});
