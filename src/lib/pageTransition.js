import { useEffect, useState } from "react";

// Cross-page transitions between the portfolio and the bucket list. They're
// separate documents, so a transition has two halves: the page being left plays
// an exit overlay and records where it's going; the page arriving reads that
// record and plays the matching entry, starting from the exact frame the exit
// ended on.

const KEY = "mj:page-transition";
const LEAVE_EVENT = "mj:page-leave";
export const LEAVE_MS = 950;

// Links opt in with `data-transition="bucket"` or `data-transition="portfolio"`.
export function useTransitionLinks() {
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.("a[data-transition]");
      if (!link || event.defaultPrevented) return;
      // Let the browser handle new-tab / new-window / download intents.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      event.preventDefault();
      const href = link.href;
      const to = link.dataset.transition;
      // Keyboard activation has no pointer position; grow from the link instead.
      const rect = link.getBoundingClientRect();
      const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
      const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;

      try {
        sessionStorage.setItem(KEY, JSON.stringify({ to, at: Date.now() }));
      } catch {
        // Storage can be unavailable (private mode); the exit still plays.
      }
      window.dispatchEvent(new CustomEvent(LEAVE_EVENT, { detail: { to, x, y } }));
      window.setTimeout(() => window.location.assign(href), LEAVE_MS);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

// The exit overlay's state: null, or { to, x, y } while leaving. Resets when the
// page is restored from the back/forward cache, so Back never lands on a page
// still covered by the overlay.
export function useLeaving() {
  const [leaving, setLeaving] = useState(null);
  useEffect(() => {
    const onLeave = (event) => setLeaving(event.detail);
    const onShow = (event) => {
      if (event.persisted) setLeaving(null);
    };
    window.addEventListener(LEAVE_EVENT, onLeave);
    window.addEventListener("pageshow", onShow);
    return () => {
      window.removeEventListener(LEAVE_EVENT, onLeave);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);
  return leaving;
}

// Did we arrive here via a transition aimed at this page? The record is consumed
// on first read and the answer cached for the page's lifetime, so repeat calls
// (e.g. StrictMode running initializers twice) all get the same answer.
let arrival;
export function readArrival(page) {
  if (arrival === undefined) {
    arrival = null;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) {
        sessionStorage.removeItem(KEY);
        const { to, at } = JSON.parse(raw);
        if (Date.now() - at < 8000) arrival = to;
      }
    } catch {
      // Storage unavailable: treat as a normal load.
    }
  }
  return arrival === page;
}
