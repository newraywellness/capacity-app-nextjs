// Content metadata lives in tr_content.content; no schema migration is required.
export const CONTENT_TIME_ZONE='America/Denver'
export const DISCOVERY_AREAS=['bloom','move','nourish']
export const CONTENT_WINDOWS=[
 {id:'halloween',label:'Halloween',start:'10-01',end:'10-31',kind:'holiday'},
 {id:'thanksgiving',label:'Thanksgiving',start:'11-01',end:'11-30',kind:'holiday'},
 {id:'christmas',label:'Christmas',start:'12-01',end:'12-26',kind:'holiday'},
 {id:'new-year',label:'New Year',start:'12-26',end:'01-15',kind:'holiday'},
 {id:'valentines',label:'Valentine’s Day',start:'02-01',end:'02-14',kind:'holiday'},
 {id:'spring',label:'Spring',start:'03-01',end:'05-31',kind:'season'},
 {id:'summer',label:'Summer',start:'06-01',end:'08-31',kind:'season'},
 {id:'fall',label:'Fall',start:'09-01',end:'11-30',kind:'season'},
 {id:'winter',label:'Winter',start:'12-01',end:'02-29',kind:'season'},
]
const strings=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()):typeof v==='string'&&v.trim()?[v.trim()]:[]
const canonical=s=>String(s).toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]/g,'')
export function contentDateKey(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:CONTENT_TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now)
 return ['year','month','day'].map(k=>parts.find(p=>p.type===k)?.value).join('-')
}
function validDate(v,annual=false){
 if(typeof v!=='string'||!(annual?/^\d{2}-\d{2}$/:/^\d{4}-\d{2}-\d{2}$/).test(v))return false
 const full=annual?'2000-'+v:v,[y,m,d]=full.split('-').map(Number)
 if(y<1900||y>9999||m<1||m>12||d<1)return false
 return d<=new Date(Date.UTC(y,m,0)).getUTCDate()
}
export function contentLabels(item={}){
 const c=item.content&&typeof item.content==='object'?item.content:item
 return [...new Set([...strings(c.tags),...strings(c.moods),...strings(c.seasons),...strings(c.holidays),...strings(c.season),...((strings(c.seasons).length||strings(c.holidays).length||strings(c.season).length||['annual','dates'].includes(c.availability?.mode))?['Seasonal']:[])])]
}
export function effectiveAvailability(item={}){
 const c=item.content&&typeof item.content==='object'?item.content:item
 if(c.availability!==undefined&&c.availability!==null)return c.availability
 const labels=contentLabels(c).map(canonical)
 const aliases={autumn:'fall',valentinesday:'valentines',valentine:'valentines',newyears:'newyear',newyearseve:'newyear',newyearsday:'newyear',xmas:'christmas'}
 const matches=CONTENT_WINDOWS.filter(p=>labels.some(x=>(aliases[x]||x)===canonical(p.id)||x===canonical(p.label)))
 // A holiday is narrower than its season. Prefer it when legacy tags contain both.
 const chosen=matches.filter(p=>p.kind==='holiday').length?matches.filter(p=>p.kind==='holiday'):matches
 if(chosen.length)return {mode:'annual',start:chosen[0].start,end:chosen[0].end,...(chosen.length>1?{windows:chosen.map(({start,end})=>({start,end}))}:{})}
 if(strings(c.holidays).length||strings(c.seasons).length||strings(c.season).length)return {mode:'needs-dates'}
 return {mode:'evergreen'}
}
export function availabilityError(item={}){
 const a=effectiveAvailability(item)
 if(!a||typeof a!=='object'||Array.isArray(a))return 'Choose when this post should appear.'
 const c=item.content&&typeof item.content==='object'?item.content:item
 if(a.mode==='evergreen')return strings(c.holidays).length||strings(c.seasons).length||strings(c.season).length||contentLabels(c).some(x=>CONTENT_WINDOWS.some(p=>canonical(x)===canonical(p.id)||canonical(x)===canonical(p.label)))?'Seasonal and holiday posts need a display window.':null
 if(!['annual','dates'].includes(a.mode))return 'Set display dates for this seasonal or holiday post.'
 const windows=a.windows===undefined?[a]:a.windows
 if(!Array.isArray(windows)||!windows.length||windows.length>12)return 'Add a valid display window.'
 for(const w of windows){if(!w||!validDate(w.start,a.mode==='annual')||!validDate(w.end,a.mode==='annual'))return a.mode==='annual'?'Choose valid annual start and end dates.':'Choose valid start and end dates.';if(a.mode==='dates'&&w.start>w.end)return 'The end date must be on or after the start date.'}
 return null
}
export function isContentDiscoverable(item,now=new Date()){
 if(availabilityError(item))return false
 const a=effectiveAvailability(item)
 if(a.mode==='evergreen')return true
 const key=typeof now==='string'?now:contentDateKey(now)
 if(!validDate(key))return false
 return (a.windows||[a]).some(w=>{
  const today=a.mode==='annual'?key.slice(5):key
  const end=w.end
  return a.mode==='annual'&&w.start>end?today>=w.start||today<=end:today>=w.start&&today<=end
 })
}
export function availabilitySummary(item,now=new Date()){
 const error=availabilityError(item);if(error)return error
 const a=effectiveAvailability(item);if(a.mode==='evergreen')return 'Year-round discovery'
 const dates=(a.windows||[a]).map(w=>`${w.start} → ${w.end}`).join(' · ')
 return `${a.mode==='annual'?'Every year':'Dates'}: ${dates} · ${isContentDiscoverable(item,now)?'In season now':'Hidden from discovery now'}`
}
export function parseStudioPost(raw,schemas){
 if(typeof raw!=='string'||raw.length>200000)throw Error('Paste one post, under 200 KB.')
 const cleaned=raw.trim().replace(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i,'$1')
 let value;try{value=JSON.parse(cleaned)}catch(e){throw Error('Paste the complete JSON post from your content chat.')}
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Import one post object at a time.')
 if(value.schemaVersion!==undefined&&value.schemaVersion!==1)throw Error('Use schemaVersion 1 for this importer.')
 if(!DISCOVERY_AREAS.includes(value.area))throw Error('Choose area bloom, move or nourish in the imported post.')
 const allowed=new Map((schemas[value.area]||[]).map(([k,,type])=>[k,type]))
 for(const k of ['seasons','holidays'])allowed.set(k,'chips')
 allowed.set('availability','availability');allowed.set('extraSwipePages','pages')
 const out={area:value.area}
 for(const [key,v] of Object.entries(value)){
  if(['area','schemaVersion','status','id','publishedAt','updated'].includes(key))continue
  if(!allowed.has(key))throw Error(`Unknown field “${key}”. Use the ${value.area} post template.`)
  if(v==null)continue
  const type=allowed.get(key)
  if(['chips','list'].includes(type)&&(!Array.isArray(v)||v.some(x=>typeof x!=='string')))throw Error(`${key} must be a list of text values.`)
  if(type==='number'&&(typeof v!=='number'||!Number.isFinite(v)))throw Error(`${key} must be a number.`)
  if(type==='select'&&!schemas[value.area].find(f=>f[0]===key)?.[3]?.includes(v))throw Error(`Choose a supported ${key}.`)
  if(['text','textarea','select','image'].includes(type)&&typeof v!=='string')throw Error(`${key} must be text.`)
  if(type==='image'&&v&&!/^https:\/\//i.test(v))throw Error('Use an HTTPS image URL, or leave the image blank and upload in Studio.')
  if(type==='availability'&&(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!['mode','start','end','windows'].includes(k))))throw Error('Use mode, start and end for availability.')
  if(type==='pages'&&(!Array.isArray(v)||v.length>20||v.some(p=>!p||typeof p.content!=='string'||Object.keys(p).some(k=>!['content','id'].includes(k)))))throw Error('Extra pages must be a list of objects containing content text.')
  out[key]=v
 }
 if(!out.title?.trim())throw Error('Add a title to the imported post.')
 const error=availabilityError(out);if(error)throw Error(error)
 return out
}
