import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

// Get the document ID from the URL
function getDocIdFromUrl() {
    const params = new URL(window.location.href).searchParams;
    return params.get("docID");
}

// Fetch the Event and display its name and image
async function displayEventInfo() {
    const id = getDocIdFromUrl();

    try {
        const EventRef = doc(db, "Events", id);
        const EventSnap = await getDoc(eventRef);

        const event = eventSnap.data();
        const name = event.name;
        const code = event.code;

        // Update the page
        document.getElementById("eventName").textContent = name;
        const img = document.getElementById("eventImage");
        img.src = `./images/${code}.jpg`;
        img.alt = `${name} image`;
    } catch (error) {
        console.error("Error loading Event:", error);
        document.getElementById("eventName").textContent = "Error loading event.";
    }
}

displayEventInfo();
