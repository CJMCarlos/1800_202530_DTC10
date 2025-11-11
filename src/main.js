import { db, auth } from "./firebaseConfig.js";
import { collection, query, where, getDocs, doc, deleteDoc} from "firebase/firestore";
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

  // ✅ Find the delete button inside the template
  const deleteBtn = card.querySelector(".delete-btn");

  // ✅ Attach click handler for deletion
  deleteBtn.addEventListener("click", async () => {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "tasks", task.id));
      deleteBtn.closest(".event-card").remove();
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task.");
    }
  });
      const completeBtn = card.querySelector(".complete-btn");
      completeBtn.addEventListener("click", async () => {
        const confirmComplete = confirm("Mark this task as completed?");
        if (!confirmComplete) return;

        try {
          await setDoc(doc(db, "completedTasks", task.id), {
            ...task,
            completedAt: new Date().toISOString(),
            dueDate: task.due ? task.due.toISOString() : null,
          });

          await deleteDoc(doc(db, "tasks", task.id));
          card.remove();

          // Short delay to ensure Firestore completes
          setTimeout(() => {
            window.location.href = "complete.html";
          }, 100); // 100ms delay is enough
        } catch (err) {
          console.error("Failed to mark task as completed:", err);
          alert("Failed to mark task as completed.");
        }
      });

      // Append card to container
      container.appendChild(card);
    });
  });
});