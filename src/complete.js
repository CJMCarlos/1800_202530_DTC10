import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const completedList = document.getElementById("completedList");
const emptyState = document.getElementById("emptyState");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    completedList.innerHTML = `
      <p>Please sign in to view completed tasks</p>
    `;
    return;
  }

  const tasksRef = collection(db, "tasks");

  //
  const q = query(
    tasksRef,
    where("ownerId", "==", user.uid),
    where("isCompleted", "==", true),
    orderBy("completedAt", "desc")
  );

  onSnapshot(q, (snap) => {
    if (snap.empty) {
      completedList.innerHTML = "";
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    const html = snap.docs
      .map((d) => {
        const t = d.data();

        return `
          <div class="completed-item">
            <div>
              <h3 class="completed-title-text">${t.title}</h3>
              <p class="completed-date">${t.dueDate || ""}</p>
              ${
                t.description
                  ? `<p class="completed-desc">${t.description}</p>`
                  : ""
              }
            </div>

            <div class="completed-actions">
              <button class="btn-text btn-restore" data-id="${d.id}">
                Restore
              </button>
              <button class="btn-text btn-delete" data-id="${d.id}">
                Delete
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    completedList.innerHTML = html;

    attachListeners();
  });
});

// Action buttons
function attachListeners() {
  document.querySelectorAll(".btn-restore").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await updateTask(id, { isCompleted: false });
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await deleteTask(id);
    });
  });
}

async function updateTask(id, data) {
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, "tasks", id), data);
}

async function deleteTask(id) {
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "tasks", id));
}
