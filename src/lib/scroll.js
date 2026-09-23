// Shared handle to the Lenis instance so any component can scroll smoothly.
let lenisInstance = null;

export const setLenis = (instance) => {
  lenisInstance = instance;
};

export const getLenis = () => lenisInstance;

export const NAV_OFFSET = 88;

// Fast start, long soft landing: makes jump-to-section feel glided rather than dragged.
export const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

// Elements inside a horizontally pinned track can't be reached by their
// vertical offset, so their owner registers a function returning the scrollY
// that brings them into view.
const customTargets = new Map();

export const registerScrollTarget = (id, getY) => {
  customTargets.set(id, getY);
  return () => customTargets.delete(id);
};

export function scrollToId(id, { immediate = false } = {}) {
  const custom = customTargets.get(id);
  if (custom) {
    const y = custom();
    if (lenisInstance) lenisInstance.scrollTo(y, { immediate, duration: 1.6, easing: expoOut });
    else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
    return;
  }
  const target = document.getElementById(id);
  if (!target) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: -NAV_OFFSET, immediate, duration: 1.6, easing: expoOut });
    return;
  }
  const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
}
