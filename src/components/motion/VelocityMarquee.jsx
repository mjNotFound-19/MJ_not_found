import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from "framer-motion";

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// A row of oversized type that drifts on its own, speeds up with scroll
// velocity, and flips direction when you scroll back up.
export default function VelocityMarquee({ items, baseVelocity = -2.5, className = "" }) {
  const reduceMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) direction.current = -1;
    else if (velocityFactor.get() > 0) direction.current = 1;
    moveBy += direction.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  // Four copies so the wrap point is never visible on wide screens.
  const row = (key) => (
    <span key={key} className="marquee-chunk" aria-hidden={key > 0 || undefined}>
      {items.map((item, i) => (
        <span key={i} className="marquee-item">
          {item}
          <span className="marquee-sep" aria-hidden="true">
            /
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`marquee ${className}`}>
      <motion.div className="marquee-track" style={{ x }}>
        {[0, 1, 2, 3].map(row)}
      </motion.div>
    </div>
  );
}
