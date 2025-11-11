import { db, auth } from "./firebaseConfig.js";
import { collection, query, where, getDocs } from "firebase/firestore";
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

// Inline edit username (no popup)
const editBtn = document.getElementById("editUsernameBtn");
if (editBtn) {
  editBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const nameEl = document.getElementById("name-goes-here");
    if (!nameEl) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to edit your username.");
      return;
    }

    // if already editing, do nothing
    if (editBtn.dataset.editing === "true") return;

    const current = nameEl.textContent || "";

    // Make parent a flex container so the editor can occupy remaining width
    const parent = nameEl.parentElement; // h2.greet-combined
    const prevDisplay = parent.style.display;
    const prevAlignItems = parent.style.alignItems;
    const prevGap = parent.style.gap;
    parent.style.display = "flex";
    parent.style.alignItems = "center";
    parent.style.gap = "8px";

    // Create an editor wrapper that fills remaining width and stacks input + actions
    const editorWrapper = document.createElement("div");
    editorWrapper.className = "inline-editor";
    editorWrapper.style.flex = "1 1 auto";
    editorWrapper.style.minWidth = "0"; // allow flex children to shrink
    editorWrapper.style.display = "flex";
    editorWrapper.style.flexDirection = "column";
    editorWrapper.style.gap = "6px";
    // keep actions positioned absolutely so they don't increase the wrapper height
    editorWrapper.style.position = "relative";

    // create inline input with placeholder (stretches full width of wrapper)
    const input = document.createElement("input");
    input.type = "text";
    input.id = "editNameInput";
    input.value = ""; // empty, placeholder shows original username in grey
    input.placeholder = current.trim();
    input.className = "editor-input";
    // enforce max length of 13 characters on the client
    input.maxLength = 13;
    input.setAttribute("maxlength", "13");
    // style to appear as transparent text with underline
    input.style.width = "100%";
    input.style.boxSizing = "border-box";
    input.style.background = "transparent";
    input.style.border = "none";
    input.style.borderBottom = "2px solid #51624f";
    input.style.outline = "none";
    input.style.font = "inherit";
    input.style.color = "#2f2f2f";
    input.style.fontSize = "28px";
    input.style.fontWeight = "700";
    input.style.padding = "0 4px";
    input.style.transition = "border-color 0.2s ease";

    // actions row (buttons) that sits below the input and aligns right
    const actionsRow = document.createElement("div");
    actionsRow.className = "editor-actions";
    // absolute-position the actions below the input so the input stays vertically centered
    actionsRow.style.position = "absolute";
    actionsRow.style.right = "0";
    actionsRow.style.top = "calc(100% + 6px)";
    actionsRow.style.display = "flex";
    actionsRow.style.justifyContent = "flex-end";
    actionsRow.style.gap = "8px";

    // create Save and Cancel controls
    const saveBtn = document.createElement("a");
    saveBtn.href = "#";
    saveBtn.className = "view-all-btn";
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("a");
    cancelBtn.href = "#";
    cancelBtn.className = "view-all-btn";
    cancelBtn.textContent = "Cancel";

    // assemble editor
    actionsRow.appendChild(saveBtn);
    actionsRow.appendChild(cancelBtn);
    editorWrapper.appendChild(input);
    editorWrapper.appendChild(actionsRow);

    // insert editor after the name element
    nameEl.insertAdjacentElement("afterend", editorWrapper);

    // hide the edit button and name element while editing
    editBtn.style.display = "none";
    nameEl.style.display = "none";
    editBtn.dataset.editing = "true";

    input.focus();

    // save handler
    const onSave = async (ev) => {
      ev.preventDefault();
      const newName = input.value.trim();
      // client-side validation: enforce length <= 13
      if (newName.length > 13) {
        alert("Username must be 13 characters or fewer.");
        input.focus();
        return;
      }
      if (!newName) {
        alert("Username cannot be empty.");
        input.focus();
        return;
      }
      if (newName === current.trim()) {
        // no change
        cleanup();
        return;
      }

      try {
        await updateDisplayName(newName);
        nameEl.textContent = newName;
      } catch (err) {
        console.error("Failed to update username:", err);
        alert("Failed to update username. See console for details.");
      }

      cleanup();
    };

    // cancel handler
    const onCancel = (ev) => {
      ev.preventDefault();
      cleanup();
    };

    function cleanup() {
      // remove created editor and restore edit button
      try {
        editorWrapper.remove();
      } catch (e) {}

      // restore name element and edit button
      nameEl.style.display = "inline-block";
      editBtn.style.display = "inline-block";
      delete editBtn.dataset.editing;

      // restore parent display
      parent.style.display = prevDisplay || "";
      parent.style.alignItems = prevAlignItems || "";
      parent.style.gap = prevGap || "";

      // remove listeners
      saveBtn.removeEventListener("click", onSave);
      cancelBtn.removeEventListener("click", onCancel);
      input.removeEventListener("keydown", onKeyDown);
    }

    // allow Enter to save and Escape to cancel
    const onKeyDown = (ev) => {
      if (ev.key === "Enter") {
        onSave(ev);
      } else if (ev.key === "Escape") {
        onCancel(ev);
      }
    };

    saveBtn.addEventListener("click", onSave);
    cancelBtn.addEventListener("click", onCancel);
    input.addEventListener("keydown", onKeyDown);
  });
}

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
