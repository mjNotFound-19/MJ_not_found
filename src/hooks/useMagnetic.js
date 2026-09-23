import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

export default function useMagnetic(strength = 0.25) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const magneticX = useSpring(x, { stiffness: 280, damping: 20, restDelta: 0.001 });
  const magneticY = useSpring(y, { stiffness: 280, damping: 20, restDelta: 0.001 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const handleMove = (event) => {
      const bounds = node.getBoundingClientRect();
      const relativeX = event.clientX - (bounds.left + bounds.width / 2);
      const relativeY = event.clientY - (bounds.top + bounds.height / 2);

      x.set(relativeX * strength);
      y.set(relativeY * strength);
      node.style.setProperty("--magnet-x", `${relativeX * strength}px`);
      node.style.setProperty("--magnet-y", `${relativeY * strength}px`);
    };

    const reset = () => {
      x.set(0);
      y.set(0);
      node.style.removeProperty("--magnet-x");
      node.style.removeProperty("--magnet-y");
    };

    node.addEventListener("mousemove", handleMove);
    node.addEventListener("mouseleave", reset);
    node.addEventListener("touchstart", reset);

    return () => {
      node.removeEventListener("mousemove", handleMove);
      node.removeEventListener("mouseleave", reset);
      node.removeEventListener("touchstart", reset);
    };
  }, [strength, x, y]);

  return { ref, magneticStyle: { x: magneticX, y: magneticY } };
}
