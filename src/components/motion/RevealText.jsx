import { motion } from "framer-motion";
import { revealLine, staggerChildren } from "../../lib/motion";

export default function RevealText({
  text = "",
  lines = [],
  as = "div",
  delay = 0,
  className = "",
}) {
  const content =
    lines.length > 0
      ? lines
      : text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
  const ComponentTag = as;

  return (
    <motion.div
      variants={staggerChildren(0.08, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      className="overflow-hidden"
    >
      <ComponentTag className={className}>
        {content.map((line, index) => (
          <span
            key={typeof line === "string" ? `${line}-${index}` : index}
            className="block overflow-hidden"
          >
            <motion.span variants={revealLine} className="block will-change-transform">
              {line}
            </motion.span>
          </span>
        ))}
      </ComponentTag>
    </motion.div>
  );
}
