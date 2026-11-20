// Loaded as a plain blocking script from index.html (the site's CSP allows no inline scripts).
  // Before first paint: mark JS as working and apply a saved theme (else the system one applies via CSS).
  (function () {
    var root = document.documentElement;
    root.classList.add("js");
    try { var t = localStorage.getItem("gazette-theme"); root.dataset.theme = t === "dark" ? "dark" : "light"; } catch (e) { root.dataset.theme = "light"; }
  })();
