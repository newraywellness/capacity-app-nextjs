// ============ CYCLE ATMOSPHERE ============
// Today is open nature. Nourish is a kitchen garden. Bloom is a conservatory.
// Cycle is a beautifully bound journal — the quietest surface in the app.
//
// Deliberately NOT: medical, fertility, period-tracker, or mystical. No moons,
// no crystals, no celestial iconography. The circles suggest lunar phase only
// as abstract geometry, the way a magazine cover might.
//
// Everything here is decorative and inert. Readability first, functionality
// second, atmosphere last — nothing in this file may reduce contrast on the
// calendar or the tracking chips.

// ── TWILIGHT ────────────────────────────────────────────────────────────────
// cream → warm mauve → deep plum, held at an opacity where it reads as paper
// tone rather than as a gradient.
const CYCLE_BG = (phase) => {
  const base = "linear-gradient(180deg,#FDFAF8 0%,#FAF3F2 26%,#F3E9EE 58%,#EADFE9 82%,#E3D6E4 100%)"
  return base
}

// ── PHASE TINT ──────────────────────────────────────────────────────────────
// Softly tints portions of the page rather than replacing the palette. These
// are wash colours, not brand colours — they sit under everything.
const PHASE_AIR = {
  menstrual:  { tint: "rgba(168,85,107,0.10)",  glow: "rgba(168,85,107,0.16)",  ring: "rgba(168,85,107,0.13)" },
  follicular: { tint: "rgba(138,166,138,0.10)", glow: "rgba(138,166,138,0.16)", ring: "rgba(138,166,138,0.13)" },
  ovulation:  { tint: "rgba(216,192,150,0.12)", glow: "rgba(224,203,160,0.18)", ring: "rgba(210,186,146,0.14)" },
  luteal:     { tint: "rgba(122,146,180,0.10)", glow: "rgba(122,146,180,0.16)", ring: "rgba(122,146,180,0.13)" },
}
const airFor = (phase) => PHASE_AIR[phase] || PHASE_AIR.luteal

// Large overlapping discs, mostly off-canvas. Abstract geometry — the overlap
// happens to read as waxing and waning, but nothing is drawn as a moon.
const DISCS = [
  { x: "-34%", y: -120, size: 300, o: 0.55 },
  { x: "52%",  y: -180, size: 380, o: 0.42 },
  { x: "-12%", y: 420,  size: 260, o: 0.34 },
  { x: "66%",  y: 620,  size: 330, o: 0.30 },
  { x: "18%",  y: 980,  size: 290, o: 0.26 },
]

export function CycleAir({ phase }) {
  const A = airFor(phase)

  // A single stem, drawn thin. Used at two corners at low opacity — enough to
  // soften an edge, not enough to be an illustration.
  const Stem = ({ flip }) => (
    <svg width="96" height="150" viewBox="0 0 96 150" style={{ display: "block", transform: flip ? "scaleX(-1)" : "none" }}>
      <path d="M6 148 C 22 112, 34 78, 44 40 C 48 26, 50 14, 50 4"
        stroke="rgba(120,96,120,0.30)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M40 58 C 56 50, 68 34, 70 20 C 54 24, 42 40, 40 58 Z"
        stroke="rgba(120,96,120,0.26)" strokeWidth="0.9" fill="none" strokeLinejoin="round" />
      <path d="M31 92 C 15 86, 5 70, 4 56 C 20 60, 30 76, 31 92 Z"
        stroke="rgba(120,96,120,0.22)" strokeWidth="0.9" fill="none" strokeLinejoin="round" />
      <path d="M47 30 C 60 26, 70 16, 73 6" stroke="rgba(120,96,120,0.18)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
    </svg>
  )

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>

      {/* phase wash — top and bottom only, so the middle of the page stays clean
          exactly where the calendar and chips live */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 380,
        background: `linear-gradient(180deg, ${A.tint}, rgba(0,0,0,0) 88%)`,
        transition: "background 1.2s ease" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 300,
        background: `linear-gradient(0deg, ${A.tint}, rgba(0,0,0,0) 90%)`,
        transition: "background 1.2s ease" }} />

      {/* one soft bloom of phase colour, high and off-centre */}
      <div style={{ position: "absolute", top: -90, right: -70, width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${A.glow} 0%, rgba(0,0,0,0) 68%)`,
        transition: "background 1.2s ease" }} />

      {/* abstract discs — outlines only, heavily faded, overlapping off-screen */}
      {DISCS.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: d.size, height: d.size,
          borderRadius: "50%", border: `1px solid ${A.ring}`, opacity: d.o,
          background: i % 2 === 0 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.10)",
          transition: "border-color 1.2s ease" }} />
      ))}

      {/* botanical frame — two corners, nothing else */}
      <div style={{ position: "absolute", top: 18, left: -14, opacity: 0.5 }}><Stem /></div>
      <div style={{ position: "absolute", bottom: 96, right: -18, opacity: 0.4 }}><Stem flip /></div>
    </div>
  )
}

export { CYCLE_BG, airFor }
