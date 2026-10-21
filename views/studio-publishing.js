import {useState} from 'react'
import {CONTENT_WINDOWS,CONTENT_TIME_ZONE,effectiveAvailability,availabilityError,availabilitySummary,isContentDiscoverable,parseStudioPost} from '../lib/content-publishing.js'

const label={display:'block',fontSize:13,fontWeight:700,color:'#493b45',margin:'14px 0 7px'}
const months=['January','February','March','April','May','June','July','August','September','October','November','December']
function MonthDay({name,value='',onChange,S}){
 const [month='',day='']=value.split('-')
 return <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><select aria-label={name+' month'} value={month} style={{...S.input,flex:2,minWidth:120}} onChange={e=>onChange(`${e.target.value}-${day||'01'}`)}><option value="">Month</option>{months.map((m,i)=><option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}</select><select aria-label={name+' day'} value={day} style={{...S.input,flex:1,minWidth:70}} onChange={e=>onChange(`${month||'01'}-${e.target.value}`)}><option value="">Day</option>{Array.from({length:31},(_,i)=>String(i+1).padStart(2,'0')).map(d=><option key={d} value={d}>{d}</option>)}</select></div>
}
export function StudioPublishing({item,onChange,Field,S,C}){
 const [checkDate,setCheckDate]=useState('')
 const a=effectiveAvailability(item),error=availabilityError(item)
 const setDates=patch=>onChange({availability:{mode:a.mode,start:a.start||a.windows?.[0]?.start||'',end:a.end||a.windows?.[0]?.end||'',...patch}})
 const preset=id=>{const p=CONTENT_WINDOWS.find(p=>p.id===id);if(!p)return;onChange({availability:{mode:'annual',start:p.start,end:p.end},...(p.kind==='holiday'?{holidays:[p.label]}:{seasons:[p.label]})})}
 return <section aria-label="Seasonal publishing" style={{borderTop:`1px solid ${C.line}`,marginTop:20,paddingTop:20,marginBottom:24,color:C.ink}}>
  <h2 style={{fontFamily:"'Cormorant Garamond', Georgia, serif",fontSize:26,margin:'0 0 8px'}}>When should she discover this?</h2>
  <p style={{fontSize:14,lineHeight:1.6,color:'#5b4a55',margin:'0 0 16px'}}>Keep everyday ideas year-round. Give seasonal and holiday posts their own display window.</p>
  <label style={label} htmlFor="studio-window-preset">Start with a season or holiday</label><select id="studio-window-preset" value="" style={S.input} onChange={e=>preset(e.target.value)}><option value="">Choose a suggested window…</option>{CONTENT_WINDOWS.map(p=><option key={p.id} value={p.id}>{p.label} · {p.start} to {p.end}</option>)}</select>
  <p style={{fontSize:12,color:'#5b4a55',lineHeight:1.5}}>These are editable suggestions. For any other holiday, add its name below and choose dates.</p>
  <Field label="Season tags" type="chips" value={item.seasons||[]} onChange={seasons=>onChange({seasons})}/>
  <Field label="Holiday / occasion tags" type="chips" value={item.holidays||[]} onChange={holidays=>onChange({holidays})}/>
  {item.season&&<p style={{fontSize:12,color:'#5b4a55'}}>Earlier season tag: {Array.isArray(item.season)?item.season.join(', '):item.season} <button type="button" style={S.pill} onClick={()=>onChange({season:''})}>Clear earlier tag</button></p>}
  <label style={label} htmlFor="studio-availability-mode">Show in discovery</label><select id="studio-availability-mode" value={a.mode} style={S.input} onChange={e=>setDates({mode:e.target.value,...(e.target.value==='evergreen'?{start:'',end:''}:{})})}>
   {!['evergreen','annual','dates'].includes(a.mode)&&<option value={a.mode} disabled>Choose display dates</option>}
   <option value="evergreen">Year-round</option><option value="annual">Every year between these dates</option><option value="dates">One specific date range</option>
  </select>
  {a.mode==='annual'&&<><label style={label}>Annual start</label><MonthDay name="Annual start" value={a.start||a.windows?.[0]?.start} onChange={start=>setDates({start})} S={S}/><label style={label}>Annual end</label><MonthDay name="Annual end" value={a.end||a.windows?.[0]?.end} onChange={end=>setDates({end})} S={S}/><p style={{fontSize:12,color:'#5b4a55',lineHeight:1.5}}>Repeats automatically. December → January is supported.</p></>}
  {a.mode==='dates'&&<><label style={label} htmlFor="studio-availability-start">First day</label><input id="studio-availability-start" type="date" style={S.input} value={a.start||''} onChange={e=>setDates({start:e.target.value})}/><label style={label} htmlFor="studio-availability-end">Last day</label><input id="studio-availability-end" type="date" style={S.input} value={a.end||''} onChange={e=>setDates({end:e.target.value})}/></>}
  <div role={error?'alert':'status'} style={{marginTop:16,padding:14,borderRadius:14,background:error?'#fff0e7':'#edf1e9',color:error?'#8a3829':'#344c3c',fontSize:14,lineHeight:1.6}}>{availabilitySummary(item)}</div>
  <p style={{fontSize:12,lineHeight:1.6,color:'#5b4a55'}}>Both dates are included, using Mountain time ({CONTENT_TIME_ZONE}). Outside the window, published posts stay in Studio and can still open from Saved or an existing link; they leave discovery feeds.</p>
  <label style={label} htmlFor="studio-visibility-check">Check a date before publishing</label><input id="studio-visibility-check" type="date" style={S.input} value={checkDate} onChange={e=>setCheckDate(e.target.value)}/>
  <p role="status" style={{fontSize:13,color:'#493b45',lineHeight:1.5}}>{checkDate?(isContentDiscoverable(item,checkDate)?'Would appear in discovery on this date.':'Would be hidden from discovery on this date.'):''}</p>
 </section>
}
export function StudioDraftImport({schemas,onOpen,S,C}){
 const [raw,setRaw]=useState(''),[error,setError]=useState('')
 const open=()=>{try{const post=parseStudioPost(raw,schemas);onOpen(post);setRaw('');setError('')}catch(e){setError(e.message)}}
 return <details style={{...S.card,padding:18,marginBottom:18}}><summary style={{fontWeight:700,color:C.ink}}>Paste a post from your content chat</summary><p style={{fontSize:14,color:'#5b4a55',lineHeight:1.6}}>Paste one Bloom, Move or Nourish JSON post. It opens here as a new draft for you to review, add photography, and publish.</p><textarea aria-label="Post JSON" rows={8} value={raw} onChange={e=>{setRaw(e.target.value);setError('')}} style={{...S.input,fontSize:16}} placeholder={'{"area":"bloom","title":"…"}'}/>{error&&<p role="alert" style={{color:'#8a3829',fontSize:14}}>{error}</p>}<button type="button" style={{...S.pill,color:C.ink,marginTop:12}} disabled={!raw.trim()} onClick={open}>Open imported draft</button></details>
}
