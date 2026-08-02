// ============ ATMOSPHERE ============
// The environment around the interface: sky, sun/moon, drifting life, and the
// garden the page settles into. Everything here is decorative and inert —
// pointer-events are off throughout, and nothing reads or writes app state.
//
// Three rules govern this file:
//   1. Motion is slow enough to be felt rather than watched.
//   2. Positions are deterministic, never random — a creature must not jump to
//      a new place every time React re-renders.
//   3. The interface is the hero. Nothing here competes with it.

// ── SEASONS ─────────────────────────────────────────────────────────────────
// Real-world dates, and — importantly — the change is never abrupt. Each season
// eases into the next over twelve days, the way a garden actually turns.
const SEASON_STARTS = [
  { k: "winter", m: 11, d: 21 },   // Dec 21
  { k: "spring", m: 2,  d: 20 },   // Mar 20
  { k: "summer", m: 5,  d: 21 },   // Jun 21
  { k: "autumn", m: 8,  d: 22 },   // Sep 22
]
const BLEND_DAYS = 12

const SEASON = (now) => {
  const y = now.getFullYear()
  const cands = []
  for (const off of [-1, 0, 1]) for (const s of SEASON_STARTS) cands.push({ k: s.k, t: new Date(y + off, s.m, s.d).getTime() })
  cands.sort((a, b) => a.t - b.t)
  const t = now.getTime()
  let i = 0
  for (let j = 0; j < cands.length; j++) if (cands[j].t <= t) i = j
  const cur = cands[i], prev = cands[i - 1] || cands[i]
  const days = (t - cur.t) / 86400000
  const w = Math.max(0, Math.min(1, days / BLEND_DAYS))
  return { from: prev.k, to: cur.k, w, dominant: w < 0.5 ? prev.k : cur.k }
}

// Each season is a set of dials, not a theme. The palette stays True Reverie
// throughout — only warmth, fullness and density move.
const SEASONS = {
  spring: { leaf: "#8FB574", stem: "#7FA054", rose: "#E9799F", lily: "#F0D2E6", hib: "#D08BB6", accent: "#E8C15E",
            bloom: 0.86, foliage: 0.80, warmth: 0.04, cool: 0.00, grass: 0, leaves: 0, wings: 5, pollenO: 0.85 },
  summer: { leaf: "#7BA85F", stem: "#6E9E5A", rose: "#DA618B", lily: "#E9C7DE", hib: "#C97BA8", accent: "#E0A253",
            bloom: 1.00, foliage: 1.00, warmth: 0.14, cool: 0.00, grass: 0, leaves: 0, wings: 6, pollenO: 1.00 },
  autumn: { leaf: "#A29558", stem: "#8E8552", rose: "#C9557F", lily: "#E3BBD6", hib: "#B36B9C", accent: "#D9903F",
            bloom: 0.88, foliage: 0.86, warmth: 0.30, cool: 0.00, grass: 1, leaves: 1, wings: 3, pollenO: 0.70 },
  winter: { leaf: "#93A199", stem: "#8797A0", rose: "#B98BA6", lily: "#DCD3E4", hib: "#A98BB4", accent: "#BFC6CE",
            bloom: 0.46, foliage: 0.52, warmth: 0.00, cool: 0.22, grass: 0.4, leaves: 0, wings: 1, pollenO: 0.45 },
}

const _hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mixHex = (a, b, t) => {
  const A = _hx(a), B = _hx(b)
  return "#" + [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, "0")).join("")
}
const mixNum = (a, b, t) => a + (b - a) * t

// Blend the two seasons we're between into one live palette.
const seasonPalette = (now) => {
  const s = SEASON(now || new Date())
  const A = SEASONS[s.from], B = SEASONS[s.to]
  const out = { season: s.dominant, from: s.from, to: s.to, w: s.w }
  for (const k of ["leaf", "stem", "rose", "lily", "hib", "accent"]) out[k] = mixHex(A[k], B[k], s.w)
  for (const k of ["bloom", "foliage", "warmth", "cool", "grass", "leaves", "pollenO"]) out[k] = mixNum(A[k], B[k], s.w)
  out.wings = Math.round(mixNum(A.wings, B.wings, s.w))
  return out
}

