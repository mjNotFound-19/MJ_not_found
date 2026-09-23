import { AnimatePresence, motion } from "framer-motion";
import { useLeaving } from "../lib/pageTransition";

const EASE = [0.76, 0, 0.24, 1];

// Portfolio -> bucket list: warm paper floods out of the click point and the
// bucket list's title rises in. The bucket page opens on this exact frame.
export default function LeaveToBucket() {
  const leaving = useLeaving();
  const active = leaving?.to === "bucket";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[2147483646] grid place-items-center"
          style={{ background: "#ebe9e4", color: "#111" }}
          initial={{ clipPath: `circle(0% at ${leaving.x}px ${leaving.y}px)` }}
          animate={{ clipPath: `circle(150% at ${leaving.x}px ${leaving.y}px)` }}
          transition={{ duration: 0.8, ease: EASE }}
          aria-hidden="true"
        >
          <p className="transition-title">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
              >
                Bucket List
              </motion.span>
            </span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
