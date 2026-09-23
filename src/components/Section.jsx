import { motion } from "framer-motion";
import RevealText from "./motion/RevealText";
import { fadeUp } from "../lib/motion";

// `fullBleed` renders children outside the centered shell (for pinned, edge-to-edge tracks).
// `stickyHeader` pins the heading in a left column while the content scrolls past on the right.
export default function Section({
  id,
  index,
  eyebrow,
  title,
  subtitle,
  fullBleed = false,
  stickyHeader = false,
  children,
}) {
  return (
    <section id={id} className="relative py-24 sm:py-32">
      <div className={`section-shell ${stickyHeader ? "sticky-header-grid" : ""}`}>
        <div className={`on-rain ${stickyHeader ? "sticky-header space-y-5" : "max-w-4xl space-y-5"}`}>
          {eyebrow && (
            <motion.p
              className="section-eyebrow"
              variants={fadeUp(0, 16)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {index && <span className="text-primary">{index}</span>}
              <span className="section-eyebrow-rule" aria-hidden />
              {eyebrow}
            </motion.p>
          )}
          {title && (
            <RevealText
              as="h2"
              lines={[title]}
              className="section-title"
            />
          )}
          {subtitle && (
            <RevealText
              as="p"
              text={subtitle}
              delay={0.15}
              className="text-lg text-white/75 max-w-2xl"
            />
          )}
        </div>
        {!fullBleed && <div className={stickyHeader ? "" : "mt-14"}>{children}</div>}
      </div>
      {fullBleed && <div className="mt-10">{children}</div>}
    </section>
  );
}