// ── CELESTIAL ───────────────────────────────────────────────────────────────
// A modest arc. The point is that the world has moved since this morning, not
// that it performs an arc.   Sun 05:00 → 18:00 · Moon 18:00 → 05:00
const CELESTIAL = (hour, minute) => {
  const t = hour + (minute || 0) / 60
  const day = t >= 5 && t < 18
  const p = day ? (t - 5) / 13 : (t >= 18 ? t - 18 : t + 6) / 11
  const c = Math.max(0, Math.min(1, p))
  return { day, x: 24 + c * 52, y: 116 - Math.sin(Math.PI * c) * 44, p: c }
}

// ── DRIFTING LIFE ───────────────────────────────────────────────────────────
const CREATURES = [
  { top: 128, dur: 52, delay: -6,  scale: 1.00, a: "#C489E0", b: "#E984B4", o: 0.50 },
  { top: 232, dur: 74, delay: -30, scale: 0.72, a: "#E9B4C9", b: "#D98FB4", o: 0.40 },
  { top: 316, dur: 61, delay: -47, scale: 0.86, a: "#B9A0D8", b: "#E98FA8", o: 0.42 },
  { top: 186, dur: 88, delay: -14, scale: 0.62, a: "#E8C48A", b: "#E0A253", o: 0.38 },
  { top: 372, dur: 67, delay: -58, scale: 0.78, a: "#CFA3DE", b: "#E984B4", o: 0.34 },
  { top: 274, dur: 79, delay: -22, scale: 0.68, a: "#E4B7D6", b: "#C489E0", o: 0.36 },
]

const POLLEN = [
  { left: "18%", top: 210, dur: 34, delay: -4,  size: 3 },
  { left: "63%", top: 268, dur: 44, delay: -19, size: 2 },
  { left: "37%", top: 322, dur: 39, delay: -27, size: 2.5 },
  { left: "81%", top: 176, dur: 48, delay: -11, size: 2 },
  { left: "50%", top: 356, dur: 41, delay: -33, size: 3 },
  { left: "26%", top: 292, dur: 52, delay: -22, size: 2 },
  { left: "72%", top: 338, dur: 37, delay: -40, size: 2.5 },
]

// Depth matters more than quantity. `peak` and `blur` push some of these well
// back into the dark; the near ones stay crisp and bright.
const FIREFLIES = [
  { left: "12%", top: 236, dur: 9.5,  delay: -1,  size: 6,   glow: 12, peak: 0.95, blur: 0 },
  { left: "79%", top: 312, dur: 12,   delay: -5,  size: 5,   glow: 10, peak: 0.88, blur: 0 },
  { left: "41%", top: 358, dur: 10.5, delay: -8,  size: 5.5, glow: 11, peak: 0.92, blur: 0 },
  { left: "27%", top: 392, dur: 11,   delay: -6,  size: 5,   glow: 9,  peak: 0.80, blur: 0.3 },
  { left: "64%", top: 202, dur: 13.5, delay: -3,  size: 3.5, glow: 6,  peak: 0.46, blur: 1.2 },
  { left: "88%", top: 250, dur: 12.5, delay: -9,  size: 4,   glow: 7,  peak: 0.60, blur: 0.8 },
  { left: "52%", top: 274, dur: 15,   delay: -11, size: 3,   glow: 5,  peak: 0.34, blur: 1.7 },
]

const STARS_EVENING = [
  { top: 40,  left: "16%",  size: 9, dur: 3.0, o: 0.85 },
  { top: 110, left: "38%",  size: 7, dur: 4.4, o: 0.70 },
  { top: 84,  right: "32%", size: 8, dur: 3.7, o: 0.80 },
  { top: 152, left: "70%",  size: 6, dur: 5.1, o: 0.60 },
  { top: 62,  left: "54%",  size: 5, dur: 4.7, o: 0.50 },
  { top: 178, right: "18%", size: 6, dur: 3.9, o: 0.55 },
]
const STARS_NIGHT = STARS_EVENING.concat([
  { top: 196, left: "24%",  size: 6, dur: 5.6, o: 0.70 },
  { top: 128, right: "12%", size: 8, dur: 3.4, o: 0.85 },
  { top: 232, right: "40%", size: 5, dur: 4.8, o: 0.55 },
  { top: 30,  left: "78%",  size: 6, dur: 5.3, o: 0.65 },
  { top: 258, left: "8%",   size: 5, dur: 4.2, o: 0.45 },
  { top: 96,  left: "6%",   size: 6, dur: 6.0, o: 0.60 },
  { top: 214, left: "88%",  size: 5, dur: 5.8, o: 0.50 },
  { top: 160, left: "48%",  size: 4, dur: 4.5, o: 0.40 },
])

