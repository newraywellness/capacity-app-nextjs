// ============ PROGRESS · DATA LAYER ============
// Pure computation only — no JSX, no presentation. Everything here derives
// strictly from real stored data: `history` (daily check-ins) and `woLog`
// (workout log). Nothing is fabricated.
//
// Two things this file deliberately does NOT do, on purpose:
//   - It never estimates workout duration. Logged sessions store a completed
//     SET COUNT, never a time or a weight — so no "minutes" or "strength"
//     number is invented here. Those return { available: false } until Move
//     actually tracks them.
//   - It never surfaces a pattern from too little data. Every insight has an
//     explicit minimum sample size, and returns a "not ready yet" shape
//     instead of guessing when the threshold isn't met.

import { PHASES, PHASE_ORDER, computeCycle } from './cycle.js'
import { WO_TYPES, PROG_BY_ID, progSchedule } from './train.js'

const PHASE_MIN = 3 // minimum check-ins in a cycle phase before it's "enough"
const iso = (d) => d.toISOString().slice(0, 10)
const round = (n) => Math.round(n)

const topOf = (rows, key) => {
  const tally = {}
  rows.forEach((r) => (r[key] || []).forEach((v) => { tally[v] = (tally[v] || 0) + 1 }))
  const arr = Object.entries(tally).sort((a, b) => b[1] - a[1])
  return arr.length ? arr[0] : null // [label, count] | null
}

// ── CAPACITY ─────────────────────────────────────────────────────────────────

// Overall distribution + average across all history. Used for `stats` (also
// read by More, via ctx) and as the basis for several insight checks.
function capacityStats(history) {
  if (!history.length) return null
  const counts = { red: 0, yellow: 0, green: 0 }
  let sum = 0
  history.forEach((d) => { counts[d.color]++; sum += d.pct })
  return { counts, avg: round(sum / history.length), top: Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] }
}

// Compares the last ~14 logged days against the ~14 before that. Requires at
// least 6 total entries and 3 in the prior window, or returns null rather than
// guessing from a thin sample.
function capacityMomentum(history) {
  const H = history
  if (H.length < 6) return null
  const recent = H.slice(-14), prior = H.slice(-28, -14)
  if (!recent.length || prior.length < 3) return null
  const avg = (arr) => arr.reduce((s, d) => s + d.pct, 0) / arr.length
  const delta = round(avg(recent) - avg(prior))
  if (delta >= 5) return { dir: "up", delta, msg: "Your capacity has gradually risen over recent weeks." }
  if (delta <= -5) return { dir: "down", delta, msg: "Your capacity has dipped recently — recovery may deserve a little extra attention." }
  return { dir: "steady", delta, msg: "Your capacity has stayed fairly steady lately. Steady is its own kind of progress." }
}

// Average capacity by day of week. Needs 10+ entries overall and at least 4
// weekdays with 2+ samples each before naming a pattern.
function weekdayPatterns(history) {
  if (history.length < 10) return null
  const days = [[], [], [], [], [], [], []]
  history.forEach((d) => { days[d.date.getDay()].push(d.pct) })
  const named = days.map((arr, i) => ({ i, n: arr.length, avg: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null }))
  const eligible = named.filter((x) => x.n >= 2)
  if (eligible.length < 4) return null
  const DOW = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"]
  const hi = [...eligible].sort((a, b) => b.avg - a.avg)[0]
  const lo = [...eligible].sort((a, b) => a.avg - b.avg)[0]
  const out = []
  if (hi) out.push(`Your capacity has tended to be highest on ${DOW[hi.i]}.`)
  if (lo && lo.i !== hi.i) out.push(`${DOW[lo.i]} have often been a lower-capacity time for you.`)
  return out.length ? out : null
}

// Which logged supports most often precede Green days, and which factors most
// often precede Red days. Needs 8+ entries and 3+ Green days; a tag needs to
// appear 2+ times to be named.
function recoveryPatterns(history) {
  if (history.length < 8) return null
  const greenRows = history.filter((d) => d.color === "green")
  if (greenRows.length < 3) return null
  const topSup = topOf(greenRows, "supports")
  const redRows = history.filter((d) => d.color === "red")
  const topFac = topOf(redRows, "factors")
  const out = []
  if (topSup && topSup[1] >= 2) out.push(`"${topSup[0]}" is commonly present around your Green Days.`)
  if (topFac && topFac[1] >= 2) out.push(`"${topFac[0]}" has often shown up on your lower-capacity days.`)
  return out.length ? out : null
}

