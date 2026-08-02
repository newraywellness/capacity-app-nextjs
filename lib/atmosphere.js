// ============ ATMOSPHERE ============
// The environment around the interface: sky, sun/moon, drifting life, and the
// garden the page settles into. Everything here is decorative and inert —
// pointer-events are off throughout, and nothing reads or writes app state.
//
// Two rules govern this file:
//   1. Motion is slow enough to be felt rather than watched. Nothing loops
//      faster than ~14s, most things are far slower.
//   2. Positions are deterministic, never random. A creature must not jump to a
//      new place every time React re-renders.

// Where the sun or moon sits right now. Deliberately a modest arc — the point is
// that the world has moved since this morning, not that it performs an arc.
//   Sun  05:00 → 18:00      Moon 18:00 → 05:00
const CELESTIAL = (hour, minute) => {
  const t = hour + (minute || 0) / 60
  const day = t >= 5 && t < 18
  const p = day ? (t - 5) / 13 : (t >= 18 ? t - 18 : t + 6) / 11
  const clamped = Math.max(0, Math.min(1, p))
  return {
    day,
    x: 24 + clamped * 52,                              // 24% → 76% across
    y: 116 - Math.sin(Math.PI * clamped) * 44,         // dips to ~72 at its height
    p: clamped,
  }
}

// Butterflies and bees by day. Fixed lanes, long crossings, staggered by negative
// delay so they're already mid-flight when the page opens.
const CREATURES = [
  { top: 128, dur: 52, delay: -6,  scale: 1.00, a: "#C489E0", b: "#E984B4", o: 0.5 },
  { top: 232, dur: 74, delay: -30, scale: 0.72, a: "#E9B4C9", b: "#D98FB4", o: 0.4 },
  { top: 316, dur: 61, delay: -47, scale: 0.86, a: "#B9A0D8", b: "#E98FA8", o: 0.42 },
  { top: 186, dur: 88, delay: -14, scale: 0.62, a: "#E8C48A", b: "#E0A253", o: 0.38 },
  { top: 372, dur: 67, delay: -58, scale: 0.78, a: "#CFA3DE", b: "#E984B4", o: 0.34 },
]

// Pollen catching the light. Tiny, slow, mostly invisible — which is the point.
const POLLEN = [
  { left: "18%", top: 210, dur: 34, delay: -4,  size: 3 },
  { left: "63%", top: 268, dur: 44, delay: -19, size: 2 },
  { left: "37%", top: 322, dur: 39, delay: -27, size: 2.5 },
  { left: "81%", top: 176, dur: 48, delay: -11, size: 2 },
  { left: "50%", top: 356, dur: 41, delay: -33, size: 3 },
  { left: "26%", top: 292, dur: 52, delay: -22, size: 2 },
  { left: "72%", top: 338, dur: 37, delay: -40, size: 2.5 },
]

// Fireflies after dark. They breathe rather than blink.
const FIREFLIES = [
  { left: "14%", top: 226, dur: 9.5,  delay: -1, size: 6, glow: 11 },
  { left: "78%", top: 302, dur: 12,   delay: -5, size: 5, glow: 9 },
  { left: "42%", top: 348, dur: 10.5, delay: -8, size: 5, glow: 10 },
  { left: "63%", top: 196, dur: 13.5, delay: -3, size: 4, glow: 8 },
  { left: "28%", top: 386, dur: 11,   delay: -6, size: 5, glow: 9 },
]

const STARS_EVENING = [
  { top: 40,  left: "16%", size: 9,   dur: 3.0 },
  { top: 110, left: "38%", size: 7,   dur: 4.4 },
  { top: 84,  right: "32%", size: 8,  dur: 3.7 },
  { top: 152, left: "70%", size: 6,   dur: 5.1 },
]
const STARS_NIGHT = STARS_EVENING.concat([
  { top: 62,  left: "52%", size: 7,   dur: 4.1 },
  { top: 196, left: "24%", size: 6,   dur: 5.6 },
  { top: 128, right: "14%", size: 8,  dur: 3.4 },
  { top: 224, right: "38%", size: 6,  dur: 4.8 },
])

const Butterfly = ({ a, b }) => (
  <svg width="30" height="23" viewBox="0 0 34 26">
    <path d="M17 13 C 10 2, 1 4, 3 12 C 4 18, 12 18, 17 13" fill={a} />
    <path d="M17 13 C 24 2, 33 4, 31 12 C 30 18, 22 18, 17 13" fill={b} />
  </svg>
)

