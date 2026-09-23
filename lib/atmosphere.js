// True Reverie atmosphere — permanent daylight.
// Time-of-day/night rendering was intentionally removed. Seasons remain.

const SEASON_STARTS = [
  { k: "winter", m: 11, d: 21 },
  { k: "spring", m: 2, d: 20 },
  { k: "summer", m: 5, d: 21 },
  { k: "autumn", m: 8, d: 22 },
]
const BLEND_DAYS = 12
const SEASON = (now) => {
  const y = now.getFullYear(), cands = []
  for (const off of [-1,0,1]) for (const s of SEASON_STARTS)
    cands.push({ k:s.k, t:new Date(y+off,s.m,s.d).getTime() })
  cands.sort((a,b)=>a.t-b.t)
  const t=now.getTime(); let i=0
  for (let j=0;j<cands.length;j++) if (cands[j].t<=t) i=j
  const cur=cands[i], prev=cands[i-1]||cands[i]
  const w=Math.max(0,Math.min(1,(t-cur.t)/86400000/BLEND_DAYS))
  return { from:prev.k,to:cur.k,w,dominant:w<.5?prev.k:cur.k }
}
const SEASONS = {
  spring:{leaf:"#8FB574",stem:"#7FA054",rose:"#E9799F",lily:"#F0D2E6",hib:"#D08BB6",accent:"#E8C15E",bloom:.86,foliage:.80,warmth:.04,cool:0,fresh:.16,grass:0,leaves:0,wings:5,bees:2,birds:1,pollenO:.85},
  summer:{leaf:"#7BA85F",stem:"#6E9E5A",rose:"#DA618B",lily:"#E9C7DE",hib:"#C97BA8",accent:"#E0A253",bloom:1,foliage:1,warmth:.14,cool:0,fresh:.04,grass:0,leaves:0,wings:6,bees:2,birds:1,pollenO:1},
  autumn:{leaf:"#A29558",stem:"#8E8552",rose:"#C9557F",lily:"#E3BBD6",hib:"#B36B9C",accent:"#D9903F",bloom:.88,foliage:.86,warmth:.30,cool:0,fresh:0,grass:1,leaves:1,wings:3,bees:1,birds:2,pollenO:.70},
  winter:{leaf:"#93A199",stem:"#8797A0",rose:"#B98BA6",lily:"#DCD3E4",hib:"#A98BB4",accent:"#BFC6CE",bloom:.46,foliage:.52,warmth:0,cool:.22,fresh:0,grass:.4,leaves:0,wings:1,bees:0,birds:1,pollenO:.45},
}
const hx=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]
const mixHex=(a,b,t)=>{const A=hx(a),B=hx(b);return "#"+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*t).toString(16).padStart(2,"0")).join("")}
const mixNum=(a,b,t)=>a+(b-a)*t
const seasonPalette=(now=new Date())=>{const s=SEASON(now),A=SEASONS[s.from],B=SEASONS[s.to],o={season:s.dominant,from:s.from,to:s.to,w:s.w};for(const k of ["leaf","stem","rose","lily","hib","accent"])o[k]=mixHex(A[k],B[k],s.w);for(const k of ["bloom","foliage","warmth","cool","fresh","grass","leaves","pollenO"])o[k]=mixNum(A[k],B[k],s.w);for(const k of ["wings","bees","birds"])o[k]=Math.round(mixNum(A[k],B[k],s.w));return o}
const CELESTIAL=()=>({day:true,x:72,y:58,p:.62})

export function Sky({ tint }) {
  const S=seasonPalette()
  return <div style={{position:"absolute",top:0,left:0,right:0,height:460,pointerEvents:"none",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,right:0,height:270,background:"linear-gradient(180deg,rgba(240,200,120,0.16),rgba(240,200,120,0))"}} />
    {S.warmth>.01&&<div style={{position:"absolute",top:0,left:0,right:0,height:330,background:`linear-gradient(180deg,rgba(224,162,83,${(S.warmth*.30).toFixed(3)}),rgba(224,162,83,0) 70%)`}} />}
    {S.cool>.01&&<div style={{position:"absolute",top:0,left:0,right:0,height:350,background:`linear-gradient(180deg,rgba(176,198,222,${(S.cool*.34).toFixed(3)}),rgba(176,198,222,0) 72%)`}} />}
    {S.fresh>.01&&<div style={{position:"absolute",top:0,left:0,right:0,height:320,background:`linear-gradient(180deg,rgba(186,216,178,${(S.fresh*.30).toFixed(3)}),rgba(186,216,178,0) 68%)`}} />}
    {tint&&<div style={{position:"absolute",top:0,left:0,right:0,height:340,background:tint}} />}
    <div style={{position:"absolute",top:58,left:"72%",marginLeft:-50,width:100,height:100,borderRadius:"50%",background:"radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)"}} />
  </div>
}

export function Garden() {
  const P=seasonPalette()
  return <div style={{position:"absolute",left:0,right:0,bottom:0,height:220,pointerEvents:"none",overflow:"hidden",opacity:.55,
    background:`linear-gradient(0deg,${P.leaf}33 0%,${P.leaf}12 38%,transparent 100%)`}}>
    <svg width="100%" height="220" viewBox="0 0 440 220" preserveAspectRatio="xMidYMax slice">
      {[25,68,112,158,205,251,298,346,395,430].map((x,i)=><g key={x}>
        <path d={`M${x} 220 C ${x+(i%2?8:-8)} 175, ${x+(i%2?-5:5)} 130, ${x} ${92+(i%4)*18}`} stroke={P.stem} strokeWidth="2" fill="none" opacity={P.foliage}/>
        <circle cx={x} cy={92+(i%4)*18} r={5+P.bloom*5} fill={i%3===0?P.rose:i%3===1?P.lily:P.hib} opacity={.75}/>
      </g>)}
    </svg>
  </div>
}
export { CELESTIAL, SEASON, seasonPalette }
