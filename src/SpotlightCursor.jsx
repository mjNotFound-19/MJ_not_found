// src/SpotlightCursor.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function SpotlightCursor({
  size = 14, // small circle
  color = "rgba(0, 180, 255, 0.9)", // neon blue
  glow = "0 0 10px rgba(0, 180, 255, 0.8)",
  disabledOnTouch = true,
}) {
  const dotRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const styleRef = useRef(null);
  const [touchOnlyPointer, setTouchOnlyPointer] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    setPortalTarget(document.body);
    return () => setPortalTarget(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const evaluatePointer = () => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      const touchOnly = navigator.maxTouchPoints > 0 && !fine;
      setTouchOnlyPointer(touchOnly);
    };
    evaluatePointer();
    const media = window.matchMedia("(pointer: fine)");
    const listener = () => evaluatePointer();
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    // Disable on touchscreens
    if (typeof window === "undefined") return undefined;
    if (disabledOnTouch && touchOnlyPointer) return undefined;
    if (!portalTarget) return undefined;

    const el = dotRef.current;
    if (!el) return;

    // ?? Hide native cursor everywhere
    const style = document.createElement("style");
    style.innerHTML = `
      * {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;

    const move = (e) => {
      const x = e.clientX - size / 2;
      const y = e.clientY - size / 2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [size, disabledOnTouch, portalTarget]);

  if (!portalTarget || (disabledOnTouch && touchOnlyPointer)) return null;

  return createPortal(
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: glow,
        pointerEvents: "none",
        zIndex: 2147483647,
        mixBlendMode: "screen",
        transition: "transform 25ms linear",
        willChange: "transform",
      }}
    />,
    portalTarget
  );
}
