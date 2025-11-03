// src/tasksClient.js
import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export async function addTaskForCurrentUser(task) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in to create tasks");

  // Create the task document with only essential fields
  const taskDoc = {
    ownerId: user.uid,
    title: task.title,
    description: task.description || "",
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
  };

  // Add to Firestore
  const docRef = await addDoc(collection(db, "tasks"), taskDoc);
  return docRef.id;
}

/**
 * Listen to the current user's tasks in real-time
 * @param {Function} onTasksUpdate
 * @returns {Function}
 */
export function listenToUserTasks(onTasksUpdate) {
  const user = auth.currentUser;
  if (!user) {
    console.warn("Must be signed in to view tasks");
    return () => {};
  }

  // Create query for user's tasks
  const q = query(collection(db, "tasks"), where("ownerId", "==", user.uid));

  // Start listening
  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    onTasksUpdate(tasks);
  });
}

/**
 * Delete a task by its ID (for current user)
 * @param {string} taskId
 * @returns {Promise<void>}
 */
export async function deleteTaskForCurrentUser(taskId) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in to delete tasks");

  const taskRef = doc(db, "tasks", taskId);

  await deleteDoc(taskRef);
}

/**
 * Get one task by ID
 */
export async function getTaskById(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  const snap = await getDoc(taskRef);
  if (!snap.exists()) throw new Error("Task not found");
  return { id: snap.id, ...snap.data() };
}

/**
 * Update a task
 */
export async function updateTask(taskId, updatedData) {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, updatedData);
}
