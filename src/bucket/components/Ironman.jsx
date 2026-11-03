import { useCallback, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Bike, Footprints, Waves } from "lucide-react";
import { DREAMS, IRONMAN_CUTOFF_HOURS, IRONMAN_LEGS } from "../data";
import ChapterHeader from "./ChapterHeader";
import { gsap } from "../lib/gsap";
import ShaderCanvas from "./ShaderCanvas";
import { IRONMAN_FRAG } from "../scenes/ironman.glsl.js";
import { drive, frameDelta, scrollRate } from "../lib/motion";

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

// Ironman starts at 7am and the cutoff is midnight, so the race clock is
// also a time of day. Without WebGL, a plain background still follows it:
// morning, golden hour, sunset, then night for the last hours of the run.
const START_HOUR = 7;
const SKY = [
  { at: 7, color: "#2a3550" },
  { at: 13, color: "#284873" },
  { at: 18, color: "#5a4636" },
  { at: 19.8, color: "#5e2f28" },
  { at: 21, color: "#1e2142" },
  { at: 24, color: "#07080f" },
];
const NIGHT_FROM = 20.4;
const skyAt = (hour) => {
  const i = Math.max(0, SKY.findIndex((stop) => stop.at >= hour) - 1);
  const a = SKY[i];
  const b = SKY[Math.min(i + 1, SKY.length - 1)];
  const t = b.at === a.at ? 0 : gsap.utils.clamp(0, 1, (hour - a.at) / (b.at - a.at));
  return gsap.utils.interpolate(a.color, b.color, t);
};
// Overriding the page's colour tokens on the scene flips every label at once.
const NIGHT_VARS = { "--ink": "#ebe9e4", "--ink-3": "rgba(235,233,228,0.62)", "--paper-3": "rgba(235,233,228,0.2)", "--paper": "#0c0f24" };
// Over the rendered scene the HUD is always light text on a dark scrim.
const SCENE_VARS = { ...NIGHT_VARS, "--paper": "#0b0c0f" };

// The scene goes dark just before each transition and cuts to the next leg
// exactly on it, like a cut in a film.
const FADE_SPAN = 0.008;

// How the athlete actually moves in each leg (m/s, m/s^2): a steady race
// pace with no input, faster while you scroll forward, easing off if you
// scroll back. `push` converts scroll speed (race progress/s) into m/s.
const PACE = [
  { cruise: 1.5, top: 2.2, accel: 0.6, brake: 0.9, push: 3 },
  { cruise: 9, top: 16, accel: 1.6, brake: 3, push: 30 },
  { cruise: 3.2, top: 5.6, accel: 1.2, brake: 2.4, push: 10 },
];
const fadeAt = (p) =>
  SEGMENTS.slice(1).reduce((f, seg) => Math.max(f, p < seg.start ? gsap.utils.clamp(0, 1, (p - (seg.start - FADE_SPAN)) / FADE_SPAN) : 0), 0);


