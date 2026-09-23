// Small looping illustrations for the overview cards. Pure SVG + CSS/SMIL, so
// they cost almost nothing and keep running without JS on the main thread.

export function SummitsArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="sky-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9d6f3" />
          <stop offset="1" stopColor="#eef1f7" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky-a)" />
      <circle cx="310" cy="80" r="26" fill="#fff7d6">
        <animate attributeName="cy" values="86;74;86" dur="6s" repeatCount="indefinite" />
      </circle>
      <path d="M-10 300 L90 150 L150 210 L230 90 L300 180 L350 140 L420 300 Z" fill="#9fb3dd" />
      <path d="M-10 300 L60 200 L130 250 L200 130 L260 200 L330 170 L420 300 Z" fill="#2f6df6" />
      <path d="M200 130 L222 162 L210 158 L200 170 L190 157 L178 160 Z" fill="#fff" />
      <line x1="200" y1="130" x2="200" y2="100" stroke="#111" strokeWidth="2" />
      <path d="M200 100 L224 106 L200 114 Z" fill="#111">
        <animate
          attributeName="d"
          values="M200 100 L224 106 L200 114 Z;M200 100 L222 110 L200 114 Z;M200 100 L224 106 L200 114 Z"
          dur="1.4s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function TrackArt() {
  const track =
    "M60 210 C40 150 90 120 130 140 S190 90 230 70 S330 60 340 120 S300 190 260 200 S200 250 150 240 S80 260 60 210 Z";
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="400" height="300" fill="#151515" />
      <path d={track} fill="none" stroke="#2a2a2a" strokeWidth="18" strokeLinejoin="round" />
      <path d={track} fill="none" stroke="#ff6a00" strokeWidth="2" strokeDasharray="6 8">
        <animate attributeName="stroke-dashoffset" values="0;-140" dur="3s" repeatCount="indefinite" />
      </path>
      <circle r="7" fill="#ebe9e4">
        <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path={track} />
      </circle>
      {/* Bottom-right: the card's number badge sits top-left. */}
      <text x="376" y="280" textAnchor="end" fill="#ebe9e4" fontFamily="Fragment Mono, monospace" fontSize="12">
        20.832 km
      </text>
    </svg>
  );
}

export function TriathlonArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="400" height="300" fill="#f3e3df" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d="M-40 0 Q-20 -10 0 0 T40 0 T80 0 T120 0 T160 0 T200 0 T240 0 T280 0 T320 0 T360 0 T400 0 T440 0"
          transform={`translate(0 ${70 + i * 16})`}
          fill="none"
          stroke="#e6202e"
          strokeOpacity={0.35 + i * 0.25}
          strokeWidth="3"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0 ${70 + i * 16};-40 ${70 + i * 16}`}
            dur={`${1.6 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
      <g transform="translate(200 190)">
        {[-50, 50].map((cx) => (
          <g key={cx} transform={`translate(${cx} 0)`}>
            <circle r="30" fill="none" stroke="#111" strokeWidth="3" />
            <g>
              <line x1="-30" y1="0" x2="30" y2="0" stroke="#111" strokeWidth="1.5" />
              <line x1="0" y1="-30" x2="0" y2="30" stroke="#111" strokeWidth="1.5" />
              <animateTransform attributeName="transform" type="rotate" values="0;360" dur="1.2s" repeatCount="indefinite" />
            </g>
          </g>
        ))}
        <path d="M-50 0 L-10 -40 L30 -40 L50 0 M-10 -40 L0 0 L-50 0" fill="none" stroke="#e6202e" strokeWidth="4" strokeLinejoin="round" />
      </g>
      <text x="376" y="280" textAnchor="end" fill="#111" fontFamily="Fragment Mono, monospace" fontSize="12">
        swim / bike / run
      </text>
    </svg>
  );
}

export function RecordArt() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <rect width="400" height="300" fill="#111" />
      <g transform="translate(150 150)">
        <g className="b-record-spin">
          <circle r="110" fill="#1d1d1d" />
          {[95, 80, 65, 50].map((r) => (
            <circle key={r} r={r} fill="none" stroke="#2c2c2c" strokeWidth="1" />
          ))}
          <circle r="34" fill="#7c3aed" />
          <rect x="-2" y="-34" width="4" height="14" fill="#ebe9e4" />
          <circle r="4" fill="#111" />
        </g>
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={300 + i * 16} y="120" width="10" height="60" rx="3" fill="#7c3aed" opacity={0.5 + i * 0.1}>
          <animate
            attributeName="height"
            values={`${20 + i * 8};${70 - i * 6};${30 + i * 5};${20 + i * 8}`}
            dur={`${0.9 + i * 0.15}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values={`${190 - (20 + i * 8)};${190 - (70 - i * 6)};${190 - (30 + i * 5)};${190 - (20 + i * 8)}`}
            dur={`${0.9 + i * 0.15}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
    </svg>
  );
}

export const MINI_ART = {
  summits: SummitsArt,
  nordschleife: TrackArt,
  ironman: TriathlonArt,
  album: RecordArt,
};