// ── RHYTHM (Cycle × Capacity) ────────────────────────────────────────────────
// Single source of truth for phase-level capacity — replaces two slightly
// inconsistent versions that existed before (one used no minimum sample size).
function cyclePhaseCapacity(history, cycleLength, lastPeriod, effCycleLength) {
  if (!cycleLength || !lastPeriod) return { ready: false, reason: "no-cycle" }
  if (!history.length) return { ready: false, reason: "no-checkins" }
  const L = effCycleLength || cycleLength

  // Build buckets FROM PHASE_ORDER itself rather than a hard-coded key list,
  // so this can never silently drift out of sync with data/cycle.js. Any
  // phase name PHASE_ORDER lists but PHASES doesn't recognise is dropped here
  // — once, at the source — rather than causing an unguarded read anywhere
  // downstream. buildProgress() runs on every app render, not only while
  // Progress is open, so nothing in this function may ever throw.
  const safePhases = PHASE_ORDER.filter((p) => PHASES && PHASES[p])
  if (!safePhases.length) return { ready: false, reason: "no-cycle" }

  const buckets = {}
  safePhases.forEach((p) => { buckets[p] = { n: 0, sum: 0 } })

  history.forEach((d) => {
    const c = computeCycle(L, lastPeriod, d.date)
    if (!c || !buckets[c.phase]) return // unrecognised/foreign phase key — skip, never throw
    buckets[c.phase].n++; buckets[c.phase].sum += d.pct
  })

  const avgOf = (p) => (buckets[p] && buckets[p].n ? round(buckets[p].sum / buckets[p].n) : null)
  const withEnough = safePhases.filter((p) => buckets[p].n >= PHASE_MIN)
  const rows = safePhases.map((p) => ({ phase: p, n: buckets[p].n, enough: buckets[p].n >= PHASE_MIN, avg: avgOf(p) }))
  if (!withEnough.length) return { ready: false, reason: "not-enough", rows }

  let summary = null, bestPhase = null, worstPhase = null
  if (withEnough.length >= 2) {
    const ranked = [...withEnough].sort((a, b) => (avgOf(b) || 0) - (avgOf(a) || 0))
    bestPhase = ranked[0]; worstPhase = ranked[ranked.length - 1]
    const bestAvg = avgOf(bestPhase), worstAvg = avgOf(worstPhase)
    if (bestAvg != null && worstAvg != null && bestAvg !== worstAvg && PHASES[bestPhase] && PHASES[worstPhase]) {
      summary = `Your capacity has tended to run highest during your ${PHASES[bestPhase].name.toLowerCase()} phase and lowest during your ${PHASES[worstPhase].name.toLowerCase()} phase.`
    }
  } else {
    bestPhase = withEnough[0]
  }
  return { ready: true, rows, summary, bestPhase, worstPhase, allFour: withEnough.length === PHASE_ORDER.length, phasesTracked: withEnough.length }
}

// ── DATE LOOKUPS (for the calendar + day-detail card) ────────────────────────
function byDateMaps(history, woLog) {
  const byDate = {}
  history.forEach((d) => { if (d.dateISO) byDate[d.dateISO] = d })
  const woByDate = {}
  woLog.forEach((w) => { if (w.date) (woByDate[w.date] = woByDate[w.date] || []).push(w) })
  return { byDate, woByDate }
}

// ── RANGE SUMMARY (Week / Month / 3 Months / Year) ───────────────────────────
function avgForMonth(history, y, m) {
  const rows = history.filter((d) => d.date.getFullYear() === y && d.date.getMonth() === m)
  if (!rows.length) return null
  return round(rows.reduce((s, d) => s + d.pct, 0) / rows.length)
}

function yearMonths(history, y) {
  return Array.from({ length: 12 }, (_, m) => {
    const rows = history.filter((d) => d.date.getFullYear() === y && d.date.getMonth() === m)
    if (!rows.length) return { m, n: 0, avg: null, tier: null }
    const avg = round(rows.reduce((s, d) => s + d.pct, 0) / rows.length)
    const colors = {}
    rows.forEach((d) => { const t = d.pct < 15 ? "recovery" : d.color; colors[t] = (colors[t] || 0) + 1 })
    return { m, n: rows.length, avg, tier: Object.keys(colors).sort((a, b) => colors[b] - colors[a])[0] }
  })
}

