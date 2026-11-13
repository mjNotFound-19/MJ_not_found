// Loaded as a plain blocking script from index.html (the site's CSP allows no inline scripts).
  // Before first paint: note that JS works, and apply the saved or system theme.
  (function () {
    var root = document.documentElement;
    root.classList.add("js");
    var saved = null;
    try { saved = localStorage.getItem("theme"); } catch (e) {}
    var dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "dark" : "light";
  })();
