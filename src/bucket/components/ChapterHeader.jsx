import { useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";

// Big editorial opener shared by every dream: number, kicker, title, line,
// status, and the progress log once there's anything in it.
export default function ChapterHeader({ dream, tone = "light" }) {
  const root = useRef(null);
  const muted = tone === "dark" ? "text-[rgba(235,233,228,0.6)]" : "text-[var(--ink-3)]";
  const rule = tone === "dark" ? "border-[rgba(235,233,228,0.18)]" : "border-[var(--rule)]";

  // One quiet reveal as the chapter arrives: the title rises out of its clip,
  // the goal and status follow. Same curve as the hero, no overshoot.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap
        .timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        })
        .from("[data-chapter-title]", { yPercent: 14, autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)", duration: 1.5 })
        .from("[data-chapter-line], [data-chapter-status]", { autoAlpha: 0, y: 12, duration: 1.3, stagger: 0.12 }, 0.35);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="b-shell">
      <div className={`flex items-center justify-between gap-4 border-t ${rule} pt-5`}>
        <p className="b-mono">
          <span style={{ color: dream.accent }}>{dream.number}</span>
          <span className={muted}> / {dream.kicker}</span>
        </p>
        <span data-chapter-status className="b-status" style={{ color: dream.accent }}>
          {dream.status}
        </span>
      </div>

      <h2 data-chapter-title className="b-chapter-title mt-8">
        {dream.title}
      </h2>
      <p data-chapter-line className="mt-6 text-[clamp(1.2rem,2.2vw,1.7rem)] leading-snug tracking-[-0.02em] max-w-[36ch]">
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
