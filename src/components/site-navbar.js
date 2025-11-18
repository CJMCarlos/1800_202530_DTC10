class SiteNavbar extends HTMLElement {
  connectedCallback() {
    const currentPage = window.location.pathname.split("/").pop();

    this.innerHTML = `
<nav class="navbar">
  <div class="navbar-center">
    <img src="/images/image1.png" width="150" height="100" alt="TimeMate Logo" class="navbar-logo" />
  </div>

    <!-- Hamburger menu -->
  <button class="icon" type="button" aria-label="Toggle menu">
    <svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="42px" fill="#2f2f2f">
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
    </svg>
  </button>
</nav>

  <div class="topnav-links" id="menu">
    <a href="help.html" class="${currentPage === "help.html" ? "active" : ""}">Help</a>
    <a href="contact.html" class="${currentPage === "contact.html" ? "active" : ""}">Contact</a>
    <a href="about.html" class="${currentPage === "about.html" ? "active" : ""}">About Us</a>
  </div>


    `;

    // JS to toggle the dropdown
    const links = this.querySelector("#menu");
    const iconBtn = this.querySelector(".icon");

    iconBtn.addEventListener("click", () => {
      if (links.style.display === "flex") {
        links.style.display = "none";
      } else {
        links.style.display = "flex";
      }
    });
  }
}

customElements.define("site-navbar", SiteNavbar);
