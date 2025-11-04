import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

// Get the document ID from the URL
function getDocIdFromUrl() {
    const params = new URL(window.location.href).searchParams;
    return params.get("docID");
}

// Fetch the task and display its name and image
async function displayTaskInfo() {
    const id = getDocIdFromUrl();

    if (!id) {
    console.error("No docID provided in the URL.");
    document.getElementById("taskName").textContent = "No task selected.";
    return;
}

    try {
    // Use 'tasks' collection
    const taskRef = doc(db, "tasks", id);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
        console.error("Task not found.");
        document.getElementById("taskName").textContent = "Task not found.";
        return;
    }

    const task = taskSnap.data();
    const name = task.name;
    const code = task.code;

    // Update the page
    document.getElementById("taskName").textContent = name;

    const img = document.getElementById("taskImage");
    if (img) {
    img.src = `./images/${code}.jpg`;
    img.alt = `${name} image`;
    }
    } catch (error) {
    console.error("Error loading task:", error);
    document.getElementById("taskName").textContent = "Error loading task.";
}
}

displayTaskInfo();

