import { PHASE_SUGGESTION } from '../data/cycle'
import { LEVEL_LABEL, MOVEMENTS, MOVE_GROUPS } from '../data/exercises'
import { CAPACITY_RULES, CAP_VERSION, COACH_INSIGHTS, COACH_INSIGHT_TITLE, COACH_LINES, COMPLETION, PROGRAMS, PROGRAM_COACH_LINES, PROGRAM_PHASES, PROGRAM_SCHEDULE, PROGRESSION, PROG_BY_ID, RECOVERY_OPTIONS, WORKOUT_TEMPLATES, WO_TYPES, bodyAreaOf, buildSession, coachData, phaseFor, progSchedule, resolveSession } from '../data/train'
import { db } from '../lib/supabase'
import { BASE, HERO_GRAD, THEMES, dayIndex, demoLink } from '../lib/theme'

export function renderTrain(ctx) {
  const { Stat, bodyView, cur, cycleNow, detailProgram, forceTrainMenu, guidedIdx, history, libLevel, libOpen, pct, persistProgram, programId, programStart, recovery, recoveryDone, recoveryOpen, restLeft, selectedWoKey, setDetailProgram, setForceTrainMenu, setGuidedIdx, setLibLevel, setLibOpen, setProgressView, setRecoveryDone, setRecoveryOpen, setRestLeft, setSelectedWoKey, setTab, setTrainView, setWhyOpen, setWoColor, setWoDone, setWoEnv, setWoKey, setWoLog, setWoLogged, setWoMode, setWoOpen, setWoTier, setWoType, tab, toggle, trainView, user, whyOpen, woColor, woDone, woEnv, woKey, woLog, woLogged, woMode, woOpen, woTier, woType } = ctx
    if (tab === "body" && bodyView === "gym" && !programId && detailProgram) {
      const p = PROG_BY_ID(detailProgram)
      const DAYNAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const chooseIt = () => { persistProgram(p.id); setDetailProgram(null) }
      const Chip = ({ children }) => (<span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 999, background: "rgba(168,123,209,0.1)", color: BASE.creamDim, fontSize: 12, fontWeight: 600, margin: "0 6px 6px 0" }}>{children}</span>)
      const Stat = ({ label, value }) => (<div style={{ flex: "1 0 45%", marginBottom: 12 }}><div style={{ fontSize: 10, letterSpacing: 1.5, color: BASE.taupe, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 13.5, color: BASE.cream, fontWeight: 600, marginTop: 2 }}>{value}</div></div>)
      const capRows = [["Green", "Full programmed workout.", "#7FA054"], ["Yellow", "Reduced volume while keeping your progress.", "#D08F2E"], ["Red", "Simplified movement to keep consistency.", "#D65C4E"], ["Recovery", "Intentional rest, still connected to the program.", "#A87BD1"]]
      return (
        <div className="fade-in" style={{ padding: "0 0 20px" }}>
          <div style={{ background: p.grad, padding: "20px 20px 26px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
            <div onClick={() => setDetailProgram(null)} style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", cursor: "pointer", marginBottom: 14 }}>{"\u2039 All programs"}</div>
            <div style={{ fontSize: 40, position: "relative" }}>{p.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "#fff", marginTop: 4, position: "relative" }}>{p.name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.95)", marginTop: 4, position: "relative" }}>{p.promise}</div>
          </div>
          <div style={{ padding: "20px 18px 0" }}>
            <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.65, marginBottom: 22 }}>{p.purpose}</div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>Who this is for</div>
            <div style={{ marginBottom: 22 }}>{p.bestFor.map((b, i) => <Chip key={i}>{b}</Chip>)}</div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>What you will build</div>
            <div style={{ marginBottom: 24 }}>{p.builds.map((b, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: p.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{"\u2713"}</span><span style={{ fontSize: 14, color: BASE.cream }}>{b}</span></div>))}</div>

            <div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <Stat label="Length" value={p.weeks + " weeks"} />
                <Stat label="Experience" value={p.difficulty} />
                <Stat label="Equipment" value={p.equip} />
                <Stat label="Style" value={p.style} />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 12 }}>Weekly rhythm</div>
            <div style={{ marginBottom: 24 }}>
              {p.split.map((t, i) => { const rest = t === "rest"; const label = rest ? "Recovery" : (WO_TYPES.find((x) => x.key === t) || { label: t }).label; return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: BASE.taupe, width: 30, textTransform: "uppercase" }}>{DAYNAMES[i]}</span>
                  <span style={{ fontSize: 16 }}>{rest ? "🌙" : (WO_TYPES.find((x) => x.key === t) || {}).icon}</span>
                  <span style={{ fontSize: 13.5, color: BASE.cream, fontWeight: 600 }}>{label}</span>
                </div>
              )})}
              <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginTop: 8, textAlign: "center" }}>The pattern repeats each week. The individual workouts come next.</div>
            </div>

            <div style={{ borderRadius: 16, background: "rgba(168,123,209,0.08)", border: "1px solid rgba(168,123,209,0.25)", padding: "18px 18px", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: BASE.cream, lineHeight: 1.5, marginBottom: 14, textAlign: "center" }}>The program stays the same. Today's workout adapts.</div>
              {capRows.map(([k, v, c], i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span style={{ minWidth: 68, fontSize: 12, fontWeight: 800, color: c }}>{k}</span>
                  <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.45 }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", marginTop: 6 }}>You never fall behind because life happens.</div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>When you finish</div>
            <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 24 }}>Repeat the program stronger, move on to {PROG_BY_ID(p.next).name}, or choose another path. Your progress is always yours.</div>

            <button onClick={chooseIt} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: p.grad, color: "#fff", fontSize: 15.5, fontWeight: 800, boxShadow: "0 10px 26px rgba(120,80,130,0.28)" }}>Choose {p.name}</button>
          </div>
        </div>
      )
    }
    if (tab === "body" && bodyView === "gym" && !programId) {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Choose your program</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 22 }}>Pick the journey that feels right for this season of your life. From there, True Reverie handles the daily decisions — you choose the destination, we choose today's route.</div>
          {PROGRAMS.map((p) => (
            <div key={p.id} style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: "0 8px 22px rgba(120,80,130,0.12)", border: "1px solid " + BASE.border }}>
              <div style={{ background: p.grad, padding: "20px 20px 18px", position: "relative" }}>
                <div style={{ position: "absolute", right: -24, top: -24, width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
                <div style={{ fontSize: 30, position: "relative" }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 6, position: "relative" }}>{p.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: "rgba(255,255,255,0.95)", position: "relative", marginTop: 2 }}>{p.promise}</div>
              </div>
              <div style={{ padding: "16px 18px", background: BASE.surface }}>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.cream }}>For:</b> {p.bestFor.slice(0, 2).join(", ")}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.cream }}>Length:</b> {p.weeks} weeks · {p.difficulty}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 14 }}><b style={{ color: BASE.cream }}>Equipment:</b> {p.equip}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setDetailProgram(p.id)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Learn More</button>
                  <button onClick={() => persistProgram(p.id)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: p.grad, color: "#fff", fontSize: 13, fontWeight: 700 }}>Choose</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (tab === "body" && bodyView === "gym" && programId && trainView === "home") {
      const prog = PROG_BY_ID(programId)
      const sched = progSchedule(prog, programStart)
      const recovery = pct < 15
      const capKey = recovery ? "recovery" : cur
      const session = buildSession(programId, sched.weekday, capKey)
      const phase = phaseFor(programId, sched.week)
      const _coachBank = (PROGRAM_COACH_LINES[programId] && PROGRAM_COACH_LINES[programId][recovery ? "recovery" : cur]) || COACH_LINES[recovery ? "recovery" : cur] || []
      const coachLine = _coachBank[sched.week % _coachBank.length] || ""
      const version = CAP_VERSION[recovery ? "red" : cur]
      // --- Workout selection: recommendation vs. manual selection ---
      // recommendedWorkout = today's scheduled template key (never overwritten)
      const recommendedWorkout = (PROGRAM_SCHEDULE[programId] || [])[sched.weekday] || "recovery"
      // A manual selection only applies if it's a real, non-recovery template in this program
      const validSelected = selectedWoKey && WORKOUT_TEMPLATES[selectedWoKey] ? selectedWoKey : null
      // activeWorkout = selectedWorkout ?? recommendedWorkout
      // In "train anyway" mode where the recommendation is recovery, fall back to the first real workout.
      const firstRealKey = (PROGRAM_SCHEDULE[programId] || []).find((k) => k !== "recovery" && WORKOUT_TEMPLATES[k])
      const activeWorkout = validSelected || (recommendedWorkout === "recovery" ? (firstRealKey || recommendedWorkout) : recommendedWorkout)
      // Capacity TIER is separate from workout CATEGORY. Below 15% the default is recovery, but
      // "Train anyway" trains the Red-day version (never green/yellow). At 15-35% cur is already "red".
      const activeTier = recovery ? (forceTrainMenu ? "red" : "recovery") : cur
      const scheduleKey = recommendedWorkout
      const isRest = activeWorkout === "recovery"
      // Build the session from the ACTIVE workout template, not just the weekday
      const activeTpl = WORKOUT_TEMPLATES[activeWorkout] || null
      const activeSession = activeTpl ? { slots: activeTpl.slots, title: activeTpl.title, focus: activeTpl.focus } : session
      const woType2 = activeSession.slots[0] ? activeSession.slots[0].pattern : "walk"
      const typeLabel = activeSession.title
      const isManual = !!validSelected && validSelected !== recommendedWorkout
      const mins = version.mins
      const heroGrad = recovery ? "linear-gradient(135deg,#8A6FA8,#5E4578)" : HERO_GRAD[cur]
      const pctThroughWeeks = Math.round((sched.week / prog.weeks) * 100)
      const programComplete = sched.complete
      // Coach insight: rotating message + history-aware opener
      const todayISO = new Date().toISOString().slice(0, 10)
      const insightCap = recovery ? "recovery" : cur
      const insightTitle = COACH_INSIGHT_TITLE[insightCap]
      const insightBank = COACH_INSIGHTS[insightCap]
      let insightMsg = insightBank[dayIndex(insightBank.length)]
      // History-aware touch: if a recent (<=2 days) workout hit the same area, acknowledge recovery
      const area = bodyAreaOf(typeLabel)
      const recentSame = area && woLog.some((w) => {
        const days = (new Date(todayISO + "T12:00:00") - new Date(w.date + "T12:00:00")) / 86400000
        return days > 0 && days <= 2 && bodyAreaOf(w.type) === area
      })
      const recentDiff = area && woLog.some((w) => {
        const days = (new Date(todayISO + "T12:00:00") - new Date(w.date + "T12:00:00")) / 86400000
        return days > 0 && days <= 2 && bodyAreaOf(w.type) && bodyAreaOf(w.type) !== area
      })
      if (insightCap === "green" && recentDiff) insightMsg = `Your ${area} has recovered well since your last session, and your energy is here today. A great opportunity to build while respecting tomorrow.`
      else if (insightCap === "yellow" && recentSame) insightMsg = `You trained similar muscles recently, so today's lighter session lets them keep recovering while you hold onto your momentum.`
      // Workouts the user can manually choose within this program.
      // Walk/mobility schedule days ("walk+mobility", "walk+recovery") map to the real walk template.
      const walkTplKey = WORKOUT_TEMPLATES[programId + ":walk"] ? programId + ":walk" : (WORKOUT_TEMPLATES["move:walk"] ? "move:walk" : null)
      const resolveSchedKey = (k) => {
        if (WORKOUT_TEMPLATES[k]) return k
        if (k === "walk+mobility" || k === "walk+recovery" || k === "conditioning" || k === "walk") return walkTplKey
        return null
      }
      const progSchedRaw = [...new Set((PROGRAM_SCHEDULE[programId] || []).filter((k) => k !== "recovery"))]
      const _seenTpl = {}
      const manualOptions = progSchedRaw.map((k) => {
        const tplKey = resolveSchedKey(k)
        if (!tplKey || !WORKOUT_TEMPLATES[tplKey] || _seenTpl[tplKey]) return null
        _seenTpl[tplKey] = true
        return { key: tplKey, title: WORKOUT_TEMPLATES[tplKey].title, pattern: (WORKOUT_TEMPLATES[tplKey].slots[0] || {}).pattern }
      }).filter(Boolean)
      // Ensure a Walk option is always present if the program's week includes any walking day.
      const hasWalkDay = (PROGRAM_SCHEDULE[programId] || []).some((k) => k.includes("walk") || k === "conditioning")
      if (walkTplKey && hasWalkDay && !manualOptions.some((o) => o.key === walkTplKey)) {
        manualOptions.push({ key: walkTplKey, title: WORKOUT_TEMPLATES[walkTplKey].title, pattern: (WORKOUT_TEMPLATES[walkTplKey].slots[0] || {}).pattern })
      }
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 24, lineHeight: 1.3, marginBottom: 2 }}>Your body needs today's version of you.</div>
          <div style={{ fontSize: 13, color: BASE.taupe, marginBottom: 16 }}>Let's honor it.</div>

          {phase && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", borderRadius: 14, background: "rgba(127,160,84,0.08)", border: "1px solid rgba(127,160,84,0.25)", marginBottom: 14 }}>
              <div style={{ fontSize: 22 }}>{PROG_BY_ID(programId).emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#6E9E6B", textTransform: "uppercase", fontWeight: 700 }}>Phase {PROGRAM_PHASES[programId] ? PROGRAM_PHASES[programId].indexOf(phase) + 1 : 1} · Week {sched.week}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream }}>{phase.name}</div>
              </div>
            </div>
          )}
          {coachLine && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.creamDim, lineHeight: 1.5, marginBottom: 18, paddingLeft: 12, borderLeft: "2px solid #A87BD1" }}>{coachLine}</div>}

          {programComplete ? (() => {
            const done = COMPLETION[programId] || COMPLETION.foundations
            return (
            <div className="fade-in">
              <div style={{ borderRadius: 22, padding: "30px 24px", background: prog.grad, color: "#fff", boxShadow: "0 14px 32px rgba(120,80,130,0.3)", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
                <div style={{ fontSize: 44, position: "relative" }}>{prog.emoji}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, marginTop: 8, position: "relative" }}>{done.title}</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.94)", lineHeight: 1.6, marginTop: 8, position: "relative" }}>{done.message}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 12 }}>Where to next</div>
              {done.paths.map(([t, d, target], i) => (
                <div key={i} onClick={() => { const tgt = target === "self" ? programId : target; persistProgram(tgt || null) }} style={{ padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{t}</div>
                  <div style={{ fontSize: 12, color: BASE.taupe, marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                </div>
              ))}
              <div style={{ height: 20 }} />
            </div>
            )
          })() : ((recovery || isRest) && !forceTrainMenu) ? (
            <>
              <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#B9A0CE,#7E5E9E)", color: "#fff", boxShadow: "0 14px 32px rgba(120,80,130,0.3)", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -28, top: -28, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
                <svg style={{ position: "absolute", right: 22, top: 20, opacity: 0.8 }} width="34" height="34" viewBox="0 0 40 40"><path d="M28 4 A 16 16 0 1 0 36 22 A 12.5 12.5 0 0 1 28 4 Z" fill="#F0E3B8" /></svg>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.8)", position: "relative" }}>TODAY'S VERSION</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, margin: "6px 0 10px", position: "relative" }}>Recovery</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.94)", lineHeight: 1.6, position: "relative" }}>Recovery is part of the program, not a break from it. Your body gets stronger when it has time to rebuild.</div>
              </div>

              <div style={{ borderRadius: 18, background: "linear-gradient(135deg,rgba(168,123,209,0.1),rgba(126,94,158,0.1))", border: "1px solid rgba(168,123,209,0.3)", padding: "18px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -14, top: -14, fontSize: 54, opacity: 0.1 }}>🌙</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#9B6BC3", marginBottom: 7, position: "relative" }}>{COACH_INSIGHT_TITLE.recovery}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: BASE.cream, lineHeight: 1.5, position: "relative" }}>{COACH_INSIGHTS.recovery[dayIndex(COACH_INSIGHTS.recovery.length)]}</div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "0 2px 10px" }}>Choose how to recover</div>
              {RECOVERY_OPTIONS.map((r) => {
                const open = recoveryOpen === r.key
                return (
                  <div key={r.key} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${open ? "#A87BD1" : BASE.border}`, marginBottom: 10, overflow: "hidden" }}>
                    <div onClick={() => setRecoveryOpen(open ? null : r.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
                      <span style={{ fontSize: 22 }}>{r.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{r.name}</div>
                        <div style={{ fontSize: 11.5, color: BASE.taupe }}>{r.mins}</div>
                      </div>
                      <span style={{ color: BASE.taupe }}>{open ? "\u2212" : "+"}</span>
                    </div>
                    {open && (
                      <div className="fade-in" style={{ padding: "0 16px 16px" }}>
                        {r.how.map((step, si) => (
                          <div key={si} style={{ display: "flex", gap: 9, marginBottom: 6 }}>
                            <span style={{ minWidth: 18, height: 18, borderRadius: "50%", background: "rgba(168,123,209,0.15)", color: "#A87BD1", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{si + 1}</span>
                            <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              <button onClick={() => { setRecoveryDone(true) }} style={{ width: "100%", marginTop: 6, padding: 16, borderRadius: 16, border: "none", cursor: "pointer", background: recoveryDone ? "rgba(168,123,209,0.15)" : "linear-gradient(135deg,#B9A0CE,#8A6FA8)", color: recoveryDone ? "#8A6FA8" : "#fff", fontSize: 15.5, fontWeight: 800, boxShadow: recoveryDone ? "none" : "0 10px 26px rgba(138,111,168,0.35)" }}>{recoveryDone ? "Recovery logged \u2713 well done" : "Start Recovery"}</button>

              <div onClick={() => { setForceTrainMenu(true); setSelectedWoKey(null) }} style={{ textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>Train anyway {"\u2192"}</div>
              <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", marginTop: 4, fontStyle: "italic", lineHeight: 1.5 }}>No shame in it — recovery is just today's recommendation, not a rule.</div>
              <div style={{ height: 18 }} />
            </>
          ) : (
            <>
              <div style={{ borderRadius: 22, padding: "24px 22px", background: heroGrad, color: "#fff", boxShadow: `0 14px 32px rgba(${THEMES[cur].glow},0.32)`, position: "relative", overflow: "hidden", marginBottom: 14 }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.85)" }}>{THEMES[cur].label.toUpperCase()} · {pct}%</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.22)", padding: "4px 11px", borderRadius: 999 }}>{version.label}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.8)", marginTop: 16 }}>TODAY'S VERSION WORKOUT</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, margin: "4px 0 2px", position: "relative" }}>{typeLabel}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", position: "relative" }}>{mins[0]}–{mins[1]} minutes · built for your {pct}% today</div>
              </div>

              <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 3 }}>Today's session</div>
                <div style={{ fontSize: 12.5, color: BASE.creamDim, fontStyle: "italic", marginBottom: 12 }}>{activeSession.focus}</div>
                {activeSession.slots.map((sl, i) => { const m = MOVEMENTS.find((x) => x.id === sl.pattern) || { pattern: sl.pattern, group: "" }; return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < activeSession.slots.length - 1 ? `1px solid ${BASE.border}` : "none" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(168,123,209,0.15)", color: "#A87BD1", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: BASE.cream, fontWeight: 600 }}>{m.pattern}</span>
                    <span style={{ fontSize: 10, color: BASE.taupe, textTransform: "capitalize" }}>{sl.role}</span>
                  </div>
                )})}
                <div style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 10, fontStyle: "italic" }}>Your coach picks the exact exercise for each slot from the movement library.</div>
              </div>

              <div style={{ borderRadius: 18, background: "linear-gradient(135deg,rgba(233,132,180,0.09),rgba(168,123,209,0.09))", border: "1px solid rgba(168,123,209,0.28)", padding: "18px 20px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -14, top: -14, fontSize: 54, opacity: 0.1 }}>🤍</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C9558E", marginBottom: 7, position: "relative" }}>{insightTitle}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: BASE.cream, lineHeight: 1.5, position: "relative" }}>{insightMsg}</div>
              </div>

              <button onClick={() => { setWoColor(cur); setWoKey(activeWorkout); setWoTier(activeTier); setWoType(woType2); setTrainView("workout") }} style={{ width: "100%", padding: 18, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 17, fontWeight: 800, boxShadow: "0 10px 26px rgba(168,123,209,0.4)", marginBottom: 16 }}>{isManual ? `Start ${typeLabel}` : `Start Recommended: ${typeLabel}`}</button>

              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>Or choose another workout</div>
              <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 12, lineHeight: 1.5 }}>Today's recommendation fits your capacity best, but your life is yours. Pick anything in your program — you won't fall behind.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {manualOptions.map((mo) => {
                  const isRec = mo.key === recommendedWorkout
                  const isSel = mo.key === activeWorkout
                  return (
                    <div key={mo.key} onClick={() => { setSelectedWoKey(mo.key === recommendedWorkout ? null : mo.key) }} style={{ padding: "13px 14px", borderRadius: 13, background: isSel ? "linear-gradient(135deg,rgba(233,132,180,0.16),rgba(168,123,209,0.16))" : BASE.surface, border: `1px solid ${isSel ? "#C9558E" : BASE.border}`, cursor: "pointer" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{mo.title}</div>
                      {isRec && <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: "#C9558E", textTransform: "uppercase", marginTop: 2 }}>Recommended</div>}
                      {isSel && !isRec && <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: "#C9558E", textTransform: "uppercase", marginTop: 2 }}>Selected</div>}
                    </div>
                  )
                })}
              </div>

              <div onClick={() => setWhyOpen(!whyOpen)} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 16px", cursor: "pointer", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>Why today looks different</span>
                  <span style={{ color: BASE.taupe }}>{whyOpen ? "\u2212" : "+"}</span>
                </div>
                {whyOpen && <div className="fade-in" style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginTop: 10 }}>{version.note} No guilt, no falling behind — tomorrow resumes Week {sched.week}.</div>}
              </div>
            </>
          )}

          <div style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{prog.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700 }}>{prog.name}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe }}>Week {sched.week} of {prog.weeks} · Day {sched.weekday + 1}</div>
              </div>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: BASE.surface2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctThroughWeeks}%`, background: prog.grad, borderRadius: 999 }} />
            </div>
            <button onClick={() => setTrainView("week")} style={{ width: "100%", marginTop: 14, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}>View Program</button>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: BASE.taupe, textAlign: "center", lineHeight: 1.5, marginTop: 16 }}>The program is fixed. The daily path inside each program changes with your everyday capacity.</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTrainView("library")} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>Exercise Library</button>
            <button onClick={() => { setTab("progress"); setProgressView("workouts") }} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>History</button>
            <button onClick={() => { if (confirm("Change your program? Your progress in the current one is kept, but a new program starts today.")) { persistProgram(null) } }} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>Change Program</button>
          </div>
        </div>
      )
    }
    if (tab === "body" && bodyView === "gym" && programId && trainView === "library") {
      const prog = PROG_BY_ID(programId)
      const openMove = libOpen ? MOVEMENTS.find((m) => m.id === libOpen) : null
      if (openMove) {
        const opts = openMove.levels[libLevel] || []
        return (
          <div className="fade-in" style={{ padding: "10px 18px 0" }}>
            <div onClick={() => setLibOpen(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 Movement library"}</div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: BASE.taupe, textTransform: "uppercase" }}>{openMove.group}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginTop: 2 }}>{openMove.pattern} Pattern</div>
            <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, margin: "8px 0 18px" }}>{openMove.purpose}</div>

            <div style={{ fontSize: 11, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 8 }}>In these programs</div>
            <div style={{ marginBottom: 20 }}>{openMove.programs.map((pid) => { const pp = PROG_BY_ID(pid); return (<span key={pid} style={{ display: "inline-block", padding: "5px 11px", borderRadius: 999, background: pid === programId ? "rgba(168,123,209,0.18)" : BASE.surface, border: "1px solid " + (pid === programId ? "#A87BD1" : BASE.border), color: BASE.creamDim, fontSize: 11.5, fontWeight: 600, margin: "0 6px 6px 0" }}>{pp.emoji} {pp.name}</span>)})}</div>

            <div style={{ display: "flex", gap: 6, background: BASE.surface2, borderRadius: 999, padding: 4, marginBottom: 16 }}>
              {["beginner", "intermediate", "advanced"].map((lv) => (
                <button key={lv} onClick={() => setLibLevel(lv)} style={{ flex: 1, padding: "8px 4px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: libLevel === lv ? "#fff" : "transparent", color: libLevel === lv ? "#C9558E" : BASE.taupe }}>{LEVEL_LABEL[lv]}</button>
              ))}
            </div>

            {opts.length === 0 ? (
              <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: "1px dashed " + BASE.border, textAlign: "center", color: BASE.taupe, fontSize: 13, lineHeight: 1.6 }}>No {LEVEL_LABEL[libLevel].toLowerCase()} options seeded for this pattern yet. The structure is ready — exercises get added in the next phase.</div>
            ) : opts.map((ex, i) => (
              <div key={i} style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 17px", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: BASE.cream }}>{ex.name}</div>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(233,132,180,0.08)", margin: "10px 0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#C9558E", marginBottom: 3 }}>COACH CUE</div>
                  <div style={{ fontSize: 12.5, color: BASE.cream, lineHeight: 1.5 }}>{ex.cue}</div>
                </div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.creamDim }}>Equipment:</b> {ex.equip.join(", ")}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.creamDim }}>At home:</b> {ex.home}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe }}><b style={{ color: BASE.creamDim }}>At the gym:</b> {ex.gym}</div>
                <div style={{ marginTop: 12, height: 90, borderRadius: 10, background: "linear-gradient(135deg,rgba(233,132,180,0.15),rgba(168,123,209,0.15))", display: "flex", alignItems: "center", justifyContent: "center", color: BASE.taupe, fontSize: 11, fontStyle: "italic" }}>🎬 Video guides are on the way</div>
              </div>
            ))}

            <div style={{ borderRadius: 14, background: BASE.surface, border: "1px solid " + BASE.border, padding: "14px 16px", margin: "18px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>How it adapts to your capacity</div>
              {["green", "yellow", "red", "recovery"].map((k) => (
                <div key={k} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ minWidth: 66, fontSize: 12, fontWeight: 800, color: CAPACITY_RULES[k].color }}>{CAPACITY_RULES[k].label}</span>
                  <span style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.45 }}>{openMove.capacity[k]}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", marginBottom: 18 }}>The movement never disappears when capacity changes — only the version does.</div>
          </div>
        )
      }
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setTrainView("home")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 Today's plan"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Movement library</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 22 }}>Every workout in True Reverie is built from these patterns. One library, five programs — they differ by which movements, levels, and cues they choose.</div>
          {MOVE_GROUPS.map((g) => (
            <div key={g} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#C9558E", textTransform: "uppercase", marginBottom: 10 }}>{g}</div>
              {MOVEMENTS.filter((m) => m.group === g).map((m) => {
                const inProg = m.programs.includes(programId)
                return (
                  <div key={m.id} onClick={() => { setLibOpen(m.id); setLibLevel("beginner") }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: BASE.cream }}>{m.pattern}</div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2, lineHeight: 1.4 }}>{m.purpose}</div>
                    </div>
                    {inProg && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#7FA054", background: "rgba(127,160,84,0.12)", padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>in {prog.name.split(" ")[prog.name.split(" ").length - 1]}</span>}
                    <span style={{ color: BASE.taupe, fontSize: 18 }}>{"\u203a"}</span>
                  </div>
                )
              })}
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", marginBottom: 18 }}>Architecture ready. Individual exercises and full workouts come in the next phase.</div>
        </div>
      )
    }
    if (tab === "body" && bodyView === "gym" && programId && trainView === "week") {
      const prog = PROG_BY_ID(programId)
      const sched = progSchedule(prog, programStart)
      const DAYNAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setTrainView("home")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 Today's plan"}</div>
          <div style={{ borderRadius: 20, padding: "20px 20px", background: prog.grad, color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ fontSize: 28, position: "relative" }}>{prog.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginTop: 4, position: "relative" }}>{prog.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", position: "relative" }}>Week {sched.week} of {prog.weeks}</div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "0 2px 12px" }}>This week</div>
          {(PROGRAM_SCHEDULE[programId] || prog.split).map((key, i) => {
            const isToday = i === sched.weekday
            const tmpl = WORKOUT_TEMPLATES[key]
            const rest = key === "recovery"
            const simpleNames = { walk: "Walking", "walk+mobility": "Walk + Mobility", "walk+recovery": "Walk + Recovery", "mobility+recovery": "Mobility + Recovery", mobility: "Mobility", conditioning: "Conditioning", recovery: "Recovery" }
            const label = tmpl ? tmpl.title : (simpleNames[key] || "Movement")
            const catIcon = tmpl ? "\ud83c\udfcb\ufe0f" : rest ? "\ud83c\udf19" : key.includes("walk") ? "\ud83d\udeb6" : "\ud83e\uddd8"
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: isToday ? "rgba(168,123,209,0.1)" : BASE.surface, border: `1.5px solid ${isToday ? "#A87BD1" : BASE.border}`, marginBottom: 8 }}>
                <div style={{ width: 38, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BASE.taupe, textTransform: "uppercase" }}>{DAYNAMES[i]}</div>
                  <div style={{ fontSize: 18, marginTop: 2 }}>{catIcon}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{label}</div>
                  <div style={{ fontSize: 11, color: BASE.taupe }}>{isToday ? "Today · adjusts to your capacity" : rest ? "Rest & rebuild" : tmpl ? tmpl.focus : "Movement & recovery"}</div>
                </div>
                {isToday && <button onClick={() => setTrainView("home")} style={{ padding: "7px 13px", borderRadius: 999, border: "none", cursor: "pointer", background: "#A87BD1", color: "#fff", fontSize: 11.5, fontWeight: 700 }}>Go</button>}
              </div>
            )
          })}

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "22px 2px 12px" }}>How this program grows</div>
          {(PROGRESSION[programId] || []).map((ph, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#C9558E", minWidth: 74 }}>{ph.wk}</div>
              <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{ph.note}</div>
            </div>
          ))}
          <div style={{ borderRadius: 14, background: "rgba(168,123,209,0.08)", border: "1px solid rgba(168,123,209,0.25)", padding: "16px 18px", margin: "18px 0 0", textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16.5, color: BASE.cream, lineHeight: 1.5 }}>The program is fixed. The daily path inside each program changes with your everyday capacity.</div>
            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 8 }}>You never fall behind — you only meet today where it is.</div>
          </div>
          <div style={{ height: 18 }} />
        </div>
      )
    }
    if (tab === "body" && bodyView === "gym" && programId && trainView === "workout") {
      const gymColor = woColor || cur
      const _prog = PROG_BY_ID(programId)
      const _sched = progSchedule(_prog, programStart)
      // Capacity tier: use the explicitly resolved tier passed from the selection screen when present.
      // This lets "Train anyway" below 15% correctly train the RED-day version rather than recovery or full.
      const _capKey = woTier || (pct < 15 ? "recovery" : gymColor)
      const _phase = phaseFor(programId, _sched.week)
      // Build from the explicitly chosen workout (woKey) when present; otherwise today's scheduled session.
      const _tpl = woKey && WORKOUT_TEMPLATES[woKey] ? WORKOUT_TEMPLATES[woKey] : null
      const _session = _tpl ? { slots: _tpl.slots, title: _tpl.title, focus: _tpl.focus } : buildSession(programId, _sched.weekday, _capKey)
      const _resolved = resolveSession(_session, woEnv, _capKey, _phase, programId)
      const _fallback = { title: _session.title || "Workout", note: _session.focus || "", exercises: [] }
      const wo = (_resolved && _resolved.length)
        ? { title: _session.title, note: _session.focus, exercises: _resolved }
        : _fallback
      const suggestion = cycleNow ? PHASE_SUGGESTION[cycleNow.phase] : null
      const setKey = (i, sx) => woType + "|" + gymColor + "|" + i + "|" + sx
      const toggleSet = (i, sx) => setWoDone((prev) => ({ ...prev, [setKey(i, sx)]: !prev[setKey(i, sx)] }))
      const todayISO = new Date().toISOString().slice(0, 10)
      const weekday = (new Date().getDay() + 6) % 7
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekday); weekStart.setHours(0,0,0,0)
      const thisWeek = woLog.filter((w) => new Date(w.date + "T12:00:00") >= weekStart)
      const loggedToday = woLogged || woLog.some((w) => w.date === todayISO)
      const dayDone = (idx) => {
        const d = new Date(weekStart); d.setDate(weekStart.getDate() + idx)
        const iso = d.toISOString().slice(0, 10)
        return woLog.some((w) => w.date === iso)
      }
      const finishWorkout = () => {
        const entry = { date: todayISO, type: woType, color: gymColor, program: programId, sets: doneSets }
        const next = [...woLog.filter((w) => w.date !== todayISO), entry]
        setWoLog(next); setWoLogged(true)
        try { localStorage.setItem("nr_workout_log", JSON.stringify(next)) } catch (e) {}
        // Cross-device sync (best-effort; localStorage stays the instant layer)
        if (user && db) {
          try {
            db.from("workouts").upsert(
              { user_id: user.id, date: todayISO, program: programId, workout_type: woType, color: gymColor, sets_done: doneSets },
              { onConflict: "user_id,date" }
            ).then(() => {})
          } catch (e) {}
        }
      }
      const totalSets = wo.exercises.reduce((a, e) => a + e.sets, 0)
      const doneSets = wo.exercises.reduce((a, e, i) => a + Array.from({ length: e.sets }).filter((_, sx) => woDone[setKey(i, sx)]).length, 0)
      return (
        <div style={{ padding: "8px 18px 0" }}>
          <div onClick={() => setTrainView("home")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 8 }}>{"\u2039 Today's plan"}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, textAlign: "center", margin: "6px 0 2px" }}>{(WO_TYPES.find((t) => t.key === woType) || {label: "Workout"}).label}</h2>
          <p style={{ textAlign: "center", color: BASE.taupe, fontSize: 12, margin: "0 0 12px" }}>{thisWeek.length} workout{thisWeek.length === 1 ? "" : "s"} this week</p>

          <div style={{ display: "flex", gap: 6, background: BASE.surface2, borderRadius: 999, padding: 4, marginBottom: 10 }}>
            {[["overview", "Overview"], ["guided", "Guided"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setWoMode(k); setGuidedIdx(0) }} style={{ flex: 1, padding: "9px 4px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: woMode === k ? "#fff" : "transparent", color: woMode === k ? "#C9558E" : BASE.taupe, boxShadow: woMode === k ? "0 2px 8px rgba(120,80,130,0.12)" : "none" }}>{lbl === "Guided" ? "\ud83c\udfac Guided" : lbl}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["homeBeginner", "Home"], ["homeEquip", "Home + weights"], ["gym", "Gym"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setWoEnv(k)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: woEnv === k ? "rgba(168,123,209,0.15)" : BASE.surface, color: woEnv === k ? "#A87BD1" : BASE.taupe, border: `1px solid ${woEnv === k ? "#A87BD1" : BASE.border}` }}>{lbl}</button>
            ))}
          </div>

          {woMode === "guided" ? (() => {
            const ex = wo.exercises[guidedIdx]
            const coach = coachData(ex)
            const encourageLine = coach.encourage[guidedIdx % coach.encourage.length]
            const total = wo.exercises.length
            const exDone = Array.from({ length: ex.sets }).filter((_, sx) => woDone[setKey(guidedIdx, sx)]).length
            const allSetsDone = exDone >= ex.sets
            const completeSet = () => {
              const nextSx = Array.from({ length: ex.sets }).findIndex((_, sx) => !woDone[setKey(guidedIdx, sx)])
              if (nextSx >= 0) { toggleSet(guidedIdx, nextSx); setRestLeft(60) }
            }
            const fmt = (n) => Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0")
            return (
              <div className="fade-in">
                <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
                  {wo.exercises.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < guidedIdx ? "#A87BD1" : i === guidedIdx ? "#E984B4" : BASE.surface2 }} />
                  ))}
                </div>
                <div style={{ textAlign: "center", fontSize: 11, color: BASE.taupe, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>EXERCISE {guidedIdx + 1} OF {total}</div>

                <div style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 12px 30px rgba(120,80,130,0.16)", marginBottom: 16 }}>
                  <div style={{ height: 200, background: "linear-gradient(135deg,#E984B4,#A87BD1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.9)" }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px" }}><circle cx="12" cy="7" r="3.2" fill="rgba(255,255,255,0.9)"/><path d="M5 21 C 5 16, 8 14, 12 14 C 16 14, 19 16, 19 21 Z" fill="rgba(255,255,255,0.9)"/></svg>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>YOUR COACH</div>
                      <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>Video guide on the way</div>
                    </div>
                    <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>{encourageLine}</div>
                  </div>
                  <div style={{ padding: "20px 20px", background: BASE.surface }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, color: BASE.cream }}>{ex.name}</div>
                    <div style={{ fontSize: 12.5, color: BASE.creamDim, fontStyle: "italic", lineHeight: 1.5, marginTop: 6 }}>{coach.intro}</div>
                    <div style={{ display: "flex", gap: 20, margin: "12px 0 14px" }}>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#C9558E" }}>{ex.sets}</div><div style={{ fontSize: 10.5, color: BASE.taupe, letterSpacing: 1 }}>SETS</div></div>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#C9558E" }}>{ex.reps}</div><div style={{ fontSize: 10.5, color: BASE.taupe, letterSpacing: 1 }}>REPS</div></div>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#7FA054" }}>{exDone}/{ex.sets}</div><div style={{ fontSize: 10.5, color: BASE.taupe, letterSpacing: 1 }}>DONE</div></div>
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(233,132,180,0.1)", marginBottom: 12 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#C9558E", letterSpacing: 1, marginBottom: 3 }}>COACH CUE</div>
                      <div style={{ fontSize: 13, color: BASE.cream, lineHeight: 1.5 }}>{coach.cue}</div>
                    </div>
                    <details style={{ marginBottom: 8 }}>
                      <summary style={{ fontSize: 12.5, fontWeight: 700, color: BASE.creamDim, cursor: "pointer" }}>Common mistakes</summary>
                      <div style={{ marginTop: 8 }}>{coach.mistakes.map((mk, mi) => (<div key={mi} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ color: "#D65C4E", fontSize: 12 }}>{"\u2022"}</span><span style={{ fontSize: 12, color: BASE.taupe, lineHeight: 1.5 }}>{mk}</span></div>))}</div>
                    </details>
                    <details style={{ marginBottom: 8 }}>
                      <summary style={{ fontSize: 12.5, fontWeight: 700, color: BASE.creamDim, cursor: "pointer" }}>Modifications & equipment</summary>
                      <div style={{ fontSize: 12, color: BASE.taupe, lineHeight: 1.6, marginTop: 8 }}>Too much today? Do fewer reps or an easier range — the movement still counts. No equipment? Swap for a bodyweight or household version. Use the Home / Gym toggle to switch the whole workout.</div>
                    </details>
                    {ex.how && (
                      <details><summary style={{ fontSize: 12.5, fontWeight: 700, color: BASE.creamDim, cursor: "pointer" }}>How to</summary>
                        <div style={{ marginTop: 8 }}>{ex.how.map((st, hi) => (<div key={hi} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ minWidth: 16, height: 16, borderRadius: "50%", background: "rgba(201,85,142,0.15)", color: "#C9558E", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{hi + 1}</span><span style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.5 }}>{st}</span></div>))}</div>
                      </details>
                    )}
                  </div>
                </div>

                {restLeft > 0 ? (
                  <div className="fade-in" style={{ textAlign: "center", padding: "18px", borderRadius: 16, background: "rgba(168,123,209,0.1)", border: "1px solid rgba(168,123,209,0.3)", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#A87BD1", fontWeight: 700, letterSpacing: 1 }}>REST</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#8A6FA8", margin: "2px 0" }}>{fmt(restLeft)}</div>
                    <div style={{ fontSize: 12, color: BASE.taupe }}>One more set, then you've earned your rest. <span onClick={() => setRestLeft(0)} style={{ color: "#C9558E", fontWeight: 700, cursor: "pointer" }}>Skip</span></div>
                  </div>
                ) : (
                  <button onClick={completeSet} disabled={allSetsDone} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: allSetsDone ? "default" : "pointer", background: allSetsDone ? "rgba(127,160,84,0.15)" : "linear-gradient(135deg,#E984B4,#A87BD1)", color: allSetsDone ? "#7FA054" : "#fff", fontSize: 15, fontWeight: 800, boxShadow: allSetsDone ? "none" : "0 8px 22px rgba(168,123,209,0.35)", marginBottom: 14 }}>{allSetsDone ? "All sets complete \u2713" : `Complete set ${exDone + 1} of ${ex.sets}`}</button>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setGuidedIdx(Math.max(0, guidedIdx - 1)); setRestLeft(0) }} disabled={guidedIdx === 0} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${BASE.border}`, background: "transparent", color: guidedIdx === 0 ? BASE.taupe : BASE.creamDim, cursor: guidedIdx === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: guidedIdx === 0 ? 0.4 : 1 }}>{"\u2039 Previous"}</button>
                  {guidedIdx < total - 1 ? (
                    <button onClick={() => { setGuidedIdx(guidedIdx + 1); setRestLeft(0) }} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#A87BD1", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{"Next \u203a"}</button>
                  ) : (
                    <button onClick={finishWorkout} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#93B061,#66883E)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Finish {"\u2713"}</button>
                  )}
                </div>
                <div style={{ height: 20 }} />
              </div>
            )
          })() : (
          <>
          <div style={{ padding: "20px 20px", borderRadius: 22, background: HERO_GRAD[gymColor], marginBottom: 16, boxShadow: `0 10px 26px rgba(${THEMES[gymColor].glow},0.35)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{THEMES[gymColor].label} · {wo.title}</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", background: "rgba(255,255,255,0.22)", padding: "5px 12px", borderRadius: 999 }}>~{Math.max(15, wo.exercises.length * 6)} min</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "#FFFFFF", margin: "10px 0 4px", lineHeight: 1.1, position: "relative" }}>{wo.title}</div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.92)", margin: "0 0 14px", lineHeight: 1.5, position: "relative" }}>{wo.note}</p>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.25)", overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${totalSets ? Math.round((doneSets / totalSets) * 100) : 0}%`, background: "#FFFFFF", borderRadius: 999, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", marginTop: 6, fontWeight: 800, position: "relative" }}>{doneSets} / {totalSets} sets complete</div>
          </div>

          {wo.exercises.map((ex, i) => {
            const open = woOpen === i
            const how = ex.how || []
            return (
              <div key={i} style={{ padding: "13px 15px", borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, boxShadow: "0 2px 10px rgba(74,44,56,0.04)" }}>
                <div onClick={() => setWoOpen(open ? null : i)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 14.5, color: BASE.cream, fontWeight: 700 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: THEMES[gymColor].accent, fontWeight: 700, whiteSpace: "nowrap" }}>{ex.sets > 1 ? ex.sets + " x " + ex.reps : ex.reps}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 3, lineHeight: 1.45 }}>{ex.cue} <span style={{ color: BASE.terracotta, fontWeight: 700 }}>{open ? "\u2212 close" : "+ how to"}</span></div>
                </div>
                {open && (
                  <div className="fade-in" style={{ marginTop: 10, padding: "11px 13px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}` }}>
                    {how.map((step, si) => (
                      <div key={si} style={{ display: "flex", gap: 9, marginBottom: si === how.length - 1 ? 0 : 7 }}>
                        <span style={{ minWidth: 18, height: 18, borderRadius: "50%", background: THEMES[gymColor].tint, color: THEMES[gymColor].accent, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{si + 1}</span>
                        <span style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                    <a href={demoLink(ex.name)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 11.5, fontWeight: 800, color: BASE.terracotta }}>Watch a demo ↗</a>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {Array.from({ length: ex.sets }).map((_, sx) => {
                    const done = !!woDone[setKey(i, sx)]
                    return (
                      <div key={sx} onClick={() => toggleSet(i, sx)} style={{ width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, background: done ? THEMES[gymColor].accent : "transparent", color: done ? "#FFFFFF" : BASE.taupe, border: `1.5px solid ${done ? THEMES[gymColor].accent : BASE.border}`, transition: "all 0.15s ease" }}>{done ? "\u2713" : sx + 1}</div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {!loggedToday ? (
            <button onClick={finishWorkout} style={{ width: "100%", marginTop: 8, padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: THEMES[gymColor].accent, color: "#FFFFFF", fontSize: 15, fontWeight: 800 }}>Finish workout {"\u2713"}</button>
          ) : (
            <div className="fade-in" style={{ marginTop: 8, padding: 14, borderRadius: 14, background: THEMES[gymColor].tint, border: `1px solid rgba(${THEMES[gymColor].glow},0.4)`, textAlign: "center", color: THEMES[gymColor].accent, fontSize: 14, fontWeight: 800 }}>Logged for today {"\u2713"} {"\u2014"} that fully counted</div>
          )}

          <p style={{ fontSize: 10.5, color: BASE.taupe, textAlign: "center", margin: "16px 0 0", lineHeight: 1.5 }}>General fitness guidance, not medical advice. Especially if you're postpartum, healing, or managing a condition - move within your provider's guidance.</p>
          </>
          )}
        </div>
      )
    }
  return null
}
