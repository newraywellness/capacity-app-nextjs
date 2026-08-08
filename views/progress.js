// ============ PROGRESS ============
// An editorial story of the user's growth — not an analytics dashboard.
// All computation lives in data/progress.js; this file is presentation only.
// Numbers are evidence. The interpreted sentence beneath them is the product.

import { PHASES } from '../data/cycle.js'
import { WO_TYPES, PROG_BY_ID } from '../data/train.js'
import { BASE, THEMES, colorFromPct } from '../lib/theme.js'

export function renderProgress(ctx) {
  const { T, capDay, capMonth, capRange, cycleLength, history, lastPeriod, progress, reviewMonth, setCapDay, setCapMonth, setCapRange, setReviewMonth, tab, woLog } = ctx
  if (tab !== "progress") return null

  const CAP_C = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
  const CAP_L = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
  const dowShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const monthName = (y, m) => new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // A quiet section header. Numbered per the editorial structure, never styled
  // as a card — headings and rules only.
  const Section = ({ n, title, sub, children }) => (
    <div style={{ marginTop: 50 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: BASE.taupe }}>{n}</span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, color: BASE.cream }}>{title}</span>
      </div>
      {sub && <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", marginTop: 3 }}>{sub}</div>}
      <div style={{ height: 1, background: BASE.border, marginTop: 14, marginBottom: 20 }} />
      {children}
    </div>
  )

  // The one recurring visual device for interpreted language throughout the
  // page — a warm sentence with a soft left rule, never boxed.
  const Insight = ({ children, color }) => (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, lineHeight: 1.55, paddingLeft: 14, borderLeft: `2px solid ${color || "#C9558E"}`, margin: "16px 0" }}>{children}</div>
  )

  const Empty = ({ children }) => (
    <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.65, fontStyle: "italic" }}>{children}</div>
  )

  // A small horizontal SVG line — the one "chart" the brief calls for. Kept
  // deliberately restrained: no axes, no gridlines, just the shape of change.
  const Sparkline = ({ series, height }) => {
    if (!series || series.length < 2) return null
    const h = height || 64, w = 320
    const pts = series.map((p, i) => {
      const x = (i / (series.length - 1)) * w
      const y = h - (p.y / 100) * h
      return [x, y]
    })
    const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")
    const last = series[series.length - 1]
    return (
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", marginBottom: 8 }}>
        <path d={path} fill="none" stroke="#C9A0D8" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={CAP_C[last.tier] || "#C9A0D8"} />
      </svg>
    )
  }

  // ═══════════════════════════ 01 · CAPACITY ═══════════════════════════
  const RangeTabs = () => (
    <div style={{ display: "flex", gap: 6, padding: 4, background: BASE.surface, borderRadius: 999, border: `1px solid ${BASE.border}`, marginBottom: 18 }}>
      {[["week", "Week"], ["month", "Month"], ["3months", "3 Mo"], ["year", "Year"]].map(([k, lbl]) => (
        <button key={k} onClick={() => { setCapRange(k); setCapDay(null) }} style={{ flex: 1, padding: "8px 0", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, border: "none", background: capRange === k ? "linear-gradient(135deg,#E984B4,#A87BD1)" : "transparent", color: capRange === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
      ))}
    </div>
  )

  const capData = progress.range(capRange, capMonth)

  const WeekStrip = () => {
    const today = new Date(); today.setHours(12, 0, 0, 0)
    const days = Array.from({ length: 7 }, (_, i) => { const dt = new Date(today); dt.setDate(dt.getDate() - (6 - i)); return dt })
    return (
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {days.map((dt, i) => {
          const key = dt.toISOString().slice(0, 10); const rec = progress.byDate[key]; const tier = rec ? (rec.pct < 15 ? "recovery" : rec.color) : null
          const sel = capDay === key
          return (
            <div key={i} onClick={() => rec && setCapDay(sel ? null : key)} style={{ flex: 1, borderRadius: 14, padding: "10px 4px", textAlign: "center", cursor: rec ? "pointer" : "default", background: tier ? CAP_C[tier] : BASE.surface, border: `1px solid ${sel ? BASE.cream : (tier ? "transparent" : BASE.border)}`, opacity: rec ? 1 : 0.5 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: tier ? "rgba(255,255,255,0.85)" : BASE.taupe, textTransform: "uppercase" }}>{dowShort[dt.getDay()]}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: tier ? "#fff" : BASE.creamDim, margin: "3px 0" }}>{dt.getDate()}</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: tier ? "rgba(255,255,255,0.95)" : BASE.taupe }}>{rec ? rec.pct + "%" : "—"}</div>
            </div>
          )
        })}
      </div>
    )
  }

  const ThreeMonthGrid = () => {
    const months = [2, 1, 0].map((back) => { let y = capMonth.y, m = capMonth.m - back; while (m < 0) { m += 12; y-- } return { y, m } })
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
        {months.map(({ y, m }) => {
          const avg = progress.avgForMonth(y, m)
          return (
            <div key={y + "-" + m} onClick={() => { setCapMonth({ y, m }); setCapRange("month"); setCapDay(null) }} style={{ borderRadius: 14, padding: "14px 8px", textAlign: "center", background: BASE.surface, border: `1px solid ${BASE.border}`, cursor: "pointer" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: BASE.cream, marginBottom: 8 }}>{new Date(y, m, 1).toLocaleDateString("en-US", { month: "short" })}</div>
              {avg != null ? (
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: THEMES[colorFromPct(avg)].accent }}>{avg}%</div>
              ) : <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic" }}>—</div>}
            </div>
          )
        })}
      </div>
    )
  }

  const YearGrid = () => {
    const months = progress.yearMonths(capMonth.y)
    const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: BASE.taupe, marginBottom: 12 }}>{capMonth.y}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {months.map((mo) => (
            <div key={mo.m} onClick={() => { if (mo.n) { setCapMonth({ y: capMonth.y, m: mo.m }); setCapRange("month"); setCapDay(null) } }} style={{ borderRadius: 14, padding: "12px 8px", textAlign: "center", background: BASE.surface, border: `1px solid ${BASE.border}`, cursor: mo.n ? "pointer" : "default", opacity: mo.n ? 1 : 0.45 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: BASE.cream, marginBottom: 6 }}>{MN[mo.m]}</div>
              {mo.n ? <div style={{ width: 26, height: 26, borderRadius: "50%", background: CAP_C[mo.tier], margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10.5, fontWeight: 800 }}>{mo.avg}</div> : <div style={{ fontSize: 10, color: BASE.taupe, fontStyle: "italic" }}>—</div>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const MonthCalendar = () => {
    const y = capMonth.y, m = capMonth.m
    const first = new Date(y, m, 1)
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < first.getDay(); i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    const canPrev = history.some((h) => h.date < first)
    const nextFirst = new Date(y, m + 1, 1)
    const canNext = nextFirst <= new Date()
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span onClick={() => canPrev && (m === 0 ? setCapMonth({ y: y - 1, m: 11 }) : setCapMonth({ y, m: m - 1 }))} style={{ fontSize: 18, color: canPrev ? BASE.creamDim : BASE.border, cursor: canPrev ? "pointer" : "default", padding: "0 8px" }}>{"\u2039"}</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{monthName(y, m)}</span>
          <span onClick={() => canNext && (m === 11 ? setCapMonth({ y: y + 1, m: 0 }) : setCapMonth({ y, m: m + 1 }))} style={{ fontSize: 18, color: canNext ? BASE.creamDim : BASE.border, cursor: canNext ? "pointer" : "default", padding: "0 8px" }}>{"\u203a"}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 700, color: BASE.taupe }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />
            const key = new Date(y, m, d).toISOString().slice(0, 10); const rec = progress.byDate[key]; const tier = rec ? (rec.pct < 15 ? "recovery" : rec.color) : null
            const sel = capDay === key
            const isToday = key === new Date().toISOString().slice(0, 10)
            return (
              <div key={i} onClick={() => rec && setCapDay(sel ? null : key)} style={{ aspectRatio: "1", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, cursor: rec ? "pointer" : "default", background: tier ? CAP_C[tier] : "transparent", color: tier ? "#fff" : BASE.taupe, border: sel ? `2px solid ${BASE.cream}` : (tier ? "none" : `1px solid ${isToday ? "#C9558E" : BASE.border}`) }}>{d}</div>
            )
          })}
        </div>
      </div>
    )
  }

  const DayDetail = () => {
    if (!capDay || !progress.byDate[capDay]) return null
    const rec = progress.byDate[capDay]
    const tier = rec.pct < 15 ? "recovery" : rec.color
    const wos = progress.woByDate[capDay] || []
    const dateLabel = new Date(capDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    const Row = ({ label, value }) => (
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderTop: `0.5px solid ${BASE.border}` }}>
        <span style={{ fontSize: 12, color: BASE.taupe, flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: 12.5, color: BASE.cream, fontWeight: 600, textAlign: "right" }}>{value}</span>
      </div>
    )
    return (
      <div className="fade-in" style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: CAP_C[tier] }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream }}>{dateLabel}</span>
          <span onClick={() => setCapDay(null)} style={{ fontSize: 18, color: BASE.taupe, cursor: "pointer" }}>{"\u00d7"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: CAP_C[tier] }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: CAP_C[tier] }}>{CAP_L[tier]}</span>
          <span style={{ fontSize: 13, color: BASE.taupe }}>· {rec.pct}%</span>
        </div>
        {wos.length > 0 && <Row label="Workout" value={wos.map((w) => (WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label).join(", ")} />}
        {rec.supports && rec.supports.length > 0 && <Row label="Support" value={rec.supports.join(", ")} />}
        {rec.factors && rec.factors.length > 0 && <Row label="Affecting you" value={rec.factors.join(", ")} />}
        {rec.note && <Row label="Your one thing" value={rec.note} />}
      </div>
    )
  }

  // Slim proportional bar — the Green/Yellow/Red distribution as one line,
  // not four boxes.
  const Distribution = ({ counts }) => {
    const total = counts.green + counts.yellow + counts.red + counts.recovery
    if (!total) return null
    const seg = (n, color) => n > 0 && <div key={color} style={{ flex: n, background: CAP_C[color] }} />
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
          {seg(counts.green, "green")}{seg(counts.yellow, "yellow")}{seg(counts.red, "red")}{seg(counts.recovery, "recovery")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
          {[["green", counts.green], ["yellow", counts.yellow], ["red", counts.red], ["recovery", counts.recovery]].filter(([, n]) => n > 0).map(([k, n]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: CAP_C[k] }} />
              <span style={{ fontSize: 11.5, color: BASE.taupe }}>{CAP_L[k]} · {n}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ═══════════════════════════ 03 · RHYTHM ═══════════════════════════
  const RhythmRows = () => {
    const cp = progress.cyclePhase
    const maxAvg = Math.max(...cp.rows.map((r) => r.avg || 0), 1)
    return (
      <div>
        {cp.rows.map((r) => (
          <div key={r.phase} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 15 }}>{PHASES[r.phase].emoji}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream, width: 82, flexShrink: 0 }}>{PHASES[r.phase].name}</span>
            {r.enough ? (
              <>
                <div style={{ flex: 1, height: 7, borderRadius: 999, background: BASE.surface2 || "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (r.avg / maxAvg) * 100 + "%", background: PHASES[r.phase].accent, borderRadius: 999 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, width: 38, textAlign: "right" }}>{r.avg}%</span>
              </>
            ) : (
              <span style={{ flex: 1, fontSize: 11, color: BASE.taupe, fontStyle: "italic" }}>{r.n > 0 ? `${r.n} of 3 check-ins so far` : "Not yet logged"}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  // ═══════════════════════════ 04 · THIS MONTH ═══════════════════════════
  const idx = progress.pastMonths.findIndex((mo) => mo.y === reviewMonth.y && mo.m === reviewMonth.m)
  const canGoOlder = idx >= 0 && idx < progress.pastMonths.length - 1
  const canGoNewer = idx > 0
  const review = progress.monthReview(reviewMonth.y, reviewMonth.m)

  return (
    <div className="fade-in" style={{ padding: "10px 22px 60px" }}>
      {/* ── HEADER ── */}
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600, color: BASE.cream, lineHeight: 1.1 }}>Progress</div>
        <div style={{ fontSize: 14, color: BASE.taupe, marginTop: 6, fontStyle: "italic" }}>See what's changing.</div>
      </div>

      {!progress.hasAnyData ? (
        <div style={{ marginTop: 40, padding: "30px 24px", borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🌱</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: BASE.cream, marginBottom: 6 }}>This is where your story will gather.</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Check in on Today, and move when it fits — Progress builds itself quietly from there.</div>
        </div>
      ) : (
        <>
          {/* ═══ 01 CAPACITY ═══ */}
          <Section n="01" title="Capacity" sub="Patterns, not pressure.">
            <RangeTabs />
            {capData.hasData && <Sparkline series={capData.series} />}
            {capRange === "week" && <WeekStrip />}
            {capRange === "3months" && <ThreeMonthGrid />}
            {capRange === "year" && <YearGrid />}
            {capRange === "month" && <MonthCalendar />}
            <DayDetail />
            {capData.hasData ? (
              <>
                <div style={{ textAlign: "center", padding: "4px 0 16px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe }}>Average Capacity</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: 600, color: THEMES[colorFromPct(capData.avg)].accent, lineHeight: 1.05 }}>{capData.avg}%</div>
                  {capData.compareText && <div style={{ fontSize: 12.5, color: BASE.creamDim, marginTop: 2 }}>{capData.compareText}</div>}
                </div>
                <Distribution counts={capData.counts} />
              </>
            ) : <Empty>No check-ins logged in this range yet.</Empty>}

            {progress.momentum && <Insight color="#A87BD1">{progress.momentum.msg}</Insight>}
            {progress.weekly && progress.weekly.map((w, i) => <Insight key={i}>{w}</Insight>)}
            {progress.recoveryPatterns && progress.recoveryPatterns.map((w, i) => <Insight key={i} color="#7FA054">{w}</Insight>)}
            {!progress.momentum && !progress.weekly && !progress.recoveryPatterns && (
              <Empty>Keep checking in — patterns need a little more time to show themselves honestly.</Empty>
            )}
          </Section>

          {/* ═══ 02 MOVEMENT ═══ */}
          <Section n="02" title="Movement" sub="Every session counted.">
            {progress.movement.program && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <span style={{ fontSize: 17 }}>{progress.movement.program.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{progress.movement.program.name}</span>
                </div>
                {progress.movement.program.started ? (
                  progress.movement.program.complete ? (
                    <Insight color="#7FA054">You completed all {progress.movement.program.totalWeeks} weeks of this program.</Insight>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: BASE.surface2 || "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: (progress.movement.program.week / progress.movement.program.totalWeeks) * 100 + "%", background: "linear-gradient(90deg,#E984B4,#A87BD1)", borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 11.5, color: BASE.taupe, flexShrink: 0 }}>Week {progress.movement.program.week} of {progress.movement.program.totalWeeks}</span>
                    </div>
                  )
                ) : <Empty>Chosen, not yet started — whenever you're ready.</Empty>}
              </div>
            )}

            {progress.movement.totalWorkouts > 0 ? (
              <>
                <div style={{ display: "flex", gap: 26, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: BASE.cream }}>{progress.movement.totalWorkouts}</div>
                    <div style={{ fontSize: 10.5, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1 }}>Workouts logged</div>
                  </div>
                  {progress.movement.favCat && (
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: BASE.cream }}>{progress.movement.favCat}</div>
                      <div style={{ fontSize: 10.5, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1 }}>Most chosen</div>
                    </div>
                  )}
                </div>

                {progress.movement.consistency && progress.movement.consistency.msg && <Insight color="#9B6BC3">{progress.movement.consistency.msg}</Insight>}

                <div style={{ marginTop: 16 }}>
                  {progress.movement.sessions.slice(0, 6).map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i === 0 ? "none" : `0.5px solid ${BASE.border}` }}>
                      <span style={{ width: 9, height: 9, borderRadius: "50%", background: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{(WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label}</div>
                        <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{new Date(w.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{w.program ? " · " + PROG_BY_ID(w.program).name : ""}</div>
                      </div>
                    </div>
                  ))}
                  {progress.movement.sessions.length > 6 && <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", marginTop: 8 }}>Showing your 6 most recent · {progress.movement.sessions.length} total</div>}
                </div>
              </>
            ) : <Empty>Finish a workout in the Body tab and it will show up here.</Empty>}

            {/* Architected for when Move begins tracking load — quiet, not a dead end. */}
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: `0.5px solid ${BASE.border}` }}>
              <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.55 }}>As strength progression and personal records become part of Move, they'll take shape here too.</div>
            </div>
          </Section>

          {/* ═══ 03 YOUR RHYTHM ═══ */}
          <Section n="03" title="Your Rhythm" sub="Where cycle, capacity, and movement start to connect.">
            {!cycleLength || !lastPeriod ? (
              <Empty>Turn on cycle tracking in the Body tab to begin seeing how your capacity moves through your cycle.</Empty>
            ) : progress.cyclePhase.ready ? (
              <>
                <RhythmRows />
                {progress.cyclePhase.summary && <Insight color="#9B6BC3">{progress.cyclePhase.summary}</Insight>}
              </>
            ) : (
              <Empty>We're learning your rhythm. Keep checking in and we'll begin showing you how your capacity changes throughout your cycle.</Empty>
            )}
          </Section>

          {/* ═══ 04 THIS MONTH ═══ */}
          <Section n="04" title="This Month">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span onClick={() => canGoOlder && setReviewMonth({ y: progress.pastMonths[idx + 1].y, m: progress.pastMonths[idx + 1].m })} style={{ fontSize: 17, color: canGoOlder ? BASE.creamDim : BASE.border, cursor: canGoOlder ? "pointer" : "default", padding: "0 6px" }}>{"\u2039"}</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: BASE.cream }}>{review.monthLabel}</span>
              <span onClick={() => canGoNewer && setReviewMonth({ y: progress.pastMonths[idx - 1].y, m: progress.pastMonths[idx - 1].m })} style={{ fontSize: 17, color: canGoNewer ? BASE.creamDim : BASE.border, cursor: canGoNewer ? "pointer" : "default", padding: "0 6px" }}>{"\u203a"}</span>
            </div>
            {review.hasData ? (
              <div style={{ borderRadius: 18, background: `linear-gradient(160deg, ${BASE.surface}, ${BASE.bg2})`, border: `1px solid ${BASE.border}`, padding: "22px 20px" }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1 }}>Average capacity</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 600, color: THEMES[colorFromPct(review.avg)].accent, lineHeight: 1.1 }}>{review.avg}%</div>
                </div>
                <Distribution counts={review.counts} />
                <div style={{ marginTop: 14 }}>
                  {review.bullets.map((b, i) => <div key={i} style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.65, marginBottom: 8 }}>{"\u2022  "}{b}</div>)}
                </div>
              </div>
            ) : <Empty>No check-ins logged this month yet.</Empty>}
          </Section>

          {/* ═══ 05 WINS ═══ */}
          <Section n="05" title="Wins" sub="Real growth, quietly noticed.">
            {progress.wins.length ? (
              progress.wins.map((w) => (
                <div key={w.id} style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>{w.title}</div>
                  <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6 }}>{w.body}</div>
                </div>
              ))
            ) : (
              <Empty>Meaningful patterns take a little time to surface. Keep checking in — we'll notice the moments that matter.</Empty>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
