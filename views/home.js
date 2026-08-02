import { FACTORS, SUPPORTS } from '../data/checkin'
import { CYCLE_PHASES, computeCycle } from '../data/cycle'
import { sumEntries } from '../data/nourish'
import { PROGRAM_SCHEDULE, PROG_BY_ID, WORKOUT_TEMPLATES, progSchedule } from '../data/train'
import { ENV, THEMES, dayIndex } from '../lib/theme'

// ── Phase 2 comparison switch ────────────────────────────────────────────────
// "bubble"    → soft rounded container behind each Your Day card (current)
// "editorial" → no container; the grid holds together on alignment alone
// Flip this single value to compare both treatments once florals arrive.
const CARD_STYLE = "bubble"

// One quiet sentence to close the page. Rotates by day, never within a session.
const FOR_TODAY = [
  "Small steps still change lives.",
  "Rest is not falling behind.",
  "You don't have to earn your worth today.",
  "Capacity changes. Character doesn't.",
  "Your best today may look different than yesterday.",
  "Strength is knowing what today requires.",
  "Consistency is kinder than perfection.",
  "Protect your peace before your productivity.",
  "You don't have to finish everything to have a good day.",
  "Let today's capacity guide today's expectations.",
  "Progress doesn't always look productive.",
  "The smallest promise you keep to yourself still matters.",
  "Honor what your body is telling you.",
  "You are rebuilding, not starting over.",
  "Gentle moves you forward.",
  "Be as kind to yourself as you are to others.",
  "You don't have to rush becoming her.",
  "Today's version of enough is enough.",
  "Even slow growth is growth.",
  "Some days are for blooming. Some are for watering your roots.",
  "Keep becoming her. Whatever that looks like today.",
]

