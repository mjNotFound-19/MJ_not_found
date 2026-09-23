import { motion } from "framer-motion";
import { transitions } from "../../lib/motion";

export default function HighlineText({
  children,
  as = "h2",
  color = "var(--accent)",
  delay = 0,
  className = "",
}) {
  const Component = as;

  return (
    <Component className={`relative inline-block overflow-visible ${className}`}>
      <motion.span
        className="highline-bar"
        style={{
          background: `linear-gradient(90deg, ${color}, rgba(0, 174, 239, 0.18))`,
          transformOrigin: "left center",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.65 }}
        transition={{ duration: 0.9, ease: transitions.base.ease, delay }}
        aria-hidden="true"
      />
      <span className="relative z-10">{children}</span>
    </Component>
  );
}
