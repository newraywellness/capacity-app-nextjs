// ============ BLOOM ATMOSPHERE ============
// Today is open nature. Nourish is a kitchen garden. Bloom is a conservatory
// beside a waterfall — curated rather than wild, and the only place in True
// Reverie that quietly marks holidays.
//
// Season, capacity tint and time of day all come from the SAME shared engine
// the other tabs use. Bloom only interprets those signals differently. The
// holiday layer is additive and Bloom-only: strip every holiday away and the
// seasonal environment still stands complete on its own.

import { seasonPalette } from './atmosphere'

// ── BACKGROUND ──────────────────────────────────────────────────────────────
// Very pale blue easing to almost-white. Airier than Today, cooler than Nourish.
const BLOOM_BG = (mode) => ({
  morning:   "linear-gradient(180deg,#FBFDFF 0%,#F3F9FD 34%,#EAF3FA 68%,#E2EDF6 100%)",
  afternoon: "linear-gradient(180deg,#FAFDFF 0%,#F0F8FD 32%,#E6F1FA 66%,#DCEBF7 100%)",
  evening:   "linear-gradient(180deg,#F2F1F8 0%,#E9E6F2 34%,#DFDCEC 68%,#D5D3E6 100%)",
  night:     "linear-gradient(180deg,#1E2436 0%,#252C41 36%,#2D354C 70%,#353E57 100%)",
}[mode] || "linear-gradient(180deg,#FBFDFF 0%,#F3F9FD 34%,#EAF3FA 68%,#E2EDF6 100%)")

// ── PALETTE ─────────────────────────────────────────────────────────────────
const B0 = {
  leaf: "#8FAE8A", leafDeep: "#6E8F6B", vine: "#7F9E7A",
  rose: "#FFFFFF", roseShade: "#EFE7EA", jasmine: "#FFFDF8", jasmineCore: "#F0D28A",
  hydrangea: "#DCE6F2", hydrangeaDeep: "#C3D4E8",
  water: "#DCEBF5", waterDeep: "#B8D4E8", foam: "#FFFFFF",
  blush: "#F2C4CE", copper: "#C98A5B", amber: "#E0A253",
  cedar: "#6F8A70", light: "#FFF6DC", ink: "#3A3348",
}
const _hx = (h) => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]
const mixb = (a,b,t) => "#" + [0,1,2].map((i)=>Math.round(_hx(a)[i]+(_hx(b)[i]-_hx(a)[i])*t).toString(16).padStart(2,"0")).join("")

// Season dials, in conservatory terms. Blended by the shared 12-day engine.
const B_SEASON = {
  spring: { leaf:"#8FBE86", bloom:0.92, lush:0.80, warm:0.02, cool:0.06, leaves:0, gold:0.0 },
  summer: { leaf:"#7BAE72", bloom:1.00, lush:1.00, warm:0.10, cool:0.00, leaves:0, gold:0.0 },
  autumn: { leaf:"#A79A62", bloom:0.72, lush:0.86, warm:0.26, cool:0.00, leaves:1, gold:0.7 },
  winter: { leaf:"#8CA396", bloom:0.44, lush:0.58, warm:0.00, cool:0.22, leaves:0, gold:0.2 },
}
const bloomSeason = () => {
  const S = seasonPalette(new Date())
  const A = B_SEASON[S.from], C = B_SEASON[S.to], w = S.w
  const n = (k) => A[k] + (C[k] - A[k]) * w
  return { leaf: mixb(A.leaf, C.leaf, w), bloom:n("bloom"), lush:n("lush"),
           warm:n("warm"), cool:n("cool"), leaves:n("leaves"), gold:n("gold"), season: S.dominant }
}

// ── HOLIDAYS ────────────────────────────────────────────────────────────────
// Bloom-only. Each accent fades in over three days and ends on its final date,
// so it peaks exactly when it should rather than trailing off beforehand.
const easterSunday = (y) => {
  const a=y%19, b=Math.floor(y/100), c=y%100
  const d=Math.floor(b/4), e=b%4, f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3)
  const h=(19*a+b-d-g+15)%30, i=Math.floor(c/4), k=c%4
  const l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451)
  const mo=Math.floor((h+l-7*m+114)/31), da=((h+l-7*m+114)%31)+1
  return new Date(y, mo-1, da)
}

const HOLIDAYS = (now) => {
  const y=now.getFullYear(), t=now.getTime(), DAY=86400000
  const D=(m,d)=>new Date(y,m,d).getTime()
  const est=easterSunday(y).getTime()
  const win=[
    ["valentines", D(1,1),  D(1,14)],
    ["easter",     est-14*DAY, est],
    ["harvest",    D(9,1),  D(9,31)],
    ["halloween",  D(9,24), D(9,31)],
    ["thanks",     D(10,20),D(10,30)],
    ["christmas",  D(11,1), D(11,31)],
    ["newyear",    D(0,1),  D(0,10)],
  ]
  const out={}
  for(const [k,a,b] of win){
    if(t<a||t>b+DAY) continue
    out[k]=Math.max(0, Math.min(1, (t-a)/(3*DAY)))
  }
  return out
}

