import { ACTIVITY_LEVELS, EATING_OUT, GROCERY_CATS2, LEARN_TOPICS, MEALS, MEAL_TYPES, NUTRITION_PLANS, QUICK_HELP, STARTER_FOODS, SUPPLEMENTS, calcTargets, foodUnitList, mealAsFood, nutrientsFor, r1, searchFoods, sumEntries } from '../data/nourish.js'
import { BASE, dayIndex } from '../lib/theme.js'

const NOURISH_LINES = [
  "Protein first. Perfection never.",
  "Fed is the baseline, not the goal.",
  "Eating enough is not a setback.",
  "A fed day is a good day.",
  "Something is always better than nothing.",
  "Your body is not a math problem.",
  "Nourishment is not a reward you earn.",
  "Good enough, eaten, beats perfect, skipped.",
  "You are allowed to be hungry.",
  "Consistency over accuracy.",
]

const TIME_CHOICES = [
  { key: "nocook", label: "No cooking", emoji: "🥶", test: m => (m.tags || []).includes("No Cook") },
  { key: "5", label: "5 min", emoji: "⚡", test: m => m.min <= 5 },
  { key: "15", label: "10–15 min", emoji: "⏱", test: m => m.min > 5 && m.min <= 15 },
  { key: "30", label: "20–30 min", emoji: "🍳", test: m => m.min > 15 && m.min <= 30 },
  { key: "time", label: "I've got time", emoji: "✨", test: m => m.min >= 20 },
]

const MEAL_EMOJI = { breakfast: "☀️", lunch: "🥗", dinner: "🍽️", snack: "🍓" }
const mealPhoto = m => m.img || m.image || m.image_url || null
const browseValue = (time, tag) => [time ? "time:" + time : "", tag ? "tag:" + tag : ""].filter(Boolean).join("|")
const parseBrowse = value => {
  const parts = String(value || "").split("|").filter(Boolean)
  return {
    time: ((parts.find(x => x.startsWith("time:")) || "").replace("time:", "") || null),
    tag: ((parts.find(x => x.startsWith("tag:")) || "").replace("tag:", "") || null),
  }
}
const mealGradient = m => m.t === "breakfast"
  ? "linear-gradient(145deg,#F4E5C9,#E7C9A2)"
  : m.t === "lunch"
  ? "linear-gradient(145deg,#DDE8D4,#BFD3B3)"
  : m.t === "dinner"
  ? "linear-gradient(145deg,#E7D7D0,#CBB3AE)"
  : "linear-gradient(145deg,#EEDCE6,#D9C5DA)"

