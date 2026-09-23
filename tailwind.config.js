/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        primary: "#00AEEF",
        secondary: "#0a0e1c",
        midnight: "#05060f",
        textLight: "#F4F4F4",
        accent: "#6C63FF",
      },
      boxShadow: {
        glow: "0 0 28px rgba(0,174,239,0.45)",
        glowSm: "0 0 16px rgba(0,174,239,0.35)",
        lux: "0 25px 80px rgba(5,6,15,0.65)",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.6,0.01,0.05,0.95)",
      },
      keyframes: {
        "ambient-drift": {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(10%, -6%, 0) scale(1.08)" },
          "100%": { transform: "translate3d(0,0,0) scale(1)" },
        },
        "orb-pulse": {
          "0%": { opacity: 0.35, transform: "scale(0.9)" },
          "50%": { opacity: 0.65, transform: "scale(1)" },
          "100%": { opacity: 0.35, transform: "scale(0.9)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "drift-slow": "ambient-drift 18s ease-in-out infinite",
        "orb-pulse": "orb-pulse 14s ease-in-out infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
    },
  },
  plugins: [],
};
