import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", () => {
  const addEventBtn = document.getElementById("addEventBtn");
  const eventList = document.getElementById("eventList");

  addEventBtn.addEventListener("click", () => {
    window.location.href = "add-event.html";
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      eventList.innerHTML = `<p>Please sign in to view your events</p>`;
      return;
    }

    const tasksRef = collection(db, "tasks");

    const q = query(
      tasksRef,
      where("ownerId", "==", user.uid),
      where("isCompleted", "==", false),
      orderBy("dueDate", "asc")
    );

    onSnapshot(q, (snap) => {
      if (snap.empty) {
        eventList.innerHTML = `<p style="text-align:center;color:#6d6d6d;">No tasks yet</p>`;
        return;
      }

      const html = snap.docs
        .map((d) => {
          const id = d.id;
          const t = d.data();
          const done = t.isCompleted === true;
          const dateStr = t.dueDate || "No due date";

          return `
<div class="evt-card" data-id="${id}">
  <div class="evt-top">
    
    <div class="evt-left">

      <!-- Checkbox -->
      <label class="evt-check">
        <input 
          type="checkbox" 
          class="complete-toggle" 
          data-id="${id}"
          ${done ? "checked" : ""}
        >
        <svg class="check-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" fill="none" />
        </svg>
      </label>

      <!-- Info -->
      <div class="evt-info">

        <div class="evt-row">
          <h5 class="evt-title ${done ? "is-done" : ""}">${t.title}</h5>
          <small class="evt-date">${dateStr}</small>
        </div>

        ${t.description ? `<p class="evt-desc">${t.description}</p>` : ""}

      </div>

    </div>

    <!-- Buttons -->
    <div class="evt-actions">
      <button class="evt-btn edit-btn" data-edit="${id}">Edit</button>
      <button class="evt-btn evt-btn-danger delete-btn" data-delete="${id}">Delete</button>
    </div>

  </div>
</div>
          `;
        })
        .join("");

      eventList.innerHTML = html;

      attachListeners();
    });
  });
});

/* -----------------------------
   EVENT LISTENERS
------------------------------ */

function attachListeners() {
  // ✅ Mark complete
  document.querySelectorAll(".complete-toggle").forEach((box) => {
    box.addEventListener("change", async () => {
      const id = box.dataset.id;

      await updateDoc(doc(db, "tasks", id), {
        isCompleted: true,
        completedAt: Date.now(),
      });
    });
  });

  // ✅ Edit
  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.edit;
      window.location.href = `add-event.html?id=${id}`;
    });
  });

  // ✅ Delete
  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.delete;
      await deleteDoc(doc(db, "tasks", id));
    });
  });
}
