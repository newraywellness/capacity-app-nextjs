// ============ NOURISH ATMOSPHERE ============
// Today is open nature. Nourish is a kitchen garden — deliberately lighter,
// lower and emptier. Same engine, different world: this consumes the identical
// ENV mode, capacity tint and seasonal palette the meadow does, and shares no
// artwork with it.
//
//   Today's meadow : 520px tall · 20 stems · 118–308px · opacity 0.46–0.55
//   Nourish garden : 300px tall · 11 stems ·  68–152px · opacity 0.24–0.38
//
// Same three rules: motion felt not watched, positions deterministic, UI is hero.

import { seasonPalette } from './atmosphere'

// ── BACKGROUND ──────────────────────────────────────────────────────────────
// Warm cream easing into an almost-white peach. Lighter than Today at every hour.
const NOURISH_BG = (mode) => ({
  morning:   "linear-gradient(180deg,#FFFDFA 0%,#FFF8F1 36%,#FDF1E6 70%,#FBEADC 100%)",
  afternoon: "linear-gradient(180deg,#FFFCF6 0%,#FEF7ED 34%,#FCF0E2 68%,#F9E8D7 100%)",
  evening:   "linear-gradient(180deg,#FCF6EF 0%,#F8ECE2 36%,#F2E3D8 70%,#EBDAD0 100%)",
  night:     "linear-gradient(180deg,#242030 0%,#2C2639 36%,#352E42 70%,#3D354A 100%)",
}[mode] || "linear-gradient(180deg,#FFFDFA 0%,#FFF8F1 36%,#FDF1E6 70%,#FBEADC 100%)")

// ── PALETTE ─────────────────────────────────────────────────────────────────
const H0 = {
  rosemary: "#6E8F63", basil: "#7FA06B", mint: "#8FBFA0", thyme: "#94B47C", sage: "#A6BBA2",
  stem: "#7B9A6A",
  orange: "#E9A85F", orangeRind: "#F3C892", orangeCore: "#F8DDBA",
  lemon: "#E6C863", lemonRind: "#F3E3A6", lemonCore: "#F9F0CE",
  blossom: "#FFF9F0", blossomCore: "#E0A253", seed: "#C7B392",
  bee: "#E0A253", beeDark: "#6B4E2E",
}
const _hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mixc = (a, b, t) => "#" + [0, 1, 2].map((i) => Math.round(_hx(a)[i] + (_hx(b)[i] - _hx(a)[i]) * t).toString(16).padStart(2, "0")).join("")

// Seasonal dials, in herb terms. Same 12-day blending as Today via seasonPalette.
const HERB_SEASON = {
  spring: { tone: "#8FB574", blossom: 1.00, seed: 0.00, foliage: 0.82, citrusLeaf: 0.80 },
  summer: { tone: "#7BA85F", blossom: 0.70, seed: 0.00, foliage: 1.00, citrusLeaf: 1.00 },
  autumn: { tone: "#A29558", blossom: 0.28, seed: 1.00, foliage: 0.88, citrusLeaf: 0.72 },
  winter: { tone: "#93A199", blossom: 0.10, seed: 0.30, foliage: 0.58, citrusLeaf: 0.48 },
}
const herbSeason = () => {
  const S = seasonPalette(new Date())
  const A = HERB_SEASON[S.from], B = HERB_SEASON[S.to], w = S.w
  return {
    tone: mixc(A.tone, B.tone, w),
    blossom: A.blossom + (B.blossom - A.blossom) * w,
    seed: A.seed + (B.seed - A.seed) * w,
    foliage: A.foliage + (B.foliage - A.foliage) * w,
    citrusLeaf: A.citrusLeaf + (B.citrusLeaf - A.citrusLeaf) * w,
  }
}

// ── LIFE ────────────────────────────────────────────────────────────────────
const BEES = [
  { left: "26%", bottom: 156, dur: 44, delay: -6,  scale: 1.00, o: 0.55 },
  { left: "68%", bottom: 112, dur: 58, delay: -27, scale: 0.80, o: 0.44 },
]
const MOTES = [
  { left: "17%", bottom: 206, dur: 40, delay: -4,  size: 2.5 },
  { left: "44%", bottom: 248, dur: 48, delay: -19, size: 2 },
  { left: "72%", bottom: 222, dur: 43, delay: -31, size: 2.5 },
  { left: "58%", bottom: 268, dur: 52, delay: -11, size: 2 },
  { left: "31%", bottom: 182, dur: 46, delay: -25, size: 2 },
]

