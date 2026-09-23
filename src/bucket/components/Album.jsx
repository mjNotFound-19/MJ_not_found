import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Pause, Play, Shuffle, Trash2 } from "lucide-react";
import { ALBUM_CREDITS, DREAMS } from "../data";
import ChapterHeader from "./ChapterHeader";
import useSequencer, { ROWS, STEPS } from "./useSequencer";

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

function Record({ spinning }) {
  return (
    <div className="relative aspect-square w-full max-w-[420px]">
      <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
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

  return (
    <section id="album" className="relative bg-[#111] text-[#ebe9e4] pt-24 md:pt-32 pb-24 md:pb-32">
      <ChapterHeader dream={dream} tone="dark" />

      <div ref={stageRef} className="b-shell mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] items-center">
        <motion.div
          initial={{ opacity: 0, rotate: -20, x: -60 }}
          whileInView={{ opacity: 1, rotate: 0, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="justify-self-center w-full max-w-[420px]"
        >
          <Record spinning={seq.playing} />
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
          <p className="b-serif italic text-[clamp(2.2rem,5vw,4rem)] leading-[1] tracking-[-0.02em]">
            Every sound on it, from the first idea to the final master, made by one person.
          </p>
          <p className="b-mono text-[rgba(235,233,228,0.6)] mt-6">tracklist: to be written</p>
        </div>
      </div>
    </section>
  );
}
