import { useRef, useState } from "react";
import { DREAMS } from "../data";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";

// A hairline rail in the right-hand gutter, only while you're inside the four
// chapters: one dot per dream, a line that fills as you go in the current
// dream's colour. Hovering a dot names it; each jumps to its chapter
// (useSmoothScroll routes #links). It's sized to fit the 32px page gutter, and
// greys and accents read on both the paper and the black chapters.
export default function ChapterRail() {
  const root = useRef(null);
  const fill = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const sections = DREAMS.map((d) => document.getElementById(d.id));
      if (sections.some((s) => !s)) return;
      const first = sections[0];
      const last = sections[sections.length - 1];

      gsap.set(root.current, { autoAlpha: 0, x: 12, yPercent: -50 });
      ScrollTrigger.create({
        trigger: first,
        endTrigger: last,
        start: "top 60%",
        end: "bottom 40%",
        onToggle: ({ isActive }) =>
          gsap.to(root.current, { autoAlpha: isActive ? 1 : 0, x: isActive ? 0 : 12, duration: 0.4, ease: "power2.out" }),
        // The current chapter is the last one whose top has passed the middle
        // of the screen, read live so it never depends on toggle order.
        onUpdate: () => {
          const middle = window.innerHeight / 2;
          let current = 0;
          sections.forEach((s, i) => {
            if (s.getBoundingClientRect().top <= middle) current = i;
          });
          setActive(current);
        },
      });

      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: first, endTrigger: last, start: "top center", end: "bottom center", scrub: 0.4 },
        }
      );
    },
    { scope: root }
  );

  return (
    <nav ref={root} aria-label="Chapters" className="fixed right-2 md:right-3 top-1/2 z-40 hidden md:block invisible">
      <div className="relative py-1">
        <span className="absolute left-1/2 top-2 bottom-2 w-px -ml-px bg-[rgba(127,127,127,0.35)]" aria-hidden="true" />
        <span
          ref={fill}
          className="absolute left-1/2 top-2 bottom-2 w-px -ml-px origin-top transition-colors duration-500"
          style={{ background: DREAMS[active].accent }}
          aria-hidden="true"
        />
        <ol className="relative flex flex-col gap-7">
          {DREAMS.map((dream, i) => {
            const current = i === active;
            return (
              <li key={dream.id} className="flex justify-center">
                <a
                  href={`#${dream.id}`}
                  aria-current={current ? "step" : undefined}
                  aria-label={`${dream.number} ${dream.title}`}
                  className="group relative grid place-items-center w-5 h-5"
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: current ? 12 : 7,
                      height: current ? 12 : 7,
                      background: current ? dream.accent : "rgba(127,127,127,0.65)",
                      boxShadow: current ? `0 0 0 3px ${dream.accent}33` : "none",
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="absolute right-full mr-2 whitespace-nowrap rounded-full px-3 py-1 b-mono text-[11px] bg-[var(--ink)] text-[var(--paper)] pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    {dream.number} / {dream.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
