import {useEffect,useRef,useState} from 'react'
import {db} from '../lib/supabase.js'
import {BASE} from '../lib/theme.js'
import {blocksOf,eligibleCards,makeId,photoStyle,resultItems,summarizeScope} from '../lib/rebuild-activities.js'
import {contentSource} from '../lib/community-content.js'

const button={border:`1px solid ${BASE.border}`,borderRadius:999,padding:'11px 16px',minHeight:44,minWidth:44,touchAction:'manipulation',transition:'background 180ms ease, box-shadow 180ms ease, transform 140ms ease',background:BASE.surface,color:BASE.creamDim,fontSize:12,fontWeight:700,cursor:'pointer'}
const input={width:'100%',boxSizing:'border-box',border:`1px solid ${BASE.border}`,borderRadius:14,padding:12,background:BASE.surface,color:BASE.cream,fontSize:14}
const box={border:`1px solid ${BASE.border}`,borderRadius:22,padding:18,background:BASE.surface,marginBottom:14,boxShadow:'0 6px 22px rgba(66,40,62,.045)'}
const heading={fontFamily:"'Cormorant Garamond', serif",fontSize:31,lineHeight:1.15,color:BASE.cream,fontWeight:700}
const primary={...button,background:'linear-gradient(135deg,#E984B4,#A87BD1)',color:'#fff',border:0}

export function RebuildPhoto({item,height=220}){return item?.photo?<figure style={{margin:'0 0 18px'}}><div style={{height,borderRadius:20,overflow:'hidden'}}><img loading="lazy" src={item.photo} alt={item.alt||''} style={photoStyle(item)}/></div>{item.caption&&<figcaption style={{fontSize:11,color:BASE.taupe,marginTop:7}}>{item.caption}</figcaption>}</figure>:null}

export function useRebuildWorkspace(userId,programId,previewMode=false){
 const [state,setState]=useState({}),[loading,setLoading]=useState(!previewMode),[error,setError]=useState(''),[status,setStatus]=useState('')
 const current=useRef({}),dirty=useRef({}),working=useRef(null),timer=useRef(null),alive=useRef(true),ready=useRef(previewMode)
 const revision=useRef(0)
 const load=async()=>{
  if(previewMode){ready.current=true;setLoading(false);return}
  if(!userId||!programId){setLoading(false);setError('Sign in to keep your work.');return}
  setLoading(true);setError('');ready.current=false
  try{
   const {data,error:e}=await db.from('tr_rebuild_workspaces').select('state').eq('user_id',userId).eq('rebuild_id',programId).maybeSingle()
   if(e)throw e
   if(!alive.current)return
   current.current=data?.state||{};dirty.current={};setState(current.current);ready.current=true;setStatus('')
  }catch(e){if(alive.current)setError('Your saved work could not load. Please try again.')}
  finally{if(alive.current)setLoading(false)}
 }
 const flush=async()=>{
  clearTimeout(timer.current)
  if(previewMode)return true
  if(!ready.current)return false
  if(working.current){const ok=await working.current;if(!ok)return false;if(Object.keys(dirty.current).length){working.current=null;return flush()}return true}
  if(!Object.keys(dirty.current).length)return true
  if(alive.current){setStatus('Saving…');setError('')}
  working.current=(async()=>{
   try{
    while(Object.keys(dirty.current).length){
     const [key,entry]=Object.entries(dirty.current)[0]
     const {error:e}=await db.rpc('tr_rebuild_save_activity',{p_owner_id:userId,p_rebuild_id:programId,p_key:key,p_value:entry.value})
     if(e)throw e
     if(dirty.current[key]?.revision===entry.revision)delete dirty.current[key]
    }
    if(alive.current)setStatus('Saved privately')
    return true
   }catch(e){if(alive.current){setStatus('Not saved yet');setError('Your changes are still here. Try saving again before leaving.')}return false}
  })()
  const ok=await working.current;working.current=null;return ok
 }
 const change=(key,value)=>{
  if(!ready.current)return
  current.current={...current.current,[key]:value};setState(current.current)
  dirty.current[key]={value,revision:++revision.current};setStatus(previewMode?'Preview only':'Not saved yet');clearTimeout(timer.current)
  if(!previewMode)timer.current=setTimeout(flush,500)
 }
 useEffect(()=>{alive.current=true;load();return()=>{alive.current=false;clearTimeout(timer.current);flush()}},[])
 return {state,loading,error,status,change,flush,retry:()=>ready.current?flush():load(),ready:ready.current}
}

