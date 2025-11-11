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
  getDoc,
  addDoc,
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
  // Mark complete — copy to `completedTasks` then delete from `tasks`
  document.querySelectorAll(".complete-toggle").forEach((box) => {
    // Use `onchange` to avoid attaching multiple listeners on every snapshot update
    box.onchange = async () => {
      const id = box.dataset.id;
      const isChecked = box.checked;
      console.log("[events] complete-toggle changed:", { id, isChecked });

      if (!isChecked) {
        try {
          await updateDoc(doc(db, "tasks", id), {
            isCompleted: false,
          });
          console.log("[events] task marked not completed:", id);
        } catch (err) {
          console.error("[events] Failed to update task:", err);
        }
        return;
      }

      try {
        const taskRef = doc(db, "tasks", id);
        console.log("[events] fetching task:", id);
        const snap = await getDoc(taskRef);
        if (!snap.exists()) {
          console.warn("[events] task not found:", id);
          return;
        }

        const data = snap.data();
        console.log("[events] fetched task data:", data);

        const completedRef = collection(db, "completedTasks");
        const newDoc = await addDoc(completedRef, {
          ...data,
          ownerId: data.ownerId,
          isCompleted: true,
          completedAt: Date.now(),
        });
        console.log("[events] added to completedTasks id:", newDoc.id);

        await deleteDoc(taskRef);
        console.log("[events] deleted original task:", id);

        // Redirect user to completed page
        window.location.href = "complete.html";
      } catch (err) {
        console.error("[events] Error moving task to completedTasks:", err);
      }
    };
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
