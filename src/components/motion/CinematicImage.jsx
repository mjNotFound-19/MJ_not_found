import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { imageReveal, transitions } from "../../lib/motion";

export default function CinematicImage({
  src,
  alt,
  className = "",
  overlay = true,
  priority = false,
}) {
  const imageRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = imageRef.current;
    if (img?.complete) {
      setIsLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden rounded-[28px] ${className}`}>
      {overlay && (
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.2, ease: transitions.base.ease }}
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/70 pointer-events-none"
        />
      )}
      <motion.img
        ref={imageRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className="w-full h-full object-cover will-change-transform"
        initial="initial"
        animate={isLoaded ? "animate" : "initial"}
        variants={imageReveal}
      />
      <motion.div
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.1, ease: transitions.base.ease }}
        className="absolute inset-0 bg-white/10 pointer-events-none mix-blend-screen"
      />
    </div>
  );
}
