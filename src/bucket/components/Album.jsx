import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Pause, Play, Shuffle, Trash2 } from "lucide-react";
import { ALBUM_CREDITS, DREAMS } from "../data";
import ChapterHeader from "./ChapterHeader";
import useSequencer, { ROWS, STEPS } from "./useSequencer";
import { Draggable, gsap, useGSAP } from "../lib/gsap";
import Footage from "./Footage";
import { FOOTAGE } from "../footage";
import { follow, frameDelta } from "../lib/motion";

const dream = DREAMS.find((d) => d.id === "album");
const BPM = 100;
const PREVIEW_MS = 10000;

// Plays a 10-second preview of the loop once, as soon as the album comes into
// view. Browsers only allow sound after the visitor has clicked, tapped or
// pressed a key (scrolling doesn't count); if that hasn't happened yet, the
// preview quietly starts on their first interaction while the album is on screen.
function useAutoPreview(seq, inView) {
  const [previewing, setPreviewing] = useState(false);
  const [waitingForGesture, setWaitingForGesture] = useState(false);
  const done = useRef(false);
  const timer = useRef(0);
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const begin = useCallback(async () => {
    if (done.current) return true;
    const ok = await seq.start();
    if (!ok) return false;
    done.current = true;
    setWaitingForGesture(false);
    setPreviewing(true);
    timer.current = window.setTimeout(() => {
      setPreviewing(false);
      seq.stop();
    }, PREVIEW_MS);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq.start, seq.stop]);

  useEffect(() => {
    if (!inView || done.current) return undefined;
    let cancelled = false;
    begin().then((ok) => {
      if (!ok && !cancelled && !done.current) setWaitingForGesture(true);
    });
    return () => {
      cancelled = true;
    };
  }, [inView, begin]);

  // Blocked by the browser: the first tap/click/key anywhere starts the preview,
  // as long as the album is still on screen.
  useEffect(() => {
    if (!waitingForGesture) return undefined;
    const onGesture = () => {
      if (inViewRef.current) begin();
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [waitingForGesture, begin]);

  // Any manual Play/Stop ends the preview; after that the visitor is in charge.
  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    done.current = true;
    setPreviewing(false);
    setWaitingForGesture(false);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { previewing, cancel };
}

// A tiny scratch synth: short grains of band-passed noise whose pitch and
// volume follow how fast the record is being dragged. Created on the first
// press, which counts as the gesture browsers require before playing sound.
function useScratch() {
  const audio = useRef(null);
  const last = useRef(0);

  const ensure = () => {
    if (audio.current) return audio.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    audio.current = { ctx, noise };
    return audio.current;
  };

  const grain = (speed) => {
    const a = audio.current;
    const now = performance.now();
    if (!a || now - last.current < 35 || speed < 0.5) return;
    last.current = now;
    const { ctx, noise } = a;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    const band = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    src.buffer = noise;
    src.playbackRate.value = gsap.utils.clamp(0.4, 2.6, speed / 6);
    band.type = "bandpass";
    band.frequency.value = gsap.utils.clamp(300, 2400, speed * 90);
    band.Q.value = 2.5;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gsap.utils.clamp(0.04, 0.22, speed / 60), t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    src.connect(band).connect(gain).connect(ctx.destination);
    src.start(t, Math.random() * 0.8, 0.08);
  };

  useEffect(() => () => audio.current?.ctx.close(), []);

  return { ensure, grain };
}

// 33 1/3 rpm in radians per second: the speed the footage was filmed at.
const PLAY_SPEED = ((100 / 3) * Math.PI * 2) / 60;

// The record, filmed. The deck is on: its motor holds the platter at 33 rpm,
// and the footage plays at whatever speed the platter is turning (the film has
// real motion blur in it, so a stopped frame would look wrong). Grab the record
// and push it to spin it faster (and scratch); let go and the motor eases it
// back to speed.
function VinylDeck({ onUnsupported }) {
  const box = useRef(null);
  const handle = useRef(null);
  const scratch = useScratch();
  const platter = useRef({ omega: PLAY_SPEED, last: 0, push: 0 });

  useGSAP(
    () => {
      if (!window.matchMedia("(pointer: fine)").matches) return undefined;
      let previous = 0;
      let at = 0;
      const [drag] = Draggable.create(handle.current, {
        type: "rotation",
        onPress() {
          scratch.ensure()?.ctx.resume();
          previous = this.rotation;
          at = performance.now();
        },
        onDrag() {
          const now = performance.now();
          const dt = Math.max(0.008, (now - at) / 1000);
          const step = this.rotation - previous;
          scratch.grain(Math.abs(step));
          // The hand sets the platter's speed while it's held (forward only:
          // the footage can't run backwards).
          platter.current.push = Math.max(0, ((step * Math.PI) / 180) / dt);
          previous = this.rotation;
          at = now;
        },
        onRelease() {
          platter.current.omega = Math.max(platter.current.omega, platter.current.push);
          platter.current.push = 0;
        },
      });
      return () => drag.kill();
    },
    { scope: box }
  );

  const getRate = useCallback(() => {
    const s = platter.current;
    const dt = frameDelta(s, performance.now() / 1000);
    s.omega = s.push > 0 ? follow(s.omega, s.push, dt, 0.08) : follow(s.omega, PLAY_SPEED, dt, 0.6);
    return s.omega / PLAY_SPEED;
  }, []);

  return (
    <div ref={box} className="relative aspect-[5/4] w-full rounded-[22px] overflow-hidden bg-[#050506]">
      <Footage
        sources={FOOTAGE.vinyl.sources}
        poster={FOOTAGE.vinyl.poster}
        getRate={getRate}
        onUnsupported={onUnsupported}
      />
      <div
        ref={handle}
        className="absolute inset-0 [@media(pointer:fine)]:cursor-grab [@media(pointer:fine)]:active:cursor-grabbing"
        aria-hidden="true"
      />
      <p className="absolute bottom-3 inset-x-0 text-center b-mono text-[rgba(235,233,228,0.6)] hidden [@media(pointer:fine)]:block pointer-events-none">
        grab the record to push it
      </p>
    </div>
  );
}

function Record({ spinning }) {
  const platter = useRef(null);
  const scratch = useScratch();

  // Grab the record and spin it; let go and it coasts to a stop. The CSS spin
  // while the loop plays lives on the inner group, so the two add up.
  useGSAP(
    () => {
      // Mouse and trackpad only: on a phone the record fills the screen width,
      // and grabbing it would stop the page from scrolling.
      if (!window.matchMedia("(pointer: fine)").matches) return undefined;
      let previous = null;
      const [drag] = Draggable.create(platter.current, {
        type: "rotation",
        inertia: true,
        // A flick coasts a turn or two, like a real platter, not forever.
        throwResistance: 3000,
        onPress() {
          scratch.ensure()?.ctx.resume();
          previous = this.rotation;
        },
        onDrag() {
          scratch.grain(Math.abs(this.rotation - previous));
          previous = this.rotation;
        },
      });
      return () => drag.kill();
    },
    { scope: platter }
  );

  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <p className="absolute -bottom-8 inset-x-0 text-center b-mono text-[rgba(235,233,228,0.45)] hidden [@media(pointer:fine)]:block">
        grab the record to spin it
      </p>
      <svg
        ref={platter}
        viewBox="0 0 400 400"
        className="w-full h-full [@media(pointer:fine)]:cursor-grab [@media(pointer:fine)]:active:cursor-grabbing"
        aria-hidden="true"
      >
        <g
          className="b-record-spin"
          style={{ animationPlayState: spinning ? "running" : "paused", animationDuration: "1.8s" }}
        >
          <circle cx="200" cy="200" r="196" fill="#0b0b0b" />
          {Array.from({ length: 14 }, (_, i) => (
            <circle key={i} cx="200" cy="200" r={180 - i * 9} fill="none" stroke="#1f1f1f" strokeWidth="1" />
          ))}
          <path d="M200 10 A190 190 0 0 1 380 160" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
          <circle cx="200" cy="200" r="64" fill={dream.accent} />
          <text x="200" y="190" textAnchor="middle" fill="#ebe9e4" fontFamily="Fragment Mono, monospace" fontSize="11">
            MANAS JHA
          </text>
          <text x="200" y="208" textAnchor="middle" fill="#ebe9e4" fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="16">
            LP 01
          </text>
          <text x="200" y="226" textAnchor="middle" fill="rgba(235,233,228,0.7)" fontFamily="Fragment Mono, monospace" fontSize="9">
            side a / 33 rpm
          </text>
          <circle cx="200" cy="200" r="5" fill="#0b0b0b" />
        </g>
      </svg>
    </div>
  );
}

function Sequencer({ seq, preview }) {
  const { grid, playing, playhead, start, stop, toggle, clear, shuffle } = seq;
  const onPlayStop = () => {
    preview.cancel();
    if (playing) stop();
    else start();
  };
  return (
    <div className="rounded-[22px] border border-[rgba(235,233,228,0.14)] bg-[rgba(235,233,228,0.03)] p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="b-mono text-[rgba(235,233,228,0.6)]">record session / {BPM} bpm</p>
          <p className="text-lg font-semibold tracking-[-0.02em]">Make a loop. Every cell is a note.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPlayStop}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-[#111] bg-[#ebe9e4] hover:bg-white transition-colors"
          >
            {playing ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
            {playing ? "Stop" : "Play"}
          </button>
          <button
            type="button"
            onClick={shuffle}
            className="w-10 h-10 rounded-full border border-[rgba(235,233,228,0.3)] grid place-items-center hover:border-[#ebe9e4] transition-colors"
            aria-label="Randomize pattern"
          >
            <Shuffle size={16} aria-hidden />
          </button>
          <button
            type="button"
            onClick={clear}
            className="w-10 h-10 rounded-full border border-[rgba(235,233,228,0.3)] grid place-items-center hover:border-[#ebe9e4] transition-colors"
            aria-label="Clear pattern"
          >
            <Trash2 size={16} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid gap-[3px] md:gap-1.5" style={{ gridTemplateColumns: `2.6rem repeat(${STEPS}, minmax(0, 1fr))` }}>
        {ROWS.map((row, r) => (
          <div key={row.id} className="contents">
            <span className="b-mono self-center text-[rgba(235,233,228,0.55)] text-[10px] md:text-xs">{row.label}</span>
            {grid[r].map((on, s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggle(r, s)}
                aria-pressed={on}
                aria-label={`${row.label}, step ${s + 1}`}
                className={`b-step ${on ? "is-on" : ""} ${s === playhead ? "is-playhead" : ""} ${
                  s % 4 === 0 ? "ml-[2px]" : ""
                }`}
                style={{ "--album": dream.accent }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 min-h-[1.5rem]">
        <AnimatePresence mode="wait">
          {preview.previewing ? (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="b-mono text-[rgba(235,233,228,0.7)]">playing a 10-second preview</p>
              <div className="mt-2 h-[2px] bg-[rgba(235,233,228,0.15)] overflow-hidden rounded-full">
                <motion.div
                  className="h-full"
                  style={{ background: dream.accent, transformOrigin: "left" }}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: PREVIEW_MS / 1000, ease: "linear" }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.p key="idle" className="b-mono text-[rgba(235,233,228,0.45)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              press play to hear your loop
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Album() {
  const seq = useSequencer(BPM);
  const stageRef = useRef(null);
  const inView = useInView(stageRef, { amount: 0.5 });
  const preview = useAutoPreview(seq, inView);
  const [realistic, setRealistic] = useState(true);
  const onUnsupported = useCallback(() => setRealistic(false), []);

  return (
    <section id="album" className="relative bg-[var(--paper)] text-[#ebe9e4] pt-24 md:pt-32 pb-24 md:pb-32">
      <ChapterHeader dream={dream} tone="dark" />

      <div
        ref={stageRef}
        className={`b-shell mt-14 grid gap-10 items-center ${realistic ? "lg:grid-cols-[1.05fr_1fr]" : "lg:grid-cols-[0.8fr_1.2fr]"}`}
      >
        <motion.div
          initial={realistic ? { opacity: 0, y: 40 } : { opacity: 0, rotate: -20, x: -60 }}
          whileInView={realistic ? { opacity: 1, y: 0 } : { opacity: 1, rotate: 0, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className={`justify-self-center w-full ${realistic ? "" : "max-w-[420px]"}`}
        >
          {realistic ? (
            <VinylDeck onUnsupported={onUnsupported} />
          ) : (
            <Record spinning={seq.playing} />
          )}
        </motion.div>
        <Sequencer seq={seq} preview={preview} />
      </div>

      <div className="b-shell mt-16 md:mt-24 grid gap-10 md:grid-cols-2">
        <div>
          <p className="b-mono text-[rgba(235,233,228,0.6)] mb-4">liner notes / credits</p>
          <ul className="divide-y divide-[rgba(235,233,228,0.14)] border-y border-[rgba(235,233,228,0.14)]">
            {ALBUM_CREDITS.map((credit, i) => (
              <motion.li
                key={credit}
                className="flex items-baseline justify-between gap-4 py-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <span className="text-lg">{credit} by</span>
                <span className="b-serif italic text-2xl" style={{ color: i === ALBUM_CREDITS.length - 1 ? "#ebe9e4" : undefined }}>
                  Manas Jha
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="self-end">
          <motion.p
            className="b-serif italic text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.02em]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Every sound on it, from the first idea to the final master, made by one person.
          </motion.p>
          <p className="b-mono text-[rgba(235,233,228,0.6)] mt-6">tracklist: to be written</p>
        </div>
      </div>
    </section>
  );
}
