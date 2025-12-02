class m extends HTMLElement{connectedCallback(){const a=window.location.pathname.split("/").pop(),n=!!localStorage.getItem("uid"),s=localStorage.getItem("theme");if(!n)document.documentElement.setAttribute("data-theme","light");else{const t=s==="dark"?"dark":"light";document.documentElement.setAttribute("data-theme",t)}const i=document.documentElement.getAttribute("data-theme")==="dark";this.innerHTML=`
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
  <a href="help.html" class="${a==="help.html"?"active":""}">Help</a>
  <a href="contact.html" class="${a==="contact.html"?"active":""}">Contact</a>
  <a href="about.html" class="${a==="about.html"?"active":""}">About Us</a>

  <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M480-120q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-480q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-840q8 0 15 .5t15 2.5q-36 32-57.5 79.5T432-600q0 90 63 153t153 63q46 0 93.5-21.5T821-450q2 7 2.5 14t.5 14q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-120Z"/>
    </svg>
    <span>${i?"Light":"Dark"}</span>
  </button>
</div>
    `;const e=this.querySelector("#menu"),c=this.querySelector(".icon"),l=this.querySelector("#themeToggle");c.addEventListener("click",()=>{e.style.display=e.style.display==="flex"?"none":"flex"}),e.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>e.style.display="none")}),document.addEventListener("click",t=>{this.contains(t.target)||(e.style.display="none")}),l.addEventListener("click",()=>{const t=document.documentElement.getAttribute("data-theme")==="dark",o=t?"light":"dark";document.documentElement.setAttribute("data-theme",o),n&&localStorage.setItem("theme",o),l.querySelector("span").textContent=t?"Dark":"Light"})}}customElements.define("site-navbar",m);
