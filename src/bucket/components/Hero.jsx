import { useRef } from "react";
import { Draggable, gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";

// Stickers carry each dream's headline number. They drift toward the cursor at
// different depths and can be picked up and thrown; they sit in the empty
// space right of the title (sized in vw, so that space exists at every width).
const STICKERS = [
  { text: "8,849 m", pos: "right-[18%] top-[24%]", rotate: -8, depth: 26, bg: "#2f6df6" },
  { text: "20.8 km of Green Hell", pos: "right-[4%] top-[35%]", rotate: 6, depth: 40, bg: "#ff6a00" },
  { text: "226 km in a day", pos: "right-[16%] top-[48%]", rotate: 5, depth: 34, bg: "#e6202e" },
  { text: "1 album, 1 person", pos: "right-[5%] top-[58%]", rotate: -6, depth: 22, bg: "#7c3aed" },
];

const INTRO =
  "Not a résumé. Four things I want to have done, each of which scares me a little. This page tracks them until they're crossed off.";

export default function Hero({ introDelay = 0 }) {
  const root = useRef(null);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      const stickers = gsap.utils.toArray("[data-sticker]");
      const drift = gsap.utils.toArray("[data-sticker-drift]");
      // GSAP owns each sticker's transform, so the tilt is set here, not in CSS.
      gsap.set(stickers, { rotation: (i, el) => Number(el.dataset.rotate) });

      // Throwable stickers. The outer element drifts with the cursor, the inner
      // one is dragged, so the two transforms never fight. Picking one up lifts
      // it slightly; thrown, it slides to a stop with friction inside the hero.
      const draggables = Draggable.create(stickers, {
        type: "x,y",
        bounds: root.current,
        inertia: true,
        edgeResistance: 0.85,
        throwResistance: 2500,
        zIndexBoost: true,
        onPress() {
          gsap.to(this.target, { scale: 1.04, boxShadow: "0 22px 40px rgba(0,0,0,0.55)", duration: 0.3, ease: "power2.out" });
        },
        onRelease() {
          gsap.to(this.target, { scale: 1, boxShadow: "0 10px 24px rgba(0,0,0,0.45)", duration: 0.6, ease: "power3.out" });
        },
      });

      if (reduce) return () => draggables.forEach((d) => d.kill());

      // A slow, even reveal: each line rises out of its own clip, then the rest
      // fades up. One easing curve throughout, no overshoot.
      const tl = gsap.timeline({ delay: introDelay, defaults: { ease: "power3.out" } });
      tl.from("[data-hero-kicker]", { autoAlpha: 0, duration: 1.2 })
        .from(
          "[data-hero-line]",
          { yPercent: 18, autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)", duration: 1.6, stagger: 0.18 },
          0.1
        )
        .from("[data-hero-intro]", { autoAlpha: 0, y: 14, duration: 1.4 }, 0.7)
        .from(drift.map((el) => el.firstElementChild), { autoAlpha: 0, y: 10, duration: 1.4, stagger: 0.15 }, 1.0)
        .from("[data-hero-cta]", { autoAlpha: 0, duration: 1.2 }, 1.3);

      // Cursor parallax: quickTo reuses one tween per axis instead of making a
      // new one on every pointermove.
      const movers = drift.map((el) => ({
        depth: Number(el.dataset.depth),
        x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" }),
      }));
      const onMove = (e) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => {
          m.x(nx * m.depth);
          m.y(ny * m.depth);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      return () => {
        window.removeEventListener("pointermove", onMove);
        draggables.forEach((d) => d.kill());
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative min-h-[100svh] flex flex-col justify-center pt-28 pb-16 overflow-hidden">
      <div className="b-hero-glow" aria-hidden="true" />
      {STICKERS.map((s) => (
        <span
          key={s.text}
          data-sticker-drift
          data-depth={s.depth}
          className={`absolute hidden md:block z-10 ${s.pos}`}
          aria-hidden="true"
        >
          <span
            data-sticker
            className="b-sticker cursor-grab active:cursor-grabbing select-none touch-none"
            data-rotate={s.rotate}
            style={{ background: s.bg }}
          >
            {s.text}
          </span>
        </span>
      ))}

      <div className="b-shell relative">
        <p data-hero-kicker className="b-mono text-[var(--ink-3)] mb-6">
          manas jha / things to do before i&apos;m done
        </p>

        <h1 className="b-hero-title" aria-label="Bucket List">
          <span data-hero-line className="block pb-[0.06em]" aria-hidden="true">
            Bucket
          </span>
          <span className="block pb-[0.06em]" aria-hidden="true">
            <span data-hero-line>List</span>
            <span className="b-hero-italic text-[0.42em] align-top ml-[0.15em] tracking-normal">(04)</span>
          </span>
        </h1>

        <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <p data-hero-intro className="text-[clamp(1.25rem,2.4vw,1.9rem)] leading-[1.25] tracking-[-0.02em] max-w-[34ch]">
            {INTRO}
          </p>
          <div data-hero-cta className="justify-self-start md:justify-self-end flex flex-col items-start md:items-end gap-3">
            <p className="b-mono text-[var(--ink-3)] hidden md:block">psst: the stickers are throwable</p>
            <a href="#overview" className="b-pill">
              scroll to see the list
              <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
