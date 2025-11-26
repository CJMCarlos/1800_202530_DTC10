import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Redirect if NOT logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "welcome.html";
  } else {
    document.getElementById("name-goes-here").textContent =
      user.displayName || user.email.split("@")[0];
  }
});

// Greeting section
const greetText = ["Good Morning", "Good Afternoon", "Good Evening"];
const hour = new Date().getHours();
document.getElementById("greet-time").textContent =
  hour < 12 ? greetText[0] : hour < 18 ? greetText[1] : greetText[2];

document.getElementById("today-date").textContent =
  new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

// Load tasks
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tasks-go-here");
  const template = document.getElementById("HomeEventPreview").content;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("ownerId", "==", user.uid),
      where("isCompleted", "==", false)
    );

    const snap = await getDocs(q);
    const tasks = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      let due = null;

      if (data.dueDate?.toDate) due = data.dueDate.toDate();
      else if (typeof data.dueDate === "string") {
        const parsed = new Date(data.dueDate);
        if (!isNaN(parsed)) due = parsed;
      }

      tasks.push({ id: docSnap.id, ...data, due });
    });

    tasks.sort((a, b) => (!a.due ? 1 : !b.due ? -1 : a.due - b.due));
    const top5 = tasks.slice(0, 5);

    container.innerHTML = "";
    top5.forEach((task) => {
      const card = template.cloneNode(true);

      card.querySelector(".evt-title").textContent = task.title;
      card.querySelector(".evt-desc").textContent = task.description || "";
      card.querySelector(".evt-date").textContent = task.due
        ? task.due.toISOString().split("T")[0]
        : "";

      card.querySelector(".complete-toggle").dataset.id = task.id;
      card.querySelector(".edit-btn").dataset.edit = task.id;
      card.querySelector(".delete-btn").dataset.delete = task.id;

      container.appendChild(card);
    });

    attachHomeListeners();
  });
});

function attachHomeListeners() {
  /* ------------------------
        COMPLETE TASK
  -------------------------- */
  document.querySelectorAll(".complete-toggle").forEach((box) => {
    box.addEventListener("change", async () => {
      const card = box.closest(".evt-card");

      card.classList.add("fade-out");

      setTimeout(async () => {
        await updateDoc(doc(db, "tasks", box.dataset.id), {
          isCompleted: true,
          completedAt: Date.now(),
        });

        card.remove();
      }, 400);
    });
  });

  /* ------------------------
         DELETE TASK
  -------------------------- */
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const card = btn.closest(".evt-card");

      card.classList.add("fade-out");

      setTimeout(async () => {
        await deleteDoc(doc(db, "tasks", btn.dataset.delete));
        card.remove();
      }, 400);
    });
  });

  /* ------------------------
           EDIT TASK
  -------------------------- */
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `add-event.html?id=${btn.dataset.edit}`;
    });
  });
}