const FALLING_LEAVES = [
  { left: "22%", dur: 34, delay: -4,  size: 9,  rot: 210 },
  { left: "58%", dur: 44, delay: -21, size: 7,  rot: -180 },
  { left: "83%", dur: 39, delay: -32, size: 8,  rot: 260 },
]

const Butterfly = ({ a, b }) => (
  <svg width="30" height="23" viewBox="0 0 34 26">
    <path d="M17 13 C 10 2, 1 4, 3 12 C 4 18, 12 18, 17 13" fill={a} />
    <path d="M17 13 C 24 2, 33 4, 31 12 C 30 18, 22 18, 17 13" fill={b} />
  </svg>
)

// Keyframes unique to the atmosphere. Kept here so the whole environment is one file.
const AtmoStyle = () => (
  <style>{`
    @keyframes leaffall { 0% { transform: translateY(-30px) rotate(0deg); opacity: 0; } 12% { opacity: .7; } 88% { opacity: .5; } 100% { transform: translateY(430px) translateX(34px) rotate(var(--r,220deg)); opacity: 0; } }
    @keyframes grasslean { 0%,100% { transform: rotate(-2.4deg); } 50% { transform: rotate(2.4deg); } }
  `}</style>
)

// ── SKY ─────────────────────────────────────────────────────────────────────
export function Sky({ mode, tint }) {
  const now = new Date()
  const sky = CELESTIAL(now.getHours(), now.getMinutes())
  const S = seasonPalette(now)
  const dark = mode === "evening" || mode === "night"
  const night = mode === "night"

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 460, pointerEvents: "none", overflow: "hidden" }}>
      <AtmoStyle />

      {/* light from above */}
      {mode === "morning" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 230, background: "linear-gradient(180deg,rgba(240,200,120,0.18),rgba(240,200,120,0))" }} />}
      {mode === "afternoon" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 270, background: "linear-gradient(180deg,rgba(240,170,90,0.20),rgba(240,170,90,0))" }} />}
      {mode === "evening" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250, background: "linear-gradient(180deg,rgba(240,200,121,0.10),rgba(240,200,121,0))" }} />}
      {night && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: "linear-gradient(180deg,rgba(190,205,255,0.10),rgba(190,205,255,0))" }} />}

      {/* seasonal light — autumn turns the day golden, winter cools it */}
      {S.warmth > 0.01 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320, background: `linear-gradient(180deg,rgba(224,162,83,${(S.warmth * 0.30).toFixed(3)}),rgba(224,162,83,0) 70%)` }} />}
      {S.cool > 0.01 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340, background: `linear-gradient(180deg,rgba(176,198,222,${(S.cool * 0.34).toFixed(3)}),rgba(176,198,222,0) 72%)` }} />}

      {/* capacity tint — felt more than seen */}
      {tint && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340, background: tint }} />}

      {/* the sun — unchanged light, simply where the day has put it */}
      {sky.day && (
        <div style={{ position: "absolute", top: sky.y, left: `${sky.x}%`, marginLeft: -50, width: 100, height: 100, borderRadius: "50%",
          background: "radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)",
          animation: "breathe 6s ease-in-out infinite" }} />
      )}

      {/* the moon — larger now, and larger still once it owns the sky */}
      {!sky.day && (
        <svg style={{ position: "absolute", top: sky.y - 10, left: `${sky.x}%`, marginLeft: night ? -35 : -26, opacity: night ? 1 : 0.92,
          filter: night ? "drop-shadow(0 0 22px rgba(240,227,184,0.46))" : "drop-shadow(0 0 13px rgba(240,227,184,0.32))" }}
          width={night ? 70 : 52} height={night ? 70 : 52} viewBox="0 0 40 40">
          <path d="M28 4 A 16 16 0 1 0 36 22 A 12.5 12.5 0 0 1 28 4 Z" fill="#F0E3B8" />
        </svg>
      )}

      {/* morning mist */}
      {mode === "morning" && (
        <>
          <div style={{ position: "absolute", top: 168, left: -20, right: -20, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.26)", animation: "mistfloat 10s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 200, left: 70, right: -20, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.2)", animation: "mistfloat 13s ease-in-out infinite" }} />
        </>
      )}
      {mode === "afternoon" && (
        <div style={{ position: "absolute", top: 210, right: -50, width: 190, height: 190, borderRadius: "50%", background: "rgba(255,255,255,0.16)", animation: "mistfloat 12s ease-in-out infinite" }} />
      )}

      {/* stars */}
      {dark && (night ? STARS_NIGHT : STARS_EVENING).map((s, i) => (
        <div key={i} style={{ position: "absolute", top: s.top, left: s.left, right: s.right, color: night ? "#FFF6DA" : "#F0C879",
          fontSize: s.size, opacity: s.o * (night ? 1 : 0.9), animation: `twinkle ${s.dur}s ease-in-out infinite` }}>{"\u2726"}</div>
      ))}

      {/* daytime life — count follows the season */}
      {!dark && CREATURES.slice(0, S.wings).map((c, i) => (
        <div key={i} style={{ position: "absolute", top: c.top, left: 0, opacity: c.o, transform: `scale(${c.scale})`,
          animation: `crossing ${c.dur}s linear infinite`, animationDelay: `${c.delay}s` }}>
          <div style={{ animation: "flutter 2.6s ease-in-out infinite" }}><Butterfly a={c.a} b={c.b} /></div>
        </div>
      ))}
      {!dark && POLLEN.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.85)", opacity: S.pollenO, animation: `pollen ${p.dur}s ease-in-out infinite`, animationDelay: `${p.delay}s` }} />
      ))}

      {/* autumn leaves, drifting down through the sky */}
      {S.leaves > 0.15 && FALLING_LEAVES.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: l.left, top: 0, opacity: S.leaves * 0.85, "--r": `${l.rot}deg`,
          animation: `leaffall ${l.dur}s linear infinite`, animationDelay: `${l.delay}s` }}>
          <svg width={l.size} height={l.size * 1.5} viewBox="0 0 10 15">
            <path d="M5 0 C 9 5, 9 11, 5 15 C 1 11, 1 5, 5 0 Z" fill={S.accent} />
          </svg>
        </div>
      ))}

      {/* fireflies — near ones crisp and bright, far ones dim and soft */}
      {dark && FIREFLIES.map((f, i) => (
        <div key={i} style={{ position: "absolute", left: f.left, top: f.top, opacity: f.peak, filter: f.blur ? `blur(${f.blur}px)` : "none" }}>
          <div style={{ width: f.size, height: f.size, borderRadius: "50%", background: "#F5D98A",
            boxShadow: `0 0 ${f.glow}px ${f.glow / 2.6}px rgba(240,200,121,0.5)`,
            animation: `firefly ${f.dur}s ease-in-out infinite`, animationDelay: `${f.delay}s` }} />
        </div>
      ))}
    </div>
  )
}

