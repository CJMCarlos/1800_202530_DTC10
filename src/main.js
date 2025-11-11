import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { updateDisplayName } from "./authentication.js";

// ✅ Greeting text
const greetText = ["Good Morning", "Good Afternoon", "Good Evening"];
const hour = new Date().getHours();
document.getElementById("greet-time").textContent =
  hour < 12 ? greetText[0] : hour < 18 ? greetText[1] : greetText[2];

// ✅ Today date
document.getElementById("today-date").textContent =
  new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

// ✅ Load user info
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("name-goes-here").textContent =
      user.displayName || user.email.split("@")[0];
  }
});

// Note: Edit username feature has been moved to profile.html

// ✅ Load tasks
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tasks-go-here");
  const template = document.getElementById("HomeEventPreview").content;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const tasksRef = collection(db, "tasks");
    // Only load active (not completed) tasks for the home view
    const q = query(
      tasksRef,
      where("ownerId", "==", user.uid),
      where("isCompleted", "==", false)
    );

    const snap = await getDocs(q);
    const tasks = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      let due = null;

      if (data.dueDate?.toDate) {
        due = data.dueDate.toDate();
      } else if (typeof data.dueDate === "string") {
        const parsed = new Date(data.dueDate);
        if (!isNaN(parsed)) due = parsed;
      }

      tasks.push({
        id: docSnap.id,
        ...data,
        due,
      });
    });

    // ✅ Sort by date
    tasks.sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due - b.due;
    });

    // ✅ Only top 5
    const top5 = tasks.slice(0, 5);

    container.innerHTML = ""; // reset list

    // ✅ Render
    top5.forEach((task) => {
      const card = template.cloneNode(true);

      card.querySelector(".evt-title").textContent = task.title;
      card.querySelector(".evt-desc").textContent = task.description || "";
      card.querySelector(".evt-date").textContent = task.due
        ? task.due.toISOString().split("T")[0]
        : "";

      // Completed state
      const checkbox = card.querySelector("input[type='checkbox']");
      if (task.isCompleted) {
        card.querySelector(".evt-title").classList.add("is-done");
        checkbox.checked = true;
      }

      // ✅ Inject ID into buttons
      card.querySelector(".evt-edit").dataset.edit = task.id;
      card.querySelector(".evt-delete").dataset.delete = task.id;

      container.appendChild(card);
    });

    attachHomeListeners();
  });
});

/* -------------------------
   ✅ Add Edit / Delete Listeners
-------------------------- */
function attachHomeListeners() {
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
