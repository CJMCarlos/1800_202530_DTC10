class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<footer class="minimal-footer">
  <div class="footer-nav">

    <!-- Home -->
    <a class="nav-btn" href="index.html">
      <svg viewBox="0 0 24 24">
        <path d="M3 12l9-9 9 9M5 10v10h14V10"/>
      </svg>
      <span>Home</span>
    </a>

    <!-- Events -->
    <a class="nav-btn" href="event.html">
      <svg viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="18" rx="3"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
      </svg>
      <span>Events</span>
    </a>

    <!-- FAB Space -->
    <div class="nav-space"></div>

    <!-- Completed -->
    <a class="nav-btn" href="complete.html">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      <span>Completed</span>
    </a>

    <!-- Profile -->
    <a class="nav-btn" href="profile.html">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 20c0-4 4-6 6-6s6 2 6 6"/>
      </svg>
      <span>Profile</span>
    </a>

    <!-- FAB Add -->
    <a class="fab" href="add.html">
      <svg viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" stroke="#3f3f3f" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </a>

  </div>
</footer>
`;
  }
}

customElements.define("site-footer", SiteFooter);
