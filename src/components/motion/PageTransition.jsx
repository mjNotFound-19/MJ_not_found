import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants } from "../../lib/motion";

const getRouteKey = () =>
  typeof window === "undefined"
    ? "ssr"
    : `${window.location.pathname}${window.location.hash || "#home"}`;

export default function PageTransition({ children }) {
  const [routeKey, setRouteKey] = useState(getRouteKey);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleChange = () => setRouteKey(getRouteKey());
    window.addEventListener("hashchange", handleChange);
    window.addEventListener("popstate", handleChange);
    return () => {
      window.removeEventListener("hashchange", handleChange);
      window.removeEventListener("popstate", handleChange);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
