import { listenToUserTasks } from "./tasksClient.js";
import { onAuthReady } from "./authentication.js";

document.addEventListener("DOMContentLoaded", () => {
  const addEventBtn = document.getElementById("addEventBtn");
  const eventList = document.getElementById("eventList");
  const loadingDiv = document.getElementById("loadingTasks");

  // Add Task
  addEventBtn.addEventListener("click", () => {
    window.location.href = "add-event.html";
  });

  // listen task after signup
  onAuthReady((user) => {
    if (!user) {
      loadingDiv.innerHTML =
        '<p class="text-muted m-0">Please sign in to view your tasks</p>';
      return;
    }

    //
    listenToUserTasks((tasks) => {
      if (tasks.length === 0) {
        eventList.innerHTML =
          '<p class="text-muted text-center m-0">No tasks yet</p>';
        return;
      }

      // to task
      const tasksHtml = tasks
        .map(
          (task) => `
          <div class="task-item mb-3 p-3 border rounded bg-white">
            <div class="d-flex align-items-center justify-content-between">
              <h5 class="mb-1">${task.title}</h5>
              <small class="text-muted">
                ${
                  task.dueDate
                    ? new Date(task.dueDate.seconds * 1000).toLocaleDateString()
                    : "No due date"
                }
              </small>
            </div>
            ${
              task.description
                ? `<p class="mb-0 text-muted">${task.description}</p>`
                : ""
            }
            <div class="text-end mt-2">
              <button
                class="btn btn-sm btn-outline-primary edit-btn me-2"
                data-id="${task.id}"
              >
                Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger delete-btn"
                data-id="${task.id}"
              >
                Delete
              </button>
            </div>
          </div>
        `
        )
        .join("");

      //
      eventList.innerHTML = tasksHtml;

      // Delete
      eventList.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const taskId = btn.dataset.id;
          const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
          );
          if (!confirmDelete) return;

          try {
            const { deleteTaskForCurrentUser } = await import(
              "./tasksClient.js"
            );
            await deleteTaskForCurrentUser(taskId);
            alert("Task deleted successfully!");
          } catch (err) {
            console.error("Failed to delete task:", err);
            alert("Failed to delete task. Please try again.");
          }
        });
      });

      // Edit
      eventList.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const taskId = btn.dataset.id;
          window.location.href = `add-event.html?id=${taskId}`;
        });
      });
    });
  });
});
