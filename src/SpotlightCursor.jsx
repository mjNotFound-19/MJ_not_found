// src/SpotlightCursor.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A precise dot plus a ring that trails behind it. The ring swells over links
// and buttons but stays an unfilled outline, and `data-cursor` labels appear in a
// pill offset below-right of the pointer, so neither ever covers the text being read.
export default function SpotlightCursor({ size = 8, ringSize = 36, disabledOnTouch = true }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [touchOnlyPointer, setTouchOnlyPointer] = useState(false);

  useEffect(() => {
    setPortalTarget(document.body);
    return () => setPortalTarget(null);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const evaluate = () => setTouchOnlyPointer(navigator.maxTouchPoints > 0 && !media.matches);
    evaluate();
    media.addEventListener("change", evaluate);
    return () => media.removeEventListener("change", evaluate);
  }, []);

  useEffect(() => {
    if (disabledOnTouch && touchOnlyPointer) return undefined;
    if (!portalTarget) return undefined;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return undefined;

    const style = document.createElement("style");
    style.innerHTML = "* { cursor: none !important; }";
    document.head.appendChild(style);

    const mouse = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let rafId = 0;

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dot.style.transform = `translate3d(${mouse.x - size / 2}px, ${mouse.y - size / 2}px, 0)`;
      label.style.transform = `translate3d(${mouse.x + 18}px, ${mouse.y + 20}px, 0)`;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const onOver = (e) => {
      const labelled = e.target.closest?.("[data-cursor]");
      const interactive = e.target.closest?.("a, button, [role='button']");
      const text = labelled?.getAttribute("data-cursor") ?? "";
      targetScale = interactive || labelled ? 1.5 : 1;
      label.textContent = text;
      label.classList.toggle("is-visible", Boolean(text));
      ring.classList.toggle("is-hover", Boolean(interactive || labelled));
    };

    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
      label.classList.remove("is-visible");
    };

    const tick = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      scale += (targetScale - scale) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x - ringSize / 2}px, ${ringPos.y - ringSize / 2}px, 0) scale(${scale})`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      style.remove();
    };
  }, [size, ringSize, disabledOnTouch, touchOnlyPointer, portalTarget]);

  if (!portalTarget || (disabledOnTouch && touchOnlyPointer)) return null;

  return createPortal(
    <>
      <div
        ref={ringRef}
        className="cursor-ring"
        aria-hidden="true"
        style={{ width: ringSize, height: ringSize, opacity: 0 }}
      />
      <span ref={labelRef} className="cursor-label" aria-hidden="true" />
      <div
        ref={dotRef}
        className="cursor-dot"
        aria-hidden="true"
        style={{ width: size, height: size, opacity: 0 }}
      />
    </>,
    portalTarget
  );
}