export function renderNourish(ctx) {
  const {
    addEntries, addFoodFor, addTab, bodyView, calcInputs, calcResult, checkedIn, cur, dateStr,
    deleteEntry, entryEdit, findFood, foodDays, foodPick, foodQuery, groceryAdd, groceryChecked,
    groceryManual, learnOpen, logDate, makeEntry, mealFilter, mealOpen, mealType, myFoods,
    myMeals, newId, nourishView, nutrition, planView, quickAdd, recentFoods, rememberRecent,
    saveGroceryChecked, saveGroceryManual, saveNutrition, savedFoods, setAddFoodFor, setAddTab,
    setCalcInputs, setCalcResult, setEntryEdit, setFoodPick, setFoodQuery, setGroceryAdd,
    setLearnOpen, setLogDate, setMealFilter, setMealOpen, setMealType, setNourishView,
    setPlanView, setQuickAdd, setSuppOpen, setWaterCount, setupData, suppOpen, tab,
    toggleFavorite, updateEntry, weekPlan
  } = ctx

  if (!(tab === "body" && bodyView === "nourish")) return null

  const today = new Date().toISOString().slice(0,10)
  const useDate = logDate || today
  const rec = foodDays[useDate] || { items: [], water: 0 }
  const items = rec.items || []
  const water = rec.water || 0
  const eaten = sumEntries(items)
  const targets = nutrition && nutrition.targets ? nutrition.targets : null
  const hour = new Date().getHours()
  const nextType = hour < 10 ? "breakfast" : hour < 15 ? "lunch" : hour < 20 ? "dinner" : "snack"
  const nm = (setupData && setupData.name) || ""
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
  const browse = parseBrowse(mealFilter)
  const timeChoice = TIME_CHOICES.find(x => x.key === browse.time) || null

  const Back = ({ onClick, label }) => (
    <div onClick={onClick} style={{ fontSize:13, fontWeight:700, color:BASE.taupe, cursor:"pointer", marginBottom:16 }}>‹ {label}</div>
  )
  const Soft = ({ children, style }) => (
    <div style={{ borderRadius:18, background:BASE.surface, border:`1px solid ${BASE.border}`, padding:"16px 17px", marginBottom:12, ...style }}>{children}</div>
  )
  const Mini = ({ emoji, title, sub, onClick }) => (
    <div onClick={onClick} style={{ flex:"0 0 118px", minHeight:92, borderRadius:19, background:BASE.surface, border:`1px solid ${BASE.border}`, padding:"14px 12px", cursor:"pointer", scrollSnapAlign:"start" }}>
      <div style={{ fontSize:19 }}>{emoji}</div>
      <div style={{ fontSize:12.5, fontWeight:800, color:BASE.cream, marginTop:8 }}>{title}</div>
      <div style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic", fontSize:11.5, color:BASE.taupe, marginTop:2, lineHeight:1.25 }}>{sub}</div>
    </div>
  )

  const MealFeedCard = ({ m }) => {
    const img = mealPhoto(m)
    const favFood = mealAsFood(m)
    const isFav = (savedFoods || []).some(x => x.id === favFood.id)
    return (
      <div style={{ borderRadius:25, overflow:"hidden", border:`1px solid ${BASE.border}`, background:BASE.surface, marginBottom:24 }}>
        <div style={{ display:"flex", overflowX:"auto", scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch", overscrollBehaviorX:"contain" }}>
          <div style={{ flex:"0 0 100%", scrollSnapAlign:"start" }}>
            <div style={{ position:"relative", aspectRatio:"4 / 5", background:mealGradient(m), overflow:"hidden" }}>
              {img ? <img src={img} alt={m.n} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> :
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <span style={{ fontSize:68 }}>{MEAL_EMOJI[m.t]}</span>
                  <span style={{ fontSize:10, fontWeight:800, letterSpacing:1.4, textTransform:"uppercase", color:"rgba(70,45,58,.58)" }}>Photo ready</span>
                </div>}
              <div style={{ position:"absolute", top:15, left:15, display:"flex", gap:7 }}>
                <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", padding:"7px 10px", borderRadius:999, background:"rgba(255,255,255,.86)", color:"#76576A" }}>{(MEAL_TYPES.find(x=>x[0]===m.t)||["",m.t])[1]}</span>
                <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", padding:"7px 10px", borderRadius:999, background:"rgba(255,255,255,.86)", color:"#76576A" }}>{m.min} min</span>
              </div>
              <div style={{ position:"absolute", right:14, bottom:14, padding:"7px 11px", borderRadius:999, background:"rgba(255,255,255,.88)", color:"#76576A", fontSize:11, fontWeight:800, fontStyle:"italic" }}>1 of 3 →</div>
            </div>
            <div style={{ padding:"18px 20px 19px" }}>
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:25, fontWeight:700, color:BASE.cream, lineHeight:1.15 }}>{m.n}</div>
              <div style={{ display:"flex", gap:11, flexWrap:"wrap", marginTop:9, fontSize:11.5, color:BASE.taupe }}>
                <span style={{ color:"#C9558E", fontWeight:800 }}>{m.p}g protein</span><span>{m.cal} cal</span><span>{m.min} min</span>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:11 }}>
                {(m.tags||[]).slice(0,4).map(t=><span key={t} style={{ fontSize:9.5, fontWeight:700, padding:"4px 8px", borderRadius:999, background:"rgba(201,85,142,.09)", color:"#A75A7F" }}>{t}</span>)}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:14 }}>
                <button onClick={()=>ctx.logMeal(m,m.t)} style={{ padding:"12px 8px", borderRadius:13, border:"none", background:"linear-gradient(135deg,#E984B4,#A87BD1)", color:"#fff", fontSize:12.5, fontWeight:800 }}>Log meal</button>
                <button onClick={()=>toggleFavorite(favFood)} style={{ padding:"12px 8px", borderRadius:13, border:`1px solid ${isFav?"#C9558E":BASE.border}`, background:isFav?"rgba(201,85,142,.10)":BASE.surface, color:isFav?"#C9558E":BASE.creamDim, fontSize:12.5, fontWeight:800 }}>{isFav?"♥ Saved":"♡ Save"}</button>
              </div>
            </div>
          </div>

          <div style={{ flex:"0 0 100%", scrollSnapAlign:"start", padding:"22px 20px 24px", minHeight:520 }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div><div style={{ fontSize:10, fontWeight:800, letterSpacing:1.6, textTransform:"uppercase", color:"#C9558E" }}>What you'll need</div><div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:700, color:BASE.cream, marginTop:5 }}>Ingredients</div></div>
              <div style={{ fontSize:11, color:BASE.taupe, fontWeight:800 }}>2 of 3 →</div>
            </div>
            <div style={{ height:1, background:BASE.border, margin:"16px 0" }} />
            {(m.ing||[]).map(([cat,item],i)=><div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:`.5px solid ${BASE.border}` }}><span style={{ flex:1, fontSize:14, color:BASE.creamDim }}>{item}</span><span style={{ fontSize:10.5, color:BASE.taupe }}>{cat}</span></div>)}
            <div style={{ marginTop:20, fontSize:12.5, color:BASE.taupe, fontStyle:"italic", lineHeight:1.55 }}>The recipe method will live here as each Nourish meal is individually perfected. The swipe structure is ready for it.</div>
          </div>

          <div style={{ flex:"0 0 100%", scrollSnapAlign:"start", padding:"22px 20px 24px", minHeight:520 }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
              <div><div style={{ fontSize:10, fontWeight:800, letterSpacing:1.6, textTransform:"uppercase", color:"#C9558E" }}>At a glance</div><div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:700, color:BASE.cream, marginTop:5 }}>Nutrition</div></div>
              <div style={{ fontSize:11, color:"#7FA054", fontWeight:800 }}>3 of 3 ✓</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginTop:18, marginBottom:10 }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", color:BASE.taupe }}>Portion</span>
              <span style={{ fontSize:12.5, fontWeight:800, color:BASE.creamDim }}>1 serving</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:20 }}>
              {[["Protein",m.p+"g","#E984B4"],["Calories",m.cal,"#E8B84B"],["Carbs",m.c+"g","#7FA054"],["Fat",m.f+"g","#9B6BC3"]].map(([l,v,c])=><div key={l} style={{ borderRadius:16, border:`1px solid ${BASE.border}`, padding:"17px 10px", textAlign:"center" }}><div style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:28, fontWeight:700, color:c }}>{v}</div><div style={{ fontSize:10.5, color:BASE.taupe }}>{l}</div></div>)}
            </div>
            <div style={{ borderRadius:16, background:"rgba(201,123,168,.09)", padding:"15px 17px", marginTop:18 }}>
              <div style={{ fontSize:9.5, fontWeight:800, letterSpacing:1.3, textTransform:"uppercase", color:"#C97BA8" }}>Nurse-informed note</div>
              <div style={{ fontFamily:"'Cormorant Garamond', serif", fontStyle:"italic", fontSize:15, color:BASE.creamDim, marginTop:5, lineHeight:1.5 }}>These numbers are context, not a score. Pick food because it supports you and sounds good.</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:18 }}>
              <button onClick={()=>ctx.logMeal(m,m.t)} style={{ padding:"13px 8px", borderRadius:13, border:"none", background:"linear-gradient(135deg,#E984B4,#A87BD1)", color:"#fff", fontSize:12.5, fontWeight:800 }}>Log meal</button>
              <button onClick={()=>toggleFavorite(favFood)} style={{ padding:"13px 8px", borderRadius:13, border:`1px solid ${isFav?"#C9558E":BASE.border}`, background:isFav?"rgba(201,85,142,.10)":BASE.surface, color:isFav?"#C9558E":BASE.creamDim, fontSize:12.5, fontWeight:800 }}>{isFav?"♥ Saved":"♡ Save"}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ padding:"10px 18px 0" }}>

      {nourishView==="today" && !planView && !addFoodFor && !foodPick && !entryEdit && (
        <div className="fade-in">
          <div style={{ fontSize:9,fontWeight:800,letterSpacing:1.9,textTransform:"uppercase",color:BASE.taupe,margin:"4px 2px 10px" }}>Your Nourish tools</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
            {[
              ["🍽","Log","Food",()=>setPlanView("log")],
              ["🛒","Grocery","List",()=>setPlanView("grocery")],
              ["⭐","Favorites","Saved",()=>{setAddFoodFor(nextType);setAddTab("favorites")}],
              ["💧","Water",`${water*8} oz`,()=>setPlanView("water")],
              ["✨","Supps","Learn",()=>setNourishView("supps")],
              ["📖","Learn","Nurse-informed",()=>setPlanView("learn")],
            ].map(([ic,title,sub,fn])=><div key={title} onClick={fn} style={{ minHeight:40,borderRadius:12,background:BASE.surface,border:`1px solid ${BASE.border}`,padding:"5px 4px",textAlign:"center",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}><div style={{fontSize:13,lineHeight:1}}>{ic}</div><div style={{fontSize:10.5,fontWeight:800,color:BASE.cream,marginTop:2,lineHeight:1.05}}>{title}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:8.5,color:BASE.taupe,marginTop:1,lineHeight:1}}>{sub}</div></div>)}
          </div>

          <div style={{ marginTop:15 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:12 }}>
              <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:27,fontWeight:700,color:BASE.cream}}>Meal Ideas</div>
              {(mealType || browse.time || browse.tag) && <div onClick={()=>{setMealType(null);setMealFilter(null)}} style={{fontSize:11.5,fontWeight:800,color:"#C9558E",cursor:"pointer"}}>Clear filters</div>}
            </div>

            <div style={{fontSize:9,fontWeight:800,letterSpacing:1.6,textTransform:"uppercase",color:BASE.taupe,marginBottom:8}}>Meal</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
              {MEAL_TYPES.map(([k,lbl])=><div key={k} onClick={()=>setMealType(mealType===k?null:k)} style={{padding:"9px 3px",borderRadius:999,textAlign:"center",cursor:"pointer",fontSize:10.5,fontWeight:800,border:`1px solid ${mealType===k?"#C9558E":BASE.border}`,background:mealType===k?"#C9558E":BASE.surface,color:mealType===k?"#fff":BASE.creamDim}}>{lbl}</div>)}
            </div>
          </div>

          <div style={{ marginTop:14 }}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:1.6,textTransform:"uppercase",color:BASE.taupe,marginBottom:8}}>Time</div>
            <div style={{display:"flex",gap:7,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:4}}>
              {TIME_CHOICES.map(x=><div key={x.key} onClick={()=>setMealFilter(browseValue(browse.time===x.key?null:x.key,browse.tag))} style={{flex:"0 0 auto",padding:"9px 11px",borderRadius:999,whiteSpace:"nowrap",cursor:"pointer",fontSize:10.5,fontWeight:800,border:`1px solid ${browse.time===x.key?"#A87BD1":BASE.border}`,background:browse.time===x.key?"#A87BD1":BASE.surface,color:browse.time===x.key?"#fff":BASE.creamDim}}>{x.label}</div>)}
            </div>
          </div>

          <div style={{ marginTop:14 }}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:1.6,textTransform:"uppercase",color:BASE.taupe,marginBottom:8}}>Quick help</div>
            <div style={{display:"flex",gap:7,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:5}}>
              {QUICK_HELP.map(q=><div key={q.label} onClick={()=>setMealFilter(browseValue(browse.time,browse.tag===q.filter?null:q.filter))} style={{flex:"0 0 auto",whiteSpace:"nowrap",padding:"9px 11px",borderRadius:999,border:`1px solid ${browse.tag===q.filter?"#C9558E":BASE.border}`,background:browse.tag===q.filter?"#C9558E":BASE.surface,color:browse.tag===q.filter?"#fff":BASE.creamDim,fontSize:10.5,fontWeight:800,cursor:"pointer"}}>{q.emoji} {q.label}</div>)}
            </div>
          </div>

          <div style={{ marginTop:18 }}>
            {(() => {
              let list = MEALS.filter(m => (!mealType || m.t===mealType) && (!timeChoice || timeChoice.test(m)) && (!browse.tag || (m.tags||[]).includes(browse.tag)))
              if (!mealType) {
                const groups = MEAL_TYPES.map(([k]) => list.filter(m => m.t===k))
                const mixed = []
                let i = 0
                while (mixed.length < list.length) {
                  groups.forEach(g => { if (g[i]) mixed.push(g[i]) })
                  i++
                }
                list = mixed
              }
              return list.length ? list.map(m => <MealFeedCard key={m.n} m={m} />) : <Soft style={{textAlign:"center",padding:"28px 20px"}}><div style={{fontSize:25}}>🍽️</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:19,fontWeight:700,color:BASE.cream,marginTop:8}}>Nothing fits that combination yet.</div><div style={{fontSize:12.5,color:BASE.taupe,lineHeight:1.55,marginTop:6}}>Clear one filter and keep browsing.</div></Soft>
            })()}
          </div>

          <div style={{marginTop:20,textAlign:"center",paddingBottom:36}}>
            <div style={{fontSize:8.5,fontWeight:800,letterSpacing:2.3,textTransform:"uppercase",color:BASE.taupe}}>Nourish yourself</div>
            <div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:"italic",fontSize:15,color:BASE.taupe,marginTop:12}}>{NOURISH_LINES[dayIndex(NOURISH_LINES.length)]}</div>
          </div>
        </div>
      )}

      {nourishView==="today" && planView==="water" && <div className="fade-in">
        <Back onClick={()=>setPlanView(null)} label="Nourish"/>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:27,fontWeight:700,color:BASE.cream}}>Water</div>
        <div style={{textAlign:"center",padding:"30px 0 22px"}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:64,color:BASE.cream}}>{water*8}<span style={{fontSize:20,color:BASE.taupe}}> oz</span></div><div style={{fontStyle:"italic",color:BASE.taupe,fontSize:13}}>today</div></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setWaterCount(Math.max(0,water-1))} style={{flex:1,padding:14,borderRadius:14,border:`1px solid ${BASE.border}`,background:"transparent",color:BASE.cream}}>− 8 oz</button><button onClick={()=>setWaterCount(water+1)} style={{flex:2,padding:14,borderRadius:14,border:"none",background:"linear-gradient(135deg,#7FB3D5,#A87BD1)",color:"#fff",fontWeight:800}}>+ 8 oz</button></div>
      </div>}

      {nourishView==="today" && planView==="learn" && !learnOpen && <div className="fade-in">
        <Back onClick={()=>setPlanView(null)} label="Nourish"/>
        <div style={{fontSize:9,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#C9558E"}}>Nurse-informed</div>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream,marginTop:4}}>Learn</div>
        <div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,margin:"7px 0 18px"}}>Understand food and your body without turning eating into homework.</div>
        {LEARN_TOPICS.map(t=><div key={t.name} onClick={()=>setLearnOpen(t.name)} style={{display:"flex",gap:12,alignItems:"center",padding:"14px 15px",borderRadius:15,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:8,cursor:"pointer"}}><span style={{fontSize:20}}>{t.emoji}</span><span style={{flex:1,fontSize:13.5,fontWeight:800,color:BASE.cream}}>{t.name}</span><span style={{color:BASE.taupe}}>›</span></div>)}
      </div>}

      {nourishView==="today" && planView==="learn" && learnOpen && (()=>{const t=LEARN_TOPICS.find(x=>x.name===learnOpen);return <div className="fade-in"><Back onClick={()=>setLearnOpen(null)} label="Learn"/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:28,fontWeight:700,color:BASE.cream}}>{t.emoji} {t.name}</div><div style={{fontSize:13.5,color:BASE.creamDim,lineHeight:1.7,marginTop:14}}>{t.body}</div><div style={{fontSize:10,fontWeight:800,letterSpacing:1.4,textTransform:"uppercase",color:"#C9558E",margin:"20px 0 9px"}}>In practice</div>{t.tips.map((tip,i)=><div key={i} style={{display:"flex",gap:9,marginBottom:8}}><span style={{color:"#C9558E"}}>•</span><span style={{fontSize:13,color:BASE.creamDim,lineHeight:1.55}}>{tip}</span></div>)}<div style={{fontSize:11,color:BASE.taupe,textAlign:"center",fontStyle:"italic",margin:"20px 0"}}>General education, not medical advice.</div></div>})()}

      {nourishView==="supps" && !suppOpen && <div className="fade-in">
        <Back onClick={()=>setNourishView("today")} label="Nourish"/>
        <div style={{fontSize:9,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:"#C9558E"}}>Nurse-informed</div>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream,marginTop:4}}>Supplements</div>
        <div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,margin:"7px 0 18px"}}>What they are, what the evidence suggests, and when to ask your own provider.</div>
        {SUPPLEMENTS.map(sp=><div key={sp.name} onClick={()=>setSuppOpen(sp.name)} style={{display:"flex",gap:12,alignItems:"center",padding:"14px 15px",borderRadius:15,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:8,cursor:"pointer"}}><span style={{fontSize:20}}>{sp.emoji}</span><span style={{flex:1,fontSize:13.5,fontWeight:800,color:BASE.cream}}>{sp.name}</span><span style={{color:BASE.taupe}}>›</span></div>)}
      </div>}

      {nourishView==="supps" && suppOpen && (()=>{const sp=SUPPLEMENTS.find(x=>x.name===suppOpen);const rows=[["What it is",sp.what],["Why people use it",sp.why],["Potential benefits studied",sp.benefits],["Common considerations",sp.considerations],["When to discuss with a professional",sp.pro]];return <div className="fade-in"><Back onClick={()=>setSuppOpen(null)} label="All supplements"/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:28,fontWeight:700,color:BASE.cream}}>{sp.emoji} {sp.name}</div>{rows.map(([h,b])=><Soft key={h} style={{marginTop:12}}><div style={{fontSize:9.5,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase",color:"#C9558E",marginBottom:5}}>{h}</div><div style={{fontSize:13,color:BASE.creamDim,lineHeight:1.6}}>{b}</div></Soft>)}</div>})()}


      {nourishView==="today" && planView==="log" && !addFoodFor && !foodPick && <div className="fade-in">
        <Back onClick={()=>setPlanView(null)} label="Nourish"/>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:27,fontWeight:700,color:BASE.cream,marginBottom:14}}>Log Food</div>
        <div style={{display:"flex",justifyContent:"space-around",padding:"14px 8px",borderRadius:16,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:18}}>
          {[["Protein",Math.round(eaten.p)+"g"],["Calories",Math.round(eaten.cal)],["Carbs",Math.round(eaten.c)+"g"],["Fat",Math.round(eaten.f)+"g"]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:BASE.cream}}>{v}</div><div style={{fontSize:9.5,color:BASE.taupe,marginTop:2}}>{l}</div></div>)}
        </div>
        {MEAL_TYPES.map(([slot,lbl])=>{const group=items.filter(x=>x.meal===slot);const tot=sumEntries(group);return <Soft key={slot}><div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:8}}><span style={{fontSize:12.5,fontWeight:800,color:BASE.cream}}>{lbl}</span><span style={{fontSize:11,color:BASE.taupe}}>{group.length?`${Math.round(tot.cal)} cal · ${r1(tot.p)}g protein`:"Not logged"}</span></div>{group.map(it=><div key={it.id} onClick={()=>setEntryEdit(it)} style={{padding:"9px 0",borderTop:`.5px solid ${BASE.border}`,cursor:"pointer"}}><div style={{fontSize:13,color:BASE.cream}}>{it.name}</div><div style={{fontSize:10.5,color:BASE.taupe,marginTop:2}}>{Math.round(it.cal)} cal · {r1(it.p)}g protein</div></div>)}<div onClick={()=>{setAddFoodFor(slot);setAddTab("search");setFoodQuery("")}} style={{color:"#C9558E",fontSize:12.5,fontWeight:800,cursor:"pointer",paddingTop:9}}>+ Add food</div></Soft>})}
      </div>}

      {nourishView==="today" && addFoodFor && !foodPick && <div className="fade-in">
        <Back onClick={()=>{setAddFoodFor(null);setFoodQuery("")}} label="Food log"/>
        <div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream,marginBottom:12}}>Add food</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {[["search","Search"],["recent","Recent"],["favorites","Favorites"],["mymeals","My Meals"],["quick","Quick Add"]].map(([k,l])=><button key={k} onClick={()=>setAddTab(k)} style={{flex:"1 1 28%",padding:"9px 6px",borderRadius:999,border:"none",background:addTab===k?"#C9558E":BASE.surface,color:addTab===k?"#fff":BASE.creamDim,fontSize:11.5,fontWeight:800}}>{l}</button>)}
        </div>
        {addTab==="search" && <><input value={foodQuery} onChange={e=>setFoodQuery(e.target.value)} placeholder="Search foods…" style={{width:"100%",padding:"13px 15px",borderRadius:13,background:BASE.bg2,border:`1px solid ${BASE.border}`,color:BASE.cream,fontSize:14,outline:"none",marginBottom:12}}/>{[...myFoods.filter(x=>!foodQuery.trim()||x.name.toLowerCase().includes(foodQuery.trim().toLowerCase())),...searchFoods(foodQuery)].map(fd=><div key={fd.id} onClick={()=>setFoodPick({food:fd,qty:1,unit:foodUnitList(fd)[0].u})} style={{padding:"12px 14px",borderRadius:13,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:7,cursor:"pointer",fontSize:13.5,fontWeight:700,color:BASE.cream}}>{fd.name}</div>)}</>}
        {addTab==="recent" && (recentFoods.length?recentFoods.map(r=><div key={r.key} onClick={()=>setFoodPick({food:r.food,qty:r.qty,unit:r.unit})} style={{padding:"12px 14px",borderRadius:13,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:7,cursor:"pointer",fontSize:13.5,color:BASE.cream}}>{r.food.name}</div>):<Soft>No recent foods yet.</Soft>)}
        {addTab==="favorites" && (savedFoods.length?savedFoods.map(fd=><div key={fd.id} onClick={()=>setFoodPick({food:fd,qty:1,unit:foodUnitList(fd)[0].u})} style={{padding:"12px 14px",borderRadius:13,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:7,cursor:"pointer",fontSize:13.5,color:BASE.cream}}>💗 {fd.name}</div>):<Soft>Heart a food to save it here.</Soft>)}
        {addTab==="mymeals" && (myMeals.length?myMeals.map(mm=><Soft key={mm.id}><div style={{fontSize:13.5,fontWeight:700,color:BASE.cream}}>{mm.name}</div><div style={{fontSize:11,color:BASE.taupe,marginTop:4}}>{mm.items.map(i=>i.name).join(", ")}</div><div onClick={()=>{addEntries(mm.items.map(i=>({...i,id:newId(),meal:addFoodFor})));setAddFoodFor(null)}} style={{marginTop:9,color:"#C9558E",fontSize:12,fontWeight:800,cursor:"pointer"}}>Add meal</div></Soft>):<Soft>No saved meals yet.</Soft>)}
        {addTab==="quick" && <Soft>{["name","cal","p","c","f"].map(k=><input key={k} value={quickAdd[k]} onChange={e=>setQuickAdd({...quickAdd,[k]:e.target.value})} placeholder={{name:"Name",cal:"Calories",p:"Protein (g)",c:"Carbs (g)",f:"Fat (g)"}[k]} type={k==="name"?"text":"number"} style={{width:"100%",padding:"11px 12px",borderRadius:11,background:BASE.bg2,border:`1px solid ${BASE.border}`,color:BASE.cream,fontSize:13,outline:"none",marginBottom:8}}/>)}<button onClick={()=>{if(quickAdd.cal==="")return;addEntries([{id:newId(),meal:addFoodFor,name:quickAdd.name||"Quick add",qty:1,unit:"entry",cal:Number(quickAdd.cal)||0,p:Number(quickAdd.p)||0,c:Number(quickAdd.c)||0,f:Number(quickAdd.f)||0}]);setQuickAdd({name:"",cal:"",p:"",c:"",f:""});setAddFoodFor(null)}} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:"#C9558E",color:"#fff",fontWeight:800}}>Add</button></Soft>}
      </div>}

      {nourishView==="today" && foodPick && (()=>{const {food,qty,unit}=foodPick;const n=food.fixed?{cal:food.fixed.cal*qty,p:food.fixed.p*qty,c:food.fixed.c*qty,f:food.fixed.f*qty}:nutrientsFor(food,qty,unit);const fav=savedFoods.some(x=>x.id===food.id);return <div className="fade-in"><Back onClick={()=>setFoodPick(null)} label="Add food"/><div style={{display:"flex",gap:10,alignItems:"flex-start"}}><div style={{flex:1,fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream}}>{food.name}</div><span onClick={()=>toggleFavorite(food)} style={{fontSize:21,cursor:"pointer",opacity:fav?1:.35}}>💗</span></div><div style={{display:"flex",gap:8,marginTop:16}}><input value={qty} onChange={e=>setFoodPick({...foodPick,qty:e.target.value})} type="number" style={{width:86,padding:"12px",borderRadius:12,background:BASE.bg2,border:`1px solid ${BASE.border}`,color:BASE.cream}}/><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{foodUnitList(food).map(u=><span key={u.u} onClick={()=>setFoodPick({...foodPick,unit:u.u})} style={{padding:"9px 11px",borderRadius:999,border:`1px solid ${unit===u.u?"#A87BD1":BASE.border}`,background:unit===u.u?"#A87BD1":"transparent",color:unit===u.u?"#fff":BASE.creamDim,fontSize:11.5,fontWeight:700,cursor:"pointer"}}>{u.u}</span>)}</div></div>{n&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginTop:16}}>{[["Cal",Math.round(n.cal)],["P",r1(n.p)+"g"],["C",r1(n.c)+"g"],["F",r1(n.f)+"g"]].map(([l,v])=><div key={l} style={{textAlign:"center",padding:"12px 4px",borderRadius:12,background:BASE.surface,border:`1px solid ${BASE.border}`}}><div style={{fontSize:15,fontWeight:800,color:BASE.cream}}>{v}</div><div style={{fontSize:9,color:BASE.taupe}}>{l}</div></div>)}</div>}<button onClick={()=>{const en=makeEntry(food,Number(qty),unit,addFoodFor||"snack");if(en){addEntries([en]);rememberRecent(food,Number(qty),unit);setFoodPick(null);setAddFoodFor(null)}}} style={{width:"100%",padding:15,borderRadius:14,border:"none",background:"linear-gradient(135deg,#E984B4,#A87BD1)",color:"#fff",fontWeight:800,marginTop:18}}>Add to log</button></div>})()}

      {nourishView==="today" && planView==="grocery" && (()=>{const list={};groceryManual.forEach(g=>{list[g.cat]=list[g.cat]||[];list[g.cat].push(g.item)});const cats=GROCERY_CATS2.filter(c=>list[c]&&list[c].length);return <div className="fade-in"><Back onClick={()=>setPlanView(null)} label="Nourish"/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:27,fontWeight:700,color:BASE.cream}}>Grocery List</div><div style={{display:"flex",gap:7,margin:"15px 0"}}><input value={groceryAdd} onChange={e=>setGroceryAdd(e.target.value)} placeholder="Add an item…" style={{flex:1,padding:"12px 13px",borderRadius:12,background:BASE.bg2,border:`1px solid ${BASE.border}`,color:BASE.cream}}/><button onClick={()=>{if(groceryAdd.trim()){saveGroceryManual([...groceryManual,{cat:"Other",item:groceryAdd.trim()}]);setGroceryAdd("")}}} style={{padding:"0 17px",borderRadius:12,border:"none",background:"#C9558E",color:"#fff",fontWeight:800}}>Add</button></div>{!cats.length?<Soft style={{textAlign:"center"}}>Your list is empty.</Soft>:cats.map(cat=><div key={cat} style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:800,letterSpacing:1.3,textTransform:"uppercase",color:"#C9558E",marginBottom:7}}>{cat}</div>{list[cat].map(item=>{const k=cat+":"+item;const on=!!groceryChecked[k];return <div key={k} onClick={()=>saveGroceryChecked({...groceryChecked,[k]:!on})} style={{padding:"11px 13px",borderRadius:12,background:BASE.surface,border:`1px solid ${BASE.border}`,marginBottom:6,color:BASE.cream,fontSize:13,cursor:"pointer",textDecoration:on?"line-through":"none",opacity:on?.55:1}}>{on?"✓ ":"○ "}{item}</div>})}</div>)}</div>})()}

      {nourishView==="today" && planView==="targets" && <div className="fade-in"><Back onClick={()=>setPlanView(null)} label="Nourish"/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:27,fontWeight:700,color:BASE.cream}}>Nutrition Targets</div><div style={{fontSize:13,color:BASE.taupe,lineHeight:1.6,margin:"6px 0 18px"}}>Useful context, not rules to obey.</div>{targets?<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["Protein",targets.p+"g"],["Calories",targets.cal],["Carbs",targets.c+"g"],["Fat",targets.f+"g"]].map(([l,v])=><Soft key={l} style={{textAlign:"center"}}><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:29,fontWeight:700,color:BASE.cream}}>{v}</div><div style={{fontSize:10.5,color:BASE.taupe}}>{l}</div></Soft>)}</div>:<Soft>Set your targets to personalize Nourish.</Soft>}</div>}

      {nourishView==="today" && entryEdit && <div className="fade-in"><Back onClick={()=>setEntryEdit(null)} label="Food log"/><div style={{fontFamily:"'Cormorant Garamond', serif",fontSize:25,fontWeight:700,color:BASE.cream}}>{entryEdit.name}</div><div style={{fontSize:12,color:BASE.taupe,marginTop:8}}>{entryEdit.qty} {entryEdit.unit} · {Math.round(entryEdit.cal)} cal · {r1(entryEdit.p)}g protein</div><button onClick={()=>{deleteEntry(entryEdit.id);setEntryEdit(null)}} style={{width:"100%",padding:13,borderRadius:13,border:"none",background:"transparent",color:"#D65C4E",fontWeight:800,marginTop:18}}>Remove from log</button></div>}

      <div style={{height:44,paddingBottom:"env(safe-area-inset-bottom)"}}/>
    </div>
  )
}
