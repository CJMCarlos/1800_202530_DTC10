import { db, auth } from "./firebaseConfig.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const completedList = document.getElementById("completedList");
const emptyState = document.getElementById("emptyState");
let animationTimeout = null;
let isAnimating = false;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    completedList.innerHTML = `
      <p>Please sign in to view completed tasks</p>
    `;
    return;
  }

  const tasksRef = collection(db, "tasks");

  //
  const q = query(
    tasksRef,
    where("ownerId", "==", user.uid),
    where("isCompleted", "==", true),
    orderBy("completedAt", "desc")
  );

  let hasInitialLoad = false;

  onSnapshot(q, (snap) => {
    // if animation is in progress, wait before updating
    const updateUI = () => {
      if (snap.empty) {
        completedList.innerHTML = "";
        emptyState.hidden = false;
        return;
      }

      emptyState.hidden = true;

      const html = snap.docs
        .map((d) => {
          const t = d.data();

          return `
            <div class="completed-item">
              <div>
                <h3 class="completed-title-text">${t.title}</h3>
                <p class="completed-date">${t.dueDate || ""}</p>
                ${
                  t.description
                    ? `<p class="completed-desc">${t.description}</p>`
                    : ""
                }
              </div>

              <div class="completed-actions">
                <button class="btn-text btn-restore" data-id="${d.id}">
                  Restore
                </button>
                <button class="btn-text btn-delete" data-id="${d.id}">
                  Delete
                </button>
              </div>
            </div>
          `;
        })
        .join("");

      completedList.innerHTML = html;

      attachListeners();
    };

    // Only delay if animation is currently happening
    if (isAnimating && hasInitialLoad) {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
      animationTimeout = setTimeout(() => {
        updateUI();
        animationTimeout = null;
      }, 1500); // Wait for animation to complete
    } else {
      // Load immediately on first load and when no animation
      updateUI();
      hasInitialLoad = true;
    }
  });
});

// action buttons
function attachListeners() {
  document.querySelectorAll(".btn-restore").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const completedItem = btn.closest(".completed-item");
      const title = completedItem.querySelector(
        ".completed-title-text"
      ).textContent;
      try {
        // set animating flag
        isAnimating = true;

        // card slide out to the left
        completedItem.style.transform = "translateX(-400px)";
        completedItem.style.opacity = "0";
        completedItem.style.marginBottom = "-80px";

        await updateTask(id, { isCompleted: false });
        showNotification(`"${title}" restored!`);

        // reset flag after animation completes
        setTimeout(() => {
          isAnimating = false;
        }, 1500);
      } catch (err) {
        console.error("Error restoring task:", err);
        showNotification("Failed to restore task");
        // Revert animation on error
        completedItem.style.transform = "translateX(0)";
        completedItem.style.opacity = "1";
        completedItem.style.marginBottom = "14px";
        isAnimating = false;
      }
    });
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const completedItem = btn.closest(".completed-item");
      const title = completedItem.querySelector(
        ".completed-title-text"
      ).textContent;
      try {
        // set animating flag
        isAnimating = true;

        // Fade out the card
        completedItem.style.opacity = "0";
        completedItem.style.marginBottom = "-80px";

        await deleteTask(id);
        showNotification(`"${title}" deleted!`);

        // reset flag after animation completes
        setTimeout(() => {
          isAnimating = false;
        }, 1500);
      } catch (err) {
        console.error("Error deleting task:", err);
        showNotification("Failed to delete task");
        // revert animation on error
        completedItem.style.opacity = "1";
        completedItem.style.marginBottom = "14px";
        isAnimating = false;
      }
    });
  });
}

async function updateTask(id, data) {
  const { doc, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, "tasks", id), data);
}

async function deleteTask(id) {
  const { doc, deleteDoc } = await import("firebase/firestore");
  await deleteDoc(doc(db, "tasks", id));
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
