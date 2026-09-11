// ============ REBUILD ============
// Rebuild home is a scroll-first discovery surface. Current programs appear
// automatically above discovery; Rituals and Saved live beside Rebuild.

import { REBUILD_PROGRAMS, RITUALS, otherPrograms } from '../data/rebuild.js'
import { DIMENSIONS, DIM_PHRASE, DEFAULT_REACTION, WEEKLY_REVEALS, EXP_BY_ID } from '../data/rebuildProgram.js'
import { BASE } from '../lib/theme.js'

const CAP_TABS = [["green", "I've got room"], ["yellow", "Keep it doable"], ["red", "Make it small"], ["recovery", "Bare minimum"]]

export function renderRebuild(ctx) {
  const {
    checkedIn, pct, rebuildActiveProgram, rebuildCapPick, rebuildFLYA, rebuildView,
    rebuildSection, rebuildCurrent, rebuildSaved, rebuildPlus, rebuildStartWarning,
    setRebuildActiveProgram, setRebuildCapPick, setRebuildView, setRebuildSection,
    setRebuildCurrent, setRebuildSaved, setRebuildStartWarning,
    tab, updateRebuildFLYA,
  } = ctx
  if (tab !== "rebuild") return null

  const saveKey = (key) => setRebuildSaved((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key])
  const isSaved = (key) => rebuildSaved.includes(key)
  const programById = (id) => REBUILD_PROGRAMS.find((p) => p.id === id)

  const openProgram = (p) => {
    if (p.id === "feel-like-yourself-again") {
      setRebuildActiveProgram(p.id)
      setRebuildView(rebuildFLYA.started ? "home" : "intro")
      return
    }
    // Interiors are intentionally being designed later. Keep the card useful
    // without pretending content exists yet.
    setRebuildStartWarning({ type: "preview", program: p })
  }

  const actuallyStart = (p) => {
    if (!rebuildCurrent.includes(p.id)) setRebuildCurrent((prev) => [...prev, p.id])
    setRebuildStartWarning(null)
    if (p.id === "feel-like-yourself-again") {
      if (!rebuildFLYA.started) updateRebuildFLYA({ started: true })
      setRebuildActiveProgram(p.id)
      setRebuildView("home")
    }
  }

  const requestStart = (p) => {
    if (p.premium && !rebuildPlus) { setRebuildStartWarning({ type: "plus", program: p }); return }
    if (!rebuildCurrent.includes(p.id) && rebuildCurrent.length >= 3) { setRebuildStartWarning({ type: "too-many", program: p }); return }
    actuallyStart(p)
  }

  const Pill = ({ children, light }) => <span style={{ display:"inline-block", padding:"6px 10px", borderRadius:999, fontSize:9.5, fontWeight:800, letterSpacing:1, textTransform:"uppercase", background:light?"rgba(255,255,255,.16)":BASE.surface, color:light?"#fff":BASE.taupe, border:`1px solid ${light?"rgba(255,255,255,.28)":BASE.border}` }}>{children}</span>
  const SaveButton = ({ id, light }) => <button onClick={(e)=>{e.stopPropagation();saveKey(id)}} style={{ border:"none", background:"transparent", padding:5, cursor:"pointer", color:light?"#fff":"#6B435F", fontSize:20, lineHeight:1 }}>{isSaved(id)?"♥":"♡"}</button>

  const ProgramCard = ({ p, compact }) => {
    const current = rebuildCurrent.includes(p.id) || (p.id === "feel-like-yourself-again" && rebuildFLYA.started)
    return <div style={{ borderRadius:24, overflow:"hidden", marginBottom:18, background:BASE.surface, border:`1px solid ${BASE.border}`, boxShadow:"0 8px 24px rgba(66,40,62,.07)" }}>
      <div onClick={()=>openProgram(p)} style={{ minHeight:compact?145:235, padding:compact?"20px":"22px 20px", background:p.gradient, position:"relative", cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{p.premium&&<Pill light>True Reverie +</Pill>}<Pill light>{p.kind==="quick"?"Quick Rebuild":p.duration}</Pill></div>
          <SaveButton id={"program:"+p.id} light />
        </div>
        <div style={{marginTop:compact?18:54}}>
          <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:compact?25:29,fontWeight:700,color:"#fff",lineHeight:1.08}}>{p.title}</div>
          <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:14.5,color:"rgba(255,255,255,.92)",lineHeight:1.48,marginTop:9,maxWidth:350}}>{p.outcome}</div>
        </div>
      </div>
      <div style={{padding:"13px 16px 15px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1,fontSize:10.5,fontWeight:700,color:BASE.taupe,textTransform:"uppercase",letterSpacing:.7}}>{p.kind==="quick"?p.duration+" · "+p.pace:p.duration+" · "+p.pace}</div>
        <button onClick={()=>current?openProgram(p):requestStart(p)} style={{padding:"9px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer"}}>{current?"Continue":(p.premium&&!rebuildPlus?"Start with +":"Start Rebuild")}</button>
      </div>
    </div>
  }

  const RitualCard = ({ r }) => <div style={{borderRadius:22,overflow:"hidden",background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:16}}>
    <div style={{height:132,background:r.gradient,padding:"17px 17px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{r.premium&&<Pill light>True Reverie +</Pill>}<Pill light>{r.meta}</Pill></div><SaveButton id={"ritual:"+r.id} light />
    </div>
    <div style={{padding:"15px 17px 17px"}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:21,fontWeight:700,color:BASE.cream}}>{r.title}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:13.5,color:BASE.taupe,lineHeight:1.5,marginTop:6}}>{r.desc}</div><button onClick={()=>setRebuildStartWarning({type:r.premium&&!rebuildPlus?"plus-ritual":"ritual-preview",ritual:r})} style={{marginTop:13,padding:"9px 14px",borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:"#6B435F",fontSize:11,fontWeight:800}}>Do Ritual</button></div>
  </div>

  if (!rebuildActiveProgram) {
    const currentIds = Array.from(new Set([...(rebuildFLYA.started?["feel-like-yourself-again"]:[]), ...rebuildCurrent]))
    const savedPrograms = REBUILD_PROGRAMS.filter((p)=>isSaved("program:"+p.id))
    const savedRituals = RITUALS.filter((r)=>isSaved("ritual:"+r.id))
    return <div className="fade-in" style={{padding:"10px 18px 0"}}>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:31,fontWeight:600,color:BASE.cream,lineHeight:1.1}}>Rebuild</div>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15.5,color:BASE.taupe,marginTop:6}}>What version of you are we building next?</div>
      <div style={{display:"flex",gap:7,marginTop:18,marginBottom:22}}>{[["rebuild","Rebuild"],["rituals","Rituals"],["saved","Saved"]].map(([k,l])=><button key={k} onClick={()=>setRebuildSection(k)} style={{flex:1,padding:"10px 8px",borderRadius:14,border:`1px solid ${rebuildSection===k?"#C97BA8":BASE.border}`,background:rebuildSection===k?"rgba(201,123,168,.12)":BASE.surface,color:rebuildSection===k?"#A84E7D":BASE.taupe,fontWeight:800,fontSize:11.5}}>{l}</button>)}</div>

      {rebuildSection==="rebuild"&&<>
        {currentIds.length>0&&<div style={{marginBottom:26}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:1.7,textTransform:"uppercase",color:BASE.taupe,marginBottom:10}}>Current Rebuilds</div><div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:5,scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>{currentIds.map((id)=>{const p=programById(id);if(!p)return null;const done=id==="feel-like-yourself-again"?rebuildFLYA.completed.length:0;return <div key={id} onClick={()=>openProgram(p)} style={{minWidth:"78%",scrollSnapAlign:"start",borderRadius:18,padding:"16px",background:p.gradient,color:"#fff",cursor:"pointer"}}><div style={{fontSize:9,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase",opacity:.75}}>Continue your Rebuild</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:21,fontWeight:700,marginTop:7}}>{p.title}</div><div style={{fontSize:10.5,marginTop:6,opacity:.85}}>{id==="feel-like-yourself-again"?`Experience ${Math.min(rebuildFLYA.currentExp,28)} of 28`:"Ready when you are"}</div><div style={{height:4,borderRadius:999,background:"rgba(255,255,255,.24)",marginTop:11,overflow:"hidden"}}><div style={{height:"100%",width:id==="feel-like-yourself-again"?`${done/28*100}%`:"4%",background:"rgba(255,255,255,.9)"}}/></div></div>})}</div></div>}
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream,marginBottom:4}}>Find your next Rebuild</div>
        <div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.5,marginBottom:15}}>Longer journeys and small resets — start what fits, save what can wait.</div>
        {REBUILD_PROGRAMS.map((p)=><ProgramCard key={p.id} p={p}/>)}
      </>}

      {rebuildSection==="rituals"&&<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream}}>Rituals</div><div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.55,margin:"5px 0 15px"}}>Little things worth coming back to. No streaks, no catching up — just repeat what makes life feel better.</div>{RITUALS.map((r)=><RitualCard key={r.id} r={r}/>)}</>}

      {rebuildSection==="saved"&&<>{savedPrograms.length===0&&savedRituals.length===0?<div style={{textAlign:"center",padding:"50px 24px",borderRadius:20,border:`1px dashed ${BASE.border}`,color:BASE.taupe}}><div style={{fontSize:24}}>♡</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,fontWeight:700,color:BASE.cream,marginTop:8}}>Saved for later</div><div style={{fontSize:12,marginTop:6,lineHeight:1.5}}>Tap the heart on a Rebuild or ritual you want to come back to.</div></div>:<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream,marginBottom:14}}>Saved for later</div>{savedPrograms.map((p)=><ProgramCard key={p.id} p={p} compact/>)}{savedRituals.map((r)=><RitualCard key={r.id} r={r}/>)}</>}</>}

      {rebuildStartWarning&&<div onClick={()=>setRebuildStartWarning(null)} style={{position:"fixed",inset:0,zIndex:120,background:"rgba(44,31,43,.38)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div onClick={(e)=>e.stopPropagation()} className="fade-in" style={{width:"100%",maxWidth:440,borderRadius:"24px 24px 0 0",background:BASE.bg,padding:"24px 22px 30px",boxShadow:"0 -12px 40px rgba(45,25,42,.18)"}}>{rebuildStartWarning.type==="too-many"?<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:700,color:BASE.cream}}>You already have 3 Rebuilds going.</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:9}}>Keeping your current list small can make it easier to actually finish what you started. But you know your life best.</div><button onClick={()=>{saveKey("program:"+rebuildStartWarning.program.id);setRebuildStartWarning(null)}} style={{width:"100%",padding:13,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:800,marginTop:18}}>Save for later</button><button onClick={()=>actuallyStart(rebuildStartWarning.program)} style={{width:"100%",padding:13,borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontWeight:800,marginTop:9}}>Start it anyway</button></>:rebuildStartWarning.type==="plus"||rebuildStartWarning.type==="plus-ritual"?<><div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#A84E7D"}}>True Reverie +</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream,marginTop:7}}>Go deeper with True Reverie +</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:9}}>Your monthly membership unlocks every True Reverie + Rebuild and ritual. Start as many as you want, at your own pace.</div><button onClick={()=>setRebuildStartWarning(null)} style={{width:"100%",padding:13,borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontWeight:800,marginTop:18}}>Explore True Reverie +</button></>:<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:700,color:BASE.cream}}>{rebuildStartWarning.program?.title||rebuildStartWarning.ritual?.title}</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:9}}>The discovery experience is ready. We're building the full content next, so this one isn't startable in the prototype yet.</div><button onClick={()=>setRebuildStartWarning(null)} style={{width:"100%",padding:13,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:800,marginTop:18}}>Got it</button></>}</div></div>}
      <div style={{height:44,paddingBottom:"env(safe-area-inset-bottom)"}}/>
    </div>
  }

  // ═══════════════════════ FEEL LIKE YOURSELF AGAIN ═══════════════════════

  const realCapKey = !checkedIn ? "yellow" : (pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green")
  const capKey = rebuildCapPick || realCapKey

  const openExp = (id) => { setRebuildCapPick(null); setRebuildView("exp") }
  const backToLanding = () => setRebuildActiveProgram(null)

  const computeSignals = () => {
    const tally = {}
    DIMENSIONS.forEach((d) => { tally[d] = 0 })
    const loved = [], notLoved = [], surprises = []
    Object.keys(rebuildFLYA.log || {}).forEach((idStr) => {
      const exp = EXP_BY_ID(Number(idStr))
      const entry = rebuildFLYA.log[idStr]
      if (!exp || !entry || !entry.reaction) return
      const rs = exp.reaction || DEFAULT_REACTION
      const opt = rs.options.find((o) => o.key === entry.reaction)
      if (!opt) return
      ;(exp.dimensions || []).forEach((d) => { tally[d] = (tally[d] || 0) + opt.weight })
      if (opt.weight >= 1) loved.push(exp)
      if (opt.weight <= -0.5) notLoved.push(exp)
      if (opt.surprise) surprises.push(exp)
    })
    const topDims = Object.entries(tally).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([d]) => d)
    return { tally, topDims, loved, notLoved, surprises }
  }

  const Head = ({ label, title }) => (
    <div style={{ marginBottom: 16 }}>
      {label && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "#9B6BC3", marginBottom: 6 }}>{label}</div>}
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream, lineHeight: 1.15 }}>{title}</div>
    </div>
  )
  const Btn = ({ children, onClick, light }) => (
    <div onClick={onClick} style={{ marginTop: 22, textAlign: "center", padding: "15px 0", borderRadius: 999, cursor: "pointer",
      background: light ? "rgba(255,255,255,0.95)" : "linear-gradient(135deg,#E984B4,#A87BD1)" }}>
      <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: 0.3, color: light ? "#3C1959" : "#fff" }}>{children}</span>
    </div>
  )
  const Chip = ({ label, selected, onClick }) => (
    <span onClick={onClick} style={{ display: "inline-block", padding: "9px 14px", borderRadius: 999, marginRight: 7, marginBottom: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
      background: selected ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface, color: selected ? "#fff" : BASE.creamDim,
      border: `1px solid ${selected ? "transparent" : BASE.border}` }}>{label}</span>
  )
  const SafeBottom = () => <div style={{ height: 44, paddingBottom: "env(safe-area-inset-bottom)" }} />
  const BackLink = ({ label, onClick }) => (
    <div onClick={onClick} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 " + label}</div>
  )

  if (rebuildView === "intro") {
    const knowList = [
      "What actually makes you feel like yourself",
      "What kinds of fun and pleasure you genuinely enjoy",
      "How you like to spend time when nobody else is deciding",
      "Which parts of your old self still belong to you",
      "What you've outgrown",
      "What environments make you feel better",
      "What kinds of connection energize or comfort you",
      "What you want more of next",
    ]
    return (
      <div className="fade-in" style={{ padding: "10px 22px 0" }}>
        <BackLink label="Rebuild" onClick={backToLanding} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, lineHeight: 1.15 }}>Feel Like Yourself Again</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: "#9B6BC3", marginTop: 10 }}>Reconnect with the woman underneath survival mode.</div>
        <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.65, marginTop: 14 }}>{"Rediscover what makes life feel like yours, notice what genuinely lights you up, and build more of it back in \u2014 at the pace your life can hold."}</div>

        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          {["28 experiences", "Moves at your pace", "Adapts to your Capacity"].map((t) => (
            <div key={t} style={{ flex: 1, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "12px 8px", textAlign: "center" }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: BASE.creamDim, lineHeight: 1.3 }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, marginBottom: 12 }}>{"By the end, you'll know more about\u2026"}</div>
          {knowList.map((k) => (
            <div key={k} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
              <span style={{ color: "#C9558E", fontSize: 13, marginTop: 1 }}>{"\u2726"}</span>
              <span style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.5 }}>{k}</span>
            </div>
          ))}
        </div>

        <Btn onClick={() => { if (!rebuildFLYA.started) updateRebuildFLYA({ started: true }); setRebuildView("home") }}>
          {rebuildFLYA.started ? "Continue Rebuild" : "Start Rebuild"}
        </Btn>
        <SafeBottom />
      </div>
    )
  }

  if (rebuildView === "home") {
    const done = rebuildFLYA.completed.length
    const allDone = done >= 28
    const exp = EXP_BY_ID(Math.min(rebuildFLYA.currentExp, 28))
    const signals = computeSignals()
    return (
      <div className="fade-in" style={{ padding: "10px 22px 0" }}>
        <BackLink label="Rebuild" onClick={backToLanding} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream }}>Feel Like Yourself Again</div>

        {done > 0 && <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", marginTop: 8 }}>Welcome back. Your Rebuild is right where you left it.</div>}

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9B6BC3", marginBottom: 8 }}>{allDone ? "All 28 experiences complete" : "Experience " + exp.id + " of 28"}</div>
          <div style={{ height: 6, borderRadius: 999, background: BASE.bg2 || BASE.surface2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: (Math.min(done, 28) / 28 * 100) + "%", borderRadius: 999, background: "linear-gradient(90deg,#E984B4,#A87BD1)" }} />
          </div>
        </div>

        {allDone ? (
          <div style={{ marginTop: 28, borderRadius: 20, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "20px 20px 22px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: BASE.cream }}>You finished the Rebuild.</div>
            <div style={{ fontSize: 13, color: BASE.creamDim, marginTop: 8, lineHeight: 1.55 }}>Revisit your Reverie any time.</div>
            <Btn onClick={() => setRebuildView("recap")}>See Your Reverie</Btn>
          </div>
        ) : (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, marginBottom: 10 }}>Today</div>
            <div style={{ borderRadius: 20, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "20px 20px 22px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: BASE.cream, lineHeight: 1.2 }}>{exp.title}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: BASE.taupe, marginTop: 8, lineHeight: 1.5 }}>{exp.why}</div>
              <Btn onClick={() => openExp(exp.id)}>See Today's Experience</Btn>
            </div>
            {done > 0 && <div onClick={() => { setRebuildCapPick("recovery"); openExp(exp.id) }} style={{ marginTop: 14, textAlign: "center", fontSize: 12, color: BASE.taupe, fontStyle: "italic", cursor: "pointer" }}>I need an easier version today</div>}
          </div>
        )}

        <div style={{ marginTop: 34, marginBottom: 4 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>Your Rebuild So Far</div>
        </div>
        {done === 0 ? (
          <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.6, marginTop: 8 }}>{"This will fill in as you go \u2014 sparks found, things you loved, patterns starting to show."}</div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {signals.loved.length > 0 && <div style={{ fontSize: 13, color: BASE.creamDim, marginBottom: 6 }}>{"\u2726 Sparks found: " + signals.loved.length}</div>}
            {signals.surprises.length > 0 && <div style={{ fontSize: 13, color: BASE.creamDim, marginBottom: 6 }}>{"\u2726 Things that surprised you: " + signals.surprises.length}</div>}
            {signals.notLoved.length > 0 && <div style={{ fontSize: 13, color: BASE.creamDim, marginBottom: 6 }}>{"\u2726 Things that weren't really you: " + signals.notLoved.length}</div>}
            {signals.topDims.length >= 2 && <div style={{ fontSize: 13, color: BASE.creamDim, marginBottom: 6 }}>{"\u2726 Emerging pattern: " + DIM_PHRASE[signals.topDims[0]]}</div>}
          </div>
        )}
        {done > 0 && <div onClick={() => setRebuildView("journey")} style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer" }}>See your journey {"\u2192"}</div>}

        <SafeBottom />
      </div>
    )
  }

  if (rebuildView === "exp") {
    const exp = EXP_BY_ID(Math.min(rebuildFLYA.currentExp, 28))
    const entry = (rebuildFLYA.log && rebuildFLYA.log[exp.id]) || {}
    const rs = exp.reaction || DEFAULT_REACTION
    const dose = exp.capacity[capKey]

    const setChoice = (val) => updateRebuildFLYA((prev) => ({ ...prev, log: { ...prev.log, [exp.id]: { ...(prev.log[exp.id] || {}), choice: val } } }))
    const setReaction = (key) => updateRebuildFLYA((prev) => ({ ...prev, log: { ...prev.log, [exp.id]: { ...(prev.log[exp.id] || {}), reaction: key } } }))
    const complete = () => {
      updateRebuildFLYA((prev) => {
        const completed = prev.completed.indexOf(exp.id) >= 0 ? prev.completed : [...prev.completed, exp.id]
        return { ...prev, completed, currentExp: Math.min(exp.id + 1, 28) }
      })
      if (exp.id === 28) setRebuildView("recap")
      else if ([7, 14, 21].indexOf(exp.id) >= 0) setRebuildView("reveal")
      else setRebuildView("home")
    }

    return (
      <div className="fade-in" style={{ padding: "10px 22px 0" }}>
        <BackLink label="Feel Like Yourself Again" onClick={() => setRebuildView("home")} />
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe }}>{"Experience " + exp.id}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream, marginTop: 6, lineHeight: 1.2 }}>{exp.title}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 10, lineHeight: 1.55 }}>{exp.why}</div>

        <div style={{ height: 1, background: BASE.border, margin: "22px 0 20px" }} />

        <Head label="Today's Anchor" title={exp.anchor.text} />
        {exp.anchor.examples && exp.anchor.examples.length > 0 && (
          <div style={{ marginTop: -6, marginBottom: 20 }}>{exp.anchor.examples.map((x) => <Chip key={x} label={x} />)}</div>
        )}

        {exp.makeItYours && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9B6BC3", marginBottom: 10 }}>Make It Yours</div>
            {exp.makeItYours.prompt && <div style={{ fontSize: 13, color: BASE.creamDim, marginBottom: 10 }}>{exp.makeItYours.prompt}</div>}
            {exp.makeItYours.choices.length > 0 && <div>{exp.makeItYours.choices.map((c) => <Chip key={c} label={c} selected={entry.choice === c} onClick={() => setChoice(c)} />)}</div>}
          </div>
        )}

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9B6BC3", marginBottom: 10 }}>Your Version Today</div>
          <div style={{ marginBottom: 12 }}>{CAP_TABS.map(([k, lbl]) => <Chip key={k} label={lbl} selected={capKey === k} onClick={() => setRebuildCapPick(k)} />)}</div>
          <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.cream, lineHeight: 1.5 }}>{dose}</div>
          </div>
        </div>

        {exp.addOn && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, marginBottom: 8 }}>Little Add-On</div>
            <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, fontStyle: "italic" }}>{exp.addOn}</div>
          </div>
        )}

        {exp.nurseTip && (
          <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>From a nurse</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.cream, lineHeight: 1.45 }}>{exp.nurseTip}</div>
          </div>
        )}

        {exp.id !== 28 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 1, background: BASE.border, margin: "0 0 20px" }} />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream, marginBottom: 12 }}>{rs.question}</div>
            <div>{rs.options.map((o) => <Chip key={o.key} label={o.label} selected={entry.reaction === o.key} onClick={() => setReaction(o.key)} />)}</div>
          </div>
        )}

        <Btn onClick={complete}>{exp.id === 28 ? "See Your Reverie" : "Complete Experience"}</Btn>
        <SafeBottom />
      </div>
    )
  }

  if (rebuildView === "reveal") {
    const meta = WEEKLY_REVEALS.find((r) => r.afterExp === rebuildFLYA.completed.length) || WEEKLY_REVEALS[0]
    const signals = computeSignals()
    return (
      <div className="fade-in" style={{ padding: "10px 22px 0", textAlign: "center" }}>
        <div style={{ paddingTop: 40 }}>
          <div style={{ fontSize: 26, marginBottom: 16 }}>{"\u2728"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream, lineHeight: 1.2 }}>{meta.title}</div>
          <div style={{ marginTop: 22, padding: "0 8px" }}>
            {signals.topDims.length >= 2 ? (
              <>
                <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.6 }}>{"You seem especially drawn to\u2026"}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "#C9558E", marginTop: 10, lineHeight: 1.5 }}>{signals.topDims.slice(0, 3).map((d) => DIM_PHRASE[d]).join("  \u00b7  ")}</div>
              </>
            ) : (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.creamDim, lineHeight: 1.6 }}>{meta.lowDataLine}</div>
            )}
          </div>
          {meta.closing && <div style={{ fontSize: 13, color: BASE.taupe, fontStyle: "italic", marginTop: 22 }}>{meta.closing}</div>}
          <Btn onClick={() => setRebuildView("home")}>Continue</Btn>
        </div>
        <SafeBottom />
      </div>
    )
  }

  if (rebuildView === "journey") {
    return (
      <div className="fade-in" style={{ padding: "10px 22px 0" }}>
        <BackLink label="Feel Like Yourself Again" onClick={() => setRebuildView("home")} />
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream, marginBottom: 20 }}>Your Journey</div>
        {rebuildFLYA.completed.map((id) => {
          const exp = EXP_BY_ID(id)
          const entry = rebuildFLYA.log[id] || {}
          const rs = exp.reaction || DEFAULT_REACTION
          const opt = rs.options.find((o) => o.key === entry.reaction)
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: `1px solid ${BASE.border}` }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: BASE.taupe, width: 20 }}>{id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 700, color: BASE.cream }}>{exp.title}</div>
                {opt && <div style={{ fontSize: 11.5, color: "#9B6BC3", marginTop: 2 }}>{opt.label}</div>}
              </div>
            </div>
          )
        })}
        <SafeBottom />
      </div>
    )
  }

  if (rebuildView === "recap") {
    const signals = computeSignals()
    const Section = ({ title, children }) => (
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9B6BC3", marginBottom: 10 }}>{title}</div>
        {children}
      </div>
    )
    const List = ({ items }) => items.map((x, i) => (
      <div key={i} style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.7 }}>{"\u2022 " + x}</div>
    ))
    return (
      <div className="fade-in" style={{ padding: "10px 22px 0" }}>
        <div style={{ textAlign: "center", paddingTop: 10 }}>
          <div style={{ fontSize: 26 }}>{"\u2728"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 12, lineHeight: 1.2 }}>Your Reverie</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.creamDim, marginTop: 16, lineHeight: 1.6 }}>{"You were never supposed to become exactly who you used to be. We were looking for what still feels like you \u2014 and what wants to come next."}</div>
        </div>

        <div style={{ height: 1, background: BASE.border, margin: "28px 0 24px" }} />

        <Section title={"You Feel Most Like Yourself When\u2026"}>
          {signals.topDims.length > 0
            ? <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.cream, lineHeight: 1.55 }}>{"You're leaning into " + DIM_PHRASE[signals.topDims[0]] + "."}</div>
            : <div style={{ fontSize: 13, color: BASE.taupe, fontStyle: "italic" }}>{"Still coming into focus \u2014 that's alright."}</div>}
        </Section>

        {signals.loved.length > 0 && <Section title="Your Biggest Sparks"><List items={signals.loved.slice(0, 5).map((e) => e.title)} /></Section>}
        {signals.notLoved.length > 0 && <Section title={"Things You Thought You'd Like \u2014 But Didn't"}><List items={signals.notLoved.slice(0, 4).map((e) => e.title)} /></Section>}
        {signals.surprises.length > 0 && <Section title="Unexpectedly You"><List items={signals.surprises.slice(0, 4).map((e) => e.title)} /></Section>}

        <Section title="Your Pleasure Style">
          <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6 }}>{signals.tally["Pleasure"] > 0 ? "You gravitate toward small, sensory pleasures \u2014 the kind that don't need an occasion." : "Still taking shape as you notice what actually feels good."}</div>
        </Section>
        <Section title="Your Self-Expression">
          <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6 }}>{signals.tally["Self-Expression"] > 0 ? "You respond to trying on new versions of how you look and show up." : "Still taking shape."}</div>
        </Section>
        <Section title="Your People">
          <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6 }}>{signals.tally["Connection"] > 0 ? "One-on-one connection seems to restore you more than you'd assumed." : "Still taking shape."}</div>
        </Section>
        <Section title="Your Places">
          <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6 }}>{signals.tally["Environment"] > 0 ? "Your surroundings genuinely shift your mood \u2014 worth protecting." : "Still taking shape."}</div>
        </Section>

        {signals.loved.length > 0 && <Section title="Keep These"><List items={signals.loved.slice(0, 3).map((e) => e.title)} /></Section>}
        {signals.notLoved.length > 0 && <Section title="Leave These"><List items={signals.notLoved.slice(0, 3).map((e) => e.title)} /></Section>}

        <Section title="Try Next">
          {otherPrograms.slice(0, 2).map((p) => (
            <div key={p.id} onClick={backToLanding} style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", marginBottom: 10, border: `1px solid ${BASE.border}` }}>
              <div style={{ height: 50, background: p.gradient }} />
              <div style={{ padding: "10px 14px 12px", background: BASE.surface }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{p.title}</div>
                <div style={{ fontSize: 10, color: BASE.taupe, marginTop: 2 }}>Coming Soon</div>
              </div>
            </div>
          ))}
        </Section>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: "#C9558E" }}>Dream Her. Become Her.</div>
          <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", marginTop: 10, lineHeight: 1.6 }}>Feeling like yourself again was never about going backward. It was about noticing what still belongs to you and making room for what comes next.</div>
          <Btn onClick={backToLanding}>Finish Rebuild</Btn>
        </div>
        <SafeBottom />
      </div>
    )
  }

  return null
}

