import { motion } from "framer-motion";
import { PROJECTS } from "../config/content";
import CinematicImage from "./motion/CinematicImage";
import { fadeUp, staggerChildren } from "../lib/motion";
import useMagnetic from "../hooks/useMagnetic";
import { useLanguage } from "../context/LanguageContext";
import RollText from "./motion/RollText";

export default function Projects() {
  const { t } = useLanguage();
  return (
    <div className="space-y-12">
      {PROJECTS.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} cardT={t.cards} />
      ))}
    </div>
  );
}

// `compact` tightens spacing so a card fits inside the pinned horizontal viewport.
export function ProjectCard({ project, index, cardT, compact = false }) {
  const { ref, magneticStyle } = useMagnetic(0.25);
  const { t } = useLanguage();
  const trans = t.projects?.[project.id];
  const title = trans?.title ?? project.title;
  const description = trans?.description ?? project.description;
  const highlights =
    Array.isArray(trans?.highlights) && trans.highlights.length > 0
      ? trans.highlights
      : project.highlights;
  const metrics =
    Array.isArray(trans?.metrics) && trans.metrics.length > 0 ? trans.metrics : project.metrics ?? [];
  const ctaLabel = trans?.ctaLabel ?? project.cta.label;

  const mediaEnabled = project.mediaPanel !== false;
  const hasPoster = mediaEnabled && Boolean(project.poster);
  const hasMetrics = mediaEnabled && Array.isArray(project.metrics) && project.metrics.length > 0;
  const hasMediaPanel = hasPoster || hasMetrics;
  const layoutClasses = [
    compact
      ? "relative rounded-[31px] bg-[rgba(2,4,14,0.93)] p-8 xl:p-10 grid gap-8"
      : "relative rounded-[31px] bg-[rgba(2,4,14,0.93)] p-6 sm:p-10 lg:p-12 grid gap-10",
    hasMediaPanel ? "lg:grid-cols-[minmax(0,1.2fr)_0.8fr]" : "",
  ]
    .join(" ")
    .trim();
  const externalCta = project.cta.href.startsWith("http");
  const assetDocumentCta = /^\/assets\/docs\//.test(project.cta.href);
  const shouldOpenInNewTab = externalCta || assetDocumentCta;

  return (
    <motion.section
      id={`project-${project.id}`}
      className="project-card relative overflow-hidden rounded-[32px] p-[1px]"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.05 }}
    >
      <div className={layoutClasses}>
        <div className={compact ? "space-y-4" : "space-y-6"}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs" style={{ color: project.accent }}>{String(index + 1).padStart(2, "0")}</span>
            <span className="mono-chip">{project.tag}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">{title}</h3>
          <p className="text-white/70 leading-relaxed">{description}</p>

          <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-6"}`}>
            {project.stack.map((tool) => (
              <span
                key={tool}
                className="tech-chip"
              >
                {tool}
              </span>
            ))}
          </div>

          <motion.ul
            className={`${compact ? "mt-2 space-y-2" : "mt-6 space-y-4"} text-sm text-white/80`}
            variants={staggerChildren(0.08)}
            initial="hidden"
            animate="show"
          >
            {highlights.map((highlight) => (
              <motion.li
                key={highlight}
                variants={fadeUp(0, 14)}
                className="flex items-start gap-3"
              >
                <span className="bullet-dot" />
                <span>{highlight}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.a
            ref={ref}
            style={magneticStyle}
            href={project.cta.href}
            target={shouldOpenInNewTab ? "_blank" : undefined}
            rel={shouldOpenInNewTab ? "noreferrer" : undefined}
            className="btn-primary mt-4 magnetic-target"
            whileTap={{ scale: 0.98 }}
          >
            <span className="magnetic-shadow" />
            <RollText>{ctaLabel}</RollText>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>

        {hasMediaPanel && (
          <div className={compact ? "space-y-4" : "space-y-6"}>
            {hasPoster ? (
              <CinematicImage
                src={project.poster}
                alt={`${project.title} interface`}
                className={compact ? "max-h-[240px]" : ""}
              />
            ) : !hasMetrics ? (
              <div className="rounded-[32px] border border-dashed border-white/15 bg-white/5 p-8 flex flex-col justify-center h-full">
                <p className="text-xs uppercase tracking-[0.3em] leading-[1.3] text-white/50">{cardT.mediaPrivate}</p>
                <p className="text-lg font-semibold text-white mt-2">{cardT.poster}</p>
                <p className="text-sm text-white/60 mt-2">{cardT.mediaNote}</p>
              </div>
            ) : null}

            {hasMetrics && (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] leading-[1.3] text-white/60">
                      {cardT.metricsTitle}
                    </p>
                    <p className="text-base text-white/80">{cardT.metricsSub}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {cardT.metricsLive}
                  </div>
                </div>
                {(() => {
                  const metricCols =
                    metrics.length >= 3 ? "sm:grid-cols-3" : metrics.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-1";
                  return (
                    <div className={`grid gap-4 mt-6 ${metricCols}`}>
                      {metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-2xl border border-white/10 bg-black/40 p-4"
                        >
                          <p className="text-2xl font-semibold text-white">{metric.value}</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-[0.3em]">
                            {metric.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
