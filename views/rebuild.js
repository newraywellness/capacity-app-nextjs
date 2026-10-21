// ============ REBUILD ============
// Rebuild home is a scroll-first discovery surface. Current programs appear
// automatically above discovery; Feel Better and Rituals live beside Rebuild.

import { RebuildExperienceOne, RebuildExperienceOneCompletion } from './rebuild-experience-one.js'
import { BASE } from '../lib/theme.js'
import { createPortal } from 'react-dom'

import { ContentShareActions } from './content-share-actions.js'
import { RebuildActivityPlayer, RebuildWorkspaceGallery, RebuildPhoto } from './rebuild-activity-player.js'
import { blocksOf, photoStyle } from '../lib/rebuild-activities.js'
import { contentSource } from '../lib/community-content.js'

export function renderRebuild(ctx) {
  const {
    rebuildActiveProgram, rebuildCapPick, rebuildView,
    rebuildSection, rebuildCurrent, rebuildSaved, rebuildPlus, rebuildStartWarning,
    setRebuildActiveProgram, setRebuildCapPick, setRebuildView, setRebuildSection,
    setRebuildCurrent, setRebuildSaved, setRebuildStartWarning,
    supabaseRebuildRows, supabaseFeelBetterRows, supabaseRitualRows, supabaseRebuildExperiences, rebuildDynamicExpId, setRebuildDynamicExpId,
    rebuildProgressRows, getRebuildProgress, startRebuildProgress, completeRebuildExperience,
    tab,
  } = ctx
  if (tab !== "rebuild") return null

  const saveKey = (key) => setRebuildSaved((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key])
  const isSaved = (key) => rebuildSaved.includes(key)
  const studioPrograms = (supabaseRebuildRows || []).map((row) => {
    const c = row.content || {}
    return { ...c, id:`studio-${row.id}`, _studioId:row.id, title:row.title, image:row.image_url || c.cover || "", premium:!!row.is_premium, featured:!!row.is_featured, outcome:c.outcome || "", duration:c.duration || "Guided Rebuild", pace:c.pace || "Move at your own pace", gradient:"linear-gradient(135deg,#C97BA8,#A87BD1)" }
  })
  const studioFeelBetter = (supabaseFeelBetterRows || []).map((row) => {
    const c = row.content || {}
    return { id:`studio-feel-${row.id}`, title:row.title, desc:c.description || "", action:c.action || "", image:row.image_url || "", imagePosition:c.imagePosition || {x:50,y:50}, imageZoom:Number(c.imageZoom)||1 }
  })
  const studioRituals = (supabaseRitualRows || []).map((row) => {
    const c = row.content || {}
    return { id:`studio-ritual-${row.id}`, title:row.title, desc:c.description || "", action:c.action || "", image:row.image_url || "", imagePosition:c.imagePosition || {x:50,y:50}, imageZoom:Number(c.imageZoom)||1, premium:!!row.is_premium, meta:c.timing || (c.minutes ? `${c.minutes} MIN` : "RITUAL"), gradient:"linear-gradient(135deg,#C97BA8,#A87BD1)" }
  })
  const allPrograms = studioPrograms
  const programById = (id) => allPrograms.find((p) => p.id === id)

  const plusTargetFor=p=>({programKey:p.id,rebuildId:p._studioId,title:p.title,fromPreview:rebuildView==="dynamic-preview"})
  const needsPlus=(p)=>{
    if(!p?.premium||rebuildPlus)return false
    if(ctx.openPlus)ctx.openPlus(p?plusTargetFor(p):null);else setRebuildStartWarning({type:'plus',program:p})
    return true
  }
  const openProgram = (p) => {
    if(p.premium&&!rebuildPlus&&p.previewBlocks?.length){setRebuildActiveProgram(p.id);setRebuildView("dynamic-preview");return}
    if(needsPlus(p))return
    if (p._studioId) {
      setRebuildActiveProgram(p.id)
      const savedProgress = getRebuildProgress ? getRebuildProgress(p.id) : null
      setRebuildDynamicExpId(savedProgress?.current_experience_id || null)
      setRebuildView(savedProgress ? "dynamic-home" : "dynamic-intro")
      if (typeof window!=="undefined") window.scrollTo({top:0,behavior:"instant"})
      return
    }
    setRebuildStartWarning({ type: "preview", program: p })
  }

  const actuallyStart = (p) => {
    if(needsPlus(p))return
    if (!rebuildCurrent.includes(p.id)) setRebuildCurrent((prev) => [...prev, p.id])
    setRebuildStartWarning(null)
    if (p._studioId) {
      const firstExp = (supabaseRebuildExperiences || []).filter((e) => e.rebuild_id === p._studioId).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))[0] || null
      setRebuildActiveProgram(p.id); setRebuildDynamicExpId(firstExp?.id || null); setRebuildView("dynamic-home")
      if (startRebuildProgress) startRebuildProgress({ programKey:p.id, rebuildId:p._studioId, currentExperienceId:firstExp?.id || null, currentExperienceNumber:1 })
      return
    }
  }

  const requestStart = (p) => {
    if(needsPlus(p))return
    if (!rebuildCurrent.includes(p.id) && rebuildCurrent.length >= 3) { setRebuildStartWarning({ type: "too-many", program: p }); return }
    actuallyStart(p)
  }

  const Pill = ({ children, light }) => <span role={typeof children==='string'&&children.includes('True Reverie')?'button':undefined} tabIndex={typeof children==='string'&&children.includes('True Reverie')?0:undefined} onClick={e=>{if(typeof children==='string'&&children.includes('True Reverie')){e.stopPropagation();ctx.openPlus?.()}}} onKeyDown={e=>{if(typeof children==='string'&&children.includes('True Reverie')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();ctx.openPlus?.()}}} style={{ display:"inline-block", padding:"6px 10px", borderRadius:999, fontSize:9.5, fontWeight:800, letterSpacing:1, textTransform:"uppercase", background:light?"rgba(255,255,255,.16)":BASE.surface, color:light?"#fff":BASE.taupe, border:`1px solid ${light?"rgba(255,255,255,.28)":BASE.border}` }}>{children}</span>
  const SaveButton = ({ id, light }) => <button onClick={(e)=>{e.stopPropagation();saveKey(id)}} style={{ border:"none", background:"transparent", padding:5, cursor:"pointer", color:light?"#fff":"#6B435F", fontSize:20, lineHeight:1 }}>{isSaved(id)?"♥":"♡"}</button>

  const ProgramCard = ({ p, compact }) => {
    const current = rebuildCurrent.includes(p.id)
    return <div style={{ borderRadius:24, overflow:"hidden", marginBottom:18, background:BASE.surface, border:`1px solid ${BASE.border}`, boxShadow:"0 8px 24px rgba(66,40,62,.07)" }}>
      <div onClick={()=>openProgram(p)} style={{ minHeight:compact?145:235, padding:compact?"20px":"22px 20px", background:p.image?`linear-gradient(rgba(48,30,44,.16),rgba(48,30,44,.42)), url(${p.image}) center/cover no-repeat`:p.gradient, backgroundPosition:p.image?`${p.imagePosition?.x||50}% ${p.imagePosition?.y||50}%`:undefined, position:"relative", cursor:"pointer", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
        {p.image&&<><div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}><img loading="lazy" src={p.image} alt={p.alt||""} style={photoStyle(p)}/></div><div style={{position:"absolute",inset:0,background:"linear-gradient(rgba(48,30,44,.16),rgba(48,30,44,.42))",pointerEvents:"none"}}/></>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,position:"relative"}}>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{p.premium&&<Pill light>True Reverie +</Pill>}<Pill light>{p.kind==="quick"?"Quick Rebuild":p.duration}</Pill></div>
          <SaveButton id={"program:"+p.id} light />
        </div>
        <div style={{marginTop:compact?18:54,position:"relative"}}>
          <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:compact?25:29,fontWeight:700,color:"#fff",lineHeight:1.08}}>{p.title}</div>
          <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:14.5,color:"rgba(255,255,255,.92)",lineHeight:1.48,marginTop:9,maxWidth:350}}>{p.outcome}</div>
        </div>
      </div>
      <div style={{padding:"13px 16px 15px",display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1,fontSize:10.5,fontWeight:700,color:BASE.taupe,textTransform:"uppercase",letterSpacing:.7}}>{p.kind==="quick"?p.duration+" · "+p.pace:p.duration+" · "+p.pace}</div>
        <button onClick={()=>p.premium&&!rebuildPlus&&p.previewBlocks?.length?openProgram(p):current?openProgram(p):requestStart(p)} style={{padding:"9px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer"}}>{p.premium&&!rebuildPlus?(p.previewBlocks?.length?"Build My Rebuild":"Open with +"):current?"Continue":"Start Rebuild"}</button>
      </div>
    </div>
  }

  const RitualCard = ({ r }) => <div style={{borderRadius:22,overflow:"hidden",background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:16}}>
    <div style={{height:132,background:r.image?`url(${r.image}) ${r.imagePosition?.x||50}% ${r.imagePosition?.y||50}%/cover no-repeat`:r.gradient,padding:"17px 17px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",overflow:"hidden"}}>
      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>{r.premium&&<Pill light>True Reverie +</Pill>}<Pill light>{r.meta}</Pill></div><SaveButton id={"ritual:"+r.id} light />
    </div>
    <div style={{padding:"15px 17px 17px"}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:21,fontWeight:700,color:BASE.cream}}>{r.title}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:13.5,color:BASE.taupe,lineHeight:1.5,marginTop:6}}>{r.desc}</div><button onClick={()=>{ if (typeof window!=="undefined") window.scrollTo({top:0,behavior:"instant"}); setRebuildStartWarning({type:r.premium&&!rebuildPlus?"plus-ritual":"ritual-preview",ritual:r}) }} style={{marginTop:13,padding:"9px 14px",borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:"#6B435F",fontSize:11,fontWeight:800}}>Do Ritual</button><ContentShareActions ctx={ctx} source={contentSource({id:String(r.id).replace(/^studio-ritual-/,''),title:r.title},'ritual')}/></div>
  </div>

  if(ctx.communityContentId&&['feel_better','ritual'].includes(ctx.communityContentType)){
    const row=(ctx.communityContentType==='ritual'?supabaseRitualRows:supabaseFeelBetterRows)?.find(x=>String(x.id)===String(ctx.communityContentId))
    if(!row)return null
    const c=row.content||{}
    return <div style={{padding:'22px'}}>{row.image_url&&<img src={row.image_url} alt="" style={{width:'100%',height:240,objectFit:'cover',objectPosition:`${c.imagePosition?.x??50}% ${c.imagePosition?.y??50}%`,borderRadius:22}}/>}<div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:28,color:BASE.cream,marginTop:16}}>{row.title}</div>{c.description&&<p style={{fontSize:14,color:BASE.taupe,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{c.description}</p>}{c.action&&<div style={{fontSize:15,color:BASE.creamDim,lineHeight:1.7,whiteSpace:'pre-wrap',marginTop:16}}>{c.action}</div>}{(row.extra_pages||[]).map((page,i)=><p key={i} style={{whiteSpace:'pre-wrap',fontSize:14,lineHeight:1.7,color:BASE.creamDim}}>{page.content}</p>)}<ContentShareActions ctx={ctx} source={contentSource(row)}/></div>
  }

  if (!rebuildActiveProgram) {
    const currentIds = Array.from(new Set(rebuildCurrent)).filter((id) => programById(id))
    return <div className="fade-in" style={{padding:"10px 18px 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:31,fontWeight:600,color:BASE.cream,lineHeight:1.1}}>Rebuild</div><button onClick={()=>ctx.openPlus?.()} style={{border:`1px solid ${BASE.border}`,borderRadius:999,padding:"8px 12px",background:BASE.surface,color:"#A84E7D",fontSize:11,fontWeight:800}}>True Reverie+</button></div>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15.5,color:BASE.taupe,marginTop:6}}>What version of you are we building next?</div>
      <div style={{display:"flex",gap:7,marginTop:18,marginBottom:22}}>{[["rebuild","Rebuild"],["feel-better","Feel Better"],["rituals","Rituals"]].map(([k,l])=><button key={k} onClick={()=>setRebuildSection(k)} style={{flex:1,padding:"10px 8px",borderRadius:14,border:`1px solid ${rebuildSection===k?"#C97BA8":BASE.border}`,background:rebuildSection===k?"rgba(201,123,168,.12)":BASE.surface,color:rebuildSection===k?"#A84E7D":BASE.taupe,fontWeight:800,fontSize:11.5}}>{l}</button>)}</div>

      {rebuildSection==="rebuild"&&<>
        {currentIds.length>0&&<div style={{marginBottom:26}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:1.7,textTransform:"uppercase",color:BASE.taupe,marginBottom:10}}>Current Rebuilds</div><div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:5,scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>{currentIds.map((id)=>{const p=programById(id);if(!p)return null;return <div key={id} onClick={()=>openProgram(p)} style={{minWidth:"78%",scrollSnapAlign:"start",borderRadius:18,padding:"16px",background:p.gradient,color:"#fff",cursor:"pointer"}}><div style={{fontSize:9,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase",opacity:.75}}>Continue your Rebuild</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:21,fontWeight:700,marginTop:7}}>{p.title}</div><div style={{fontSize:10.5,marginTop:6,opacity:.85}}>{"Ready when you are"}</div><div style={{height:4,borderRadius:999,background:"rgba(255,255,255,.24)",marginTop:11,overflow:"hidden"}}><div style={{height:"100%",width:"4%",background:"rgba(255,255,255,.9)"}}/></div></div>})}</div></div>}
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream,marginBottom:4}}>Find your next Rebuild</div>
        <div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.5,marginBottom:15}}>Longer journeys and small resets — start what fits, save what can wait.</div>
        {allPrograms.map((p)=><ProgramCard key={p.id} p={p}/>)}
      </>}

      {rebuildSection==="rituals"&&<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,fontWeight:700,color:BASE.cream}}>Rituals</div><div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.55,margin:"5px 0 15px"}}>Little things worth coming back to. No streaks, no catching up — just repeat what makes life feel better.</div>{studioRituals.map((r)=><RitualCard key={r.id} r={r}/>)}</>}

      {rebuildSection==="feel-better"&&<>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:22,fontWeight:700,color:BASE.cream}}>What would make today feel better?</div>
        <div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.55,margin:"6px 0 17px"}}>Not a program. Just choose what you need right now and take one small step toward it.</div>
        {studioFeelBetter.map((x)=><div key={x.id}><button onClick={()=>{ if(typeof window!=="undefined") window.scrollTo({top:0,behavior:"instant"}); setRebuildStartWarning({type:"feel-better",feel:x}) }} style={{width:"100%",textAlign:"left",display:"flex",gap:13,alignItems:"center",padding:"16px 15px",marginBottom:10,borderRadius:18,border:`1px solid ${BASE.border}`,background:BASE.surface,cursor:"pointer"}}><div style={{width:38,height:38,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(201,123,168,.10)",fontSize:19,flex:"0 0 auto"}}>{x.ic}</div><div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:17,fontWeight:700,color:BASE.cream}}>{x.title}</div><div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.45,marginTop:3}}>{x.desc}</div></div></button><ContentShareActions ctx={ctx} source={contentSource({id:String(x.id).replace(/^studio-feel-/,''),title:x.title},'feel_better')}/></div>)}
      </>}

      {rebuildStartWarning && typeof document !== "undefined" && createPortal(<div onClick={()=>setRebuildStartWarning(null)} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(44,31,43,.38)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}><div onClick={(e)=>e.stopPropagation()} className="fade-in" style={{width:"100%",maxWidth:440,borderRadius:"24px 24px 0 0",background:BASE.bg,padding:"24px 22px 30px",boxShadow:"0 -12px 40px rgba(45,25,42,.18)"}}>{rebuildStartWarning.type==="too-many"?<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:700,color:BASE.cream}}>You already have 3 Rebuilds going.</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:9}}>Keeping your current list small can make it easier to actually finish what you started. But you know your life best.</div><button onClick={()=>{saveKey("program:"+rebuildStartWarning.program.id);setRebuildStartWarning(null)}} style={{width:"100%",padding:13,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:800,marginTop:18}}>Save for later</button><button onClick={()=>actuallyStart(rebuildStartWarning.program)} style={{width:"100%",padding:13,borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontWeight:800,marginTop:9}}>Start it anyway</button></>:rebuildStartWarning.type==="plus"||rebuildStartWarning.type==="plus-ritual"?<><div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#A84E7D"}}>True Reverie +</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream,marginTop:7}}>Go deeper with True Reverie +</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:9}}>Your monthly membership unlocks every True Reverie + Rebuild and ritual. Start as many as you want, at your own pace.</div><button onClick={()=>{setRebuildStartWarning(null);ctx.openPlus?.()}} style={{width:"100%",padding:13,borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontWeight:800,marginTop:18}}>Explore True Reverie +</button></>:rebuildStartWarning.type==="feel-better"?<>{rebuildStartWarning.feel?.image&&<div style={{height:190,borderRadius:18,overflow:"hidden",marginBottom:16,background:`url(${rebuildStartWarning.feel.image}) ${rebuildStartWarning.feel.imagePosition?.x||50}% ${rebuildStartWarning.feel.imagePosition?.y||50}%/cover no-repeat`,transform:`scale(${rebuildStartWarning.feel.imageZoom||1})`,transformOrigin:`${rebuildStartWarning.feel.imagePosition?.x||50}% ${rebuildStartWarning.feel.imagePosition?.y||50}%`}}/>}<div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#A84E7D"}}>Feel Better</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream,marginTop:7}}>{rebuildStartWarning.feel?.title}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15,color:BASE.creamDim,lineHeight:1.6,marginTop:12}}>{rebuildStartWarning.feel?.action}</div><div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.5,marginTop:14}}>Do just this, or make it even smaller. The point is to make the next few minutes feel a little better.</div><button onClick={()=>setRebuildStartWarning(null)} style={{width:"100%",padding:13,borderRadius:999,border:"none",background:"linear-gradient(135deg,#D86FA6,#A87BD1)",color:"#fff",fontWeight:800,marginTop:18}}>That feels doable</button></>:rebuildStartWarning.type==="ritual-preview"?<>{rebuildStartWarning.ritual?.image&&<div style={{height:190,borderRadius:18,overflow:"hidden",marginBottom:16,background:`url(${rebuildStartWarning.ritual.image}) ${rebuildStartWarning.ritual.imagePosition?.x||50}% ${rebuildStartWarning.ritual.imagePosition?.y||50}%/cover no-repeat`}}/>}<div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:700,color:BASE.cream}}>{rebuildStartWarning.ritual?.title}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15,color:BASE.creamDim,lineHeight:1.6,marginTop:12}}>{rebuildStartWarning.ritual?.action||rebuildStartWarning.ritual?.desc}</div><button onClick={()=>setRebuildStartWarning(null)} style={{width:"100%",padding:13,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:800,marginTop:18}}>Done</button></>:<><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:700,color:BASE.cream}}>{rebuildStartWarning.program?.title||rebuildStartWarning.ritual?.title}</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:9}}>The discovery experience is ready. We're building the full content next, so this one isn't startable in the prototype yet.</div><button onClick={()=>setRebuildStartWarning(null)} style={{width:"100%",padding:13,borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.creamDim,fontWeight:800,marginTop:18}}>Got it</button></>}</div></div>, document.body)}
      <div style={{height:44,paddingBottom:"env(safe-area-inset-bottom)"}}/>
    </div>
  }


  // ═══════════════════════ STUDIO-PUBLISHED REBUILDS ═══════════════════════
  // Studio content uses the same guided consumer flow as the original Rebuild:
  // intro -> one current experience -> See Today's Experience -> complete -> next.
  // The full experience list is an Admin Studio concern, not a consumer screen.
  const studioProgram = studioPrograms.find(p=>p.id===rebuildActiveProgram)
  if(studioProgram&&rebuildView==="dynamic-preview"&&studioProgram.previewBlocks?.length)return <div style={{padding:"10px 22px 40px"}}><RebuildActivityPlayer key={`${ctx.user?.id}:${studioProgram._studioId}:preview`} ctx={ctx} programId={studioProgram._studioId} scope="preview" finishLabel={studioProgram.premium&&!rebuildPlus?"See my Rebuild · True Reverie+":"Review my answers"} blocks={blocksOf({blocks:studioProgram.previewBlocks}).filter(b=>b.type!=="result")} onBack={()=>{setRebuildActiveProgram(null);setRebuildView("intro")}} onFinish={async()=>{if(studioProgram.premium)ctx.openPlus?.(plusTargetFor(studioProgram));else setRebuildView("dynamic-intro");return true}}/></div>
  if(studioProgram?.premium&&!rebuildPlus)return <div style={{padding:'24px 22px'}}><button onClick={()=>{setRebuildActiveProgram(null);setRebuildView('intro')}} style={{border:'none',background:'transparent',color:BASE.taupe,fontWeight:700}}>‹ Rebuild</button><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,color:BASE.cream,marginTop:22}}>{studioProgram.title}</div><p style={{fontSize:13,color:BASE.taupe,lineHeight:1.6}}>This Rebuild is part of True Reverie+. Your saved progress stays right here.</p><button onClick={()=>ctx.openPlus?.(plusTargetFor(studioProgram))} style={{padding:'13px 22px',borderRadius:999,border:'none',background:'linear-gradient(135deg,#D86FA6,#A87BD1)',color:'#fff',fontWeight:800}}>Explore True Reverie+</button></div>
  if (studioProgram) {
    const experiences=(supabaseRebuildExperiences||[]).filter(e=>e.rebuild_id===studioProgram._studioId).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))
    const plannedExperienceCount=Math.max(experiences.length,Number(studioProgram.experienceCount||studioProgram.experience_count)||Number(/^(\d+)\s+experiences?/i.exec(studioProgram.duration||'')?.[1])||(studioProgram.starter_id==='come-back-foundation-01'?12:0))
    const studioProgress=getRebuildProgress?getRebuildProgress(studioProgram.id):null
    const backStudio=()=>{setRebuildActiveProgram(null);setRebuildDynamicExpId(null);setRebuildView("intro")}
    const restoredExpId=rebuildDynamicExpId||studioProgress?.current_experience_id
    const currentStudioExp=experiences.find(e=>e.id===restoredExpId)||experiences[0]
    const currentStudioIdx=currentStudioExp?experiences.findIndex(e=>e.id===currentStudioExp.id):0
    const studioCompleted=Array.isArray(studioProgress?.completed_experience_ids)?studioProgress.completed_experience_ids:[]
    const wasCompleted=id=>studioCompleted.some(saved=>String(saved)===String(id))
    const openExperience=(experience,fromBeginning=false)=>{
      if(!experience)return
      setRebuildDynamicExpId(experience.id)
      const isFirst=(experience.content?.starter_id==='come-back-foundation-01'&&blocksOf(experience.content).some(b=>b.id==='one-discover'))||(experience.content?.starter_id==='come-back-experience-02'&&blocksOf(experience.content).some(b=>['two-sort','two-workshops'].includes(b.id)))
      setRebuildView(fromBeginning&&isFirst?"dynamic-review-start":"dynamic-exp")
      if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"auto"})
    }
    const returnToStudioHome=()=>{
      setRebuildDynamicExpId(studioProgress?.current_experience_id||null)
      setRebuildView("dynamic-home")
      if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"auto"})
    }
    if(rebuildView==="dynamic-complete"){
      const completed=currentStudioExp
      const resume=experiences.find(e=>String(e.id)===String(studioProgress?.current_experience_id)&&!wasCompleted(e.id))||experiences.find(e=>!wasCompleted(e.id))
      if(['come-back-foundation-01','come-back-experience-02'].includes(completed?.content?.starter_id))return <RebuildExperienceOneCompletion title={completed.title} cover={completed.content.photo?completed.content:{photo:studioProgram.image,imagePosition:studioProgram.imagePosition,imageZoom:studioProgram.imageZoom}} onBack={returnToStudioHome} onReopen={()=>openExperience(completed,true)} onContinue={resume?()=>openExperience(resume):undefined}/>
      return <section style={{padding:"26px 24px 40px",color:BASE.cream}}>
        <button type="button" onClick={returnToStudioHome} style={{border:0,background:"transparent",color:BASE.creamDim,minHeight:44,padding:0,fontSize:14}}>‹ My Rebuild</button>
        <p style={{fontSize:11,letterSpacing:1.8,color:BASE.creamDim,marginTop:28}}>EXPERIENCE COMPLETE</p>
        <h1 style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:42,fontWeight:500,lineHeight:1.1,color:BASE.cream,margin:"16px 0"}}>Yours to come back to.</h1>
        <p style={{fontSize:16,lineHeight:1.75,color:BASE.creamDim}}>Your answers and creations are saved. You can revisit them and make changes whenever you want.</p>
        {completed&&<div style={{marginTop:28,padding:22,borderRadius:22,background:"#FFFDF8",border:`1px solid ${BASE.border}`}}>
          <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:29,lineHeight:1.15,color:BASE.cream}}>{completed.title}</div>
          <button type="button" onClick={()=>openExperience(completed,true)} style={{width:"100%",marginTop:20,minHeight:52,borderRadius:16,border:0,background:"#55354D",color:"#FFFFFF",fontSize:15,padding:"12px 16px"}}>Reopen this experience</button>
        </div>}
        {resume&&<button type="button" onClick={()=>openExperience(resume)} style={{width:"100%",marginTop:18,minHeight:48,borderRadius:16,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.cream,fontSize:15,padding:"12px 16px"}}>Continue my Rebuild</button>}
      </section>
    }


    if(rebuildView==="dynamic-intro") return <div className="fade-in" style={{padding:"10px 22px 0"}}>
      <div onClick={backStudio} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:"pointer",marginBottom:16}}>‹ Rebuild</div>
      <RebuildPhoto item={{...studioProgram,photo:studioProgram.image}} height={265}/>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:10}}>{studioProgram.premium&&<Pill>True Reverie +</Pill>}<Pill>{plannedExperienceCount} {plannedExperienceCount===1?"experience":"experiences"}</Pill></div>
      <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:31,fontWeight:700,color:BASE.cream,lineHeight:1.12}}>{studioProgram.title}</div>
      {studioProgram.outcome&&<div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:16,color:"#9B6BC3",lineHeight:1.5,marginTop:10}}>{studioProgram.outcome}</div>}
      {studioProgram.intro&&<div style={{fontSize:13.5,color:BASE.creamDim,lineHeight:1.7,marginTop:15,whiteSpace:"pre-wrap"}}>{studioProgram.intro}</div>}
      {studioProgram.previewBlocks?.length>0&&<button onClick={()=>setRebuildView("dynamic-preview")} style={{padding:"12px 18px",borderRadius:999,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.cream,fontWeight:700}}>Build My Rebuild</button>}
      <ContentShareActions ctx={ctx} source={contentSource({_studioId:studioProgram._studioId,id:studioProgram._studioId,title:studioProgram.title},'rebuild')}/>
      <div onClick={()=>{const first=experiences[0]||null;const resumeId=studioProgress?.current_experience_id||first?.id||null;if(resumeId)setRebuildDynamicExpId(resumeId);if(!rebuildCurrent.includes(studioProgram.id))setRebuildCurrent((prev)=>[...prev,studioProgram.id]);if(!studioProgress&&startRebuildProgress)startRebuildProgress({programKey:studioProgram.id,rebuildId:studioProgram._studioId,currentExperienceId:first?.id||null,currentExperienceNumber:1});setRebuildView("dynamic-home");if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"instant"})}} style={{marginTop:24,textAlign:"center",padding:"15px 0",borderRadius:999,cursor:"pointer",background:"linear-gradient(135deg,#E984B4,#A87BD1)",color:"#fff",fontSize:13.5,fontWeight:800}}>{studioProgress?"Continue Rebuild":"Start Rebuild"}</div><div style={{height:44}}/>
    </div>

    if(rebuildView==="dynamic-home") {
      const exp=currentStudioExp
      const c=exp?.content||{}
      const total=plannedExperienceCount
      const number=exp?currentStudioIdx+1:0
      return <div className="fade-in" style={{padding:"10px 22px 0"}}>
        <div onClick={backStudio} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:"pointer",marginBottom:16}}>‹ Rebuild</div>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:30,fontWeight:700,color:BASE.cream,lineHeight:1.15}}>{studioProgram.title}</div>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15.5,color:BASE.taupe,marginTop:10}}>Welcome back. Your Rebuild is right where you left it.</div>

        {studioCompleted.length>0&&<section aria-label="Completed experiences" style={{marginTop:24}}>
          <h2 style={{fontSize:13,fontWeight:700,color:BASE.creamDim,marginBottom:10}}>Come back to what you’ve made</h2>
          {experiences.filter(e=>wasCompleted(e.id)).map(e=><button type="button" key={e.id} aria-label={`Review ${e.title}`} onClick={()=>openExperience(e,true)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,width:"100%",textAlign:"left",padding:"17px 18px",minHeight:64,marginTop:8,border:`1px solid ${BASE.border}`,borderRadius:18,background:BASE.surface,color:BASE.cream}}><span style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:23,lineHeight:1.2}}>{e.title}</span><span style={{fontSize:13,color:BASE.creamDim}}>Review ›</span></button>)}
        </section>}
        {exp?<>
          <div style={{marginTop:28}}>
            <div style={{fontSize:12,fontWeight:700,color:"#9B6BC3",marginBottom:8}}>Experience {number} of {total}</div>
            <div style={{height:6,borderRadius:999,background:BASE.bg2||BASE.surface2,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max(4,studioCompleted.length/Math.max(total,1)*100)}%`,borderRadius:999,background:"linear-gradient(90deg,#E984B4,#A87BD1)"}}/></div>
          </div>

          <div style={{marginTop:30}}>
            <div style={{fontSize:10.5,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:BASE.taupe,marginBottom:10}}>Today</div>
            <div style={{borderRadius:20,background:BASE.surface,border:`1px solid ${BASE.border}`,overflow:"hidden"}}>
              <RebuildPhoto item={c} height={190}/>
              <div style={{padding:"20px 20px 22px"}}>
                <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:21,fontWeight:700,color:BASE.cream,lineHeight:1.2}}>{exp.title}</div>
                {c.description&&<div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:13.5,color:BASE.taupe,marginTop:8,lineHeight:1.5}}>{c.description}</div>}
                <div onClick={()=>{setRebuildView("dynamic-exp");if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"instant"})}} style={{marginTop:22,textAlign:"center",padding:"15px 0",borderRadius:999,cursor:"pointer",background:"linear-gradient(135deg,#E984B4,#A87BD1)",color:"#fff",fontSize:13.5,fontWeight:700}}>See Today's Experience</div>
              </div>
            </div>
          </div>

          <div style={{marginTop:34,marginBottom:4}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:18,fontWeight:700,color:BASE.cream}}>Your Rebuild So Far</div></div>
          <div style={{fontSize:12.5,color:BASE.taupe,fontStyle:"italic",lineHeight:1.6,marginTop:8}}>{studioCompleted.length?`${studioCompleted.length} ${studioCompleted.length===1?"experience":"experiences"} complete. Your progress is saved to your account.`:"This will fill in as you go — sparks found, things you loved, patterns starting to show."}</div>
        </>:<div style={{marginTop:24,padding:20,borderRadius:18,background:BASE.surface,border:`1px solid ${BASE.border}`,fontSize:12.5,color:BASE.taupe}}>Experiences are coming soon.</div>}
        <RebuildWorkspaceGallery key={`${ctx.user?.id}:${studioProgram._studioId}:gallery`} ctx={ctx} programId={studioProgram._studioId} program={studioProgram} experiences={experiences} onOpen={r=>{if(r.scope==="preview")setRebuildView("dynamic-preview");else {setRebuildDynamicExpId(r.experienceId);setRebuildView("dynamic-exp")}}}/>
        <details style={{marginTop:20}}><summary style={{fontSize:12,color:BASE.taupe,cursor:"pointer"}}>Revisit experiences</summary>{experiences.map(e=><button key={e.id} onClick={()=>openExperience(e,wasCompleted(e.id))} style={{display:"block",width:"100%",padding:12,marginTop:8,borderRadius:14,border:`1px solid ${BASE.border}`,background:BASE.surface,color:BASE.cream,textAlign:"left"}}>{e.title}</button>)}</details>
        <div style={{height:44}}/>
      </div>
    }

    if(rebuildView==="dynamic-exp"||rebuildView==="dynamic-review-start") {
      const exp=currentStudioExp
      if(!exp){setRebuildView("dynamic-home");return null}
      const c=exp.content||{}; const idx=currentStudioIdx
      const versions=[["green","I've got room"],["yellow","Keep it doable"],["red","Make it small"],["recovery","Bare minimum"]].filter(([k])=>c[k])
      const chosen=(rebuildCapPick&&c[rebuildCapPick])?rebuildCapPick:(c.yellow?"yellow":versions[0]?.[0])
      const completeStudioExperience=async()=>{
        setRebuildCapPick(null)
        const nextExp=idx<experiences.length-1?experiences[idx+1]:null
        if(!wasCompleted(exp.id)&&completeRebuildExperience){const saved=await completeRebuildExperience({programKey:studioProgram.id,rebuildId:studioProgram._studioId,experienceId:exp.id,experienceNumber:idx+1,nextExperienceId:nextExp?.id||null,nextExperienceNumber:nextExp?idx+2:null,isLast:!nextExp});if(!saved)return false}
        if((c.starter_id==='come-back-foundation-01'||c.starter_id==='come-back-experience-02'&&blocksOf(c).some(b=>b.id==='two-workshops'))&&nextExp){openExperience(nextExp);return true}
        setRebuildDynamicExpId(exp.id)
        setRebuildView("dynamic-complete")
        if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"instant"})
      }
      if((c.starter_id==='come-back-foundation-01'&&blocksOf(c).some(b=>b.id==='one-discover'))||(c.starter_id==='come-back-experience-02'&&blocksOf(c).some(b=>['two-sort','two-workshops'].includes(b.id))))return <div style={{padding:"10px 22px 40px"}}><RebuildExperienceOne key={`${ctx.user?.id}:${exp.id}:editorial:${rebuildView==="dynamic-review-start"}`} startAtBeginning={rebuildView==="dynamic-review-start"} experienceNumber={idx+1} experienceCount={plannedExperienceCount} ctx={ctx} blocks={blocksOf(c)} programId={studioProgram._studioId} experienceId={exp.id} scope={String(exp.id)} cover={c.photo?c:{photo:studioProgram.image,imagePosition:studioProgram.imagePosition,imageZoom:studioProgram.imageZoom}} onBack={returnToStudioHome} onFinish={completeStudioExperience}/></div>
      if(blocksOf(c).length)return <div style={{padding:"10px 22px 40px"}}><RebuildPhoto item={c} height={250}/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream,marginBottom:12}}>{exp.title}</div>{c.description&&<p style={{fontSize:14,lineHeight:1.65,color:BASE.taupe,whiteSpace:"pre-wrap"}}>{c.description}</p>}<RebuildActivityPlayer key={`${ctx.user?.id}:${exp.id}`} ctx={ctx} blocks={blocksOf(c)} programId={studioProgram._studioId} experienceId={exp.id} scope={String(exp.id)} onBack={returnToStudioHome} onFinish={completeStudioExperience}/></div>
      return <div className="fade-in" style={{padding:"10px 22px 0"}}>
        <div onClick={()=>setRebuildView("dynamic-home")} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:"pointer",marginBottom:16}}>‹ {studioProgram.title}</div>
        <RebuildPhoto item={c} height={250}/>
        <div style={{fontSize:10.5,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:BASE.taupe}}>Experience {idx+1}</div>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:26,fontWeight:700,color:BASE.cream,marginTop:6,lineHeight:1.2}}>{exp.title}</div>
        {c.description&&<div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:14.5,color:BASE.taupe,marginTop:10,lineHeight:1.55,whiteSpace:"pre-wrap"}}>{c.description}</div>}

        {c.anchorEnabled&&(c.anchorTitle||c.anchorBody)&&<><div style={{height:1,background:BASE.border,margin:"22px 0 20px"}}/><div style={{fontSize:10.5,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#9B6BC3",marginBottom:10}}>Today's Anchor</div>{c.anchorTitle&&<div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:26,fontWeight:700,color:BASE.cream,lineHeight:1.25}}>{c.anchorTitle}</div>}{c.anchorBody&&<div style={{fontSize:13,color:BASE.creamDim,lineHeight:1.65,marginTop:10,whiteSpace:"pre-wrap"}}>{c.anchorBody}</div>}</>}

        {c.versionEnabled&&versions.length>0&&<div style={{marginTop:28}}><div style={{fontSize:10.5,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#9B6BC3",marginBottom:10}}>Your Version Today</div><div style={{marginBottom:12}}>{versions.map(([k,l])=><span key={k} onClick={()=>setRebuildCapPick(k)} style={{display:"inline-block",padding:"9px 14px",borderRadius:999,marginRight:7,marginBottom:8,fontSize:12,fontWeight:700,cursor:"pointer",background:chosen===k?"linear-gradient(135deg,#E984B4,#A87BD1)":BASE.surface,color:chosen===k?"#fff":BASE.creamDim,border:`1px solid ${chosen===k?"transparent":BASE.border}`}}>{l}</span>)}</div><div style={{borderRadius:16,background:"rgba(201,123,168,.1)",padding:"16px 18px",fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15,color:BASE.cream,lineHeight:1.5}}>{c[chosen]}</div></div>}

        {c.stillEnabled&&c.stillQuestion&&<div style={{marginTop:24}}><div style={{height:1,background:BASE.border,margin:"0 0 20px"}}/><div style={{fontSize:10.5,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#9B6BC3",marginBottom:10}}>Still You or Not?</div><div style={{fontSize:13.5,fontWeight:700,color:BASE.cream,marginBottom:12}}>{c.stillQuestion}</div><div>{(c.stillOptions||[]).map(o=><span key={o} style={{display:"inline-block",padding:"9px 14px",borderRadius:999,marginRight:7,marginBottom:8,fontSize:12,fontWeight:700,background:BASE.surface,color:BASE.creamDim,border:`1px solid ${BASE.border}`}}>{o}</span>)}</div></div>}

        <ContentShareActions ctx={ctx} source={contentSource(exp,'rebuild_experience',{id:studioProgram._studioId,title:studioProgram.title})}/>
        <div onClick={completeStudioExperience} style={{marginTop:26,textAlign:"center",padding:"15px 0",borderRadius:999,cursor:"pointer",background:"linear-gradient(135deg,#E984B4,#A87BD1)",color:"#fff",fontSize:13.5,fontWeight:700}}>{idx===experiences.length-1?"Complete Rebuild":"Complete Experience"}</div>
        <div style={{height:44}}/>
      </div>
    }
  }

  // Any stale pre-Admin-Studio Rebuild selection is no longer rendered.
  return <div className="fade-in" style={{padding:"10px 22px 0"}}>
    <div onClick={()=>{setRebuildActiveProgram(null);setRebuildView("intro")}} style={{fontSize:13,fontWeight:700,color:BASE.taupe,cursor:"pointer",marginBottom:16}}>‹ Rebuild</div>
    <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:24,fontWeight:700,color:BASE.cream}}>This Rebuild is no longer in the live library.</div>
    <div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,marginTop:10}}>Choose a published Rebuild from the library.</div>
  </div>
}
