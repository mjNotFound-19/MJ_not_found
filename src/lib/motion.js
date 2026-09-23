// WAAPI requires the x components of cubic-bezier values to stay within [0, 1].
// Slightly adjust the curve so we retain the snappy feel without invalid easing.
const CINEMATIC_EASE = [0.6, 0.01, 0.05, 0.95];
const FLOAT_EASE = [0.16, 1, 0.3, 1];

export const transitions = {
  base: {
    duration: 0.9,
    ease: CINEMATIC_EASE,
  },
  quick: {
    duration: 0.55,
    ease: FLOAT_EASE,
  },
};

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 60,
    scale: 0.995,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      ...transitions.base,
      duration: 1.05,
    },
  },
  exit: {
    opacity: 0,
    y: -40,
    scale: 0.995,
    filter: "blur(8px)",
    transition: {
      ...transitions.base,
      duration: 0.85,
    },
  },
};

export const fadeUp = (delay = 0, distance = 32) => ({
  hidden: { opacity: 0, y: distance },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ...transitions.base,
      delay,
    },
  },
});

export const floatIn = (delay = 0) => ({
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { ...transitions.base, delay },
  },
});

export const staggerChildren = (stagger = 0.08, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren,
      ...transitions.base,
    },
  },
});

export const revealLine = {
  hidden: { opacity: 0, y: "120%" },
  show: {
    opacity: 1,
    y: "0%",
    transition: {
      ...transitions.base,
      duration: 0.95,
    },
  },
};

export const parallaxVariants = (offset = 40) => ({
  hidden: { opacity: 0, y: offset },
  show: {
    opacity: 0.8,
    y: 0,
    transition: {
      duration: 1.1,
      ease: CINEMATIC_EASE,
    },
  },
});

export const magneticHover = {
  whileHover: {
    scale: 1.02,
    boxShadow: "0 20px 50px rgba(0, 174, 239, 0.25)",
    transition: transitions.quick,
  },
  whileTap: { scale: 0.98 },
};

export const hoverCard = {
  whileHover: {
    scale: 1.015,
    rotateX: -0.8,
    rotateY: 0.8,
    boxShadow: "0 25px 80px rgba(4, 6, 20, 0.55)",
    transition: {
      ...transitions.base,
      duration: 0.6,
    },
  },
};

export const imageReveal = {
  initial: {
    opacity: 0,
    scale: 1.03,
    filter: "brightness(0.72) saturate(0.85)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "brightness(1) saturate(1)",
    transition: {
      ...transitions.base,
      duration: 1,
    },
  },
};

export const glowPulse = {
  initial: { opacity: 0.35, scale: 0.85 },
  animate: {
    opacity: 0.6,
    scale: 1,
    transition: {
      duration: 3.6,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const sharedEasing = CINEMATIC_EASE;
