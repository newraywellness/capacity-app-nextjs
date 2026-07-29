import { ACTIVITY_LEVELS, EATING_OUT, GROCERY_CATS2, LEARN_TOPICS, MACRO_PLAIN, MEALS, MEAL_FILTERS, MEAL_TYPES, NOURISH_CAP, NOURISH_RECOVERY, NOURISH_TIMING, NUTRITION_PLANS, PLAN_BY_ID, QUICK_HELP, RATE_OPTIONS, STARTER_FOODS, SUPPLEMENTS, calcTargets, foodUnitList, nutrientsFor, proteinSplit, r1, searchFoods, sumEntries } from '../data/nourish'
import { BASE } from '../lib/theme'

export function renderNourish(ctx) {
  const { addEntries, addFoodFor, addTab, baseline, bodyView, calcInputs, calcResult, checkedIn, cur, dayFor, deleteEntry, entryEdit, findFood, foodDays, foodPick, foodQuery, groceryAdd, groceryChecked, groceryManual, learnOpen, logDate, logMeal, macrosOpen, makeEntry, mealEdit, mealFilter, mealOpen, mealType, myFoods, myMeals, newId, nourishView, nutrition, pct, planView, quickAdd, recentFoods, recovery, rememberRecent, saveFoodName, saveGroceryChecked, saveGroceryManual, saveMealName, saveMyFoods, saveMyMeals, saveNutrition, saveWeekPlan, savedFoods, setAddFoodFor, setAddTab, setCalcInputs, setCalcResult, setDay, setEntryEdit, setFoodPick, setFoodQuery, setGroceryAdd, setLearnOpen, setLogDate, setMacrosOpen, setMealEdit, setMealFilter, setMealOpen, setMealType, setNourishView, setPlanView, setQuickAdd, setQuickFilter, setSaveFoodName, setSaveMealName, setSuppOpen, setWaterCount, setWeekPick, setupData, suppOpen, tab, toggleFavorite, updateEntry, weekPick, weekPlan } = ctx
    if (tab === "body" && bodyView === "nourish") {
      const capKey = checkedIn ? (pct < 15 ? "recovery" : cur) : "yellow"
      const nc = NOURISH_CAP[capKey]
      const plan = nutrition && nutrition.planId ? PLAN_BY_ID(nutrition.planId) : null
      const targets = nutrition && nutrition.targets ? nutrition.targets : null
      const today0 = new Date().toISOString().slice(0, 10)
      const dayRec = foodDays[logDate] || { items: [], water: 0 }
      const dayItems = dayRec.items || []
      const water = dayRec.water || 0
      const eaten = sumEntries(dayItems)
      const isToday = logDate === today0
      const shiftDate = (n) => { const d = new Date(logDate + "T12:00:00"); d.setDate(d.getDate() + n); const iso = d.toISOString().slice(0, 10); if (iso <= today0) { setLogDate(iso); setAddFoodFor(null); setEntryEdit(null) } }
      const dateLabel = isToday ? "Today" : new Date(logDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      const rem = targets ? { cal: targets.cal - eaten.cal, p: targets.p - eaten.p, c: targets.c - eaten.c, f: targets.f - eaten.f } : null
      const hour = new Date().getHours()
      const nextType = hour < 10 ? "breakfast" : hour < 15 ? "lunch" : hour < 20 ? "dinner" : "snack"
      const nextTypeLabel = (MEAL_TYPES.find((m) => m[0] === nextType) || ["", "Meal"])[1]
      const isPostpartum = setupData && setupData.season === "Postpartum"
      const SoftCard = ({ children, style }) => (<div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 17px", marginBottom: 12, ...style }}>{children}</div>)
      const Back = ({ to, label }) => (
        <div onClick={to} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039 " + label}</div>
      )
      const MacroRow = ({ label, have, goal, unit, color }) => {
        const pctFill = goal > 0 ? Math.min(100, Math.round((have / goal) * 100)) : 0
        const left = Math.max(0, goal - have)
        return (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{label}</span>
              <span style={{ fontSize: 12, color: BASE.taupe }}>{Math.round(have)} / {goal}{unit}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: pctFill + "%", height: "100%", borderRadius: 999, background: color, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 4 }}>{left > 0 ? `${Math.round(left)}${unit} to go` : "Target met"}</div>
          </div>
        )
      }
      const MealCard = ({ m, onPick, compact }) => (
        <div onClick={() => onPick && onPick(m)} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", marginBottom: 8, cursor: onPick ? "pointer" : "default" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream, marginBottom: 3 }}>{m.n}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: BASE.taupe }}>
            <span style={{ color: "#E984B4", fontWeight: 700 }}>{m.p}g protein</span>
            <span>{m.cal} cal</span>
            <span>{m.min} min</span>
          </div>
          {!compact && m.tags && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>{m.tags.slice(0, 3).map((t) => <span key={t} style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 999, background: "rgba(233,132,180,0.12)", color: "#C9558E", fontWeight: 700 }}>{t}</span>)}</div>}
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ display: "flex", gap: 6, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 999, marginBottom: 18 }}>
            {[["today", "🍽 Today"], ["plan", "📋 Plan"], ["supps", "✨ Supps"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setNourishView(k); setPlanView(null); setSuppOpen(null); setMealOpen(null); setQuickFilter(null) }} style={{ flex: 1, padding: "8px 3px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: nourishView === k ? "#fff" : "transparent", color: nourishView === k ? "#C9558E" : BASE.taupe, boxShadow: nourishView === k ? "0 2px 8px rgba(120,80,130,0.12)" : "none" }}>{lbl}</button>
            ))}
          </div>

          {/* ================= TODAY ================= */}
          {nourishView === "today" && !targets && (
            <div className="fade-in">
              <div style={{ borderRadius: 22, background: "linear-gradient(160deg,#FBEEF4,#EFE7F6)", padding: "34px 24px", textAlign: "center", marginBottom: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -16, right: -10, fontSize: 88, opacity: 0.14 }}>🍽</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#3D2545", lineHeight: 1.2, position: "relative" }}>Let's make nourishment easier.</div>
                <div style={{ fontSize: 14, color: "#5A4458", lineHeight: 1.65, marginTop: 12, position: "relative" }}>We'll help you figure out your targets, choose a goal, and turn it into food you can actually eat.</div>
              </div>
              <button onClick={() => { setNourishView("plan"); setPlanView("choose") }} style={{ width: "100%", padding: 17, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 16, fontWeight: 800, boxShadow: "0 10px 26px rgba(168,123,209,0.35)", marginBottom: 16 }}>Build My Plan</button>
              <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 8 }}>{nc.emoji} {nc.dayTitle}</div>
                <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 10 }}>{nc.reminder}</div>
                <div onClick={() => { setNourishView("plan"); setPlanView("meals") }} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer" }}>Browse meal ideas {"\u203a"}</div>
              </div>
            </div>
          )}

          {nourishView === "today" && targets && !addFoodFor && !entryEdit && !mealEdit && (
            <div className="fade-in">
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 2 }}>Today's Nourishment</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: BASE.taupe, textTransform: "uppercase" }}>Today's plan</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#C9558E" }}>{plan ? plan.emoji + " " + plan.name : "Custom"}</span>
              </div>

              {/* Date navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderRadius: 999, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 16 }}>
                <span onClick={() => shiftDate(-1)} style={{ fontSize: 17, color: BASE.creamDim, cursor: "pointer", padding: "0 6px" }}>{"\u2039"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? "#C9558E" : BASE.cream }}>{dateLabel}</span>
                <span onClick={() => shiftDate(1)} style={{ fontSize: 17, color: isToday ? BASE.border : BASE.creamDim, cursor: isToday ? "default" : "pointer", padding: "0 6px" }}>{"\u203a"}</span>
              </div>

              {/* Protein hero */}
              <div style={{ borderRadius: 20, background: "linear-gradient(160deg,rgba(233,132,180,0.12),rgba(168,123,209,0.1))", border: "1px solid rgba(233,132,180,0.3)", padding: "20px 22px", marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", marginBottom: 4 }}>Protein — your priority</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: BASE.cream, lineHeight: 1 }}>{Math.round(eaten.p)}</span>
                  <span style={{ fontSize: 17, color: BASE.taupe }}>/ {targets.p}g</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.09)", overflow: "hidden", margin: "12px 0 7px" }}>
                  <div style={{ width: Math.min(100, Math.round((eaten.p / targets.p) * 100)) + "%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#E984B4,#A87BD1)", transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 13, color: BASE.creamDim, fontWeight: 600 }}>{rem.p > 0 ? `${Math.round(rem.p)}g to go` : "You've hit your protein today \u2713"}</div>
              </div>

              {/* Calories + macros */}
              <div style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>Calories</span>
                  <span style={{ fontSize: 13, color: BASE.taupe }}><span style={{ color: BASE.cream, fontWeight: 700 }}>{Math.round(eaten.cal)}</span> / {targets.cal}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: Math.min(100, Math.round((eaten.cal / targets.cal) * 100)) + "%", height: "100%", borderRadius: 999, background: "#E8B84B" }} />
                </div>
                <div style={{ fontSize: 11, color: BASE.taupe, marginBottom: 18 }}>{rem.cal > 0 ? `About ${Math.round(rem.cal)} left today` : "You've reached your estimate for today"}</div>
                <MacroRow label="Carbohydrates" have={eaten.c} goal={targets.c} unit="g" color="#7FA054" />
                <MacroRow label="Fat" have={eaten.f} goal={targets.f} unit="g" color="#9B6BC3" />
                <div style={{ borderTop: `0.5px solid ${BASE.border}`, paddingTop: 14, marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>💧 Water</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span onClick={() => setWaterCount(water - 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: BASE.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: BASE.creamDim, fontSize: 16 }}>{"\u2212"}</span>
                      <span style={{ fontSize: 13, color: BASE.cream, fontWeight: 700, minWidth: 54, textAlign: "center" }}>{water} / 8</span>
                      <span onClick={() => setWaterCount(water + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: BASE.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: BASE.creamDim, fontSize: 16 }}>+</span>
                    </div>
                  </div>
                </div>
                <div onClick={() => setMacrosOpen(!macrosOpen)} style={{ fontSize: 12, fontWeight: 700, color: "#C9558E", cursor: "pointer", marginTop: 14 }}>{macrosOpen ? "\u2212" : "+"} What are macros?</div>
                {macrosOpen && (
                  <div className="fade-in" style={{ marginTop: 10 }}>
                    {MACRO_PLAIN.map((m) => (
                      <div key={m.name} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{m.emoji}</span>
                        <div><span style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream }}>{m.name}. </span><span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{m.body}</span></div>
                      </div>
                    ))}
                    <div style={{ fontSize: 12, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.5 }}>Calories are the total energy these three provide. You don't need to understand any of this to use Nourish.</div>
                  </div>
                )}
              </div>

              {/* Today's Food — grouped by meal */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>{isToday ? "Today's food" : "Food logged"}</div>
              {!dayItems.length && (
                <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "22px 20px", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>Nothing logged yet.</div>
                  <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.6, marginBottom: 14 }}>Start wherever you are. There's no wrong place to begin.</div>
                  <button onClick={() => { setAddFoodFor("breakfast"); setAddTab("search") }} style={{ padding: "11px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 13, fontWeight: 800 }}>+ Add breakfast</button>
                </div>
              )}
              {MEAL_TYPES.map(([slot, lbl]) => {
                const items = dayItems.filter((x) => x.meal === slot)
                const tot = sumEntries(items)
                return (
                  <div key={slot} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 16px", marginBottom: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: items.length ? 10 : 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, color: BASE.cream, textTransform: "uppercase" }}>{lbl}</span>
                      <span style={{ fontSize: 11.5, color: BASE.taupe }}>{items.length ? `${Math.round(tot.cal)} cal · ${r1(tot.p)}g protein` : "Not logged"}</span>
                    </div>
                    {items.map((it) => (
                      <div key={it.id} onClick={() => { const src = findFood(it.foodId); setEntryEdit(src || it.custom ? it : { ...it, custom: { unit: it.unit, per: { cal: it.cal / (Number(it.qty) || 1), p: it.p / (Number(it.qty) || 1), c: it.c / (Number(it.qty) || 1), f: it.f / (Number(it.qty) || 1) } } }); setSaveFoodName("") }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `0.5px solid ${BASE.border}`, cursor: "pointer" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>{it.name}</div>
                          <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{it.qty} {it.unit}{it.qty > 1 && it.unit !== "g" && it.unit !== "oz" ? "s" : ""} · {Math.round(it.cal)} cal · {r1(it.p)}g protein{it.partial ? " · partial entry" : ""}</div>
                        </div>
                        <span style={{ color: BASE.taupe, fontSize: 16 }}>{"\u203a"}</span>
                      </div>
                    ))}
                    <div onClick={() => { setAddFoodFor(slot); setAddTab("search"); setFoodQuery("") }} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer", paddingTop: items.length ? 10 : 0, borderTop: items.length ? `0.5px solid ${BASE.border}` : "none" }}>+ Add food</div>
                  </div>
                )
              })}
              {dayItems.length > 0 && (
                <div onClick={() => { setSaveMealName(""); setMealEdit({ from: logDate }) }} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: BASE.taupe, cursor: "pointer", margin: "10px 0 4px" }}>Save a meal from today's food</div>
              )}
              <div style={{ height: 12 }} />
              {/* What should I eat next */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 8px" }}>What should I eat next?</div>
              <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 12 }}>{rem.p > 5 ? `You have about ${Math.round(rem.p)}g of protein left today. Here are ${nextTypeLabel.toLowerCase()} ideas that would help:` : `You're doing well on your targets. A few ${nextTypeLabel.toLowerCase()} ideas if you're hungry:`}</div>
              {(() => { const goal = Math.min(45, Math.max(15, rem.p)); return MEALS.filter((m) => m.t === nextType).sort((a, b) => Math.abs(a.p - goal) - Math.abs(b.p - goal)).slice(0, 3) })().map((m) => (
                <div key={m.n} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{m.n}</div>
                    <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2 }}><span style={{ color: "#E984B4", fontWeight: 700 }}>~{m.p}g protein</span> · {m.cal} cal · {m.min} min</div>
                  </div>
                  <span onClick={() => logMeal(m, nextType)} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer", flexShrink: 0 }}>Log</span>
                </div>
              ))}
              <div onClick={() => { setNourishView("plan"); setPlanView("meals") }} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer", margin: "4px 2px 20px" }}>See all meal ideas {"\u203a"}</div>

              {/* Quick help */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>Quick help</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {QUICK_HELP.slice(0, 6).map((q) => (
                  <div key={q.label} onClick={() => { setNourishView("plan"); setPlanView("meals"); setMealFilter(q.filter) }} style={{ borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "12px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{q.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BASE.cream }}>{q.label}</span>
                  </div>
                ))}
              </div>
              <div onClick={() => { setNourishView("plan"); setPlanView("eatout") }} style={{ borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                <span style={{ fontSize: 17 }}>🍴</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, flex: 1 }}>Eating out?</span>
                <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
              </div>

              <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, marginBottom: 18 }}>These targets are estimates to guide you, not rules to obey. Some days you'll need more. That's information, not failure.</div>
            </div>
          )}


          {/* ---- ADD FOOD ---- */}
          {nourishView === "today" && targets && addFoodFor && !foodPick && (() => {
            const slotLabel = (MEAL_TYPES.find((m) => m[0] === addFoodFor) || ["", "Meal"])[1]
            const TABS = [["search", "Search"], ["recent", "Recent"], ["favorites", "Favorites"], ["mymeals", "My Meals"], ["newray", "True Reverie"], ["quick", "Quick Add"]]
            const openPick = (food, qty, unit) => setFoodPick({ food, qty: qty || 1, unit: unit || foodUnitList(food)[0].u })
            return (
              <div className="fade-in">
                <Back to={() => { setAddFoodFor(null); setFoodQuery("") }} label={dateLabel} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Add to {slotLabel.toLowerCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {TABS.map(([k, lbl]) => (
                    <button key={k} onClick={() => setAddTab(k)} style={{ flex: "1 1 30%", padding: "9px 6px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: addTab === k ? "#C9558E" : BASE.surface, color: addTab === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
                  ))}
                </div>

                {addTab === "search" && (
                  <>
                    <input value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} placeholder="Search foods…" style={{ width: "100%", padding: "13px 15px", borderRadius: 13, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14.5, outline: "none", marginBottom: 12 }} />
                    {(() => {
                      const q = foodQuery.trim().toLowerCase()
                      // Your saved/corrected foods come first, then the starter set.
                      const mine = myFoods.filter((x) => !q || x.name.toLowerCase().indexOf(q) >= 0)
                      const std = q ? searchFoods(foodQuery) : []
                      const rows = [...mine, ...std]
                      return rows.map((fd) => (
                        <div key={fd.id} onClick={() => openPick(fd)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${fd.mine ? "rgba(233,132,180,0.4)" : BASE.border}`, marginBottom: 7, cursor: "pointer" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: BASE.cream }}>{fd.name}</span>
                              {fd.mine && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#C9558E", background: "rgba(233,132,180,0.14)", padding: "2px 7px", borderRadius: 999 }}>YOURS</span>}
                            </div>
                            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{fd.per100 ? `${fd.per100.cal} cal · ${fd.per100.p}g protein per 100g` : `${fd.fixed.cal} cal · ${fd.fixed.p}g protein per ${foodUnitList(fd)[0].u}`}</div>
                          </div>
                          <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                        </div>
                      ))
                    })()}
                    {foodQuery.trim() && !searchFoods(foodQuery).length && !myFoods.some((x) => x.name.toLowerCase().indexOf(foodQuery.trim().toLowerCase()) >= 0) && (
                      <div style={{ padding: 20, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center" }}>
                        <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 10 }}>Not in the starter food list yet.</div>
                        <div onClick={() => setAddTab("quick")} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer" }}>Use Quick Add instead {"\u203a"}</div>
                      </div>
                    )}
                    {!foodQuery.trim() && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(233,184,75,0.08)", border: "1px solid rgba(233,184,75,0.25)", fontSize: 12, color: BASE.creamDim, lineHeight: 1.6 }}>Search covers a starter set of {STARTER_FOODS.length} common whole foods for now. For packaged and restaurant foods, use Quick Add or True Reverie meals — a full food database is coming.</div>
                    )}
                  </>
                )}

                {addTab === "recent" && (
                  recentFoods.length ? recentFoods.map((r) => (
                    <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 7 }}>
                      <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openPick(r.food, r.qty, r.unit)}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: BASE.cream }}>{r.food.name}</div>
                        <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{r.qty} {r.unit}</div>
                      </div>
                      <span onClick={() => { const en = makeEntry(r.food, r.qty, r.unit, addFoodFor); if (en) { addEntries([en]); rememberRecent(r.food, r.qty, r.unit); setAddFoodFor(null) } }} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>Add</span>
                    </div>
                  )) : <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe }}>Foods you log will show up here for one-tap repeat logging.</div>
                )}

                {addTab === "favorites" && (
                  savedFoods.length ? savedFoods.map((fd) => (
                    <div key={fd.id} onClick={() => openPick(fd)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 7, cursor: "pointer" }}>
                      <span style={{ fontSize: 14 }}>💗</span>
                      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: BASE.cream }}>{fd.name}</div>
                      <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                    </div>
                  )) : <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Tap the heart when adding a food to save it here for quick access.</div>
                )}

                {addTab === "mymeals" && (
                  myMeals.length ? myMeals.map((mm) => {
                    const tot = sumEntries(mm.items)
                    return (
                      <div key={mm.id} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{mm.name}</span>
                          <span onClick={() => saveMyMeals(myMeals.filter((x) => x.id !== mm.id))} style={{ fontSize: 15, color: BASE.taupe, cursor: "pointer" }}>{"\u00d7"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: BASE.taupe, marginBottom: 6 }}>{mm.items.map((i) => i.name).join(", ")}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ flex: 1, fontSize: 11.5, color: BASE.creamDim }}>{Math.round(tot.cal)} cal · {r1(tot.p)}g protein</span>
                          <span onClick={() => { addEntries(mm.items.map((i) => ({ ...i, id: newId(), meal: addFoodFor }))); setAddFoodFor(null) }} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>Add</span>
                        </div>
                      </div>
                    )
                  }) : <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Log a few foods, then use "Save a meal from today's food" to turn them into a reusable meal.</div>
                )}

                {addTab === "newray" && MEAL_TYPES.map(([t, lbl]) => (
                  <div key={t} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 7 }}>{lbl}</div>
                    {MEALS.filter((m) => m.t === t).slice(0, 4).map((m) => (
                      <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>{m.n}</div>
                          <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{m.cal} cal · {m.p}g protein</div>
                        </div>
                        <span onClick={() => { logMeal(m, addFoodFor); setAddFoodFor(null) }} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>Add</span>
                      </div>
                    ))}
                  </div>
                ))}

                {addTab === "quick" && (() => {
                  const q = quickAdd
                  const st = { width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none", marginBottom: 10 }
                  const hasCal = q.cal !== "" && Number(q.cal) >= 0
                  const incomplete = q.c === "" || q.f === ""
                  return (
                    <>
                      <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.6, marginBottom: 12 }}>Already know the numbers? Enter what you have — calories alone is enough.</div>
                      <input value={q.name} onChange={(e) => setQuickAdd({ ...q, name: e.target.value })} placeholder="Name (optional)" style={st} />
                      <input value={q.cal} onChange={(e) => setQuickAdd({ ...q, cal: e.target.value })} type="number" inputMode="numeric" placeholder="Calories" style={st} />
                      <input value={q.p} onChange={(e) => setQuickAdd({ ...q, p: e.target.value })} type="number" inputMode="numeric" placeholder="Protein (g)" style={st} />
                      <input value={q.c} onChange={(e) => setQuickAdd({ ...q, c: e.target.value })} type="number" inputMode="numeric" placeholder="Carbs (g) — optional" style={st} />
                      <input value={q.f} onChange={(e) => setQuickAdd({ ...q, f: e.target.value })} type="number" inputMode="numeric" placeholder="Fat (g) — optional" style={st} />
                      {hasCal && incomplete && <div style={{ fontSize: 11.5, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.55, marginBottom: 12 }}>Leaving carbs or fat blank is fine — those daily totals will just be a little incomplete.</div>}
                      <button onClick={() => { if (!hasCal) return; addEntries([{ id: newId(), meal: addFoodFor, name: q.name.trim() || "Quick add", qty: 1, unit: "entry", cal: Math.round(Number(q.cal)), p: Number(q.p) || 0, c: Number(q.c) || 0, f: Number(q.f) || 0, partial: incomplete }]); setQuickAdd({ name: "", cal: "", p: "", c: "", f: "" }); setAddFoodFor(null) }} disabled={!hasCal} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: hasCal ? "pointer" : "default", background: hasCal ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface2, color: hasCal ? "#fff" : BASE.taupe, fontSize: 14.5, fontWeight: 800 }}>Add to {slotLabel.toLowerCase()}</button>
                    </>
                  )
                })()}
                <div style={{ height: 20 }} />
              </div>
            )
          })()}

          {/* ---- SERVING EDITOR ---- */}
          {nourishView === "today" && targets && foodPick && (() => {
            const { food, qty, unit } = foodPick
            const n = food.fixed ? { cal: food.fixed.cal * qty, p: food.fixed.p * qty, c: food.fixed.c * qty, f: food.fixed.f * qty, grams: 0 } : nutrientsFor(food, qty, unit)
            const slotLabel = (MEAL_TYPES.find((m) => m[0] === addFoodFor) || ["", "Meal"])[1]
            const fav = savedFoods.some((x) => x.id === food.id)
            return (
              <div className="fade-in">
                <Back to={() => setFoodPick(null)} label="Add food" />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                  <div style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{food.name}</div>
                  <span onClick={() => toggleFavorite(food)} style={{ fontSize: 20, cursor: "pointer", opacity: fav ? 1 : 0.35 }}>💗</span>
                </div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 7 }}>Amount</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input value={qty} onChange={(e) => setFoodPick({ ...foodPick, qty: e.target.value })} type="number" inputMode="decimal" step="0.25" style={{ width: 92, padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 15, outline: "none" }} />
                  <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {foodUnitList(food).map((u) => (
                      <div key={u.u} onClick={() => setFoodPick({ ...foodPick, unit: u.u })} style={{ padding: "9px 13px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: unit === u.u ? "#A87BD1" : "transparent", color: unit === u.u ? "#fff" : BASE.creamDim, border: `1px solid ${unit === u.u ? "#A87BD1" : BASE.border}` }}>{u.u}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {[["Calories", n ? Math.round(n.cal) : "—", "#E8B84B"], ["Protein", n ? r1(n.p) + "g" : "—", "#E984B4"], ["Carbs", n ? r1(n.c) + "g" : "—", "#7FA054"], ["Fat", n ? r1(n.f) + "g" : "—", "#9B6BC3"]].map(([l, v, col]) => (
                    <div key={l} style={{ borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: col }}>{v}</div>
                      <div style={{ fontSize: 9.5, color: BASE.taupe, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                {n && n.grams > 0 && <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", marginBottom: 16 }}>about {n.grams} g</div>}
                <button onClick={() => { const en = makeEntry(food, Number(qty), unit, addFoodFor || "snack"); if (en) { addEntries([en]); rememberRecent(food, Number(qty), unit); setFoodPick(null); setAddFoodFor(null) } }} style={{ width: "100%", padding: 16, borderRadius: 15, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Add to {slotLabel.toLowerCase()}</button>
              </div>
            )
          })()}

          {/* ---- ENTRY EDITOR ---- */}
          {nourishView === "today" && targets && entryEdit && (() => {
            const it = entryEdit
            const food = findFood(it.foodId)
            const q = Number(it.qty) || 0
            // Nutrition shown is always FOR THE CURRENT AMOUNT.
            // Priority: a manual override for this unit > the source food's math > the stored values.
            const live = (() => {
              if (it.custom && it.custom.unit === it.unit) {
                const p = it.custom.per
                return { cal: p.cal * q, p: p.p * q, c: p.c * q, f: p.f * q }
              }
              if (food) {
                if (food.fixed) return { cal: food.fixed.cal * q, p: food.fixed.p * q, c: food.fixed.c * q, f: food.fixed.f * q }
                const n = nutrientsFor(food, q, it.unit)
                if (n) return n
              }
              return { cal: it.cal, p: it.p, c: it.c, f: it.f }
            })()
            const overridden = !!(it.custom && it.custom.unit === it.unit)
            // Editing a value sets a per-unit override so later amount changes scale correctly.
            const editNutr = (k, val) => {
              const num = Number(val)
              const next = { cal: live.cal, p: live.p, c: live.c, f: live.f }
              next[k] = isFinite(num) ? Math.max(0, num) : 0
              const div = q > 0 ? q : 1
              setEntryEdit({ ...it, custom: { unit: it.unit, per: { cal: next.cal / div, p: next.p / div, c: next.c / div, f: next.f / div } } })
            }
            const nutrField = (k, label, color) => (
              <div key={k} style={{ flex: 1 }}>
                <input value={k === "cal" ? Math.round(live.cal) : r1(live[k])} onChange={(e) => editNutr(k, e.target.value)} type="number" inputMode="decimal" style={{ width: "100%", padding: "12px 4px", borderRadius: 12, background: BASE.surface, border: `1px solid ${overridden ? "#C9558E" : BASE.border}`, color: color, fontSize: 16, fontWeight: 800, outline: "none", textAlign: "center" }} />
                <div style={{ fontSize: 9.5, color: BASE.taupe, marginTop: 3, textAlign: "center" }}>{label}</div>
              </div>
            )
            return (
              <div className="fade-in">
                <Back to={() => { setEntryEdit(null); setSaveFoodName("") }} label={dateLabel} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 14 }}>{it.name}</div>

                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 7 }}>Amount</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input value={it.qty} onChange={(e) => setEntryEdit({ ...it, qty: e.target.value })} type="number" inputMode="decimal" step="0.25" style={{ width: 92, padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 15, outline: "none" }} />
                  <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-start" }}>
                    {food ? foodUnitList(food).map((u) => (
                      <div key={u.u} onClick={() => setEntryEdit({ ...it, unit: u.u, custom: it.custom && it.custom.unit === u.u ? it.custom : null })} style={{ padding: "9px 13px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: it.unit === u.u ? "#A87BD1" : "transparent", color: it.unit === u.u ? "#fff" : BASE.creamDim, border: `1px solid ${it.unit === u.u ? "#A87BD1" : BASE.border}` }}>{u.u}</div>
                    )) : <div style={{ padding: "10px 13px", fontSize: 12.5, color: BASE.taupe }}>{it.unit}</div>}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <span style={{ fontSize: 11.5, color: BASE.taupe }}>Nutrition for {it.qty || 0} {it.unit}</span>
                  {overridden && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: "#C9558E" }}>EDITED</span>}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {nutrField("cal", "Calories", "#E8B84B")}
                  {nutrField("p", "Protein", "#E984B4")}
                  {nutrField("c", "Carbs", "#7FA054")}
                  {nutrField("f", "Fat", "#9B6BC3")}
                </div>
                <div style={{ fontSize: 11, color: BASE.taupe, lineHeight: 1.55, marginBottom: 16, fontStyle: "italic" }}>
                  {overridden
                    ? `Your values apply to this entry only. Changing the amount scales them from ${r1(it.custom.per.cal)} cal per ${it.unit}.`
                    : "These update automatically with the amount. Edit any of them to match your actual label."}
                </div>

                {overridden && (
                  <div style={{ borderRadius: 14, background: "rgba(233,132,180,0.07)", border: "1px solid rgba(233,132,180,0.28)", padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 7 }}>Save this version?</div>
                    <div style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 10 }}>Keep your corrected numbers so you never have to fix this food again.</div>
                    <input value={saveFoodName} onChange={(e) => setSaveFoodName(e.target.value)} placeholder={"My " + it.name} style={{ width: "100%", padding: "11px 13px", borderRadius: 11, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 13.5, outline: "none", marginBottom: 9 }} />
                    <button onClick={() => {
                      const nm = (saveFoodName.trim() || ("My " + it.name))
                      const fd = { id: "my:" + newId(), name: nm, mine: true, fixed: { cal: Math.round(it.custom.per.cal), p: r1(it.custom.per.p), c: r1(it.custom.per.c), f: r1(it.custom.per.f) }, units: [{ u: it.unit, g: 0 }] }
                      saveMyFoods([...myFoods, fd])
                      rememberRecent(fd, 1, it.unit)
                      updateEntry(it.id, { name: nm, foodId: fd.id, qty: q, unit: it.unit, meal: it.meal, cal: Math.round(live.cal), p: r1(live.p), c: r1(live.c), f: r1(live.f), custom: it.custom })
                      setEntryEdit(null); setSaveFoodName("")
                    }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 13, fontWeight: 800 }}>Save as my food</button>
                  </div>
                )}

                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>Move to</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                  {MEAL_TYPES.map(([sl, lbl]) => (
                    <div key={sl} onClick={() => setEntryEdit({ ...it, meal: sl })} style={{ flex: 1, textAlign: "center", padding: "9px 2px", borderRadius: 999, cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: it.meal === sl ? "#C9558E" : "transparent", color: it.meal === sl ? "#fff" : BASE.creamDim, border: `1px solid ${it.meal === sl ? "#C9558E" : BASE.border}` }}>{lbl}</div>
                  ))}
                </div>

                <button onClick={() => { updateEntry(it.id, { qty: q, unit: it.unit, meal: it.meal, cal: Math.round(live.cal), p: r1(live.p), c: r1(live.c), f: r1(live.f), custom: it.custom || null }); setEntryEdit(null); setSaveFoodName("") }} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 14.5, fontWeight: 800, marginBottom: 9 }}>Save changes</button>
                <button onClick={() => { const cd = dayFor(logDate); setDay(logDate, { items: [...cd.items, { ...it, qty: q, id: newId(), cal: Math.round(live.cal), p: r1(live.p), c: r1(live.c), f: r1(live.f) }] }); setEntryEdit(null); setSaveFoodName("") }} style={{ width: "100%", padding: 13, borderRadius: 13, border: `1px solid ${BASE.border}`, cursor: "pointer", background: "transparent", color: BASE.creamDim, fontSize: 13.5, fontWeight: 700, marginBottom: 9 }}>Duplicate</button>
                <button onClick={() => { deleteEntry(it.id); setEntryEdit(null); setSaveFoodName("") }} style={{ width: "100%", padding: 13, borderRadius: 13, border: "none", cursor: "pointer", background: "transparent", color: "#D65C4E", fontSize: 13.5, fontWeight: 700, marginBottom: 20 }}>Remove from log</button>
              </div>
            )
          })()}

          {/* ---- SAVE A MEAL ---- */}
          {nourishView === "today" && targets && mealEdit && (() => {
            const items = (foodDays[logDate] || { items: [] }).items
            const chosen = mealEdit.picked || {}
            const picked = items.filter((i) => chosen[i.id])
            const tot = sumEntries(picked)
            return (
              <div className="fade-in">
                <Back to={() => setMealEdit(null)} label={dateLabel} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Save a meal</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Pick the foods that go together, name it, and you can log the whole thing in one tap next time.</div>
                {items.map((i) => (
                  <div key={i.id} onClick={() => setMealEdit({ ...mealEdit, picked: { ...chosen, [i.id]: !chosen[i.id] } })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: BASE.surface, border: `1px solid ${chosen[i.id] ? "#C9558E" : BASE.border}`, marginBottom: 7, cursor: "pointer" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${chosen[i.id] ? "#C9558E" : BASE.border}`, background: chosen[i.id] ? "#C9558E" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>{chosen[i.id] ? "\u2713" : ""}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>{i.name}</div>
                      <div style={{ fontSize: 11, color: BASE.taupe }}>{Math.round(i.cal)} cal · {r1(i.p)}g protein</div>
                    </div>
                  </div>
                ))}
                {picked.length > 0 && (
                  <>
                    <div style={{ fontSize: 12.5, color: BASE.creamDim, textAlign: "center", margin: "12px 0" }}>{Math.round(tot.cal)} cal · {r1(tot.p)}g protein</div>
                    <input value={saveMealName} onChange={(e) => setSaveMealName(e.target.value)} placeholder="Name this meal…" style={{ width: "100%", padding: "13px 15px", borderRadius: 13, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14.5, outline: "none", marginBottom: 12 }} />
                    <button onClick={() => { if (!saveMealName.trim()) return; saveMyMeals([...myMeals, { id: newId(), name: saveMealName.trim(), items: picked.map((i) => ({ ...i })) }]); setMealEdit(null); setSaveMealName("") }} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 14.5, fontWeight: 800, marginBottom: 20 }}>Save meal</button>
                  </>
                )}
                <div style={{ height: 18 }} />
              </div>
            )
          })()}

          {/* ================= PLAN ================= */}
          {nourishView === "plan" && !planView && (
            <div className="fade-in">
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Your Nourish Plan</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 18 }}>This is where you set your direction. Today turns it into food you can actually eat.</div>
              {plan ? (
                <div style={{ borderRadius: 18, background: plan.grad, padding: "18px 20px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: -12, top: -12, fontSize: 62, opacity: 0.16 }}>{plan.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", position: "relative" }}>Active plan</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 2, position: "relative" }}>{plan.name}</div>
                  {targets && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.95)", marginTop: 4, position: "relative" }}>{targets.cal} cal · {targets.p}g protein · {targets.c}g carbs · {targets.f}g fat</div>}
                </div>
              ) : (
                <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "18px 20px", marginBottom: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6 }}>You haven't chosen a plan yet. Start there and everything else falls into place.</div>
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                {[["choose", "🎯", "Choose your nutrition plan", plan ? "Change your active plan" : "Pick the goal that fits this season"],
                  ["calc", "🧮", "Calculate my targets", targets ? "Review or edit your daily targets" : "Estimate your daily calories and macros"],
                  ["meals", "🍳", "Meal ideas", "Breakfast, lunch, dinner and snacks"],
                  ["week", "📅", "Build my week", "Plan meals for the days ahead"],
                  ["grocery", "🛒", "Build my grocery list", "From your week, or start from scratch"],
                  ["eatout", "🍴", "Eating out", "Practical picks, no guilt"],
                  ["learn", "📖", "Learn", "Protein, carbs, fats, fiber and more"]].map(([k, ic, title, sub]) => (
                  <div key={k} onClick={() => { setPlanView(k); setMealFilter(null); setMealOpen(null) }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8, cursor: "pointer" }}>
                    <span style={{ fontSize: 20 }}>{ic}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{title}</div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 1 }}>{sub}</div>
                    </div>
                    <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 18 }} />
            </div>
          )}

          {/* --- Choose plan --- */}
          {nourishView === "plan" && planView === "choose" && (
            <div className="fade-in">
              <Back to={() => setPlanView(null)} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Choose your nutrition plan</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 18 }}>Pick the one that fits the season you're in. You can change it whenever your life changes — none of these are diets.</div>
              {NUTRITION_PLANS.map((p) => {
                const active = nutrition && nutrition.planId === p.id
                return (
                  <div key={p.id} style={{ borderRadius: 18, overflow: "hidden", marginBottom: 14, border: `1px solid ${active ? "#C9558E" : BASE.border}` }}>
                    <div style={{ background: p.grad, padding: "16px 18px", position: "relative" }}>
                      <div style={{ position: "absolute", right: -10, top: -10, fontSize: 54, opacity: 0.16 }}>{p.emoji}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: "#fff", position: "relative" }}>{p.name}</div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.95)", marginTop: 2, position: "relative" }}>{p.tag}</div>
                      {active && <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: "#fff", background: "rgba(255,255,255,0.25)", padding: "3px 9px", borderRadius: 999, display: "inline-block", marginTop: 7, position: "relative" }}>ACTIVE</div>}
                    </div>
                    <div style={{ background: BASE.surface, padding: "14px 18px" }}>
                      <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 10 }}>{p.forWho}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 6 }}>How Nourish helps</div>
                      {p.helps.map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9558E", marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{h}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: 11.5, color: BASE.taupe, lineHeight: 1.55, margin: "10px 0" }}><span style={{ fontWeight: 700, color: BASE.creamDim }}>What to expect: </span>{p.expect}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: "#C9558E", lineHeight: 1.45, marginBottom: 12 }}>{p.note}</div>
                      <button onClick={() => { saveNutrition({ ...(nutrition || {}), planId: p.id }); setPlanView("calc") }} style={{ width: "100%", padding: 13, borderRadius: 13, border: "none", cursor: "pointer", background: active ? BASE.surface2 : p.grad, color: active ? BASE.creamDim : "#fff", fontSize: 13.5, fontWeight: 800 }}>{active ? "Keep this plan" : "Choose " + p.name}</button>
                    </div>
                  </div>
                )
              })}
              <div style={{ height: 18 }} />
            </div>
          )}

          {/* --- Calculator --- */}
          {nourishView === "plan" && planView === "calc" && (() => {
            const ci = calcInputs || { age: "", heightFt: "", heightIn: "", weightLb: "", activity: "light", nursing: false, sex: "female", rate: "gentle", planId: (nutrition && nutrition.planId) || "energy" }
            const setCI = (k, v) => setCalcInputs({ ...ci, [k]: v })
            const ready = ci.age && ci.heightFt && ci.weightLb
            const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none" }
            return (
              <div className="fade-in">
                <Back to={() => { setPlanView(null); setCalcResult(null) }} label="Plan" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Calculate my targets</div>
                <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>A few details and we'll estimate a starting point. You can edit anything afterward.</div>

                {!calcResult ? (
                  <>
                    <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 14 }}>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Your plan</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                        {NUTRITION_PLANS.map((p) => (
                          <div key={p.id} onClick={() => setCI("planId", p.id)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: ci.planId === p.id ? "#C9558E" : "transparent", color: ci.planId === p.id ? "#fff" : BASE.creamDim, border: `1px solid ${ci.planId === p.id ? "#C9558E" : BASE.border}` }}>{p.emoji} {p.name}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Sex (used by the energy equation)</div>
                      <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
                        {[["female", "Female"], ["male", "Male"]].map(([k, lbl]) => (
                          <div key={k} onClick={() => setCI("sex", k)} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: ci.sex === k ? "#C9558E" : "transparent", color: ci.sex === k ? "#fff" : BASE.creamDim, border: `1px solid ${ci.sex === k ? "#C9558E" : BASE.border}` }}>{lbl}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Age</div>
                      <input type="number" inputMode="numeric" value={ci.age} onChange={(e) => setCI("age", e.target.value)} placeholder="32" style={{ ...inputStyle, marginBottom: 14 }} />
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Height</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <input type="number" inputMode="numeric" value={ci.heightFt} onChange={(e) => setCI("heightFt", e.target.value)} placeholder="5 ft" style={inputStyle} />
                        <input type="number" inputMode="numeric" value={ci.heightIn} onChange={(e) => setCI("heightIn", e.target.value)} placeholder="5 in" style={inputStyle} />
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Weight (lbs)</div>
                      <input type="number" inputMode="numeric" value={ci.weightLb} onChange={(e) => setCI("weightLb", e.target.value)} placeholder="150" style={{ ...inputStyle, marginBottom: 14 }} />
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>How active are you day to day?</div>
                      {ACTIVITY_LEVELS.map((a) => (
                        <div key={a.k} onClick={() => setCI("activity", a.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, marginBottom: 7, cursor: "pointer", background: ci.activity === a.k ? "rgba(233,132,180,0.12)" : "transparent", border: `1px solid ${ci.activity === a.k ? "#C9558E" : BASE.border}` }}>
                          <span style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${ci.activity === a.k ? "#C9558E" : BASE.border}`, background: ci.activity === a.k ? "#C9558E" : "transparent", flexShrink: 0 }} />
                          <div><div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{a.label}</div><div style={{ fontSize: 11, color: BASE.taupe }}>{a.note}</div></div>
                        </div>
                      ))}
                      {(PLAN_BY_ID(ci.planId) && PLAN_BY_ID(ci.planId).deficit < 0) && (
                        <>
                          <div style={{ fontSize: 11.5, color: BASE.taupe, margin: "14px 0 8px" }}>Pace that feels sustainable</div>
                          {RATE_OPTIONS.map((rt) => (
                            <div key={rt.k} onClick={() => setCI("rate", rt.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, marginBottom: 7, cursor: "pointer", background: ci.rate === rt.k ? "rgba(233,132,180,0.12)" : "transparent", border: `1px solid ${ci.rate === rt.k ? "#C9558E" : BASE.border}` }}>
                              <span style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${ci.rate === rt.k ? "#C9558E" : BASE.border}`, background: ci.rate === rt.k ? "#C9558E" : "transparent", flexShrink: 0 }} />
                              <div><div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{rt.label}</div><div style={{ fontSize: 11, color: BASE.taupe }}>{rt.note}</div></div>
                            </div>
                          ))}
                          <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.55, marginBottom: 4 }}>We cap any deficit so it stays supportive — faster isn't better here.</div>
                        </>
                      )}
                      <div onClick={() => setCI("nursing", !ci.nursing)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 13px", borderRadius: 12, marginTop: 8, cursor: "pointer", background: ci.nursing ? "rgba(168,123,209,0.12)" : "transparent", border: `1px solid ${ci.nursing ? "#A87BD1" : BASE.border}` }}>
                        <span style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${ci.nursing ? "#A87BD1" : BASE.border}`, background: ci.nursing ? "#A87BD1" : "transparent", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>I'm currently breastfeeding</span>
                      </div>
                    </div>
                    {(ci.nursing || isPostpartum) && (
                      <div style={{ borderRadius: 14, background: "rgba(168,123,209,0.1)", border: "1px solid rgba(168,123,209,0.3)", padding: "14px 16px", marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#9B6BC3", textTransform: "uppercase", marginBottom: 5 }}>An important note</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>Postpartum and breastfeeding bodies have real, individual needs that a general estimate can't capture. We won't put you in a calorie deficit here, and we'd genuinely encourage you to run any nutrition targets past your own provider or a dietitian.</div>
                      </div>
                    )}
                    <button onClick={() => { if (ready) { const hi = (Number(ci.heightFt) || 0) * 12 + (Number(ci.heightIn) || 0); setCalcResult(calcTargets({ ...ci, heightIn: hi })) } }} disabled={!ready} style={{ width: "100%", padding: 16, borderRadius: 15, border: "none", cursor: ready ? "pointer" : "default", background: ready ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface2, color: ready ? "#fff" : BASE.taupe, fontSize: 15.5, fontWeight: 800, marginBottom: 10 }}>Calculate my targets</button>
                    <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, marginBottom: 18 }}>These are estimates based on a standard equation — a starting point, not a medical prescription. If you have a health condition, are pregnant, or are under a provider's care, please use their guidance instead.</div>
                  </>
                ) : (() => {
                  const r = calcResult
                  const sp = proteinSplit(r.p)
                  return (
                    <div className="fade-in">
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", marginBottom: 12, textAlign: "center" }}>Your daily targets</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {[["calories", r.cal, "#E8B84B"], ["protein", r.p + "g", "#E984B4"], ["carbs", r.c + "g", "#7FA054"], ["fat", r.f + "g", "#9B6BC3"]].map(([lbl, v, col]) => (
                          <div key={lbl} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 10px", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: col, lineHeight: 1 }}>{v}</div>
                            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 4 }}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                      {r.flags.indexOf("noDeficitNursing") >= 0 && (
                        <div style={{ borderRadius: 14, background: "rgba(168,123,209,0.1)", border: "1px solid rgba(168,123,209,0.3)", padding: "13px 15px", marginBottom: 14, fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>Because you're breastfeeding, we've added energy for milk production and removed the calorie deficit. Nourishing yourself well matters more than any goal right now.</div>
                      )}
                      {r.flags.indexOf("floored") >= 0 && (
                        <div style={{ borderRadius: 14, background: "rgba(233,184,75,0.1)", border: "1px solid rgba(233,184,75,0.3)", padding: "13px 15px", marginBottom: 14, fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>We've raised this estimate to a safer minimum. Eating below this without a provider's guidance tends to work against your energy, hormones, and strength.</div>
                      )}
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>What this means</div>
                      <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 14 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E984B4", marginBottom: 4 }}>Protein</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 12 }}>That's about {sp.b}g at breakfast, {sp.l}g at lunch, {sp.d}g at dinner, and {sp.s}g from snacks. A palm-sized portion of meat, a Greek yogurt, or a scoop of protein powder each land around 20-30g.</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7FA054", marginBottom: 4 }}>Carbs</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 12 }}>Use these to fuel your day and your workouts. Rice, potatoes, oats, fruit and bread all count.</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#9B6BC3", marginBottom: 4 }}>Fat</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>Include moderate amounts across your meals for satisfaction, hormones, and nutrition.</div>
                      </div>
                      <button onClick={() => { saveNutrition({ planId: ci.planId, targets: { cal: r.cal, p: r.p, c: r.c, f: r.f }, inputs: ci, savedAt: new Date().toISOString() }); setPlanView(null); setCalcResult(null); setNourishView("today") }} style={{ width: "100%", padding: 16, borderRadius: 15, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 15.5, fontWeight: 800, marginBottom: 10 }}>Save my targets</button>
                      <div onClick={() => setCalcResult(null)} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 20 }}>Adjust my details</div>
                    </div>
                  )
                })()}

                {targets && !calcResult && (
                  <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>Or edit your targets directly</div>
                    {[["cal", "Calories"], ["p", "Protein (g)"], ["c", "Carbs (g)"], ["f", "Fat (g)"]].map(([k, lbl]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, color: BASE.taupe, flex: 1 }}>{lbl}</span>
                        <input type="number" inputMode="numeric" value={targets[k]} onChange={(e) => saveNutrition({ ...nutrition, targets: { ...targets, [k]: Number(e.target.value) || 0 } })} style={{ width: 90, padding: "9px 11px", borderRadius: 10, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 13.5, outline: "none", textAlign: "right" }} />
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginTop: 8, lineHeight: 1.55 }}>Your numbers are yours. Edit them anytime to fit what actually works for your body.</div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* --- Meal ideas --- */}
          {nourishView === "plan" && planView === "meals" && !mealOpen && (
            <div className="fade-in">
              <Back to={() => { setPlanView(null); setMealFilter(null) }} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 12 }}>Meal ideas</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {MEAL_TYPES.map(([k, lbl]) => (
                  <button key={k} onClick={() => setMealType(k)} style={{ flex: 1, padding: "8px 2px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: mealType === k ? "#C9558E" : BASE.surface, color: mealType === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {MEAL_FILTERS.map((ft) => (
                  <div key={ft} onClick={() => setMealFilter(mealFilter === ft ? null : ft)} style={{ padding: "6px 11px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 700, background: mealFilter === ft ? "#A87BD1" : "transparent", color: mealFilter === ft ? "#fff" : BASE.taupe, border: `1px solid ${mealFilter === ft ? "#A87BD1" : BASE.border}` }}>{ft}</div>
                ))}
              </div>
              {(() => {
                const list = MEALS.filter((m) => m.t === mealType && (!mealFilter || m.tags.indexOf(mealFilter) >= 0))
                if (!list.length) return <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe }}>No meals match that filter yet. Try another one.</div>
                return list.map((m) => <MealCard key={m.n} m={m} onPick={setMealOpen} />)
              })()}
              <div style={{ height: 18 }} />
            </div>
          )}

          {nourishView === "plan" && planView === "meals" && mealOpen && (() => {
            const m = mealOpen
            return (
              <div className="fade-in">
                <Back to={() => setMealOpen(null)} label="Meal ideas" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>{m.n}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[["Protein", m.p + "g", "#E984B4"], ["Carbs", m.c + "g", "#7FA054"], ["Fat", m.f + "g", "#9B6BC3"], ["Calories", m.cal, "#E8B84B"]].map(([lbl, v, col]) => (
                    <div key={lbl} style={{ borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "12px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{v}</div>
                      <div style={{ fontSize: 9.5, color: BASE.taupe, marginTop: 2 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, marginBottom: 14 }}>About {m.min} minutes {"\u00b7"} {m.tags.join(" · ")}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 8 }}>What you'll need</div>
                {m.ing.map(([cat, item], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `0.5px solid ${BASE.border}` }}>
                    <span style={{ fontSize: 13, color: BASE.cream }}>{item}</span>
                    <span style={{ fontSize: 11, color: BASE.taupe }}>{cat}</span>
                  </div>
                ))}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 9 }}>Add to today</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {MEAL_TYPES.map(([sl, lbl]) => (
                      <button key={sl} onClick={() => { logMeal(m, sl); setNourishView("today"); setMealOpen(null); setPlanView(null) }} style={{ flex: 1, padding: "13px 2px", borderRadius: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 12, fontWeight: 800 }}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 20 }} />
              </div>
            )
          })()}

          {/* --- Week builder --- */}
          {nourishView === "plan" && planView === "week" && (() => {
            const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d })
            if (weekPick) {
              const list = MEALS.filter((m) => m.t === weekPick.slot)
              return (
                <div className="fade-in">
                  <Back to={() => setWeekPick(null)} label="My week" />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Choose a {weekPick.slot}</div>
                  <div style={{ fontSize: 12.5, color: BASE.taupe, marginBottom: 16 }}>{new Date(weekPick.d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                  {list.map((m) => <MealCard key={m.n} m={m} compact onPick={() => { const wp = { ...weekPlan }; wp[weekPick.d] = { ...(wp[weekPick.d] || {}), [weekPick.slot]: m.n }; saveWeekPlan(wp); setWeekPick(null) }} />)}
                  <div style={{ height: 18 }} />
                </div>
              )
            }
            return (
              <div className="fade-in">
                <Back to={() => setPlanView(null)} label="Plan" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Build my week</div>
                <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 18 }}>Plan as much or as little as you want. Empty days are completely fine — this is a helper, not a contract.</div>
                {days.map((d) => {
                  const key = d.toISOString().slice(0, 10)
                  const dayPlan = weekPlan[key] || {}
                  return (
                    <div key={key} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 16px", marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, marginBottom: 9 }}>{d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                      {MEAL_TYPES.map(([slot, lbl]) => (
                        <div key={slot} onClick={() => setWeekPick({ d: key, slot })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", cursor: "pointer", borderTop: `0.5px solid ${BASE.border}` }}>
                          <span style={{ fontSize: 11, color: BASE.taupe, width: 66, flexShrink: 0 }}>{lbl}</span>
                          <span style={{ flex: 1, fontSize: 12.5, color: dayPlan[slot] ? BASE.cream : BASE.taupe, fontStyle: dayPlan[slot] ? "normal" : "italic" }}>{dayPlan[slot] || "Tap to choose"}</span>
                          {dayPlan[slot] && <span onClick={(e) => { e.stopPropagation(); const wp = { ...weekPlan }; const dp = { ...(wp[key] || {}) }; delete dp[slot]; wp[key] = dp; saveWeekPlan(wp) }} style={{ fontSize: 15, color: BASE.taupe }}>{"\u00d7"}</span>}
                        </div>
                      ))}
                    </div>
                  )
                })}
                <button onClick={() => setPlanView("grocery")} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 14.5, fontWeight: 800, margin: "6px 0 20px" }}>Build my grocery list {"\u2192"}</button>
              </div>
            )
          })()}

          {/* --- Grocery builder --- */}
          {nourishView === "plan" && planView === "grocery" && (() => {
            // Ingredients from planned meals + manual additions, grouped by category
            const fromPlan = {}
            Object.keys(weekPlan).forEach((d) => {
              const dp = weekPlan[d] || {}
              Object.keys(dp).forEach((slot) => {
                const meal = MEALS.find((m) => m.n === dp[slot])
                if (meal) meal.ing.forEach(([cat, item]) => { fromPlan[cat] = fromPlan[cat] || {}; fromPlan[cat][item] = (fromPlan[cat][item] || 0) + 1 })
              })
            })
            groceryManual.forEach((gm) => { fromPlan[gm.cat] = fromPlan[gm.cat] || {}; fromPlan[gm.cat][gm.item] = fromPlan[gm.cat][gm.item] || 1 })
            const cats = GROCERY_CATS2.filter((c) => fromPlan[c] && Object.keys(fromPlan[c]).length)
            const total = cats.reduce((s, c) => s + Object.keys(fromPlan[c]).length, 0)
            const doneCount = cats.reduce((s, c) => s + Object.keys(fromPlan[c]).filter((it) => groceryChecked[c + ":" + it]).length, 0)
            return (
              <div className="fade-in">
                <Back to={() => setPlanView(null)} label="Plan" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>My grocery list</div>
                <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>{total ? `${doneCount} of ${total} picked up.` : "Add items below, or plan some meals in Build My Week and they'll appear here automatically."}</div>
                <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
                  <input value={groceryAdd} onChange={(e) => setGroceryAdd(e.target.value)} placeholder="Add an item…" style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none" }} />
                  <button onClick={() => { if (groceryAdd.trim()) { saveGroceryManual([...groceryManual, { cat: "Other", item: groceryAdd.trim() }]); setGroceryAdd("") } }} style={{ padding: "12px 18px", borderRadius: 12, border: "none", cursor: "pointer", background: "#C9558E", color: "#fff", fontSize: 13.5, fontWeight: 800 }}>Add</button>
                </div>
                {!total ? (
                  <div style={{ padding: 24, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Your list is empty. Add items above, or plan meals for the week and their ingredients will fill this in.</div>
                ) : cats.map((cat) => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 8 }}>{cat}</div>
                    {Object.keys(fromPlan[cat]).sort().map((item) => {
                      const k = cat + ":" + item
                      const on = !!groceryChecked[k]
                      const qty = fromPlan[cat][item]
                      return (
                        <div key={k} onClick={() => saveGroceryChecked({ ...groceryChecked, [k]: !on })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 6, cursor: "pointer", opacity: on ? 0.5 : 1 }}>
                          <span style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${on ? "#7FA054" : BASE.border}`, background: on ? "#7FA054" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{on ? "\u2713" : ""}</span>
                          <span style={{ flex: 1, fontSize: 13.5, color: BASE.cream, textDecoration: on ? "line-through" : "none" }}>{item}</span>
                          {qty > 1 && <span style={{ fontSize: 11, color: BASE.taupe }}>{"\u00d7" + qty}</span>}
                          <span onClick={(e) => { e.stopPropagation(); saveGroceryManual(groceryManual.filter((g) => !(g.cat === cat && g.item === item))) }} style={{ fontSize: 15, color: BASE.taupe }}>{"\u00d7"}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
                {total > 0 && <div onClick={() => saveGroceryChecked({})} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: BASE.taupe, cursor: "pointer", margin: "4px 0 20px" }}>Uncheck everything (reuse this list)</div>}
              </div>
            )
          })()}

          {/* --- Eating out --- */}
          {nourishView === "plan" && planView === "eatout" && (
            <div className="fade-in">
              <Back to={() => setPlanView(null)} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 6 }}>Eating out</div>
              <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 16 }}>{EATING_OUT.intro}</div>
              <div style={{ borderRadius: 16, background: "rgba(233,132,180,0.07)", border: "1px solid rgba(233,132,180,0.25)", padding: "15px 17px", marginBottom: 18 }}>
                {EATING_OUT.principles.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < EATING_OUT.principles.length - 1 ? 8 : 0 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9558E", marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
              {EATING_OUT.spots.map((sp) => (
                <div key={sp.name} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "15px 17px", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream, marginBottom: 10 }}>{sp.emoji} {sp.name}</div>
                  {sp.picks.map(([nm, macros, tag], i) => (
                    <div key={i} style={{ paddingTop: i ? 9 : 0, marginTop: i ? 9 : 0, borderTop: i ? `0.5px solid ${BASE.border}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, color: BASE.cream, fontWeight: 600, flex: 1 }}>{nm}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: tag === "High Protein" ? "rgba(233,132,180,0.15)" : tag === "Lighter" ? "rgba(127,160,84,0.15)" : "rgba(233,184,75,0.15)", color: tag === "High Protein" ? "#E984B4" : tag === "Lighter" ? "#7FA054" : "#E8B84B", flexShrink: 0 }}>{tag}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe }}>{macros}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15.5, color: "#C9558E", textAlign: "center", lineHeight: 1.5, margin: "14px 0 20px" }}>{EATING_OUT.close}</div>
            </div>
          )}

          {/* --- Learn --- */}
          {nourishView === "plan" && planView === "learn" && !learnOpen && (
            <div className="fade-in">
              <Back to={() => setPlanView(null)} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Learn</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Useful background, whenever you want it. You never need to read any of this to use Nourish.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {LEARN_TOPICS.map((t) => (
                  <div key={t.name} onClick={() => setLearnOpen(t.name)} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 12px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 23, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{t.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "6px 2px 8px" }}>Around your training</div>
              <SoftCard>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream, marginBottom: 5 }}>{NOURISH_TIMING.title}</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55, marginBottom: 11 }}>{NOURISH_TIMING.intro}</div>
                {NOURISH_TIMING.cards.map((cd, i) => (
                  <div key={i} style={{ borderRadius: 12, background: "rgba(233,132,180,0.06)", padding: "12px 13px", marginBottom: 9 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontSize: 16 }}>{cd.emoji}</span><span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{cd.title}</span></div>
                    <div style={{ fontSize: 11.5, color: BASE.taupe, fontStyle: "italic", marginBottom: 7 }}>{cd.goal}</div>
                    {cd.rows.map(([k, v], j) => (<div key={j} style={{ marginBottom: 5 }}><div style={{ fontSize: 12, fontWeight: 700, color: BASE.cream }}>{k}</div><div style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.45 }}>{v}</div></div>))}
                  </div>
                ))}
              </SoftCard>
              <SoftCard>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream, marginBottom: 5 }}>{NOURISH_RECOVERY.title}</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55, marginBottom: 11 }}>{NOURISH_RECOVERY.intro}</div>
                {NOURISH_RECOVERY.cards.map((cd, i) => (
                  <div key={i} style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream, marginBottom: 2 }}>{cd.emoji} {cd.title}</div>
                    <div style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.5 }}>{cd.body}</div>
                  </div>
                ))}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: "#C9558E", lineHeight: 1.45, marginTop: 6 }}>{NOURISH_RECOVERY.close}</div>
              </SoftCard>
              <div style={{ height: 18 }} />
            </div>
          )}

          {nourishView === "plan" && planView === "learn" && learnOpen && (() => {
            const t = LEARN_TOPICS.find((x) => x.name === learnOpen)
            return (
              <div className="fade-in">
                <Back to={() => setLearnOpen(null)} label="Learn" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginBottom: 12 }}>{t.emoji} {t.name}</div>
                <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.7, marginBottom: 16 }}>{t.body}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 9 }}>In practice</div>
                {t.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9558E", marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55 }}>{tip}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", margin: "18px 0 20px", lineHeight: 1.6 }}>General education, not medical advice. Your provider knows your situation best.</div>
              </div>
            )
          })()}

          {/* ================= SUPPS (unchanged) ================= */}
          {nourishView === "supps" && !suppOpen && (
            <>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Supplements</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 8 }}>Learn what supplements are, why people use them, and what questions to consider before adding them.</div>
              <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginBottom: 16 }}>Education from a nurse's perspective — never medical advice.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SUPPLEMENTS.map((sp) => (
                  <div key={sp.name} onClick={() => setSuppOpen(sp.name)} style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "18px 14px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{sp.emoji}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{sp.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 18 }} />
            </>
          )}

          {nourishView === "supps" && suppOpen && (() => {
            const sp = SUPPLEMENTS.find((x) => x.name === suppOpen)
            const rows = [["What it is", sp.what], ["Why people use it", sp.why], ["Potential benefits studied", sp.benefits], ["Common considerations", sp.considerations], ["When to discuss with a professional", sp.pro]]
            return (
            <div className="fade-in">
              <div onClick={() => setSuppOpen(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 All supplements"}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{sp.emoji} {sp.name}</div>
              {rows.map(([sec, body]) => (
                <SoftCard key={sec}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 5 }}>{sec}</div><div style={{ fontSize: 13, color: BASE.cream, lineHeight: 1.55 }}>{body}</div></SoftCard>
              ))}
              <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", margin: "6px 0 18px", lineHeight: 1.6 }}>True Reverie shares education, not prescriptions. Always talk with your own provider before starting a supplement.</div>
            </div>
            )
          })()}
        </div>
      )
    }
  return null
}
