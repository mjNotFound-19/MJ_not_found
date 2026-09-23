import { useRef } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

// Page-scroll readout. Writes straight to the DOM so scrolling never re-renders React.
export default function ScrollPercent() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (ref.current) ref.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
  });

  return (
    <p className="scroll-percent" aria-hidden="true">
      <span ref={ref}>000</span>%
    </p>
  );
}
