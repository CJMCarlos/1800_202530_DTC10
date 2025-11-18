# TimeMate

## Overview

Our team DTC10 (The Socks) is developing TimeMate to help students and employed people stay organized and manage procrastination by reminding them of tasks, deadlines, and events, encouraging them to complete tasks on time in school or workplace.

Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile project management, and demonstrates integration with Firebase backend services for storing user favorites.

---

## Features

- User authentication with Firebase (email/password signup and login)
- Create, edit, and delete tasks/events with titles, descriptions, and due dates
- Mark tasks as completed with visual feedback
- View completed tasks in a separate "Completed" section
- Restore completed tasks back to active tasks
- Search and filter events in real-time
- Personalized user profile with profile picture upload
- Edit username and password from user profile
- Smooth page transitions and animations
- Light and dark mode toggle (theme persisted in local storage)
- Responsive design for desktop and mobile devices
- Task/event data persisted in Firestore database

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication & Firestore Database)
- **Styling**: Custom CSS with dark mode support
- **Version Control**: Git

---

## Usage

1. Visit the application (deployed or local instance).
2. Sign up or log in with your email and password.
3. Create tasks/events using the "+ Add" button on the Events page.
4. Set titles, descriptions, and due dates for your tasks.
5. Mark tasks as completed by checking the checkbox.
6. View completed tasks on the "Completed" page and restore or delete them.
7. Manage your profile: upload a profile picture, edit username, and change password.
8. Toggle between light and dark mode using the theme button in the menu.

---

## Project Structure

```
1800_202530_DTC10/
├── src/
│   ├── components/
│   │   ├── site-navbar.js
│   │   └── site-footer.js
│   ├── main.js
│   ├── event.js
│   ├── complete.js
│   ├── profile.js
│   ├── authentication.js
│   ├── firebaseConfig.js
│   ├── pageTransition.js
│   └── [other modules]
├── styles/
│   ├── style.css
│   ├── home.css
│   ├── event.css
│   ├── complete.css
│   ├── profile.css
│   └── [other stylesheets]
├── images/
│   ├── image1.png (logo)
│   ├── editprofile.svg
│   └── [other assets]
├── [HTML pages]
│   ├── index.html
│   ├── event.html
│   ├── complete.html
│   ├── profile.html
│   ├── login.html
│   └── [other pages]
├── package.json
└── README.md
```

---

## Contributors

- **Austyn** - BCIT CST Student with a passion for outdoor adventures and user-friendly applications. Fun fact: Loves solving Rubik's Cubes in under a minute.
- **Jericho** - BCIT CST Student, Frontend enthusiast with a knack for creative design. Fun fact: Has a collection of over 50 houseplants.
- **Carlos** - BCIT CST Student, Frontend enthusiast with a knack for creative design. Fun fact: Has a collection of over 50 houseplants.

---

## Acknowledgments

- User data and image profiles are for demonstration purposes only.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [Google Material Icons](https://fonts.google.com/icons) and [FontAwesome](https://fontawesome.com/).
- Firebase documentation and tutorials provided essential guidance for backend integration.

---

## Limitations and Future Work

### Limitations

- Limited task filtering options (basic search only; no advanced filters by date, priority, or category).
- No recurring tasks or task templates.
- Profile picture storage is limited to base64 data URIs (large image sizes may impact performance).
- Accessibility features can be further improved (e.g., ARIA labels, keyboard navigation enhancements).
- No real-time collaboration or task sharing between users.
- Dark mode theme toggle is stored locally; no cloud-based theme preference sync.
- No notification/reminder system for upcoming deadlines.
- Limited offline functionality; requires internet connection for all operations.

### Future Work

- Implement task categories and tags for better organization.
- Add recurring task functionality (daily, weekly, monthly).
- Create task priority levels with visual indicators.
- Implement due date reminders and push notifications.
- Add task subtasks/checklists within events.
- Enable task sharing and collaboration between users.
- Implement time-tracking features for tasks.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
