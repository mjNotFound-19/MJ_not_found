import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { HERO, CONTACT } from "../config/content";
import useMagnetic from "../hooks/useMagnetic";
import { fadeUp, staggerChildren } from "../lib/motion";
import DecodeText from "./motion/DecodeText";
import Typewriter from "./motion/Typewriter";
import { useLanguage } from "../context/LanguageContext";

const scrollToId = (id) => {
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({ top, behavior: "smooth" });
};

export default function Hero() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const panelShift = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const glowShift = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const { ref: primaryCta, magneticStyle: primaryStyle } = useMagnetic(0.25);
  const { ref: secondaryCta, magneticStyle: secondaryStyle } = useMagnetic(0.18);

  return (
    <section id="top" ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="hero-grid-lines" aria-hidden />
      <motion.div
        style={{ y: glowShift }}
        className="absolute -left-40 top-10 w-[50vw] h-[50vw] rounded-full bg-primary/15 blur-[180px] pointer-events-none"
        aria-hidden
      />

      <div className="section-shell relative z-10 pt-32 pb-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] items-center">
          <div>
            <motion.span
              className="mono-chip"
              initial="hidden"
              animate="show"
              variants={fadeUp(0, 16)}
            >
              <span className="status-dot" />
              {t.hero.badge}
            </motion.span>

            <motion.p
              className="mt-8 font-mono text-sm sm:text-base text-primary/80"
              initial="hidden"
              animate="show"
              variants={fadeUp(0.05, 12)}
            >
              {t.hero.line1}
            </motion.p>
            <h1 className="mt-2 text-[clamp(3.2rem,9vw,7rem)] leading-[0.95] font-bold tracking-tight">
              <DecodeText text="Manas Jha" className="hero-name" />
            </h1>

            <motion.p
              className="mt-6 font-mono text-base sm:text-lg text-white/85 min-h-[3.5em] sm:min-h-[1.75em]"
              initial="hidden"
              animate="show"
              variants={fadeUp(0.15, 12)}
            >
              <span className="text-primary">&gt;</span>{" "}
              <span className="text-white/50">{t.hero.prompt}</span>{" "}
              <Typewriter phrases={HERO.roles} className="text-white" />
            </motion.p>

            <motion.p
              className="mt-6 text-lg text-white/70 max-w-2xl leading-relaxed"
              initial="hidden"
              animate="show"
              variants={fadeUp(0.25, 16)}
            >
              {t.hero.body}
            </motion.p>

            <motion.p
              className="mt-5 inline-flex items-center gap-2 text-sm text-white/55"
              initial="hidden"
              animate="show"
              variants={fadeUp(0.3, 12)}
            >
              <MapPin size={15} className="text-primary" aria-hidden />
              {t.hero.location}
            </motion.p>

            <motion.div
              className="mt-10 flex flex-wrap gap-4"
              initial="hidden"
              animate="show"
              variants={fadeUp(0.35, 16)}
            >
              <motion.a
                ref={primaryCta}
                style={primaryStyle}
                href="#projects"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId("projects");
                }}
                className="btn-primary magnetic-target"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="magnetic-shadow" />
                {t.hero.ctas.projects}
                <ArrowRight size={16} aria-hidden />
              </motion.a>
              <motion.a
                ref={secondaryCta}
                style={secondaryStyle}
                href="#contact"
                onClick={(event) => {
                  event.preventDefault();
                  scrollToId("contact");
                }}
                className="btn-ghost"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t.hero.ctas.contact}
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            style={{ y: panelShift }}
            className="terminal-window"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          >
            <div className="terminal-bar">
              <span className="terminal-dots" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <span className="font-mono text-xs text-white/50">{t.hero.nowTitle}</span>
            </div>
            <div className="p-5 space-y-5">
              {HERO.spotlight.map((item) => (
                <div key={item.title} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-sm text-primary">
                      <span className="text-white/40">$ </span>
                      {item.title.toLowerCase()}
                    </p>
                    <span className="status-pill">
                      <span className="status-dot" />
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">{item.org}</p>
                  <p className="text-sm text-white/75 leading-relaxed">{item.description}</p>
                </div>
              ))}
              <a
                href={`mailto:${CONTACT.email}`}
                className="group flex items-center justify-between gap-3 pt-4 border-t border-white/10 font-mono text-sm text-white/70 hover:text-primary transition-colors"
              >
                <span>
                  <span className="text-white/40">$ </span>mail {CONTACT.email}
                </span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          variants={staggerChildren(0.08)}
          initial="hidden"
          animate="show"
        >
          {HERO.stats.map((stat, index) => {
            const content = (
              <>
                <p className="stat-value">{stat.value}</p>
                <p className="text-sm text-white/75 mt-1">{stat.label}</p>
                <p className="text-xs text-white/45 mt-1">{stat.meta}</p>
              </>
            );
            return (
              <motion.div key={stat.label} variants={fadeUp(index * 0.04, 18)}>
                {stat.projectId ? (
                  <button
                    type="button"
                    onClick={() => scrollToId(`project-${stat.projectId}`)}
                    className="stat-card group w-full text-left"
                    aria-label={`${stat.value} ${stat.label}, view project`}
                  >
                    {content}
                    <ArrowUpRight
                      size={14}
                      className="absolute top-4 right-4 text-white/30 group-hover:text-primary transition-colors"
                      aria-hidden
                    />
                  </button>
                ) : (
                  <div className="stat-card">{content}</div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
