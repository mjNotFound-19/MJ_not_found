import { motion } from "framer-motion";
import { SKILLS } from "../config/content";
import { fadeUp, staggerChildren } from "../lib/motion";

const skillEntries = Object.entries(SKILLS);

export default function SkillList() {
  return (
    <motion.div
      variants={staggerChildren(0.12)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 gap-5"
    >
      {skillEntries.map(([title, items], index) => (
        <motion.div
          key={title}
          variants={fadeUp(index * 0.05, 30)}
          // A plain lift: scaling or tilting would soften the text while it's hovered.
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="glass-panel skill-card p-6 rounded-[28px]"
        >
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center font-mono text-sm font-semibold text-primary">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            {items.map((item) => (
              <span
                key={item}
                className="tech-chip"
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
