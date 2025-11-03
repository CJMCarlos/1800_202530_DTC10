import { onAuthReady } from "./authentication.js";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

function showDashboard() {
  // Wait for Firebase to determine the current authentication state.
    onAuthReady((user) => {
    if (!user) {
      // If no user is signed in → redirect back to login page.
    location.href = "index.html";
    return;
    }

    // If a user is logged in:
    const name = user.displayName || user.email;

    const nameElement = document.getElementById("name-goes-here");
    if (nameElement) {
    nameElement.textContent = `${name}!`;
    }
});
}

showDashboard();

function addTaskData() {
    const tasksRef = collection(db, "tasks");
    console.log("Adding sample Task data...");
    addDoc(tasksRef, {
    code: "BBY01",
    name: "Burnaby Lake Park Trail",
    city: "Burnaby",
    level: "easy",
    details: "A lovely place for a lunch walk.",
    length: 10,
    hike_time: 60,
    lat: 49.2467097082573,
    lng: -122.9187029619698,
    last_updated: serverTimestamp()
});
    addDoc(tasksRef, {
    code: "AM01",
    name: "Buntzen Lake Trail",
    city: "Anmore",
    level: "moderate",
    details: "Close to town, and relaxing.",
    length: 10.5,
    hike_time: 80,
    lat: 49.3399431028579,
    lng: -122.85908496766939,
    last_updated: serverTimestamp()
});
addDoc(tasksRef, {
    code: "NV01",
    name: "Mount Seymour Trail",
    city: "North Vancouver",
    level: "hard",
    details: "Amazing ski slope views.",
    length: 8.2,
    hike_time: 120,
    lat: 49.38847101455571,
    lng: -122.94092543551031,
    last_updated: serverTimestamp()
});
}

async function seedTasks() {
    const tasksRef = collection(db, "tasks");
    const querySnapshot = await getDocs(tasksRef);

  // Check if the collection is empty
    if (querySnapshot.empty) {
    console.log("Task collection is empty. Seeding data...");
    addTaskData();
    } else {
    console.log("Task collection already contains data. Skipping seed.");
}
}

// Call the seeding function when the main.html page loads.
seedTasks();

async function displayCardsDynamically() {
    let cardTemplate = document.getElementById("TaskCardTemplate");
    const tasksCollectionRef = collection(db, "tasks");

    try {
    const querySnapshot = await getDocs(tasksCollectionRef);
    querySnapshot.forEach(doc => {
      // Clone the template
    let newcard = cardTemplate.content.cloneNode(true);
      const task = doc.data(); // Get Task data once

      // Populate the card with Task data
    newcard.querySelector('.card-title').textContent = task.name;
    newcard.querySelector('.card-text').textContent = task.details || `Located in ${task.city}.`;
    newcard.querySelector('.card-length').textContent = task.length;

      // 👇 ADD THIS LINE TO SET THE IMAGE SOURCE
    newcard.querySelector('.card-image').src = `./images/${task.code}.jpg`;
      // Add the link with the document ID
    newcard.querySelector(".read-more").href = `eachTask.html?docID=${doc.id}`;

      // Attach the new card to the container
    document.getElementById("tasks-go-here").appendChild(newcard);
    });
} catch (error) {
    console.error("Error getting documents: ", error);
}
}
