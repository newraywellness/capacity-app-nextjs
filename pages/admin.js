import { useEffect, useMemo, useState } from "react"
import { db } from "../lib/supabase.js"

const C = {
  bg:"#FBF7F3", paper:"#FFFDFC", ink:"#382D35", muted:"#8D7E86", line:"#E9DFE2",
  blush:"#C97BA8", lavender:"#A87BD1", sage:"#91A58E", gold:"#C4A56A", soft:"#F5ECEF"
}

const AREAS = [
  { id:"bloom", label:"Bloom", icon:"✿", sub:"Discoveries, seasonal ideas, beauty, home, outings & recipes" },
  { id:"move", label:"Move", icon:"↟", sub:"Movement ideas, walkthroughs & creator videos" },
  { id:"nourish", label:"Nourish", icon:"◌", sub:"Meals, nutrition details, supplements & education" },
  { id:"cycle", label:"Cycle", icon:"☾", sub:"Nurse-informed cycle education" },
  { id:"rebuild", label:"Rebuild", icon:"↻", sub:"Programs and guided experiences" },
  { id:"feel", label:"Feel Better", icon:"♡", sub:"Immediate support cards" },
  { id:"ritual", label:"Rituals", icon:"◇", sub:"Repeatable rituals worth coming back to" },
]

const SCHEMAS = {
  bloom: [
    ["title","Title","text"],["image","Photo","image"],["teaser","Front-card description","textarea"],
    ["format","Format","select",["idea","recipe","beauty","home","outing","movement"]],
    ["category","Category","text"],["tags","Tags","chips"],["moods","Mood tags","chips"],["time","Time","text"],
    ["description","Description","textarea"],["howTo","How To","list"],["need","What You Need","list"],
    ["nurseNote","Nurse Note (optional)","textarea"],["products","Products / recommendations (optional)","list"],
    ["videoUrl","Video link (optional)","text"],["season","Season / holiday (optional)","text"],
  ],
  move: [
    ["title","Title","text"],["image","Photo","image"],["emoji","Emoji","text"],["hook","Hook","textarea"],
    ["moods","Mood","chips"],["time","Time","chips"],["category","Type","chips"],["walkthrough","Walkthrough","list"],
    ["creator","Creator (optional)","text"],["videoUrl","Video link (optional)","text"],
    ["nurseNote","Nurse Note (optional)","textarea"],
  ],
  nourish: [
    ["title","Meal / article title","text"],["image","Photo","image"],["description","Description","textarea"],
    ["mealType","Meal type","select",["breakfast","lunch","dinner","snack","education","supplement"]],
    ["tags","Tags","chips"],["minutes","Minutes","number"],["protein","Protein (g)","number"],
    ["calories","Calories","number"],["carbs","Carbs (g)","number"],["fat","Fat (g)","number"],
    ["ingredients","Ingredients","list"],["method","Method / How To","list"],
    ["nurseNote","Nurse-informed note","textarea"],["body","Education body (optional)","textarea"],
  ],
  cycle: [
    ["title","Article title","text"],["icon","Icon","text"],["description","Short description","textarea"],
    ["section","Library section","select",["Your Cycle","Common Questions","Health Conditions","Postpartum","Birth Control","Fertility"]],
    ["body","Article body","textarea"],["nurseNote","Nurse note / context","textarea"],
    ["seekCare","When to seek care (optional)","textarea"],["tags","Tags","chips"],
  ],
  rebuild: [
    ["title","Program title","text"],["cover","Cover image","image"],["outcome","Outcome / description","textarea"],
    ["duration","Duration","text"],["pace","Pace","text"],["tags","Tags","chips"],
    ["premium","True Reverie+","toggle"],["featured","Featured","toggle"],["status","Program status","select",["draft","preview","published"]],
    ["intro","Program introduction","textarea"],
  ],
  experience: [
    ["title","Experience title","text"],["week","Week / section","number"],["why","Why this matters","textarea"],
    ["dimensions","Dimensions","chips"],["anchor","Main experience","textarea"],["examples","Examples","list"],
    ["makeItYours","Make It Yours prompt","textarea"],["green","Full version","textarea"],
    ["yellow","Medium version","textarea"],["red","Small version","textarea"],["recovery","Recovery version","textarea"],
    ["addOn","Add-on (optional)","textarea"],["nurseNote","Nurse Note (optional)","textarea"],
    ["reaction","Reflection question","textarea"],["reactionOptions","Reaction options","list"],
  ],
  feel: [
    ["title","Title","text"],["icon","Icon","text"],["description","Short description","textarea"],
    ["action","What she can do right now","textarea"],["nurseNote","Nurse Note (optional)","textarea"],
    ["tags","Tags","chips"],
  ],
  ritual: [
    ["title","Ritual title","text"],["cover","Cover image","image"],["description","Description","textarea"],
    ["timing","When","text"],["minutes","Minutes","number"],["steps","Steps","list"],
    ["premium","True Reverie+","toggle"],["nurseNote","Nurse Note (optional)","textarea"],["tags","Tags","chips"],
  ],
}

