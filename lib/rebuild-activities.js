// Reusable UI vocabulary only. All lessons, suggestions and photography are Studio content.
export const ACTIVITY_TYPES=[['lesson','Lesson / text'],['photo','Photography'],['choices','Choices / intake'],['sort','Sort cards'],['collection','Discovery collection / Joy Menu'],['builder','Scene / project / message builder'],['day','Day canvas / routine'],['map','Private connection map'],['compare','Compare two versions'],['crop','Photography framing activity'],['collage','Mood board / collage'],['challenge','Optional real-life challenge'],['result','Personal result / chapter']]
export const makeId=()=>`b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`
export const newActivity=(type='lesson')=>({id:makeId(),type,title:'',body:'',photo:'',imagePosition:{x:50,y:50},imageZoom:1,alt:'',caption:'',continueLabel:'',skipLabel:'',cards:[],slots:[],buckets:type==='sort'?['Bring back','Leave behind','Curious about']:type==='day'?['Morning','Afternoon','Evening']:type==='map'?['Being understood','Shared fun','Everyday company','Practical support','Affection','Shared interests']:['Keep','Maybe','Pass'],labels:type==='collection'?['Keep','Pass']:['Keep','Maybe','Pass'],allowOwn:true,showEarlier:false,sourceKey:'',matchKey:'',rememberAs:'',limit:3,maxChoices:0,keepsake:true,shuffle:false})
export const newCard=()=>({id:makeId(),title:'',body:'',photo:'',imagePosition:{x:50,y:50},imageZoom:1,alt:'',tags:[],requires:[],link:''})
export const newSlot=()=>({id:makeId(),title:'',options:[]})
export function photoStyle(item={}){const p=item.imagePosition||{};return {width:'100%',height:'100%',objectFit:'cover',objectPosition:`${p.x??50}% ${p.y??50}%`,transform:`scale(${Math.max(1,Math.min(2.5,Number(item.imageZoom)||1))})`,transformOrigin:`${p.x??50}% ${p.y??50}%`}}
export function blocksOf(content){return Array.isArray(content?.blocks)?content.blocks.filter(b=>b&&b.id&&ACTIVITY_TYPES.some(t=>t[0]===b.type)):[]}
export function eligibleCards(cards,tags=[],constraints=[]){return (cards||[]).filter(c=>(c.requires||[]).every(t=>constraints.includes(t))).map((c,i)=>({c,i,score:(c.tags||[]).filter(t=>tags.includes(t)).length})).sort((a,b)=>b.score-a.score||a.i-b.i).map(x=>x.c)}
export function resultItems(block,value={}){
 const own=Array.isArray(value.own)?value.own:[];const cards=[...(block.cards||[]),...(value.cardSnapshot||[]),...own];const title=id=>cards.find(c=>c.id===id)?.title||id
 const rows=[]
 if(value.text)rows.push(value.text)
 if(value.name)rows.push(value.name)
 if(value.note)rows.push(value.note)
 if(value.selected)rows.push(...value.selected.map(id=>{const c=cards.find(c=>c.id===id);return c?.body?`${c.title}: ${c.body}`:title(id)}))
 if(value.decisions)for(const [id,label] of Object.entries(value.decisions))if(label&&label!==block.labels?.[2]&&label!=='Pass')rows.push(`${title(id)}: ${label}`)
 if(value.assignments)for(const [id,bucket] of Object.entries(value.assignments))rows.push(`${title(id)}: ${bucket}`)
 if(value.slots)for(const slot of block.slots||[])if(value.slots[slot.id])rows.push(`${slot.title}: ${value.slots[slot.id]}`)
 if(value.variants)for(const v of value.variants)rows.push(`${v.name}: ${(block.slots||[]).filter(s=>v.slots[s.id]).map(s=>`${s.title}: ${v.slots[s.id]}`).join('; ')}`)
 if(block.template&&value.slots)rows.push(block.template.replace(/\{([^}]+)\}/g,(_,name)=>{const slot=(block.slots||[]).find(s=>s.title===name);return value.slots[slot?.id]||'…'}))
 if(value.people)for(const p of value.people)rows.push(`${p.name}: ${(p.connections||[]).join(', ')}`)
 if(value.layers)for(const layer of value.layers)rows.push(`${title(layer.cardId)} (${Math.round(layer.x)}%, ${Math.round(layer.y)}%)`)
 if(value.crop)rows.push(`Framing: ${Math.round(value.crop.x)}%, ${Math.round(value.crop.y)}%; zoom ${value.crop.zoom}`)
 if(value.lengths)for(const [id,length] of Object.entries(value.lengths))rows.push(`${title(id)}: ${length}`)
 if(value.availability)for(const [id,availability] of Object.entries(value.availability))rows.push(`${title(id)}: ${availability}`)
 return rows.filter(Boolean)
}
export function summarizeScope(blocks,state,scope){return blocks.filter(b=>b.type!=='map').map(b=>({id:b.id,title:b.title||'',items:resultItems(b,state[`${scope}:${b.id}`]||{}),photo:b.photo||(state[`${scope}:${b.id}`]?.cardSnapshot||[]).find(c=>(state[`${scope}:${b.id}`]?.selected||[]).includes(c.id)&&c.photo)?.photo||''})).filter(r=>r.items.length)}
