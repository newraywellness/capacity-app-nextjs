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
let reveriePhotoDrag = null

const fmtDate = (s) => {
  if (!s) return ''
  try { return new Date(s + 'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}) } catch(e){ return s }
}

function ReverieSearchBox({ value, onChange, placeholder }) {
  return <div style={{display:'flex',alignItems:'center',gap:9,border:`1px solid ${BASE.border}`,background:BASE.surface,borderRadius:16,padding:'12px 14px',marginBottom:18}}><span style={{fontSize:14}}>⌕</span><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoComplete="off" style={{border:'none',outline:'none',background:'transparent',width:'100%',fontSize:13,color:BASE.cream}}/></div>
}

export function renderReverie(ctx) {
  const { tab, reverieSection, setReverieSection, reverieEntries, setReverieEntries, reverieDraft, setReverieDraft, reverieComposerOpen, setReverieComposerOpen, reverieSearch, setReverieSearch, savedBloom, contentInteractions = [], rebuildSaved, rebuildFLYA, likedFeed, setTab, setBodyView, setMoveCategory, setMoveMood, setMoveTime, setMoveSearch, setBloomArticle, openBloomCard, setBloomPillar, setGlowTopic, setGlowItem, setGlowSheet, setGlowOpen, setResetPage, setFlourishProject, setRebuildSection, setRebuildActiveProgram, setRebuildView } = ctx
  if (tab !== 'reverie') return null
  if (reverieSection === 'history') setTimeout(()=>setReverieSection('home'),0)

  const today = new Date().toISOString().slice(0,10)
  const entries = [...(reverieEntries || [])].sort((a,b)=>(a.date < b.date ? 1 : -1))
  const scrapbookEntries = entries
  const q = (reverieSearch || '').trim().toLowerCase()
  const didThisEntries = (contentInteractions || []).filter(x=>x.action==='did_this').map(x=>({ id:'did-'+x.id, contentKey:x.content_key, title:x.title || x.content_key, note:'', source:x.content_type || 'bloom', date:(x.created_at||'').slice(0,10), photo:x.image_url || null, interaction:true }))
  const allHistoryEntries = [...entries, ...didThisEntries].sort((a,b)=>(a.date < b.date ? 1 : -1))
  const filteredHistory = allHistoryEntries.filter(x => !q || [x.title,x.note,x.source].join(' ').toLowerCase().includes(q))

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
  const openInteraction = (contentKey) => {
    const key = String(contentKey || '')
    if (!key) return

    if (key.startsWith('move:')) {
      const moveId = key.slice(5)
      if (setMoveCategory) setMoveCategory(null)
      if (setMoveMood) setMoveMood(null)
      if (setMoveTime) setMoveTime(null)
      if (setMoveSearch) setMoveSearch('')
      if (setBodyView) setBodyView('gym')
      setTab('body')
      setTimeout(() => {
        const el = typeof document !== 'undefined' ? document.getElementById(`move-card-${moveId}`) : null
        if (el) el.scrollIntoView({behavior:'smooth',block:'start'})
      }, 80)
      return
    }

    const parts = key.split(':')
    const prefix = parts.shift() || 'foryou'
    const itemId = parts.join(':')
    setTab('bloom')
    setTimeout(() => {
      const el = typeof document !== 'undefined' ? document.getElementById(`bloom-card-${prefix}-${itemId}`) : null
      if (el) el.scrollIntoView({behavior:'smooth',block:'center'})
    }, 80)
  }

  const interactionSaves = (contentInteractions || []).filter(x=>x.action==='saved').map(x=>({ id:'i-'+x.id, rawId:x.content_key, title:x.title || x.content_key, source:(x.content_type || 'Saved').replace('_',' '), image:x.image_url || null, onOpen:()=>openInteraction(x.content_key) }))
  const interactionKeys = new Set(interactionSaves.map(x=>x.rawId))
  const saved = [
    ...interactionSaves,
    ...(savedBloom || []).filter(id=>!interactionKeys.has(id)).map((id)=>{ const m=bloomSavedMeta(id); return { id:'b-'+id, rawId:id, title:m.title, source:'Bloom', onOpen:()=>openBloomSaved(id) } }),
    ...(rebuildSaved || []).map((id)=>{
      const [kind,...rest]=String(id).split(':'); const rid=rest.join(':')
      const item=kind==='ritual' ? (RITUALS||[]).find(x=>x.id===rid) : (REBUILD_PROGRAMS||[]).find(x=>x.id===rid)
      return { id:'r-'+id, rawId:id, title:item?.title || rid.replace(/[-_]/g,' '), source:kind==='ritual'?'Ritual':'Rebuild', onOpen:()=>{ setRebuildSection(kind==='ritual'?'rituals':'rebuild'); if(kind==='program'&&rid==='feel-like-yourself-again'){setRebuildActiveProgram(rid);setRebuildView('intro')} setTab('rebuild'); if(typeof window!=='undefined')window.scrollTo({top:0,behavior:'auto'}) } }
    })
  ]
  const filteredSaved = saved.filter(x=>!q || (x.title+' '+x.source).toLowerCase().includes(q))

  const taste = []
  if ((likedFeed||[]).length) taste.push('Things you love')
  if ((savedBloom||[]).length) taste.push('Discovering')
  if (rebuildFLYA && rebuildFLYA.completed && rebuildFLYA.completed.length) taste.push('Becoming')
  if (!taste.length) taste.push('Cozy','Beauty','Strength','At home')

  const persistEntries = (next) => {
    setReverieEntries(next)
    try { localStorage.setItem('nr_reverie_entries', JSON.stringify(next)) } catch(e) {}
  }
  const openComposer = (entry=null) => {
    setReverieDraft(entry ? { ...entry, editingId:entry.id } : { title:'', note:'', date:today, photo:null, photoPosition:{x:50,y:50}, originalImage:null, source:'personal', share:false, editingId:null })
    setReverieComposerOpen(true)
  }
  const saveEntry = () => {
    if (!String(reverieDraft.title||'').trim() && !reverieDraft.photo) return
    const payload = { id:reverieDraft.editingId || 'life-'+Date.now(), title:String(reverieDraft.title||'').trim() || 'A moment from my life', note:String(reverieDraft.note||'').trim(), date:reverieDraft.date || today, photo:reverieDraft.photo || null, photoPosition:reverieDraft.photoPosition || {x:50,y:50}, originalImage:reverieDraft.originalImage || null, source:reverieDraft.source || 'personal', contentId:reverieDraft.contentId || null, share:!!reverieDraft.share }
    const current = reverieEntries || []
    const next = reverieDraft.editingId ? current.map(x=>x.id===reverieDraft.editingId?payload:x) : [...current,payload]
    persistEntries(next); setReverieComposerOpen(false)
  }
  const readPhoto = (file) => {
    if (!file) return
    const r = new FileReader(); r.onload = () => setReverieDraft(d=>({...d,photo:r.result,originalImage:r.result,photoPosition:{x:50,y:50}})); r.readAsDataURL(file)
  }

  const TabBar = () => <div style={{display:'flex',gap:8,margin:'18px 0 26px'}}>{[['home','My Reverie'],['saved','Saved']].map(([k,l])=><button key={k} onClick={()=>{setReverieSection(k);setReverieSearch('')}} style={{flex:1,padding:'11px 5px',borderRadius:999,border:`1px solid ${reverieSection===k?pink:BASE.border}`,background:reverieSection===k?'#FBEAF2':BASE.surface,color:reverieSection===k?pink:BASE.creamDim,fontSize:12,fontWeight:700,cursor:'pointer'}}>{l}</button>)}</div>

  const PhotoStrip = () => (
    <div style={{position:'relative',margin:'0 -18px'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 18px 9px'}}>
        <span style={{fontSize:10.5,color:BASE.taupe,fontWeight:700}}>Swipe through your life</span>
        <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:18,color:pink,letterSpacing:-2}}>← →</span><button type="button" aria-label="Add to My Reverie" onClick={()=>openComposer()} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${pink}`,background:'#fff',color:pink,fontSize:22,lineHeight:1,fontWeight:400,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 3px 12px rgba(42,21,34,.07)'}}>＋</button></div>
      </div>
      <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0 42px 10px 18px',scrollSnapType:'x mandatory',WebkitOverflowScrolling:'touch',scrollPaddingLeft:18}}>
        {scrapbookEntries.slice(0,10).map(e=>{ const visual=e.photo||e.originalImage; return <div key={e.id} style={{flex:'0 0 74%',maxWidth:270,scrollSnapAlign:'start'}}>
          <div style={{height:230,borderRadius:20,overflow:'hidden',background:'linear-gradient(145deg,#F4E6F2,#E9E4F4)',position:'relative',boxShadow:'0 7px 24px rgba(55,31,45,.06)'}}>
            {visual?<img src={visual} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${e.photoPosition?.x??50}% ${e.photoPosition?.y??50}%`}}/>:<div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,color:'#B987A3'}}>✧</div>}
            {!e.photo && <button onClick={()=>openComposer(e)} style={{position:'absolute',left:10,right:10,bottom:10,border:'none',borderRadius:999,padding:'9px 10px',background:'rgba(255,255,255,.94)',color:pink,fontSize:11,fontWeight:800,boxShadow:'0 2px 10px rgba(42,21,34,.12)'}}>＋ Add your photo</button>}
          </div>
          <div style={{fontFamily:FONT,fontSize:17,fontWeight:600,marginTop:9,color:BASE.cream}}>{e.title}</div><div style={{fontSize:11,color:BASE.taupe,marginTop:2}}>{fmtDate(e.date)} · {sourceLabels[e.source]||e.source}</div>
        </div>})}
        <button onClick={()=>openComposer()} style={{flex:'0 0 74%',maxWidth:270,height:230,borderRadius:20,border:'1px dashed #D8B9C8',background:'linear-gradient(145deg,#FBF0F4,#F1E8F7)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:BASE.creamDim,cursor:'pointer',scrollSnapAlign:'start'}}><span style={{fontSize:30,fontWeight:300}}>＋</span><span style={{fontFamily:FONT,fontSize:18}}>Add something I did</span><span style={{fontSize:11,color:BASE.taupe,maxWidth:145,lineHeight:1.45}}>A photo, a memory, a little proof you lived it.</span></button>
      </div>
      <div style={{position:'absolute',right:0,top:31,bottom:10,width:28,pointerEvents:'none',background:'linear-gradient(90deg,rgba(255,249,247,0),#FFF9F7)'}}/>
    </div>
  )

  const reverieSuggestions = [
    ...(contentInteractions || []).filter(x=>x.action==='did_this').map(x=>({key:'did:'+x.id,title:x.title||x.content_key,source:x.content_type||'bloom',contentKey:x.content_key,image:x.image_url||null,label:'I Did This'})),
    ...saved.map(x=>({key:'save:'+x.id,title:x.title,source:String(x.source||'saved').toLowerCase(),contentKey:x.rawId,image:x.image||null,label:'Saved'}))
  ].filter((x,i,a)=>x.title && a.findIndex(y=>String(y.title).toLowerCase()===String(x.title).toLowerCase())===i).slice(0,8)

  const chooseReverieSuggestion = (s) => setReverieDraft(d=>({...d,title:s.title,source:s.source||'personal',contentId:s.contentKey||null,originalImage:s.image||d.originalImage||null}))

  const Composer = () => !reverieComposerOpen ? null : <div style={{position:'fixed',inset:0,zIndex:120,background:'rgba(42,21,34,.34)',overflow:'hidden',height:'100dvh',display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setReverieComposerOpen(false)}><div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:440,maxHeight:'92dvh',display:'flex',flexDirection:'column',overflowY:'auto',WebkitOverflowScrolling:'touch',touchAction:'pan-y',overscrollBehaviorY:'contain',background:'#FFF9F7',borderRadius:'28px 28px 0 0',padding:'24px 20px calc(34px + env(safe-area-inset-bottom))',boxSizing:'border-box',boxShadow:'0 -10px 40px rgba(42,21,34,.15)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{fontFamily:FONT,fontSize:27,fontWeight:600,color:BASE.cream}}>Add to My Reverie</div><div style={{fontSize:12,color:BASE.taupe,marginTop:3}}>Something you actually lived.</div></div><button onClick={()=>setReverieComposerOpen(false)} style={{border:'none',background:'transparent',fontSize:24,color:BASE.taupe}}>×</button></div><div style={{marginTop:20}}>
  <input id="reverie-photo-input" type="file" accept="image/*" onChange={e=>readPhoto(e.target.files&&e.target.files[0])} style={{display:'none'}}/>
  <div onTouchStart={e=>{if(!reverieDraft.photo||!e.touches?.[0])return;const t=e.touches[0];reveriePhotoDrag={x:t.clientX,y:t.clientY,start:{...(reverieDraft.photoPosition||{x:50,y:50})}}}} onTouchMove={e=>{const d=reveriePhotoDrag,t=e.touches?.[0];if(!d||!t||!reverieDraft.photo)return;const dx=t.clientX-d.x,dy=t.clientY-d.y;setReverieDraft(v=>({...v,photoPosition:{x:Math.max(0,Math.min(100,d.start.x-dx*.35)),y:Math.max(0,Math.min(100,d.start.y-dy*.35))}}))}} onTouchEnd={()=>{reveriePhotoDrag=null}} onTouchCancel={()=>{reveriePhotoDrag=null}} style={{border:'1px dashed #D8B9C8',borderRadius:20,overflow:'hidden',background:'#F7EDF3',position:'relative',aspectRatio:'19 / 23',touchAction:'pan-y'}}>
    {reverieDraft.photo?<><img src={reverieDraft.photo} alt="" style={{display:'block',width:'100%',height:'100%',objectFit:'cover',objectPosition:`${reverieDraft.photoPosition?.x??50}% ${reverieDraft.photoPosition?.y??50}%`,pointerEvents:'none',userSelect:'none'}}/><div style={{position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',padding:'5px 9px',borderRadius:999,background:'rgba(44,31,43,.50)',color:'#fff',fontSize:10,fontWeight:700,pointerEvents:'none'}}>Drag photo to reposition</div></>:<button type="button" onClick={()=>document.getElementById('reverie-photo-input')?.click()} style={{position:'absolute',inset:0,width:'100%',height:'100%',border:'none',background:'transparent',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,color:BASE.taupe,cursor:'pointer'}}><span style={{fontSize:34}}>＋</span><b style={{fontSize:13}}>{reverieDraft.source && reverieDraft.source!=='personal' ? 'Add your photo of this' : 'Add a photo'}</b><span style={{fontSize:11}}>Tap to choose from your photos.</span></button>}
  </div>
  {reverieDraft.photo&&<div style={{display:'flex',gap:8,marginTop:9}}>
    <button type="button" onClick={()=>document.getElementById('reverie-photo-input')?.click()} style={{flex:1,border:`1px solid ${BASE.border}`,background:'#fff',borderRadius:999,padding:'9px 10px',fontSize:10.5,fontWeight:700,color:BASE.creamDim}}>Change photo</button>
    <button type="button" onClick={()=>setReverieDraft(d=>({...d,photoPosition:{x:50,y:50}}))} style={{flex:1,border:`1px solid ${BASE.border}`,background:'#fff',borderRadius:999,padding:'9px 10px',fontSize:10.5,fontWeight:700,color:BASE.creamDim}}>Center photo</button>
  </div>}
  {reverieDraft.photo&&<div style={{fontSize:10.5,color:BASE.taupe,textAlign:'center',marginTop:7}}>Drag the photo up, down, left, or right before adding it.</div>}
</div>{!reverieDraft.editingId&&reverieSuggestions.length>0&&<div style={{marginTop:14}}><div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:'uppercase',color:BASE.taupe,marginBottom:8}}>Use something you saved or did</div><div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:3}}>{reverieSuggestions.map(s=><button key={s.key} type="button" onClick={()=>chooseReverieSuggestion(s)} style={{whiteSpace:'nowrap',border:`1px solid ${reverieDraft.title===s.title?pink:BASE.border}`,background:reverieDraft.title===s.title?'#FBEAF2':'#fff',borderRadius:999,padding:'8px 11px',fontSize:10.5,color:reverieDraft.title===s.title?pink:BASE.creamDim,fontWeight:700}}>{s.label} · {s.title}</button>)}</div></div>}<input type="text" inputMode="text" value={reverieDraft.title} onChange={e=>setReverieDraft(d=>({...d,title:e.target.value}))} placeholder="What did you do?" style={{position:'relative',zIndex:2,width:'100%',marginTop:14,padding:'13px 14px',borderRadius:14,border:`1px solid ${BASE.border}`,background:'#fff',fontSize:14,outline:'none'}}/><textarea value={reverieDraft.note} onChange={e=>setReverieDraft(d=>({...d,note:e.target.value}))} placeholder="Add a note (optional)" rows={3} style={{width:'100%',marginTop:10,padding:'13px 14px',borderRadius:14,border:`1px solid ${BASE.border}`,background:'#fff',fontSize:13,outline:'none',resize:'none'}}/><input type="date" value={reverieDraft.date} onChange={e=>setReverieDraft(d=>({...d,date:e.target.value}))} style={{width:'100%',marginTop:10,padding:'12px 14px',borderRadius:14,border:`1px solid ${BASE.border}`,background:'#fff',fontSize:13,color:BASE.cream}}/><label style={{display:'flex',alignItems:'center',gap:11,marginTop:15,padding:'13px 14px',borderRadius:14,background:'#fff',border:`1px solid ${BASE.border}`,fontSize:12.5,color:BASE.creamDim}}><input type="checkbox" checked={!!reverieDraft.share} onChange={e=>setReverieDraft(d=>({...d,share:e.target.checked}))}/><span><b>Share to Community</b><br/><span style={{color:BASE.taupe,fontSize:11}}>Optional · ready for when Community goes live.</span></span></label><button onClick={saveEntry} style={{width:'100%',marginTop:16,padding:'14px',border:'none',borderRadius:999,background:grad,color:'#fff',fontWeight:800,cursor:'pointer'}}>Add to My Reverie</button></div></div>

  return <div className="fade-in" style={{padding:'24px 18px 30px',color:BASE.cream}}>
    <div style={{fontFamily:FONT,fontSize:34,fontWeight:600,lineHeight:1}}>My Reverie</div>
    <div style={{fontFamily:FONT,fontStyle:'italic',fontSize:15,color:BASE.taupe,lineHeight:1.45,marginTop:7}}>The life you’re saving, trying, and making your own to become her.</div>
    <TabBar/>

    {reverieSection==='home' && <>
      <div style={{fontFamily:FONT,fontSize:25,fontWeight:600,marginTop:6}}>Lately, you’re loving…</div>
      <div style={{display:'flex',gap:8,overflowX:'auto',margin:'13px -2px 38px',padding:'2px'}}>{taste.map(t=><span key={t} style={{whiteSpace:'nowrap',padding:'8px 12px',borderRadius:999,background:'#fff',border:`1px solid ${BASE.border}`,fontSize:11.5,color:BASE.creamDim}}>{t}</span>)}</div>

      <div style={{marginBottom:14}}><div style={{fontSize:10,fontWeight:800,letterSpacing:2.2,color:BASE.taupe,textTransform:'uppercase'}}>Your life, lately</div><div style={{fontFamily:FONT,fontSize:27,fontWeight:600,marginTop:5}}>A scrapbook of living.</div></div>
      <PhotoStrip/>


    </>}

    {reverieSection==='saved' && <><div style={{fontFamily:FONT,fontSize:28,fontWeight:600}}>Saved</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.5,margin:'5px 0 17px'}}>Everything you wanted to come back to, in one place.</div><ReverieSearchBox value={reverieSearch} onChange={setReverieSearch} placeholder="Search your saves"/>{filteredSaved.length?<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{filteredSaved.map(x=><div key={x.id} style={{borderRadius:18,overflow:'hidden',background:'#fff',border:`1px solid ${BASE.border}`}}><div onClick={x.onOpen} role={x.onOpen?'button':undefined} tabIndex={x.onOpen?0:undefined} style={{minHeight:150,background:x.image?`linear-gradient(rgba(244,230,242,.25),rgba(233,228,244,.82)), url(${x.image}) center/cover`:'linear-gradient(145deg,#F4E6F2,#E9E4F4)',padding:14,display:'flex',flexDirection:'column',justifyContent:'flex-end',cursor:x.onOpen?'pointer':'default'}}><div style={{fontFamily:FONT,fontSize:18,fontWeight:600,textTransform:'capitalize'}}>{x.title}</div><div style={{fontSize:10,color:BASE.taupe,marginTop:4,textTransform:'uppercase',letterSpacing:1}}>{x.source}</div></div><button type="button" onClick={()=>openComposer({id:'saved-'+x.id,title:x.title,note:'',date:today,photo:null,photoPosition:{x:50,y:50},originalImage:x.image||null,source:String(x.source||'personal').toLowerCase(),contentId:x.rawId,share:false})} style={{width:'100%',border:'none',borderTop:`1px solid ${BASE.border}`,background:'#fff',padding:'10px 7px',color:pink,fontSize:10.5,fontWeight:800,cursor:'pointer'}}>＋ Add photo to My Reverie</button></div>)}</div>:<div style={{padding:'35px 20px',borderRadius:20,background:'#fff',border:`1px solid ${BASE.border}`,textAlign:'center'}}><div style={{fontFamily:FONT,fontSize:22,fontWeight:600}}>Nothing saved here yet.</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.55,marginTop:7}}>Save something anywhere in True Reverie and this becomes the place to find it again.</div></div>}</>}

    <Composer/>
  </div>
}