const SAMPLE = [
  {id:"sample-bloom",area:"bloom",title:"Sunday Reset Shower",teaser:"A softer reset for the week ahead.",format:"idea",category:"Self Care",tags:["Self Care","Reset"],moods:["Cozy"],time:"20 min",description:"Turn an ordinary shower into a small transition ritual.",howTo:["Put your phone down.","Choose one extra care step.","Get into something clean and comfortable."],status:"published",updated:"Today"},
  {id:"sample-move",area:"move",title:"Dance It Out",hook:"One song, full volume, curtains closed.",moods:["Dance"],time:["5 min"],category:["Dance"],walkthrough:["Pick one song you love.","Move however you want.","Stop when it ends."],status:"published",updated:"Prototype"},
  {id:"sample-nourish",area:"nourish",title:"Build-a-Bowl Dinner",description:"A flexible dinner formula for nights you don't want a recipe.",mealType:"dinner",tags:["Easy","Protein"],minutes:20,protein:30,status:"draft",updated:"Prototype"},
  {id:"sample-cycle",area:"cycle",title:"What Actually Happens in the Luteal Phase?",description:"The hormone shift, what you may notice, and what is worth tracking.",section:"Your Cycle",status:"draft",updated:"Prototype"},
  {id:"sample-rebuild",area:"rebuild",title:"Come Back to Yourself",outcome:"For the woman who has spent so long taking care of everyone else that she stopped knowing what she wants.",duration:"28 experiences",pace:"Move at your own pace",tags:["Identity","Burnout"],premium:true,status:"draft",updated:"Prototype"},
  {id:"sample-feel",area:"feel",title:"I want to feel human again",description:"A tiny care reset for when you've disappeared from your own day.",action:"Wash your face, fix your hair, change into something clean, and use one thing that smells good.",status:"published",updated:"Prototype"},
  {id:"sample-ritual",area:"ritual",title:"The Everything Shower",description:"The whole production — hair, skin, body care, lotion, and feeling human again.",timing:"Anytime",minutes:20,premium:true,status:"draft",updated:"Prototype"},
]

function uid(){ return "local-"+Date.now()+"-"+Math.random().toString(36).slice(2,7) }
function blank(area){ return {id:uid(),area,status:"draft",updated:"Just now",publishedAt:null,title:""} }
function labelFor(area){ return AREAS.find(a=>a.id===area)?.label || area }

const S = {
  shell:{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:"Inter, ui-sans-serif, system-ui, -apple-system, sans-serif"},
  serif:{fontFamily:"'Cormorant Garamond', Georgia, serif"},
  card:{background:C.paper,border:`1px solid ${C.line}`,borderRadius:20,boxShadow:"0 8px 30px rgba(67,45,58,.04)"},
  input:{width:"100%",boxSizing:"border-box",border:`1px solid ${C.line}`,borderRadius:13,background:"#fff",padding:"12px 13px",fontSize:14,color:C.ink,outline:"none"},
  pill:{border:`1px solid ${C.line}`,background:C.paper,borderRadius:999,padding:"8px 11px",fontSize:12,fontWeight:700,color:C.muted},
}

