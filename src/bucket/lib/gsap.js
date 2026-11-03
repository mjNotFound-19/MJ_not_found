import { useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { getLenis } from "../../lib/scroll";

// One place registers every plugin the bucket list uses, so components can
// import from here and never hit an unregistered plugin.
gsap.registerPlugin(useGSAP, ScrollTrigger, Draggable, InertiaPlugin, MotionPathPlugin, DrawSVGPlugin);

export { gsap, useGSAP, ScrollTrigger, Draggable };

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Lenis moves the page itself, so tell ScrollTrigger on every Lenis frame
// rather than waiting for the browser's (throttled) native scroll event.
// Call after useSmoothScroll in the same component, so the instance exists.
export function useLenisScrollTrigger(enabled) {
  useEffect(() => {
    const lenis = getLenis();
    if (!enabled || !lenis) return undefined;
    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);
    // Fonts and the WebGL scene settle after first paint and shift trigger positions.
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      window.clearTimeout(refresh);
      lenis.off("scroll", update);
    };
  }, [enabled]);
}