// ── SKY ─────────────────────────────────────────────────────────────────────
// The upper region. Kept deliberately empty apart from light, one celestial
// body, and whatever is drifting through.
export function Sky({ mode, tint }) {
  const now = new Date()
  const sky = CELESTIAL(now.getHours(), now.getMinutes())
  const dark = mode === "evening" || mode === "night"
  const night = mode === "night"

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 460, pointerEvents: "none", overflow: "hidden" }}>

      {/* warm light from above — unchanged in character, only the wash differs by mode */}
      {mode === "morning" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 230, background: "linear-gradient(180deg,rgba(240,200,120,0.18),rgba(240,200,120,0))" }} />}
      {mode === "afternoon" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 270, background: "linear-gradient(180deg,rgba(240,170,90,0.20),rgba(240,170,90,0))" }} />}
      {mode === "evening" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250, background: "linear-gradient(180deg,rgba(240,200,121,0.10),rgba(240,200,121,0))" }} />}
      {night && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 300, background: "linear-gradient(180deg,rgba(190,205,255,0.10),rgba(190,205,255,0))" }} />}

      {/* capacity tint — felt more than seen */}
      {tint && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340, background: tint }} />}

      {/* ── the sun. Same light we already had; it simply sits where the day has put it. ── */}
      {sky.day && (
        <div style={{ position: "absolute", top: sky.y, left: `${sky.x}%`, marginLeft: -50, width: 100, height: 100, borderRadius: "50%",
          background: "radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)",
          animation: "breathe 6s ease-in-out infinite" }} />
      )}

      {/* ── the moon. Larger and brighter once it becomes the only thing up there. ── */}
      {!sky.day && (
        <svg style={{ position: "absolute", top: sky.y - 6, left: `${sky.x}%`, marginLeft: night ? -30 : -22, opacity: night ? 1 : 0.9,
          filter: night ? "drop-shadow(0 0 18px rgba(240,227,184,0.42))" : "drop-shadow(0 0 10px rgba(240,227,184,0.28))" }}
          width={night ? 60 : 44} height={night ? 60 : 44} viewBox="0 0 40 40">
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
          fontSize: s.size, opacity: night ? 0.95 : 0.8, animation: `twinkle ${s.dur}s ease-in-out infinite` }}>{"\u2726"}</div>
      ))}

      {/* ── daytime life: butterflies and bees crossing, pollen rising ── */}
      {!dark && CREATURES.map((c, i) => (
        <div key={i} style={{ position: "absolute", top: c.top, left: 0, opacity: c.o, transform: `scale(${c.scale})`,
          animation: `crossing ${c.dur}s linear infinite`, animationDelay: `${c.delay}s` }}>
          <div style={{ animation: "flutter 2.6s ease-in-out infinite" }}><Butterfly a={c.a} b={c.b} /></div>
        </div>
      ))}
      {!dark && POLLEN.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: "50%",
          background: "rgba(255,255,255,0.85)", animation: `pollen ${p.dur}s ease-in-out infinite`, animationDelay: `${p.delay}s` }} />
      ))}

      {/* ── after dark: fireflies ── */}
      {dark && FIREFLIES.map((f, i) => (
        <div key={i} style={{ position: "absolute", left: f.left, top: f.top, width: f.size, height: f.size, borderRadius: "50%",
          background: "#F5D98A", boxShadow: `0 0 ${f.glow}px ${f.glow / 2.6}px rgba(240,200,121,0.5)`,
          animation: `firefly ${f.dur}s ease-in-out infinite`, animationDelay: `${f.delay}s` }} />
      ))}
    </div>
  )
}

