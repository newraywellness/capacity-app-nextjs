import { CYCLE_PHASES, CYCLE_PHASE_ORDER, computeCycle } from '../data/cycle'
import { CYCLE_DEEP, CYCLE_QA, CYCLE_CONDITIONS, CYCLE_POSTPARTUM, CYCLE_BC, CYCLE_FERTILITY } from '../data/cyclelearn'
import { db } from '../lib/supabase'
import { BASE } from '../lib/theme'

export function renderCycle(ctx) {
  const { T, bodyView, cur, cycArticle, cycLib, cycLogDate, cycleAvg, cycleLength, cycleLogs, cycleMonth, cycleNow, editCycle, eduPhase, effCycleLength, history, lastPeriod, pct, periodDismissed, recovery, saveCycle, saveCycleLog, saveCycleSettings, setCycArticle, setCycLib, setCycLogDate, setCycleMonth, setEditCycle, setEduPhase, setLastPeriod, setPeriodDismissed, setTmpLen, setTmpStart, setUseAvgCycle, setupData, tab, tmpLen, tmpStart, useAvgCycle, user } = ctx

  // ══════════════ TRACK ══════════════
  if (tab === "body" && bodyView === "cycle" && editCycle) {
    const today = new Date().toISOString().slice(0, 10)
    const d = cycLogDate || today
    const log = (cycleLogs && cycleLogs[d]) || {}
    const set = (k, v) => saveCycleLog(d, { [k]: v })
    const one = (k, v) => set(k, log[k] === v ? null : v)
    const many = (k, v) => {
      const arr = Array.isArray(log[k]) ? log[k] : []
      set(k, arr.indexOf(v) >= 0 ? arr.filter((x) => x !== v) : [...arr, v])
    }
    const on = (k, v) => (Array.isArray(log[k]) ? log[k].indexOf(v) >= 0 : log[k] === v)

    const Group = ({ ic, label, k, opts, multi, col, hint }) => (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 15 }}>{ic}</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{label}</span>
          {hint && <span style={{ fontSize: 10.5, color: BASE.taupe, fontStyle: "italic" }}>{hint}</span>}
        </div>
        <div>
          {opts.map((o) => (
            <span key={o} onClick={() => (multi ? many(k, o) : one(k, o))}
              style={{
                display: "inline-block", padding: "10px 16px", borderRadius: 999, marginRight: 8, marginBottom: 9, cursor: "pointer",
                fontSize: 13, fontWeight: on(k, o) ? 700 : 500,
                background: on(k, o) ? (col || "#9B6BC3") : BASE.surface,
                color: on(k, o) ? "#fff" : BASE.creamDim,
                border: "1px solid " + (on(k, o) ? (col || "#9B6BC3") : BASE.border),
                boxShadow: on(k, o) ? "0 2px 8px " + (col || "#9B6BC3") + "40" : "none",
                transform: on(k, o) ? "translateY(-1px)" : "none",
                transition: "transform .16s ease, box-shadow .16s ease"
              }}>{o}</span>
          ))}
        </div>
      </div>
    )

    const shift = (n) => {
      const dt = new Date(d + "T00:00:00")
      dt.setDate(dt.getDate() + n)
      const iso = dt.toISOString().slice(0, 10)
      if (iso <= today) setCycLogDate(iso)
    }
    const label = new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    const count = Object.keys(log).length
    const lenPct = Math.max(0, Math.min(100, ((parseInt(tmpLen) || 28) - 20) / 25 * 100))

    return (
      <div className="fade-in" style={{ padding: "10px 20px 0" }}>
        <div onClick={() => setEditCycle(false)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039 Cycle"}</div>

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream }}>Track</div>
        <div style={{ fontSize: 13, color: BASE.taupe, marginTop: 4, marginBottom: 18, lineHeight: 1.5 }}>
          {count ? `Saved as you go — ${count} ${count === 1 ? "thing noted" : "things noted"} so far.` : "Track anything you'd like to remember today."}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center", padding: "9px 6px", borderRadius: 14, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 22 }}>
          <span onClick={() => shift(-1)} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, fontSize: 20, color: BASE.creamDim, cursor: "pointer", userSelect: "none" }}>{"\u2039"}</span>
          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: d === today ? "#9B6BC3" : BASE.cream, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d === today ? "Today" : label}</div>
            {d !== today && <div style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 1 }}>{d}</div>}
          </div>
          <span onClick={() => shift(1)} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 40, fontSize: 20, color: d === today ? BASE.border : BASE.creamDim, cursor: d === today ? "default" : "pointer", userSelect: "none" }}>{"\u203a"}</span>
        </div>

        <div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 16px 15px", marginBottom: 26, boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: BASE.taupe, marginBottom: 13 }}>Cycle Settings</div>

          <div style={{ fontSize: 12.5, fontWeight: 600, color: BASE.creamDim, marginBottom: 7 }}>First day of last period</div>
          <input type="date" value={tmpStart || lastPeriod || ""} max={today}
            onChange={(e) => { setTmpStart(e.target.value); saveCycleSettings(e.target.value, tmpLen) }}
            style={{ display: "block", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box", WebkitAppearance: "none", MozAppearance: "none", appearance: "none", padding: "12px 13px", margin: 0, borderRadius: 11, background: BASE.bg2 || BASE.surface2, border: "1px solid " + BASE.border, color: BASE.cream, fontSize: 16, fontFamily: "inherit", lineHeight: 1.2, outline: "none", marginBottom: 18 }} />

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: BASE.creamDim }}>Typical cycle length</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: useAvgCycle && cycleAvg ? BASE.taupe : "#9B6BC3" }}>{tmpLen} days</span>
          </div>
          <input type="range" min="20" max="45" value={tmpLen}
            onChange={(e) => setTmpLen(e.target.value)}
            onMouseUp={(e) => saveCycleSettings(tmpStart || lastPeriod, e.target.value)}
            onTouchEnd={(e) => saveCycleSettings(tmpStart || lastPeriod, e.target.value)}
            style={{ display: "block", width: "100%", maxWidth: "100%", boxSizing: "border-box", margin: 0, height: 6, borderRadius: 999, background: `linear-gradient(90deg, #B9A3D4 ${lenPct}%, #E2DAEC ${lenPct}%)` }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: BASE.taupe, marginTop: 3 }}><span>20</span><span>45</span></div>

          {cycleAvg ? (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid " + BASE.border }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: BASE.creamDim }}>Use my calculated average</div>
                  <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2, lineHeight: 1.45 }}>Your recent average: <b style={{ color: "#9B6BC3" }}>{cycleAvg.avg} days</b> {"\u00b7"} from {cycleAvg.cycles} completed {cycleAvg.cycles === 1 ? "cycle" : "cycles"}</div>
                </div>
                <div onClick={() => setUseAvgCycle(!useAvgCycle)}
                  style={{ flexShrink: 0, width: 46, height: 27, borderRadius: 999, cursor: "pointer", position: "relative", background: useAvgCycle ? "#9B6BC3" : BASE.surface2, border: "1px solid " + (useAvgCycle ? "#9B6BC3" : BASE.border), transition: "background .2s ease" }}>
                  <span style={{ position: "absolute", top: 2, left: useAvgCycle ? 21 : 2, width: 21, height: 21, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left .2s ease" }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.5, marginTop: 10 }}>
                {useAvgCycle ? "Predictions are using your calculated average." : `Predictions are using your typical length of ${tmpLen} days.`}
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14, paddingTop: 13, borderTop: "1px solid " + BASE.border, fontSize: 11.5, color: BASE.taupe, lineHeight: 1.55 }}>
              Predictions use your typical length for now. Once two full cycles are logged, you'll be able to switch to your own calculated average.
            </div>
          )}
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: BASE.taupe, marginBottom: 14 }}>Daily Tracking</div>

        <Group ic="◐" label="Capacity" k="capacity" col="#9B6BC3" hint="optional" opts={["Red", "Yellow", "Green"]} />
        <Group ic="❤️" label="Period" k="period" col="#A8556B" opts={["Light", "Medium", "Heavy"]} />
        <Group ic="🟤" label="Spotting" k="spotting" col="#A8556B" opts={["Brown spotting", "Red spotting"]} />
        <Group ic="😊" label="Feelings" k="feelings" multi col="#C9558E" opts={["Calm", "Happy", "Motivated", "Sensitive", "Anxious", "Irritable", "Low"]} />
        <Group ic="😖" label="Pain" k="pain" multi col="#D65C4E" opts={["Cramps", "Headache", "Back", "Breast tenderness", "Bloating", "Nausea"]} />
        <Group ic="💕" label="Sex Life" k="sex" multi col="#E3799F" opts={["Sex", "Protected", "Unprotected", "High libido", "Low libido"]} />
        <Group ic="⚡" label="Energy" k="energy" col="#E8B84B" opts={["Low", "Okay", "High"]} />
        <Group ic="💊" label="Birth Control" k="bc" col="#5E7FB0" opts={["Taken", "Late", "Missed", "Changed"]} />
        <Group ic="💧" label="Discharge" k="discharge" col="#7FA054" opts={["Dry", "Sticky", "Creamy", "Watery", "Egg white"]} />

        <div style={{ fontSize: 11.5, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.55, marginBottom: 20 }}>
          Everything here is optional. Log what is useful to you and leave the rest alone.
        </div>

        <div style={{ height: 44, paddingBottom: "env(safe-area-inset-bottom)" }} />
      </div>
    )
  }

  // ══════════════ EDUCATION ARTICLE ══════════════
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

        {a.hormones && <Block label="What's happening"><Para>{a.hormones}</Para></Block>}
        {a.notice && <Block label="What many women notice"><Bullets items={a.notice} /></Block>}
        {a.symptoms && !a.what && <Block label="Common symptoms"><Bullets items={a.symptoms} /></Block>}
        {a.support && <Block label="Helpful support"><Bullets items={a.support} col="#7FA054" /></Block>}
        {a.move && <Block label="Movement"><Para>{a.move}</Para></Block>}
        {a.food && <Block label="Nutrition"><Para>{a.food}</Para></Block>}

        {a.what && <Block label="What it is"><Para>{a.what}</Para></Block>}
        {a.what && a.symptoms && <Block label="Common symptoms"><Bullets items={a.symptoms} /></Block>}
        {a.good && <Block label="What it's good for"><Bullets items={a.good} col="#7FA054" /></Block>}
        {a.consider && <Block label="Worth considering"><Bullets items={a.consider} col="#E8B84B" /></Block>}
        {a.help && <Block label="What helps"><Bullets items={a.help} col="#7FA054" /></Block>}

        {a.body && a.body.map((para, i) => <Para key={i}>{para}</Para>)}

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

  // ══════════════ MAIN CYCLE SCREEN ══════════════
  if (tab === "body" && bodyView === "cycle") {
    const setup = cycleNow != null
    const now = new Date()
    const viewDate = new Date(now.getFullYear(), now.getMonth() + cycleMonth, 1)
    const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const startWeekday = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const todayISOstr = now.toISOString().slice(0, 10)
    const cells = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))

    const phase = cycleNow ? CYCLE_PHASES[cycleNow.phase] : null
    const trackFrom = lastPeriod ? new Date(lastPeriod + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null
    const periodDue = cycleNow && cycleNow.day >= (cycleNow.length - 1) && !periodDismissed

    // Keep legacy capacity check-ins visible, but prefer Cycle's own optional daily capacity log.
    const capByDate = {}
    ;(history || []).forEach((h) => { if (h.dateISO && h.color) capByDate[h.dateISO] = h.color })
    Object.keys(cycleLogs || {}).forEach((iso) => {
      const raw = (cycleLogs[iso] || {}).capacity
      if (raw) capByDate[iso] = String(raw).toLowerCase()
    })
    const CAP_DOT = { red: "#D65C4E", yellow: "#E8B84B", green: "#7FA054" }

    const markPeriodToday = () => {
      const iso = new Date().toISOString().slice(0, 10)
      setLastPeriod(iso)
      try { window.localStorage.setItem("cap_last_period", iso) } catch (e) {}
      if (user && user.id !== "prototype-user" && db) {
        try { db.from("profiles").update({ setup: { ...(setupData || {}), lastPeriod: iso } }).eq("id", user.id).then(() => {}) } catch (e) {}
      }
      setPeriodDismissed(true)
    }

    if (!setup) {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ fontSize: 30 }}>🌙</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginTop: 6 }}>Understand your rhythm. Support your body.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", marginTop: 6, fontStyle: "italic" }}>Your cycle is information — not a limitation.</div>
          </div>

          <div style={{ textAlign: "center", padding: "26px 20px", borderRadius: 18, background: BASE.surface, border: "1px dashed " + BASE.border }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: BASE.cream, marginBottom: 8 }}>Set up your cycle</div>
            <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Add your typical cycle length and the start date of your last period, and Cycle will map your phases.</div>
            <button onClick={() => { setTmpLen("28"); setTmpStart(""); setEditCycle(true) }} style={{ padding: "12px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", fontSize: 13.5, fontWeight: 700 }}>Set up my cycle</button>
          </div>
        </div>
      )
    }

    const support = phase.supportToday || phase.suggestions || []

    return (
      <div className="fade-in" style={{ padding: "10px 18px 0" }}>
        {/* TODAY FIRST */}
        <div style={{ borderRadius: 22, padding: "22px 22px 20px", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", marginBottom: 12, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -26, top: -30, width: 112, height: 112, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: "rgba(255,255,255,.78)" }}>Today</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 31, fontWeight: 700, lineHeight: 1.05 }}>Cycle Day {cycleNow.day}</div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, marginTop: 5 }}>{phase.emoji} {phase.name}</div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.9)", marginTop: 8, lineHeight: 1.5, maxWidth: "88%" }}>{phase.insight}</div>
          <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setCycLogDate(todayISOstr); setEditCycle(true) }}
            style={{ marginTop: 13, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,.48)", background: "rgba(255,255,255,.13)", color: "#fff", cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>
            Track or edit
          </button>
        </div>

        {/* TRACKING BEFORE CALENDAR */}
        {trackFrom && (
          <div style={{ padding: "12px 14px", borderRadius: 14, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: BASE.taupe }}>Tracking</div>
                <div style={{ fontSize: 11.5, color: BASE.creamDim, marginTop: 3 }}>From <b>{trackFrom}</b> {"\u00b7"} {cycleNow.length}-day cycle</div>
              </div>
              <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setCycLogDate(todayISOstr); setEditCycle(true) }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9B6BC3", fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>
                Edit
              </button>
            </div>
            <button onClick={markPeriodToday}
              style={{ width: "100%", padding: "9px", marginTop: 10, borderRadius: 10, border: "1px dashed rgba(155,107,195,0.4)", background: "rgba(155,107,195,0.06)", color: "#9B6BC3", cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>
              🌙 My period started today
            </button>
          </div>
        )}

        {periodDue && (
          <div style={{ borderRadius: 14, background: "rgba(155,107,195,0.08)", border: "1px solid rgba(155,107,195,0.25)", padding: "13px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: BASE.cream }}>Did your period start?</div>
            <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
              <button onClick={markPeriodToday} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: "#9B6BC3", color: "#fff", fontSize: 11.5, fontWeight: 800 }}>Yes, today</button>
              <button onClick={() => setPeriodDismissed(true)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, fontSize: 11.5, fontWeight: 800 }}>Not yet</button>
            </div>
          </div>
        )}

        {/* CALENDAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => setCycleMonth(cycleMonth - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: BASE.taupe, fontSize: 18, padding: "0 8px" }}>{"\u2039"}</button>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>{monthLabel}</div>
          <button onClick={() => setCycleMonth(cycleMonth + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: BASE.taupe, fontSize: 18, padding: "0 8px" }}>{"\u203a"}</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: BASE.taupe }}>{d}</div>)}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 12 }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />
            const iso = cell.toISOString().slice(0, 10)
            const c = computeCycle(effCycleLength || cycleLength, lastPeriod, cell)
            const ph = c ? CYCLE_PHASES[c.phase] : null
            const isToday = iso === todayISOstr
            const capColor = capByDate[iso]
            const lg = (cycleLogs || {})[iso]
            const hasSex = lg && Array.isArray(lg.sex) && lg.sex.length > 0
            return (
              <div key={i} onClick={() => { if (cell <= now) { setCycLogDate(iso); setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setEditCycle(true) } }}
                style={{ aspectRatio: "1", borderRadius: 9, background: ph ? ph.soft : "transparent", border: isToday ? "2px solid " + (ph ? ph.color : "#C9558E") : "1px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", cursor: cell <= now ? "pointer" : "default" }}>
                <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: ph ? ph.color : BASE.taupe }}>{cell.getDate()}</div>
                {c && <div style={{ fontSize: 7.5, color: ph.color, opacity: 0.8 }}>d{c.day}</div>}
                {capColor && <div style={{ position: "absolute", top: 3, right: 3, width: 6, height: 6, borderRadius: "50%", background: CAP_DOT[capColor] || "#9B6BC3" }} />}
                {hasSex && <span style={{ position: "absolute", bottom: 2, right: 3, fontSize: 6.5, lineHeight: 1, color: "#E3799F", opacity: 0.9 }}>{"\u2665"}</span>}
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 8 }}>
          {CYCLE_PHASE_ORDER.map((k) => {
            const ph = CYCLE_PHASES[k]
            return <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: ph.soft, border: "1.5px solid " + ph.color }} /><span style={{ fontSize: 9.5, color: BASE.taupe }}>{ph.name.replace(" Phase", "")}</span></div>
          })}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 22 }}>
          {[["green", "Green"], ["yellow", "Yellow"], ["red", "Red"]].map(([k, lbl]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: CAP_DOT[k] }} /><span style={{ fontSize: 9.5, color: BASE.taupe }}>{lbl}</span></div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 8, color: "#E3799F" }}>{"\u2665"}</span><span style={{ fontSize: 9.5, color: BASE.taupe }}>Sex</span></div>
        </div>

        {/* EDUCATION AFTER CALENDAR */}
        <div style={{ marginTop: 4, marginBottom: 22 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.7, textTransform: "uppercase", color: phase.color }}>Today in your body</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, color: BASE.cream, marginTop: 4 }}>{phase.emoji} {phase.name}</div>

          {(phase.feels || []).length > 0 && (
            <div style={{ marginTop: 13 }}>
              {(phase.feels || []).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: phase.color, marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          )}

          {support.length > 0 && (
            <>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: phase.color, marginTop: 15, marginBottom: 5 }}>Support yourself today</div>
              {support.map((sg, i) => (
                <div key={i} style={{ display: "flex", gap: 9, padding: "6px 0" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: phase.color, marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{sg}</span>
                </div>
              ))}
            </>
          )}

          {phase.nurseNote && (
            <div style={{ padding: "14px 15px", borderRadius: 14, background: "rgba(255,255,255,.52)", borderLeft: "3px solid " + phase.color, marginTop: 15 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: phase.color }}>A nurse's note</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.cream, lineHeight: 1.5, marginTop: 5 }}>{phase.nurseNote}</div>
            </div>
          )}
        </div>

        {cycleNow.phase === "menstrual" && cycleNow.day <= 2 && (
          <div style={{ padding: "15px 0 18px", borderTop: "1px solid " + BASE.border }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>🍫 A Little Comfort</div>
            <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginTop: 5 }}>Your body is asking for care today. Enjoyment and nourishment can both be part of wellness.</div>
          </div>
        )}

        {/* COMPACT EDUCATION LIBRARY */}
        <div style={{ borderTop: "1px solid " + BASE.border, paddingTop: 20 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream }}>Understand Your Body</div>
          <div style={{ fontSize: 12, color: BASE.taupe, lineHeight: 1.5, marginTop: 3, marginBottom: 10 }}>Learn more when you want it.</div>

          {[["🌙", "Your Cycle", "What happens in each phase", CYCLE_DEEP],
            ["🤍", "Common Questions", "The things women actually search", CYCLE_QA],
            ["🌸", "Health Conditions", "PCOS, endometriosis, PMDD and more", CYCLE_CONDITIONS],
            ["👶", "Postpartum", "What's normal, and when to call", CYCLE_POSTPARTUM],
            ["💊", "Birth Control", "Understanding your options", CYCLE_BC],
            ["🌱", "Fertility", "Ovulation and your fertile window", CYCLE_FERTILITY]].map(([ic, name, sub, items]) => {
            const open = cycLib === name
            return (
              <div key={name} style={{ borderBottom: "1px solid " + BASE.border }}>
                <div onClick={() => setCycLib(open ? null : name)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 2px", cursor: "pointer" }}>
                  <span style={{ fontSize: 17, width: 24, textAlign: "center" }}>{ic}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: BASE.cream }}>{name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 11.5, color: BASE.taupe, marginTop: 1 }}>{sub}</div>
                  </div>
                  <span style={{ color: BASE.taupe, fontSize: 15, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s ease" }}>{"\u203a"}</span>
                </div>

                {open && (
                  <div className="fade-in" style={{ padding: "0 0 8px 34px" }}>
                    {items.map((it) => (
                      <div key={it.id} onClick={() => setCycArticle(it)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderTop: "1px solid " + BASE.border, cursor: "pointer" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream }}>{it.title}</div>
                          {it.desc && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 11, color: BASE.taupe, marginTop: 2 }}>{it.desc}</div>}
                        </div>
                        <span style={{ color: BASE.taupe, paddingRight: 4 }}>{"\u203a"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ fontSize: 10.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, margin: "16px 0 20px" }}>General education, not medical advice. Your provider knows your situation best.</div>
        <div style={{ height: 20 }} />
      </div>
    )
  }

  return null
}
