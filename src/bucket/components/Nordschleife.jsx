import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { DREAMS } from "../data";
import { START_FINISH, TRACK_CORNERS, TRACK_D } from "../nordschleifeTrack";
import ChapterHeader from "./ChapterHeader";

const dream = DREAMS.find((d) => d.id === "nordschleife");
const LAP_KM = 20.832;
const PAPER = "#ebe9e4";

function Tachometer({ rpm, gear }) {
  const needleRef = useRef(null);
  // 0 rpm at -120°, 9000 rpm at +120°. Set as an SVG rotate() around the hub:
  // CSS transforms on SVG pivot around the bounding box, not the gauge centre.
  useMotionValueEvent(rpm, "change", (r) => {
    const deg = -120 + (Math.max(0, Math.min(9000, r)) / 9000) * 240;
    needleRef.current?.setAttribute("transform", `rotate(${deg.toFixed(2)} 100 100)`);
  });
  const ticks = Array.from({ length: 10 }, (_, i) => i);
  const polar = (deg, r) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
  };
  const arc = (from, to, r) => {
    const [x1, y1] = polar(from, r);
    const [x2, y2] = polar(to, r);
    return `M${x1} ${y1} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  return (
    <div className="relative w-[140px] sm:w-[200px] md:w-[240px] aspect-square shrink-0">
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        <path d={arc(-120, 120, 86)} fill="none" stroke="rgba(235,233,228,0.15)" strokeWidth="10" />
        <path d={arc(80, 120, 86)} fill="none" stroke={dream.accent} strokeWidth="10" />
        {ticks.map((t) => {
          const deg = -120 + (t / 9) * 240;
          const [x1, y1] = polar(deg, 72);
          const [x2, y2] = polar(deg, 62);
          const [tx, ty] = polar(deg, 50);
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAPER} strokeWidth="2" />
              <text x={tx} y={ty + 4} textAnchor="middle" fill={PAPER} fontSize="11" fontFamily="Fragment Mono, monospace">
                {t}
              </text>
            </g>
          );
        })}
        <g ref={needleRef} transform="rotate(-120 100 100)">
          <line x1="100" y1="100" x2="100" y2="24" stroke={dream.accent} strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="100" cy="100" r="7" fill={PAPER} />
      </svg>
      <div className="absolute inset-x-0 bottom-[18%] text-center">
        <p className="b-mono text-[rgba(235,233,228,0.6)]">x1000 rpm</p>
        <p className="text-3xl font-bold" style={{ color: dream.accent }} ref={gear} aria-hidden="true">
          1
        </p>
      </div>
    </div>
  );
}

function Lap() {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const carRef = useRef(null);
  const kmRef = useRef(null);
  const gearRef = useRef(null);
  const [cornerIndex, setCornerIndex] = useState(-1);
  const labels = TRACK_CORNERS;

  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const lap = useTransform(scrollYProgress, [0.05, 0.92], [0, 1], { clamp: true });
  const dashOffset = useTransform(lap, (p) => 1 - p);

  // Scroll speed drives the engine: idle ~1,100 rpm, flat out near the limiter.
  const velocity = useVelocity(scrollY);
  const rawRpm = useTransform(velocity, (v) => Math.min(8800, 1100 + Math.abs(v) * 2.6));
  const rpm = useSpring(rawRpm, { stiffness: 140, damping: 20 });

  const placeCar = (p) => {
    const path = pathRef.current;
    if (!path || !carRef.current) return;
    const pt = path.getPointAtLength(p * path.getTotalLength());
    carRef.current.setAttribute("cx", pt.x);
    carRef.current.setAttribute("cy", pt.y);
  };

  useMotionValueEvent(lap, "change", (p) => {
    placeCar(p);
    if (kmRef.current) kmRef.current.textContent = (p * LAP_KM).toFixed(1);
    let idx = -1;
    labels.forEach((label, i) => {
      if (p >= label.t) idx = i;
    });
    setCornerIndex(idx);
  });

  useMotionValueEvent(rpm, "change", (r) => {
    if (gearRef.current) gearRef.current.textContent = String(Math.max(1, Math.min(6, 1 + Math.floor((r - 1100) / 1250))));
  });

  useLayoutEffect(() => placeCar(0), []);

  return (
    <div ref={ref} className="relative h-[300vh] md:h-[380vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex items-center">
        <div className="b-shell w-full grid gap-8 lg:grid-cols-[1fr_300px] items-center pt-14">
          <div className="relative">
            <svg viewBox="5 38 580 420" className="w-full max-h-[52svh] lg:max-h-[72svh]" aria-label="Nürburgring Nordschleife lap map">
              <path d={TRACK_D} fill="none" stroke="#2a2a2a" strokeWidth="12" strokeLinejoin="round" />
              <path
                ref={pathRef}
                d={TRACK_D}
                fill="none"
                stroke="rgba(235,233,228,0.25)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <motion.path
                d={TRACK_D}
                fill="none"
                stroke={dream.accent}
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                style={{ strokeDashoffset: dashOffset }}
              />
              {/* Start / finish line, drawn across the track. */}
              <g transform={`translate(${START_FINISH.x} ${START_FINISH.y})`}>
                <rect x="-1.5" y="-9" width="3" height="18" fill={PAPER} />
                <text x="0" y="30" textAnchor="middle" fill="rgba(235,233,228,0.6)" fontSize="9" fontFamily="Fragment Mono, monospace">
                  start / finish
                </text>
              </g>
              {labels.map((label, i) => (
                <g
                  key={label.name}
                  opacity={i <= cornerIndex ? 1 : 0.4}
                  // On small screens only the current corner is labelled; all 15 would be unreadably small.
                  className={i === cornerIndex ? "" : "hidden sm:inline"}
                >
                  <circle cx={label.x} cy={label.y} r="2.5" fill={i === cornerIndex ? dream.accent : PAPER} />
                  <text
                    x={label.lx}
                    y={label.ly}
                    fill={i === cornerIndex ? dream.accent : PAPER}
                    fontSize="10"
                    fontFamily="Fragment Mono, monospace"
                    // Dark halo so labels stay legible where they cross the track.
                    stroke="#111"
                    strokeWidth="4"
                    paintOrder="stroke"
                    strokeLinejoin="round"
                  >
                    {label.name}
                  </text>
                </g>
              ))}
              <circle ref={carRef} r="6" fill={PAPER} stroke={dream.accent} strokeWidth="2.5" />
            </svg>
            <p className="b-mono text-[rgba(235,233,228,0.45)] mt-2">traced from the circuit map</p>
          </div>

          <div className="flex lg:flex-col gap-8 items-center lg:items-start">
            <Tachometer rpm={rpm} gear={gearRef} />
            <div>
              <p className="b-mono text-[rgba(235,233,228,0.6)]">lap distance</p>
              <p className="b-stat mt-1">
                <span ref={kmRef}>0.0</span>
                <span className="text-[rgba(235,233,228,0.5)]"> / {LAP_KM.toFixed(1)} km</span>
              </p>
              <p className="b-mono text-[rgba(235,233,228,0.6)] mt-5">now through</p>
              <p className="text-2xl font-bold tracking-[-0.03em] mt-1" style={{ color: dream.accent }}>
                {cornerIndex >= 0 ? labels[cornerIndex]?.name : "Start / finish"}
              </p>
              <p className="b-mono text-[rgba(235,233,228,0.45)] mt-5 max-w-[26ch]">
                scroll faster to rev it
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FACTS = [
  { value: "20.8", unit: "km", label: "per lap" },
  { value: "~300", unit: "m", label: "of elevation change" },
  { value: "1927", unit: "", label: "year it opened" },
  { value: "Grüne", unit: "Hölle", label: "the Green Hell" },
];

export default function Nordschleife() {
  return (
    <section id="nordschleife" className="relative bg-[#111] text-[#ebe9e4] pt-24 md:pt-32 pb-24 md:pb-32">
      <ChapterHeader dream={dream} tone="dark" />
      <div className="mt-10">
        <Lap />
      </div>
      <div className="b-shell mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        {FACTS.map((fact, i) => (
          <motion.div
            key={fact.label}
            className="border-t border-[rgba(235,233,228,0.2)] pt-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: i * 0.08, ease: [0.76, 0, 0.24, 1] }}
          >
            <p className="b-stat">
              {fact.value}
              {fact.unit && <span className="b-serif italic text-[0.6em] font-normal ml-1">{fact.unit}</span>}
            </p>
            <p className="b-mono text-[rgba(235,233,228,0.6)] mt-2">{fact.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
