// ============ ATMOSPHERE ============
// The environment around the interface: sky, sun/moon, drifting life, and the
// garden the page settles into. Everything here is decorative and inert —
// pointer-events are off throughout, and nothing reads or writes app state.
//
// Four rules govern this file:
//   1. Motion is slow enough to be felt rather than watched.
//   2. Positions are deterministic, never random — nothing may jump to a new
//      place on re-render.
//   3. Nothing is evenly spaced. Stars cluster, plants crowd and leave gaps,
//      creatures take different paths at different speeds. Cultivated, not
//      manufactured.
//   4. The interface is the hero. If an element starts drawing the eye, it goes.

// ── SEASONS ─────────────────────────────────────────────────────────────────
// Real dates, and the change is never abrupt: each season eases into the next
// over twelve days, the way a garden actually turns.
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
  const w = Math.max(0, Math.min(1, (t - cur.t) / 86400000 / BLEND_DAYS))
  return { from: prev.k, to: cur.k, w, dominant: w < 0.5 ? prev.k : cur.k }
}

// Dials, not themes. The palette stays True Reverie all year; only warmth,
// fullness and density move.
const SEASONS = {
  spring: { leaf: "#8FB574", stem: "#7FA054", rose: "#E9799F", lily: "#F0D2E6", hib: "#D08BB6", accent: "#E8C15E",
            bloom: 0.86, foliage: 0.80, warmth: 0.04, cool: 0.00, fresh: 0.16, grass: 0, leaves: 0,
            wings: 5, bees: 2, birds: 1, pollenO: 0.85 },
  summer: { leaf: "#7BA85F", stem: "#6E9E5A", rose: "#DA618B", lily: "#E9C7DE", hib: "#C97BA8", accent: "#E0A253",
            bloom: 1.00, foliage: 1.00, warmth: 0.14, cool: 0.00, fresh: 0.04, grass: 0, leaves: 0,
            wings: 6, bees: 2, birds: 1, pollenO: 1.00 },
  autumn: { leaf: "#A29558", stem: "#8E8552", rose: "#C9557F", lily: "#E3BBD6", hib: "#B36B9C", accent: "#D9903F",
            bloom: 0.88, foliage: 0.86, warmth: 0.30, cool: 0.00, fresh: 0.00, grass: 1, leaves: 1,
            wings: 3, bees: 1, birds: 2, pollenO: 0.70 },
  winter: { leaf: "#93A199", stem: "#8797A0", rose: "#B98BA6", lily: "#DCD3E4", hib: "#A98BB4", accent: "#BFC6CE",
            bloom: 0.46, foliage: 0.52, warmth: 0.00, cool: 0.22, fresh: 0.00, grass: 0.4, leaves: 0,
            wings: 1, bees: 0, birds: 1, pollenO: 0.45 },
}

const _hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mixHex = (a, b, t) => {
  const A = _hx(a), B = _hx(b)
  return "#" + [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, "0")).join("")
}
const mixNum = (a, b, t) => a + (b - a) * t

const seasonPalette = (now) => {
  const s = SEASON(now || new Date())
  const A = SEASONS[s.from], B = SEASONS[s.to]
  const out = { season: s.dominant, from: s.from, to: s.to, w: s.w }
  for (const k of ["leaf", "stem", "rose", "lily", "hib", "accent"]) out[k] = mixHex(A[k], B[k], s.w)
  for (const k of ["bloom", "foliage", "warmth", "cool", "fresh", "grass", "leaves", "pollenO"]) out[k] = mixNum(A[k], B[k], s.w)
  for (const k of ["wings", "bees", "birds"]) out[k] = Math.round(mixNum(A[k], B[k], s.w))
  return out
}

// ── CELESTIAL ───────────────────────────────────────────────────────────────
// A modest arc: the point is that the world has moved since this morning, not
// that it performs.   Sun 05:00 → 18:00 · Moon 18:00 → 05:00
const CELESTIAL = (hour, minute) => {
  const t = hour + (minute || 0) / 60
  const day = t >= 5 && t < 18
  const p = day ? (t - 5) / 13 : (t >= 18 ? t - 18 : t + 6) / 11
  const c = Math.max(0, Math.min(1, p))
  return { day, x: 24 + c * 52, y: 116 - Math.sin(Math.PI * c) * 44, p: c }
}

