import { useState } from "react";
import { MotionConfig } from "framer-motion";
import useSmoothScroll from "../hooks/useSmoothScroll";
import useMediaQuery from "../hooks/useMediaQuery";
import EffectBoundary from "../components/EffectBoundary";
import TopBar from "./components/TopBar";
import Hero from "./components/Hero";
import Overview from "./components/Overview";
import Summits from "./components/Summits";
import Nordschleife from "./components/Nordschleife";
import Ironman from "./components/Ironman";
import Album from "./components/Album";
import Outro from "./components/Outro";
import { ArriveFromPortfolio, LeaveToPortfolio } from "./components/PageTransitions";
import { readArrival, useTransitionLinks } from "../lib/pageTransition";

// How long the hero waits when arriving via the transition, so its entrance
// plays as the cover lifts rather than hidden underneath it.
const ARRIVAL_HERO_DELAY = 0.7;

export default function BucketApp() {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  useSmoothScroll(!reduceMotion);
  useTransitionLinks();
  const [arrived] = useState(() => readArrival("bucket"));

  return (
    <MotionConfig reducedMotion="user">
      <div className="b-grain" aria-hidden="true" />
      <ArriveFromPortfolio active={arrived} />
      <LeaveToPortfolio />
      <TopBar />
      <main>
        <Hero introDelay={arrived ? ARRIVAL_HERO_DELAY : 0} />
        <Overview />
        <EffectBoundary>
          <Summits />
        </EffectBoundary>
        <EffectBoundary>
          <Nordschleife />
        </EffectBoundary>
        <EffectBoundary>
          <Ironman />
        </EffectBoundary>
        <EffectBoundary>
          <Album />
        </EffectBoundary>
        <Outro />
      </main>
    </MotionConfig>
  );
}
