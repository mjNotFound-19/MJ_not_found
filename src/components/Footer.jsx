import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { CONTACT } from "../config/content";
import { useLanguage } from "../context/LanguageContext";
import RollText from "./motion/RollText";

const WORDMARK = "MANAS JHA";

function useAtlantaTime() {
  const format = () =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function WordmarkLetter({ char, index, progress }) {
  // Letters rise in a staggered wave as the footer scrolls into view.
  const start = index * 0.05;
  const y = useTransform(progress, [start, start + 0.45], ["100%", "0%"]);
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span className="inline-block wordmark-letter" style={{ y }}>
        {char === " " ? " " : char}
      </motion.span>
    </span>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const time = useAtlantaTime();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  const links = [
    { label: "Email", href: `mailto:${CONTACT.email}` },
    { label: "LinkedIn", href: CONTACT.linkedin },
    { label: "GitHub", href: CONTACT.github },
    { label: "Bucket list", href: "/bucket-list/" },
  ];

  return (
    <footer ref={ref} className="site-footer relative mt-16 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="section-shell pt-16 grid gap-10 sm:grid-cols-3 text-sm">
        <div className="space-y-2">
          <p className="font-mono text-xs text-white/40">local time / atlanta</p>
          <p className="font-mono text-2xl text-white tabular-nums">{time}</p>
          <p className="text-white/50">{CONTACT.availability}</p>
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs text-white/40">elsewhere</p>
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  data-transition={link.href === "/bucket-list/" ? "bucket" : undefined}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="text-lg text-white/80 hover:text-primary transition-colors"
                >
                  <RollText>{link.label}</RollText>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 sm:text-right">
          <p className="font-mono text-xs text-white/40">{t.footer.stack}</p>
          <a href="#top" className="footer-top-btn" aria-label="Back to top">
            <RollText>Back to top</RollText>
            <ArrowUp size={16} aria-hidden />
          </a>
        </div>
      </div>

      <p className="footer-wordmark" aria-label="Manas Jha">
        <span aria-hidden="true">
          {WORDMARK.split("").map((char, i) => (
            <WordmarkLetter key={i} char={char} index={i} progress={scrollYProgress} />
          ))}
        </span>
      </p>

      <div className="section-shell pb-8 flex flex-col sm:flex-row gap-2 justify-between text-xs text-white/40 font-mono">
        <p>{t.footer.credit()}</p>
        <p>manasjha.online</p>
      </div>
    </footer>
  );
}
