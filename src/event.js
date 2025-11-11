import { db, auth } from "./firebaseConfig.js";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const addEventBtn = document.getElementById("addEventBtn");
  const eventList = document.getElementById("eventList");

  addEventBtn.addEventListener("click", () => {
    window.location.href = "add-event.html";
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      eventList.innerHTML = `<p class="text-muted text-center m-0">Please sign in to view your tasks</p>`;
      return;
    }

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("ownerId", "==", user.uid));

    onSnapshot(q, (snap) => {
      if (snap.empty) {
        eventList.innerHTML = `<p class="text-muted text-center m-0">No tasks yet</p>`;
        return;
      }

      const html = snap.docs
        .map((d) => {
          const t = d.data();

          // dueDate show as string
          const dateStr = t.dueDate || "No due date";

          return `
            <div class="task-item mb-3 p-3 border rounded bg-white">
              <div class="d-flex align-items-center justify-content-between">
                <h5 class="mb-1">${t.title || "Untitled"}</h5>
                <small class="text-muted">${dateStr}</small>
              </div>
              ${
                t.description
                  ? `<p class="mb-0 text-muted">${t.description}</p>`
                  : ""
              }
            </div>
          `;
        })
        .join("");

      eventList.innerHTML = html;
    });
  });
});