// ── GARDEN ──────────────────────────────────────────────────────────────────
// The page settles into this rather than being framed by it. Soft stems and a
// few blooms at the very bottom, well behind the content. At night the flowers
// close and the whole thing dims.
export function Garden({ mode }) {
  const night = mode === "night"
  const dark = mode === "evening" || night
  const o = night ? 0.16 : dark ? 0.24 : 0.32
  const stem = dark ? "#6E7F63" : "#7FA054"
  const leaf = dark ? "#5E7357" : "#87A96B"
  const rose = dark ? "#8E5A72" : "#DA618B"
  const lily = dark ? "#9A7FA8" : "#E9C7DE"
  const hib = dark ? "#8A6A86" : "#C97BA8"
  const bloom = night ? 0.55 : 1        // flowers close overnight

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, pointerEvents: "none", opacity: o, overflow: "hidden" }}>
      <svg width="100%" height="300" viewBox="0 0 440 300" preserveAspectRatio="xMidYMax slice" style={{ display: "block" }}>
        {/* ground haze — where the page becomes garden */}
        <defs>
          <linearGradient id="tr-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={leaf} stopOpacity="0" />
            <stop offset="100%" stopColor={leaf} stopOpacity="0.30" />
          </linearGradient>
        </defs>
        <rect x="0" y="120" width="440" height="180" fill="url(#tr-ground)" />

        {/* stems — each sways on its own slow rhythm */}
        <g style={{ transformOrigin: "60px 300px", animation: "sway 16s ease-in-out infinite" }}>
          <path d="M60 300 C 56 250, 66 216, 58 184" stroke={stem} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M60 262 C 44 254, 38 240, 40 232 C 52 232, 60 246, 60 262 Z" fill={leaf} />
          <g transform={`translate(58,184) scale(${bloom})`}>
            <circle cx="0" cy="0" r="9" fill={rose} opacity="0.9" />
            <circle cx="0" cy="0" r="5" fill={rose} />
            <circle cx="-6" cy="-4" r="5" fill={rose} opacity="0.75" />
            <circle cx="6" cy="-4" r="5" fill={rose} opacity="0.75" />
          </g>
        </g>

        <g style={{ transformOrigin: "158px 300px", animation: "sway 21s ease-in-out infinite", animationDelay: "-4s" }}>
          <path d="M158 300 C 162 246, 152 214, 160 170" stroke={stem} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M158 250 C 176 244, 184 230, 182 220 C 168 222, 158 236, 158 250 Z" fill={leaf} />
          {/* lily */}
          <g transform={`translate(160,170) scale(${bloom})`}>
            <path d="M0 0 C -12 -6, -14 -20, -3 -22 C -1 -14, 0 -6, 0 0 Z" fill={lily} />
            <path d="M0 0 C 12 -6, 14 -20, 3 -22 C 1 -14, 0 -6, 0 0 Z" fill={lily} />
            <path d="M0 0 C -6 -14, 0 -26, 6 -22 C 4 -12, 1 -5, 0 0 Z" fill={lily} opacity="0.85" />
          </g>
        </g>

        <g style={{ transformOrigin: "268px 300px", animation: "sway 18s ease-in-out infinite", animationDelay: "-9s" }}>
          <path d="M268 300 C 264 254, 274 224, 266 196" stroke={stem} strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M268 258 C 250 252, 244 238, 246 228 C 258 230, 268 244, 268 258 Z" fill={leaf} />
          {/* hibiscus */}
          <g transform={`translate(266,196) scale(${bloom})`}>
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-8" rx="6" ry="9" fill={hib} opacity="0.85" transform={`rotate(${r})`} />
            ))}
            <circle cx="0" cy="0" r="3" fill={dark ? "#C9A46A" : "#E0A253"} />
          </g>
        </g>

        <g style={{ transformOrigin: "356px 300px", animation: "sway 24s ease-in-out infinite", animationDelay: "-13s" }}>
          <path d="M356 300 C 360 252, 350 226, 358 202" stroke={stem} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M356 254 C 374 248, 382 234, 380 224 C 366 226, 356 240, 356 254 Z" fill={leaf} />
          <g transform={`translate(358,202) scale(${bloom})`}>
            <circle cx="0" cy="0" r="7" fill={rose} opacity="0.85" />
            <circle cx="0" cy="0" r="3.5" fill={rose} />
          </g>
        </g>

        {/* low foliage across the base */}
        <g style={{ transformOrigin: "220px 300px", animation: "sway 27s ease-in-out infinite", animationDelay: "-6s" }}>
          <path d="M12 300 C 18 268, 34 254, 44 250 C 38 268, 28 286, 24 300 Z" fill={leaf} opacity="0.7" />
          <path d="M108 300 C 112 274, 126 262, 136 258 C 130 274, 122 288, 118 300 Z" fill={leaf} opacity="0.55" />
          <path d="M206 300 C 200 272, 186 258, 176 254 C 182 272, 192 288, 196 300 Z" fill={leaf} opacity="0.6" />
          <path d="M312 300 C 318 274, 332 262, 342 258 C 336 274, 326 288, 322 300 Z" fill={leaf} opacity="0.5" />
          <path d="M408 300 C 402 270, 388 256, 378 252 C 384 270, 394 286, 398 300 Z" fill={leaf} opacity="0.65" />
        </g>
      </svg>
    </div>
  )
}

export { CELESTIAL }
