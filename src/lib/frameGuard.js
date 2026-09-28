// Clickjacking guard. GitHub Pages can't send X-Frame-Options and a <meta> CSP
// can't carry frame-ancestors, so refuse to render inside someone else's frame.
// Imported first by each entry so it runs before anything paints.
if (window.top !== window.self) {
  document.documentElement.style.display = "none";
  try {
    window.top.location = window.self.location.href;
  } catch {
    // Sandboxed frame: stay hidden.
  }
}
