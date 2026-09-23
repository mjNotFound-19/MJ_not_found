import { useCallback, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import MatrixRain from "./MatrixRain";
import SpotlightCursor from "./SpotlightCursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Section from "./components/Section";
import SkillList from "./components/SkillList";
import ContactIcons from "./components/ContactIcons";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import Projects from "./components/Projects";
import HorizontalProjects from "./components/HorizontalProjects";
import About from "./components/About";
import Preloader from "./components/Preloader";
import ZoomManifesto from "./components/ZoomManifesto";
import ClosingStatement from "./components/ClosingStatement";
import ScrollPercent from "./components/ScrollPercent";
import EffectBoundary from "./components/EffectBoundary";
import AmbientBackground from "./components/motion/AmbientBackground";
import ScrollFillText from "./components/motion/ScrollFillText";
import VelocityMarquee from "./components/motion/VelocityMarquee";
import useSmoothScroll from "./hooks/useSmoothScroll";
import useMediaQuery from "./hooks/useMediaQuery";
import LeaveToBucket from "./components/LeaveToBucket";
import { readArrival, useTransitionLinks } from "./lib/pageTransition";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const { t } = useLanguage();
  const [revealSecret, setRevealSecret] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Read once: did we get here via the bucket list's exit transition?
  const [arrivedFromBucket] = useState(() => readArrival("portfolio"));
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  // The pinned horizontal track needs room: a wide, reasonably tall viewport.
  const horizontalProjects = useMediaQuery("(min-width: 1024px) and (min-height: 720px)") && !reduceMotion;
  const showMotion = !reduceMotion;

  useSmoothScroll(showMotion && loaded);
  useTransitionLinks();

  // Hold the page at the top while the preloader runs. With reduced motion there
  // is no preloader, so the page must never be locked.
  const locked = showMotion && !loaded;
  useEffect(() => {
    document.documentElement.classList.toggle("is-loading", locked);
  }, [locked]);

  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative bg-midnight text-textLight min-h-screen overflow-x-clip">
        {/* The rain canvas is opaque, so these only matter when it's off (reduced motion). */}
        {!showMotion && <AmbientBackground />}
        <ScrollProgress />

        {showMotion && (
          <EffectBoundary>
            <MatrixRain
              color="#00AEEF"
              secret="MJ::MAY-2004::LEO MESSI::MAX VERSTAPPEN"
              secretColor="#b6ff44"
              revealSecret={revealSecret}
            />
          </EffectBoundary>
        )}

        {showMotion && !isMobile && (
          <EffectBoundary>
            <SpotlightCursor />
          </EffectBoundary>
        )}

        {/* Stays mounted after loading so its curtain exit animation can play. */}
        {showMotion && (
          <Preloader
            onDone={handleLoaded}
            startAt={arrivedFromBucket ? 20 : 0}
            duration={arrivedFromBucket ? 900 : 1500}
            decoded={arrivedFromBucket}
          />
        )}
        <LeaveToBucket />

        {(loaded || !showMotion) && (
          <div style={{ position: "relative", zIndex: 1 }}>
            <Nav />
            <main>
              <Hero />

              <section className="statement-section on-rain" aria-label="Summary">
                <div className="section-shell">
                  <ScrollFillText
                    text={t.statement.text}
                    accents={t.statement.accents}
                    className="statement-text"
                  />
                </div>
              </section>

              <VelocityMarquee items={t.marquee} />

              <Section
                id="about"
                index="01"
                eyebrow={t.sections.about.eyebrow}
                title={t.sections.about.title}
                subtitle={t.sections.about.subtitle}
              >
                <About />
              </Section>

              {showMotion && (
                <EffectBoundary>
                  <ZoomManifesto phrases={t.manifesto} />
                </EffectBoundary>
              )}

              <Section
                id="projects"
                index="03"
                eyebrow={t.sections.projects.eyebrow}
                title={t.sections.projects.title}
                subtitle={t.sections.projects.subtitle}
                fullBleed={horizontalProjects}
              >
                {horizontalProjects ? (
                  <EffectBoundary fallback={<div className="section-shell"><Projects /></div>}>
                    <HorizontalProjects />
                  </EffectBoundary>
                ) : (
                  <Projects />
                )}
              </Section>

              <VelocityMarquee items={t.marqueeSkills} baseVelocity={2} className="marquee-outline" />

              <Section
                id="skills"
                index="04"
                stickyHeader
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

              {showMotion && (
                <EffectBoundary>
                  <ClosingStatement first={t.closing.first} second={t.closing.second} />
                </EffectBoundary>
              )}

              <Footer />
            </main>
          </div>
        )}

        {showMotion && loaded && !isMobile && <ScrollPercent />}

        {showMotion && loaded && (
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
    </MotionConfig>
  );
}
