// Everything on the bucket-list page is driven from here.
// `status` is one of: "on the list" | "training" | "in progress" | "done".
// Add dated entries to `log` as things happen; they show up on the page.

export const DREAMS = [
  {
    id: "summits",
    number: "01",
    title: "The Three Summits",
    kicker: "Mountaineering",
    line: "Stand on the three highest points on Earth.",
    accent: "#2f6df6",
    status: "on the list",
    log: [],
  },
  {
    id: "nordschleife",
    number: "02",
    title: "Green Hell, GT3",
    kicker: "Motorsport",
    line: "Race a GT3 car around the Nürburgring Nordschleife.",
    accent: "#ff6a00",
    status: "on the list",
    log: [],
  },
  {
    id: "ironman",
    number: "03",
    title: "Ironman",
    kicker: "Endurance",
    line: "Swim, bike and run 226 km in a single day.",
    accent: "#e6202e",
    status: "on the list",
    log: [],
  },
  {
    id: "album",
    number: "04",
    title: "The Album",
    kicker: "Music",
    line: "Write, play, produce, mix and master a whole album. Every sound, by me.",
    accent: "#7c3aed",
    status: "on the list",
    log: [],
  },
];

// Heights in metres (standard published values).
export const PEAKS = [
  { name: "Everest", height: 8849, range: "Nepal / China" },
  { name: "K2", height: 8611, range: "Pakistan / China" },
  { name: "Kangchenjunga", height: 8586, range: "Nepal / India" },
];

// Altitude waypoints the climb passes on the way up Everest (south route).
export const CLIMB_MARKERS = [
  { at: 0, label: "Sea level", note: "100% of sea-level air pressure" },
  { at: 5364, label: "Everest Base Camp", note: "Roughly half the air of sea level" },
  { at: 8000, label: "The death zone", note: "Above 8,000 m the body can't acclimatise" },
  { at: 8849, label: "Summit", note: "About a third of sea-level air pressure" },
];

// Standard full-distance triathlon.
export const IRONMAN_LEGS = [
  { id: "swim", label: "Swim", km: 3.8 },
  { id: "bike", label: "Bike", km: 180.2 },
  { id: "run", label: "Run", km: 42.2 },
];
export const IRONMAN_CUTOFF_HOURS = 17;

export const ALBUM_CREDITS = [
  "Written",
  "Composed",
  "Performed",
  "Recorded",
  "Produced",
  "Mixed",
  "Mastered",
  "Artwork",
];
