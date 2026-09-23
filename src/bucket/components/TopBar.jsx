import { ArrowLeft } from "lucide-react";
import RollText from "../../components/motion/RollText";
import { DREAMS } from "../data";

export default function TopBar() {
  const done = DREAMS.filter((d) => d.status === "done").length;

  return (
    <header className="b-topbar">
      <div className="b-shell flex items-center justify-between gap-4">
        <a href="/" data-transition="portfolio" className="b-pill" aria-label="Back to manasjha.online">
          <ArrowLeft size={14} aria-hidden />
          <RollText>manasjha.online</RollText>
        </a>
        <p className="b-mono hidden sm:block">bucket list / vol. 01</p>
        <p className="b-mono">
          <span className="font-semibold">{String(done).padStart(2, "0")}</span>
          <span className="text-[var(--ink-3)]"> / {String(DREAMS.length).padStart(2, "0")} done</span>
        </p>
      </div>
    </header>
  );
}
