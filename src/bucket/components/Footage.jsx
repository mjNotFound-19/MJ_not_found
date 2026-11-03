import { useEffect, useRef, useState } from "react";

const TIERS = {
  uhd: { width: 3840, height: 2160, bitrate: 12e6 },
  hd: { width: 1920, height: 1080, bitrate: 6e6 },
  sd: { width: 1280, height: 720, bitrate: 3e6 },
};

// Which size to load: 4K only where the screen can show it (about 2200+
// device pixels wide), 1080p for ordinary laptops, 720p for phones and for
// anyone who has asked their browser to save data.
function pickTier() {
  const saveData = navigator.connection?.saveData;
  const px = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  if (saveData || px < 1100) return "sd";
  if (px < 2200) return "hd";
  return "uhd";
}

// AV1 is about half the size of H.264 at the same quality, but decoding it
// in software (no AV1 hardware) is heavy enough to stutter. Use it only when
// the browser says it'll be smooth and power efficient at this size.
async function pickSource(sources) {
  const tierName = pickTier();
  const { av1, h264 } = sources[tierName];
  try {
    const tier = TIERS[tierName];
    const info = await navigator.mediaCapabilities?.decodingInfo({
      type: "file",
      video: { contentType: 'video/mp4; codecs="av01.0.12M.08"', ...tier, framerate: 25 },
    });
    if (info?.supported && info.smooth && info.powerEfficient) return av1;
  } catch {
    // No Media Capabilities API: H.264 plays everywhere.
  }
  return h264;
}

// Real footage as a scene layer. It plays at its own speed, like film; a
// `getRate()` callback (read every frame) can speed it up or slow it to a stop
// from the scene's physics, so footage and 3D share the same sense of motion.
// Off screen it pauses, and with reduced motion it holds on its first frame.
export default function Footage({ sources, poster, getRate, onUnsupported, className = "", style }) {
  const ref = useRef(null);
  const rateRef = useRef(getRate);
  rateRef.current = getRate;
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let live = true;
    pickSource(sources).then((s) => live && setSrc(s));
    return () => {
      live = false;
    };
  }, [sources]);

  useEffect(() => {
    const video = ref.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let raf = 0;

    const tick = () => {
      raf = 0;
      if (!visible || reduce) return;
      const rate = rateRef.current ? rateRef.current() : 1;
      // Browsers can't play slower than 1/16 speed: below that, stop.
      if (rate < 0.07) {
        if (!video.paused) video.pause();
      } else {
        video.playbackRate = Math.min(4, rate);
        if (video.paused) video.play().catch(() => {});
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
        if (!visible) video.pause();
      },
      { rootMargin: "10% 0px" }
    );
    io.observe(video);
    const onError = () => onUnsupported?.();
    video.addEventListener("error", onError);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      video.removeEventListener("error", onError);
      video.pause();
    };
  }, [onUnsupported]);

  return (
    <video
      ref={ref}
      src={src ?? undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
      style={style}
    />
  );
}
