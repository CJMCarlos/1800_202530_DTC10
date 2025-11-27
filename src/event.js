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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

let animationTimeout = null;
let isAnimating = false;

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

    const tasksRef = collection(db, "tasks");

    const q = query(
      tasksRef,
      where("ownerId", "==", user.uid),
      where("isCompleted", "==", false),
      orderBy("dueDate", "asc")
    );

    let allTasks = [];
    let hasInitialLoad = false;

    onSnapshot(q, (snap) => {
      const newTasks = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // only delay if animation is currently happening
      if (isAnimating && hasInitialLoad) {
        if (animationTimeout) {
          clearTimeout(animationTimeout);
        }
        animationTimeout = setTimeout(() => {
          allTasks = newTasks;
          renderTasks(allTasks);
          animationTimeout = null;
        }, 1300); // wait for animation to complete
      } else {
        // load immediately on first load and when no animation
        allTasks = newTasks;
        renderTasks(allTasks);
        hasInitialLoad = true;
      }
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
      const card = box.closest(".evt-card");
      const title = card.querySelector(".evt-title").textContent;

      try {
        // Set animating flag
        isAnimating = true;

        // Animate card slide out to the right with space collapse
        card.style.transform = "translateX(400px)";
        card.style.opacity = "0";
        card.style.marginBottom = "-100px";

        await updateDoc(doc(db, "tasks", box.dataset.id), {
          isCompleted: true,
          completedAt: Date.now(),
        });

        // Show success notification
        showNotification(`"${title}" completed!`);

        // Reset flag after animation completes
        setTimeout(() => {
          card.remove();
          isAnimating = false;
        }, 1300);
      } catch (err) {
        console.error("Error completing task:", err);
        box.checked = false; // Revert checkbox on error
        // Revert animation on error
        card.style.transform = "translateX(0)";
        card.style.opacity = "1";
        card.style.marginBottom = "14px";
        isAnimating = false;
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
        // Set animating flag
        isAnimating = true;

        // Fade out the card
        card.style.opacity = "0";
        card.style.marginBottom = "-100px";

        await deleteDoc(doc(db, "tasks", btn.dataset.delete));
        showNotification(`"${title}" deleted!`);

        // Reset flag after animation completes
        setTimeout(() => {
          isAnimating = false;
        }, 1300);
      } catch (err) {
        console.error("Error deleting task:", err);
        showNotification("Failed to delete task");
        // Revert animation on error
        card.style.opacity = "1";
        isAnimating = false;
      }
    });
  });
}

// Show notification slide-in from top left
function showNotification(message) {
  // Create notification element if it doesn't exist
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

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 50);

  // Remove after 1.7 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 1700);
}
