import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { PROJECTS } from "../config/content";
import { ProjectCard } from "./Projects";
import { registerScrollTarget } from "../lib/scroll";
import { useLanguage } from "../context/LanguageContext";

const hexToRgba = (hex, alpha) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

// Vertical scroll drives a horizontal track of project slides while the
// section stays pinned; the backdrop glow shifts to each project's accent.
export default function HorizontalProjects() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const [viewportH, setViewportH] = useState(() => window.innerHeight);
  const [activeIndex, setActiveIndex] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
      setViewportH(window.innerHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Lenis already smooths the scroll itself; springing it again would only add lag.
  const smoothProgress = scrollYProgress;
  const x = useTransform(smoothProgress, (p) => -p * distance);

  const count = PROJECTS.length;
  const stops = PROJECTS.map((_, i) => (count === 1 ? 0 : i / (count - 1)));
  // Framer interpolates colours into "rgba(...)" strings, so the alpha has to be
  // baked into the stops (appending a hex alpha to its output is invalid CSS).
  const glow = useTransform(
    scrollYProgress,
    stops,
    PROJECTS.map((p) => hexToRgba(p.accent ?? "#00AEEF", 0.22))
  );
  const glowBackground = useTransform(
    glow,
    (c) => `radial-gradient(60% 55% at 50% 55%, ${c}, transparent 70%)`
  );
  const barScale = useTransform(smoothProgress, [0, 1], [1 / count, 1]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActiveIndex(Math.min(count - 1, Math.round(p * (count - 1))));
  });

  // Let "View project" buttons elsewhere land on the right slide.
  useEffect(() => {
    const cleanups = PROJECTS.map((project, i) =>
      registerScrollTarget(`project-${project.id}`, () => {
        const section = sectionRef.current;
        if (!section) return 0;
        const top = section.getBoundingClientRect().top + window.scrollY;
        return top + (count === 1 ? 0 : (i / (count - 1)) * distance);
      })
    );
    return () => cleanups.forEach((fn) => fn());
  }, [distance, count]);

  return (
    <div ref={sectionRef} className="relative" style={{ height: distance + viewportH }}>
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <motion.div className="absolute inset-0 pointer-events-none" style={{ background: glowBackground }} aria-hidden />

        <div className="section-shell relative flex items-end justify-between gap-6 mb-6">
          <p className="font-mono text-sm text-white/50">
            <span className="text-primary">{String(activeIndex + 1).padStart(2, "0")}</span>
            {" / "}
            {String(count).padStart(2, "0")}
            <span className="ml-4 text-white/70">{PROJECTS[activeIndex]?.title.split(" - ")[0]}</span>
          </p>
          <p className="font-mono text-xs text-white/35 hidden lg:block">{t.projectsScrollHint}</p>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="relative flex gap-6 w-max pl-[max(4vw,calc((100vw-1200px)/2))] pr-[8vw]"
        >
          {PROJECTS.map((project, index) => (
            <div key={project.id} className="w-[min(1080px,86vw)] shrink-0">
              <ProjectCard project={project} index={index} cardT={t.cards} compact />
            </div>
          ))}
        </motion.div>

        <div className="section-shell relative mt-8">
          <div className="h-px bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-primary origin-left" style={{ scaleX: barScale }} />
          </div>
        </div>
      </div>
    </div>
  );
}
