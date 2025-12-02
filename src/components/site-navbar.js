class SiteNavbar extends HTMLElement {
  connectedCallback() {
    const currentPage = window.location.pathname.split("/").pop();

    // 1. get saved theme OR default to light
    const savedTheme = localStorage.getItem("theme") || "light";

    // 2. apply theme
    document.documentElement.setAttribute("data-theme", savedTheme);

    const isDarkMode = savedTheme === "dark";

    this.innerHTML = `
<nav class="navbar">
  <div class="navbar-center">
    <img src="/images/image1.png" width="150" height="100" alt="TimeMate Logo" class="navbar-logo" />
  </div>

  <button class="icon" type="button" aria-label="Toggle menu">
    <svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="42px" fill="#2f2f2f">
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
    </svg>
  </button>
</nav>

<div class="topnav-links" id="menu">
  <a href="help.html" class="${
    currentPage === "help.html" ? "active" : ""
  }">Help</a>
  <a href="contact.html" class="${
    currentPage === "contact.html" ? "active" : ""
  }">Contact</a>
  <a href="about.html" class="${
    currentPage === "about.html" ? "active" : ""
  }">About Us</a>

  <!-- Always enabled -->
  <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q8 0 15 .5t15 2.5q-36 32-57.5 79.5T432-600q0 90 63 153t153 63q46 0 93.5-21.5T821-450q2 7 2.5 14t.5 14q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Z"/>
    </svg>
    <span>${isDarkMode ? "Light" : "Dark"}</span>
  </button>
</div>
    `;

    // toggle menu
    const links = this.querySelector("#menu");
    const iconBtn = this.querySelector(".icon");
    const themeToggleBtn = this.querySelector("#themeToggle");

    iconBtn.addEventListener("click", () => {
      links.style.display = links.style.display === "flex" ? "none" : "flex";
    });

    document.addEventListener("click", (e) => {
      if (!this.contains(e.target)) links.style.display = "none";
    });

    // 3. theme toggle (always enabled)
    themeToggleBtn.addEventListener("click", () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";
      const newTheme = isDark ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      // update button text
      themeToggleBtn.querySelector("span").textContent = isDark
        ? "Dark"
        : "Light";
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