// ── MOTION ──────────────────────────────────────────────────────────────────
const BloomStyle = () => (
  <style>{`
    @keyframes bwFall   { 0% { transform: translateY(-14%); } 100% { transform: translateY(14%); } }
    @keyframes bwShim   { 0%,100% { opacity: .35; } 50% { opacity: .7; } }
    @keyframes bwRipple { 0% { transform: scaleX(.7); opacity: .5; } 100% { transform: scaleX(1.5); opacity: 0; } }
    @keyframes bVine    { 0%,100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
    @keyframes bVine2   { 0%,100% { transform: rotate(.9deg); } 50% { transform: rotate(-.9deg); } }
    @keyframes bPetal   { 0% { transform: translate(0,-20px) rotate(0deg); opacity: 0; } 14% { opacity: .75; } 86% { opacity: .5; } 100% { transform: translate(38px,300px) rotate(var(--pr,180deg)); opacity: 0; } }
    @keyframes bBird    { 0% { transform: translateX(-40px) translateY(0); opacity: 0; } 6% { opacity: .3; } 94% { opacity: .26; } 100% { transform: translateX(500px) translateY(-22px); opacity: 0; } }
    @keyframes bGlow    { 0%,100% { opacity: .45; } 50% { opacity: .9; } }
    @keyframes bMist   { 0%,100% { opacity: .18; transform: translateY(0) scaleX(1); } 50% { opacity: .42; transform: translateY(-6px) scaleX(1.09); } }
    @keyframes bSheen  { 0% { transform: translateY(-100%); } 100% { transform: translateY(220%); } }
    @keyframes bFlow   { 0% { transform: translateY(-24%); } 100% { transform: translateY(24%); } }
    @keyframes bSpark   { 0%,100% { opacity: .15; transform: scale(.7); } 50% { opacity: .85; transform: scale(1); } }
  `}</style>
)

const PETALS = [
  { left:"12%", dur:34, delay:-3,  size:7, rot:200 },
  { left:"46%", dur:44, delay:-19, size:5, rot:-160 },
  { left:"78%", dur:39, delay:-28, size:6, rot:240 },
  { left:"63%", dur:52, delay:-11, size:5, rot:-200 },
]