// Builds the scoped rows + a short comparison line + a lightweight trend
// series (for the sparkline) for whichever range tab is active.
function rangeSummary(history, range, month) {
  let rows, compareText = null
  if (range === "week") {
    const today = new Date(); today.setHours(12, 0, 0, 0)
    const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 6)
    rows = history.filter((d) => d.date >= cutoff)
  } else if (range === "3months") {
    const cutoff = new Date(month.y, month.m - 2, 1)
    rows = history.filter((d) => d.date >= cutoff)
  } else if (range === "year") {
    rows = history.filter((d) => d.date.getFullYear() === month.y)
  } else {
    rows = history.filter((d) => d.date.getFullYear() === month.y && d.date.getMonth() === month.m)
    const prevM = month.m === 0 ? { y: month.y - 1, m: 11 } : { y: month.y, m: month.m - 1 }
    const thisAvg = avgForMonth(history, month.y, month.m)
    const prevAvg = avgForMonth(history, prevM.y, prevM.m)
    if (thisAvg != null && prevAvg != null) {
      const delta = thisAvg - prevAvg
      if (delta >= 3) compareText = `${delta}% higher than last month`
      else if (delta <= -3) compareText = `${Math.abs(delta)}% lower than last month — every month has its own shape`
      else compareText = "Steady compared with last month"
    }
  }
  if (!rows.length) return { hasData: false, rows: [] }
  const c = { green: 0, yellow: 0, red: 0, recovery: 0 }
  let sum = 0
  rows.forEach((d) => { sum += d.pct; c[d.pct < 15 ? "recovery" : d.color]++ })
  const avg = round(sum / rows.length)
  const topTier = Object.keys(c).sort((a, b) => c[b] - c[a])[0]
  const series = [...rows].sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1)).map((d) => ({ x: d.dateISO, y: d.pct, tier: d.pct < 15 ? "recovery" : d.color }))
  return { hasData: true, avg, counts: c, topTier, compareText, series, n: rows.length }
}

