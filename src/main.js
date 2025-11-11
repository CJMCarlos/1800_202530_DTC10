import { db, auth } from "./firebaseConfig.js";
import { collection, query, where, getDocs, doc, deleteDoc} from "firebase/firestore";
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

<<<<<<< HEAD
    // ✅ Render UI
  top5.forEach((task) => {
  const card = template.cloneNode(true);

  card.querySelector(".event-title").textContent = task.title;
  card.querySelector(".event-desc").textContent = task.description || "";
  card.querySelector(".event-date").textContent = task.due
    ? task.due.toISOString().split("T")[0]
    : "No due date";
=======
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
>>>>>>> 87818b64f097eaf6da66bec46532df2dd81b2208

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