const clock = (hours) => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function Course() {
  const ref = useRef(null);
  const kmRef = useRef(null);
  const clockRef = useRef(null);
  const timeRef = useRef(null);
  const sceneRef = useRef(null);
  const sunRef = useRef(null);
  const moonRef = useRef(null);
  const [legIndex, setLegIndex] = useState(0);
  const [night, setNight] = useState(false);
  const [realistic, setRealistic] = useState(true);
  const onUnsupported = useCallback(() => setRealistic(false), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const race = useTransform(scrollYProgress, [0.05, 0.9], [0, 1], { clamp: true });
  const markerLeft = useTransform(race, (p) => `${p * 100}%`);
  const fillWidth = markerLeft;

  useMotionValueEvent(race, "change", (p) => {
    if (kmRef.current) kmRef.current.textContent = (p * TOTAL_KM).toFixed(1);
    if (clockRef.current) clockRef.current.textContent = clock(p * IRONMAN_CUTOFF_HOURS);
    const hour = START_HOUR + p * IRONMAN_CUTOFF_HOURS;
    if (timeRef.current) timeRef.current.textContent = clock(hour);
    if (sceneRef.current && !realistic) sceneRef.current.style.backgroundColor = skyAt(hour);
    // Sun arcs across the top until sunset (~20:00); the moon rises after.
    const day = gsap.utils.clamp(0, 1, (hour - START_HOUR) / (20.2 - START_HOUR));
    gsap.set(sunRef.current, {
      left: `${6 + day * 88}%`,
      top: `${26 - Math.sin(day * Math.PI) * 18}%`,
      autoAlpha: hour < 20.4 ? 1 : 0,
    });
    const moon = gsap.utils.clamp(0, 1, (hour - 20.6) / 3.4);
    gsap.set(moonRef.current, { left: `${10 + moon * 30}%`, top: `${24 - moon * 12}%`, autoAlpha: moon > 0 ? 1 : 0 });
    setNight(hour >= NIGHT_FROM);
    const idx = SEGMENTS.findIndex((seg) => p <= seg.end);
    setLegIndex(idx === -1 ? SEGMENTS.length - 1 : idx);
  });

  // The athlete: the scene's distance and speed come from this, not straight
  // from scroll; each leg starts fresh at its own pace.
  const athlete = useRef({ leg: -1, v: 0, d: 0, a: 0, last: 0 });
  const sceneUniforms = useCallback((t) => {
    const p = race.get();
    const i = Math.max(0, SEGMENTS.findIndex((seg) => p < seg.end || seg === SEGMENTS[SEGMENTS.length - 1]));
    const s = athlete.current;
    const pace = PACE[i];
    if (s.leg !== i) {
      s.leg = i;
      s.v = pace.cruise;
      s.d = 0;
    }
    const dt = frameDelta(s, t);
    const rate = scrollRate(s, p, dt);
    const want = rate < -0.005 ? pace.cruise * 0.8 : Math.min(pace.top, pace.cruise + Math.max(0, rate) * pace.push);
    drive(s, dt, want, pace);
    return {
      uLeg: i,
      uDist: s.d,
      uVel: s.v,
      uHour: START_HOUR + p * IRONMAN_CUTOFF_HOURS,
      uFade: fadeAt(p),
      uBend: 0.45,
      uHills: 0.6,
    };
  }, [race]);

  const leg = SEGMENTS[legIndex];
  const Icon = ICONS[leg.id];

  return (
    <div ref={ref} className="relative h-[280vh] md:h-[340vh]">
      <div
        ref={sceneRef}
        className={`sticky top-0 h-[100svh] overflow-hidden flex flex-col text-[var(--ink)] ${
          realistic ? "justify-end pb-10 md:pb-14 bg-[#050608]" : "justify-center"
        }`}
        style={
          realistic
            ? SCENE_VARS
            : { backgroundColor: SKY[0].color, transition: "color 0.4s ease", ...(night ? NIGHT_VARS : null) }
        }
      >
        {realistic && (
          <>
            <ShaderCanvas frag={IRONMAN_FRAG} getUniforms={sceneUniforms} onUnsupported={onUnsupported} />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(180deg, transparent 35%, rgba(3,4,7,0.82))" }}
              aria-hidden="true"
            />
          </>
        )}
        <span
          ref={sunRef}
          hidden={realistic}
          className="absolute w-14 h-14 md:w-20 md:h-20 -ml-7 md:-ml-10 rounded-full pointer-events-none"
          style={{ left: "6%", top: "26%", background: "radial-gradient(circle, #ffe9a8 0 45%, rgba(255,200,90,0.35) 46% 100%)" }}
          aria-hidden="true"
        />
        <span
          ref={moonRef}
          hidden={realistic}
          className="absolute w-10 h-10 md:w-14 md:h-14 rounded-full pointer-events-none opacity-0"
          style={{ background: "#f4f1e6", boxShadow: "inset -10px -4px 0 0 #c9c4b3, 0 0 40px rgba(244,241,230,0.35)" }}
          aria-hidden="true"
        />
        <div className="relative b-shell w-full">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
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
            <p className="b-mono text-[var(--ink-3)]">
              time of day <span ref={timeRef} className="text-[var(--ink)] tabular-nums">07:00</span>
              <span> / midnight cutoff</span>
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