function ResultCard({item,layout='mixed',children}){return <div style={{...box,background:layout==='words'?'#FFFDF9':BASE.surface}}>{layout==='words'?<div style={{display:'flex',gap:14}}>{item.photo&&<div style={{width:90,flexShrink:0}}><RebuildPhoto item={{photo:item.photo}} height={100}/></div>}<div style={{flex:1}}><div style={{...heading,fontSize:23}}>{item.title}</div><p style={{whiteSpace:'pre-wrap',fontSize:13,lineHeight:1.6}}>{item.items.join('\n')}</p></div></div>:<><RebuildPhoto item={{photo:item.photo}} height={layout==='photo'?240:160}/><div style={{...heading,fontSize:layout==='photo'?27:23}}>{item.title}</div><p style={{whiteSpace:'pre-wrap',fontSize:13,lineHeight:1.6}}>{item.items.join('\n')}</p></>}{children}</div>}

function Card({card,children}){return <div style={box}><RebuildPhoto item={card} height={160}/><div style={{...heading,fontSize:22}}>{card.title}</div>{card.body&&<p style={{fontSize:13,lineHeight:1.65,color:BASE.creamDim,whiteSpace:'pre-wrap'}}>{card.body}</p>}{/^https:\/\//i.test(card.link||'')&&<a href={card.link} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:'#A84E7D'}}>Open resource</a>}{children}</div>}

export function RebuildActivityPlayer({ctx={},blocks=[],programId,experienceId,scope,previewMode=false,onFinish,onBack,finishLabel}){
 const workspace=useRebuildWorkspace(ctx.user?.id,programId,previewMode)
 const {state,change,flush}=workspace
 const [ownText,setOwnText]=useState(''),[finishing,setFinishing]=useState(false),[message,setMessage]=useState('')
 const busy=useRef(false),deckOrder=useRef({key:null,ids:[]})
 const activeIndices=blocks.map((b,i)=>({b,i})).filter(({b})=>!b.showWhenKey||!b.showWhenTags?.length||(state[`memory:${b.showWhenKey}`]?.tags||[]).some(t=>b.showWhenTags.includes(t))).map(({i})=>i)
 const requested=Math.max(0,Math.min(blocks.length-1,Number(state[`cursor:${scope}`])||0))
 const index=activeIndices.includes(requested)?requested:(activeIndices.find(i=>i>requested)??activeIndices[0]??0),block=blocks[index]
 const activePosition=activeIndices.indexOf(index),last=activePosition===activeIndices.length-1
 const nextIndex=activeIndices[activePosition+1],previousIndex=activeIndices[activePosition-1]
 const key=block?`${scope}:${block.id}`:''
 const value=state[key]||{}
 const set=(patch)=>{
  const next={...value,...patch,cardSnapshot:cards};change(key,next)
  if(block.rememberAs){
   const ids=next.selected||Object.entries(next.decisions||{}).filter(([,l])=>l===block.labels?.[0]).map(([id])=>id)
   const cards=[...(block.cards||[]),...(next.own||[])];const kept=cards.filter(c=>ids.includes(c.id))
   change(`memory:${block.rememberAs}`,{ids,tags:Array.from(new Set(kept.flatMap(c=>c.tags||[]))),titles:kept.map(c=>c.title)})
  }
 }
 const memories=Object.entries(state).filter(([k])=>k.startsWith('memory:')&&k!==`memory:${block?.rememberAs}`).map(([,v])=>v)
 const tags=block?.matchKey?(state[`memory:${block.matchKey}`]?.tags||[]):memories.flatMap(v=>v.tags||[])
 const constraints=state['memory:preferences']?.tags||[]
 let earlier=[]
 if(block?.showEarlier){
  const source=block.sourceKey
  if(source&&state[source])earlier=resultItems(block,{...state[source],people:undefined}).map((title,i)=>({id:`earlier-${source}-${i}`,title,body:''}))
  else earlier=Object.entries(state).filter(([k,v])=>k.startsWith('result:')&&k!==`result:${scope}`&&v&&(!source||k===`result:${source}`)&&!v.private).flatMap(([k,v])=>(v.items||[]).map((item,i)=>({id:`earlier-${k}-${i}`,title:item.title,body:item.items.join('\n'),photo:item.photo})))
 }
 let cards=eligibleCards([...(block?.cards||[]),...earlier,...(value.own||[])],tags,constraints).filter(c=>!(value.passed||[]).includes(c.id)&&(!block?.onlyMatched||(c.tags||[]).some(t=>tags.includes(t))||(value.own||[]).some(x=>x.id===c.id)))
 if(workspace.ready){
  if(deckOrder.current.key!==key)deckOrder.current={key,ids:cards.map(c=>c.id)}
  const order=deckOrder.current.ids
  for(const card of cards)if(!order.includes(card.id))order.push(card.id)
  cards.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id))
 }
 useEffect(()=>{if(typeof window!=='undefined')window.scrollTo({top:0,behavior:'auto'})},[key])
 const limit=Math.max(1,Math.min(6,Number(block?.limit)||3)),page=Math.min(Math.max(0,Math.ceil(cards.length/limit)-1),Math.max(0,Number(value.page)||0))
 const visible=cards.slice(page*limit,page*limit+limit)
 const addOwn=()=>{const title=ownText.trim();if(!title)return;set({own:[...(value.own||[]),{id:makeId(),title,tags:[]}],page:Math.floor(cards.length/limit)});setOwnText('')}
 const choose=(id)=>{const selected=value.selected||[];if(selected.includes(id))return set({selected:selected.filter(x=>x!==id)});if(Number(block.maxChoices)>0&&selected.length>=Number(block.maxChoices)){setMessage(`Choose up to ${block.maxChoices}. You can change a choice.`);return}setMessage('');set({selected:[...selected,id]})}
 const move=async(next)=>{if(busy.current)return;busy.current=true;setFinishing(true);try{if(await flush()){change(`cursor:${scope}`,next);setOwnText('');setMessage('')}}finally{busy.current=false;setFinishing(false)}}
 const summary=()=>{
  const items=summarizeScope(blocks.filter((_,i)=>activeIndices.includes(i)),state,scope)
  const order=value.order||[]
  return items.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):order.length)-(order.includes(b.id)?order.indexOf(b.id):order.length))
 }
 const titleSource=block?.titleKey?state[block.titleKey]:null
 const titleBlock=block?.titleKey?blocks.find(b=>b.id===block.titleKey.split(':').slice(1).join(':')):null
 const titleSlot=titleBlock?.slots?.find(s=>s.title===block.titleSlot)
 const creationTitle=value.name||(titleSlot&&titleSource?.slots?.[titleSlot.id])||block?.resultTitle||block?.title||'My creation'
 const output=()=>({title:creationTitle,layout:value.layout||'mixed',scope,experienceId,private:blocks.some(b=>b.type==='map'),items:[...summary(),...blocks.filter(b=>b.type==='map').map(b=>({id:b.id,title:b.title||'',items:resultItems(b,state[`${scope}:${b.id}`]||{}),photo:''}))].filter(r=>r.items.length),updatedAt:new Date().toISOString()})
 const saveResult=async()=>{const result=output();change(`result:${scope}`,result);return await flush()}
 const finish=async()=>{if(busy.current)return;busy.current=true;setFinishing(true);setMessage('');try{if(await saveResult()){const ok=await onFinish?.();if(ok===false)setMessage('Progress could not save. Your creation is kept; try finishing again.')}}catch(e){setMessage('Your experience could not finish. Please try again.')}finally{busy.current=false;setFinishing(false)}}
 const keepsake=async()=>{
  if(!await saveResult())return
  const result=output();const note=result.items.map(r=>`${r.title}\n${r.items.join('\n')}`).join('\n\n')
  if(!note){setMessage('Keep a creation first, or finish without a keepsake.');return}
  const source=contentSource({id:experienceId||programId,title:block.resultTitle||block.title||'My creation'},experienceId?'rebuild_experience':'rebuild',{id:programId,title:''})
  ctx.openReverieFromContent?.(source,{title:result.title,note,photo:block.photo||result.items.find(r=>r.photo)?.photo||null})
 }
 if(workspace.loading)return <div role="status" aria-label="Loading your experience" style={{padding:'18px 0'}}><div style={{height:180,borderRadius:24,background:'#F2EBF3',marginBottom:22}}/><div style={{height:22,width:'70%',background:'#F2EBF3',borderRadius:8,marginBottom:12}}/><div style={{height:14,width:'90%',background:'#F5EFF3',borderRadius:8}}/><p style={{color:BASE.taupe,fontSize:12}}>Opening your experience…</p></div>
 if(!workspace.ready&&!previewMode)return <div role="alert"><p>{workspace.error}</p><button type="button" style={button} onClick={workspace.retry}>Try again</button></div>
 if(!activeIndices.length)return <div><p>No screens match the choices saved for this experience yet.</p>{onBack&&<button type="button" style={button} onClick={onBack}>Back to Rebuild</button>}</div>
 if(!block)return <p>No interactive screens have been published yet.</p>
 const isDeck=['choices','sort','collection','day','compare','collage','challenge'].includes(block.type)
 const selectedCards=cards.filter(c=>(value.selected||[]).includes(c.id))
 const updateLayer=(id,patch)=>set({layers:(value.layers||[]).map(l=>l.id===id?{...l,...patch}:l)})
 return <section className="tr-rb-player">
 <style>{`@keyframes tr-rb-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}.tr-rb-screen{animation:tr-rb-enter 260ms ease both}.tr-rb-player button:active{filter:brightness(.96)}.tr-rb-player button:focus-visible,.tr-rb-player input:focus-visible,.tr-rb-player textarea:focus-visible,.tr-rb-player select:focus-visible,.tr-rb-player summary:focus-visible{outline:2px solid #B786B8;outline-offset:3px}.tr-rb-player button:disabled{opacity:.6;cursor:default}.tr-rb-player figure img{display:block}.tr-rb-player details summary{list-style-position:outside;margin-left:12px}.tr-rb-player{padding-bottom:24px;overflow-anchor:none}@media(prefers-reduced-motion:reduce){.tr-rb-screen{animation:none}.tr-rb-player button{transition:none!important}.tr-rb-player button:active{filter:none}}`}</style>
 <div style={{display:'flex',justifyContent:'space-between',gap:12,fontSize:11,color:BASE.taupe,marginBottom:15}}><span>{activePosition+1} / {activeIndices.length}</span><span role="status">{previewMode?'Studio preview':workspace.status}</span></div>
 <div aria-hidden="true" style={{height:3,borderRadius:999,background:'#EFE5ED',marginBottom:24,overflow:'hidden'}}><div style={{height:'100%',width:`${(activePosition+1)/Math.max(1,activeIndices.length)*100}%`,background:'linear-gradient(90deg,#D992B8,#AB8BCB)',transition:'width 260ms ease'}}/></div>
 <div key={block.id} className="tr-rb-screen">
 <RebuildPhoto item={block}/><h2 style={heading}>{block.title}</h2>{block.body&&<p style={{fontSize:14,lineHeight:1.75,color:BASE.creamDim,whiteSpace:'pre-wrap'}}>{scope==='preview'&&block.type==='result'?block.body.split('\n\n')[0]:block.body}</p>}{scope==='preview'&&block.type==='result'&&block.body?.includes('\n\n')&&<details style={{marginBottom:14}}><summary style={{fontSize:12,color:BASE.taupe,cursor:'pointer'}}>What's inside</summary><p style={{fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{block.body.split('\n\n').slice(1).join('\n\n')}</p></details>}
 {block.quoteKey&&state[block.quoteKey]?.text&&<blockquote style={{fontFamily:"'Cormorant Garamond', serif",fontSize:20,color:BASE.taupe,margin:'14px 0'}}>{state[block.quoteKey].text}</blockquote>}
 {Number(block.maxChoices)>0&&['choices','collection'].includes(block.type)&&<p style={{fontSize:12,color:BASE.taupe}}>{block.type==='choices'?Object.values(value.decisions||{}).filter(l=>l===block.labels?.[0]).length:(value.selected||[]).length} of {block.maxChoices} selected. Tap your selected choice again to undo it.</p>}
 {message&&<p role="status" style={{fontSize:12,lineHeight:1.5,color:BASE.taupe}}>{message}</p>}
 {workspace.error&&<div role="alert" style={box}>{workspace.error}<button type="button" style={button} onClick={workspace.retry}>Try saving again</button></div>}
 {['choices','collection','challenge'].includes(block.type)&&visible.map(c=><Card key={c.id} card={c}><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{block.type==='choices'?(block.labels||['Keep','Maybe','Pass']).map(label=><button type="button" key={label} aria-pressed={value.decisions?.[c.id]===label} style={value.decisions?.[c.id]===label?primary:button} onClick={()=>{const kept=Object.entries(value.decisions||{}).filter(([,l])=>l===block.labels?.[0]);if(label===block.labels?.[0]&&value.decisions?.[c.id]!==label&&Number(block.maxChoices)>0&&kept.length>=Number(block.maxChoices)){setMessage(`Choose up to ${block.maxChoices}. You can change a choice.`);return}setMessage('');set({decisions:{...(value.decisions||{}),[c.id]:value.decisions?.[c.id]===label?'':label}})}}>{label}</button>):<button type="button" style={(value.selected||[]).includes(c.id)?primary:button} onClick={()=>choose(c.id)}>{(value.selected||[]).includes(c.id)?'Kept · Undo':block.labels?.[0]||'Keep'}</button>}{block.type!=='choices'&&<button type="button" style={button} onClick={()=>set({passed:[...(value.passed||[]),c.id]})}>{block.labels?.[1]||'Pass'}</button>}</div></Card>)}
 {['sort','day'].includes(block.type)&&visible.map(c=><Card key={c.id} card={c}><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>{(block.buckets||[]).map(bucket=><button type="button" key={bucket} style={value.assignments?.[c.id]===bucket?primary:button} onClick={()=>set({assignments:{...(value.assignments||{}),[c.id]:bucket}})}>{bucket}</button>)}<button type="button" style={button} onClick={()=>{const assignments={...(value.assignments||{})};delete assignments[c.id];set({assignments})}}>Undo</button></div>{block.type==='day'&&<><label style={{display:'block',marginTop:10,fontSize:12}}>Rough size<select aria-label={`Size of ${c.title}`} style={input} value={value.lengths?.[c.id]||''} onChange={e=>set({lengths:{...(value.lengths||{}),[c.id]:e.target.value}})}><option value="">Not marked</option><option>Small part of the day</option><option>A few hours</option><option>Much of this part of the day</option></select></label><label style={{display:'block',marginTop:10,fontSize:12}}>Availability<select style={input} value={value.availability?.[c.id]||''} onChange={e=>set({availability:{...(value.availability||{}),[c.id]:e.target.value}})}><option value="">Not marked</option><option>Usually available</option><option>Often interrupted</option><option>Would need an arrangement</option><option>Also responsible for someone</option></select></label></>}</Card>)}
 {['sort','day'].includes(block.type)&&(block.buckets||[]).map(bucket=><div key={bucket} style={box}><b>{bucket}</b>{cards.filter(c=>value.assignments?.[c.id]===bucket).map(c=><div key={c.id} style={{marginTop:10}}>{c.title}{value.availability?.[c.id]&&<small> · {value.availability[c.id]}</small>}<button type="button" style={{...button,marginLeft:8}} onClick={()=>{const assignments={...value.assignments};delete assignments[c.id];set({assignments})}}>Remove</button></div>)}</div>)}
 {block.type==='builder'&&<><input aria-label="Creation name" style={input} placeholder="Name your creation (optional)" value={value.name||''} onChange={e=>set({name:e.target.value})}/>{(block.slots||[]).map(slot=><details key={slot.id} style={{...box,marginTop:12}} open={!!value.openSlots?.[slot.id]}><summary onClick={e=>{e.preventDefault();set({openSlots:{...(value.openSlots||{}),[slot.id]:!value.openSlots?.[slot.id]}})}} style={{cursor:'pointer'}}>{slot.title}: {value.slots?.[slot.id]||'Choose or leave out'}</summary><div style={{marginTop:12}}>{eligibleCards(slot.options||[],tags,constraints).slice(0,value.expandedSlots?.[slot.id]?undefined:limit).map(c=><Card key={c.id} card={c}><button type="button" style={value.slots?.[slot.id]===c.title?primary:button} onClick={()=>set({slots:{...(value.slots||{}),[slot.id]:c.title}})}>Choose this</button></Card>)}{eligibleCards(slot.options||[],tags,constraints).length>limit&&<button type="button" style={button} onClick={()=>set({expandedSlots:{...(value.expandedSlots||{}),[slot.id]:!value.expandedSlots?.[slot.id]}})}>{value.expandedSlots?.[slot.id]?'Show fewer':'More ingredients'}</button>}{block.allowOwn&&<input aria-label={`Own words for ${slot.title}`} placeholder="My own words" style={input} value={value.slots?.[slot.id]||''} onChange={e=>set({slots:{...(value.slots||{}),[slot.id]:e.target.value}})}/>}<button type="button" style={button} onClick={()=>{const slots={...(value.slots||{})};delete slots[slot.id];set({slots})}}>Leave this out</button></div></details>)}<div style={box}><b>{value.name||'My creation'}</b><p style={{whiteSpace:'pre-wrap',lineHeight:1.6}}>{block.template?block.template.replace(/\{([^}]+)\}/g,(_,name)=>{const slot=block.slots.find(s=>s.title===name);return value.slots?.[slot?.id]||'…'}):(block.slots||[]).filter(s=>value.slots?.[s.id]).map(s=>`${s.title}: ${value.slots[s.id]}`).join('\n')}</p></div><button type="button" style={button} onClick={()=>set({variants:[...(value.variants||[]),{id:makeId(),name:value.name||'Another version',slots:{...(value.slots||{})},note:value.note||''}]})}>Keep another version</button>{(value.variants||[]).map(v=><div key={v.id} style={box}><b>{v.name}</b><p style={{whiteSpace:'pre-wrap'}}>{(block.slots||[]).filter(s=>v.slots[s.id]).map(s=>`${s.title}: ${v.slots[s.id]}`).join('\n')}</p><button type="button" style={button} onClick={()=>set({name:v.name,slots:{...v.slots},note:v.note})}>Use this version</button><button type="button" style={button} onClick={()=>set({variants:value.variants.filter(x=>x.id!==v.id)})}>Remove version</button></div>)}<textarea style={input} aria-label="Personal note" placeholder="A note or edit in your words (optional)" value={value.note||''} onChange={e=>set({note:e.target.value})}/>{block.shuffle&&<button type="button" style={button} onClick={()=>{const slots={};for(const s of block.slots||[]){const pool=eligibleCards(s.options||[],tags,constraints);if(pool.length)slots[s.id]=pool[Math.floor(Math.random()*pool.length)].title}set({slots})}}>Remix ingredients</button>}</>}
 {block.type==='map'&&<><div style={{display:'flex',gap:8}}><input style={input} aria-label="Person or private label" value={ownText} onChange={e=>setOwnText(e.target.value)} placeholder="Name, initials, or a private label"/><button type="button" style={button} onClick={()=>{if(ownText.trim()){set({people:[...(value.people||[]),{id:makeId(),name:ownText.trim(),connections:[]}]});setOwnText('')}}}>Add</button></div>{(value.people||[]).map(p=><div key={p.id} style={{...box,marginTop:12}}><input aria-label="Edit private label" style={input} value={p.name} onChange={e=>set({people:value.people.map(x=>x.id===p.id?{...x,name:e.target.value}:x)})}/><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{(block.buckets||[]).map(c=><button type="button" key={c} style={p.connections.includes(c)?primary:button} onClick={()=>set({people:value.people.map(x=>x.id===p.id?{...x,connections:x.connections.includes(c)?x.connections.filter(t=>t!==c):[...x.connections,c]}:x)})}>{c}</button>)}<button type="button" style={button} onClick={()=>set({people:value.people.filter(x=>x.id!==p.id)})}>Remove</button></div></div>)}<textarea aria-label="What I want from connection" style={{...input,marginTop:12}} placeholder="What I want to keep privately (optional)" value={value.note||''} onChange={e=>set({note:e.target.value})}/></>}
 {block.type==='compare'&&<><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{visible.map(c=><Card key={c.id} card={c}><button type="button" style={(value.selected||[]).includes(c.id)?primary:button} onClick={()=>choose(c.id)}>{(value.selected||[]).includes(c.id)?'Kept · Undo':'Keep this version'}</button></Card>)}</div><textarea style={input} aria-label="Combine versions" placeholder="Combine or adapt them in your words (optional)" value={value.note||''} onChange={e=>set({note:e.target.value})}/></>}
 {block.type==='crop'&&block.photo&&<><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><RebuildPhoto item={{...block,imagePosition:{x:50,y:50},imageZoom:1,caption:'Original'}} height={180}/><RebuildPhoto item={{...block,imagePosition:value.crop||{x:50,y:50},imageZoom:value.crop?.zoom||1,caption:'My framing'}} height={180}/></div>{[['x','Horizontal position',0,100],['y','Vertical position',0,100],['zoom','Zoom',1,2.5]].map(([k,label,min,max])=><label key={k} style={{display:'block',fontSize:12,marginBottom:12}}>{label}<input aria-label={label} type="range" min={min} max={max} step={k==='zoom'?.05:1} value={value.crop?.[k]??(k==='zoom'?1:50)} onChange={e=>set({crop:{x:50,y:50,zoom:1,...value.crop,[k]:Number(e.target.value)}})} style={{width:'100%'}}/></label>)}<button type="button" style={button} onClick={()=>set({crop:{x:50,y:50,zoom:1}})}>Reset framing</button></>}
 {block.type==='collage'&&<><div style={{height:300,position:'relative',overflow:'hidden',borderRadius:20,background:value.color||'#F0EBF4',marginBottom:12}}>{(value.layers||[]).map(l=>{const c=cards.find(c=>c.id===l.cardId);if(!c)return null;return <div key={l.id} style={{position:'absolute',left:`${l.x}%`,top:`${l.y}%`,width:`${l.size}%`,transform:`rotate(${l.rotation||0}deg)`,borderRadius:10,overflow:'hidden',background:'#fff',padding:c.photo?0:8}}>{c.photo?<img src={c.photo} alt={c.alt||''} style={{width:'100%',display:'block'}}/>:<span style={{color:'#413C42'}}>{c.title}</span>}</div>})}</div><label style={{fontSize:12}}>Board color <input aria-label="Board color" type="color" value={value.color||'#F0EBF4'} onChange={e=>set({color:e.target.value})}/></label>{visible.map(c=><Card key={c.id} card={c}><button type="button" style={button} onClick={()=>set({layers:[...(value.layers||[]),{id:makeId(),cardId:c.id,x:10,y:10,size:40,rotation:0}]})}>Add to board</button></Card>)}{(value.layers||[]).map(l=><details key={l.id} style={box}><summary>{cards.find(c=>c.id===l.cardId)?.title}</summary>{[['x','Left',0,80],['y','Top',0,80],['size','Size',10,80],['rotation','Rotate',-45,45]].map(([k,label,min,max])=><label key={k} style={{display:'block',fontSize:12}}>{label}<input aria-label={`${label} ${l.id}`} type="range" min={min} max={max} value={l[k]||0} onChange={e=>updateLayer(l.id,{[k]:Number(e.target.value)})} style={{width:'100%'}}/></label>)}<button type="button" style={button} onClick={()=>set({layers:value.layers.filter(x=>x.id!==l.id)})}>Remove layer</button></details>)}</>}
 {isDeck&&cards.length>limit&&<button type="button" style={button} onClick={()=>set({page:(page+1)*limit>=cards.length?0:page+1})}>Show me more</button>}
 {isDeck&&block.allowOwn&&block.type!=='collage'&&<div style={{display:'flex',gap:8,margin:'14px 0'}}><input style={input} aria-label="Personal addition" placeholder="My own idea" value={ownText} onChange={e=>setOwnText(e.target.value)}/><button type="button" style={button} onClick={addOwn}>Add my own</button></div>}
 {['collection','challenge'].includes(block.type)&&selectedCards.length>0&&<div style={box}><input style={input} aria-label="Collection title" placeholder="Name my collection (optional)" value={value.name||''} onChange={e=>set({name:e.target.value})}/>{selectedCards.map(c=><div key={c.id} style={{marginTop:10}}>{c.title}<button type="button" style={{...button,marginLeft:8}} onClick={()=>choose(c.id)}>Remove</button></div>)}{block.shuffle&&<button type="button" style={{...button,marginTop:12}} onClick={()=>{const unpicked=selectedCards.filter(c=>!(value.drawn||[]).includes(c.id));const pool=unpicked.length?unpicked:selectedCards;const c=pool[Math.floor(Math.random()*pool.length)];set({picked:c.id,drawn:unpicked.length?[...(value.drawn||[]),c.id]:[c.id]})}}>Pick one for me</button>}{value.picked&&<p>{selectedCards.find(c=>c.id===value.picked)?.title}</p>}</div>}
 {['lesson','photo'].includes(block.type)&&block.allowOwn&&<textarea style={input} aria-label="Optional own words" placeholder="My own words (optional)" value={value.text||''} onChange={e=>set({text:e.target.value})}/>}
 {scope==='preview'&&block.type==='result'&&<><div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{(state['memory:preview_wants']?.titles||[]).slice(0,2).map(title=><span key={title} style={{borderRadius:999,padding:'8px 12px',background:'#F1E8F4',fontSize:12,color:BASE.creamDim}}>{title}</span>)}</div><details style={{margin:'16px 0'}}><summary style={{cursor:'pointer',fontSize:13,color:BASE.taupe}}>Review my answers</summary>{summarizeScope(blocks,state,scope).map(r=><div key={r.id} style={{...box,marginTop:12}}><b>{r.title}</b><p style={{fontSize:13,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{r.items.join('\n')}</p></div>)}</details><p style={{fontSize:12,color:BASE.taupe}}>Your preview is saved. You can come back to it.</p></>}
 {scope!=='preview'&&block.type==='result'&&<><input style={input} aria-label="Result title" placeholder={creationTitle||'Name my creation (optional)'} value={value.name||''} onChange={e=>set({name:e.target.value})}/>{block.chapter&&<div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{[['photo','Photo-led'],['words','Words and details'],['mixed','A little of both']].map(([layout,label])=><button type="button" key={layout} style={(value.layout||'mixed')===layout?primary:button} onClick={()=>set({layout})}>{label}</button>)}</div>}{summary().map((r,i,items)=><ResultCard key={r.id} item={r} layout={value.layout||'mixed'}>{block.chapter&&<div style={{display:'flex',gap:8}}><button type="button" disabled={!i} style={button} onClick={()=>{const order=items.map(x=>x.id);[order[i-1],order[i]]=[order[i],order[i-1]];set({order})}}>Move up</button><button type="button" disabled={i===items.length-1} style={button} onClick={()=>{const order=items.map(x=>x.id);[order[i+1],order[i]]=[order[i],order[i+1]];set({order})}}>Move down</button></div>}</ResultCard>)}<textarea style={input} aria-label="Result note" placeholder="Something to remember (optional)" value={value.note||''} onChange={e=>set({note:e.target.value})}/><button type="button" style={{...button,marginTop:12}} onClick={async()=>{if(await saveResult())setMessage('Your creation is kept privately.')}}>Keep in my Rebuild</button>{block.keepsake!==false&&!blocks.some(b=>b.type==='map')&&ctx.openReverieFromContent&&<button type="button" style={{...button,marginTop:12}} onClick={keepsake}>Add to My Reverie</button>}{block.showEarlier&&earlier.map(c=><Card key={c.id} card={c}><button type="button" style={(value.selected||[]).includes(c.id)?primary:button} onClick={()=>choose(c.id)}>{(value.selected||[]).includes(c.id)?'Included · Undo':'Include this'}</button></Card>)}</>}

 <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:24}}>{activePosition>0?<button type="button" disabled={finishing} style={button} onClick={()=>move(previousIndex)}>Back</button>:onBack&&<button type="button" style={button} onClick={async()=>{if(await flush())onBack()}}>Back to Rebuild</button>}<button type="button" style={{...primary,flex:1}} disabled={finishing} onClick={()=>last?finish():move(nextIndex)}>{finishing?'Saving…':(last&&finishLabel)||block.continueLabel||(last?'Finish experience':'Continue')}</button>{block.skipLabel&&!last&&<button type="button" style={button} onClick={()=>move(nextIndex)}>{block.skipLabel}</button>}</div>
 <button type="button" style={{...button,marginTop:12}} onClick={async()=>{if(await flush()){setMessage(previewMode?'Preview only; nothing saved.':'Your place is saved privately.');onBack?.()}}}>Save and pause</button>
 </div>
 </section>
}

