import { BASE } from '../lib/theme.js'
import { BLOOM_PILLARS, BLOOM_TRENDING } from '../data/bloom.js'
import { FOR_YOU_ITEMS } from '../data/foryou.js'
import { SEASONAL_ITEMS } from '../data/seasonal.js'
import { GLOW_TOPICS, GLOW_BY_KEY } from '../data/glow.js'
import { RESET_EXPLORE } from '../data/reset.js'
import { F_BY_ID } from '../data/flourish.js'
import { REBUILD_PROGRAMS, RITUALS } from '../data/rebuild.js'

const FONT = "'Cormorant Garamond', serif"
const pink = '#C9558E'
const grad = 'linear-gradient(135deg,#E984B4,#A87BD1)'
const sourceLabels = { bloom:'Bloom', move:'Move', nourish:'Nourish', rebuild:'Rebuild', ritual:'Ritual', personal:'My life' }

const fmtDate = (s) => {
  if (!s) return ''
  try { return new Date(s + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) } catch(e){ return s }
}

function ReverieSearchBox({ value, onChange, placeholder }) {
  return <div style={{display:'flex',alignItems:'center',gap:9,border:`1px solid ${BASE.border}`,background:BASE.surface,borderRadius:16,padding:'12px 14px',marginBottom:18}}><span style={{fontSize:14}}>⌕</span><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete="off" style={{border:'none',outline:'none',background:'transparent',width:'100%',fontSize:13,color:BASE.cream}}/></div>
}

