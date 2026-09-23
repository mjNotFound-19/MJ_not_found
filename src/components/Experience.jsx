import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EXPERIENCE } from "../config/content";
import { sharedEasing } from "../lib/motion";
import { useLanguage } from "../context/LanguageContext";

const PREVIEW_W = 220;

// Index-style list: one row per role. Hovering shows a preview card that rides in
// a reserved lane on the right (text never extends into it) and tracks the cursor
// vertically; clicking a row expands its details.
export default function Experience() {
  const [openIndex, setOpenIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState(null);
  const previewRef = useRef(null);
  const listRef = useRef(null);

  // The preview eases toward the cursor on its own rAF loop, only while hovering.
  useEffect(() => {
    const preview = previewRef.current;
    const list = listRef.current;
    const canPreview = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    if (!preview || !list || !canPreview.matches) return undefined;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let rafId = 0;
    let running = false;

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.16;
      pos.y += (target.y - pos.y) * 0.16;
      preview.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
        rafId = requestAnimationFrame(loop);
      } else {
        running = false;
      }
    };
    const laneTarget = (event) => {
      const rect = list.getBoundingClientRect();
      // Lane sits just left of the +/- toggles; the card is centred on the cursor's
      // height but clamped so it never leaves the list.
      target.x = rect.right - PREVIEW_W - 80;
      target.y = Math.min(Math.max(event.clientY - 48, rect.top), rect.bottom - 96);
    };
    const onMove = (event) => {
      laneTarget(event);
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    };
    const onEnter = (event) => {
      // Start at the cursor so the card doesn't fly in from the corner.
      laneTarget(event);
      pos.x = target.x;
      pos.y = target.y;
    };

    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerenter", onEnter);
    return () => {
      cancelAnimationFrame(rafId);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  const hovered = hoverIndex !== null ? EXPERIENCE[hoverIndex] : null;

  return (
    <div className="relative">
      <ul ref={listRef} className="exp-index" onPointerLeave={() => setHoverIndex(null)}>
        {EXPERIENCE.map((job, index) => (
          <ExperienceRow
            key={`${job.role}-${job.period}`}
            job={job}
            index={index}
            open={openIndex === index}
            onToggle={() => setOpenIndex((prev) => (prev === index ? null : index))}
            onHover={() => setHoverIndex(index)}
          />
        ))}
      </ul>

      <div ref={previewRef} className="exp-preview" aria-hidden="true">
        <AnimatePresence mode="wait">
          {hovered?.highlight && (
            <motion.div
              key={hoverIndex}
              className="exp-preview-card"
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 3 }}
              transition={{ duration: 0.3, ease: sharedEasing }}
            >
              <p className="font-mono text-[10px] text-white/50">{hovered.period}</p>
              <p className="text-2xl font-bold text-white mt-1 leading-tight">{hovered.highlight.value}</p>
              <p className="text-xs text-primary mt-1">{hovered.highlight.label}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExperienceRow({ job, index, open, onToggle, onHover }) {
  const { t } = useLanguage();
  const translated = t.experience?.[job.role] ?? {};
  const current = job.period.includes("Present");
  const [org, place] = (translated.org ?? job.org).split(" - ");
  const panelId = `exp-panel-${index}`;

  return (
    <motion.li
      className={`exp-row ${open ? "is-open" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay: index * 0.04, ease: sharedEasing }}
      onPointerEnter={onHover}
    >
      <button
        type="button"
        className="exp-row-head"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="exp-period">
          {current && <span className="status-dot" aria-hidden />}
          {translated.period ?? job.period}
        </span>
        <span className="exp-role">
          <span className="exp-role-title">{translated.role ?? job.role}</span>
          <span className="exp-org">
            {org}
            {place && <span className="text-white/35"> / {place}</span>}
          </span>
        </span>
        <span className="exp-toggle" aria-hidden>
          <Plus size={18} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: sharedEasing }}
          >
            <ul className="exp-bullets">
              {(translated.bullets ?? job.bullets).map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="bullet-dot" />
                  <span className="flex-1">{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