// ── MOVEMENT ─────────────────────────────────────────────────────────────────
function movementSummary({ woLog, programId, programStart }) {
  const totalWorkouts = woLog.length
  const catTally = {}
  woLog.forEach((w) => { const lbl = (WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label; catTally[lbl] = (catTally[lbl] || 0) + 1 })
  const favEntry = Object.entries(catTally).sort((a, b) => b[1] - a[1])[0]
  const sessions = [...woLog].sort((a, b) => (a.date < b.date ? 1 : -1))

  // Current program progress — only if she's actually chosen and started one.
  // PROG_BY_ID falls back to a default program for an unknown id, so an absent
  // programId must be checked BEFORE calling it, or progress would be invented
  // for someone who never picked a program.
  let program = null
  if (programId) {
    const prog = PROG_BY_ID(programId)
    const sched = programStart ? progSchedule(prog, programStart) : null
    program = { id: prog.id, name: prog.name, emoji: prog.emoji, totalWeeks: prog.weeks, started: !!programStart, week: sched ? Math.min(sched.week, prog.weeks) : null, complete: sched ? sched.complete : false }
  }

  // Consistency: distinct workout-days in the last 30 vs the 30 before that.
  // A decline is never surfaced as a message — silence is kinder here.
  let consistency = null
  if (woLog.length >= 3) {
    const today = new Date(); today.setHours(12, 0, 0, 0)
    // nearAgo/farAgo are both expressed as "days ago" — e.g. (0, 30) means
    // "within the last 30 days." Named to match how the call sites read.
    const inWindow = (dateStr, nearAgo, farAgo) => {
      const d = new Date(dateStr + "T12:00:00")
      const days = Math.floor((today - d) / 86400000)
      return days >= nearAgo && days < farAgo
    }
    const recentN = new Set(woLog.filter((w) => inWindow(w.date, 0, 30)).map((w) => w.date)).size
    const priorN = new Set(woLog.filter((w) => inWindow(w.date, 30, 60)).map((w) => w.date)).size
    if (recentN > 0 || priorN > 0) {
      const delta = recentN - priorN
      if (priorN === 0 && recentN > 0) consistency = { type: "started", msg: "You've been moving this past month." }
      else if (delta >= 2) consistency = { type: "up", msg: "You've moved more consistently over the past month." }
      else if (delta <= -2) consistency = { type: "down", msg: null }
      else consistency = { type: "steady", msg: "Your movement has stayed fairly steady." }
    }
  }

  // Longest real gap between two logged sessions, only surfaced if the return
  // was recent — this is what "came back after time away" is built from.
  let returned = null
  const uniqueDates = [...new Set(woLog.map((w) => w.date))].sort()
  if (uniqueDates.length >= 2) {
    const today = new Date(); today.setHours(12, 0, 0, 0)
    let maxGap = 0, gapEndDate = null
    for (let i = 1; i < uniqueDates.length; i++) {
      const a = new Date(uniqueDates[i - 1] + "T12:00:00"), b = new Date(uniqueDates[i] + "T12:00:00")
      const gap = Math.round((b - a) / 86400000)
      if (gap > maxGap) { maxGap = gap; gapEndDate = uniqueDates[i] }
    }
    if (maxGap >= 10 && gapEndDate) {
      const daysSinceReturn = Math.round((today - new Date(gapEndDate + "T12:00:00")) / 86400000)
      if (daysSinceReturn <= 21) returned = { gapDays: maxGap }
    }
  }

  return {
    totalWorkouts, favCat: favEntry ? favEntry[0] : null, sessions, program, consistency, returned,
    strength: { available: false }, // no weight/load data exists yet in Move
    milestones: { available: false }, // no PR data exists yet in Move
  }
}

// ── THIS MONTH — a factory bound to history/woLog/cyclePhase so the view can
// page backward by simply calling monthReview(y, m) for any past month. ──────
function makeMonthReview(history, woLog, cyclePhase) {
  return (y, m) => {
    const monthLabel = new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    const rows = history.filter((d) => d.date.getFullYear() === y && d.date.getMonth() === m)
    if (!rows.length) return { hasData: false, y, m, monthLabel }

    const counts = { green: 0, yellow: 0, red: 0, recovery: 0 }
    let sum = 0
    rows.forEach((d) => { sum += d.pct; counts[d.pct < 15 ? "recovery" : d.color]++ })
    const avg = round(sum / rows.length)

    const prevM = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }
    const prevAvg = avgForMonth(history, prevM.y, prevM.m)
    let compareText = null
    if (prevAvg != null) {
      const delta = avg - prevAvg
      if (delta >= 3) compareText = `Your average capacity rose ${delta} points compared with ${new Date(prevM.y, prevM.m, 1).toLocaleDateString("en-US", { month: "long" })}.`
      else if (delta <= -3) compareText = `Your average capacity was ${Math.abs(delta)} points lower than ${new Date(prevM.y, prevM.m, 1).toLocaleDateString("en-US", { month: "long" })} — a heavier month, not a failed one.`
    }

    const monthWo = woLog.filter((w) => { const d = new Date(w.date + "T12:00:00"); return d.getFullYear() === y && d.getMonth() === m })

    // Cross-system: does the week with the most workouts match the week with
    // the highest average capacity? Only stated when both sides are real and
    // they genuinely align — silence otherwise, never a forced connection.
    let crossSystem = null
    if (monthWo.length >= 2 && rows.length >= 8) {
      const weekOf = (d) => Math.floor((d.getDate() - 1) / 7)
      const capByWeek = {}, woByWeek = {}
      rows.forEach((d) => { const w = weekOf(d.date); (capByWeek[w] = capByWeek[w] || []).push(d.pct) })
      const woWeeks = {}
      monthWo.forEach((w) => { const wk = weekOf(new Date(w.date + "T12:00:00")); woWeeks[wk] = (woWeeks[wk] || 0) + 1 })
      const capWeekAvgs = Object.entries(capByWeek).filter(([, arr]) => arr.length >= 2).map(([wk, arr]) => [wk, arr.reduce((a, b) => a + b, 0) / arr.length])
      if (capWeekAvgs.length >= 2 && Object.keys(woWeeks).length >= 2) {
        const bestCapWeek = capWeekAvgs.sort((a, b) => b[1] - a[1])[0][0]
        const bestWoWeek = Object.entries(woWeeks).sort((a, b) => b[1] - a[1])[0][0]
        if (bestCapWeek === bestWoWeek) crossSystem = "Your most active week this month lined up with your highest-capacity week."
      }
    }

    const recoveryCount = counts.recovery
    const topTier = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]
    const TIER_LABEL = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }

    const topSupport = topOf(rows.filter((d) => d.color === "green"), "supports")

    const candidates = []
    if (monthWo.length > 0) candidates.push(`You completed ${monthWo.length} workout${monthWo.length === 1 ? "" : "s"} this month.`)
    if (compareText) candidates.push(compareText)
    if (crossSystem) candidates.push(crossSystem)
    if (recoveryCount >= 1) candidates.push(`You gave yourself ${recoveryCount} recovery day${recoveryCount === 1 ? "" : "s"} — deliberate rest, not falling behind.`)
    if (topSupport && topSupport[1] >= 2) candidates.push(`"${topSupport[0]}" showed up often around your Green Days this month.`)
    candidates.push(`${TIER_LABEL[topTier]} was your most common day this month.`)

    return { hasData: true, y, m, monthLabel, avg, counts, workoutsCount: monthWo.length, bullets: candidates.slice(0, 5) }
  }
}