export function renderReverie(ctx) {
  const { tab, reverieSection, setReverieSection, reverieEntries, setReverieEntries, reverieDraft, setReverieDraft, reverieComposerOpen, setReverieComposerOpen, reverieSearch, setReverieSearch, savedBloom, rebuildSaved, woLog, foodDays, progress, rebuildFLYA, likedFeed, setTab, setBloomArticle, openBloomCard, setBloomPillar, setGlowTopic, setGlowItem, setGlowSheet, setGlowOpen, setResetPage, setFlourishProject, setRebuildSection, setRebuildActiveProgram, setRebuildView } = ctx
  if (tab !== 'reverie') return null

  const today = new Date().toISOString().slice(0,10)
  const entries = [...(reverieEntries || [])].sort((a,b)=>(a.date < b.date ? 1 : -1))
  const scrapbookEntries = entries
  const q = (reverieSearch || '').trim().toLowerCase()
  const filteredHistory = entries.filter(x => !q || [x.title,x.note,x.source].join(' ').toLowerCase().includes(q))

  const allGlowTopics = Array.isArray(GLOW_TOPICS) ? GLOW_TOPICS : []
  const findGlow = (wantedId, wantedTopic) => {
    const topics = wantedTopic ? [wantedTopic] : allGlowTopics.map(t=>t.key)
    for (const key of topics) {
      const T = GLOW_BY_KEY(key)
      if (!T) continue
      const pools = [T.guides,T.wins,T.extra,T.types,T.learn]
      if (T.wardrobe) pools.push(T.wardrobe.today,T.wardrobe.ideas,T.wardrobe.gym,T.wardrobe.plates)
      for (const pool of pools) {
        const hit = (Array.isArray(pool) ? pool : []).find(x => String(x.id || x.n) === String(wantedId))
        if (hit) return { topic:key, item:hit, isWin:(T.wins||[]).includes(hit) }
      }
    }
    return null
  }
  const bloomSavedMeta = (id) => {
    const raw = String(id || '')
    const parts = raw.split(':')
    const type = parts[0]
    if (type === 'article') { const item=(BLOOM_TRENDING||[]).find(x=>String(x.id)===parts.slice(1).join(':')); return {title:item?.title || parts.slice(1).join(' '), item, type} }
    if (type === 'flourish') { const item=F_BY_ID(parts.slice(1).join(':')); return {title:item?.title || parts.slice(1).join(' '), item, type} }
    if (type === 'reset') { const item=(RESET_EXPLORE||[]).find(x=>String(x.id)===parts.slice(1).join(':')); return {title:item?.title || parts.slice(1).join(' '), item, type} }
    if (type === 'glow') { const hit=findGlow(parts.slice(2).join(':'),parts[1]); return {title:hit?.item?.title || hit?.item?.name || hit?.item?.n || parts.slice(2).join(' '), hit, type} }
    if (type === 'win') { const hit=findGlow(parts.slice(1).join(':')); return {title:hit?.item?.name || hit?.item?.title || parts.slice(1).join(' '), hit, type} }
    if (type === 'topic') { const name=parts.slice(1).join(':'); const card=(BLOOM_PILLARS||[]).flatMap(p=>p.cards||[]).find(c=>c.n===name); return {title:card?.n || name, item:card, type} }
    if (type === 'foryou') { const item=(FOR_YOU_ITEMS||[]).find(x=>String(x.id)===parts.slice(1).join(':')); return {title:item?.title || parts.slice(1).join(' '), item, type} }
    if (type === 'seasonal') { const item=(SEASONAL_ITEMS||[]).find(x=>String(x.id)===parts.slice(1).join(':')); return {title:item?.title || parts.slice(1).join(' '), item, type} }
    return {title:raw.replace(/[-_]/g,' '), type:'unknown'}
  }
  const openBloomSaved = (rawId) => {
    const m=bloomSavedMeta(rawId)
    setBloomArticle(null); setGlowItem(null); setGlowSheet(null); setResetPage(null); setFlourishProject(null)
    if (m.type==='article' && m.item) { setBloomPillar(null); setBloomArticle(m.item) }
    else if (m.type==='flourish' && m.item) { setBloomPillar('flourish'); setFlourishProject(m.item.id) }
    else if (m.type==='reset' && m.item) { setBloomPillar('reset'); setResetPage(m.item.id) }
    else if (m.type==='glow' && m.hit) { setBloomPillar('glow'); setGlowTopic(m.hit.topic); setGlowOpen(['guides','wins','learn']); setGlowItem(m.hit.item) }
    else if (m.type==='win' && m.hit) { setBloomPillar('glow'); setGlowTopic(m.hit.topic); setGlowOpen(['guides','wins','learn']); setGlowSheet(m.hit.item) }
    else if (m.type==='topic' && m.item) { setBloomPillar(null); openBloomCard(m.item) }
    else if (m.type==='seasonal') { setBloomPillar('seasonal') }
    else { setBloomPillar(null) }
    setTab('bloom'); if (typeof window!=='undefined') window.scrollTo({top:0,behavior:'auto'})
  }
  const saved = [
    ...(savedBloom || []).map((id)=>{ const m=bloomSavedMeta(id); return { id:'b-'+id, rawId:id, title:m.title, source:'Bloom', onOpen:()=>openBloomSaved(id) } }),
    ...(rebuildSaved || []).map((id)=>{
      const [kind,...rest]=String(id).split(':'); const rid=rest.join(':')
      const item=kind==='ritual' ? (RITUALS||[]).find(x=>x.id===rid) : (REBUILD_PROGRAMS||[]).find(x=>x.id===rid)
      return { id:'r-'+id, rawId:id, title:item?.title || rid.replace(/[-_]/g,' '), source:kind==='ritual'?'Ritual':'Rebuild', onOpen:()=>{ setRebuildSection(kind==='ritual'?'rituals':'rebuild'); if(kind==='program'&&rid==='feel-like-yourself-again'){setRebuildActiveProgram(rid);setRebuildView('intro')} setTab('rebuild'); if(typeof window!=='undefined')window.scrollTo({top:0,behavior:'auto'}) } }
    })
  ]
  const filteredSaved = saved.filter(x=>!q || (x.title+' '+x.source).toLowerCase().includes(q))

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0)
  const workoutsThisMonth = (woLog||[]).filter(w=>new Date((w.date||'')+'T12:00:00') >= monthStart).length
  const mealsThisMonth = Object.entries(foodDays||{}).filter(([d])=>new Date(d+'T12:00:00')>=monthStart).reduce((n,[,v])=>n+((v&&v.items)||[]).length,0)
  const livedThisMonth = entries.filter(e=>new Date((e.date||'')+'T12:00:00')>=monthStart).length
  const rebuildDone = (rebuildFLYA && rebuildFLYA.completed ? rebuildFLYA.completed.length : 0)

  const taste = []
  if ((likedFeed||[]).length) taste.push('Things you love')
  if ((savedBloom||[]).length) taste.push('Discovering')
  if ((woLog||[]).length) taste.push('Movement')
  if (mealsThisMonth) taste.push('Nourishing')
  if (rebuildDone) taste.push('Becoming')
  if (!taste.length) taste.push('Cozy','Beauty','Strength','At home')

  const persistEntries = (next) => {
    setReverieEntries(next)
    try { localStorage.setItem('nr_reverie_entries', JSON.stringify(next)) } catch(e) {}
  }
  const openComposer = (entry=null) => {
    setReverieDraft(entry ? { ...entry, editingId:entry.id } : { title:'', note:'', date:today, photo:null, originalImage:null, source:'personal', share:false, editingId:null })
    setReverieComposerOpen(true)
  }
  const saveEntry = () => {
    if (!String(reverieDraft.title||'').trim() && !reverieDraft.photo) return
    const payload = { id:reverieDraft.editingId || 'life-'+Date.now(), title:String(reverieDraft.title||'').trim() || 'A moment from my life', note:String(reverieDraft.note||'').trim(), date:reverieDraft.date || today, photo:reverieDraft.photo || null, originalImage:reverieDraft.originalImage || null, source:reverieDraft.source || 'personal', contentId:reverieDraft.contentId || null, share:!!reverieDraft.share }
    const current = reverieEntries || []
    const next = reverieDraft.editingId ? current.map(x=>x.id===reverieDraft.editingId?payload:x) : [...current,payload]
    persistEntries(next); setReverieComposerOpen(false)
  }
  const readPhoto = (file) => {
    if (!file) return
    const r = new FileReader(); r.onload = () => setReverieDraft(d=>({...d,photo:r.result})); r.readAsDataURL(file)
  }

  const TabBar = () => <div style={{display:'flex',gap:8,margin:'18px 0 26px'}}>{[['home','My Reverie'],['saved','Saved'],['history','History']].map(([k,l])=><button key={k} onClick={()=>{setReverieSection(k);setReverieSearch('')}} style={{flex:1,padding:'11px 5px',borderRadius:999,border:`1px solid ${reverieSection===k?pink:BASE.border}`,background:reverieSection===k?'#FBEAF2':BASE.surface,color:reverieSection===k?pink:BASE.creamDim,fontSize:12,fontWeight:700,cursor:'pointer'}}>{l}</button>)}</div>

  const PhotoStrip = () => (
    <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8,scrollSnapType:'x mandatory',WebkitOverflowScrolling:'touch'}}>
      {scrapbookEntries.slice(0,10).map(e=>{ const visual=e.photo||e.originalImage; return <div key={e.id} style={{minWidth:190,scrollSnapAlign:'start'}}>
        <div style={{height:230,borderRadius:20,overflow:'hidden',background:'linear-gradient(145deg,#F4E6F2,#E9E4F4)',position:'relative'}}>
          {visual?<img src={visual} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,color:'#B987A3'}}>✧</div>}
          {!e.photo && <button onClick={()=>openComposer(e)} style={{position:'absolute',left:10,right:10,bottom:10,border:'none',borderRadius:999,padding:'9px 10px',background:'rgba(255,255,255,.94)',color:pink,fontSize:11,fontWeight:800,boxShadow:'0 2px 10px rgba(42,21,34,.12)'}}>＋ Add your photo</button>}
        </div>
        <div style={{fontFamily:FONT,fontSize:17,fontWeight:600,marginTop:9,color:BASE.cream}}>{e.title}</div><div style={{fontSize:11,color:BASE.taupe,marginTop:2}}>{fmtDate(e.date)} · {sourceLabels[e.source]||e.source}</div>
      </div>})}
      <button onClick={()=>openComposer()} style={{minWidth:190,height:230,borderRadius:20,border:'1px dashed #D8B9C8',background:'linear-gradient(145deg,#FBF0F4,#F1E8F7)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:BASE.creamDim,cursor:'pointer',scrollSnapAlign:'start'}}><span style={{fontSize:30,fontWeight:300}}>＋</span><span style={{fontFamily:FONT,fontSize:18}}>Add something I did</span><span style={{fontSize:11,color:BASE.taupe,maxWidth:145,lineHeight:1.45}}>A photo, a memory, a little proof you lived it.</span></button>
    </div>
  )

  const Composer = () => !reverieComposerOpen ? null : <div style={{position:'fixed',inset:0,zIndex:120,background:'rgba(42,21,34,.34)',overflow:'hidden'}} onClick={()=>setReverieComposerOpen(false)}><div onClick={e=>e.stopPropagation()} style={{position:'absolute',left:'50%',transform:'translateX(-50%)',top:'8dvh',bottom:0,width:'100%',maxWidth:440,overflowY:'auto',WebkitOverflowScrolling:'touch',overscrollBehavior:'contain',background:'#FFF9F7',borderRadius:'28px 28px 0 0',padding:'24px 20px calc(34px + env(safe-area-inset-bottom))',boxShadow:'0 -10px 40px rgba(42,21,34,.15)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontFamily:FONT,fontSize:27,fontWeight:600,color:BASE.cream}}>Add to My Reverie</div><div style={{fontSize:12,color:BASE.taupe,marginTop:3}}>Something you actually lived.</div></div><button onClick={()=>setReverieComposerOpen(false)} style={{border:'none',background:'transparent',fontSize:24,color:BASE.taupe}}>×</button></div><label style={{display:'block',marginTop:20,border:'1px dashed #D8B9C8',borderRadius:20,overflow:'hidden',cursor:'pointer',background:'#F7EDF3'}}>{reverieDraft.photo?<img src={reverieDraft.photo} alt="" style={{display:'block',width:'100%',height:220,objectFit:'cover'}}/>:<div style={{height:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:BASE.taupe}}><span style={{fontSize:30}}>＋</span><b style={{fontSize:12}}>{reverieDraft.source && reverieDraft.source!=='personal' ? 'Upload your photo of this' : 'Upload what you did'}</b><span style={{fontSize:11}}>Add a photo if you want to remember it.</span></div>}<input type="file" accept="image/*" onChange={e=>readPhoto(e.target.files&&e.target.files[0])} style={{display:'none'}}/></label><input value={reverieDraft.title} onChange={e=>setReverieDraft(d=>({...d,title:e.target.value}))} placeholder="What did you do?" style={{width:'100%',marginTop:14,padding:'13px 14px',borderRadius:14,border:`1px solid ${BASE.border}`,background:'#fff',fontSize:14,outline:'none'}}/><textarea value={reverieDraft.note} onChange={e=>setReverieDraft(d=>({...d,note:e.target.value}))} placeholder="Add a note (optional)" rows={3} style={{width:'100%',marginTop:10,padding:'13px 14px',borderRadius:14,border:`1px solid ${BASE.border}`,background:'#fff',fontSize:13,outline:'none',resize:'none'}}/><input type="date" value={reverieDraft.date} onChange={e=>setReverieDraft(d=>({...d,date:e.target.value}))} style={{width:'100%',marginTop:10,padding:'12px 14px',borderRadius:14,border:`1px solid ${BASE.border}`,background:'#fff',fontSize:13,color:BASE.cream}}/><label style={{display:'flex',alignItems:'center',gap:11,marginTop:15,padding:'13px 14px',borderRadius:14,background:'#fff',border:`1px solid ${BASE.border}`,fontSize:12.5,color:BASE.creamDim}}><input type="checkbox" checked={!!reverieDraft.share} onChange={e=>setReverieDraft(d=>({...d,share:e.target.checked}))}/><span><b>Share to Community</b><br/><span style={{color:BASE.taupe,fontSize:11}}>Optional · ready for when Community goes live.</span></span></label><button onClick={saveEntry} style={{width:'100%',marginTop:16,padding:'14px',border:'none',borderRadius:999,background:grad,color:'#fff',fontWeight:800,cursor:'pointer'}}>Add to My Reverie</button></div></div>

  return <div className="fade-in" style={{padding:'24px 18px 30px',color:BASE.cream}}>
    <div style={{fontFamily:FONT,fontSize:34,fontWeight:600,lineHeight:1}}>My Reverie</div>
    <div style={{fontFamily:FONT,fontStyle:'italic',fontSize:15,color:BASE.taupe,lineHeight:1.45,marginTop:7}}>The life you’re saving, trying, and making your own to become her.</div>
    <TabBar/>

    {reverieSection==='home' && <>
      <div style={{fontFamily:FONT,fontSize:25,fontWeight:600,marginTop:6}}>Lately, you’re loving…</div>
      <div style={{display:'flex',gap:8,overflowX:'auto',margin:'13px -2px 38px',padding:'2px'}}>{taste.map(t=><span key={t} style={{whiteSpace:'nowrap',padding:'8px 12px',borderRadius:999,background:'#fff',border:`1px solid ${BASE.border}`,fontSize:11.5,color:BASE.creamDim}}>{t}</span>)}</div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'end',marginBottom:14}}><div><div style={{fontSize:10,fontWeight:800,letterSpacing:2.2,color:BASE.taupe,textTransform:'uppercase'}}>Your life, lately</div><div style={{fontFamily:FONT,fontSize:27,fontWeight:600,marginTop:5}}>A scrapbook of living.</div></div>{entries.length>0&&<button onClick={()=>setReverieSection('history')} style={{border:'none',background:'transparent',color:pink,fontSize:11.5,fontWeight:700}}>See history →</button>}</div>
      <PhotoStrip/>

      <div style={{marginTop:48}}><div style={{fontSize:10,fontWeight:800,letterSpacing:2.2,color:BASE.taupe,textTransform:'uppercase'}}>Becoming Her</div><div style={{fontFamily:FONT,fontSize:27,fontWeight:600,marginTop:5}}>Evidence of the life you’re building.</div><div style={{fontSize:12.5,color:BASE.taupe,fontStyle:'italic',marginTop:5}}>No grades. No streaks. Just what you’ve actually made room for.</div></div>
      <div style={{marginTop:17,borderRadius:22,background:'#fff',border:`1px solid ${BASE.border}`,padding:'20px'}}><div style={{fontFamily:FONT,fontSize:20,fontWeight:600}}>{new Date().toLocaleDateString('en-US',{month:'long'})}, so far</div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:16}}>{[[livedThisMonth,'things you added'],[workoutsThisMonth,'times you moved'],[mealsThisMonth,'foods you logged'],[rebuildDone,'Rebuild experiences']].map(([n,l])=><div key={l} style={{padding:'14px',borderRadius:16,background:'#FCF5F7'}}><div style={{fontFamily:FONT,fontSize:27,fontWeight:700,color:pink}}>{n}</div><div style={{fontSize:11.5,color:BASE.taupe,lineHeight:1.35}}>{l}</div></div>)}</div>{progress&&progress.movement&&progress.movement.consistency&&progress.movement.consistency.msg&&<div style={{marginTop:15,paddingTop:14,borderTop:`1px solid ${BASE.border}`,fontFamily:FONT,fontStyle:'italic',fontSize:16,color:BASE.creamDim,lineHeight:1.5}}>{progress.movement.consistency.msg}</div>}</div>
    </>}

    {reverieSection==='saved' && <><div style={{fontFamily:FONT,fontSize:28,fontWeight:600}}>Saved</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.5,margin:'5px 0 17px'}}>Everything you wanted to come back to, in one place.</div><ReverieSearchBox value={reverieSearch} onChange={setReverieSearch} placeholder="Search your saves"/>{filteredSaved.length?<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{filteredSaved.map(x=><div key={x.id} onClick={x.onOpen} role="button" tabIndex={0} style={{minHeight:150,borderRadius:18,background:'linear-gradient(145deg,#F4E6F2,#E9E4F4)',padding:14,display:'flex',flexDirection:'column',justifyContent:'flex-end',cursor:'pointer'}}><div style={{fontFamily:FONT,fontSize:18,fontWeight:600,textTransform:'capitalize'}}>{x.title}</div><div style={{fontSize:10,color:BASE.taupe,marginTop:4,textTransform:'uppercase',letterSpacing:1}}>{x.source}</div></div>)}</div>:<div style={{padding:'35px 20px',borderRadius:20,background:'#fff',border:`1px solid ${BASE.border}`,textAlign:'center'}}><div style={{fontFamily:FONT,fontSize:22,fontWeight:600}}>Nothing saved here yet.</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.55,marginTop:7}}>Save something anywhere in True Reverie and this becomes the place to find it again.</div></div>}</>}

    {reverieSection==='history' && <><div style={{display:'flex',justifyContent:'space-between',alignItems:'end'}}><div><div style={{fontFamily:FONT,fontSize:28,fontWeight:600}}>History</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.5,marginTop:5}}>Things you’ve actually brought into your life.</div></div><button onClick={()=>openComposer()} style={{border:'none',background:'#FBEAF2',color:pink,borderRadius:999,padding:'9px 12px',fontSize:11,fontWeight:700}}>＋ Add</button></div><div style={{marginTop:17}}><ReverieSearchBox value={reverieSearch} onChange={setReverieSearch} placeholder="Search what you’ve done"/></div>{filteredHistory.length?<div style={{display:'grid',gap:22}}>{filteredHistory.map(e=>{const visual=e.photo||e.originalImage;return <article key={e.id} style={{overflow:'hidden',borderRadius:22,background:'#fff',border:`1px solid ${BASE.border}`,boxShadow:'0 6px 22px rgba(55,31,45,.04)'}}><div style={{height:330,background:'linear-gradient(145deg,#F4E6F2,#E9E4F4)',position:'relative'}}>{visual?<img src={visual} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,color:'#B987A3'}}>✧</div>}{!e.photo&&<button onClick={()=>openComposer(e)} style={{position:'absolute',right:14,bottom:14,border:'none',borderRadius:999,padding:'10px 13px',background:'rgba(255,255,255,.95)',color:pink,fontSize:11,fontWeight:800}}>＋ Add your photo</button>}</div><div style={{padding:'16px 17px 18px'}}><div style={{fontFamily:FONT,fontSize:23,fontWeight:600}}>{e.title}</div><div style={{fontSize:11,color:BASE.taupe,marginTop:4}}>{fmtDate(e.date)} · {sourceLabels[e.source]||e.source}</div>{e.note&&<div style={{fontSize:13,color:BASE.creamDim,lineHeight:1.5,marginTop:9}}>{e.note}</div>}{e.share&&<div style={{fontSize:10.5,color:pink,marginTop:8}}>Ready to share to Community</div>}</div></article>})}</div>:<div style={{padding:'34px 20px',borderRadius:20,background:'#fff',border:`1px solid ${BASE.border}`,textAlign:'center'}}><div style={{fontFamily:FONT,fontSize:22,fontWeight:600}}>Your history starts with living.</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.55,margin:'7px 0 17px'}}>Add something you did—even if True Reverie never suggested it.</div><button onClick={()=>openComposer()} style={{border:'none',borderRadius:999,padding:'11px 15px',background:grad,color:'#fff',fontWeight:700,fontSize:11.5}}>＋ Add something I did</button></div>}</>}
    <Composer/>
  </div>
}
