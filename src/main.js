import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs, //onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

let isAnimating = false;

// ⛔ redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "welcome.html";
  } else {
    // load name
    document.getElementById("name-goes-here").textContent =
      user.displayName || user.email.split("@")[0];
  }
});

// ====================
// Greeting
// ====================
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

// ====================
// Load Tasks
// ====================
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tasks-go-here");
  const template = document.getElementById("HomeEventPreview").content;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const tasksRef = collection(db, "tasks");
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
      if (data.dueDate?.toDate) due = data.dueDate.toDate();
      else if (typeof data.dueDate === "string") {
        const parsed = new Date(data.dueDate);
        if (!isNaN(parsed)) due = parsed;
      }

      tasks.push({
        id: docSnap.id,
        ...data,
        due,
      });
    });

    tasks.sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due - b.due;
    });

    const top5 = tasks.slice(0, 5);
    container.innerHTML = "";

    top5.forEach((task) => {
      const card = template.cloneNode(true);
      card.querySelector(".evt-title").textContent = task.title;
      card.querySelector(".evt-desc").textContent = task.description || "";
      card.querySelector(".evt-date").textContent = task.due
        ? task.due.toISOString().split("T")[0]
        : "";

      if (task.isCompleted) {
        card.querySelector(".evt-title").classList.add("is-done");
        card.querySelector(".complete-toggle").checked = true;
      }

      card.querySelector(".complete-toggle").dataset.id = task.id;
      card.querySelector(".edit-btn").dataset.edit = task.id;
      card.querySelector(".delete-btn").dataset.delete = task.id;

      container.appendChild(card);
    });

    attachHomeListeners();
  });
});

function attachHomeListeners() {
  document.querySelectorAll(".complete-toggle").forEach((box) => {
    box.addEventListener("change", async () => {
      const card = box.closest(".evt-card");
      const title = card.querySelector(".evt-title").textContent;

      try {
        // show notification immediately
        showNotification(`"${title}" completed!`);

        // remove card immediately (no animation)
        card.remove();

        await updateDoc(doc(db, "tasks", box.dataset.id), {
          isCompleted: true,
          completedAt: Date.now(),
        });
      } catch (err) {
        console.error("Error completing task:", err);
        box.checked = false; // revert checkbox on error
        // re-add card if it was removed
        location.reload();
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
      const card = btn.closest(".evt-card");
      const title = card.querySelector(".evt-title").textContent;

      try {
        // show notification immediately
        showNotification(`"${title}" deleted!`);

        // remove card immediately (no animation)
        card.remove();

        await deleteDoc(doc(db, "tasks", btn.dataset.delete));
      } catch (err) {
        console.error("Error deleting task:", err);
        showNotification("Failed to delete task");
        // re-add card if it was removed
        location.reload();
      }
    });
  });
}

// show notification slide-in from top
function showNotification(message) {
  // create notification element if it doesn't exist
  let notificationContainer = document.getElementById("notificationContainer");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notificationContainer";
    document.body.appendChild(notificationContainer);
  }

  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notificationContainer.appendChild(notification);

  // animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 50);

  // remove after 1.7 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 1700);
}
