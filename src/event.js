import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDoc,
  addDoc,
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
    const completedRef = collection(db, "completedTasks");
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

        // Define checkbox
        const checkbox = card.querySelector(".complete-toggle");
        if (t.isCompleted) {
          card.querySelector(".evt-title").classList.add("is-done");
          checkbox.checked = true;
        }

        if (done) {
          card.querySelector(".evt-title").classList.add("is-done");
          card.querySelector(".complete-toggle").checked = true;
        }

        // Add data attributes
        card.querySelector(".complete-toggle").dataset.id = id;
        card.querySelector(".edit-btn").dataset.edit = id;
        card.querySelector(".delete-btn").dataset.delete = id;

        //Checkbox listener
        checkbox.addEventListener("change", async () => {
          if (!checkbox.checked) return; // Only act when checked

          try {
            const taskRef = doc(db, "tasks", id);
            const snap = await getDoc(taskRef);
            if (!snap.exists()) return;

            const taskData = snap.data();

            await addDoc(completedRef, {
              ...taskData,
              isCompleted: true,
              completedAt: Date.now(),
            });

            await deleteDoc(taskRef);

            // Redirect to completed page
            window.location.href = "complete.html";

          } catch (err) {
            console.error("Failed to move task to completed:", err);
          }
        });
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
      await updateDoc(doc(db, "tasks", id), {
        isCompleted: isChecked,
        completedAt: Date.now(),
      });
      if (isChecked) {
        window.location.href = "complete.html";
      }
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
