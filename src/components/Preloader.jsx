import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DecodeText from "./motion/DecodeText";

const CURTAIN_EASE = [0.76, 0, 0.24, 1];

// Counts to 100 while the name decodes, then lifts like a curtain. When arriving
// from the bucket list, its exit already showed this screen counting to ~20 with
// the name decoded, so we resume from there instead of starting over.
export default function Preloader({ onDone, startAt = 0, duration = 1500, decoded = false }) {
  const [count, setCount] = useState(startAt);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let rafId = 0;
    let finished = false;
    const start = performance.now();
    const finish = () => {
      if (finished) return;
      finished = true;
      setCount(100);
      setVisible(false);
      onDone?.();
    };
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out so the counter slows as it approaches 100.
      setCount(Math.round(startAt + (1 - Math.pow(1 - t, 3)) * (100 - startAt)));
      if (t < 1) rafId = requestAnimationFrame(tick);
      else finish();
    };
    rafId = requestAnimationFrame(tick);
    // Animation frames don't run in background tabs; a timer guarantees the page still loads.
    const fallback = window.setTimeout(finish, duration + 400);
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(fallback);
    };
  }, [onDone, startAt, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: CURTAIN_EASE }}
          aria-hidden="true"
        >
          <div className="section-shell h-full flex flex-col justify-between py-10">
            <p className="font-mono text-xs text-white/40">manas@jha:~$ boot portfolio</p>
            <div className="flex items-end justify-between gap-6">
              <p className="text-[clamp(2.2rem,7vw,5.5rem)] font-bold leading-none tracking-tight">
                {decoded ? (
                  <span className="hero-name">Manas Jha</span>
                ) : (
                  <DecodeText text="Manas Jha" className="hero-name" delay={0} duration={1200} />
                )}
              </p>
              <p className="font-mono text-[clamp(2.5rem,9vw,7rem)] leading-none text-primary tabular-nums">
                {String(count).padStart(3, "0")}
              </p>
            </div>
            <div className="h-px w-full bg-white/10 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${count}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
