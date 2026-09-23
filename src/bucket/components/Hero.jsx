import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

const EASE = [0.76, 0, 0.24, 1];

// Stickers carry each dream's headline number and drift/tilt toward the cursor
// at different depths. They sit in the empty space right of the title (sized in
// vw, so that space exists at every width), clear of any text.
const STICKERS = [
  { text: "8,849 m", pos: "right-[18%] top-[24%]", rotate: -8, depth: 26, bg: "#2f6df6" },
  { text: "20.8 km of Green Hell", pos: "right-[4%] top-[35%]", rotate: 6, depth: 40, bg: "#ff6a00" },
  { text: "226 km in a day", pos: "right-[16%] top-[48%]", rotate: 5, depth: 34, bg: "#e6202e" },
  { text: "1 album, 1 person", pos: "right-[5%] top-[58%]", rotate: -6, depth: 22, bg: "#7c3aed" },
];

function Sticker({ sticker, mx, my, index, introDelay }) {
  const x = useTransform(mx, (v) => v * sticker.depth);
  const y = useTransform(my, (v) => v * sticker.depth);
  const rotate = useTransform(mx, (v) => sticker.rotate + v * 6);
  return (
    <motion.span
      className={`absolute hidden md:inline-flex b-sticker ${sticker.pos}`}
      style={{ x, y, rotate, background: sticker.bg }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: introDelay + 0.9 + index * 0.12, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      aria-hidden="true"
    >
      {sticker.text}
    </motion.span>
  );
}

function RiseLine({ children, delay, className = "" }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero({ introDelay = 0 }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 80, damping: 18 });
  const my = useSpring(rawY, { stiffness: 80, damping: 18 });

  useEffect(() => {
    if (reduceMotion) return undefined;
    const onMove = (e) => {
      rawX.set(e.clientX / window.innerWidth - 0.5);
      rawY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY, reduceMotion]);

  const intro =
    "Not a résumé. Four things I want to have done, each of which scares me a little. This page tracks them until they're crossed off.";

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col justify-center pt-28 pb-16 overflow-hidden">
      {STICKERS.map((s, i) => (
        <Sticker key={s.text} sticker={s} mx={mx} my={my} index={i} introDelay={introDelay} />
      ))}

      <div className="b-shell relative">
        <motion.p
          className="b-mono text-[var(--ink-3)] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: introDelay }}
        >
          manas jha / things to do before i&apos;m done
        </motion.p>

        <h1 className="b-hero-title">
          <RiseLine delay={introDelay + 0.1}>Bucket</RiseLine>
          <RiseLine delay={introDelay + 0.22}>
            List<span className="b-hero-italic text-[0.42em] align-top ml-[0.15em] tracking-normal">(04)</span>
          </RiseLine>
        </h1>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <p className="text-[clamp(1.25rem,2.4vw,1.9rem)] leading-[1.25] tracking-[-0.02em] max-w-[34ch]">
            {intro.split(" ").map((word, i) => (
              <motion.span
                key={i}
                className="inline-block mr-[0.28em]"
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: introDelay + 0.6 + i * 0.03, duration: 0.5 }}
              >
                {word}
              </motion.span>
            ))}
          </p>
          <motion.a
            href="#overview"
            className="justify-self-start md:justify-self-end b-pill"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: introDelay + 1.4 }}
          >
            scroll to see the list
            <span aria-hidden>↓</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
