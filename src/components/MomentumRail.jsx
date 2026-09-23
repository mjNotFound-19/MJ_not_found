import { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import CinematicImage from "./motion/CinematicImage";
import HighlineText from "./motion/HighlineText";
import { MOMENTUM_PILLS, MOMENTUM_TRACK } from "../config/content";
import { useLanguage } from "../context/LanguageContext";

function TiltCard({ card, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-80, 80], [10, -10]);
  const rotateY = useTransform(x, [-80, 80], [-10, 10]);
  const springX = useSpring(rotateX, { stiffness: 280, damping: 24, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 280, damping: 24, mass: 0.4 });

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left - bounds.width / 2;
    const offsetY = event.clientY - bounds.top - bounds.height / 2;
    x.set(offsetX);
    y.set(offsetY);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      className="momentum-card tilt-card"
      style={{
        "--card-accent": card.accent ?? "var(--accent)",
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: "easeOut", delay: index * 0.05 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="momentum-depth" aria-hidden />
      <div className="momentum-arc" aria-hidden />

      <div className="flex items-center justify-between gap-3">
        <span className="momentum-tag">{card.tag}</span>
        <span className="momentum-metric">
          <span className="live-dot" />
          {card.metric}
        </span>
      </div>

      <p className="momentum-eyebrow">{card.eyebrow}</p>
      <h3 className="momentum-title">{card.title}</h3>
      <p className="momentum-copy">{card.description}</p>

      {card.poster ? (
        <motion.div
          className="momentum-media momentum-holo"
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
        >
          <div className="momentum-media-glow" aria-hidden />
          <CinematicImage src={card.poster} alt={card.title} className="momentum-media-img" overlay={false} />
        </motion.div>
      ) : (
        <div className="momentum-media momentum-placeholder">
          <span className="momentum-pill">
            <span className="pill-dot" />
            {card.tag}
          </span>
          <span className="text-sm text-white/50">No public media</span>
        </div>
      )}

      <div className="momentum-meta">
        <span className="momentum-meta-dot" />
        Interactive card rail for active ML workstreams.
      </div>
    </motion.article>
  );
}

export default function MomentumRail() {
  const { t } = useLanguage();

  const momentumText = t.momentum ?? {};
  const marqueeItems = momentumText.marquee ?? MOMENTUM_PILLS;
  const cards = useMemo(() => {
    const overrides = momentumText.cards ?? {};
    return MOMENTUM_TRACK.map((item) => {
      const override = overrides[item.id] ?? {};
      return {
        ...item,
        ...override,
        title: override.title ?? item.title,
        description: override.description ?? item.description,
        eyebrow: override.eyebrow ?? item.eyebrow,
        tag: override.tag ?? item.tag,
        metric: override.metric ?? item.metric,
        accent: override.accent ?? item.accent,
        poster: override.poster ?? item.poster,
      };
    });
  }, [momentumText]);

  const fallbackTitle = "Momentum rail for current ML work";
  const fallbackSubtitle =
    "Tactile 3D cards covering clinical RAG, model evaluation, forecasting, and infrastructure analytics.";

  return (
    <section id="momentum" className="relative py-24 sm:py-28">
      <div className="section-shell space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.45em] leading-[1.3] text-white/50">
              {momentumText.eyebrow ?? "Momentum rail"}
            </p>
            <HighlineText
              as="h2"
              className="text-[clamp(2.6rem,4vw,3.5rem)] leading-tight font-semibold"
              color="#d2ff00"
            >
              {momentumText.title ?? fallbackTitle}
            </HighlineText>
            <p className="text-white/70 leading-relaxed">
              {momentumText.subtitle ?? fallbackSubtitle}
            </p>
          </div>
          <div className="momentum-marquee" aria-hidden="true">
            <div className="momentum-marquee-track">
              {[...marqueeItems, ...marqueeItems].map((pill, index) => (
                <span key={`${pill}-${index}`} className="momentum-pill">
                  <span className="pill-dot" />
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="momentum-rail">
          <div className="momentum-grid">
            {cards.map((card, index) => (
              <div key={card.id} className="tilt-wrap">
                <TiltCard card={card} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