// ── AIR ─────────────────────────────────────────────────────────────────────
// Upper region: light, vines entering from the corners, drifting petals,
// a rare bird, and any holiday accent that belongs up high.
export function BloomAir({ mode, tint }) {
  const night = mode === "night"
  const dark = mode === "evening" || night
  const S = bloomSeason()
  const H = HOLIDAYS(new Date())
  const t = (hex) => (dark ? mixb(hex, night ? "#2B3348" : "#6B6478", night ? 0.5 : 0.26) : hex)
  const leaf = t(mixb(B0.leaf, S.leaf, 0.55)), vine = t(mixb(B0.vine, S.leaf, 0.45))
  const petalCol = H.valentines ? t(B0.blush) : t(B0.rose)

  const Vine = ({ flip }) => (
    <svg width="150" height="180" viewBox="0 0 150 180" style={{ display: "block", transform: flip ? "scaleX(-1)" : "none" }}>
      <path d="M2 2 C 46 16, 74 44, 88 84 C 96 108, 100 134, 98 160" stroke={vine} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M2 2 C 34 34, 44 62, 46 96" stroke={vine} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {[[30,22],[52,44],[70,72],[84,104],[92,136],[26,52],[40,78]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="11" ry="6" fill={leaf} opacity={(0.55+((i%3)*0.12))*S.lush}
          transform={`rotate(${i%2?34:-30} ${x} ${y})`} />
      ))}
      {S.bloom>0.2 && [[58,52],[86,92],[96,146]].map(([x,y],i)=>(
        <g key={"b"+i} transform={`translate(${x},${y})`} opacity={S.bloom*(dark?0.7:1)}>
          {[0,72,144,216,288].map((r)=>(
            <ellipse key={r} cx="0" cy="-4.5" rx="3" ry="4.5" fill={t(B0.jasmine)} transform={`rotate(${r})`} />
          ))}
          <circle cx="0" cy="0" r="1.8" fill={t(B0.jasmineCore)} />
        </g>
      ))}
    </svg>
  )

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 460, pointerEvents: "none", overflow: "hidden" }}>
      <BloomStyle />

      {/* light by time of day */}
      {mode === "morning" && <div style={{ position:"absolute", top:0, left:0, right:0, height:250, background:"linear-gradient(180deg,rgba(255,240,205,0.20),rgba(255,240,205,0))" }} />}
      {mode === "afternoon" && <div style={{ position:"absolute", top:0, left:0, right:0, height:280, background:"linear-gradient(180deg,rgba(214,238,255,0.26),rgba(214,238,255,0))" }} />}
      {mode === "evening" && <div style={{ position:"absolute", top:0, left:0, right:0, height:250, background:"linear-gradient(180deg,rgba(226,196,232,0.18),rgba(226,196,232,0))" }} />}
      {night && <div style={{ position:"absolute", top:0, left:0, right:0, height:300, background:"linear-gradient(180deg,rgba(186,204,244,0.12),rgba(186,204,244,0))" }} />}

      {/* seasonal cast */}
      {S.warm > 0.02 && <div style={{ position:"absolute", top:0, left:0, right:0, height:320, background:`linear-gradient(180deg,rgba(224,162,83,${(S.warm*0.26).toFixed(3)}),rgba(224,162,83,0) 70%)` }} />}
      {S.cool > 0.02 && <div style={{ position:"absolute", top:0, left:0, right:0, height:340, background:`linear-gradient(180deg,rgba(176,198,222,${(S.cool*0.30).toFixed(3)}),rgba(176,198,222,0) 72%)` }} />}

      {/* capacity tint — same signal every tab receives */}
      {tint && <div style={{ position:"absolute", top:0, left:0, right:0, height:320, background:tint }} />}

      {/* climbing vines entering from both upper corners */}
      <div style={{ position:"absolute", top:-14, left:-18, opacity:(dark?0.5:0.62)*S.lush, transformOrigin:"0 0", animation:"bVine 26s ease-in-out infinite" }}><Vine /></div>
      <div style={{ position:"absolute", top:-22, right:-24, opacity:(dark?0.44:0.55)*S.lush, transformOrigin:"100% 0", animation:"bVine2 31s ease-in-out infinite", animationDelay:"-8s" }}><Vine flip /></div>

      {/* drifting petals */}
      {PETALS.map((p,i)=>(
        <div key={i} style={{ position:"absolute", left:p.left, top:0, "--pr":`${p.rot}deg`, opacity:dark?0.5:0.8,
          animation:`bPetal ${p.dur}s linear infinite`, animationDelay:`${p.delay}s` }}>
          <svg width={p.size} height={p.size*1.4} viewBox="0 0 10 14">
            <path d="M5 0 C 9 4, 9 10, 5 14 C 1 10, 1 4, 5 0 Z" fill={petalCol} />
          </svg>
        </div>
      ))}

      {/* an occasional bird, high and brief */}
      {!night && (
        <div style={{ position:"absolute", top:64, left:0, animation:"bBird 210s linear infinite", animationDelay:"-40s" }}>
          <svg width="22" height="9" viewBox="0 0 24 10">
            <path d="M1 6 C 4 1, 8 1, 11 5 C 14 1, 18 1, 22 6" stroke={t("#7C8AA0")} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* ── holiday accents that belong up high ── */}
      {H.christmas > 0 && [26,92,158,224,290,356,414].map((x,i)=>(
        <div key={"xl"+i} style={{ position:"absolute", top:16+((i%3)*7), left:x, width:5, height:5, borderRadius:"50%",
          background:"#FFF3D0", boxShadow:"0 0 9px 3px rgba(255,240,200,0.55)", opacity:H.christmas,
          animation:`bGlow ${5+(i%4)}s ease-in-out infinite`, animationDelay:`${-i*0.8}s` }} />
      ))}
      {H.halloween > 0 && [[42,72],[338,54],[262,96]].map(([x,y],i)=>(
        <div key={"bat"+i} style={{ position:"absolute", left:x, top:y, opacity:H.halloween*(dark?0.75:0.42),
          animation:`bVine${i%2?2:""} ${18+i*4}s ease-in-out infinite` }}>
          <svg width="18" height="9" viewBox="0 0 20 10">
            <path d="M10 7 C 7 2, 3 3, 1 7 C 3 6, 5 7, 6 9 C 7 7, 9 7, 10 7 C 11 7, 13 7, 14 9 C 15 7, 17 6, 19 7 C 17 3, 13 2, 10 7 Z" fill={dark?"#2A2438":"#4A4258"} />
          </svg>
        </div>
      ))}
      {H.valentines > 0 && [[34,148],[398,182],[300,120]].map(([x,y],i)=>(
        <div key={"hrt"+i} style={{ position:"absolute", left:x, top:y, opacity:H.valentines*0.6,
          animation:`bSpark ${6+i*2}s ease-in-out infinite`, animationDelay:`${-i*2}s` }}>
          <svg width="11" height="10" viewBox="0 0 12 11">
            <path d="M6 11 C 1 7, 0 4, 1.6 2 C 3.2 0.2, 5.2 1, 6 2.6 C 6.8 1, 8.8 0.2, 10.4 2 C 12 4, 11 7, 6 11 Z" fill={B0.blush} />
          </svg>
        </div>
      ))}
      {H.newyear > 0 && [[60,120],[210,86],[368,140],[128,196],[300,168]].map(([x,y],i)=>(
        <div key={"ny"+i} style={{ position:"absolute", left:x, top:y, width:4, height:4, borderRadius:"50%",
          background:"#F2E3C0", boxShadow:"0 0 8px 2px rgba(242,227,192,0.6)", opacity:H.newyear,
          animation:`bSpark ${4+i}s ease-in-out infinite`, animationDelay:`${-i*1.3}s` }} />
      ))}
    </div>
  )
}


