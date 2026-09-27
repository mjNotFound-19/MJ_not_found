import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { F1_SITE, F1_SNAPSHOT, loadF1 } from "../lib/f1Data";

const TABS = ["Race", "Strategy", "Drivers", "Teams", "Season", "Accuracy"];
const EASE = [0.76, 0, 0.24, 1];
const TYRE = { S: "#ef4444", M: "#facc15", H: "#f1f5f9", I: "#22c55e", W: "#3b82f6" };

const pct = (p) => (p >= 0.1 ? `${Math.round(p * 100)}%` : `${(p * 100).toFixed(1)}%`);
const MODE_LABEL = {
  pre_weekend: "Pre-weekend forecast",
  post_quali: "Post-qualifying forecast",
};

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// The circuit outline from f1.h's own track data, drawn on when it scrolls into
// view, with a car lapping it.
function TrackMap({ track }) {
  const d = useMemo(() => {
    const pts = track.points;
    return `M${pts.map((p) => `${p[0]} ${p[1]}`).join(" L")} Z`;
  }, [track]);
  const pad = 40;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${track.w + pad * 2} ${track.h + pad * 2}`}
      className="f1h-track"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke="#1f232c" strokeWidth="34" strokeLinejoin="round" />
      <motion.path
        d={d}
        fill="none"
        stroke="#dc2626"
        strokeWidth="6"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: EASE }}
      />
      <circle r="13" fill="#f4f5f7" stroke="#dc2626" strokeWidth="5">
        <animateMotion dur="7s" repeatCount="indefinite" path={d} />
      </circle>
    </svg>
  );
}

// The Flat Out F1 project, presented as a live miniature of f1.h itself.
export default function F1ProjectCard({ project, index }) {
  const [data, setData] = useState(F1_SNAPSHOT);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let alive = true;
    loadF1().then((d) => {
      if (!alive) return;
      setData(d);
      setLive(d !== F1_SNAPSHOT);
    });
    return () => {
      alive = false;
    };
  }, []);

  const maxWin = Math.max(...data.top.map((t) => t.win));

  return (
    <motion.section
      id={`project-${project.id}`}
      className="f1h f1h-card"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, delay: index * 0.05 }}
    >
      <div className="f1h-glow" aria-hidden="true" />

      <header className="f1h-top">
        <span className="f1h-logo f1h-mono" aria-label="f1.h">
          &lt;<b>f1</b>.h&gt;
        </span>
        <nav className="f1h-tabs" aria-hidden="true">
          {TABS.map((t) => (
            <span key={t} className={t === "Race" ? "is-active" : ""}>
              {t}
            </span>
          ))}
        </nav>
        <span className="f1h-live f1h-mono">
          <i aria-hidden="true" />
          {live ? "live forecast" : "latest forecast"}
        </span>
      </header>

      <div className="f1h-body">
        <div className="f1h-main">
          <p className="f1h-kicker">
            Round {data.round} · {formatDate(data.date)}
          </p>
          <h3 className="f1h-event">{data.event}</h3>
          <p className="f1h-sub f1h-mono">
            {data.sims.toLocaleString("en-US")} races simulated · {MODE_LABEL[data.mode] ?? "Forecast"}
          </p>

          <ol className="f1h-odds" aria-label="Chance to win">
            {data.top.map((t, i) => (
              <li key={t.code}>
                <span className="f1h-code" style={{ "--team": t.color }}>
                  {t.code}
                </span>
                <span className="f1h-bar">
                  <motion.span
                    style={{ background: t.color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: t.win / maxWin }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: EASE }}
                  />
                </span>
                <span className="f1h-pct f1h-mono">{pct(t.win)}</span>
                <span className="f1h-strat" aria-label={`Likely strategy ${t.strategy}`}>
                  {t.strategy.split("-").map((s, k) => (
                    <i key={k} style={{ "--tyre": TYRE[s] ?? "#9aa3b0" }}>
                      {s}
                    </i>
                  ))}
                </span>
              </li>
            ))}
          </ol>

          <div className="f1h-actions">
            <a href={F1_SITE} data-f1-portal className="f1h-btn">
              Open f1.h
              <ArrowUpRight size={16} aria-hidden />
            </a>
            {project.repo && (
              <a href={project.repo} target="_blank" rel="noreferrer" className="f1h-ghost">
                <Github size={15} aria-hidden />
                Source
              </a>
            )}
          </div>
        </div>

        <div className="f1h-side">
          <TrackMap track={data.track} />
          <p className="f1h-circuit f1h-mono">{data.location}</p>
          <dl className="f1h-stats">
            <div>
              <dt>Safety car</dt>
              <dd>{pct(data.pSC)}</dd>
            </div>
            <div>
              <dt>2+ stops</dt>
              <dd>{pct(data.twoPlus)}</dd>
            </div>
            <div>
              <dt>Laps</dt>
              <dd>{data.laps}</dd>
            </div>
            <div>
              <dt>Pit loss</dt>
              <dd>{data.pitLoss.toFixed(1)}s</dd>
            </div>
          </dl>
        </div>
      </div>

      <footer className="f1h-foot">
        <span className="f1h-mono f1h-proj">
          {String(index + 1).padStart(2, "0")} / {project.title}
        </span>
        <span className="f1h-desc">{project.summary}</span>
      </footer>
    </motion.section>
  );
}
