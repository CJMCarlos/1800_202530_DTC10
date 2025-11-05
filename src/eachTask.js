import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

function getDocIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("docID");
}

async function displayTaskInfo() {
    const id = getDocIdFromUrl();

    if (!id) {
    console.error("No docID provided in the URL.");
    document.getElementById("taskName").textContent = "No task selected.";
    return;
    }

    try {
        const taskRef = doc(db, "tasks", id);
        const taskSnap = await getDoc(taskRef);

        if (!taskSnap.exists()) {
        console.error("Task not found.");
        document.getElementById("taskName").textContent = "Task not found.";
        return;
        }

        const task = taskSnap.data();

        // Fill in existing page structure (keeps formatting)
        const taskNameEl = document.getElementById("taskName");
        const taskDescriptionEl = document.getElementById("taskDescription");
        const taskDueDateEl = document.getElementById("taskDueDate");

        if (taskNameEl) taskNameEl.textContent = task.title || "Untitled Task";
        if (taskDescriptionEl)
        taskDescriptionEl.textContent = task.description || "No description.";
        if (taskDueDateEl) {
        const date = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate;
        taskDueDateEl.textContent = date
            ? `Due: ${new Date(date).toDateString()}`
            : "No due date.";
        }
    } catch (error) {
        console.error("Error loading task:", error);
        document.getElementById("taskName").textContent = "Error loading task.";
    }
}

displayTaskInfo();
