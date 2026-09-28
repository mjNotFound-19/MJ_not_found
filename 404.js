// Site is served from the root of manasjha.online.
const path = window.location.pathname;

// only redirect if not trying to access a file (like .pdf, .png, .jpg, etc.)
if (path !== "/" && !path.match(/\.[a-zA-Z0-9]+$/)) {
  window.location.replace("/");
}
