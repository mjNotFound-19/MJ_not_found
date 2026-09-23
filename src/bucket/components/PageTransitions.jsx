import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DecodeText from "../../components/motion/DecodeText";
import { useLeaving } from "../../lib/pageTransition";

const EASE = [0.76, 0, 0.24, 1];

// Arriving from the portfolio: start on the frame its exit ended on (paper +
// centred title), then fly the title up and lift the cover off the page.
export function ArriveFromPortfolio({ active, onDone }) {
  const [show, setShow] = useState(active);

  useEffect(() => {
    if (!active) return undefined;
    const t = window.setTimeout(() => {
      setShow(false);
      onDone?.();
    }, 450);
    return () => window.clearTimeout(t);
  }, [active, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-[var(--paper)]"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.9, ease: EASE }}
          aria-hidden="true"
        >
          <motion.p
            className="transition-title"
            exit={{ y: "-60%", opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            Bucket List
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Bucket list -> portfolio: the matrix floods back in from the click point,
// showing the portfolio's own boot screen so its preloader picks up seamlessly.
export function LeaveToPortfolio() {
  const leaving = useLeaving();
  const active = leaving?.to === "portfolio";
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    setCount(0);
    const start = performance.now();
    const id = window.setInterval(() => {
      // Only counts to ~20: the portfolio's preloader carries on from here.
      setCount(Math.min(20, Math.round(((performance.now() - start) / 900) * 20)));
    }, 50);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[2147483646]"
          style={{ background: "#01030c", color: "#f6f7ff" }}
          initial={{ clipPath: `circle(0% at ${leaving.x}px ${leaving.y}px)` }}
          animate={{ clipPath: `circle(150% at ${leaving.x}px ${leaving.y}px)` }}
          transition={{ duration: 0.8, ease: EASE }}
          aria-hidden="true"
        >
          {/* Same container as the portfolio preloader, so the handoff lines up. */}
          <div className="h-full flex flex-col justify-between py-10 mx-auto" style={{ width: "min(1200px, 92vw)" }}>
            <p className="boot-mono text-xs text-white/40">manas@jha:~$ boot portfolio</p>
            <div className="flex items-end justify-between gap-6">
              <p className="boot-name">
                <DecodeText text="Manas Jha" className="boot-gradient" delay={250} duration={900} />
              </p>
              <p className="boot-mono boot-count">{String(count).padStart(3, "0")}</p>
            </div>
            <div className="h-px w-full bg-white/10 overflow-hidden">
              <div className="h-full bg-[#00aeef]" style={{ width: `${count}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