// ── BOTANICAL ACCENTS ───────────────────────────────────────────────────────
// Separate discoveries down the page rather than one continuous border, and
// each pillar gets its own plant language:
//   Glow → jasmine, peony, white blossom · Reset → lavender, chamomile,
//   eucalyptus · Flourish → olive, rosemary, ivy
// Tops are tuned to the landing's real layout so each sits beside its section.
const ACCENTS = [
  { top: 292, side: "left",  k: "lavender",   w: 74,  o: 0.50, dur: 27, delay: -3  },
  { top: 508, side: "right", k: "jasmine",    w: 86,  o: 0.46, dur: 31, delay: -11 },
  { top: 604, side: "left",  k: "eucalyptus", w: 92,  o: 0.44, dur: 29, delay: -18 },
  { top: 700, side: "right", k: "olive",      w: 88,  o: 0.42, dur: 33, delay: -7  },
  { top: 730, side: "left",  k: "rosemary",   w: 66,  o: 0.38, dur: 28, delay: -14 },
  { top: 816, side: "left",  k: "blossoms",   w: 70,  o: 0.40, dur: 25, delay: -21 },
]

function Accent({ k, w, c, S }) {
  const H = Math.round(w * 1.15)
  const stem = (d, sw) => <path d={d} stroke={c.leafDeep} strokeWidth={sw} fill="none" strokeLinecap="round" opacity="0.85" />

  if (k === "lavender") return (
    <svg width={w} height={H} viewBox="0 0 74 85">
      {stem("M2 84 C 18 62, 30 42, 40 16", 1.7)}
      <ellipse cx="16" cy="62" rx="11" ry="4.5" fill={c.leaf} opacity={0.7 * S.lush} transform="rotate(-32 16 62)" />
      <ellipse cx="28" cy="44" rx="9" ry="4" fill={c.leaf} opacity={0.6 * S.lush} transform="rotate(-38 28 44)" />
      {[0,1,2,3,4,5,6].map((i) => (
        <ellipse key={i} cx={40 - i * 1.2 + (i % 2 ? 2.6 : -2.6)} cy={16 - i * 4.6} rx={3 - i * 0.18} ry={3.9 - i * 0.24}
          fill={c.lav} opacity={(0.85 - i * 0.06) * (0.55 + S.bloom * 0.45)} />
      ))}
    </svg>
  )
  if (k === "jasmine") return (
    <svg width={w} height={H} viewBox="0 0 86 99">
      {stem("M84 98 C 62 78, 44 56, 20 34", 1.7)}
      {[[62,76],[44,56],[28,40]].map(([x,y],i)=>(
        <ellipse key={i} cx={x} cy={y} rx="12" ry="5.5" fill={c.leaf} opacity={(0.72 - i*0.1) * S.lush} transform={`rotate(${34 - i*8} ${x} ${y})`} />
      ))}
      {[[20,34,9],[38,50,7],[56,68,6]].map(([x,y,r],i)=>(
        <g key={"j"+i} transform={`translate(${x},${y}) scale(${(0.55 + S.bloom*0.45).toFixed(2)})`}>
          {[0,72,144,216,288].map((a)=><ellipse key={a} cx="0" cy={-r*0.72} rx={r*0.34} ry={r*0.72} fill={c.jasmine} transform={`rotate(${a})`} />)}
          <circle cx="0" cy="0" r={r*0.24} fill={c.jasmineCore} />
        </g>
      ))}
    </svg>
  )
  if (k === "eucalyptus") return (
    <svg width={w} height={H} viewBox="0 0 92 106">
      {stem("M2 104 C 22 82, 42 58, 66 26", 1.6)}
      {[[14,90],[26,74],[38,58],[50,44],[60,32],[20,80],[32,64],[44,50],[56,36]].map(([x,y],i)=>(
        <circle key={i} cx={x + (i%2?9:-9)} cy={y} r={8.4 - i*0.42} fill={c.euc} opacity={(0.66 - i*0.03) * S.lush} />
      ))}
    </svg>
  )
  if (k === "olive") return (
    <svg width={w} height={H} viewBox="0 0 88 101">
      {stem("M86 99 C 64 80, 44 58, 18 30", 1.6)}
      {[[68,80],[56,66],[44,52],[32,40],[22,30]].map(([x,y],i)=>(
        <g key={i}>
          <ellipse cx={x+10} cy={y-4} rx="11" ry="3.8" fill={c.olive} opacity={0.72 * S.lush} transform={`rotate(${26} ${x+10} ${y-4})`} />
          <ellipse cx={x-8} cy={y+3} rx="10" ry="3.4" fill={c.olive} opacity={0.6 * S.lush} transform={`rotate(${-22} ${x-8} ${y+3})`} />
        </g>
      ))}
      {[[58,72],[38,48]].map(([x,y],i)=>(
        <ellipse key={"o"+i} cx={x} cy={y} rx="3.4" ry="4.6" fill={c.oliveFruit} opacity={0.75 * S.bloom} />
      ))}
    </svg>
  )
  if (k === "rosemary") return (
    <svg width={w} height={H} viewBox="0 0 66 76">
      {stem("M2 75 C 16 56, 28 36, 38 10", 1.5)}
      {[0,1,2,3,4,5,6,7,8].map((i) => {
        const x = 2 + i * 4.2, y = 75 - i * 7.4, d = i % 2 ? 1 : -1
        return <path key={i} d={`M${x} ${y} L ${x + d * 8} ${y - 5}`} stroke={c.rosemary} strokeWidth="1.6" strokeLinecap="round" opacity={0.8 * S.lush} />
      })}
    </svg>
  )
  if (k === "blossoms") return (
    <svg width={w} height={H} viewBox="0 0 70 81">
      {stem("M2 80 C 14 62, 26 46, 34 26", 1.5)}
      <ellipse cx="14" cy="60" rx="10" ry="4.2" fill={c.leaf} opacity={0.62 * S.lush} transform="rotate(-30 14 60)" />
      {[[34,26,8],[22,42,6],[46,36,5.5],[30,14,5]].map(([x,y,r],i)=>(
        <g key={i} transform={`translate(${x},${y}) scale(${(0.55 + S.bloom*0.45).toFixed(2)})`}>
          {[0,72,144,216,288].map((a)=><ellipse key={a} cx="0" cy={-r*0.62} rx={r*0.3} ry={r*0.62} fill={i%2?c.rose:c.jasmine} transform={`rotate(${a})`} />)}
          <circle cx="0" cy="0" r={r*0.22} fill={c.jasmineCore} />
        </g>
      ))}
    </svg>
  )
  return null
}

