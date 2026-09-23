import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Bike, Footprints, Waves } from "lucide-react";
import { DREAMS, IRONMAN_CUTOFF_HOURS, IRONMAN_LEGS } from "../data";
import ChapterHeader from "./ChapterHeader";

const dream = DREAMS.find((d) => d.id === "ironman");
const TOTAL_KM = IRONMAN_LEGS.reduce((sum, leg) => sum + leg.km, 0);
const ICONS = { swim: Waves, bike: Bike, run: Footprints };
const KM_TO_MI = 0.621371;

// Cumulative start/end of each leg as a fraction of the whole course.
let acc = 0;
const SEGMENTS = IRONMAN_LEGS.map((leg) => {
  const start = acc / TOTAL_KM;
  acc += leg.km;
  return { ...leg, start, end: acc / TOTAL_KM };
});

const clock = (hours) => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function Course() {
  const ref = useRef(null);
  const kmRef = useRef(null);
  const clockRef = useRef(null);
  const [legIndex, setLegIndex] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const race = useTransform(scrollYProgress, [0.05, 0.9], [0, 1], { clamp: true });
  const markerLeft = useTransform(race, (p) => `${p * 100}%`);
  const fillWidth = markerLeft;

  useMotionValueEvent(race, "change", (p) => {
    if (kmRef.current) kmRef.current.textContent = (p * TOTAL_KM).toFixed(1);
    if (clockRef.current) clockRef.current.textContent = clock(p * IRONMAN_CUTOFF_HOURS);
    const idx = SEGMENTS.findIndex((seg) => p <= seg.end);
    setLegIndex(idx === -1 ? SEGMENTS.length - 1 : idx);
  });

  const leg = SEGMENTS[legIndex];
  const Icon = ICONS[leg.id];

  return (
    <div ref={ref} className="relative h-[280vh] md:h-[340vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden flex flex-col justify-center">
        <div className="b-shell w-full">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="b-mono text-[var(--ink-3)]">distance covered</p>
              <p className="b-giant-number mt-2">
                <span ref={kmRef}>0.0</span>
                <span className="b-serif italic text-[0.3em] ml-2 tracking-normal font-normal">
                  / {TOTAL_KM.toFixed(1)} km
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <motion.span
                key={leg.id}
                className="w-16 h-16 rounded-full grid place-items-center text-white"
                style={{ background: dream.accent }}
                initial={{ scale: 0.4, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
              >
                <Icon size={28} aria-hidden />
              </motion.span>
              <div>
                <p className="b-mono text-[var(--ink-3)]">leg {legIndex + 1} of 3</p>
                <p className="text-3xl font-bold tracking-[-0.04em]">{leg.label}</p>
              </div>
            </div>
          </div>

          {/* The course, to scale. The swim really is that small. */}
          <div className="mt-12 md:mt-16">
            <p className="b-mono mb-3">
              {SEGMENTS[0].label} <span className="text-[var(--ink-3)]">{SEGMENTS[0].km} km</span>
              <span className="text-[var(--ink-3)]"> &darr; yes, that sliver</span>
            </p>
            <div className="relative h-4 rounded-full bg-[var(--paper-3)] overflow-visible">
              {SEGMENTS.map((seg, i) => (
                <div
                  key={seg.id}
                  className="absolute top-0 h-full"
                  style={{
                    left: `${seg.start * 100}%`,
                    width: `${(seg.end - seg.start) * 100}%`,
                    borderLeft: i > 0 ? "2px solid var(--paper)" : "none",
                  }}
                />
              ))}
              <motion.div className="absolute left-0 top-0 h-full rounded-full" style={{ width: fillWidth, background: dream.accent }} />
              <motion.div
                className="absolute top-1/2 w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border-4 border-[var(--paper)] shadow-lg"
                style={{ left: markerLeft, background: "var(--ink)" }}
                aria-hidden
              />
            </div>
            <div className="relative mt-4 h-12">
              {SEGMENTS.slice(1).map((seg, i, rest) => (
                <div
                  key={seg.id}
                  className="absolute top-0"
                  // The last label hugs the right edge so it can't overflow on phones.
                  style={i === rest.length - 1 ? { right: 0 } : { left: `${seg.start * 100}%` }}
                >
                  <p className="b-mono whitespace-nowrap">
                    {seg.label} <span className="text-[var(--ink-3)]">{seg.km} km</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <p className="b-mono text-[var(--ink-3)]">clock at exactly cutoff pace</p>
            <p className="b-stat">
              <span ref={clockRef}>00:00</span>
              <span className="text-[var(--ink-3)]"> / {IRONMAN_CUTOFF_HOURS}:00</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Ironman() {
  return (
    <section id="ironman" className="relative pt-24 md:pt-32 pb-24 md:pb-32">
      <ChapterHeader dream={dream} />
      <div className="mt-10">
        <Course />
      </div>
      <div className="b-shell mt-10 grid gap-4 md:grid-cols-4">
        {SEGMENTS.map((seg, i) => {
          const Icon = ICONS[seg.id];
          return (
            <motion.div
              key={seg.id}
              className="rounded-[20px] border border-[var(--rule)] bg-[var(--paper-2)] p-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.76, 0, 0.24, 1] }}
            >
              <Icon size={22} style={{ color: dream.accent }} aria-hidden />
              <p className="b-stat mt-4">
                {seg.km}
                <span className="b-serif italic text-[0.55em] font-normal ml-1">km</span>
              </p>
              <p className="b-mono text-[var(--ink-3)] mt-1">
                {seg.label.toLowerCase()} / {(seg.km * KM_TO_MI).toFixed(1)} mi
              </p>
            </motion.div>
          );
        })}
        <motion.div
          className="rounded-[20px] p-5 text-white"
          style={{ background: dream.accent }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.24, ease: [0.76, 0, 0.24, 1] }}
        >
          <p className="b-mono opacity-80">all of it, back to back</p>
          <p className="b-stat mt-4">
            {IRONMAN_CUTOFF_HOURS}
            <span className="b-serif italic text-[0.55em] font-normal ml-1">hours</span>
          </p>
          <p className="b-mono opacity-80 mt-1">to beat the cutoff</p>
        </motion.div>
      </div>
    </section>
  );
}
