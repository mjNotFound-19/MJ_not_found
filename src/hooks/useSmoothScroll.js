import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis, scrollToId, expoOut } from "../lib/scroll";

// Lenis smooths wheel/trackpad scrolling; touch devices keep native scrolling.
export default function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      smoothWheel: true,
    });    setLenis(lenis);

    let rafId = 0;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Route in-page anchor clicks (#about, #contact, ...) through Lenis.
    const onClick = (event) => {
      if (event.defaultPrevented) return;
      const link = event.target.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      event.preventDefault();
      if (id === "top") {
        lenis.scrollTo(0, { duration: 1.6, easing: expoOut });
      } else {
        scrollToId(id);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      setLenis(null);
    };
  }, [enabled]);
}
