import { useCallback, useMemo, useRef, useState } from "react";
import { motion, useInView, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { CLIMB_MARKERS, DREAMS, PEAKS } from "../data";
import ChapterHeader from "./ChapterHeader";
import TerrainCanvas from "./TerrainCanvas";

const dream = DREAMS.find((d) => d.id === "summits");
const SUMMIT = PEAKS[0].height;
const W = 1600;
const H = 900;

// Deterministic jagged ridgeline: layered sines give the shape, a small seeded
// jitter gives the rock. Same output every render, so no hydration surprises.
function ridge(seed, base, amp, peak = null) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const p1 = rand() * 6;
  const p2 = rand() * 6;
  const p3 = rand() * 6;
  let d = `M0 ${H}`;
  for (let x = 0; x <= W; x += 32) {
    let y =
      base -
      amp * (0.55 * Math.sin(x * 0.0035 + p1) + 0.3 * Math.sin(x * 0.009 + p2) + 0.15 * Math.sin(x * 0.021 + p3));
    if (peak) {
      const dist = Math.abs(x - peak.x) / peak.width;
      if (dist < 1) y -= peak.height * (1 - dist) ** 1.4;
    }
    y += (rand() - 0.5) * amp * 0.12;
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return `${d} L${W} ${H} Z`;
}

const LAYERS = [
  { seed: 11, base: 520, amp: 90, fill: "#b9c6e3", speed: 0.15 },
  { seed: 23, base: 610, amp: 110, fill: "#8fa5d6", speed: 0.35 },
  { seed: 37, base: 700, amp: 120, fill: "#5f7fc8", speed: 0.6, peak: { x: 1080, width: 420, height: 260 } },
  { seed: 53, base: 820, amp: 90, fill: "#2f6df6", speed: 1 },
];

function Ridge({ layer, progress }) {
  const d = useMemo(() => ridge(layer.seed, layer.base, layer.amp, layer.peak), [layer]);
  // Climbing means the world drops away beneath you: nearer ridges sink faster.
  const y = useTransform(progress, [0, 1], [0, 520 * layer.speed]);
  return <motion.path d={d} fill={layer.fill} style={{ y }} />;
}

function Stars({ opacity }) {
  const stars = useMemo(() => {
    let s = 7;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: 60 }, () => ({ x: rand() * W, y: rand() * 420, r: 0.6 + rand() * 1.6 }));
  }, []);
  return (
    <motion.g style={{ opacity }}>
      {stars.map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="#fff" />
      ))}
    </motion.g>
  );
}

// Standard-atmosphere approximation: pressure falls off exponentially with a
// scale height of ~8.4 km. Gives ~53% at base camp and ~35% on the summit.
const pressureAt = (m) => Math.exp(-m / 8400);

