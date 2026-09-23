import { motion } from "framer-motion";
import RevealText from "./motion/RevealText";
import { fadeUp } from "../lib/motion";

export default function Section({ id, index, eyebrow, title, subtitle, children }) {
  return (
    <section id={id} className="relative py-24 sm:py-28">
      <div className="section-shell">
        <div className="max-w-3xl space-y-4">
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
              className="text-[clamp(2.4rem,4vw,3.5rem)] leading-tight font-semibold"
            />
          )}
          {subtitle && (
            <RevealText
              as="p"
              text={subtitle}
              delay={0.15}
              className="text-lg text-white/70"
            />
          )}
        </div>
        <div className="mt-14">{children}</div>
      </div>
    </section>
  );
}
