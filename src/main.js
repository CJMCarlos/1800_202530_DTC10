import { db, auth } from "./firebaseConfig.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
  if (!user) return;
  document.getElementById("name-goes-here").textContent =
    user.displayName || user.email.split("@")[0];
});

// Greeting Text
const greetText = ["Good Morning", "Good Afternoon", "Good Evening"];
const hour = new Date().getHours();
let greet = greetText[2];
if (hour < 12) greet = greetText[0];
else if (hour < 18) greet = greetText[1];
document.getElementById("greet-time").textContent = greet;

// Today date
document.getElementById("today-date").textContent =
  new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("tasks-go-here");
  const template = document.getElementById("TaskCardTemplate").content;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("ownerId", "==", user.uid));

    const snap = await getDocs(q);
    let tasks = [];

    snap.forEach((doc) => {
      const data = doc.data();
      let due = null;

      // ✅ Firestore Timestamp
      if (data.dueDate?.toDate) {
        due = data.dueDate.toDate();
      }

      // ✅ string "2025-11-25"
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

    // ✅ sort by date
    tasks.sort((a, b) => {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due - b.due;
    });

    // ✅ top 5 tasks
    const top5 = tasks.slice(0, 5);

    // ✅ Render UI
    top5.forEach((task) => {
      const card = template.cloneNode(true);

      card.querySelector(".event-title").textContent = task.title;
      card.querySelector(".event-desc").textContent = task.description || "";
      card.querySelector(".event-date").textContent = task.due
        ? task.due.toISOString().split("T")[0]
        : "No due date";

      container.appendChild(card);
    });
  });
});