// ── DRIFTING LIFE ───────────────────────────────────────────────────────────
// No two share a lane, a speed, or a starting point.
const CREATURES = [
  { top: 124, dur: 52, delay: -6,  scale: 1.00, a: "#C489E0", b: "#E984B4", o: 0.50, path: "crossing",  rev: false },
  { top: 238, dur: 74, delay: -30, scale: 0.72, a: "#E9B4C9", b: "#D98FB4", o: 0.40, path: "crossing2", rev: false },
  { top: 311, dur: 61, delay: -47, scale: 0.86, a: "#B9A0D8", b: "#E98FA8", o: 0.42, path: "crossing3", rev: true  },
  { top: 183, dur: 88, delay: -14, scale: 0.62, a: "#E8C48A", b: "#E0A253", o: 0.38, path: "crossing2", rev: true  },
  { top: 377, dur: 67, delay: -58, scale: 0.78, a: "#CFA3DE", b: "#E984B4", o: 0.34, path: "crossing",  rev: false },
  { top: 269, dur: 79, delay: -22, scale: 0.68, a: "#E4B7D6", b: "#C489E0", o: 0.36, path: "crossing3", rev: false },
]

const POLLEN = [
  { left: "17%", top: 206, dur: 34, delay: -4,  size: 3 },
  { left: "64%", top: 271, dur: 44, delay: -19, size: 2 },
  { left: "35%", top: 318, dur: 39, delay: -27, size: 2.5 },
  { left: "82%", top: 179, dur: 48, delay: -11, size: 2 },
  { left: "48%", top: 359, dur: 41, delay: -33, size: 3 },
  { left: "24%", top: 294, dur: 52, delay: -22, size: 2 },
  { left: "73%", top: 341, dur: 37, delay: -40, size: 2.5 },
]

// Birds cross high and rarely — each is off-screen for most of its cycle.
const BIRDS = [
  { top: 48, dur: 210, delay: -40,  scale: 1.0,  o: 0.30 },
  { top: 82, dur: 260, delay: -155, scale: 0.75, o: 0.22 },
]

// Depth over quantity. `peak` and `blur` push some of these well back into the dark.
const FIREFLIES = [
  { left: "12%", top: 236, dur: 9.5,  delay: -1,  size: 6,   glow: 12, peak: 0.95, blur: 0 },
  { left: "79%", top: 312, dur: 12,   delay: -5,  size: 5,   glow: 10, peak: 0.88, blur: 0 },
  { left: "41%", top: 358, dur: 10.5, delay: -8,  size: 5.5, glow: 11, peak: 0.92, blur: 0 },
  { left: "27%", top: 392, dur: 11,   delay: -6,  size: 5,   glow: 9,  peak: 0.80, blur: 0.3 },
  { left: "64%", top: 202, dur: 13.5, delay: -3,  size: 3.5, glow: 6,  peak: 0.46, blur: 1.2 },
  { left: "88%", top: 250, dur: 12.5, delay: -9,  size: 4,   glow: 7,  peak: 0.60, blur: 0.8 },
  { left: "52%", top: 274, dur: 15,   delay: -11, size: 3,   glow: 5,  peak: 0.34, blur: 1.7 },
]

