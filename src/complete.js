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

  const completedRef = collection(db, "completedTasks");

  const q = query(
    completedRef,
    where("ownerId", "==", user.uid));

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
  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await deleteTask(id);
    });
  });
}

async function deleteTask(id) {
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "completedTasks", id)); // delete from completedTasks
}
