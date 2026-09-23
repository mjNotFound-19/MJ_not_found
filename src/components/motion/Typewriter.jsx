import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Types each phrase, holds it, deletes it, then moves to the next one.
export default function Typewriter({ phrases, className, typeMs = 45, holdMs = 1800 }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const phrase = phrases[index % phrases.length];

  useEffect(() => {
    if (reduceMotion) return undefined;
    let delay = deleting ? typeMs / 2 : typeMs;
    if (!deleting && length === phrase.length) delay = holdMs;
    if (deleting && length === 0) delay = 300;

    const timeout = window.setTimeout(() => {
      if (!deleting && length === phrase.length) {
        setDeleting(true);
      } else if (deleting && length === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setLength((prev) => prev + (deleting ? -1 : 1));
      }
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [length, deleting, phrase, phrases.length, typeMs, holdMs, reduceMotion]);

  if (reduceMotion) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={className} aria-live="off">
      {phrase.slice(0, length)}
      <span className="terminal-caret" aria-hidden="true" />
    </span>
  );
}
