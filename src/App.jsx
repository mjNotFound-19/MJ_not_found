import { useEffect, useMemo, useState } from "react";
import MatrixRain from "./MatrixRain";
import SpotlightCursor from "./SpotlightCursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Section from "./components/Section";
import SkillList from "./components/SkillList";
import ContactIcons from "./components/ContactIcons";
import Footer from "./components/Footer";
import ImmersiveBeams from "./components/ImmersiveBeams";
import ScrollProgress from "./components/ScrollProgress";
import Projects from "./components/Projects";
import About from "./components/About";
import PageTransition from "./components/motion/PageTransition";
import AmbientBackground from "./components/motion/AmbientBackground";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [revealSecret, setRevealSecret] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("manas-theme");
    if (stored === "light" || stored === "dark") return stored;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  });

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const showMotion = useMemo(() => !reduceMotion, [reduceMotion]);

  // ? detect mobile screen sizes
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // sync reduced motion preference
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduceMotion(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // light smooth scrolling fallback using native CSS when motion is allowed
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const prev = root.style.scrollBehavior;
    if (showMotion) {
      root.style.scrollBehavior = "smooth";
    } else {
      root.style.scrollBehavior = prev || "";
    }
    return () => {
      root.style.scrollBehavior = prev || "";
    };
  }, [showMotion]);

  // apply theme token to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    window.localStorage.setItem("manas-theme", theme);
  }, [theme]);

  return (
    <div className="relative bg-midnight text-textLight min-h-screen overflow-x-hidden">
      <AmbientBackground />
      <ImmersiveBeams />
      <ScrollProgress />
      <div className="noise-overlay pointer-events-none" />

      {showMotion && (
        <MatrixRain
          color="#00AEEF"
          secret="MJ::MAY-2004::LEO MESSI::MAX VERSTAPPEN"
          secretColor="#b6ff44"
          revealSecret={revealSecret}
        />
      )}

      {showMotion && !isMobile && (
        <SpotlightCursor
          size={14}
          color="rgba(0,180,255,0.9)"
          glow="0 0 12px rgba(0,180,255,0.8)"
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />
        <PageTransition>
          <main>
            <Hero />
            <Section
              id="about"
              index="01"
              eyebrow={t.sections.about.eyebrow}
              title={t.sections.about.title}
              subtitle={t.sections.about.subtitle}
            >
              <About />
            </Section>

            <Section
              id="projects"
              index="03"
              eyebrow={t.sections.projects.eyebrow}
              title={t.sections.projects.title}
              subtitle={t.sections.projects.subtitle}
            >
              <Projects />
            </Section>

            <Section
              id="skills"
              index="04"
              eyebrow={t.sections.skills.eyebrow}
              title={t.sections.skills.title}
              subtitle={t.sections.skills.subtitle}
            >
              <SkillList />
            </Section>

            <Section
              id="contact"
              index="05"
              eyebrow={t.sections.contact.eyebrow}
              title={t.sections.contact.title}
              subtitle={t.sections.contact.subtitle}
            >
              <ContactIcons />
            </Section>

            <Footer />
          </main>
        </PageTransition>
      </div>

      {showMotion && (
        <button
          type="button"
          onClick={() => setRevealSecret((prev) => !prev)}
          aria-pressed={revealSecret}
          className={`decode-toggle ${revealSecret ? "is-on" : ""}`}
        >
          <span className="status-dot" aria-hidden />
          {revealSecret ? "hide secret" : "decode the rain"}
        </button>
      )}
    </div>
  );
}
