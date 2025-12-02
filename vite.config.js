import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        welcome: resolve(__dirname, "welcome.html"),
        event: resolve(__dirname, "event.html"),
        complete: resolve(__dirname, "complete.html"),
        profile: resolve(__dirname, "profile.html"),
        addEvent: resolve(__dirname, "add-event.html"),
        help: resolve(__dirname, "help.html"),
        about: resolve(__dirname, "about.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
