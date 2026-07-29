import { CYCLE_PHASES, PHASES, computeCycle } from '../data/cycle'
import { PROG_BY_ID, WO_TYPES } from '../data/train'
import { BASE, THEMES, colorFromPct } from '../lib/theme'

export function renderProgress(ctx) {
  const { ReportLine, Stat, T, capDay, capMonth, capRange, cycleLength, factors, history, lastPeriod, pct, progressData, recovery, report, setCapDay, setCapMonth, setCapRange, stats, supports, tab, woLog } = ctx
    if (tab === "progress") {
      const pd = progressData
      const CAP_C = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
      const CAP_L = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
      const PHL = { menstrual: "Menstrual", follicular: "Follicular", ovulation: "Ovulatory", luteal: "Luteal" }
      const sortedWo = [...woLog].sort((a, b) => (a.date < b.date ? 1 : -1))
      const SectionTitle = ({ children, sub }) => (
        <div style={{ margin: "26px 2px 14px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream }}>{children}</div>
          {sub && <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", marginTop: 2 }}>{sub}</div>}
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          {/* Dynamic header insight line */}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "#C9558E", lineHeight: 1.4, marginBottom: 4, paddingLeft: 12, borderLeft: "2px solid #E8B84B" }}>{pd.headerLine}</div>

          {/* ===== SECTION 1: CAPACITY JOURNEY ===== */}
          <SectionTitle sub="Patterns, not pressure.">Your Capacity Journey</SectionTitle>
          {!stats ? (
            <div style={{ padding: 24, borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.taupe, fontSize: 14, lineHeight: 1.6, textAlign: "center" }}>Once you start checking in each day, your capacity history will grow here — and patterns will start to show.</div>
          ) : (
            <>
              {/* Range control */}
              <div style={{ display: "flex", gap: 6, padding: 4, background: BASE.surface, borderRadius: 999, border: `1px solid ${BASE.border}`, marginBottom: 18 }}>
                {[["week", "Week"], ["month", "Month"], ["year", "Year"]].map(([k, lbl]) => (
                  <button key={k} onClick={() => { setCapRange(k); setCapDay(null) }} style={{ flex: 1, padding: "8px 0", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: "none", background: capRange === k ? "linear-gradient(135deg,#E984B4,#A87BD1)" : "transparent", color: capRange === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
                ))}
              </div>

              {(() => {
                const CELL = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
                const CAPL = { green: "Green Day", yellow: "Yellow Day", red: "Red Day", recovery: "Recovery Day" }
                const iso = (dt) => dt.toISOString().slice(0, 10)
                const tierFor = (rec) => rec ? (rec.pct < 15 ? "recovery" : rec.color) : null
                const dowShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                // ===== WEEK VIEW =====
                if (capRange === "week") {
                  const today = new Date(); today.setHours(12, 0, 0, 0)
                  const days = Array.from({ length: 7 }, (_, i) => { const dt = new Date(today); dt.setDate(dt.getDate() - (6 - i)); return dt })
                  return (
                    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                      {days.map((dt, i) => {
                        const key = iso(dt); const rec = pd.byDate[key]; const tier = tierFor(rec)
                        const sel = capDay === key
                        return (
                          <div key={i} onClick={() => rec && setCapDay(sel ? null : key)} style={{ flex: 1, borderRadius: 14, padding: "10px 4px", textAlign: "center", cursor: rec ? "pointer" : "default", background: tier ? CELL[tier] : BASE.surface, border: `1px solid ${sel ? BASE.cream : (tier ? "transparent" : BASE.border)}`, opacity: rec ? 1 : 0.5 }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: tier ? "rgba(255,255,255,0.85)" : BASE.taupe, textTransform: "uppercase" }}>{dowShort[dt.getDay()]}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: tier ? "#fff" : BASE.creamDim, margin: "3px 0" }}>{dt.getDate()}</div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: tier ? "rgba(255,255,255,0.95)" : BASE.taupe }}>{rec ? rec.pct + "%" : "—"}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                }

                // ===== YEAR VIEW =====
                if (capRange === "year") {
                  const y = capMonth.y
                  const months = pd.yearMonths(y)
                  const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                  return (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: BASE.taupe, marginBottom: 12 }}>{y}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {months.map((mo) => (
                          <div key={mo.m} onClick={() => { if (mo.n) { setCapMonth({ y, m: mo.m }); setCapRange("month"); setCapDay(null) } }} style={{ borderRadius: 14, padding: "12px 8px", textAlign: "center", background: BASE.surface, border: `1px solid ${BASE.border}`, cursor: mo.n ? "pointer" : "default", opacity: mo.n ? 1 : 0.45 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: BASE.cream, marginBottom: 6 }}>{MN[mo.m]}</div>
                            {mo.n ? (
                              <>
                                <div style={{ width: 26, height: 26, borderRadius: "50%", background: CELL[mo.tier], margin: "0 auto 5px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10.5, fontWeight: 800 }}>{mo.avg}</div>
                                <div style={{ fontSize: 9.5, color: BASE.taupe }}>avg %</div>
                              </>
                            ) : (
                              <div style={{ fontSize: 10, color: BASE.taupe, fontStyle: "italic", padding: "6px 0" }}>—</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                // ===== MONTH VIEW (calendar heat-map) =====
                const y = capMonth.y, m = capMonth.m
                const first = new Date(y, m, 1)
                const startDow = first.getDay()
                const daysInMonth = new Date(y, m + 1, 0).getDate()
                const monthName = first.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                const cells = []
                for (let i = 0; i < startDow; i++) cells.push(null)
                for (let d = 1; d <= daysInMonth; d++) cells.push(d)
                const canPrev = history.some((h) => h.date < first)
                const nextFirst = new Date(y, m + 1, 1)
                const canNext = nextFirst <= new Date()
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span onClick={() => canPrev && (m === 0 ? setCapMonth({ y: y - 1, m: 11 }) : setCapMonth({ y, m: m - 1 }))} style={{ fontSize: 18, color: canPrev ? BASE.creamDim : BASE.border, cursor: canPrev ? "pointer" : "default", padding: "0 8px" }}>{"\u2039"}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{monthName}</span>
                      <span onClick={() => canNext && (m === 11 ? setCapMonth({ y: y + 1, m: 0 }) : setCapMonth({ y, m: m + 1 }))} style={{ fontSize: 18, color: canNext ? BASE.creamDim : BASE.border, cursor: canNext ? "pointer" : "default", padding: "0 8px" }}>{"\u203a"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 700, color: BASE.taupe }}>{d}</div>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
                      {cells.map((d, i) => {
                        if (d === null) return <div key={i} />
                        const key = iso(new Date(y, m, d)); const rec = pd.byDate[key]; const tier = tierFor(rec)
                        const sel = capDay === key
                        const isToday = key === new Date().toISOString().slice(0, 10)
                        return (
                          <div key={i} onClick={() => rec && setCapDay(sel ? null : key)} style={{ aspectRatio: "1", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, cursor: rec ? "pointer" : "default", background: tier ? CELL[tier] : "transparent", color: tier ? "#fff" : BASE.taupe, border: sel ? `2px solid ${BASE.cream}` : (tier ? "none" : `1px solid ${isToday ? "#C9558E" : BASE.border}`) }}>{d}</div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Day detail card */}
              {capDay && pd.byDate[capDay] && (() => {
                const rec = pd.byDate[capDay]
                const tier = rec.pct < 15 ? "recovery" : rec.color
                const CELL = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
                const CAPL = { green: "Green Day", yellow: "Yellow Day", red: "Red Day", recovery: "Recovery Day" }
                const wos = pd.woByDate[capDay] || []
                const cyc = (cycleLength && lastPeriod) ? computeCycle(cycleLength, lastPeriod, new Date(capDay + "T00:00:00")) : null
                const dateLabel = new Date(capDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                const DetailRow = ({ label, value }) => (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "7px 0", borderTop: `0.5px solid ${BASE.border}` }}>
                    <span style={{ fontSize: 12, color: BASE.taupe, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12.5, color: BASE.cream, fontWeight: 600, textAlign: "right" }}>{value}</span>
                  </div>
                )
                return (
                  <div className="fade-in" style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: CELL[tier] }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>{dateLabel}</span>
                      <span onClick={() => setCapDay(null)} style={{ fontSize: 18, color: BASE.taupe, cursor: "pointer", lineHeight: 1 }}>{"\u00d7"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: CELL[tier] }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: CELL[tier] }}>{CAPL[tier]}</span>
                      <span style={{ fontSize: 13.5, color: BASE.taupe }}>· {rec.pct}%</span>
                    </div>
                    {wos.length > 0 && <DetailRow label="Workout" value={wos.map((w) => (WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label).join(", ")} />}
                    {rec.supports && rec.supports.length > 0 && <DetailRow label="Support" value={rec.supports.join(", ")} />}
                    {rec.factors && rec.factors.length > 0 && <DetailRow label="Affecting you" value={rec.factors.join(", ")} />}
                    {cyc && <DetailRow label="Cycle phase" value={CYCLE_PHASES[cyc.phase] ? CYCLE_PHASES[cyc.phase].name : cyc.phase} />}
                    {rec.note && <DetailRow label="Your one thing" value={rec.note} />}
                  </div>
                )
              })()}

              {/* Hero summary: Average Capacity + comparison */}
              {(() => {
                // Determine the scope for the summary based on range
                let scopeRows, compareText = null
                if (capRange === "week") {
                  const today = new Date(); today.setHours(12, 0, 0, 0)
                  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 6)
                  scopeRows = history.filter((d) => d.date >= cutoff)
                } else if (capRange === "year") {
                  scopeRows = history.filter((d) => d.date.getFullYear() === capMonth.y)
                } else {
                  scopeRows = history.filter((d) => d.date.getFullYear() === capMonth.y && d.date.getMonth() === capMonth.m)
                  // month-over-month comparison
                  const prevM = capMonth.m === 0 ? { y: capMonth.y - 1, m: 11 } : { y: capMonth.y, m: capMonth.m - 1 }
                  const thisAvg = pd.avgForMonth(capMonth.y, capMonth.m)
                  const prevAvg = pd.avgForMonth(prevM.y, prevM.m)
                  if (thisAvg != null && prevAvg != null) {
                    const delta = thisAvg - prevAvg
                    if (delta >= 3) compareText = `\u2191 ${delta}% from last month`
                    else if (delta <= -3) compareText = `\u2193 ${Math.abs(delta)}% from last month — every month has its own shape`
                    else compareText = "Steady compared with last month"
                  }
                }
                if (!scopeRows.length) return <div style={{ fontSize: 12.5, color: BASE.taupe, textAlign: "center", padding: "10px 0 18px", fontStyle: "italic" }}>No check-ins logged in this range yet.</div>
                const c = { green: 0, yellow: 0, red: 0, recovery: 0 }
                let sum = 0
                scopeRows.forEach((d) => { sum += d.pct; const t = d.pct < 15 ? "recovery" : d.color; c[t]++ })
                const avg = Math.round(sum / scopeRows.length)
                const topTier = Object.keys(c).sort((a, b) => c[b] - c[a])[0]
                const CAPL = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
                return (
                  <>
                    <div style={{ textAlign: "center", padding: "6px 0 14px" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe }}>Average Capacity</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, color: THEMES[colorFromPct(avg)].accent, lineHeight: 1.05 }}>{avg}%</div>
                      {compareText && <div style={{ fontSize: 12.5, color: BASE.creamDim, marginTop: 2 }}>{compareText}</div>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 }}>
                      {[["Green", c.green, THEMES.green.accent], ["Yellow", c.yellow, THEMES.yellow.accent], ["Red", c.red, THEMES.red.accent], ["Recovery", c.recovery, "#A87BD1"]].map(([lbl, n, col]) => (
                        <div key={lbl} style={{ textAlign: "center", padding: "11px 3px", borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}` }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: col }}>{n}</div>
                          <div style={{ fontSize: 10, color: BASE.taupe }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: "center", fontSize: 11.5, color: BASE.taupe, marginBottom: 16 }}>Most common: <span style={{ fontWeight: 700, color: ({ green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" })[topTier] }}>{CAPL[topTier]}</span></div>
                  </>
                )
              })()}

              {/* Capacity Momentum */}
              {pd.momentum && (
                <div style={{ borderRadius: 18, background: "linear-gradient(160deg,rgba(233,132,180,0.08),rgba(168,123,209,0.08))", border: "1px solid rgba(168,123,209,0.28)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{pd.momentum.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C9558E" }}>Capacity Momentum</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16.5, color: BASE.cream, lineHeight: 1.5 }}>{pd.momentum.msg}</div>
                </div>
              )}
            </>
          )}

          {/* ===== SECTION 2: LEARNING YOUR PATTERNS ===== */}
          <SectionTitle sub="What your check-ins are quietly revealing.">Learning Your Patterns</SectionTitle>
          <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 12 }}>
            {/* Cycle patterns */}
            {pd.cyclePhases && !pd.cyclePhases.none ? (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#9B6BC3", textTransform: "uppercase", marginBottom: 8 }}>Cycle Patterns</div>
                {pd.cyclePhases.summary && <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 10 }}>{pd.cyclePhases.summary}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                  {pd.cyclePhases.rows.map((r) => (
                    <div key={r.phase} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: BASE.surface2 || "rgba(255,255,255,0.03)", border: `1px solid ${BASE.border}` }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.enough && r.top ? CAP_C[r.top] : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream, width: 78, flexShrink: 0 }}>{PHL[r.phase]}</span>
                      {r.enough ? (
                        <span style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11.5, color: BASE.taupe }}>Avg {r.avg}%</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: CAP_C[r.top], padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.05)" }}>{CAP_L[r.top]}</span>
                        </span>
                      ) : <span style={{ flex: 1, fontSize: 11, color: BASE.taupe, fontStyle: "italic" }}>Not enough check-ins yet</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55 }}>{cycleLength && lastPeriod ? "As you check in through each cycle phase, your rhythm will start to appear here." : "Turn on cycle tracking in the Body tab to see how your capacity moves through your cycle."}</div>
            )}
            {/* Weekly patterns */}
            {pd.weekly && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${BASE.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 8 }}>Weekly Patterns</div>
                {pd.weekly.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 4 }}>{w}</div>)}
              </div>
            )}
            {/* Recovery patterns */}
            {pd.recoveryPatterns && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${BASE.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#7FA054", textTransform: "uppercase", marginBottom: 8 }}>Recovery Patterns</div>
                {pd.recoveryPatterns.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 4 }}>{w}</div>)}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: BASE.taupe, lineHeight: 1.55, fontStyle: "italic", marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${BASE.border}` }}>These are patterns — not rules. Your capacity is always yours to choose.</div>
          </div>

          {/* ===== SECTION 3: MONTHLY REFLECTION ===== */}
          {report && !report.empty && (
            <>
              <SectionTitle sub={`A gentle look back at ${report.monthName}.`}>Monthly Reflection</SectionTitle>
              <div style={{ borderRadius: 20, background: `linear-gradient(160deg, ${BASE.surface}, ${BASE.bg2})`, border: `1px solid ${BASE.border}`, padding: "22px 20px" }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1 }}>{report.monthName} · Average capacity</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: 600, color: THEMES[colorFromPct(report.avg)].accent, lineHeight: 1.1 }}>{report.avg}%</div>
                  {(pd.monthHi != null) && <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2 }}>Highest {pd.monthHi}% · Lowest {pd.monthLo}%</div>}
                </div>
                <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
                  {[["Green", report.counts.green, THEMES.green.accent], ["Yellow", report.counts.yellow, THEMES.yellow.accent], ["Red", report.counts.red, THEMES.red.accent], ["Recovery", pd.recoveryDays, "#A87BD1"]].map(([lbl, n, c]) => (
                    <div key={lbl} style={{ flex: 1, textAlign: "center", padding: "11px 3px", borderRadius: 12, background: BASE.surface2 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: c }}>{n}</div>
                      <div style={{ fontSize: 10, color: BASE.taupe }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `0.5px solid ${BASE.border}`, paddingTop: 12 }}>
                  {pd.favCat && <ReportLine label="Favorite workout" value={pd.favCat} />}
                  {report.recovery && <ReportLine label="Most helpful recovery habit" value={report.recovery} />}
                  {report.bestPhase && <ReportLine label="Highest-capacity phase" value={PHASES[report.bestPhase].emoji + " " + PHASES[report.bestPhase].name} />}
                </div>
                {pd.monthlyReflection && <p style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.65, marginTop: 16, fontStyle: "italic" }}>{pd.monthlyReflection}</p>}
              </div>
            </>
          )}

          {/* ===== SECTION 4: MOVEMENT HISTORY ===== */}
          <SectionTitle sub="Every session counted.">Movement History</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Stat label="Total workouts" value={pd.totalWorkouts} accent={T.accent} />
            <Stat label="Movement minutes" value={"~" + pd.totalMinutes} accent="#9B6BC3" />
            <Stat label="Favorite category" value={pd.favCat || "—"} accent="#C9558E" />
            <Stat label="Current streak" value={pd.workoutStreak + (pd.workoutStreak === 1 ? " day" : " days")} accent={THEMES.green.accent} />
          </div>
          {!sortedWo.length ? (
            <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.taupe, fontSize: 13.5, lineHeight: 1.6, textAlign: "center" }}>Finish a workout in the Body tab and it will show up here.</div>
          ) : (
            sortedWo.slice(0, 8).map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{(WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label}</div>
                  <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 1 }}>{new Date(w.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{w.program ? " · " + (PROG_BY_ID(w.program).name) : ""}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta }}>{THEMES[w.color] ? THEMES[w.color].label.split(" ")[0] : ""}</span>
              </div>
            ))
          )}
          {sortedWo.length > 8 && <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", marginTop: 4 }}>Showing your 8 most recent · {sortedWo.length} total</div>}

          {/* ===== BIGGEST WIN ===== */}
          <div style={{ borderRadius: 20, background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "22px 22px", margin: "26px 0 20px", position: "relative", overflow: "hidden", boxShadow: "0 12px 30px rgba(168,123,209,0.32)" }}>
            <div style={{ position: "absolute", right: -16, top: -16, fontSize: 80, opacity: 0.14 }}>✨</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.9)", position: "relative" }}>✨ Biggest Win</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: "#fff", lineHeight: 1.35, marginTop: 8, position: "relative" }}>{pd.biggestWin}</div>
          </div>
        </div>
      )
    }
  return null
}