// Every month from the earliest check-in to the current month, for backward
// navigation. Bounded by real data — never invented, never unbounded.
function pastMonths(history) {
  if (!history.length) return []
  const earliest = history[0].date
  const now = new Date()
  const out = []
  let y = now.getFullYear(), m = now.getMonth()
  while (y > earliest.getFullYear() || (y === earliest.getFullYear() && m >= earliest.getMonth())) {
    out.push({ y, m, label: new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }) })
    m--; if (m < 0) { m = 11; y-- }
    if (out.length >= 24) break // safety bound, not a fabricated limit on real months
  }
  return out
}

// ── WINS ─────────────────────────────────────────────────────────────────────
// Never a badge, never a streak counter. Each win only appears when the
// underlying data genuinely supports it, and every one is a real observation
// about a specific thing that happened.
function computeWins({ history, movement, momentum, cyclePhase }) {
  const wins = []

  if (movement.returned) {
    wins.push({ id: "returned", title: "You came back.", body: "You moved again after some time away — and that counts as much as anything." })
  }

  // "Listened": a day where the workout logged matched a harder check-in tier.
  const byDateColor = {}
  history.forEach((d) => { byDateColor[d.dateISO] = d.pct < 15 ? "recovery" : d.color })
  const listened = movement.sessions.some((w) => {
    const tier = byDateColor[w.date]
    return (tier === "red" || tier === "recovery") && (w.color === "red" || w.color === "recovery")
  })
  if (listened) wins.push({ id: "listened", title: "You listened.", body: "On at least one harder day, you chose movement that matched the capacity you actually had." })

  if (movement.program && movement.program.complete) {
    wins.push({ id: "program", title: "A program completed.", body: `You finished ${movement.program.name} — start to finish.` })
  }

  if (cyclePhase.ready && cyclePhase.summary) {
    wins.push({ id: "rhythm", title: "You're learning your rhythm.", body: "You've gathered enough check-ins to see a real pattern in how your capacity moves through your cycle." })
  }

  if (movement.consistency && movement.consistency.type === "up") {
    wins.push({ id: "consistency", title: "Moving more often.", body: "You've shown up for movement more consistently over the past month than the month before." })
  }

  if (momentum && momentum.dir === "up" && momentum.delta >= 8) {
    wins.push({ id: "capacity-up", title: "Steadier ground.", body: "Your average capacity has meaningfully risen over recent weeks." })
  }

  const recoveryDays = history.filter((d) => d.pct < 15).length
  if (recoveryDays >= 3) {
    wins.push({ id: "recovery", title: "You honored recovery.", body: "You've chosen rest instead of pushing through more than once. Recognizing what you need is its own kind of strength." })
  }

  return wins.slice(0, 4)
}

// ── ORCHESTRATOR ─────────────────────────────────────────────────────────────
// One call from pages/index.js returns everything the view needs. Functions
// on the returned object are already bound to history/woLog, matching the
// calling pattern the app already uses elsewhere (e.g. pd.avgForMonth(y, m)).
function buildProgress({ history, woLog, cycleLength, lastPeriod, effCycleLength, programId, programStart }) {
  const stats = capacityStats(history)
  const momentum = capacityMomentum(history)
  const weekly = weekdayPatterns(history)
  const recovery = recoveryPatterns(history)
  const cyclePhase = cyclePhaseCapacity(history, cycleLength, lastPeriod, effCycleLength)
  const { byDate, woByDate } = byDateMaps(history, woLog)
  const movement = movementSummary({ woLog, programId, programStart })
  const monthReview = makeMonthReview(history, woLog, cyclePhase)
  const wins = computeWins({ history, movement, momentum, cyclePhase })

  return {
    stats, momentum, weekly, recoveryPatterns: recovery, cyclePhase,
    byDate, woByDate,
    range: (r, month) => rangeSummary(history, r, month),
    avgForMonth: (y, m) => avgForMonth(history, y, m),
    yearMonths: (y) => yearMonths(history, y),
    movement, monthReview, pastMonths: pastMonths(history), wins,
    hasAnyData: history.length > 0 || woLog.length > 0,
  }
}

export { buildProgress, capacityStats, capacityMomentum, weekdayPatterns, recoveryPatterns, cyclePhaseCapacity, rangeSummary, movementSummary, makeMonthReview, pastMonths, computeWins }
