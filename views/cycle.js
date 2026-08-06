import { CYCLE_PHASES, CYCLE_PHASE_ORDER, computeCycle } from '../data/cycle'
import { CYCLE_DEEP, CYCLE_QA, CYCLE_CONDITIONS, CYCLE_POSTPARTUM, CYCLE_BC, CYCLE_FERTILITY } from '../data/cyclelearn'
import { db } from '../lib/supabase'
import { BASE } from '../lib/theme'

export function renderCycle(ctx) {
  const { T, bodyView, cur, cycArticle, cycLib, cycleLength, cycleMonth, cycleNow, editCycle, eduPhase, history, lastPeriod, pct, periodDismissed, recovery, saveCycle, setCycArticle, setCycLib, setCycleMonth, setEditCycle, setEduPhase, setLastPeriod, setPeriodDismissed, setTmpLen, setTmpStart, setupData, tab, tmpLen, tmpStart, user } = ctx
    // ── an article from Understand Your Body ──
    if (tab === "body" && bodyView === "cycle" && cycArticle) {
      const a = cycArticle
      const Block = ({ label, children, col }) => (
        <>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: col || "#C9558E", margin: "24px 0 10px" }}>{label}</div>
          {children}
        </>
      )
      const Bullets = ({ items, col }) => items.map((x, i) => (
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: col || "#C9558E", marginTop: 8, flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{x}</span>
        </div>
      ))
      const Para = ({ children }) => <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.68, marginBottom: 14 }}>{children}</div>

      return (
        <div className="fade-in" style={{ padding: "10px 20px 0" }}>
          <div onClick={() => setCycArticle(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 Understand Your Body"}</div>
          <div style={{ fontSize: 30 }}>{a.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, color: BASE.cream, marginTop: 4, lineHeight: 1.18 }}>{a.title}</div>
          {a.desc && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 8, lineHeight: 1.5 }}>{a.desc}</div>}

          {/* phase pages */}
          {a.hormones && <Block label="What's happening"><Para>{a.hormones}</Para></Block>}
          {a.notice && <Block label="What many women notice"><Bullets items={a.notice} /></Block>}
          {a.symptoms && !a.what && <Block label="Common symptoms"><Bullets items={a.symptoms} /></Block>}
          {a.support && <Block label="Helpful support"><Bullets items={a.support} col="#7FA054" /></Block>}
          {a.move && <Block label="Movement"><Para>{a.move}</Para></Block>}
          {a.food && <Block label="Nutrition"><Para>{a.food}</Para></Block>}

          {/* condition and birth-control pages */}
          {a.what && <Block label="What it is"><Para>{a.what}</Para></Block>}
          {a.what && a.symptoms && <Block label="Common symptoms"><Bullets items={a.symptoms} /></Block>}
          {a.good && <Block label="What it's good for"><Bullets items={a.good} col="#7FA054" /></Block>}
          {a.consider && <Block label="Worth considering"><Bullets items={a.consider} col="#E8B84B" /></Block>}
          {a.help && <Block label="What helps"><Bullets items={a.help} col="#7FA054" /></Block>}

          {/* plain articles */}
          {a.body && a.body.map((para, i) => <Para key={i}>{para}</Para>)}

          {/* when to seek care — always last, always visible */}
          {a.seek && (
            <div style={{ borderRadius: 16, background: "rgba(214,92,78,0.09)", border: "1px solid rgba(214,92,78,0.3)", padding: "16px 18px", marginTop: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#D65C4E", marginBottom: 8 }}>When to seek care</div>
              {Array.isArray(a.seek)
                ? a.seek.map((x, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, marginBottom: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D65C4E", marginTop: 8, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55 }}>{x}</span>
                    </div>
                  ))
                : <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6 }}>{a.seek}</div>}
            </div>
          )}

          {(a.tip || a.note) && (
            <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A nurse's note</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, lineHeight: 1.45 }}>{a.tip || a.note}</div>
            </div>
          )}

          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, margin: "18px 0 26px" }}>General education, not medical advice.</div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "cycle") {
      const setup = cycleNow != null
      const now = new Date()
      const viewDate = new Date(now.getFullYear(), now.getMonth() + cycleMonth, 1)
      const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
      const startWeekday = (firstDay.getDay() + 6) % 7 // Mon=0
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
      const todayISOstr = now.toISOString().slice(0, 10)
      const cells = []
      for (let i = 0; i < startWeekday; i++) cells.push(null)
      for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
      const cur = cycleNow ? CYCLE_PHASES[cycleNow.phase] : null
      // Actual logged capacity by date (from check-in history) — the second overlay layer.
      const capByDate = {}
      history.forEach((h) => { if (h.dateISO && h.color) capByDate[h.dateISO] = h.color })
      const CAP_DOT = { red: "#D65C4E", yellow: "#E8B84B", green: "#7FA054" }
      // "Tracking from" line
      const trackFrom = lastPeriod ? new Date(lastPeriod + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null
      // Period check-in: is a new period likely due? (cycle day rolled back near 1)
      const periodDue = cycleNow && cycleNow.day >= (cycleNow.length - 1) && !periodDismissed
      // Four-phase capacity analysis (observation only, never prediction or prescription).
      // Each check-in is assigned to the phase that was active ON ITS DATE via computeCycle,
      // so editing cycle dates automatically re-buckets history on next render (rule 7).
      const PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"]
      const PHASE_LABEL = { menstrual: "Menstrual", follicular: "Follicular", ovulation: "Ovulatory", luteal: "Luteal" }
      const PHASE_MIN = 3 // minimum check-ins in a phase before we describe it as a pattern
      const phaseStats = { menstrual: { n: 0, sum: 0, colors: {} }, follicular: { n: 0, sum: 0, colors: {} }, ovulation: { n: 0, sum: 0, colors: {} }, luteal: { n: 0, sum: 0, colors: {} } }
      let analyzedTotal = 0
      history.forEach((h) => {
        if (!h.dateISO || !h.color) return
        const cc = computeCycle(cycleLength, lastPeriod, new Date(h.dateISO + "T00:00:00"))
        if (!cc || !phaseStats[cc.phase]) return
        const st = phaseStats[cc.phase]
        st.n++
        if (typeof h.pct === "number") st.sum += h.pct
        // Derive a display tier that includes Recovery (<15%) as its own bucket
        const tier = (typeof h.pct === "number" && h.pct < 15) ? "recovery" : h.color
        st.colors[tier] = (st.colors[tier] || 0) + 1
        analyzedTotal++
      })
      const CAP_WORD = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
      const CAP_COLOR = { green: "#7FA054", yellow: "#E8B84B", red: "#D65C4E", recovery: "#A87BD1" }
      const phaseAvg = (ph) => { const st = phaseStats[ph]; return st.n ? Math.round(st.sum / st.n) : null }
      const phaseTop = (ph) => { const c = phaseStats[ph].colors; const keys = Object.keys(c); if (!keys.length) return null; return keys.sort((a, b) => c[b] - c[a])[0] }
      const phasesWithEnough = PHASE_KEYS.filter((p) => phaseStats[p].n >= PHASE_MIN)
      const allFourReady = phasesWithEnough.length === 4
      // Build the narrative summary comparing phases (only among phases with enough data)
      const buildSummary = () => {
        if (!phasesWithEnough.length) return null
        const ranked = [...phasesWithEnough].sort((a, b) => phaseAvg(b) - phaseAvg(a))
        const highest = ranked[0], lowest = ranked[ranked.length - 1]
        if (phasesWithEnough.length >= 2 && phaseAvg(highest) !== phaseAvg(lowest)) {
          return `So far, your check-ins suggest your capacity has tended to run highest during your ${PHASE_LABEL[highest].toLowerCase()} phase and lowest during your ${PHASE_LABEL[lowest].toLowerCase()} phase.`
        }
        return `So far, your capacity has looked relatively steady across the phases you've logged. Keep checking in to see how your rhythm develops.`
      }
      const patternSummary = buildSummary()

      if (!setup) {
        return (
          <div className="fade-in" style={{ padding: "10px 18px 0" }}>
            {editCycle && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(43,27,61,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditCycle(false)}>
                <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: BASE.bg2 || "#FFF9F5", borderRadius: 22, padding: "24px 22px", boxShadow: "0 20px 50px rgba(43,27,61,0.4)" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>Set up your cycle</div>
                  <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.5, marginBottom: 18 }}>This stays private and is only ever context — never a limit.</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>First day of your last period</div>
                  <input type="date" value={tmpStart} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setTmpStart(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, color: BASE.cream, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>Average cycle length: {tmpLen} days</div>
                  <input type="range" min="20" max="45" value={tmpLen} onChange={(e) => setTmpLen(e.target.value)} style={{ width: "100%", marginBottom: 4 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: BASE.taupe, marginBottom: 20 }}><span>20</span><span>45</span></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setEditCycle(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>Cancel</button>
                    <button onClick={saveCycle} disabled={!tmpStart} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", cursor: tmpStart ? "pointer" : "default", background: tmpStart ? "linear-gradient(135deg,#9B6BC3,#5E7FB0)" : BASE.surface2, color: tmpStart ? "#fff" : BASE.taupe, fontSize: 13.5, fontWeight: 700 }}>Save</button>
                  </div>
                  <div onClick={() => { const iso = new Date().toISOString().slice(0, 10); setTmpStart(iso) }} style={{ textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 700, color: "#9B6BC3", cursor: "pointer" }}>My period started today {"\u2192"}</div>
                </div>
              </div>
            )}
            <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
              <div style={{ fontSize: 30 }}>🌙</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginTop: 6 }}>Understand your rhythm. Support your body.</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", marginTop: 6, fontStyle: "italic" }}>Your cycle is information — not a limitation.</div>
            </div>
            <div style={{ textAlign: "center", padding: "26px 20px", borderRadius: 18, background: BASE.surface, border: "1px dashed " + BASE.border }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: BASE.cream, marginBottom: 8 }}>Set up your cycle</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Add your typical cycle length and the start date of your last period, and Cycle will map your phases. This stays private and is only ever context — never a limit.</div>
              <button onClick={() => { setTmpLen("28"); setTmpStart(""); setEditCycle(true) }} style={{ padding: "12px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", fontSize: 13.5, fontWeight: 700 }}>Set up my cycle</button>
            </div>
          </div>
        )
      }

      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          {editCycle && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(43,27,61,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditCycle(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: BASE.bg2 || "#FFF9F5", borderRadius: 22, padding: "24px 22px", boxShadow: "0 20px 50px rgba(43,27,61,0.4)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>Edit your cycle</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.5, marginBottom: 18 }}>Update these anytime your cycle changes. You're always in control of this.</div>

                <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>First day of your last period</div>
                <input type="date" value={tmpStart} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setTmpStart(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, color: BASE.cream, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />

                <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>Average cycle length: {tmpLen} days</div>
                <input type="range" min="20" max="45" value={tmpLen} onChange={(e) => setTmpLen(e.target.value)} style={{ width: "100%", marginBottom: 4 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: BASE.taupe, marginBottom: 20 }}><span>20</span><span>45</span></div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setEditCycle(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>Cancel</button>
                  <button onClick={saveCycle} disabled={!tmpStart} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", cursor: tmpStart ? "pointer" : "default", background: tmpStart ? "linear-gradient(135deg,#9B6BC3,#5E7FB0)" : BASE.surface2, color: tmpStart ? "#fff" : BASE.taupe, fontSize: 13.5, fontWeight: 700 }}>Save</button>
                </div>
                <div onClick={() => { const iso = new Date().toISOString().slice(0, 10); setTmpStart(iso) }} style={{ textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 700, color: "#9B6BC3", cursor: "pointer" }}>My period started today {"\u2192"}</div>
              </div>
            </div>
          )}
          <div style={{ borderRadius: 22, padding: "24px 22px", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ fontSize: 28 }}>🌙</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>Understand your rhythm. Support your body.</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.92)", marginTop: 6, fontStyle: "italic" }}>Your cycle is information — not a limitation.</div>
            <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setEditCycle(true) }} style={{ marginTop: 14, padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{"\u2699\ufe0f Edit Cycle"}</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => setCycleMonth(cycleMonth - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: BASE.taupe, fontSize: 18, padding: "0 8px" }}>{"\u2039"}</button>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>{monthLabel}</div>
            <button onClick={() => setCycleMonth(cycleMonth + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: BASE.taupe, fontSize: 18, padding: "0 8px" }}>{"\u203a"}</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (<div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: BASE.taupe }}>{d}</div>))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 14 }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />
              const iso = cell.toISOString().slice(0, 10)
              const c = computeCycle(cycleLength, lastPeriod, cell)
              const ph = c ? CYCLE_PHASES[c.phase] : null
              const isToday = iso === todayISOstr
              const capColor = capByDate[iso]
              const isPast = cell <= now
              return (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 9, background: ph ? ph.soft : "transparent", border: isToday ? "2px solid " + (ph ? ph.color : "#C9558E") : "1px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: ph ? ph.color : BASE.taupe }}>{cell.getDate()}</div>
                  {c && <div style={{ fontSize: 7.5, color: ph.color, opacity: 0.8 }}>d{c.day}</div>}
                  <div style={{ position: "absolute", top: 3, right: 3, width: 6, height: 6, borderRadius: "50%", background: capColor ? CAP_DOT[capColor] : "transparent", border: capColor ? "none" : (isPast ? "1px solid rgba(150,140,150,0.35)" : "none") }} />
                </div>
              )
            })}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, justifyContent: "center" }}>
            {CYCLE_PHASE_ORDER.map((k) => { const ph = CYCLE_PHASES[k]; return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: ph.color }} /><span style={{ fontSize: 10.5, color: BASE.taupe }}>{ph.name.replace(" Phase", "")}</span></div>
            )})}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12, justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: BASE.taupe, fontWeight: 700 }}>Your capacity:</span>
            {[["green", "Green"], ["yellow", "Yellow"], ["red", "Red"]].map(([k, lbl]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: CAP_DOT[k] }} /><span style={{ fontSize: 10, color: BASE.taupe }}>{lbl}</span></div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", border: "1px solid rgba(150,140,150,0.5)" }} /><span style={{ fontSize: 10, color: BASE.taupe }}>No check-in</span></div>
          </div>
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", lineHeight: 1.5, marginBottom: 6 }}>Two layers: the day's color is your estimated cycle phase, the dot is the capacity you actually logged. Over time, your own patterns show themselves.</div>
          {trackFrom && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, color: BASE.taupe }}>Tracking from: <b style={{ color: BASE.creamDim }}>{trackFrom}</b> {"\u00b7"} {cycleNow.length}-day cycle</div>
                <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setEditCycle(true) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B6BC3", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{"\u270f\ufe0f Edit"}</button>
              </div>
              <button onClick={() => { const iso = new Date().toISOString().slice(0, 10); setLastPeriod(iso); try { window.localStorage.setItem("cap_last_period", iso) } catch (e) {}; if (user && db) { try { db.from("profiles").update({ setup: { ...(setupData || {}), lastPeriod: iso } }).eq("id", user.id).then(() => {}) } catch (e) {} }; setPeriodDismissed(true) }} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px dashed rgba(155,107,195,0.4)", background: "rgba(155,107,195,0.06)", color: "#9B6BC3", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{"\ud83c\udf19 My period started today"}</button>
            </div>
          )}

          {periodDue && (
            <div style={{ borderRadius: 16, background: "rgba(155,107,195,0.1)", border: "1px solid rgba(155,107,195,0.35)", padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream, marginBottom: 3 }}>Did your period start today?</div>
              <div style={{ fontSize: 12, color: BASE.taupe, marginBottom: 12, lineHeight: 1.5 }}>One tap keeps your calendar accurate — no digging through settings.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { const iso = new Date().toISOString().slice(0, 10); setLastPeriod(iso); try { window.localStorage.setItem("cap_last_period", iso) } catch (e) {}; if (user && db) { try { db.from("profiles").update({ setup: { ...(setupData || {}), lastPeriod: iso } }).eq("id", user.id).then(() => {}) } catch (e) {} } }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", fontSize: 13, fontWeight: 700 }}>Yes, today</button>
                <button onClick={() => { setPeriodDismissed(true) }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Not yet</button>
              </div>
            </div>
          )}

          <div style={{ borderRadius: 18, background: cur.soft, border: "1px solid " + cur.color, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: cur.color, textTransform: "uppercase" }}>Cycle Day {cycleNow.day}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: BASE.cream, margin: "2px 0 8px" }}>{cur.emoji} {cur.name}</div>
            <div style={{ fontSize: 13.5, color: BASE.cream, lineHeight: 1.5, marginBottom: 12 }}>{cur.insight}</div>
            {(cur.feels || []).length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: cur.color, margin: "4px 0 8px" }}>Your body may naturally feel</div>
                {cur.feels.map((f, i) => (<div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: cur.color, marginTop: 7, flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{f}</span></div>))}
              </>
            )}
            {(cur.supportToday || cur.suggestions).length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: cur.color, margin: "14px 0 8px" }}>Support yourself today</div>
                {(cur.supportToday || cur.suggestions).map((sg, i) => (<div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: cur.color, marginTop: 7, flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{sg}</span></div>))}
              </>
            )}
            {cur.nurseNote && (
              <div style={{ borderRadius: 13, background: "rgba(255,255,255,0.06)", padding: "13px 15px", marginTop: 14 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: cur.color, marginBottom: 5 }}>A nurse's note</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.cream, lineHeight: 1.45 }}>{cur.nurseNote}</div>
              </div>
            )}
          </div>

          {cycleNow.phase === "menstrual" && cycleNow.day <= 2 && (
            <div style={{ borderRadius: 18, background: "linear-gradient(135deg,rgba(201,123,168,0.14),rgba(126,94,158,0.14))", border: "1px solid rgba(201,123,168,0.3)", padding: "18px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 20 }}>🍫</span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: BASE.cream }}>A Little Comfort</span></div>
              <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 10 }}>Your body is asking for care today. Enjoyment and nourishment can both be part of wellness.</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{["A favorite sweet treat", "A warm drink", "A comfort meal"].map((it, i) => (<span key={i} style={{ fontSize: 11.5, color: "#B36B93", background: "rgba(201,123,168,0.12)", padding: "5px 11px", borderRadius: 999 }}>{it}</span>))}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: "#B36B93" }}>Pleasure is part of taking care of yourself.</div>
            </div>
          )}

          <div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 16 }}>🔄</span><span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>Your cycle is one piece of your capacity picture.</span></div>
            <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55 }}>Sleep, stress, motherhood, work, life demands, and recovery all matter too. Cycle offers context — but you always choose your capacity for the day. Nothing here is assigned for you.</div>
          </div>

          {/* ── UNDERSTAND YOUR BODY ── */}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Understand Your Body</div>
          <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55, marginBottom: 16 }}>Written to help you understand what you're feeling — never to worry you.</div>

          {[["🌙", "Your Cycle", "What happens in each phase", CYCLE_DEEP],
            ["🤍", "Common Questions", "The things women actually search", CYCLE_QA],
            ["🌸", "Health Conditions", "PCOS, endometriosis, PMDD and more", CYCLE_CONDITIONS],
            ["👶", "Postpartum", "What's normal, and when to call", CYCLE_POSTPARTUM],
            ["💊", "Birth Control", "Understanding your options", CYCLE_BC],
            ["🌱", "Fertility", "Ovulation and your fertile window", CYCLE_FERTILITY]].map(([ic, name, sub, items]) => {
            const open = cycLib === name
            return (
              <div key={name} style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 9, overflow: "hidden" }}>
                <div onClick={() => setCycLib(open ? null : name)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", cursor: "pointer" }}>
                  <span style={{ fontSize: 20 }}>{ic}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>{sub}</div>
                  </div>
                  <span style={{ color: BASE.taupe, fontSize: 15, transform: open ? "rotate(90deg)" : "none", transition: "transform 0.22s ease" }}>{"\u203a"}</span>
                </div>
                {open && (
                  <div className="fade-in" style={{ padding: "0 12px 12px" }}>
                    {items.map((it) => (
                      <div key={it.id} onClick={() => setCycArticle(it)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid " + BASE.border, marginBottom: 7, cursor: "pointer" }}>
                        <span style={{ fontSize: 17 }}>{it.ic}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream, lineHeight: 1.3 }}>{it.title}</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 11.5, color: BASE.taupe, marginTop: 2 }}>{it.desc}</div>
                        </div>
                        <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, margin: "14px 0 20px" }}>General education, not medical advice. Your provider knows your situation best.</div>

          <div style={{ height: 20 }} />
        </div>
      )
    }
  return null
}
