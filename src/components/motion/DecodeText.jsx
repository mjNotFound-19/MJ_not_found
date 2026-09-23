import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789";

// Scrambles through Matrix glyphs, then resolves left to right into the real text.
export default function DecodeText({ text, className, delay = 200, duration = 1100 }) {
  const reduceMotion = useReducedMotion();
  const [output, setOutput] = useState(reduceMotion ? text : "");

  useEffect(() => {
    if (reduceMotion) {
      setOutput(text);
      return undefined;
    }
    let rafId = 0;
    let start = 0;
    const timeout = window.setTimeout(() => {
      const tick = (now) => {
        if (!start) start = now;
        const progress = Math.min(1, (now - start) / duration);
        const resolved = Math.floor(progress * text.length);
        const next = text
          .split("")
          .map((char, i) => {
            if (char === " " || i < resolved) return char;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setOutput(next);
        if (progress < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [text, delay, duration, reduceMotion]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{output || " "}</span>
    </span>
  );
}
