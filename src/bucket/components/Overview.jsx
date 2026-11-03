import { useRef } from "react";
import { ArrowDownRight } from "lucide-react";
import { DREAMS } from "../data";
import { MINI_ART } from "./MiniArt";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "../lib/gsap";

// Hand-drawn marks, so crossing a goal off looks like pen on paper. The box is
// slightly wonky on purpose; the strike is a loose double pass.
const BOX = "M5 7 C12 5 26 4 35 6 C36 15 37 26 35 35 C25 36 14 37 6 35 C5 26 4 15 5 7 Z";
const TICK = "M10 21 C13 24 15 27 18 30 C22 21 28 12 36 3";
const STRIKE = "M2 22 C60 16 140 26 220 18 C260 15 300 20 318 17 M8 30 C90 22 180 30 312 24";

function CheckMark({ done, accent }) {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9 shrink-0 overflow-visible" aria-hidden="true">
      <path data-draw d={BOX} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {done && (
        <path data-draw d={TICK} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// Gallery grid of the four dreams: each card is a live mini illustration
// plus its line, and links down to the dream's chapter.
export default function Overview() {
  const root = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray("[data-card]");
      const marks = (card) => card.querySelectorAll("[data-draw]");
      if (prefersReducedMotion()) return;

      gsap.set(cards, { autoAlpha: 0, y: 50 });
      cards.forEach((card) => gsap.set(marks(card), { drawSVG: "0%" }));
      // Cards that arrive together rise together, in reading order; then each
      // card's pen marks draw in after it lands.
      ScrollTrigger.batch(cards, {
        start: "top 85%",
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.1 });
          batch.forEach((card, i) =>
            gsap.to(marks(card), { drawSVG: "100%", duration: 0.7, ease: "power2.inOut", stagger: 0.25, delay: 0.5 + i * 0.1 })
          );
        },
      });
    },
    { scope: root }
  );

  return (
    <section id="overview" ref={root} className="relative py-20 md:py-28">
      <div className="b-shell">
        <div className="flex items-end justify-between gap-6 b-rule pt-5 mb-10">
          <h2 className="b-mono">the list</h2>
          <p className="b-mono text-[var(--ink-3)]">tap a card to jump in</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {DREAMS.map((dream) => {
            const Art = MINI_ART[dream.id];
            const done = dream.status === "done";
            return (
              // The entrance animates this wrapper: the card's own transform belongs to its CSS hover lift.
              <div key={dream.id} data-card>
                <a href={`#${dream.id}`} className="b-card group h-full">
                  <div className="b-card-art">
                    <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-[1.04]">
                      <Art />
                    </div>
                    <span className="absolute top-4 left-4 b-sticker" style={{ background: dream.accent }}>
                      {dream.number}
                    </span>
                  </div>
                  <div className="p-5 md:p-6 flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <CheckMark done={done} accent={dream.accent} />
                      <div>
                        <p className="b-mono text-[var(--ink-3)]">
                          {dream.kicker}
                          <span className="sr-only">{done ? ", done" : ", not done yet"}</span>
                        </p>
                        <h3 className="relative mt-1 text-[clamp(1.6rem,3vw,2.3rem)] font-bold tracking-[-0.04em] leading-none">
                          {dream.title}
                          {done && (
                            <svg
                              viewBox="0 0 320 40"
                              preserveAspectRatio="none"
                              className="absolute left-[-4%] top-[10%] w-[108%] h-[80%] overflow-visible pointer-events-none"
                              aria-hidden="true"
                            >
                              <path data-draw d={STRIKE} fill="none" stroke={dream.accent} strokeWidth="3.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </h3>
                        <p className="mt-3 text-[var(--ink-2)] max-w-[40ch] leading-snug">{dream.line}</p>
                      </div>
                    </div>
                    <span
                      className="shrink-0 w-11 h-11 rounded-full border border-[var(--ink)] grid place-items-center transition-colors duration-300 group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]"
                      aria-hidden
                    >
                      <ArrowDownRight size={18} />
                    </span>
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
