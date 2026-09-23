import { motion } from "framer-motion";

const EASE = [0.76, 0, 0.24, 1];

// Big editorial opener shared by every dream: number, kicker, title, line,
// status, and the progress log once there's anything in it.
export default function ChapterHeader({ dream, tone = "light" }) {
  const muted = tone === "dark" ? "text-[rgba(235,233,228,0.6)]" : "text-[var(--ink-3)]";
  const rule = tone === "dark" ? "border-[rgba(235,233,228,0.18)]" : "border-[var(--rule)]";

  return (
    <div className="b-shell">
      <div className={`flex items-center justify-between gap-4 border-t ${rule} pt-5`}>
        <p className="b-mono">
          <span style={{ color: dream.accent }}>{dream.number}</span>
          <span className={muted}> / {dream.kicker}</span>
        </p>
        <span className="b-status" style={{ color: dream.accent }}>
          {dream.status}
        </span>
      </div>

      <h2 className="b-chapter-title mt-8">
        {dream.title.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.18em]">
            <motion.span
              className="inline-block"
              initial={{ y: "105%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 1, delay: i * 0.08, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>
      <p className="mt-6 text-[clamp(1.2rem,2.2vw,1.7rem)] leading-snug tracking-[-0.02em] max-w-[36ch]">
        <span className="b-serif italic text-[1.15em]">The goal: </span>
        {dream.line}
      </p>

      {dream.log.length > 0 && (
        <ul className={`mt-8 max-w-xl divide-y ${rule} border-y ${rule}`}>
          {dream.log.map((entry) => (
            <li key={entry.date + entry.text} className="py-3 flex gap-6">
              <span className={`b-mono shrink-0 ${muted}`}>{entry.date}</span>
              <span>{entry.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