const HerbStyle = () => (
  <style>{`
    @keyframes hbSway  { 0%,100% { transform: rotate(-1.3deg); } 50% { transform: rotate(1.3deg); } }
    @keyframes hbSway2 { 0%,100% { transform: rotate(1.0deg); } 50% { transform: rotate(-1.0deg); } }
    @keyframes hbBee   { 0% { transform: translate(0,0); } 24% { transform: translate(30px,-16px); } 51% { transform: translate(62px,5px); } 76% { transform: translate(26px,19px); } 100% { transform: translate(0,0); } }
    @keyframes hbWing  { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(.74); } }
    @keyframes hbMote  { 0% { transform: translate(0,0); opacity: 0; } 24% { opacity: .45; } 76% { opacity: .28; } 100% { transform: translate(18px,-78px); opacity: 0; } }
  `}</style>
)

const Bee = () => (
  <svg width="16" height="11" viewBox="0 0 20 14">
    <ellipse cx="11" cy="8" rx="5.6" ry="4" fill={H0.bee} />
    <path d="M8.4 4.6 C 9.7 5.8, 9.7 10.2, 8.4 11.4 C 7.8 10, 7.8 6, 8.4 4.6 Z" fill={H0.beeDark} opacity="0.72" />
    <path d="M12.2 4.4 C 13.3 5.8, 13.3 10.2, 12.2 11.6 C 11.6 10, 11.6 6, 12.2 4.4 Z" fill={H0.beeDark} opacity="0.6" />
    <circle cx="16.6" cy="7.2" r="2.2" fill={H0.beeDark} opacity="0.8" />
    <g style={{ transformOrigin: "10px 5px", animation: "hbWing 1s ease-in-out infinite" }}>
      <ellipse cx="9" cy="3.8" rx="4.2" ry="2.4" fill="#FFFFFF" opacity="0.45" />
    </g>
  </svg>
)

// ── AIR ─────────────────────────────────────────────────────────────────────
// Not a sky. No sun disc, no moon, no stars — that language belongs to Today.
// Just morning light, and after dark a soft wash from one corner.
export function NourishAir({ mode, tint }) {
  const night = mode === "night"
  const dark = mode === "evening" || night

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400, pointerEvents: "none", overflow: "hidden" }}>
      <HerbStyle />

      {mode === "morning" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250, background: "linear-gradient(180deg,rgba(255,220,160,0.20),rgba(255,220,160,0))" }} />}
      {mode === "afternoon" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280, background: "linear-gradient(180deg,rgba(248,190,120,0.22),rgba(248,190,120,0))" }} />}
      {mode === "evening" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 240, background: "linear-gradient(180deg,rgba(232,168,95,0.14),rgba(232,168,95,0))" }} />}
      {night && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 290, background: "linear-gradient(180deg,rgba(198,210,244,0.10),rgba(198,210,244,0))" }} />}

      {/* one soft light source, high and off to one side */}
      <div style={{ position: "absolute", top: night ? 46 : 26, right: night ? 30 : -34, width: night ? 176 : 250, height: night ? 176 : 250, borderRadius: "50%",
        background: night
          ? "radial-gradient(circle,rgba(224,231,255,0.26) 0%,rgba(224,231,255,0.08) 48%,rgba(224,231,255,0) 72%)"
          : "radial-gradient(circle,rgba(255,232,182,0.38) 0%,rgba(255,232,182,0.12) 50%,rgba(255,232,182,0) 74%)",
        animation: "breathe 10s ease-in-out infinite" }} />

      {/* capacity tint — the same signal Today uses */}
      {tint && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: tint }} />}

      {/* occasional pollen, daytime only */}
      {!dark && MOTES.map((m, i) => (
        <div key={i} style={{ position: "absolute", left: m.left, bottom: m.bottom, width: m.size, height: m.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.88)", animation: `hbMote ${m.dur}s ease-in-out infinite`, animationDelay: `${m.delay}s` }} />
      ))}
    </div>
  )
}

// ── KITCHEN GARDEN ──────────────────────────────────────────────────────────
const GH = 300