export default function AdminStudio(){
  const [area,setArea] = useState("dashboard")
  const [items,setItems] = useState([])
  const [editing,setEditing] = useState(null)
  const [query,setQuery] = useState("")
  const [filter,setFilter] = useState("all")
  const [mobileNav,setMobileNav] = useState(false)
  const [session,setSession] = useState(null)
  const [authLoading,setAuthLoading] = useState(true)
  const [loadingItems,setLoadingItems] = useState(false)
  const [busy,setBusy] = useState(false)
  const [notice,setNotice] = useState("")
  const [loginEmail,setLoginEmail] = useState("")
  const [loginPassword,setLoginPassword] = useState("")
  const [loginError,setLoginError] = useState("")

  const areaToType=(a)=>a==="feel"?"feel_better":a
  const typeToArea=(t)=>t==="feel_better"?"feel":t
  const fromRow=(row)=>{
    const body=row.content&&typeof row.content==="object"?row.content:{}
    return {
      ...body,
      id:row.id,
      area:typeToArea(row.content_type),
      title:row.title||"",
      status:row.status||"draft",
      category:row.category||body.category||"",
      format:row.format||body.format||"",
      premium:!!row.is_premium,
      featured:!!row.is_featured,
      image:row.image_url||body.image||"",
      cover:row.image_url||body.cover||"",
      extraSwipePages:Array.isArray(row.extra_pages)?row.extra_pages:[],
      updated:row.updated_at?new Date(row.updated_at).toLocaleDateString():"Just now",
      publishedAt:row.published_at?new Date(row.published_at).getTime():null,
    }
  }
  const toRow=(item,status)=>{
    const reserved=new Set(["id","area","status","updated","publishedAt","title","category","format","premium","featured","image","cover","extraSwipePages"])
    const body={}
    Object.entries(item).forEach(([k,v])=>{ if(!reserved.has(k)) body[k]=v })
    // Until Storage is wired, never put a base64 phone photo into Postgres.
    const imageCandidate=item.image||item.cover||""
    const imageUrl=imageCandidate && !String(imageCandidate).startsWith("data:") ? imageCandidate : null
    return {
      content_type:areaToType(item.area), title:(item.title||"Untitled").trim(), status,
      category:item.category||item.section||item.mealType||null,
      format:item.format||null, is_premium:!!item.premium, is_featured:!!item.featured,
      image_url:imageUrl, content:body, extra_pages:item.extraSwipePages||[],
      published_at:status==="published"?(item.publishedAt?new Date(item.publishedAt).toISOString():new Date().toISOString()):null,
    }
  }

  const loadItems=async()=>{
    setLoadingItems(true); setNotice("")
    const {data,error}=await db.from("tr_content").select("*").order("updated_at",{ascending:false})
    setLoadingItems(false)
    if(error){ setNotice("Could not load Studio content: "+error.message); return }
    setItems((data||[]).map(fromRow))
  }

  useEffect(()=>{
    let mounted=true
    db.auth.getSession().then(({data})=>{ if(mounted){setSession(data.session||null);setAuthLoading(false)} })
    const {data:sub}=db.auth.onAuthStateChange((_event,next)=>{setSession(next);setAuthLoading(false)})
    return()=>{mounted=false;sub.subscription.unsubscribe()}
  },[])
  useEffect(()=>{ if(session) loadItems(); else setItems([]) },[session?.user?.id])

  const signIn=async(e)=>{
    e?.preventDefault(); setLoginError(""); setBusy(true)
    const {error}=await db.auth.signInWithPassword({email:loginEmail.trim(),password:loginPassword})
    setBusy(false); if(error)setLoginError(error.message)
  }
  const signOut=async()=>{await db.auth.signOut();setEditing(null);setArea("dashboard")}

  const counts = useMemo(()=>Object.fromEntries(AREAS.map(a=>[a.id,items.filter(x=>x.area===a.id).length])),[items])
  const visible = useMemo(()=>items.filter(x=>(area==="dashboard"||x.area===area) && (filter==="all"||x.status===filter) && (!query||JSON.stringify(x).toLowerCase().includes(query.toLowerCase()))),[items,area,filter,query])

  const saveItem=async(item)=>{
    const status=item.status==="published"?"published":"draft"
    if(!item.title?.trim()){setNotice("Add a title before saving.");return}
    setBusy(true);setNotice("")
    const payload=toRow(item,status)
    let result
    if(typeof item.id==="number") result=await db.from("tr_content").update(payload).eq("id",item.id).select().single()
    else result=await db.from("tr_content").insert(payload).select().single()
    setBusy(false)
    if(result.error){setNotice("Save failed: "+result.error.message);return}
    if((item.image||item.cover||"").startsWith?.("data:")) setNotice("Saved. The post is real; photo upload will become permanent when we wire Supabase Storage next.")
    else setNotice(status==="published"?"Published to True Reverie.":"Draft saved to Supabase.")
    const saved=fromRow(result.data)
    setItems(prev=>prev.some(x=>x.id===saved.id)?prev.map(x=>x.id===saved.id?saved:x):[saved,...prev])
    setEditing(null)
  }
  const duplicate=(item)=>setEditing({...item,id:uid(),title:(item.title||"Untitled")+" — Copy",status:"draft",updated:"Just now",publishedAt:null})
  const remove=async(id)=>{
    if(!confirm("Delete this content item from True Reverie?"))return
    if(typeof id!=="number"){setItems(p=>p.filter(x=>x.id!==id));return}
    setBusy(true);const {error}=await db.from("tr_content").delete().eq("id",id);setBusy(false)
    if(error){setNotice("Delete failed: "+error.message);return} setItems(p=>p.filter(x=>x.id!==id));setNotice("Deleted.")
  }

  if(authLoading) return <div style={{...S.shell,display:"grid",placeItems:"center"}}>Opening Admin Studio…</div>
  if(!session) return <div style={{...S.shell,minHeight:"100vh",display:"grid",placeItems:"center",padding:20}}>
    <form onSubmit={signIn} style={{...S.card,width:"100%",maxWidth:430,padding:28}}>
      <div style={{...S.serif,fontSize:31,fontWeight:700}}>True Reverie</div>
      <div style={{fontSize:10,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.blush,marginTop:3}}>Admin Studio</div>
      <div style={{fontSize:13,color:C.muted,lineHeight:1.6,margin:"18px 0"}}>Sign in with the owner account you just created in Supabase.</div>
      <label style={labelStyle}>Email</label><input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} style={{...S.input,marginBottom:14}} required/>
      <label style={labelStyle}>Password</label><input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} style={{...S.input,marginBottom:14}} required/>
      {loginError&&<div style={{fontSize:12,color:"#A45B67",marginBottom:12}}>{loginError}</div>}
      <button disabled={busy} style={{width:"100%",border:0,borderRadius:999,background:C.ink,color:"#fff",padding:"12px 16px",fontWeight:850}}>{busy?"Signing in…":"Sign in to Studio"}</button>
    </form>
  </div>

  return <div style={S.shell}>
    <style>{`
      *{box-sizing:border-box} body{margin:0}
      button,input,textarea,select{font:inherit} button{cursor:pointer}
      .tr-grid{display:grid;grid-template-columns:245px minmax(0,1fr);min-height:100vh}.tr-side{display:block}
      .tr-main{padding:34px 38px 70px;max-width:1280px;width:100%;margin:0 auto}.tr-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
      .tr-listhead{display:grid;grid-template-columns:minmax(220px,1.4fr) 130px 110px 90px;gap:12px}.tr-row{display:grid;grid-template-columns:minmax(220px,1.4fr) 130px 110px 90px;gap:12px;align-items:center}.tr-editor{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px}
      @media(max-width:850px){.tr-grid{display:block}.tr-side{display:none}.tr-side.open{display:block;position:fixed;inset:0 18% 0 0;z-index:50;box-shadow:20px 0 50px rgba(0,0,0,.15)}.tr-main{padding:20px 16px 80px}.tr-cards{grid-template-columns:1fr 1fr}.tr-listhead{display:none}.tr-row{grid-template-columns:1fr auto;gap:8px}.tr-row .hide-sm{display:none}.tr-editor{grid-template-columns:1fr}.desktop-only{display:none!important}}@media(max-width:520px){.tr-cards{grid-template-columns:1fr}}
    `}</style>
    <div className="tr-grid">
      <aside className={"tr-side "+(mobileNav?"open":"")} style={{background:"#F3EAEC",borderRight:`1px solid ${C.line}`,padding:"28px 18px",position:"relative"}}>
        <button onClick={()=>setMobileNav(false)} style={{display:mobileNav?"block":"none",position:"absolute",right:15,top:15,border:0,background:"transparent",fontSize:22}}>×</button>
        <div style={{padding:"2px 10px 26px"}}><div style={{...S.serif,fontSize:25,fontWeight:700}}>True Reverie</div><div style={{fontSize:10,fontWeight:800,letterSpacing:2.2,textTransform:"uppercase",color:C.blush,marginTop:3}}>Admin Studio</div></div>
        <Nav active={area==="dashboard"} onClick={()=>{setArea("dashboard");setEditing(null);setMobileNav(false)}} icon="⌂" label="Dashboard"/>
        <div style={{fontSize:9,fontWeight:800,letterSpacing:1.7,textTransform:"uppercase",color:C.muted,padding:"22px 11px 8px"}}>Content</div>
        {AREAS.map(a=><Nav key={a.id} active={area===a.id} onClick={()=>{setArea(a.id);setEditing(null);setMobileNav(false)}} icon={a.icon} label={a.label} count={counts[a.id]}/>) }
        <div style={{margin:"28px 8px 0",padding:"14px",borderRadius:16,background:"rgba(255,255,255,.5)",fontSize:11.5,lineHeight:1.5,color:C.muted}}><b style={{color:C.ink}}>Live Supabase mode</b><br/>Drafts and published content now save to the True Reverie database.</div>
        <button onClick={signOut} style={{...S.pill,margin:"12px 8px"}}>Sign out</button>
      </aside>
      <main className="tr-main">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:25}}>
          <button onClick={()=>setMobileNav(true)} style={{border:`1px solid ${C.line}`,background:C.paper,borderRadius:12,padding:"9px 11px",fontWeight:800}} className="desktop-only">☰</button>
          <div style={{flex:1}}><div style={{...S.serif,fontSize:34,fontWeight:700,lineHeight:1}}>{editing ? (editing.title||"New content") : area==="dashboard" ? "Studio" : labelFor(area)}</div>{!editing && <div style={{fontSize:13,color:C.muted,marginTop:6}}>{area==="dashboard"?"Create the things that make True Reverie feel alive.":AREAS.find(a=>a.id===area)?.sub}</div>}</div>
          {!editing && area!=="dashboard" && <button onClick={()=>setEditing(blank(area))} style={{border:0,borderRadius:999,background:C.ink,color:"#fff",padding:"11px 16px",fontWeight:800}}>＋ New {labelFor(area)}</button>}
        </div>
        {notice&&<div style={{...S.card,padding:"12px 15px",marginBottom:16,fontSize:12,color:C.muted}}>{notice}</div>}
        {busy&&<div style={{fontSize:11,color:C.blush,marginBottom:10}}>Saving…</div>}
        {loadingItems?<div style={{color:C.muted}}>Loading Studio content…</div>:editing ? <Editor item={editing} setItem={setEditing} onSave={saveItem} onCancel={()=>setEditing(null)}/> : area==="dashboard" ? <Dashboard items={items} counts={counts} setArea={setArea} setEditing={setEditing}/> : <Library area={area} items={visible} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onEdit={setEditing} onDuplicate={duplicate} onDelete={remove}/>} 
      </main>
    </div>
  </div>
}
function Nav({active,onClick,icon,label,count}){
  return <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:10,border:0,borderRadius:13,padding:"10px 11px",marginBottom:3,background:active?"rgba(255,255,255,.82)":"transparent",color:active?C.ink:C.muted,textAlign:"left",fontWeight:active?800:650}}>
    <span style={{width:22,textAlign:"center"}}>{icon}</span><span style={{flex:1}}>{label}</span>{count!=null&&<span style={{fontSize:10,opacity:.7}}>{count}</span>}
  </button>
}

