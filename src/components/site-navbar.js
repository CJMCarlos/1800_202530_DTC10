class SiteNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
<nav class="navbar navbar-expand-lg">
  <div class="navbar-center">
    <img src="/images/image1.png" width="150" height="100" alt="TimeMate Logo" class="navbar-logo" />
  </div>
</nav>
    `;
  }
}

customElements.define("site-navbar", SiteNavbar);
