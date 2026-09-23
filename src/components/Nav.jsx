import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import useMagnetic from "../hooks/useMagnetic";
import { fadeUp } from "../lib/motion";
import { CONTACT } from "../config/content";
import { useLanguage } from "../context/LanguageContext";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY < window.innerHeight * 0.5) setActive("");
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Highlight whichever section is crossing the upper-middle of the viewport.
  useEffect(() => {
    const sections = ["about", "experience", "projects", "skills", "contact"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
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
      className={`fixed top-0 inset-x-0 z-50 transition-[background,backdrop-filter,border-color] duration-500 ${
        scrolled ? "nav-blur" : "nav-clear"
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
                  {link.label}
                </motion.a>
              ))}
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
              <span>{t.nav.connect}</span>
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