// Stars cluster the way real ones do — pairs, a triple, and some alone.
const STARS_EVENING = [
  { top: 38,  left: "14%",  size: 9, dur: 3.0, o: 0.85 },
  { top: 53,  left: "21%",  size: 6, dur: 4.6, o: 0.55 },
  { top: 97,  left: "41%",  size: 7, dur: 4.4, o: 0.70 },
  { top: 72,  right: "29%", size: 8, dur: 3.7, o: 0.80 },
  { top: 89,  right: "22%", size: 5, dur: 5.2, o: 0.48 },
  { top: 151, left: "66%",  size: 6, dur: 5.1, o: 0.60 },
]
const STARS_NIGHT = STARS_EVENING.concat([
  { top: 34,  left: "77%",  size: 7, dur: 5.3, o: 0.72 },
  { top: 47,  left: "84%",  size: 5, dur: 4.1, o: 0.50 },
  { top: 118, left: "9%",   size: 6, dur: 6.0, o: 0.62 },
  { top: 191, left: "27%",  size: 6, dur: 5.6, o: 0.68 },
  { top: 204, left: "33%",  size: 4, dur: 4.3, o: 0.42 },
  { top: 126, right: "11%", size: 8, dur: 3.4, o: 0.85 },
  { top: 243, right: "37%", size: 5, dur: 4.8, o: 0.52 },
  { top: 216, left: "88%",  size: 5, dur: 5.8, o: 0.50 },
  { top: 163, left: "52%",  size: 4, dur: 4.5, o: 0.38 },
  { top: 261, left: "7%",   size: 5, dur: 6.3, o: 0.44 },
])

// A fine scatter behind the named stars — small, faint, clustered rather than spaced.
const STAR_DUST = [
  { t: 34,  l: "7%",  s: 4, d: 5.2, o: .38 }, { t: 52,  l: "11%", s: 3, d: 6.1, o: .30 },
  { t: 88,  l: "27%", s: 3, d: 4.6, o: .34 }, { t: 71,  l: "33%", s: 4, d: 5.8, o: .28 },
  { t: 122, l: "19%", s: 3, d: 6.4, o: .32 }, { t: 46,  l: "46%", s: 3, d: 5.0, o: .26 },
  { t: 108, l: "58%", s: 4, d: 4.3, o: .36 }, { t: 143, l: "51%", s: 3, d: 6.7, o: .24 },
  { t: 63,  l: "68%", s: 3, d: 5.5, o: .34 }, { t: 96,  l: "74%", s: 4, d: 4.9, o: .30 },
  { t: 29,  l: "84%", s: 3, d: 6.2, o: .32 }, { t: 137, l: "88%", s: 3, d: 5.3, o: .26 },
  { t: 176, l: "12%", s: 3, d: 5.9, o: .28 }, { t: 191, l: "37%", s: 4, d: 4.7, o: .24 },
  { t: 168, l: "62%", s: 3, d: 6.5, o: .30 }, { t: 206, l: "79%", s: 3, d: 5.1, o: .26 },
  { t: 232, l: "23%", s: 3, d: 6.0, o: .22 }, { t: 219, l: "94%", s: 3, d: 4.8, o: .28 },
  { t: 259, l: "44%", s: 3, d: 5.7, o: .20 }, { t: 247, l: "70%", s: 3, d: 6.3, o: .24 },
  { t: 283, l: "16%", s: 3, d: 5.4, o: .18 }, { t: 271, l: "86%", s: 3, d: 4.5, o: .22 },
]

const FALLING_LEAVES = [
  { left: "21%", dur: 34, delay: -4,  size: 9, rot: 210 },
  { left: "57%", dur: 44, delay: -21, size: 7, rot: -180 },
  { left: "84%", dur: 39, delay: -32, size: 8, rot: 260 },
]

// Bees live among the flowers, not in the sky. Each wanders its own loop.
const BEES = [
  { left: "24%", bottom: 196, dur: 84, delay: -12, scale: 1.00, o: 0.55 },
  { left: "68%", bottom: 154, dur: 97, delay: -48, scale: 0.82, o: 0.45 },
]

const Butterfly = ({ a, b }) => (
  <svg width="30" height="23" viewBox="0 0 34 26">
    <path d="M17 13 C 10 2, 1 4, 3 12 C 4 18, 12 18, 17 13" fill={a} />
    <path d="M17 13 C 24 2, 33 4, 31 12 C 30 18, 22 18, 17 13" fill={b} />
  </svg>
)

const Bee = ({ body, wing }) => (
  <svg width="15" height="11" viewBox="0 0 20 14">
    <ellipse cx="7" cy="9" rx="3.4" ry="4.2" fill="rgba(255,255,255,0.55)" transform="rotate(-24 7 9)" />
    <ellipse cx="12" cy="9" rx="3.4" ry="4.2" fill="rgba(255,255,255,0.5)" transform="rotate(24 12 9)" />
    <ellipse cx="10" cy="9.5" rx="5" ry="3.4" fill={body} />
    <path d="M8 6.6 L 8 12.4 M 11 6.5 L 11 12.5" stroke={wing} strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
  </svg>
)

