import { AnimatePresence, motion } from "framer-motion";
import { useLeaving } from "../lib/pageTransition";

const EASE = [0.76, 0, 0.24, 1];

// Portfolio -> f1.h, same gesture as the bucket-list link: f1.h's near-black
// floods out of the click point and its logo rises in. It ends on the colour
// f1.h's start-lights intro opens on, so the site's own intro follows straight on.
export default function LeaveToF1() {
  const leaving = useLeaving();
  const active = leaving?.to === "f1";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="f1h fixed inset-0 z-[2147483646] grid place-items-center"
          style={{ background: "#07080a" }}
          initial={{ clipPath: `circle(0% at ${leaving.x}px ${leaving.y}px)` }}
          animate={{ clipPath: `circle(150% at ${leaving.x}px ${leaving.y}px)` }}
          transition={{ duration: 0.8, ease: EASE }}
          aria-hidden="true"
        >
          <p className="f1h-logo f1h-mono f1-leave-logo">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              >
                &lt;<b>f1</b>.h&gt;
              </motion.span>
            </span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
