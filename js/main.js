export function injectNavbar() {
  if (document.getElementById("site-navbar")) return;

  const nav = document.createElement("nav");
  nav.id = "site-navbar";
  nav.innerHTML = `
    <a href="index.html" class="logo">MoodFlix</a>
    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="explore.html">Explore</a>
      <a href="try-now.html">Find Vibe</a>
      <a href="account.html">Account</a>
      <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">
        <span class="theme-icon" aria-hidden="true">◐</span>
        <span class="theme-label">Theme</span>
      </button>
    </div>
  `;
  document.body.prepend(nav);

  const btn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
  btn?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon(next);
  });
}

export function injectFooter() {
  if (document.getElementById("site-footer")) return;
  const footer = document.createElement("footer");
  footer.id = "site-footer";
  footer.innerHTML = `
    <div class="footer-inner">
      <div>
        <strong>MoodFlix</strong>
        <p>Discover movies, series, and music based on mood.</p>
      </div>
      <div class="footer-links">
        <a href="index.html">Home</a>
        <a href="explore.html">Explore</a>
        <a href="try-now.html">Find Vibe</a>
        <a href="account.html">Account</a>
      </div>
      <p class="footer-credit">&copy; 2026 MoodFlix. Developed by Me.</p>
    </div>`;
  document.body.appendChild(footer);
}

export function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.style.cssText = "position:fixed;right:16px;bottom:16px;padding:12px 16px;border-radius:12px;color:#fff;z-index:9999;max-width:320px;box-shadow:0 12px 30px rgba(0,0,0,.25);font-family:system-ui;background:#222;";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.background = type === "error" ? "#b42318" : "#16794c";
  toast.style.display = "block";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

export function enablePasswordToggles() {
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? 'Hide' : 'Show';
    });
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector("#theme-toggle .theme-icon");
  if (icon) icon.textContent = theme === "dark" ? "◐" : "◑";
}

window.injectNavbar = injectNavbar;
window.injectFooter = injectFooter;
window.showToast = showToast;
window.enablePasswordToggles = enablePasswordToggles;