function Climb() {
  const ref = useRef(null);
  const altRef = useRef(null);
  const pressureRef = useRef(null);
  const [markerIndex, setMarkerIndex] = useState(0);
  // Text flips from ink to paper at one point instead of blending: a blended
  // colour passes through grey-on-blue mid-climb. At 7,000 m the sky is dark
  // enough that both colours still clear ~4:1 during the quick fade.
  const [dark, setDark] = useState(false);
  // Rendered mountains when WebGL works; the illustrated ridges otherwise.
  const [realistic, setRealistic] = useState(true);
  const onUnsupported = useCallback(() => setRealistic(false), []);
  // Compiling the terrain shader stalls the GPU for ~0.2s, so start it about a
  // screen before the climb arrives rather than during the page's intro.
  const nearClimb = useInView(ref, { once: true, margin: "100% 0px 100% 0px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const altitude = useTransform(scrollYProgress, [0.04, 0.88], [0, SUMMIT], { clamp: true });
  const climb = useTransform(altitude, [0, SUMMIT], [0, 1]);

  const sky = useTransform(
    altitude,
    [0, 5364, 6500, 8000, SUMMIT],
    ["#ebe9e4", "#cdd8ef", "#6a7fbd", "#26366b", "#0d1633"]
  );
  const starOpacity = useTransform(altitude, [7000, SUMMIT], [0, 1]);
  const pressureWidth = useTransform(altitude, (m) => `${(pressureAt(m) * 100).toFixed(1)}%`);
  const flagScale = useTransform(altitude, [SUMMIT - 120, SUMMIT], [0, 1]);

  useMotionValueEvent(altitude, "change", (m) => {
    if (altRef.current) altRef.current.textContent = Math.round(m).toLocaleString("en-US");
    if (pressureRef.current) pressureRef.current.textContent = `${Math.round(pressureAt(m) * 100)}%`;
    let idx = 0;
    CLIMB_MARKERS.forEach((marker, i) => {
      if (m >= marker.at) idx = i;
    });
    setMarkerIndex(idx);
    setDark(m >= 7000);
  });

  // Over the rendered scene the text is always light on dark glass: the image
  // mixes bright snow and dark rock, so no single ink colour works on it bare.
  const onDark = realistic || dark;
  const panel = `rounded-2xl p-4 md:p-5 transition-colors duration-500 ${
    onDark ? "bg-[rgba(8,12,24,0.62)]" : "bg-[rgba(235,233,228,0.82)]"
  }`;

  return (
    <div ref={ref} className="relative h-[320vh] md:h-[420vh]">
      <motion.div
        className="sticky top-0 h-[100svh] overflow-hidden"
        style={{ backgroundColor: sky, color: onDark ? "#ebe9e4" : "#111111", transition: "color 0.4s ease" }}
      >
        {realistic ? (
          <>
            {nearClimb && <TerrainCanvas climb={climb} onUnsupported={onUnsupported} />}
            {/* Soft scrim behind the altitude readout. */}
            <div
              className="absolute inset-0 pointer-events-none"
              // Strong enough across the whole readout that white text holds >3:1 even
              // where it sits over the bright early-climb sky.
              style={{
                background:
                  "linear-gradient(90deg, rgba(4,8,18,0.66), rgba(4,8,18,0.42) 55%, rgba(4,8,18,0.14))",
              }}
              aria-hidden="true"
            />
          </>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMax slice"
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <Stars opacity={starOpacity} />
            {LAYERS.map((layer) => (
              <Ridge key={layer.seed} layer={layer} progress={climb} />
            ))}
          </svg>
        )}

        <div className="relative h-full b-shell flex flex-col justify-center pt-16">
          <div className="grid gap-10 md:grid-cols-[1fr_320px] md:items-center">
            <div>
              <p className="b-mono opacity-70">altitude / everest, south route</p>
              <p
                className="b-giant-number mt-2"
                aria-live="off"
                style={realistic ? { textShadow: "0 2px 30px rgba(0,0,0,0.45)" } : undefined}
              >
                <span ref={altRef}>0</span>
                <span className="b-serif italic text-[0.35em] ml-2 tracking-normal">m</span>
              </p>
              <div className={`mt-6 max-w-sm ${panel}`}>
                <div className="flex justify-between b-mono opacity-80">
                  <span>air pressure vs. sea level</span>
                  <span ref={pressureRef}>100%</span>
                </div>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(127,127,127,0.25)" }}>
                  <motion.div className="h-full rounded-full bg-current" style={{ width: pressureWidth }} />
                </div>
              </div>
            </div>

            <ol className={`space-y-3 ${panel}`}>
              {CLIMB_MARKERS.map((marker, i) => {
                const reached = i <= markerIndex;
                const current = i === markerIndex;
                return (
                  <li
                    key={marker.label}
                    className="flex gap-4 transition-opacity duration-500"
                    style={{ opacity: reached ? 1 : 0.55 }}
                  >
                    <span className="b-mono w-16 shrink-0 text-right tabular-nums">
                      {marker.at.toLocaleString("en-US")}
                    </span>
                    <span>
                      <span className={`block font-semibold ${current ? "underline underline-offset-4" : ""}`}>
                        {marker.label}
                      </span>
                      <span className="block text-sm opacity-75">{marker.note}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* Outer div centres; inner scales (Framer's transform would replace the translate). */}
        <div className="absolute left-1/2 top-[14%] -translate-x-1/2" aria-hidden="true">
          <motion.div className="origin-bottom" style={{ scale: flagScale }}>
            <span className="b-sticker" style={{ background: dream.accent, color: "#fff" }}>
              summit / top of the world
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function PeakRow() {
  return (
    <div className="b-shell mt-20 md:mt-28">
      <p className="b-mono text-[var(--ink-3)] mb-6">the three, to scale</p>
      <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
        {PEAKS.map((peak, i) => {
          const h = (peak.height / SUMMIT) * 100;
          return (
            <motion.div
              key={peak.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.76, 0, 0.24, 1] }}
            >
              <div className="relative h-[180px] md:h-[280px]">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
                  <path d={`M0 100 L50 ${100 - h} L100 100 Z`} fill={i === 0 ? dream.accent : "#8fa5d6"} />
                  <path d={`M50 ${100 - h} L60 ${100 - h + 14} L50 ${100 - h + 10} L40 ${100 - h + 14} Z`} fill="#fff" />
                </svg>
              </div>
              <div className="border-t border-[var(--ink)] pt-3 mt-2">
                <p className="b-mono text-[var(--ink-3)]">0{i + 1}</p>
                <p className="text-lg md:text-2xl font-bold tracking-[-0.03em] leading-tight">{peak.name}</p>
                <p className="b-stat mt-1 text-[clamp(1.2rem,3vw,2.2rem)]">
                  {peak.height.toLocaleString("en-US")}
                  <span className="b-serif italic text-[0.6em] ml-1 font-normal">m</span>
                </p>
                <p className="b-mono text-[var(--ink-3)] mt-1">{peak.range}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Summits() {
  return (
    <section id="summits" className="relative pt-24 md:pt-32 pb-24 md:pb-32">
      <ChapterHeader dream={dream} />
      <div className="mt-16">
        <Climb />
      </div>
      <PeakRow />
    </section>
  );
}
