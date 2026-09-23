import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function Word({ children, progress, range, accent }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <span className="relative inline-block mr-[0.25em]">
      <motion.span style={{ opacity }} className={accent ? "text-primary" : "text-white"}>
        {children}
      </motion.span>
    </span>
  );
}

// Each word lights up in turn as the paragraph scrolls through the viewport.
// Words listed in `accents` finish in the brand colour.
export default function ScrollFillText({ text, accents = [], className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const words = text.split(" ");
  const accentSet = new Set(accents.map((w) => w.toLowerCase()));

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          const bare = word.replace(/[^\w-]/g, "").toLowerCase();
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]} accent={accentSet.has(bare)}>
              {word}
            </Word>
          );
        })}
      </span>
    </p>
  );
}