function Dashboard({items,counts,setArea,setEditing}){
  const published=items.filter(x=>x.status==="published").length, drafts=items.filter(x=>x.status==="draft").length
  return <>
    <div style={{...S.card,padding:"25px 26px",marginBottom:22,background:"linear-gradient(135deg,#FFFDFC,#F4E8EF)"}}>
      <div style={{fontSize:10,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.blush}}>Dream Her. Become Her.</div>
      <div style={{...S.serif,fontSize:29,fontWeight:700,marginTop:8}}>What do you want to make today?</div>
      <div style={{fontSize:13,color:C.muted,lineHeight:1.6,maxWidth:650,marginTop:6}}>Create it here, preview it, and publish it to True Reverie — without touching GitHub.</div>
      <div style={{display:"flex",gap:9,flexWrap:"wrap",marginTop:17}}>
        {["bloom","move","nourish","cycle","rebuild","feel","ritual"].map(a=><button key={a} onClick={()=>setEditing(blank(a))} style={{...S.pill,color:C.ink}}>＋ {labelFor(a)}</button>)}
      </div>
    </div>
    <div className="tr-cards">
      <Stat n={items.length} label="Studio content"/>
      <Stat n={published} label="Published"/>
      <Stat n={drafts} label="Drafts"/>
    </div>
    <RecentPublished items={items} setEditing={setEditing}/>
    <div style={{fontSize:10,fontWeight:900,letterSpacing:1.7,textTransform:"uppercase",color:C.muted,margin:"28px 0 10px"}}>Create & manage</div>
    <div className="tr-cards">
      {AREAS.map(a=><div key={a.id} onClick={()=>setArea(a.id)} style={{...S.card,padding:"18px",cursor:"pointer"}}>
        <div style={{fontSize:21}}>{a.icon}</div><div style={{...S.serif,fontSize:21,fontWeight:700,marginTop:8}}>{a.label}</div>
        <div style={{fontSize:11.5,color:C.muted,lineHeight:1.45,minHeight:34,marginTop:4}}>{a.sub}</div>
        <div style={{fontSize:11,fontWeight:800,color:C.blush,marginTop:13}}>{counts[a.id]} items →</div>
      </div>)}
    </div>
  </>
}
function RecentPublished({items,setEditing}){
  const recent=items.filter(x=>x.status==="published").sort((a,b)=>(b.publishedAt||0)-(a.publishedAt||0)).slice(0,5)
  return <div style={{marginTop:26}}>
    <div style={{fontSize:10,fontWeight:900,letterSpacing:1.7,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Recently Published</div>
    <div style={{...S.card,overflow:"hidden"}}>
      {recent.length===0?<div style={{padding:22,color:C.muted,fontSize:12}}>Your newest published content will appear here for one-tap editing.</div>:recent.map((item,i)=><div key={item.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderTop:i?`1px solid ${C.line}`:"none"}}>
        <div style={{width:34,height:34,borderRadius:11,background:C.soft,display:"grid",placeItems:"center"}}>{AREAS.find(a=>a.id===item.area)?.icon||"✿"}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title||"Untitled"}</div><div style={{fontSize:10.5,color:C.muted,marginTop:2}}>{labelFor(item.area)} · Published</div></div>
        <button onClick={()=>setEditing(item)} style={tinyBtn}>Edit</button>
      </div>)}
    </div>
  </div>
}

