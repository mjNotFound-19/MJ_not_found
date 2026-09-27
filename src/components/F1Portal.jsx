import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLenis, scrollToId } from "../lib/scroll";

const CARD_ID = "project-flat-out-f1";
const EASE = [0.76, 0, 0.24, 1];

// Timeline (seconds after the zoom starts). The gantry and lights reproduce
// f1.h's own start-lights intro, so the portfolio hands straight into the site.
const ZOOM = 0.8;
const GANTRY_IN = 0.75;
const FIRST_LIGHT = 1.3;
const LIGHT_GAP = 0.3;
const LIGHTS_OUT = FIRST_LIGHT + 4 * LIGHT_GAP + 0.6;
const NAVIGATE = LIGHTS_OUT + 0.55;

// f1.h plays this intro once per session and remembers it under this key
// (same origin, so shared). Setting it means visitors don't see the lights twice.
const F1_INTRO_KEY = "f1h-lights";

function Takeover({ rect, href, onCancelled }) {
  const [lit, setLit] = useState(0);
  const [out, setOut] = useState(false);
  const gone = useRef(false);

  const go = useCallback(() => {
    if (gone.current) return;
    gone.current = true;
    try {
      sessionStorage.setItem(F1_INTRO_KEY, "1");
    } catch {
      // Storage unavailable: f1.h will just play its own intro.
    }
    window.location.assign(href);
  }, [href]);

  useEffect(() => {
    const timers = [];
    for (let i = 1; i <= 5; i++) {
      timers.push(window.setTimeout(() => setLit(i), (FIRST_LIGHT + (i - 1) * LIGHT_GAP) * 1000));
    }
    timers.push(window.setTimeout(() => setOut(true), LIGHTS_OUT * 1000));
    timers.push(window.setTimeout(go, NAVIGATE * 1000));
    // Like f1.h's intro: any click or key skips straight there.
    const skip = () => go();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [go]);

  // Back/forward cache: if the visitor returns, drop the overlay.
  useEffect(() => {
    const onShow = (e) => e.persisted && onCancelled();
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [onCancelled]);

  return (
    <motion.div
      className="f1h f1-takeover"
      aria-hidden="true"
      initial={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderRadius: 32,
        backgroundColor: "#0a0b0e",
      }}
      animate={{
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        borderRadius: 0,
        backgroundColor: "#07080a",
      }}
      transition={{ duration: ZOOM, ease: EASE }}
    >
      {/* The card's top bar rides along into the zoom, then clears the stage. */}
      <motion.div
        className="f1h-top f1-takeover-bar"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: ZOOM - 0.15 }}
      >
        <span className="f1h-logo f1h-mono">
          &lt;<b>f1</b>.h&gt;
        </span>
      </motion.div>

      <div className="f1-takeover-stage">
        <motion.div
          className="f1-gantry"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45, delay: GANTRY_IN, ease: "easeOut" }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={!out && lit > i ? "is-on" : ""}>
              <i />
              <i />
            </span>
          ))}
        </motion.div>
        <motion.p
          className="f1-lights-text"
          initial={{ opacity: 0, y: 12 }}
          animate={out ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
        >
          Lights out and away we go
        </motion.p>
      </div>
    </motion.div>
  );
}

// Links with `data-f1-portal` scroll to the Flat Out F1 card, zoom it to fill the
// screen, turn it into f1.h's start gantry, and hand off to /f1/ at lights out.
export default function F1Portal() {
  const [run, setRun] = useState(null);

  useEffect(() => {
    const onClick = (event) => {
      const link = event.target.closest?.("a[data-f1-portal]");
      if (!link || event.defaultPrevented) return;
      // New tab / window intents and reduced motion get a plain link.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const card = document.getElementById(CARD_ID);
      if (!card) return;
      event.preventDefault();

      const href = link.getAttribute("href");
      let started = false;
      const zoom = () => {
        if (started) return;
        started = true;
        getLenis()?.stop();
        // Grow from the card. If the scroll was interrupted and the card isn't on
        // screen, grow from a card-sized frame in the centre instead of flying in
        // from off-screen.
        let rect = card.getBoundingClientRect();
        const onScreen = rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
        if (!onScreen) {
          const w = Math.min(rect.width, window.innerWidth * 0.86);
          const h = Math.min(rect.height, window.innerHeight * 0.7);
          rect = { top: (window.innerHeight - h) / 2, left: (window.innerWidth - w) / 2, width: w, height: h };
        }
        setRun({ rect, href });
      };

      const r = card.getBoundingClientRect();
      const inView =
        r.top > -r.height * 0.2 && r.bottom < window.innerHeight + r.height * 0.2 && r.left > -40 && r.right < window.innerWidth + 40;
      if (inView) {
        zoom();
      } else {
        scrollToId(CARD_ID, { duration: 1.2, onComplete: () => window.setTimeout(zoom, 120) });
        // If the scroll gets interrupted, Lenis never reports completion.
        window.setTimeout(zoom, 1700);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const cancel = useCallback(() => {
    setRun(null);
    getLenis()?.start();
  }, []);

  return (
    <AnimatePresence>
      {run && <Takeover key="f1" rect={run.rect} href={run.href} onCancelled={cancel} />}
    </AnimatePresence>
  );
}
