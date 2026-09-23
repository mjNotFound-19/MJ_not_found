import { useRef } from "react";
import { motion, useMotionValue, useScroll, useSpring } from "framer-motion";
import { EXPERIENCE } from "../config/content";
import { sharedEasing } from "../lib/motion";
import { useLanguage } from "../context/LanguageContext";

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.98 },
  show: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: index * 0.08,
      ease: sharedEasing,
    },
  }),
};

const bulletVariants = {
  hidden: { opacity: 0, x: -12 },
  show: (index) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.45,
      delay: index * 0.08,
      ease: sharedEasing,
    },
  }),
};

export default function Experience() {
  const { t } = useLanguage();
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.9", "end 0.15"],
  });
  const progressY = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div ref={timelineRef} className="experience-wrapper">
      <span className="timeline-track" aria-hidden="true" />
      <motion.span
        className="timeline-progress"
        style={{ scaleY: progressY }}
        aria-hidden="true"
      />
      <div className="experience-stack">
        {EXPERIENCE.map((job, index) => (
          <ExperienceCard job={job} index={index} key={`${job.role}-${job.period}`} />
        ))}
      </div>
    </div>
  );
}

function ExperienceCard({ job, index }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const tiltX = useSpring(rotateX, { stiffness: 120, damping: 18, restDelta: 0.001 });
  const tiltY = useSpring(rotateY, { stiffness: 120, damping: 18, restDelta: 0.001 });

  const handleMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    rotateY.set((relativeX - 0.5) * 10);
    rotateX.set((0.5 - relativeY) * 6);
    event.currentTarget.style.setProperty("--spotlight-x", `${relativeX * 100}%`);
    event.currentTarget.style.setProperty("--spotlight-y", `${relativeY * 100}%`);
  };

  const handleMouseLeave = (event) => {
    rotateX.set(0);
    rotateY.set(0);
    event.currentTarget.style.removeProperty("--spotlight-x");
    event.currentTarget.style.removeProperty("--spotlight-y");
  };

  const { t } = useLanguage();
  const translated = t.experience?.[job.role] ?? {};

  return (
    <motion.article
      className="experience-card group glass"
      variants={cardVariants}
      custom={index}
      initial="show"
      animate="show"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: tiltX, rotateY: tiltY }}
    >
      <div className="timeline-node" aria-hidden="true">
        <span />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] leading-[1.3] text-primary/70">
            {translated.org ?? job.org}
          </p>
          <h3 className="text-xl font-semibold text-white mt-3 leading-snug">{translated.role ?? job.role}</h3>
        </div>
        <span className={`experience-period ${job.period.includes("Present") ? "is-current" : ""}`}>
          {job.period.includes("Present") && <span className="status-dot" aria-hidden />}
          {translated.period ?? job.period}
        </span>
      </div>

      <ul className="mt-6 space-y-3 text-gray-300 text-sm leading-relaxed">
        {(translated.bullets ?? job.bullets).map((bullet, bulletIndex) => (
          <motion.li
            key={bullet}
            className="flex items-start gap-3"
            variants={bulletVariants}
            custom={bulletIndex}
            initial="show"
            animate="show"
          >
            <span className="bullet-dot" />
            <span className="flex-1">{bullet}</span>
          </motion.li>
        ))}
      </ul>
    </motion.article>
  );
}