function Stat({n,label}){return <div style={{...S.card,padding:"18px 20px"}}><div style={{...S.serif,fontSize:31,fontWeight:700}}>{n}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{label}</div></div>}

function Library({area,items,query,setQuery,filter,setFilter,onEdit,onDuplicate,onDelete}){
  return <>
    <div style={{display:"flex",gap:9,flexWrap:"wrap",marginBottom:17}}>
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={"Search "+labelFor(area)+"…"} style={{...S.input,maxWidth:360}}/>
      {["all","published","draft"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{...S.pill,background:filter===f?C.ink:C.paper,color:filter===f?"#fff":C.muted,textTransform:"capitalize"}}>{f}</button>)}
    </div>
    <div style={{...S.card,overflow:"hidden"}}>
      <div className="tr-listhead" style={{padding:"10px 16px",background:"#F8F2F4",fontSize:9,fontWeight:900,letterSpacing:1.3,textTransform:"uppercase",color:C.muted}}>
        <div>Content</div><div>Status</div><div>Updated</div><div></div>
      </div>
      {items.length===0?<div style={{padding:35,textAlign:"center",color:C.muted}}>Nothing here yet. Create the first one.</div>:items.map(item=><div className="tr-row" key={item.id} style={{padding:"14px 16px",borderTop:`1px solid ${C.line}`}}>
        <div onClick={()=>onEdit(item)} style={{cursor:"pointer"}}>
          <div style={{fontWeight:800,fontSize:13.5}}>{item.title||"Untitled"}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:3}}>{item.category||item.section||item.mealType||item.duration||labelFor(area)}</div>
        </div>
        <div className="hide-sm"><Status s={item.status}/></div>
        <div className="hide-sm" style={{fontSize:11,color:C.muted}}>{item.updated}</div>
        <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
          <button onClick={()=>onEdit(item)} style={tinyBtn}>Edit</button>
          <button onClick={()=>onDuplicate(item)} style={tinyBtn}>⧉</button>
          <button onClick={()=>onDelete(item.id)} style={{...tinyBtn,color:"#A45B67"}}>×</button>
        </div>
      </div>)}
    </div>
  </>
}
const tinyBtn={border:`1px solid ${C.line}`,background:"#fff",borderRadius:9,padding:"6px 8px",fontSize:10.5,fontWeight:800,color:C.muted}

