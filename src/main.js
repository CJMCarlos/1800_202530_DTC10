import { db, auth } from "./firebaseConfig.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

// ✅ Load tasks
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tasks-go-here");
  const template = document.getElementById("HomeEventPreview").content;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("ownerId", "==", user.uid));

    const snap = await getDocs(q);
    const tasks = [];

    snap.forEach((doc) => {
      const data = doc.data();
      let due = null;

      // ✅ Firestore Timestamp
      if (data.dueDate?.toDate) {
        due = data.dueDate.toDate();
      }
      // ✅ String "2025-11-25"
      else if (typeof data.dueDate === "string") {
        const parsed = new Date(data.dueDate);
        if (!isNaN(parsed)) due = parsed;
      }

      tasks.push({
        id: doc.id,
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

    // ✅ Render
    top5.forEach((task) => {
      const card = template.cloneNode(true);

      card.querySelector(".evt-title").textContent = task.title;
      card.querySelector(".evt-desc").textContent = task.description || "";
      card.querySelector(".evt-date").textContent = task.due
        ? task.due.toISOString().split("T")[0]
        : "";

      // Completed state
      if (task.isCompleted) {
        card.querySelector(".evt-title").classList.add("is-done");
        card.querySelector("input[type='checkbox']").checked = true;
      }

      container.appendChild(card);
    });
  });
});
