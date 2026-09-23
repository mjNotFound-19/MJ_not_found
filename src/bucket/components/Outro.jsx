import { ArrowUpRight } from "lucide-react";
import RollText from "../../components/motion/RollText";
import { DREAMS } from "../data";

const PHRASE = "Before I'm done";

export default function Outro() {
  const done = DREAMS.filter((d) => d.status === "done").length;
  const row = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="flex items-center shrink-0">
      <span className="b-hero-title text-[clamp(3.5rem,12vw,11rem)] px-[0.2em]">{PHRASE}</span>
      <span className="b-serif italic text-[clamp(3rem,10vw,9rem)] px-[0.2em]" aria-hidden>
        *
      </span>
    </span>
  ));

  return (
    <footer className="relative pt-24 md:pt-32 pb-10 overflow-hidden">
      <div className="b-marquee-track" aria-hidden="true">
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
    </footer>
  );
}
