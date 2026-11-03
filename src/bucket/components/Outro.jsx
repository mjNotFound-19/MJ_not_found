import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import RollText from "../../components/motion/RollText";
import { DREAMS } from "../data";
import { FOOTAGE_CREDITS } from "../footage";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "../lib/gsap";

const PHRASE = "Before I'm done";

export default function Outro() {
  const root = useRef(null);
  const track = useRef(null);
  const done = DREAMS.filter((d) => d.status === "done").length;
  const row = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="flex items-center shrink-0">
      <span className="b-hero-title text-[clamp(3.5rem,12vw,11rem)] px-[0.2em]">{PHRASE}</span>
      <span className="b-serif italic text-[clamp(3rem,10vw,9rem)] px-[0.2em]" aria-hidden>
        *
      </span>
    </span>
  ));

  // The marquee drifts on its own. Scrolling gives it a push it carries for a
  // moment and then loses to friction, like a belt with some weight to it.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const loop = gsap.to(track.current, { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
          if (boost <= loop.timeScale()) return;
          gsap.killTweensOf(loop);
          loop.timeScale(boost);
          gsap.to(loop, { timeScale: 1, duration: 2.4, ease: "power2.out" });
        },
      });
    },
    { scope: root }
  );

  return (
    <footer ref={root} className="relative pt-24 md:pt-32 pb-10 overflow-hidden">
      <div ref={track} className="flex w-max" aria-hidden="true">
        {row}
        {row}
      </div>
      <h2 className="sr-only">{PHRASE}</h2>

      <div className="b-shell mt-16 grid gap-8 md:grid-cols-[1fr_auto] md:items-end b-rule pt-6">
        <p className="text-[clamp(1.3rem,2.6vw,2rem)] leading-tight tracking-[-0.02em] max-w-[30ch]">
          {done} of {DREAMS.length} crossed off so far.{" "}
          <span className="b-serif italic">This page updates as they happen.</span>
        </p>
        <a href="/" data-transition="portfolio" className="b-pill justify-self-start">
          <RollText>Back to the portfolio</RollText>
          <ArrowUpRight size={14} aria-hidden />
        </a>
      </div>
      <div className="b-shell mt-10 flex justify-between b-mono text-[var(--ink-3)]">
        <span>© {new Date().getFullYear()} Manas Jha</span>
        <span>manasjha.online/bucket-list</span>
      </div>
      <p className="b-shell mt-4 b-mono text-[var(--ink-3)]">
        footage via Pexels:{" "}
        {FOOTAGE_CREDITS.map((c, i) => (
          <span key={c.url}>
            {i > 0 && ", "}
            <a href={c.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[var(--ink)]">
              {c.what.toLowerCase()} by {c.who}
            </a>
          </span>
        ))}
      </p>
    </footer>
  );
}
