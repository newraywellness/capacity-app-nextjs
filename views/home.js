import { FACTORS, SUPPORTS } from '../data/checkin'
import { CYCLE_PHASES, computeCycle } from '../data/cycle'
import { sumEntries } from '../data/nourish'
import { COACH_INSIGHT_TITLE, PROGRAM_SCHEDULE, PROG_BY_ID, WORKOUT_TEMPLATES, progSchedule } from '../data/train'
import { ENV, THEMES, dayIndex } from '../lib/theme'

export function renderHome(ctx) {
  const { Chips, Label, baseline, checkedIn, ctxOpen, cur, cycleLength, dateStr, factors, foodDays, forceTrainMenu, lastPeriod, nutrition, oneThing, pct, programId, programStart, progressData, recovery, saveCheckin, saving, selectedWoKey, setBodyView, setCheckedIn, setCtxOpen, setFactors, setMealFilter, setMealType, setNourishView, setOneThing, setPct, setPlanView, setSupports, setTab, setTrainView, setWoColor, setWoKey, setWoTier, setWoType, setupData, supports, tab, toggle, user, woDone, woLog } = ctx
    if (tab === "today") {
      const hour = new Date().getHours()
      const env = ENV(hour, checkedIn ? cur : null)
      const ink = env.dark ? "#F5E9F2" : "#3D2545"
      const mut = env.dark ? "rgba(240,220,240,0.75)" : "#A97FA0"
      const cardBg = env.dark ? "rgba(56,40,84,0.6)" : "rgba(255,255,255,0.62)"
      const cardBd = env.dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)"
      const nm = (setupData && setupData.name) || ""
      const greetWord = env.mode === "morning" ? "Good morning" : env.mode === "afternoon" ? "Good afternoon" : "Good evening"
      const accent = env.dark ? "#F0C879" : "#C9558E"

      // ---- Derived day state. Home READS from Train / Nourish / Cycle / Progress; no new sources of truth. ----
      const recovery = pct < 15
      const tier = !checkedIn ? null : recovery ? "recovery" : cur
      const todayISO = new Date().toISOString().slice(0, 10)
      // Active workout — mirrors Train's resolution (recommendation unless one was manually selected)
      const homeWo = (() => {
        if (!programId) return null
        const prog = PROG_BY_ID(programId)
        const sched = progSchedule(prog, programStart)
        if (sched.complete) return null
        const recKey = (PROGRAM_SCHEDULE[programId] || [])[sched.weekday] || "recovery"
        const valid = selectedWoKey && WORKOUT_TEMPLATES[selectedWoKey] ? selectedWoKey : null
        const firstReal = (PROGRAM_SCHEDULE[programId] || []).find((k) => k !== "recovery" && WORKOUT_TEMPLATES[k])
        const key = valid || (recKey === "recovery" ? (firstReal || recKey) : recKey)
        const tpl = WORKOUT_TEMPLATES[key]
        if (!tpl) return { rest: true }
        const woTierNow = recovery ? (forceTrainMenu ? "red" : "recovery") : cur
        const mins = tpl.cap || Math.round(tpl.slots.length * (woTierNow === "green" ? 6 : woTierNow === "yellow" ? 5 : 4))
        return { key, title: tpl.title, tier: woTierNow, mins, type: (tpl.slots[0] || {}).pattern || "full", manual: !!valid && valid !== recKey }
      })()
      const woDone = woLog.some((w) => w.date === todayISO)
      const goTrainHome = () => { setTab("body"); setBodyView("gym"); setTrainView("home") }
      const startWorkout = () => { if (!homeWo || homeWo.rest) return goTrainHome(); setWoColor(cur); setWoKey(homeWo.key); setWoTier(homeWo.tier); setWoType(homeWo.type); setBodyView("gym"); setTrainView("workout"); setTab("body") }
      const goNourishToday = () => { setTab("body"); setBodyView("nourish"); setNourishView("today"); setPlanView(null) }
      const goMeals = (mt) => { setTab("body"); setBodyView("nourish"); setNourishView("plan"); setPlanView("meals"); if (mt) setMealType(mt); setMealFilter(null) }
      // Nutrition (reads the same food log Nourish writes)
      const nDay = foodDays[todayISO] || { items: [], water: 0 }
      const nEaten = sumEntries(nDay.items)
      const nT = nutrition && nutrition.targets ? nutrition.targets : null
      const proteinLeft = nT ? Math.max(0, nT.p - nEaten.p) : null
      const loggedAny = nDay.items.length > 0
      // Cycle (only when tracking is on)
      const cycOn = !!(cycleLength && lastPeriod)
      const cyc = cycOn ? computeCycle(cycleLength, lastPeriod, new Date()) : null

      // ---- Today's Focus copy: capacity + selected context (+ never invented) ----
      const CAP_SENTENCE = { green: "You have room to build today.", yellow: "You have enough capacity to keep moving without asking yourself for everything.", red: "Today is about supporting what you have.", recovery: "There's very little reserve today. Recovery comes first." }
      const capWord = (s) => s.charAt(0).toUpperCase() + s.slice(1)
      const focusText = (() => {
        const fl = (factors || []).slice(0, 2).map((x) => x.toLowerCase())
        const ctx = fl.length === 0 ? null : fl.length === 1 ? fl[0] : fl[0] + " and " + fl[1]
        const areIs = fl.length > 1 ? "are" : "is"
        if (tier === "recovery") return ctx ? `${capWord(ctx)} ${areIs} taking a lot from you today. Recovery isn't falling behind — it's what makes tomorrow possible.` : "There's very little reserve today. Rest, food, water and quiet are enough."
        if (tier === "red") return ctx ? `${capWord(ctx)} ${areIs} taking real bandwidth today. Something small and gentle will serve you better than pushing.` : "Today is about supporting what you have. Small, intentional movement is plenty."
        if (tier === "yellow") return ctx ? `${capWord(ctx)} ${areIs} taking some of your bandwidth today. Let's keep momentum without asking you to run on empty.` : "You have enough capacity to keep moving without asking yourself for everything."
        return ctx ? `Even with ${ctx} in the mix, your energy is here today. A good day to build while still respecting tomorrow.` : "You have room to build today. Let's use it well and finish feeling strong, not spent."
      })()

      // ---- Today at a Glance: only genuinely available items, 3-4 max ----
      const glance = []
      if (cyc && CYCLE_PHASES[cyc.phase]) glance.push({ emoji: CYCLE_PHASES[cyc.phase].emoji, value: CYCLE_PHASES[cyc.phase].name.replace(" Phase", ""), label: "cycle", go: () => { setTab("body"); setBodyView("cycle") } })
      if (homeWo && !homeWo.rest) glance.push({ emoji: woDone ? "✓" : "🏋️", value: woDone ? "Done" : homeWo.title.split(" ").slice(0, 2).join(" "), label: woDone ? "movement" : "today", go: goTrainHome })
      if (nT) glance.push({ emoji: "🥚", value: `${Math.round(nEaten.p)}/${nT.p}g`, label: "protein", go: goNourishToday })
      if (nT) glance.push({ emoji: "💧", value: `${nDay.water}/8`, label: "water", go: goNourishToday })

      // ---- ONE dynamic next step, chosen by time of day + what's already handled ----
      const nextUp = (() => {
        if (!checkedIn) return null
        if (tier === "recovery") return { title: "Make today smaller", body: "Recovery is the recommendation. Food, water, quiet and rest are enough today.", cta: "See recovery support", go: goTrainHome }
        if (env.mode === "morning") {
          if (nT && !loggedAny) return { title: "Start simple", body: "Starting with protein tends to make the rest of the day easier.", cta: "Breakfast ideas", go: () => goMeals("breakfast") }
          if (!woDone && homeWo && !homeWo.rest) return { title: "When you're ready", body: `Your ${homeWo.title.toLowerCase()} is set up and waiting — no rush on the timing.`, cta: "Start workout", go: startWorkout }
        }
        if (env.mode === "afternoon") {
          if (!woDone && homeWo && !homeWo.rest) return { title: "For this afternoon", body: `Your ${THEMES[cur] ? THEMES[cur].label.split(" ")[0] : ""} ${homeWo.title.toLowerCase()} is still here if you want it.`, cta: "Start workout", go: startWorkout }
          if (woDone && proteinLeft != null && proteinLeft > 10) return { title: "Movement handled ✓", body: `You're ${Math.round(proteinLeft)}g from your protein target. Here are a few easy ways to close the gap.`, cta: "See food ideas", go: () => goMeals(null) }
        }
        if (env.mode === "evening") {
          const sup = (supports || [])[0]
          if (proteinLeft != null && proteinLeft > 15) return { title: "Let the day come down", body: `${woDone ? "Movement is handled. " : ""}You've got about ${Math.round(proteinLeft)}g of protein left${sup ? `, and ${sup.toLowerCase()} was one of your supports today` : ""}.`, cta: "Something easy", go: () => goMeals("snack") }
          return { title: "Let the day come down", body: "You showed up for today. Let the rest be enough.", cta: null, go: null }
        }
        if (!nT) return { title: "Make nourishment easier", body: "Setting your targets once means Nourish can tell you what to eat instead of leaving you to work it out.", cta: "Build my plan", go: () => { setTab("body"); setBodyView("nourish"); setNourishView("plan"); setPlanView("choose") } }
        return null
      })()

      // ---- Occasional quiet pattern observation (never every day, never invented) ----
      const insight = (() => {
        if (!checkedIn || !progressData) return null
        if (dayIndex(3) !== 0) return null
        const opts = []
        if (progressData.momentum && progressData.momentum.dir === "up") opts.push("Your capacity has been finding a steadier rhythm lately.")
        if (progressData.momentum && progressData.momentum.dir === "steady") opts.push("Your capacity has been fairly steady this week.")
        if (progressData.recoveryPatterns && progressData.recoveryPatterns.length) opts.push(progressData.recoveryPatterns[0])
        if (progressData.checkinStreak >= 4) opts.push(`You've checked in ${progressData.checkinStreak} days running — that's how the picture gets clearer.`)
        return opts.length ? opts[dayIndex(opts.length)] : null
      })()

      const FACTORS_TOP = FACTORS.slice(0, 6)
      const factorChips = ctxOpen ? FACTORS : FACTORS_TOP

      return (
        <div style={{ padding: "10px 20px 0", position: "relative" }}>
          <div className="fade-in" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 28, color: ink }}>{greetWord}{nm ? ", " + nm : ""}</div>
          <div style={{ fontSize: 10, letterSpacing: 2.8, color: mut, textTransform: "uppercase", marginTop: 5 }}>{dateStr}</div>

          {/* ---------- CAPACITY ---------- */}
          <div style={{ marginTop: env.mode === "morning" ? 96 : 34, borderRadius: 22, background: cardBg, border: `1px solid ${cardBd}`, padding: "24px 22px", boxShadow: env.dark ? "0 18px 40px rgba(0,0,0,0.35)" : "0 18px 40px rgba(120,80,130,0.16)", position: "relative" }}>
            {!checkedIn ? (
              <>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: accent }}>BEFORE ANYTHING ELSE</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: ink, margin: "10px 0 30px", lineHeight: 1.25 }}>How much do you have today?</div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: `${pct}%`, top: -26, transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: env.dark ? "#2E2149" : "#C9558E", background: env.dark ? "#F0C879" : "rgba(255,255,255,0.95)", border: env.dark ? "none" : "1px solid rgba(201,85,142,0.3)", borderRadius: 999, padding: "2px 9px", transition: "left 0.1s ease" }}>{pct}%</div>
                  <input type="range" min="0" max="100" step="5" value={pct} onChange={(e) => setPct(+e.target.value)} style={{ width: "100%", background: `linear-gradient(90deg,#E08A8A 0%,#F0C879 50%,#9CC79A 100%)` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: mut, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", marginTop: 8 }}><span>running on empty</span><span>full of energy</span></div>
                <div style={{ fontSize: 11, color: mut, marginTop: 16, lineHeight: 1.55 }}>There is no wrong answer. The whole day shapes itself around this.</div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: accent }}>TODAY IS SET</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: ink, marginTop: 6 }}>{pct}% {"\u00b7"} {tier === "recovery" ? "Recovery Day" : THEMES[cur].label}</div>
                  <div style={{ fontSize: 12.5, color: mut, marginTop: 6, lineHeight: 1.55 }}>{CAP_SENTENCE[tier]}</div>
                </div>
                <div onClick={() => setCheckedIn(false)} style={{ fontSize: 11, fontWeight: 700, color: mut, cursor: "pointer", textDecoration: "underline", flexShrink: 0, paddingTop: 4 }}>adjust</div>
              </div>
            )}

            {/* ---------- WHAT'S AFFECTING YOU (always visible, no dropdown) ---------- */}
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${cardBd}` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 9 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: ink, textTransform: "uppercase" }}>What's affecting you today?</span>
                <span style={{ fontSize: 10.5, color: mut, fontStyle: "italic" }}>optional</span>
              </div>
              <Chips items={factorChips} selected={factors} onToggle={(v) => { toggle(factors, setFactors, v); if (checkedIn && user) { setTimeout(saveCheckin, 0) } }} />
              <div onClick={() => setCtxOpen(!ctxOpen)} style={{ marginTop: 10, fontSize: 11.5, fontWeight: 700, color: accent, cursor: "pointer" }}>{ctxOpen ? "\u2212 Less" : "+ More"}</div>
              {ctxOpen && (
                <div className="fade-in" style={{ marginTop: 14 }}>
                  <Label>What would support you most?</Label>
                  <Chips items={SUPPORTS} selected={supports} onToggle={(v) => { toggle(supports, setSupports, v); if (checkedIn && user) { setTimeout(saveCheckin, 0) } }} />
                  <div style={{ height: 14 }} />
                  <Label>Today's one thing</Label>
                  <input type="text" value={oneThing} onChange={(e) => setOneThing(e.target.value)} placeholder="The single thing that would make today a success…" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: env.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBd}`, color: ink, fontSize: 13.5, outline: "none" }} />
                </div>
              )}
            </div>

            {!checkedIn && (
              <button onClick={saveCheckin} disabled={saving} style={{ width: "100%", marginTop: 20, padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", fontSize: 14.5, fontWeight: 700, opacity: saving ? 0.6 : 1, boxShadow: "0 8px 22px rgba(168,123,209,0.35)" }}>{saving ? "Setting your day…" : "Set my day"}</button>
            )}
          </div>

          {/* ---------- TODAY'S FOCUS (with the movement inside it) ---------- */}
          {checkedIn && (
            <div className="fade-in" style={{ marginTop: 16, borderRadius: 22, padding: "22px 20px", background: "linear-gradient(135deg,#E984B4 0%,#A87BD1 100%)", boxShadow: "0 14px 32px rgba(168,123,209,0.35)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -34, top: -34, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
              <div style={{ position: "absolute", right: 12, bottom: -14, fontSize: 54, opacity: 0.14 }}>🌸</div>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: "rgba(255,255,255,0.85)", position: "relative" }}>{(COACH_INSIGHT_TITLE[tier] || "Today's Focus").toUpperCase()}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 21, color: "#fff", lineHeight: 1.35, margin: "10px 0 4px", position: "relative" }}>{focusText}</div>
              {tier === "recovery" ? (
                <div style={{ marginTop: 16, position: "relative" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", marginBottom: 12 }}>Gentle mobility {"\u00b7"} stretching {"\u00b7"} an easy walk {"\u00b7"} rest</div>
                  <button onClick={goTrainHome} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.95)", color: "#8A5EB0", fontSize: 14, fontWeight: 800 }}>Start recovery</button>
                </div>
              ) : homeWo && !homeWo.rest ? (
                <div style={{ marginTop: 16, position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>{homeWo.title}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{"\u00b7"} {THEMES[cur] ? THEMES[cur].label.split(" ")[0] : ""}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{"\u00b7"} ~{homeWo.mins} min</span>
                    {homeWo.manual && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#fff", background: "rgba(255,255,255,0.25)", padding: "2px 7px", borderRadius: 999 }}>YOUR PICK</span>}
                  </div>
                  <button onClick={woDone ? goTrainHome : startWorkout} style={{ width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.95)", color: "#A54E86", fontSize: 14, fontWeight: 800 }}>{woDone ? "Movement handled \u2713" : "Start workout"}</button>
                </div>
              ) : (
                <div style={{ marginTop: 14, position: "relative" }}>
                  <button onClick={goTrainHome} style={{ width: "100%", padding: 13, borderRadius: 14, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.9)", color: "#A54E86", fontSize: 13.5, fontWeight: 800 }}>{programId ? "Open Train" : "Choose your program"}</button>
                </div>
              )}
            </div>
          )}

          {/* ---------- TODAY AT A GLANCE ---------- */}
          {checkedIn && glance.length > 0 && (
            <div className="fade-in" style={{ marginTop: 14, borderRadius: 18, background: cardBg, border: `1px solid ${cardBd}`, display: "flex", padding: "12px 4px" }}>
              {glance.slice(0, 4).map((g, i) => (
                <div key={i} onClick={g.go} style={{ flex: 1, textAlign: "center", padding: "2px 4px", cursor: "pointer", borderLeft: i ? `1px solid ${cardBd}` : "none" }}>
                  <div style={{ fontSize: 14 }}>{g.emoji}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: ink, marginTop: 3 }}>{g.value}</div>
                  <div style={{ fontSize: 9, color: mut, marginTop: 1, letterSpacing: 0.5 }}>{g.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- ONE DYNAMIC NEXT STEP ---------- */}
          {nextUp && (
            <div className="fade-in" style={{ marginTop: 14, borderRadius: 18, background: cardBg, border: `1px solid ${cardBd}`, padding: "17px 19px" }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: ink, marginBottom: 5 }}>{nextUp.title}</div>
              <div style={{ fontSize: 12.5, color: mut, lineHeight: 1.6 }}>{nextUp.body}</div>
              {nextUp.cta && <div onClick={nextUp.go} style={{ marginTop: 12, fontSize: 12.5, fontWeight: 800, color: accent, cursor: "pointer" }}>{nextUp.cta} {"\u203a"}</div>}
            </div>
          )}

          {!checkedIn && (
            <div className="fade-in" style={{ marginTop: 14, borderRadius: 18, background: cardBg, border: `1px solid ${cardBd}`, padding: "17px 19px" }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: ink, marginBottom: 5 }}>Start where you are</div>
              <div style={{ fontSize: 12.5, color: mut, lineHeight: 1.6 }}>Check in first and we'll shape the day around what you actually have.</div>
            </div>
          )}

          {/* ---------- OCCASIONAL QUIET OBSERVATION ---------- */}
          {insight && (
            <div className="fade-in" style={{ marginTop: 14, paddingLeft: 12, borderLeft: `2px solid ${accent}` }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: mut, lineHeight: 1.5 }}>{insight}</div>
            </div>
          )}

          <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: mut, margin: "28px 0 0" }}>True Reverie changes with you — morning to evening, full to empty.</div>
        </div>
      )
    }
  return null
}