// ── GARDEN ──────────────────────────────────────────────────────────────────
// One landscape, not a row of decorations: staggered heights, overlapping
// foliage, and a shared ground haze so the page grows into it.
const H = 380

// x, height, kind, sway seconds, delay. Ordered so nothing lines up.
const PLANTS = [
  { x: 26,  h: 118, k: "grass",    s: 23, d: -2,  sc: 1.00 },
  { x: 58,  h: 176, k: "rose",     s: 16, d: 0,   sc: 1.00 },
  { x: 104, h: 128, k: "lavender", s: 19, d: -3,  sc: 0.92 },
  { x: 152, h: 214, k: "lily",     s: 21, d: -4,  sc: 1.00 },
  { x: 196, h: 142, k: "cosmos",   s: 25, d: -8,  sc: 0.88 },
  { x: 244, h: 190, k: "hibiscus", s: 18, d: -9,  sc: 1.00 },
  { x: 290, h: 132, k: "tulip",    s: 22, d: -12, sc: 0.94 },
  { x: 332, h: 168, k: "rose",     s: 26, d: -13, sc: 0.80 },
  { x: 378, h: 122, k: "cosmos",   s: 20, d: -6,  sc: 0.76 },
  { x: 416, h: 156, k: "lavender", s: 24, d: -16, sc: 0.86 },
]