function Sprig({ k, h, c, S }) {
  const stem = <path d={`M0 0 C ${-3} ${-h * 0.42}, ${3} ${-h * 0.7}, ${-1} ${-h}`} stroke={c.stem} strokeWidth="1.5" fill="none" strokeLinecap="round" />

  if (k === "rosemary") {
    const n = []
    for (let i = 0; i < 11; i++) {
      const y = -h * 0.24 - i * (h * 0.066), d = i % 2 ? 1 : -1
      n.push(<path key={i} d={`M0 ${y} L ${d * 8} ${y - 4.5}`} stroke={c.rosemary} strokeWidth="1.6" strokeLinecap="round" />)
    }
    return <g>{stem}{n}<path d={`M0 ${-h} L 0 ${-h - 6}`} stroke={c.rosemary} strokeWidth="1.6" strokeLinecap="round" /></g>
  }
  if (k === "basil") {
    const p = []
    for (let i = 0; i < 3; i++) {
      const y = -h * 0.34 - i * (h * 0.21), s = 1 - i * 0.16
      p.push(<g key={i}>
        <ellipse cx={-8 * s} cy={y} rx={7.5 * s} ry={4.6 * s} fill={c.basil} opacity={S.foliage} transform={`rotate(-22 ${-8 * s} ${y})`} />
        <ellipse cx={8 * s} cy={y} rx={7.5 * s} ry={4.6 * s} fill={c.basil} opacity={S.foliage} transform={`rotate(22 ${8 * s} ${y})`} />
      </g>)
    }
    return <g>{stem}{p}<ellipse cx="0" cy={-h - 2} rx="4.4" ry="6" fill={c.basil} opacity={S.foliage} /></g>
  }
  if (k === "mint") {
    const p = []
    for (let i = 0; i < 3; i++) {
      const y = -h * 0.32 - i * (h * 0.22), s = 1 - i * 0.15
      p.push(<g key={i}>
        <path d={`M0 ${y} C ${-5 * s} ${y - 5.5 * s}, ${-12 * s} ${y - 3.5 * s}, ${-13 * s} ${y + 1} C ${-8 * s} ${y + 3.5 * s}, ${-3 * s} ${y + 2.5 * s}, 0 ${y} Z`} fill={c.mint} opacity={S.foliage} />
        <path d={`M0 ${y} C ${5 * s} ${y - 5.5 * s}, ${12 * s} ${y - 3.5 * s}, ${13 * s} ${y + 1} C ${8 * s} ${y + 3.5 * s}, ${3 * s} ${y + 2.5 * s}, 0 ${y} Z`} fill={c.mint} opacity={S.foliage} />
      </g>)
    }
    return <g>{stem}{p}</g>
  }
  if (k === "thyme") {
    const b = []
    for (let i = 0; i < 8; i++) {
      const y = -h * 0.26 - i * (h * 0.09), d = i % 2 ? 1 : -1
      b.push(<ellipse key={i} cx={d * 4.5} cy={y} rx="3" ry="2" fill={c.thyme} opacity={S.foliage} transform={`rotate(${d * 28} ${d * 4.5} ${y})`} />)
    }
    return <g>{stem}{b}</g>
  }
  if (k === "sage") {
    // soft grey-green ovals, low and generous
    const l = []
    for (let i = 0; i < 4; i++) {
      const y = -h * 0.3 - i * (h * 0.2), d = i % 2 ? 1 : -1, s = 1 - i * 0.13
      l.push(<ellipse key={i} cx={d * 8 * s} cy={y} rx={9 * s} ry={5 * s} fill={c.sage} opacity={0.9 * S.foliage} transform={`rotate(${d * 20} ${d * 8 * s} ${y})`} />)
    }
    // autumn brings tiny seed heads
    const seeds = S.seed > 0.1 ? [0, 1, 2].map((i) => (
      <circle key={i} cx={i === 1 ? 0 : (i === 0 ? -3.5 : 3.5)} cy={-h - 3 - i * 3.5} r="1.9" fill={c.seed} opacity={S.seed} />
    )) : null
    return <g>{stem}{l}{seeds}</g>
  }
  if (k === "blossom") {
    const petals = [0, 72, 144, 216, 288].map((r) => (
      <ellipse key={r} cx="0" cy="-5.5" rx="3.6" ry="5.5" fill={c.blossom} opacity={0.95} transform={`rotate(${r})`} />
    ))
    return (
      <g>{stem}
        <ellipse cx={-7} cy={-h * 0.52} rx="6.5" ry="3.6" fill={c.basil} opacity={0.85 * S.citrusLeaf} transform={`rotate(-24 -7 ${-h * 0.52})`} />
        {S.blossom > 0.12 && <g transform={`translate(-1,${-h}) scale(${S.blossom.toFixed(2)})`}>{petals}<circle cx="0" cy="0" r="2.3" fill={c.blossomCore} /></g>}
      </g>
    )
  }
  return null
}

function Slice({ kind, c, size }) {
  const rind = kind === "orange" ? c.orangeRind : c.lemonRind
  const flesh = kind === "orange" ? c.orange : c.lemon
  const core = kind === "orange" ? c.orangeCore : c.lemonCore
  const seg = []
  for (let i = 0; i < 8; i++) {
    const a = (i * 45 * Math.PI) / 180
    seg.push(<path key={i} d={`M0 0 L ${Math.cos(a) * size * 0.74} ${Math.sin(a) * size * 0.74} A ${size * 0.74} ${size * 0.74} 0 0 1 ${Math.cos(a + 0.72) * size * 0.74} ${Math.sin(a + 0.72) * size * 0.74} Z`} fill={flesh} opacity="0.9" stroke={core} strokeWidth="1.5" />)
  }
  return <g><circle cx="0" cy="0" r={size} fill={rind} /><circle cx="0" cy="0" r={size * 0.82} fill={core} />{seg}<circle cx="0" cy="0" r={size * 0.08} fill={core} /></g>
}

