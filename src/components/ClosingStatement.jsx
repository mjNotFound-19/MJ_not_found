import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Two-beat sign-off: the first line holds, then gets pushed up and dimmed as the
// second line rises in to answer it.
export default function ClosingStatement({ first, second }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const firstY = useTransform(scrollYProgress, [0.25, 0.65], ["0%", "-60%"]);
  const firstOpacity = useTransform(scrollYProgress, [0.25, 0.65], [1, 0.18]);
  const secondY = useTransform(scrollYProgress, [0.3, 0.7], ["80%", "0%"]);
  const secondOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);

  return (
    <section ref={ref} className="relative h-[220vh]" aria-label={`${first} ${second}`}>
      <div className="sticky top-0 h-screen grid place-items-center overflow-hidden">
        <div className="section-shell text-center on-rain" aria-hidden="true">
          <motion.p className="closing-line" style={{ y: firstY, opacity: firstOpacity }}>
            {first}
          </motion.p>
          <motion.p className="closing-line is-accent" style={{ y: secondY, opacity: secondOpacity }}>
            {second}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