function Status({s}){
  const pub=s==="published"
  return <span style={{fontSize:10,fontWeight:850,padding:"5px 8px",borderRadius:999,background:pub?"#E9F1E7":"#F3ECEF",color:pub?"#667E62":C.muted}}>{pub?"Published":"Draft"}</span>
}

function Editor({item,setItem,onSave,onCancel}){
  const schema=SCHEMAS[item.area]||[]
  const [preview,setPreview]=useState(true)
  const set=(k,v)=>setItem(p=>({...p,[k]:v}))
  const publish=()=>onSave({...item,status:"published",publishedAt:item.publishedAt||Date.now()})
  return <>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
      <button onClick={onCancel} style={S.pill}>← Content library</button>
      <button onClick={()=>{ window.location.href="/admin" }} style={S.pill}>⌂ Studio</button>
      <div style={{flex:1}}/>
      <button onClick={()=>setPreview(x=>!x)} style={S.pill}>{preview?"Hide":"Show"} preview</button>
      <button onClick={()=>onSave({...item,status:"draft"})} style={S.pill}>Save draft</button>
      <button onClick={publish} style={{...S.pill,border:0,background:C.ink,color:"#fff",padding:"9px 16px"}}>Publish</button>
    </div>
    <div className="tr-editor" style={{gridTemplateColumns:preview?undefined:"1fr"}}>
      <div style={{...S.card,padding:"22px"}}>
        {item.area==="rebuild" && <div style={{padding:"12px 14px",borderRadius:14,background:"#F8F1F5",fontSize:12,color:C.muted,lineHeight:1.5,marginBottom:18}}>
          Programs and experiences are separate content records. Save the program here, then use <b>＋ Add experience</b> below to prototype its guided content.
        </div>}
        {schema.map(([key,label,type,opts])=><Field key={key} k={key} label={label} type={type} opts={opts} value={item[key]} onChange={v=>set(key,v)}/>)}
        <ExtraSwipePages item={item} set={set}/>
        {item.area==="rebuild" && <ExperienceManager item={item} set={set}/>}
        <div style={{display:"flex",gap:9,borderTop:`1px solid ${C.line}`,paddingTop:18,marginTop:8}}>
          <button onClick={()=>onSave({...item,status:"draft"})} style={{...S.pill,flex:1}}>Save draft</button>
          <button onClick={publish} style={{...S.pill,flex:1,border:0,background:"linear-gradient(135deg,#C97BA8,#A87BD1)",color:"#fff"}}>Publish</button>
        </div>
      </div>
      {preview && <Preview item={item}/>}
    </div>
  </>
}

function Field({k,label,type,opts,value,onChange}){
  const [chip,setChip]=useState("")
  if(type==="toggle") return <div style={fieldWrap}><label style={labelStyle}>{label}</label><button onClick={()=>onChange(!value)} style={{width:48,height:27,border:0,borderRadius:99,padding:3,background:value?C.blush:"#D8CED2",display:"flex",justifyContent:value?"flex-end":"flex-start"}}><span style={{width:21,height:21,borderRadius:"50%",background:"#fff",display:"block"}}/></button></div>
  if(type==="image") return <div style={fieldWrap}><label style={labelStyle}>{label}</label><div style={{display:"flex",gap:10,alignItems:"center"}}>
    {value&&<img src={value} style={{width:74,height:74,objectFit:"cover",borderRadius:14,border:`1px solid ${C.line}`}}/>}
    <label style={{...S.pill,display:"inline-block"}}>Upload photo<input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>onChange(r.result);r.readAsDataURL(f)}}}/></label>
    {value&&<button onClick={()=>onChange("")} style={tinyBtn}>Remove</button>}
  </div></div>
  if(type==="textarea") return <div style={fieldWrap}><label style={labelStyle}>{label}</label><textarea rows={4} value={value||""} onChange={e=>onChange(e.target.value)} style={{...S.input,resize:"vertical",lineHeight:1.5}}/></div>
  if(type==="select") return <div style={fieldWrap}><label style={labelStyle}>{label}</label><select value={value||""} onChange={e=>onChange(e.target.value)} style={S.input}><option value="">Choose…</option>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
  if(type==="number") return <div style={fieldWrap}><label style={labelStyle}>{label}</label><input type="number" value={value??""} onChange={e=>onChange(e.target.value)} style={S.input}/></div>
  if(type==="chips"){
    const arr=Array.isArray(value)?value:(value?[value]:[])
    const add=()=>{const v=chip.trim();if(v&&!arr.includes(v))onChange([...arr,v]);setChip("")}
    return <div style={fieldWrap}><label style={labelStyle}>{label}</label><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:7}}>{arr.map(x=><button key={x} onClick={()=>onChange(arr.filter(a=>a!==x))} style={{...S.pill,padding:"6px 9px",color:C.ink}}>{x} ×</button>)}</div><div style={{display:"flex",gap:7}}><input value={chip} onChange={e=>setChip(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add()}}} placeholder="Type and press Enter" style={S.input}/><button onClick={add} style={S.pill}>Add</button></div></div>
  }
  if(type==="list"){
    const arr=Array.isArray(value)?value:[]
    return <div style={fieldWrap}><label style={labelStyle}>{label}</label>{arr.map((x,i)=><div key={i} style={{display:"flex",gap:7,marginBottom:7}}><span style={{fontSize:11,color:C.muted,paddingTop:12,width:18}}>{i+1}</span><input value={x} onChange={e=>onChange(arr.map((a,j)=>j===i?e.target.value:a))} style={S.input}/><button onClick={()=>onChange(arr.filter((_,j)=>j!==i))} style={tinyBtn}>×</button></div>)}<button onClick={()=>onChange([...arr,""])} style={S.pill}>＋ Add item</button></div>
  }
  return <div style={fieldWrap}><label style={labelStyle}>{label}</label><input value={value||""} onChange={e=>onChange(e.target.value)} style={S.input}/></div>
}
const fieldWrap={marginBottom:18}
const labelStyle={display:"block",fontSize:10,fontWeight:900,letterSpacing:1.2,textTransform:"uppercase",color:C.muted,marginBottom:7}

