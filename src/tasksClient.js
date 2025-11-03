// src/tasksClient.js
import { db } from "./firebaseConfig.js";
import { auth } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

/**
 * Add a new task for the current user
 * @param {Object} task
 * @param {string} task.title
 * @param {string} task.details
 * @param {string} task.dueDate
 * @returns {Promise<string>} 
 */
export async function addTaskForCurrentUser(task) {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be signed in to create tasks");

  // Create the task document with only essential fields
  const taskDoc = {
    ownerId: user.uid,
    title: task.title,
    description: task.details || "",
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