// Separate botanical moments down the length of the page, plus two large,
// soft, out-of-focus leaves that give the page a sense of near and far.
export function BloomAccents({ mode }) {
  const night = mode === "night"
  const dark = mode === "evening" || night
  const S = bloomSeason()
  const t = (hex) => (dark ? mixb(hex, night ? "#2B3348" : "#6B6478", night ? 0.5 : 0.26) : hex)
  const c = {
    leaf: t(mixb(B0.leaf, S.leaf, 0.55)), leafDeep: t(mixb(B0.leafDeep, S.leaf, 0.4)),
    jasmine: t(B0.jasmine), jasmineCore: t(B0.jasmineCore), rose: t(B0.rose),
    lav: t("#B9A3D4"), euc: t("#A8BFB4"), olive: t("#8A9A6B"), oliveFruit: t("#6E7F52"), rosemary: t("#7E9A76"),
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {ACCENTS.map((a, i) => (
        <div key={i} style={{ position: "absolute", top: a.top, [a.side]: -14, opacity: a.o * (dark ? 0.7 : 1),
          transformOrigin: a.side === "left" ? "0% 100%" : "100% 100%",
          animation: `${i % 2 ? "bVine2" : "bVine"} ${a.dur}s ease-in-out infinite`, animationDelay: `${a.delay}s` }}>
          <div style={{ transform: a.side === "right" ? "none" : "none" }}>
            <Accent k={a.k} w={a.w} c={c} S={S} />
          </div>
        </div>
      ))}

      {/* foreground depth — large, soft and out of focus at the very edges */}
      <div style={{ position: "absolute", top: 168, left: -46, opacity: dark ? 0.09 : 0.13, filter: "blur(1.4px)",
        transformOrigin: "0% 50%", animation: "bVine 38s ease-in-out infinite" }}>
        <svg width="150" height="96" viewBox="0 0 150 96">
          <path d="M0 48 C 40 6, 104 4, 148 30 C 108 66, 44 90, 0 48 Z" fill={c.leaf} />
          <path d="M0 48 C 50 40, 104 30, 148 30" stroke={c.leafDeep} strokeWidth="1.6" fill="none" opacity="0.5" />
        </svg>
      </div>
      <div style={{ position: "absolute", top: 636, right: -54, opacity: dark ? 0.08 : 0.12, filter: "blur(1.6px)",
        transformOrigin: "100% 50%", animation: "bVine2 44s ease-in-out infinite", animationDelay: "-12s" }}>
        <svg width="164" height="104" viewBox="0 0 164 104">
          <path d="M164 52 C 120 8, 54 6, 6 34 C 50 72, 118 96, 164 52 Z" fill={c.leaf} />
          <path d="M164 52 C 110 44, 54 34, 6 34" stroke={c.leafDeep} strokeWidth="1.6" fill="none" opacity="0.5" />
        </svg>
      </div>
    </div>
  )
}