function ExtraSwipePages({item,set}){
  const pages=Array.isArray(item.extraSwipePages)?item.extraSwipePages:[]
  const add=()=>set("extraSwipePages",[...pages,{id:uid(),content:""}])
  const update=(i,v)=>set("extraSwipePages",pages.map((p,j)=>j===i?{...p,content:v}:p))
  const remove=(i)=>set("extraSwipePages",pages.filter((_,j)=>j!==i))
  const move=(i,dir)=>{
    const j=i+dir
    if(j<0||j>=pages.length)return
    const next=[...pages]; [next[i],next[j]]=[next[j],next[i]]; set("extraSwipePages",next)
  }
  return <div style={{borderTop:`1px solid ${C.line}`,paddingTop:20,marginTop:8,marginBottom:20}}>
    <div style={{...S.serif,fontSize:22,fontWeight:700}}>Extra swipe pages</div>
    <div style={{fontSize:11.5,color:C.muted,lineHeight:1.5,margin:"4px 0 14px"}}>Optional. Your normal details stay together on the main swipe card. Add another page only when you need more room, then type exactly what you want on it.</div>
    {pages.map((p,i)=><div key={p.id||i} style={{border:`1px solid ${C.line}`,borderRadius:15,padding:14,marginBottom:10,background:"#FFFEFD"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}><div style={{fontSize:10,fontWeight:900,letterSpacing:1.1,color:C.blush,flex:1}}>EXTRA PAGE {i+1}</div><button onClick={()=>move(i,-1)} disabled={i===0} style={{...tinyBtn,opacity:i===0?.35:1}}>↑</button><button onClick={()=>move(i,1)} disabled={i===pages.length-1} style={{...tinyBtn,opacity:i===pages.length-1?.35:1}}>↓</button><button onClick={()=>remove(i)} style={{...tinyBtn,color:"#A45B67"}}>×</button></div>
      <textarea rows={8} value={p.content||""} onChange={e=>update(i,e.target.value)} placeholder="Type whatever you want on this swipe page…" style={{...S.input,resize:"vertical",lineHeight:1.6}}/>
    </div>)}
    <button onClick={add} style={S.pill}>＋ Add another swipe page</button>
  </div>
}

function ExperienceManager({item,set}){
  const ex=item.experiences||[]
  const add=()=>set("experiences",[...ex,{id:uid(),title:"",why:"",anchor:"",nurseNote:""}])
  const update=(i,k,v)=>set("experiences",ex.map((e,j)=>j===i?{...e,[k]:v}:e))
  return <div style={{borderTop:`1px solid ${C.line}`,paddingTop:20,marginTop:6}}>
    <div style={{display:"flex",alignItems:"center",marginBottom:12}}><div style={{...S.serif,fontSize:22,fontWeight:700,flex:1}}>Experiences</div><button onClick={add} style={S.pill}>＋ Add experience</button></div>
    {ex.length===0&&<div style={{fontSize:12,color:C.muted,padding:"12px 0 18px"}}>No experiences added to this program yet.</div>}
    {ex.map((e,i)=><div key={e.id} style={{border:`1px solid ${C.line}`,borderRadius:15,padding:14,marginBottom:10}}>
      <div style={{fontSize:10,fontWeight:900,color:C.blush,marginBottom:8}}>EXPERIENCE {i+1}</div>
      <input placeholder="Experience title" value={e.title} onChange={ev=>update(i,"title",ev.target.value)} style={{...S.input,marginBottom:8}}/>
      <textarea placeholder="Why this matters" value={e.why} onChange={ev=>update(i,"why",ev.target.value)} style={{...S.input,marginBottom:8}}/>
      <textarea placeholder="Main experience" value={e.anchor} onChange={ev=>update(i,"anchor",ev.target.value)} style={S.input}/>
      <button onClick={()=>set("experiences",ex.filter((_,j)=>j!==i))} style={{...tinyBtn,marginTop:8}}>Remove</button>
    </div>)}
  </div>
}

function Preview({item}){
  const [slide,setSlide]=useState(0)
  useEffect(()=>setSlide(0),[item.id,item.area])
  const img=item.image||item.cover
  const list=item.howTo||item.walkthrough||item.method||item.steps||[]
  const tags=[...(item.tags||[]),...(item.moods||[])]
  const slides=[]
  slides.push(<div key="front">
    <div style={{height:235,background:"linear-gradient(145deg,#E8D7DF,#D9D0E7)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>{img?<img src={img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:46}}>{item.emoji||item.icon||"✿"}</span>}</div>
    <div style={{padding:"18px"}}><div style={{fontSize:9,fontWeight:900,letterSpacing:1.5,textTransform:"uppercase",color:C.blush}}>{labelFor(item.area)}{item.premium?" · TRUE REVERIE+":""}</div><div style={{...S.serif,fontSize:25,fontWeight:700,lineHeight:1.12,marginTop:7}}>{item.title||"Untitled"}</div><div style={{...S.serif,fontSize:14,fontStyle:"italic",color:C.muted,lineHeight:1.5,marginTop:7}}>{item.teaser||item.hook||item.description||item.outcome||"Your description will appear here."}</div><div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:12}}>{tags.slice(0,4).map(t=><span key={t} style={{fontSize:9.5,padding:"5px 7px",borderRadius:999,background:C.soft,color:C.muted,fontWeight:800}}>{t}</span>)}</div>{slides.length!==1&&null}<div style={{fontSize:9.5,color:C.muted,textAlign:"right",marginTop:15}}>Swipe for details →</div></div>
  </div>)
  slides.push(<div key="details" style={{padding:"22px",minHeight:390}}><div style={{...S.serif,fontSize:25,fontWeight:700}}>{item.title||"Untitled"}</div><div style={{fontSize:9,fontWeight:900,letterSpacing:1.4,color:C.blush,marginTop:18}}>DESCRIPTION</div><div style={{fontSize:12,color:C.muted,lineHeight:1.6,marginTop:6}}>{item.description||item.body||item.why||item.action||item.outcome||"Add the deeper content and it will appear here."}</div>{list.length>0&&<><div style={{fontSize:9,fontWeight:900,letterSpacing:1.4,color:C.blush,marginTop:18}}>HOW TO</div>{list.map((x,i)=><div key={i} style={{fontSize:11.5,color:C.muted,lineHeight:1.5,marginTop:7}}>{i+1}. {x}</div>)}</>}{item.ingredients?.length>0&&<><div style={{fontSize:9,fontWeight:900,letterSpacing:1.4,color:C.blush,marginTop:18}}>INGREDIENTS</div>{item.ingredients.map((x,i)=><div key={i} style={{fontSize:11.5,color:C.muted,lineHeight:1.5,marginTop:6}}>• {x}</div>)}</>}{item.nurseNote&&<div style={{background:"#F6EEF2",borderRadius:12,padding:"10px 11px",marginTop:18}}><div style={{fontSize:8.5,fontWeight:900,letterSpacing:1.2,color:C.blush}}>NURSE NOTE</div><div style={{fontSize:11.5,lineHeight:1.5,color:C.muted,marginTop:4}}>{item.nurseNote}</div></div>}</div>)
  ;(item.extraSwipePages||[]).forEach((p,i)=>slides.push(<div key={p.id||`extra-${i}`} style={{padding:"22px",minHeight:390}}><div style={{...S.serif,fontSize:25,fontWeight:700,marginBottom:16}}>{item.title||"Untitled"}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{p.content||"Type your extra page content in the editor and it will appear here."}</div></div>))
  const next=()=>setSlide((slide+1)%slides.length), prev=()=>setSlide((slide-1+slides.length)%slides.length)
  return <div style={{position:"sticky",top:24,height:"fit-content"}}><div style={{fontSize:9,fontWeight:900,letterSpacing:1.7,textTransform:"uppercase",color:C.muted,marginBottom:9}}>Post preview · swipeable</div><div style={{...S.card,overflow:"hidden",maxWidth:340,margin:"0 auto",touchAction:"pan-y"}} onTouchStart={e=>{e.currentTarget._x=e.touches[0].clientX}} onTouchEnd={e=>{const x=e.currentTarget._x||0,dx=e.changedTouches[0].clientX-x;if(dx<-35)next();if(dx>35)prev()}}>{slides[slide]}</div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:10}}><button onClick={prev} style={tinyBtn}>←</button><div style={{display:"flex",gap:5}}>{slides.map((_,i)=><span key={i} onClick={()=>setSlide(i)} style={{width:7,height:7,borderRadius:"50%",background:i===slide?C.ink:C.line,cursor:"pointer"}}/>)}</div><button onClick={next} style={tinyBtn}>→</button></div><div style={{fontSize:10.5,color:C.muted,lineHeight:1.45,textAlign:"center",marginTop:8}}>Swipe it here before you publish it.</div></div>
}