function Bloom({ k, P, scale }) {
  const b = P.bloom * scale
  if (b < 0.06) return null
  const g = (children) => <g transform={`scale(${b.toFixed(3)})`}>{children}</g>
  if (k === "rose") return g(<>
    <circle cx="0" cy="0" r="9.5" fill={P.rose} opacity="0.55" />
    <circle cx="-6" cy="-4" r="5.5" fill={P.rose} opacity="0.8" />
    <circle cx="6" cy="-4" r="5.5" fill={P.rose} opacity="0.8" />
    <circle cx="0" cy="2" r="6" fill={P.rose} />
    <circle cx="0" cy="0" r="2.4" fill={P.accent} opacity="0.75" />
  </>)
  if (k === "lily") return g(<>
    <path d="M0 0 C -13 -7, -15 -21, -3 -23 C -1 -15, 0 -6, 0 0 Z" fill={P.lily} />
    <path d="M0 0 C 13 -7, 15 -21, 3 -23 C 1 -15, 0 -6, 0 0 Z" fill={P.lily} />
    <path d="M0 0 C -6 -15, 0 -28, 6 -23 C 4 -13, 1 -5, 0 0 Z" fill={P.lily} opacity="0.85" />
    <circle cx="0" cy="-4" r="2" fill={P.accent} opacity="0.8" />
  </>)
  if (k === "hibiscus") return g(<>
    {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="0" cy="-8.5" rx="6.5" ry="9.5" fill={P.hib} opacity="0.85" transform={`rotate(${r})`} />)}
    <circle cx="0" cy="0" r="3.2" fill={P.accent} />
  </>)
  if (k === "cosmos") return g(<>
    {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => <ellipse key={r} cx="0" cy="-7" rx="2.8" ry="6.5" fill={P.lily} opacity="0.9" transform={`rotate(${r})`} />)}
    <circle cx="0" cy="0" r="2.6" fill={P.accent} />
  </>)
  if (k === "tulip") return g(<>
    <path d="M-6 2 C -7 -8, -4 -13, 0 -13 C 4 -13, 7 -8, 6 2 Z" fill={P.rose} />
    <path d="M-6 2 C -4 -6, -2 -9, 0 -9 C 0 -4, -2 0, -6 2 Z" fill={P.rose} opacity="0.6" />
    <path d="M6 2 C 4 -6, 2 -9, 0 -9 C 0 -4, 2 0, 6 2 Z" fill={P.rose} opacity="0.6" />
  </>)
  if (k === "lavender") return g(<>
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <ellipse key={i} cx={i % 2 ? 2.4 : -2.4} cy={-i * 5} rx="2.8" ry="3.4" fill={P.hib} opacity={0.85 - i * 0.07} />
    ))}
  </>)
  return null
}

