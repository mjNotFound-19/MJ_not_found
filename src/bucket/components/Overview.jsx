import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import { DREAMS } from "../data";
import { MINI_ART } from "./MiniArt";

const EASE = [0.76, 0, 0.24, 1];

// Gallery grid of the four dreams: each card is a live mini illustration
// plus its line, and links down to the dream's chapter.
export default function Overview() {
  return (
    <section id="overview" className="relative py-20 md:py-28">
      <div className="b-shell">
        <div className="flex items-end justify-between gap-6 b-rule pt-5 mb-10">
          <h2 className="b-mono">the list</h2>
          <p className="b-mono text-[var(--ink-3)]">tap a card to jump in</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {DREAMS.map((dream, i) => {
            const Art = MINI_ART[dream.id];
            return (
              <motion.a
                key={dream.id}
                href={`#${dream.id}`}
                className="b-card group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.9, delay: (i % 2) * 0.1, ease: EASE }}
              >
                <div className="b-card-art">
                  <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]">
                    <Art />
                  </div>
                  <span className="absolute top-4 left-4 b-sticker" style={{ background: dream.accent }}>
                    {dream.number}
                  </span>
                </div>
                <div className="p-5 md:p-6 flex items-start justify-between gap-6">
                  <div>
                    <p className="b-mono text-[var(--ink-3)]">{dream.kicker}</p>
                    <h3 className="mt-1 text-[clamp(1.6rem,3vw,2.3rem)] font-bold tracking-[-0.04em] leading-none">
                      {dream.title}
                    </h3>
                    <p className="mt-3 text-[var(--ink-2)] max-w-[40ch] leading-snug">{dream.line}</p>
                  </div>
                  <span
                    className="shrink-0 w-11 h-11 rounded-full border border-[var(--ink)] grid place-items-center transition-colors duration-300 group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]"
                    aria-hidden
                  >
                    <ArrowDownRight size={18} />
                  </span>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