// ── SCENE ───────────────────────────────────────────────────────────────────
// Lower region: a distant waterfall glimpsed through foliage, then the curated
// planting, then whatever the calendar has quietly added at ground level.
const GH = 440
const BY = GH - 104        // where the planting roots; ground continues below

export function BloomScene({ mode, subtle }) {
  const night = mode === "night"
  const dark = mode === "evening" || night
  const S = bloomSeason()
  const H = HOLIDAYS(new Date())
  const t = (hex) => (dark ? mixb(hex, night ? "#2B3348" : "#6B6478", night ? 0.5 : 0.26) : hex)
  const c = {
    leaf: t(mixb(B0.leaf, S.leaf, 0.55)), leafDeep: t(mixb(B0.leafDeep, S.leaf, 0.4)), vine: t(B0.vine),
    rose: t(B0.rose), roseShade: t(B0.roseShade), jasmine: t(B0.jasmine), jasmineCore: t(B0.jasmineCore),
    hyd: t(B0.hydrangea), hydDeep: t(B0.hydrangeaDeep),
    water: t(B0.water), waterDeep: t(B0.waterDeep), foam: t(B0.foam),
    amber: t(B0.amber), copper: t(B0.copper), cedar: t(B0.cedar), blush: t(B0.blush),
  }
  const o = (night ? 0.20 : dark ? 0.26 : 0.32) * (subtle ? 0.62 : 1)

  // white garden rose — layered petals, no outline
  const Rose = ({ r }) => (
    <g>
      <circle cx="0" cy="0" r={r} fill={c.roseShade} opacity="0.75" />
      <circle cx={-r*0.3} cy={-r*0.22} r={r*0.62} fill={c.rose} />
      <circle cx={r*0.3} cy={-r*0.22} r={r*0.62} fill={c.rose} />
      <circle cx="0" cy={r*0.24} r={r*0.6} fill={c.rose} />
      <circle cx="0" cy="0" r={r*0.3} fill={c.roseShade} opacity="0.6" />
    </g>
  )
  const Hydrangea = ({ r }) => (
    <g>{[[0,-r*.5],[-r*.55,-r*.1],[r*.55,-r*.1],[-r*.3,r*.45],[r*.3,r*.45],[0,0]].map(([x,y],i)=>(
      <g key={i} transform={`translate(${x},${y})`}>
        {[0,90,180,270].map((a)=><ellipse key={a} cx="0" cy={-r*0.2} rx={r*0.2} ry={r*0.24} fill={i%2?c.hyd:c.hydDeep} transform={`rotate(${a})`} />)}
      </g>
    ))}</g>
  )
  const Jasmine = ({ r }) => (
    <g>{[0,72,144,216,288].map((a)=><ellipse key={a} cx="0" cy={-r*0.72} rx={r*0.34} ry={r*0.72} fill={c.jasmine} transform={`rotate(${a})`} />)}
      <circle cx="0" cy="0" r={r*0.24} fill={c.jasmineCore} /></g>
  )

  // curated, not crowded — eleven placements with real gaps
  const PLOT = [
    { x:26,  h:112, k:"rose",  s:24, d:-2,  r:11 },
    { x:78,  h:78,  k:"jas",   s:29, d:-13, r:7 },
    { x:150, h:132, k:"hyd",   s:22, d:-6,  r:12 },
    { x:232, h:86,  k:"jas",   s:31, d:-24, r:6 },
    { x:296, h:120, k:"rose",  s:25, d:-9,  r:10 },
    { x:372, h:70,  k:"hyd",   s:23, d:-16, r:9 },
    { x:428, h:104, k:"rose",  s:26, d:-4,  r:9 },
  ]


  return (
    <div style={{ position:"absolute", left:0, right:0, bottom:0, height:GH, pointerEvents:"none", overflow:"hidden",
      maskImage:"linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 16%,rgba(0,0,0,1) 38%)",
      WebkitMaskImage:"linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 16%,rgba(0,0,0,1) 38%)" }}>

      {/* ── the waterfall — layered flow, mist and reflected light ── */}
      <div style={{ position:"absolute", right:10, top:2, width:118, height:GH-140, opacity:(dark?0.62:0.85)*(subtle?0.72:1), overflow:"hidden", borderRadius:"46% 46% 20% 20%" }}>
        {/* body of water */}
        <div style={{ position:"absolute", inset:0, background:`linear-gradient(180deg,${c.foam} 0%,${c.water} 18%,${c.waterDeep} 62%,${c.water} 100%)`, opacity:0.62 }} />
        {/* broad translucent sheets, each drifting at its own pace */}
        {[[0,44,7.5,0.30],[26,40,9.5,0.26],[54,38,6.5,0.32],[80,38,11,0.24]].map(([l,w,d,op],i)=>(
          <div key={"sheet"+i} style={{ position:"absolute", left:`${l}%`, top:"-26%", width:`${w}%`, height:"152%",
            background:`linear-gradient(180deg,rgba(255,255,255,0) 0%,${c.foam} 26%,${c.foam} 74%,rgba(255,255,255,0) 100%)`,
            opacity:op, animation:`bFlow ${d}s linear infinite`, animationDelay:`${-i*2.2}s` }} />
        ))}
        {/* fine threads for texture */}
        {[8,22,36,50,64,78,90].map((x,i)=>(
          <div key={"th"+i} style={{ position:"absolute", left:`${x}%`, top:"-18%", width:i%2?2:1.4, height:"136%",
            background:`linear-gradient(180deg,rgba(255,255,255,0) 0%,${c.foam} 22%,${c.foam} 78%,rgba(255,255,255,0) 100%)`,
            opacity:0.5, animation:`bwFall ${4.5+i*0.9}s linear infinite`, animationDelay:`${-i*0.8}s` }} />
        ))}
        {/* reflected light sweeping down the face */}
        <div style={{ position:"absolute", left:0, right:0, height:"46%",
          background:"linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,0.5),rgba(255,255,255,0))",
          animation:"bSheen 11s ease-in-out infinite" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0))", animation:"bwShim 7s ease-in-out infinite" }} />
      </div>

      {/* mist where it lands */}
      {[[30,66,20,0],[58,84,26,-3],[16,54,16,-6]].map(([r,w,h,dl],i)=>(
        <div key={"mist"+i} style={{ position:"absolute", right:r, bottom:GH-BY+22+i*9, width:w, height:h, borderRadius:"50%",
          background:"rgba(255,255,255,0.75)", filter:"blur(7px)", opacity:dark?0.3:0.5,
          animation:`bMist ${9+i*3}s ease-in-out infinite`, animationDelay:`${dl}s` }} />
      ))}

      {/* ripples spreading out from the base */}
      {[0,1,2,3].map((i)=>(
        <div key={i} style={{ position:"absolute", right:38, bottom:GH-BY+28+i*8, width:64, height:8, borderRadius:"50%",
          border:`1px solid ${c.foam}`, opacity:0.45, animation:`bwRipple ${4.5+i*1.4}s ease-out infinite`, animationDelay:`${-i*1.3}s` }} />
      ))}

      <div style={{ position:"absolute", inset:0, opacity:o }}>
        <svg width="100%" height={GH} viewBox={`0 0 440 ${GH}`} preserveAspectRatio="xMidYMax slice" style={{ display:"block" }}>
          <defs>
            <linearGradient id="tr-bloomground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.leaf} stopOpacity="0" />
              <stop offset="100%" stopColor={c.leaf} stopOpacity={(0.15*S.lush).toFixed(3)} />
            </linearGradient>
          </defs>
          <rect x="0" y={BY-200} width="440" height={GH-BY+200} fill="url(#tr-bloomground)" />

          {/* the planting */}
          {PLOT.map((p,i)=>{
            const lean = i%2 ? 1 : -1
            return (
              <g key={i} transform={`translate(${p.x},${BY})`}>
                <g style={{ transformOrigin:"0px 0px", animation:`${i%2?"bVine2":"bVine"} ${p.s}s ease-in-out infinite`, animationDelay:`${p.d}s` }}>
                  <path d={`M0 0 C ${lean*4} ${-p.h*0.42}, ${-lean*5} ${-p.h*0.72}, ${lean*2} ${-p.h}`} stroke={c.leafDeep} strokeWidth="1.7" fill="none" strokeLinecap="round" />
                  <ellipse cx={lean*15} cy={-p.h*0.5} rx="13" ry="6.5" fill={c.leaf} opacity={0.8*S.lush} transform={`rotate(${lean*28} ${lean*15} ${-p.h*0.5})`} />
                  <ellipse cx={-lean*12} cy={-p.h*0.72} rx="10" ry="5.5" fill={c.leaf} opacity={0.65*S.lush} transform={`rotate(${-lean*24} ${-lean*12} ${-p.h*0.72})`} />
                  {S.bloom > 0.12 && (
                    <g transform={`translate(${lean*2},${-p.h}) scale(${S.bloom.toFixed(2)})`}>
                      {p.k==="rose" && <Rose r={p.r} />}
                      {p.k==="hyd" && <Hydrangea r={p.r} />}
                      {p.k==="jas" && <Jasmine r={p.r} />}
                    </g>
                  )}
                </g>
              </g>
            )
          })}

          {/* low foliage carrying the planting down behind the tab bar */}
          <g opacity={0.5*S.lush}>
            {[[18,20],[122,24],[236,18],[344,22],[430,18]].map(([mx,mh],i)=>(
              <path key={i} d={`M${mx-30} ${GH} C ${mx-18} ${BY+38-mh}, ${mx} ${BY+26-mh}, ${mx+16} ${BY+32-mh} C ${mx+30} ${BY+50-mh}, ${mx+34} ${GH-10}, ${mx+38} ${GH} Z`}
                fill={i%2?c.leaf:c.leafDeep} opacity={0.5+(i%3)*0.12} />
            ))}
          </g>

          {/* ── ground-level holiday accents ── */}
          {H.harvest > 0 && [[36,20],[92,14],[358,17],[412,12]].map(([x,r],i)=>(
            <g key={"pk"+i} transform={`translate(${x},${BY+30})`} opacity={H.harvest*0.9}>
              <ellipse cx="0" cy="0" rx={r} ry={r*0.82} fill={dark?"#D8D2C4":"#F5F0E4"} />
              <path d={`M${-r*0.5} ${-r*0.5} A ${r*0.62} ${r*0.82} 0 0 0 ${-r*0.5} ${r*0.5}`} stroke={dark?"#C6BFAE":"#E4DCCA"} strokeWidth="1.2" fill="none" />
              <path d={`M${r*0.5} ${-r*0.5} A ${r*0.62} ${r*0.82} 0 0 1 ${r*0.5} ${r*0.5}`} stroke={dark?"#C6BFAE":"#E4DCCA"} strokeWidth="1.2" fill="none" />
              <path d={`M0 ${-r*0.82} L 0 ${-r*1.35}`} stroke={c.copper} strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
          {H.easter > 0 && [[64,9],[196,7],[302,8],[398,7]].map(([x,r],i)=>(
            <ellipse key={"eg"+i} cx={x} cy={BY+34} rx={r} ry={r*1.3} fill={["#F6EFE6","#EDF1F6","#F3EDF4","#F0F4EC"][i%4]} opacity={H.easter*0.9} />
          ))}
          {H.christmas > 0 && [[28,0],[152,1],[286,0],[418,1]].map(([x,f],i)=>(
            <g key={"poin"+i} transform={`translate(${x},${BY+22})`} opacity={H.christmas*0.92}>
              {[0,60,120,180,240,300].map((a)=><ellipse key={a} cx="0" cy="-9" rx="4" ry="9" fill={c.rose} transform={`rotate(${a})`} />)}
              <circle cx="0" cy="0" r="2.6" fill={c.jasmineCore} />
            </g>
          ))}
          {H.thanks > 0 && [[48,0],[236,1],[386,0]].map(([x],i)=>(
            <g key={"th"+i} transform={`translate(${x},${BY+26})`} opacity={H.thanks*0.85}>
              <path d="M-10 0 C -6 -14, 6 -14, 10 0 Z" fill={c.copper} opacity="0.7" />
              <path d="M-6 0 C -3 -9, 3 -9, 6 0 Z" fill={c.amber} opacity="0.6" />
            </g>
          ))}
        </svg>
      </div>

      {/* lanterns glow above the SVG so the light reads warmly */}
      {(H.harvest > 0 || H.thanks > 0 || H.halloween > 0) && [[64,0],[268,1],[404,0]].map(([x],i)=>{
        const hal = (H.halloween || 0) > 0.4
        return (
          <div key={"ln"+i} style={{ position:"absolute", left:x, bottom:GH-BY+8, width:14, height:18, borderRadius:3,
            background: hal ? "rgba(40,34,54,0.85)" : "rgba(60,48,40,0.5)",
            boxShadow:`0 0 18px 7px rgba(${hal?"226,140,60":"240,196,120"},0.4)`,
            opacity:Math.max(H.harvest||0,H.thanks||0,H.halloween||0)*(dark?0.95:0.55),
            animation:`bGlow ${6+i*2}s ease-in-out infinite`, animationDelay:`${-i*2}s` }} />
        )
      })}
    </div>
  )
}

export { BLOOM_BG, HOLIDAYS, bloomSeason }