// Eleven sprigs. Low, irregular, with real gaps between them.
const PLOT = [
  { x: 22,  h: 128, k: "rosemary", s: 25, d: -2 },
  { x: 56,  h: 74,  k: "thyme",    s: 30, d: -14 },
  { x: 88,  h: 108, k: "sage",     s: 22, d: -6 },
  { x: 132, h: 152, k: "blossom",  s: 27, d: -19 },
  { x: 176, h: 86,  k: "mint",     s: 24, d: -9 },
  { x: 228, h: 68,  k: "thyme",    s: 31, d: -25 },
  { x: 268, h: 118, k: "basil",    s: 26, d: -4 },
  { x: 312, h: 92,  k: "sage",     s: 23, d: -17 },
  { x: 348, h: 144, k: "rosemary", s: 28, d: -11 },
  { x: 390, h: 80,  k: "mint",     s: 29, d: -22 },
  { x: 424, h: 132, k: "blossom",  s: 25, d: -7 },
]

export function HerbGarden({ mode }) {
  const night = mode === "night"
  const dark = mode === "evening" || night
  const S = herbSeason()

  // Herbs stay herb-green, drifting with the season so the app breathes together.
  const t = (hex) => {
    const seasoned = mixc(hex, S.tone, 0.26)
    return dark ? mixc(seasoned, night ? "#39324A" : "#6E5D62", night ? 0.48 : 0.26) : seasoned
  }
  const d2 = (hex) => (dark ? mixc(hex, night ? "#39324A" : "#6E5D62", night ? 0.42 : 0.22) : hex)
  const c = {
    rosemary: t(H0.rosemary), basil: t(H0.basil), mint: t(H0.mint), thyme: t(H0.thyme), sage: t(H0.sage), stem: t(H0.stem),
    blossom: d2(H0.blossom), blossomCore: d2(H0.blossomCore), seed: d2(H0.seed),
    orange: d2(H0.orange), orangeRind: d2(H0.orangeRind), orangeCore: d2(H0.orangeCore),
    lemon: d2(H0.lemon), lemonRind: d2(H0.lemonRind), lemonCore: d2(H0.lemonCore),
  }
  // Markedly lighter than Today's meadow.
  const o = night ? 0.24 : dark ? 0.30 : 0.38

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: GH, pointerEvents: "none", overflow: "hidden",
      maskImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 30%,rgba(0,0,0,1) 62%)",
      WebkitMaskImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 30%,rgba(0,0,0,1) 62%)" }}>

      <div style={{ position: "absolute", inset: 0, opacity: o }}>
        <svg width="100%" height={GH} viewBox={`0 0 440 ${GH}`} preserveAspectRatio="xMidYMax slice" style={{ display: "block" }}>
          <defs>
            <linearGradient id="tr-herbground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.basil} stopOpacity="0" />
              <stop offset="100%" stopColor={c.basil} stopOpacity={(0.18 * S.foliage).toFixed(3)} />
            </linearGradient>
          </defs>
          <rect x="0" y={GH - 150} width="440" height="150" fill="url(#tr-herbground)" />

          {/* citrus, mostly off-screen — little discoveries */}
          <g transform={`translate(-30,${GH - 20}) rotate(-13)`} opacity="0.9"><Slice kind="orange" c={c} size={48} /></g>
          <g transform={`translate(470,${GH - 30}) rotate(11)`} opacity="0.88"><Slice kind="lemon" c={c} size={44} /></g>
          <ellipse cx="46" cy={GH - 66} rx="13" ry="6" fill={c.basil} opacity={0.62 * S.citrusLeaf} transform={`rotate(-32 46 ${GH - 66})`} />
          <ellipse cx="416" cy={GH - 76} rx="11.5" ry="5.5" fill={c.basil} opacity={0.55 * S.citrusLeaf} transform={`rotate(28 416 ${GH - 76})`} />

          {PLOT.map((p, i) => (
            <g key={i} transform={`translate(${p.x},${GH})`}
              style={{ transformOrigin: `${p.x}px ${GH}px`, animation: `${i % 2 ? "hbSway2" : "hbSway"} ${p.s}s ease-in-out infinite`, animationDelay: `${p.d}s` }}>
              <Sprig k={p.k} h={p.h} c={c} S={S} />
            </g>
          ))}
        </svg>
      </div>

      {/* two bees, wandering between the herbs — daytime only */}
      {!dark && BEES.map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.left, bottom: b.bottom, opacity: b.o, transform: `scale(${b.scale})`,
          animation: `hbBee ${b.dur}s ease-in-out infinite`, animationDelay: `${b.delay}s` }}>
          <Bee />
        </div>
      ))}
    </div>
  )
}

export { NOURISH_BG }
