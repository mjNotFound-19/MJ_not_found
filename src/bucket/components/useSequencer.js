import { useCallback, useEffect, useRef, useState } from "react";

// Pentatonic rows (high to low) so any pattern sounds musical, plus a kick.
export const ROWS = [
  { id: "c5", label: "C5", freq: 523.25 },
  { id: "a4", label: "A4", freq: 440.0 },
  { id: "g4", label: "G4", freq: 392.0 },
  { id: "e4", label: "E4", freq: 329.63 },
  { id: "d4", label: "D4", freq: 293.66 },
  { id: "c4", label: "C4", freq: 261.63 },
  { id: "kick", label: "Kick", freq: null },
];
export const STEPS = 16;

// A gentle starting motif.
const DEFAULT = {
  c5: [10],
  a4: [2, 8, 14],
  g4: [4, 12],
  e4: [0, 6],
  d4: [11],
  c4: [3, 15],
  kick: [0, 4, 8, 12],
};

const emptyGrid = () => ROWS.map(() => Array(STEPS).fill(false));
const defaultGrid = () =>
  ROWS.map((row) => {
    const on = DEFAULT[row.id] ?? [];
    return Array.from({ length: STEPS }, (_, i) => on.includes(i));
  });

// Lookahead scheduler (the standard Web Audio pattern): a timer wakes every
// 25 ms and schedules any notes due in the next 120 ms on the audio clock, so
// timing stays tight even if the main thread is busy animating.
export default function useSequencer(bpm = 100) {
  const [grid, setGrid] = useState(defaultGrid);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(-1);

  const gridRef = useRef(grid);
  const ctxRef = useRef(null);
  const busRef = useRef(null);
  const timerRef = useRef(0);
  const rafRef = useRef(0);
  const nextTimeRef = useRef(0);
  const stepRef = useRef(0);
  const queueRef = useRef([]);
  const playingRef = useRef(false);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const ensureContext = () => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.32;
    // A soft feedback delay gives the notes some space.
    const delay = ctx.createDelay();
    delay.delayTime.value = (60 / bpm) * 0.75;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.22;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(master);
    master.connect(ctx.destination);
    busRef.current = { master, delay };
    ctxRef.current = ctx;
    return ctx;
  };

  const playNote = (ctx, freq, time) => {
    const { master, delay } = busRef.current;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.5, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
    osc.connect(filter).connect(gain);
    gain.connect(master);
    gain.connect(delay);
    osc.start(time);
    osc.stop(time + 0.5);
  };

  const playKick = (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.14);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gain).connect(busRef.current.master);
    osc.start(time);
    osc.stop(time + 0.32);
  };

  const scheduler = useCallback(() => {
    const ctx = ctxRef.current;
    const stepDur = 60 / bpm / 4; // sixteenth notes
    while (nextTimeRef.current < ctx.currentTime + 0.12) {
      const step = stepRef.current;
      const time = nextTimeRef.current;
      ROWS.forEach((row, r) => {
        if (!gridRef.current[r][step]) return;
        if (row.freq) playNote(ctx, row.freq, time);
        else playKick(ctx, time);
      });
      queueRef.current.push({ step, time });
      nextTimeRef.current += stepDur;
      stepRef.current = (step + 1) % STEPS;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  // The playhead follows the audio clock, not the timer, so it never drifts.
  const drawPlayhead = useCallback(() => {
    const ctx = ctxRef.current;
    const queue = queueRef.current;
    let current = null;
    while (queue.length && queue[0].time <= ctx.currentTime) current = queue.shift();
    if (current) setPlayhead(current.step);
    rafRef.current = requestAnimationFrame(drawPlayhead);
  }, []);

  const stop = useCallback(() => {
    playingRef.current = false;
    window.clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    queueRef.current = [];
    setPlaying(false);
    setPlayhead(-1);
  }, []);

  // Resolves true once sound is actually running. Browsers keep audio suspended
  // until the visitor has clicked/tapped/pressed a key, so resume() may never
  // settle; the timeout keeps callers from hanging and they get `false` instead.
  const start = useCallback(async () => {
    if (playingRef.current) return true;
    const ctx = ensureContext();
    if (!ctx) return false;
    if (ctx.state !== "running") {
      try {
        await Promise.race([ctx.resume(), new Promise((r) => setTimeout(r, 300))]);
      } catch {
        return false;
      }
    }
    if (ctx.state !== "running" || playingRef.current) return ctx.state === "running";
    playingRef.current = true;
    stepRef.current = 0;
    nextTimeRef.current = ctx.currentTime + 0.06;
    timerRef.current = window.setInterval(scheduler, 25);
    rafRef.current = requestAnimationFrame(drawPlayhead);
    setPlaying(true);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduler, drawPlayhead]);

  const toggle = (r, s) =>
    setGrid((prev) => prev.map((row, ri) => (ri === r ? row.map((on, si) => (si === s ? !on : on)) : row)));

  const clear = () => setGrid(emptyGrid());
  const shuffle = () =>
    setGrid(
      ROWS.map((row) =>
        Array.from({ length: STEPS }, (_, i) =>
          row.freq ? Math.random() < 0.13 : i % 4 === 0 || Math.random() < 0.05
        )
      )
    );

  // Stop sound and release the audio device when leaving the page.
  useEffect(
    () => () => {
      window.clearInterval(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      ctxRef.current?.close();
    },
    []
  );

  return { grid, playing, playhead, start, stop, toggle, clear, shuffle };
}