export function renderHome(ctx) {
  const { Chips, Label, checkedIn, ctxOpen, cur, cycleLength, dateStr, factors, foodDays, forceTrainMenu, lastPeriod, nutrition, oneThing, pct, programId, programStart, saveCheckin, saving, selectedWoKey, setBodyView, setCheckedIn, setCtxOpen, setFactors, setMealFilter, setMealType, setNourishView, setOneThing, setPct, setPlanView, setSupports, setTab, setTrainView, setupData, supports, tab, toggle, woLog } = ctx

  if (tab === "today") {
    // ── Atmosphere: untouched. Same ENV engine, same time-of-day behaviour. ──
    const hour = new Date().getHours()
    const env = ENV(hour, checkedIn ? cur : null)
    const ink = env.dark ? "#F5E9F2" : "#3D2545"
    const mut = env.dark ? "rgba(240,220,240,0.72)" : "#A97FA0"
    const faint = env.dark ? "rgba(240,220,240,0.5)" : "#BFA4BA"
    const cardBg = env.dark ? "rgba(56,40,84,0.55)" : "rgba(255,255,255,0.58)"
    const cardBd = env.dark ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.85)"
    const accent = env.dark ? "#F0C879" : "#C9558E"
    const nm = (setupData && setupData.name) || ""
    const greetWord = env.mode === "morning" ? "Good morning" : env.mode === "afternoon" ? "Good afternoon" : "Good evening"

    // ── Derived day state. Home READS from Move / Nourish / Cycle. No new sources of truth. ──
    const recovery = pct < 15
    const tier = !checkedIn ? null : recovery ? "recovery" : cur
    const todayISO = new Date().toISOString().slice(0, 10)

    const homeWo = (() => {
      if (!programId) return null
      const prog = PROG_BY_ID(programId)
      const sched = progSchedule(prog, programStart)
      if (sched.complete) return null
      const recKey = (PROGRAM_SCHEDULE[programId] || [])[sched.weekday] || "recovery"
      const valid = selectedWoKey && WORKOUT_TEMPLATES[selectedWoKey] ? selectedWoKey : null
      const firstReal = (PROGRAM_SCHEDULE[programId] || []).find((k) => k !== "recovery" && WORKOUT_TEMPLATES[k])
      const key = valid || (recKey === "recovery" ? (firstReal || recKey) : recKey)
      return WORKOUT_TEMPLATES[key] ? { key } : { rest: true }
    })()
    const didMove = woLog.some((w) => w.date === todayISO)

    const goMove = () => { setTab("body"); setBodyView("gym"); setTrainView("home") }
    const goNourish = () => { setTab("body"); setBodyView("nourish"); setNourishView("today"); setPlanView(null); setMealFilter(null); setMealType("breakfast") }
    const goCycle = () => { setTab("body"); setBodyView("cycle") }

    const nDay = foodDays[todayISO] || { items: [], water: 0 }
    const nEaten = sumEntries(nDay.items)
    const nT = nutrition && nutrition.targets ? nutrition.targets : null
    const cycOn = !!(cycleLength && lastPeriod)
    const cyc = cycOn ? computeCycle(cycleLength, lastPeriod, new Date()) : null

    // ── Today's Focus: capacity + selected context. Never invented. ──
    const capWord = (s) => s.charAt(0).toUpperCase() + s.slice(1)
    const focusText = (() => {
      const fl = (factors || []).slice(0, 2).map((x) => x.toLowerCase())
      const c2 = fl.length === 0 ? null : fl.length === 1 ? fl[0] : fl[0] + " and " + fl[1]
      const areIs = fl.length > 1 ? "are" : "is"
      if (tier === "recovery") return c2 ? `${capWord(c2)} ${areIs} taking a lot from you today. Recovery isn't falling behind — it's what makes tomorrow possible.` : "There's very little reserve today. Rest, food, water and quiet are enough."
      if (tier === "red") return c2 ? `${capWord(c2)} ${areIs} taking real bandwidth today. Something small and gentle will serve you better than pushing.` : "Today is about supporting what you have. Small, intentional movement is plenty."
      if (tier === "yellow") return c2 ? `${capWord(c2)} ${areIs} taking some of your bandwidth today. Let's keep momentum without asking you to run on empty.` : "You have enough capacity to keep moving without asking yourself for everything."
      return c2 ? `Even with ${c2} in the mix, your energy is here today. A good day to build while still respecting tomorrow.` : "You have room to build today. Let's use it well and finish feeling strong, not spent."
    })()

    // ── Your Day. Fixed order, always. Content adapts; positions never do. ──
    const nourishStatus = !nT ? ["Set up", faint]
      : nEaten.p >= nT.p ? ["Complete", "#7FA054"]
      : nEaten.p >= nT.p * 0.5 ? ["On track", "#7FA054"]
      : nEaten.p > 0 ? ["Halfway", "#E8B84B"]
      : ["Start", faint]
    const moveStatus = !programId ? ["Choose", faint]
      : didMove ? ["Done", "#7FA054"]
      : tier === "recovery" ? ["Recovery", "#A87BD1"]
      : ["Ready", "#E8B84B"]

    const CARDS = [
      { ic: "🍽", label: "Nourish", ds: "Protein", st: nourishStatus, go: goNourish },
      { ic: "💪", label: "Move", ds: homeWo && !homeWo.rest ? "Workout" : "Program", st: moveStatus, go: goMove },
      { ic: "🌸", label: "Bloom", ds: "Inspiration", st: ["Explore", "#DA618B"], go: () => setTab("bloom") },
      { ic: "🌙", label: "Cycle", ds: cyc && CYCLE_PHASES[cyc.phase] ? CYCLE_PHASES[cyc.phase].name.replace(" Phase", "") : "Tracking", st: cyc ? ["Day " + cyc.day, "#9B6BC3"] : ["Set up", faint], go: goCycle },
      { ic: "📈", label: "Progress", ds: "Patterns", st: ["View", "#159492"], go: () => setTab("progress") },
      { ic: "🤍", label: "More", ds: "Settings", st: ["Open", faint], go: () => setTab("more") },
    ]

    const bubble = CARD_STYLE === "bubble"
    const cellStyle = bubble
      ? { background: cardBg, border: `1px solid ${cardBd}`, borderRadius: 18, padding: "15px 6px 14px", textAlign: "center", cursor: "pointer" }
      : { padding: "6px 4px", textAlign: "center", cursor: "pointer" }

    return (
      <div style={{ padding: "0 24px" }}>

        {/* ────────── GREETING ────────── */}
        <div style={{ paddingTop: 26, textAlign: "center" }}>
          <div className="fade-in" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 21, color: ink, lineHeight: 1.1 }}>{greetWord}{nm ? ", " + nm : ""}</div>
          <div style={{ fontSize: 8.5, letterSpacing: 2.6, color: mut, textTransform: "uppercase", marginTop: 8 }}>{dateStr}</div>
        </div>

        {!checkedIn ? (
          /* ══════════ BEFORE CHECK-IN ══════════ */
          <>
            <div style={{ height: 72 }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: accent }}>Before anything else</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, color: ink, lineHeight: 1.2, marginTop: 16 }}>How much do you<br />have today?</div>
            </div>

            <div style={{ height: 44 }} />
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: `${pct}%`, top: -26, transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: env.dark ? "#2E2149" : "#C9558E", background: env.dark ? "#F0C879" : "rgba(255,255,255,0.95)", border: env.dark ? "none" : "1px solid rgba(201,85,142,0.3)", borderRadius: 999, padding: "2px 9px", transition: "left 0.1s ease" }}>{pct}%</div>
              <input type="range" min="0" max="100" step="5" value={pct} onChange={(e) => setPct(+e.target.value)} style={{ width: "100%", background: "linear-gradient(90deg,#E08A8A 0%,#F0C879 50%,#9CC79A 100%)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: mut, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", marginTop: 10 }}><span>running on empty</span><span>full of energy</span></div>
            </div>

            <div style={{ height: 52 }} />
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: mut, textAlign: "center" }}>What's affecting you {"\u00b7"} optional</div>
            <div style={{ marginTop: 16 }}>
              <Chips items={ctxOpen ? FACTORS : FACTORS.slice(0, 6)} selected={factors} onToggle={(v) => toggle(factors, setFactors, v)} />
              <div onClick={() => setCtxOpen(!ctxOpen)} style={{ marginTop: 12, fontSize: 11.5, fontWeight: 700, color: accent, cursor: "pointer", textAlign: "center" }}>{ctxOpen ? "Less" : "More"}</div>
            </div>

            {ctxOpen && (
              <div className="fade-in" style={{ marginTop: 26 }}>
                <Label>What would support you most?</Label>
                <Chips items={SUPPORTS} selected={supports} onToggle={(v) => toggle(supports, setSupports, v)} />
                <div style={{ height: 18 }} />
                <Label>Today's one thing</Label>
                <input type="text" value={oneThing} onChange={(e) => setOneThing(e.target.value)} placeholder="The single thing that would make today a success…" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: env.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBd}`, color: ink, fontSize: 13.5, outline: "none" }} />
              </div>
            )}

            <div style={{ height: 56 }} />
            <button onClick={saveCheckin} disabled={saving} style={{ width: "100%", padding: 16, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", fontSize: 15, fontWeight: 700, opacity: saving ? 0.6 : 1, boxShadow: "0 10px 26px rgba(168,123,209,0.32)" }}>{saving ? "Setting your day…" : "Set My Day"}</button>
          </>
        ) : (
          /* ══════════ AFTER CHECK-IN ══════════ */
          <>
            {/* ────────── TODAY'S CAPACITY ────────── */}
            <div style={{ height: 40 }} />
            <div className="fade-in" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: mut }}>Today's capacity</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 76, color: ink, lineHeight: 0.86, letterSpacing: -1, marginTop: 14 }}>
                {pct}<span style={{ fontSize: 19, color: mut, verticalAlign: "super", marginLeft: 2 }}>%</span>
              </div>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.9, textTransform: "uppercase", color: tier === "recovery" ? "#A87BD1" : THEMES[cur].accent, marginTop: 13 }}>{tier === "recovery" ? "Recovery day" : THEMES[cur].label}</div>
              {factors && factors.length > 0 && (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: mut, marginTop: 12 }}>{factors.join(" \u00b7 ")}</div>
              )}
              <div style={{ marginTop: 14 }}>
                <span onClick={() => setCheckedIn(false)} style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: mut, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Adjust</span>
              </div>
            </div>

            {/* ────────── TODAY'S FOCUS ────────── */}
            <div style={{ height: 40 }} />
            <div className="fade-in" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, lineHeight: 1.5, color: ink, textAlign: "center" }}>{focusText}</div>

            {/* ────────── YOUR DAY ────────── */}
            <div style={{ height: 44 }} />
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: mut, textAlign: "center" }}>Your day</div>
            <div style={{ height: 20 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", columnGap: bubble ? 11 : 12, rowGap: bubble ? 11 : 30 }}>
              {CARDS.map((c) => (
                <div key={c.label} onClick={c.go} style={cellStyle}>
                  <div style={{ fontSize: 17, lineHeight: 1 }}>{c.ic}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: ink, marginTop: 9, letterSpacing: 0.1 }}>{c.label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 11.5, color: mut, marginTop: 3 }}>{c.ds}</div>
                  <div style={{ fontSize: 9.5, color: mut, marginTop: 8 }}>
                    <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: c.st[1], marginRight: 5, verticalAlign: 1 }} />
                    {c.st[0]}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ────────── FOR TODAY ────────── */}
        <div style={{ height: 46 }} />
        <div style={{ textAlign: "center", paddingBottom: 106, position: "relative" }}>
          <div style={{ position: "absolute", left: -34, right: -34, top: -30, height: 122, pointerEvents: "none",
            background: `radial-gradient(ellipse 62% 100% at 50% 50%, ${env.dark ? "rgba(28,19,46,0.72)" : "rgba(253,249,247,0.78)"} 0%, ${env.dark ? "rgba(28,19,46,0)" : "rgba(253,249,247,0)"} 72%)` }} />
          <div style={{ position: "relative", fontSize: 8.5, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: faint }}>For today</div>
          <div style={{ position: "relative", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.45, color: mut, marginTop: 14 }}>{FOR_TODAY[dayIndex(FOR_TODAY.length)]}</div>
        </div>

      </div>
    )
  }
  return null
}
