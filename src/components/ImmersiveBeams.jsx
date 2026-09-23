const BEAMS = [
  { left: "12%", width: "2px", duration: "14s", delay: "0s", opacity: 0.35 },
  { left: "38%", width: "3px", duration: "18s", delay: "4s", opacity: 0.25 },
  { left: "64%", width: "2px", duration: "16s", delay: "2s", opacity: 0.3 },
  { left: "82%", width: "1px", duration: "12s", delay: "6s", opacity: 0.4 },
];

export default function ImmersiveBeams() {
  return (
    <div className="immersive-beams" aria-hidden="true">
      {BEAMS.map((beam, index) => (
        <span
          key={beam.left + index}
          style={{
            left: beam.left,
            width: beam.width,
            animationDuration: beam.duration,
            animationDelay: beam.delay,
            opacity: beam.opacity,
          }}
        />
      ))}
    </div>
  );
}
