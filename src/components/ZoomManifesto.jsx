import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function Phrase({ progress, index, total, text, caption, accent }) {
  const start = index / total;
  const end = (index + 1) / total;
  const span = end - start;
  // Grow in from the distance, hold, then fly past the camera.
  const enter = start + span * 0.3;
  const leave = start + span * 0.7;
  const isLast = index === total - 1;

  const scale = useTransform(
    progress,
    [start, enter, leave, end],
    isLast ? [0.55, 1, 1, 1] : [0.55, 1, 1, 3.2]
  );
  const opacity = useTransform(
    progress,
    [start, enter, leave, end],
    isLast ? [0, 1, 1, 1] : [0, 1, 1, 0]
  );
  const captionOpacity = useTransform(progress, [start, enter, leave, end], [0, 1, 1, isLast ? 1 : 0]);

  return (
    <>
      <motion.p
        className={`zoom-phrase ${accent ? "is-accent" : ""}`}
        style={{ scale, opacity }}
        aria-hidden="true"
      >
        {text}
      </motion.p>
      <motion.p className="zoom-caption" style={{ opacity: captionOpacity }} aria-hidden="true">
        <span className="text-primary">{String(index + 1).padStart(2, "0")}</span> {caption}
      </motion.p>
    </>
  );
}

// A tall pinned section: scrolling through it zooms each phrase toward the viewer in turn.
export default function ZoomManifesto({ phrases }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const total = phrases.length;
  const counterWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: `${total * 90 + 60}vh` }}
      aria-label={phrases.map((p) => p.text).join(" ")}
    >
      <div className="sticky top-0 h-screen overflow-hidden grid place-items-center on-rain">
        <div className="zoom-vignette" aria-hidden />
        {phrases.map((phrase, i) => (
          <Phrase
            key={phrase.text}
            progress={scrollYProgress}
            index={i}
            total={total}
            text={phrase.text}
            caption={phrase.caption}
            accent={i === total - 1}
          />
        ))}
        <div className="absolute bottom-10 inset-x-0 section-shell">
          <div className="h-px bg-white/10 overflow-hidden">
            <motion.div className="h-full bg-primary" style={{ width: counterWidth }} />
          </div>
        </div>
      </div>
    </section>
  );
}