export function RebuildWorkspaceGallery({ctx,programId,program,experiences,onOpen}){
 const w=useRebuildWorkspace(ctx.user?.id,programId)
 if(w.loading)return <p style={{fontSize:12,color:BASE.taupe}}>Loading things you've made…</p>
 if(w.error)return <div role="alert"><p>{w.error}</p><button type="button" style={button} onClick={w.retry}>Try again</button></div>
 const results=Object.entries(w.state).filter(([k,v])=>k.startsWith('result:')&&v?.items?.length).sort(([a],[b])=>(a===w.state.pinnedResult?-1:b===w.state.pinnedResult?1:0))
 if(!results.length)return null
 return <section style={{marginTop:24}}><h3 style={{...heading,fontSize:23}}>Things you've made</h3>{results.map(([key,r])=><details key={key} style={box}><summary style={{cursor:'pointer',fontWeight:700}}>{key===w.state.pinnedResult?'★ ':''}{r.title}</summary>{r.items.map(item=><ResultCard key={item.id} item={item} layout={r.layout||'mixed'}/>)}<button type="button" style={button} onClick={()=>onOpen(r)}>Open and edit</button><button type="button" style={button} onClick={async()=>{w.change('pinnedResult',w.state.pinnedResult===key?'':key);await w.flush()}}>{w.state.pinnedResult===key?'Unpin':'Keep within reach'}</button>{!r.private&&ctx.openReverieFromContent&&<button type="button" style={button} onClick={()=>ctx.openReverieFromContent(contentSource({id:r.experienceId||programId,title:r.title},r.experienceId?'rebuild_experience':'rebuild',{id:programId,title:program.title}),{title:r.title,note:r.items.map(i=>`${i.title}\n${i.items.join('\n')}`).join('\n\n'),photo:r.items.find(i=>i.photo)?.photo||null})}>Add to My Reverie</button>}</details>)}</section>
}