const Bird = () => (
  <svg width="16" height="7" viewBox="0 0 22 9">
    <path d="M1 6 C 4 1, 7 1, 11 5 C 15 1, 18 1, 21 6" stroke="#6B5A72" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
)

// Keyframes belonging to the atmosphere, kept here so it's all one file.
const AtmoStyle = () => (
  <style>{`
    @keyframes leaffall { 0% { transform: translateY(-30px) rotate(0deg); opacity: 0; } 12% { opacity: .7; } 88% { opacity: .5; } 100% { transform: translateY(470px) translateX(34px) rotate(var(--r,220deg)); opacity: 0; } }
    @keyframes crossing2 { 0% { transform: translateX(-46px) translateY(10px); } 35% { transform: translateX(140px) translateY(-18px); } 68% { transform: translateX(300px) translateY(22px); } 100% { transform: translateX(470px) translateY(-4px); } }
    @keyframes crossing3 { 0% { transform: translateX(-46px) translateY(-6px); } 45% { transform: translateX(190px) translateY(14px); } 100% { transform: translateX(470px) translateY(-12px); } }
    @keyframes grasslean { 0%,100% { transform: rotate(-2.4deg); } 50% { transform: rotate(2.4deg); } }
    @keyframes meander { 0% { transform: translate(0,0); } 17% { transform: translate(34px,-19px); } 33% { transform: translate(66px,6px); } 51% { transform: translate(41px,26px); } 68% { transform: translate(-9px,15px); } 84% { transform: translate(-22px,-11px); } 100% { transform: translate(0,0); } }
    @keyframes beewing { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.72); } }
    @keyframes flyby { 0% { transform: translateX(-70px) translateY(0); opacity: 0; } 1.5% { opacity: var(--o,.3); } 9% { opacity: var(--o,.3); } 11% { transform: translateX(520px) translateY(-16px); opacity: 0; } 100% { transform: translateX(520px) translateY(-16px); opacity: 0; } }
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

      {/* seasonal sky — autumn turns golden, winter cools, spring freshens */}
      {S.warmth > 0.01 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 330, background: `linear-gradient(180deg,rgba(224,162,83,${(S.warmth * 0.30).toFixed(3)}),rgba(224,162,83,0) 70%)` }} />}
      {S.cool > 0.01 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 350, background: `linear-gradient(180deg,rgba(176,198,222,${(S.cool * 0.34).toFixed(3)}),rgba(176,198,222,0) 72%)` }} />}
      {S.fresh > 0.01 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320, background: `linear-gradient(180deg,rgba(186,216,178,${(S.fresh * 0.30).toFixed(3)}),rgba(186,216,178,0) 68%)` }} />}

      {/* capacity tint — felt more than seen */}
      {tint && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340, background: tint }} />}

      {/* the sun — unchanged light, simply where the day has put it */}
      {sky.day && (
        <div style={{ position: "absolute", top: sky.y, left: `${sky.x}%`, marginLeft: -50, width: 100, height: 100, borderRadius: "50%",
          background: "radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)",
          animation: "breathe 6s ease-in-out infinite" }} />
      )}

      {/* the moon — the focal point of the evening sky */}
      {!sky.day && (
        <svg style={{ position: "absolute", top: sky.y - 10, left: `${sky.x}%`, marginLeft: night ? -35 : -26, opacity: night ? 1 : 0.92,
          filter: night ? "drop-shadow(0 0 30px rgba(240,227,184,0.55)) drop-shadow(0 0 60px rgba(240,227,184,0.28))" : "drop-shadow(0 0 22px rgba(240,227,184,0.44)) drop-shadow(0 0 46px rgba(240,227,184,0.22))" }}
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
      {dark && STAR_DUST.map((s, i) => (
        <div key={"d" + i} style={{ position: "absolute", top: s.t, left: s.l, width: s.s, height: s.s, borderRadius: "50%",
          background: night ? "#FFF6DA" : "#F3DFB4", opacity: s.o * (night ? 1 : 0.72),
          animation: `twinkle ${s.d}s ease-in-out infinite`, animationDelay: `${-i * 0.7}s` }} />
      ))}
      {dark && (night ? STARS_NIGHT : STARS_EVENING).map((s, i) => (
        <div key={i} style={{ position: "absolute", top: s.top, left: s.left, right: s.right, color: night ? "#FFF6DA" : "#F0C879",
          fontSize: s.size, opacity: s.o * (night ? 1 : 0.9), animation: `twinkle ${s.dur}s ease-in-out infinite` }}>{"\u2726"}</div>
      ))}

      {/* butterflies — how many depends on the season */}
      {!dark && CREATURES.slice(0, S.wings).map((c, i) => (
        <div key={i} style={{ position: "absolute", top: c.top, left: 0, opacity: c.o, transform: `scale(${c.scale})`,
          animation: `${c.path} ${c.dur}s linear infinite`, animationDelay: `${c.delay}s`, animationDirection: c.rev ? "reverse" : "normal" }}>
          <div style={{ animation: "flutter 2.6s ease-in-out infinite" }}><Butterfly a={c.a} b={c.b} /></div>
        </div>
      ))}

      {/* a bird, high up, every few minutes — off-screen for most of its cycle */}
      {!dark && BIRDS.slice(0, S.birds).map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: 0, transform: `scale(${b.scale})`, opacity: 0, "--o": b.o,
          animation: `flyby ${b.dur}s linear infinite`, animationDelay: `${b.delay}s` }}>
          <Bird />
        </div>
      ))}

      {!dark && POLLEN.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.85)", opacity: S.pollenO, animation: `pollen ${p.dur}s ease-in-out infinite`, animationDelay: `${p.delay}s` }} />
      ))}

      {/* autumn leaves drifting down */}
      {S.leaves > 0.15 && FALLING_LEAVES.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: l.left, top: 0, opacity: S.leaves * 0.85, "--r": `${l.rot}deg`,
          animation: `leaffall ${l.dur}s linear infinite`, animationDelay: `${l.delay}s` }}>
          <svg width={l.size} height={l.size * 1.5} viewBox="0 0 10 15">
            <path d="M5 0 C 9 5, 9 11, 5 15 C 1 11, 1 5, 5 0 Z" fill={S.accent} />
          </svg>
        </div>
      ))}

      {/* fireflies — near ones crisp, far ones dim and soft */}
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
// One landscape, not a row of decorations. Plants crowd in places and leave
// gaps in others; several rise well up behind the lower page.
const H = 520

const PLANTS = [
  { x: 14,  h: 168, k: "grass",     s: 23, d: -2,  sc: 1.00 },
  { x: 33,  h: 262, k: "lavender",  s: 25, d: -14, sc: 0.94 },
  { x: 52,  h: 214, k: "rose",      s: 16, d: 0,   sc: 1.00 },
  { x: 74,  h: 138, k: "cosmos",    s: 25, d: -7,  sc: 0.78 },
  { x: 96,  h: 186, k: "bud",       s: 20, d: -18, sc: 0.86 },
  { x: 121, h: 296, k: "lily",      s: 21, d: -4,  sc: 1.06 },
  { x: 143, h: 152, k: "daisy",     s: 27, d: -11, sc: 0.80 },
  { x: 167, h: 228, k: "lavender",  s: 19, d: -3,  sc: 0.90 },
  { x: 196, h: 174, k: "hibiscus",  s: 18, d: -9,  sc: 0.96 },
  { x: 214, h: 118, k: "sprig",     s: 29, d: -21, sc: 0.74 },
  { x: 238, h: 246, k: "cosmos",    s: 22, d: -12, sc: 0.92 },
  { x: 262, h: 142, k: "tulip",     s: 24, d: -6,  sc: 0.84 },
  { x: 289, h: 308, k: "rose",      s: 26, d: -13, sc: 0.98 },
  { x: 312, h: 164, k: "daisy",     s: 20, d: -24, sc: 0.76 },
  { x: 334, h: 232, k: "hibiscus",  s: 17, d: -19, sc: 0.94 },
  { x: 358, h: 128, k: "sprig",     s: 28, d: -8,  sc: 0.72 },
  { x: 379, h: 274, k: "lavender",  s: 24, d: -16, sc: 0.96 },
  { x: 398, h: 192, k: "lily",      s: 23, d: -27, sc: 0.88 },
  { x: 420, h: 146, k: "bud",       s: 21, d: -5,  sc: 0.82 },
  { x: 436, h: 218, k: "grass",     s: 22, d: -19, sc: 0.92 },
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
  if (k === "daisy") return g(<>
    {[0, 51, 102, 153, 204, 255, 306].map((r) => <ellipse key={r} cx="0" cy="-7.5" rx="3.4" ry="7" fill={P.lily} opacity="0.95" transform={`rotate(${r})`} />)}
    <circle cx="0" cy="0" r="3.4" fill={P.accent} />
  </>)
  if (k === "bud") return g(<>
    <path d="M0 -14 C 5 -10, 5 -2, 0 3 C -5 -2, -5 -10, 0 -14 Z" fill={P.rose} opacity="0.9" />
    <path d="M0 -12 C 2 -8, 2 -2, 0 1 C -2 -2, -2 -8, 0 -12 Z" fill={P.rose} />
  </>)
  if (k === "sprig") return g(<>
    {[[-5, -3], [5, -5], [0, -11], [-4, -13], [4, -14]].map((c, i) => (
      <circle key={i} cx={c[0]} cy={c[1]} r="2.6" fill={i % 2 ? P.hib : P.lily} opacity="0.9" />
    ))}
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
  const o = night ? 0.46 : dark ? 0.52 : 0.55
  const sleep = night ? 0.55 : 1
  const dim = (hex) => (dark ? mixHex(hex, "#4A3A56", night ? 0.45 : 0.3) : hex)
  const PAL = { leaf: dim(P.leaf), stem: dim(P.stem), rose: dim(P.rose), lily: dim(P.lily), hib: dim(P.hib), accent: dim(P.accent), bloom: P.bloom * sleep }

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H, pointerEvents: "none", overflow: "hidden",
      maskImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 22%,rgba(0,0,0,1) 52%)",
      WebkitMaskImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 22%,rgba(0,0,0,1) 52%)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: o }}>
        <svg width="100%" height={H} viewBox={`0 0 440 ${H}`} preserveAspectRatio="xMidYMax slice" style={{ display: "block" }}>
          <defs>
            <linearGradient id="tr-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PAL.leaf} stopOpacity="0" />
              <stop offset="100%" stopColor={PAL.leaf} stopOpacity={0.30 * P.foliage} />
            </linearGradient>
          </defs>
          <rect x="0" y={H - 280} width="440" height="280" fill="url(#tr-ground)" />

          {/* ornamental grasses — autumn brings these forward */}
          {P.grass > 0.08 && [34, 127, 205, 313, 401].map((gx, i) => (
            <g key={gx} style={{ transformOrigin: `${gx}px ${H}px`, animation: `grasslean ${17 + i * 3}s ease-in-out infinite`, animationDelay: `${-i * 4}s` }} opacity={P.grass}>
              {[-9, -3, 3, 9].map((off, j) => (
                <path key={j} d={`M${gx + off} ${H} C ${gx + off + off * 0.6} ${H - 42}, ${gx + off * 2.4} ${H - 70}, ${gx + off * 3.6} ${H - 98 - j * 7}`}
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

      {/* bees, wandering among the flowers — daytime only */}
      {!dark && BEES.slice(0, P.bees).map((b, i) => (
        <div key={i} style={{ position: "absolute", left: b.left, bottom: b.bottom, opacity: b.o * (0.6 + P.foliage * 0.4),
          transform: `scale(${b.scale})`, animation: `meander ${b.dur}s ease-in-out infinite`, animationDelay: `${b.delay}s` }}>
          <div style={{ animation: "beewing 0.9s ease-in-out infinite" }}>
            <Bee body={PAL.accent} wing="#6B5A46" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { CELESTIAL, SEASON, seasonPalette }
