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

    let allTasks = [];

    onSnapshot(q, (snap) => {
      allTasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      renderTasks(allTasks);
    });

    function renderTasks(list) {
      eventList.innerHTML = "";

      if (list.length === 0) {
        eventList.innerHTML = `<p style="text-align:center;color:#6d6d6d;">No tasks found</p>`;
        return;
      }

      list.forEach((t) => {
        const card = template.content.cloneNode(true);

        card.querySelector(".evt-title").textContent = t.title;
        card.querySelector(".evt-date").textContent =
          t.dueDate || "No due date";
        card.querySelector(".evt-desc").textContent = t.description || "";

        if (t.isCompleted) {
          card.querySelector(".evt-title").classList.add("is-done");
          card.querySelector(".complete-toggle").checked = true;
        }

        card.querySelector(".complete-toggle").dataset.id = t.id;
        card.querySelector(".edit-btn").dataset.edit = t.id;
        card.querySelector(".delete-btn").dataset.delete = t.id;

        eventList.appendChild(card);
      });

      attachListeners();
    }

    /* -----------------
       SEARCH + CLEAR
    ------------------- */
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearch");

    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.trim().toLowerCase();

      clearBtn.style.display = keyword ? "block" : "none";

      const filtered = allTasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(keyword) ||
          t.description?.toLowerCase().includes(keyword)
      );

      renderTasks(filtered);
    });

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearBtn.style.display = "none";
      renderTasks(allTasks);
      searchInput.focus();
    });
  });
});

/* -----------------------------
   EVENT LISTENERS
------------------------------ */
function attachListeners() {
  document.querySelectorAll(".complete-toggle").forEach((box) => {
    box.addEventListener("change", async () => {
      await updateDoc(doc(db, "tasks", box.dataset.id), {
        isCompleted: true,
        completedAt: Date.now(),
      });
      if (isChecked) {
        window.location.href = "complete.html";
      }
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `add-event.html?id=${btn.dataset.edit}`;
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "tasks", btn.dataset.delete));
    });
  });
}
