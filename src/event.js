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
  const template = document.getElementById("EventCard");

  addEventBtn.addEventListener("click", () => {
    window.location.href = "add-event.html";
  });

  // Load events
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
      eventList.innerHTML = ""; // reset

      if (snap.empty) {
        eventList.innerHTML = `<p style="text-align:center;color:#6d6d6d;">No tasks yet</p>`;
        return;
      }

      snap.docs.forEach((d) => {
        const id = d.id;
        const t = d.data();
        const done = t.isCompleted;

        // Create card
        const card = template.content.cloneNode(true);

        // Fill data
        card.querySelector(".evt-title").textContent = t.title;
        card.querySelector(".evt-date").textContent =
          t.dueDate || "No due date";
        card.querySelector(".evt-desc").textContent = t.description || "";

        if (done) {
          card.querySelector(".evt-title").classList.add("is-done");
          card.querySelector(".complete-toggle").checked = true;
        }

        // Add data attributes
        card.querySelector(".complete-toggle").dataset.id = id;
        card.querySelector(".edit-btn").dataset.edit = id;
        card.querySelector(".delete-btn").dataset.delete = id;

        // Add card to DOM
        eventList.appendChild(card);
      });

      attachListeners();
    });
  });
});

/* -----------------------------
   EVENT LISTENERS
------------------------------ */

function attachListeners() {
  // Mark complete
  document.querySelectorAll(".complete-toggle").forEach((box) => {
    box.addEventListener("change", async () => {
      const id = box.dataset.id;

      await updateDoc(doc(db, "tasks", id), {
        isCompleted: true,
        completedAt: Date.now(),
      });
    });
  });

  // Edit
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.edit;
      window.location.href = `add-event.html?id=${id}`;
    });
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.delete;
      await deleteDoc(doc(db, "tasks", id));
    });
  });
}
