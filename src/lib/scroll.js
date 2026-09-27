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

// `onComplete` runs once the scroll has settled (a timer stands in for it when
// native smooth scrolling is used, since that has no completion event).
export function scrollToId(id, { immediate = false, duration = 1.6, onComplete } = {}) {
  const custom = customTargets.get(id);
  const target = custom ? null : document.getElementById(id);
  if (!custom && !target) return;

  if (lenisInstance) {
    const dest = custom ? custom() : target;
    const offset = custom ? 0 : -NAV_OFFSET;
    lenisInstance.scrollTo(dest, { offset, immediate, duration, easing: expoOut, onComplete });
    return;
  }
  const top = custom ? custom() : target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  if (onComplete) window.setTimeout(onComplete, immediate ? 0 : 900);
}