export function Garden({ mode }) {
  const now = new Date()
  const P = seasonPalette(now)
  const night = mode === "night"
  const dark = mode === "evening" || night
  // Everything dims after dark; flowers close overnight.
  const o = night ? 0.17 : dark ? 0.25 : 0.33
  const sleep = night ? 0.55 : 1
  const dim = (hex) => (dark ? mixHex(hex, "#4A3A56", night ? 0.45 : 0.3) : hex)
  const PAL = { leaf: dim(P.leaf), stem: dim(P.stem), rose: dim(P.rose), lily: dim(P.lily), hib: dim(P.hib), accent: dim(P.accent), bloom: P.bloom * sleep }

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H, pointerEvents: "none", opacity: o, overflow: "hidden" }}>
      <svg width="100%" height={H} viewBox={`0 0 440 ${H}`} preserveAspectRatio="xMidYMax slice" style={{ display: "block" }}>
        <defs>
          <linearGradient id="tr-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PAL.leaf} stopOpacity="0" />
            <stop offset="100%" stopColor={PAL.leaf} stopOpacity={0.30 * P.foliage} />
          </linearGradient>
        </defs>
        <rect x="0" y={H - 250} width="440" height="250" fill="url(#tr-ground)" />

        {/* ornamental grasses — autumn brings these forward */}
        {P.grass > 0.08 && [30, 122, 216, 306, 398].map((gx, i) => (
          <g key={gx} style={{ transformOrigin: `${gx}px ${H}px`, animation: `grasslean ${17 + i * 3}s ease-in-out infinite`, animationDelay: `${-i * 4}s` }} opacity={P.grass}>
            {[-9, -3, 3, 9].map((off, j) => (
              <path key={j} d={`M${gx + off} ${H} C ${gx + off + off * 0.6} ${H - 40}, ${gx + off * 2.4} ${H - 66}, ${gx + off * 3.6} ${H - 92 - j * 6}`}
                stroke={PAL.accent} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.75" />
            ))}
          </g>
        ))}

        {/* the planting */}
        {PLANTS.map((p, i) => {
          const top = H - p.h
          const lean = i % 2 ? 1 : -1
          return (
            <g key={i} style={{ transformOrigin: `${p.x}px ${H}px`, animation: `sway ${p.s}s ease-in-out infinite`, animationDelay: `${p.d}s` }}>
              {p.k !== "grass" && (
                <>
                  <path d={`M${p.x} ${H} C ${p.x + lean * 5} ${H - p.h * 0.42}, ${p.x - lean * 6} ${H - p.h * 0.7}, ${p.x + lean * 2} ${top}`}
                    stroke={PAL.stem} strokeWidth={1.5 + p.sc * 0.6} fill="none" strokeLinecap="round" />
                  <path d={`M${p.x + lean * 2} ${H - p.h * 0.45} C ${p.x + lean * 20} ${H - p.h * 0.52}, ${p.x + lean * 27} ${H - p.h * 0.66}, ${p.x + lean * 25} ${H - p.h * 0.74} C ${p.x + lean * 11} ${H - p.h * 0.7}, ${p.x + lean * 3} ${H - p.h * 0.56}, ${p.x + lean * 2} ${H - p.h * 0.45} Z`}
                    fill={PAL.leaf} opacity={0.85 * P.foliage} />
                  <g transform={`translate(${p.x + lean * 2},${top})`}>
                    <Bloom k={p.k} P={PAL} scale={p.sc} />
                  </g>
                </>
              )}
              {p.k === "grass" && [-7, -2, 3, 8].map((off, j) => (
                <path key={j} d={`M${p.x + off} ${H} C ${p.x + off * 1.6} ${H - p.h * 0.5}, ${p.x + off * 2.6} ${H - p.h * 0.78}, ${p.x + off * 3.4} ${H - p.h - j * 5}`}
                  stroke={PAL.leaf} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={0.7 * P.foliage} />
              ))}
            </g>
          )
        })}

        {/* low foliage tying the base together */}
        <g style={{ transformOrigin: `220px ${H}px`, animation: "sway 29s ease-in-out infinite", animationDelay: "-6s" }} opacity={P.foliage}>
          <path d={`M8 ${H} C 16 ${H - 40}, 34 ${H - 56}, 46 ${H - 62} C 38 ${H - 40}, 26 ${H - 18}, 22 ${H} Z`} fill={PAL.leaf} opacity="0.7" />
          <path d={`M92 ${H} C 98 ${H - 32}, 114 ${H - 46}, 126 ${H - 52} C 118 ${H - 32}, 108 ${H - 14}, 104 ${H} Z`} fill={PAL.leaf} opacity="0.5" />
          <path d={`M186 ${H} C 180 ${H - 36}, 164 ${H - 52}, 152 ${H - 58} C 160 ${H - 36}, 172 ${H - 16}, 176 ${H} Z`} fill={PAL.leaf} opacity="0.58" />
          <path d={`M274 ${H} C 280 ${H - 30}, 296 ${H - 44}, 308 ${H - 50} C 300 ${H - 30}, 288 ${H - 12}, 284 ${H} Z`} fill={PAL.leaf} opacity="0.48" />
          <path d={`M364 ${H} C 358 ${H - 38}, 342 ${H - 54}, 330 ${H - 60} C 338 ${H - 38}, 350 ${H - 16}, 354 ${H} Z`} fill={PAL.leaf} opacity="0.62" />
          <path d={`M432 ${H} C 426 ${H - 32}, 412 ${H - 46}, 400 ${H - 52} C 408 ${H - 32}, 420 ${H - 14}, 424 ${H} Z`} fill={PAL.leaf} opacity="0.52" />
        </g>
      </svg>
    </div>
  )
}

export { CELESTIAL, SEASON, seasonPalette }
