import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import useMagnetic from "../hooks/useMagnetic";
import { fadeUp } from "../lib/motion";
import { CONTACT } from "../config/content";
import { useLanguage } from "../context/LanguageContext";
import RollText from "./motion/RollText";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [hidden, setHidden] = useState(false);
  const { ref: ctaRef, magneticStyle } = useMagnetic(0.2);
  const { t } = useLanguage();

  const links = [
    { id: "about", label: t.nav.about },
    { id: "experience", label: t.nav.experience },
    { id: "projects", label: t.nav.projects },
    { id: "skills", label: t.nav.skills },
    { id: "contact", label: t.nav.contact },
  ];

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // Tuck the nav away while reading downward, bring it back on any upward scroll.
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > window.innerHeight * 0.6);
        lastY = y;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Highlight whichever section is crossing the upper-middle of the viewport.
  // Sections can nest (experience lives inside about), so track every section in
  // the band and pick the last one in page order, the most specific.
  useEffect(() => {
    const order = ["about", "experience", "projects", "skills", "contact"];
    const sections = order.map((id) => document.getElementById(id)).filter(Boolean);
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const current = [...order].reverse().find((id) => visible.has(id));
        setActive(current ?? "");
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={`site-nav fixed top-0 inset-x-0 z-50 ${scrolled ? "nav-blur" : "nav-clear"} ${
        hidden && !menuOpen ? "is-hidden" : ""
      }`}
    >
      <div className="section-shell">
        <div className="flex items-center gap-4 py-4">
          <motion.a
            href="#top"
            className="flex items-center gap-3 group"
            initial="hidden"
            animate="show"
            variants={fadeUp(0, 14)}
            aria-label="Manas Jha, back to top"
          >
            <div className="relative w-10 h-10 rounded-xl border border-primary/40 bg-primary/10 grid place-items-center font-mono text-sm font-bold text-primary group-hover:shadow-glowSm transition-shadow">
              MJ
            </div>
            <span className="font-mono text-sm text-white/80 hidden sm:inline">
              manas<span className="text-primary">@</span>jha
              <span className="terminal-caret" aria-hidden="true" />
            </span>
          </motion.a>

          <div className="flex items-center gap-3 ml-auto">
            <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary">
              {links.map((link, index) => (
                <motion.a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`nav-link ${active === link.id ? "is-active" : ""}`}
                  aria-current={active === link.id ? "true" : undefined}
                  variants={fadeUp(index * 0.05, 18)}
                  initial="hidden"
                  animate="show"
                >
                  <RollText>{link.label}</RollText>
                </motion.a>
              ))}
              <motion.a
                href="/bucket-list/"
                data-transition="bucket"
                className="nav-link nav-link-special"
                variants={fadeUp(0.3, 18)}
                initial="hidden"
                animate="show"
              >
                <RollText>{t.nav.bucket}</RollText>
              </motion.a>
            </nav>

            <motion.a
              ref={ctaRef}
              style={magneticStyle}
              href="#contact"
              className="btn-primary btn-sm hidden sm:inline-flex magnetic-target"
              variants={fadeUp(0.2, 20)}
              initial="hidden"
              animate="show"
            >
              <span className="magnetic-shadow" />
              <RollText>{t.nav.connect}</RollText>
              <ArrowUpRight size={15} aria-hidden />
            </motion.a>

            <button
              type="button"
              className="md:hidden p-2.5 rounded-full border border-white/10 text-white/80 cursor-pointer"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden px-4 pb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <nav
              className="rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl p-6 space-y-1"
              aria-label="Mobile"
            >
              {links.map((link, index) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="flex items-baseline gap-3 py-2 text-lg font-medium text-gray-100"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  {link.label}
                </a>
              ))}
              <a href="/bucket-list/" data-transition="bucket" className="flex items-baseline gap-3 py-2 text-lg font-medium text-gray-100">
                <span className="font-mono text-xs text-primary">06</span>
                {t.nav.bucket}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/40"
              >
                Email Manas
                <ArrowUpRight size={16} aria-hidden />
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
