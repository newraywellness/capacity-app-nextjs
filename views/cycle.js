import { CYCLE_PHASES, CYCLE_PHASE_ORDER, computeCycle } from '../data/cycle'
import { CYCLE_DEEP, CYCLE_QA, CYCLE_CONDITIONS, CYCLE_POSTPARTUM, CYCLE_BC, CYCLE_FERTILITY } from '../data/cyclelearn'
import { db } from '../lib/supabase'
import { BASE } from '../lib/theme'

const CAPACITY_META = {
  red: { label: 'Red', range: '0–35%', color: '#D65C4E' },
  yellow: { label: 'Yellow', range: '36–69%', color: '#E8B84B' },
  green: { label: 'Green', range: '70–100%', color: '#7FA054' },
}

const BC_DOT = '#325B8C'
const SPOTTING = { 'Brown spotting': '#8A5A44', 'Red spotting': '#C44755' }
const predictedOvulationDay = (len) => Math.max(10, Number(len || 28) - 14)
const fertileWindowFor = (len) => {
  const ov = predictedOvulationDay(len)
  return { start: Math.max(1, ov - 5), end: ov + 1, ov }
}

export function renderCycle(ctx) {
  const {
    bodyView, cycArticle, cycLib, cycLogDate, cycleAvg, cycleLength, cycleLogs, cycleMonth,
    cycleNow, editCycle, effCycleLength, history, lastPeriod, periodDismissed,
    saveCycleLog, saveCycleSettings, setCycArticle, setCycLib, setCycLogDate,
    setCycleMonth, setEditCycle, setLastPeriod, setPeriodDismissed, setTmpLen,
    setTmpStart, setUseAvgCycle, setupData, tab, tmpLen, tmpStart, useAvgCycle, user,
  } = ctx

  if (tab === 'body' && bodyView === 'cycle' && editCycle) {
    const today = new Date().toISOString().slice(0, 10)
    const d = cycLogDate || today
    const log = (cycleLogs && cycleLogs[d]) || {}
    const set = (k, v) => saveCycleLog(d, { [k]: v })
    const one = (k, v) => set(k, log[k] === v ? null : v)
    const persistLastPeriod = (iso) => {
      setLastPeriod(iso)
      setTmpStart(iso)
      setPeriodDismissed(true)
      try { window.localStorage.setItem('cap_last_period', iso) } catch (e) {}
      if (user && db) {
        try { db.from('profiles').update({ setup: { ...(setupData || {}), lastPeriod: iso } }).eq('id', user.id).then(() => {}) } catch (e) {}
      }
    }
    const setPeriodFlow = (flow) => {
      const next = log.period === flow ? null : flow
      set('period', next)
      if (!next) return

      // Treat a newly logged bleed well outside the current period as a new cycle start.
      // This lets an early/unexpected period immediately reset cycle day 1 without
      // incorrectly moving the start date forward on period day 2, 3, etc.
      const last = lastPeriod ? new Date(lastPeriod + 'T00:00:00') : null
      const selected = new Date(d + 'T00:00:00')
      const daysSinceLast = last ? Math.round((selected - last) / 86400000) : null
      if (!last || daysSinceLast == null || daysSinceLast >= 8) persistLastPeriod(d)
    }
    const many = (k, v) => {
      const arr = Array.isArray(log[k]) ? log[k] : []
      set(k, arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
    }
    const on = (k, v) => (Array.isArray(log[k]) ? log[k].includes(v) : log[k] === v)

    const Group = ({ ic, label, k, opts, multi, col, hint, onSelect }) => (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15 }}>{ic}</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{label}</span>
          {hint && <span style={{ fontSize: 10.5, color: BASE.taupe, fontStyle: 'italic' }}>{hint}</span>}
        </div>
        <div>
          {opts.map((raw) => {
            const o = typeof raw === 'string' ? { value: raw, label: raw } : raw
            const active = on(k, o.value)
            const activeCol = o.color || col || '#9B6BC3'
            return (
              <span key={o.value} onClick={() => (onSelect ? onSelect(o.value) : (multi ? many(k, o.value) : one(k, o.value)))}
                style={{ display: 'inline-block', padding: '10px 16px', borderRadius: 999, marginRight: 8, marginBottom: 9, cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500, background: active ? activeCol : BASE.surface, color: active ? '#fff' : BASE.creamDim, border: '1px solid ' + (active ? activeCol : BASE.border), boxShadow: active ? '0 2px 8px ' + activeCol + '40' : 'none' }}>
                {o.label}
              </span>
            )
          })}
        </div>
      </div>
    )

    const shift = (n) => {
      const dt = new Date(d + 'T00:00:00')
      dt.setDate(dt.getDate() + n)
      const iso = dt.toISOString().slice(0, 10)
      if (iso <= today) setCycLogDate(iso)
    }
    const label = new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    const count = Object.keys(log).length
    const lenPct = Math.max(0, Math.min(100, ((parseInt(tmpLen) || 28) - 20) / 25 * 100))

    return (
      <div className="fade-in" style={{ padding: '10px 20px 0', height: 'calc(100dvh - 86px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain', touchAction: 'pan-y' }}>
        <div onClick={() => setEditCycle(false)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: 'pointer', marginBottom: 14 }}>‹ Cycle</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream }}>Track</div>
        <div style={{ fontSize: 13, color: BASE.taupe, marginTop: 4, marginBottom: 18, lineHeight: 1.5 }}>{count ? `Saved as you go — ${count} ${count === 1 ? 'thing' : 'things'} noted.` : "Track anything you'd like to remember today."}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', padding: '9px 6px', borderRadius: 14, background: BASE.surface, border: '1px solid ' + BASE.border, marginBottom: 22 }}>
          <span onClick={() => shift(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, fontSize: 20, color: BASE.creamDim, cursor: 'pointer' }}>‹</span>
          <div style={{ textAlign: 'center', minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: d === today ? '#9B6BC3' : BASE.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d === today ? 'Today' : label}</div>
            {d !== today && <div style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 1 }}>{d}</div>}
          </div>
          <span onClick={() => shift(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, fontSize: 20, color: d === today ? BASE.border : BASE.creamDim, cursor: d === today ? 'default' : 'pointer' }}>›</span>
        </div>

        <div style={{ borderRadius: 16, background: BASE.surface, border: '1px solid ' + BASE.border, padding: '16px 16px 15px', marginBottom: 26, overflow: 'hidden' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: BASE.taupe, marginBottom: 13 }}>Cycle Settings</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: BASE.creamDim, marginBottom: 7 }}>First day of last period</div>
          <input type="date" value={tmpStart || lastPeriod || ''} max={today}
            onChange={(e) => { setTmpStart(e.target.value); saveCycleSettings(e.target.value, tmpLen) }}
            style={{ display: 'block', width: '100%', minWidth: 0, WebkitAppearance: 'none', appearance: 'none', padding: '12px 13px', borderRadius: 11, background: BASE.bg2 || BASE.surface2, border: '1px solid ' + BASE.border, color: BASE.cream, fontSize: 16, marginBottom: 18 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: BASE.creamDim }}>Typical cycle length</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: useAvgCycle && cycleAvg ? BASE.taupe : '#9B6BC3' }}>{tmpLen} days</span>
          </div>
          <input type="range" min="20" max="45" value={tmpLen}
            onChange={(e) => setTmpLen(e.target.value)}
            onMouseUp={(e) => saveCycleSettings(tmpStart || lastPeriod, e.target.value)}
            onTouchEnd={(e) => saveCycleSettings(tmpStart || lastPeriod, e.target.value)}
            style={{ display: 'block', width: '100%', height: 6, borderRadius: 999, background: `linear-gradient(90deg,#B9A3D4 ${lenPct}%,#E2DAEC ${lenPct}%)` }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: BASE.taupe, marginTop: 3 }}><span>20</span><span>45</span></div>
          {cycleAvg && <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid ' + BASE.border }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: BASE.creamDim }}>Use my calculated average</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2 }}>Recent average: <b style={{ color: '#9B6BC3' }}>{cycleAvg.avg} days</b></div>
              </div>
              <div onClick={() => setUseAvgCycle(!useAvgCycle)} style={{ width: 46, height: 27, borderRadius: 999, cursor: 'pointer', position: 'relative', background: useAvgCycle ? '#9B6BC3' : BASE.surface2, border: '1px solid ' + (useAvgCycle ? '#9B6BC3' : BASE.border) }}>
                <span style={{ position: 'absolute', top: 2, left: useAvgCycle ? 21 : 2, width: 21, height: 21, borderRadius: '50%', background: '#fff', transition: 'left .2s ease' }} />
              </div>
            </div>
          </div>}
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: BASE.taupe, marginBottom: 14 }}>Today's Tracking</div>
        <Group ic="🩸" label="Period" k="period" col="#A8556B" opts={['Light', 'Medium', 'Heavy']} onSelect={setPeriodFlow} />
        <Group ic="🟤" label="Spotting" k="spotting" col="#A8556B" opts={['Brown spotting', 'Red spotting']} />
        <Group ic="😊" label="Feelings" k="feelings" multi col="#C9558E" opts={['Calm', 'Happy', 'Motivated', 'Sensitive', 'Anxious', 'Irritable', 'Low']} />
        <Group ic="😖" label="Pain" k="pain" multi col="#D65C4E" opts={['Cramps', 'Headache', 'Back', 'Breast tenderness', 'Bloating', 'Nausea']} />
        <Group ic="💕" label="Sex Life" k="sex" multi col="#E3799F" opts={['Sex', 'Protected', 'Unprotected', 'High libido', 'Low libido']} />
        <Group ic="⚡" label="Energy Capacity" k="energyCapacity" hint="your whole-day capacity" opts={[
          { value: 'red', label: 'Red · 0–35%', color: CAPACITY_META.red.color },
          { value: 'yellow', label: 'Yellow · 36–69%', color: CAPACITY_META.yellow.color },
          { value: 'green', label: 'Green · 70–100%', color: CAPACITY_META.green.color },
        ]} />
        <Group ic="💊" label="Birth Control" k="bc" col="#5E7FB0" opts={['Taken', 'Late', 'Missed', 'Changed']} />
        <Group ic="💧" label="Discharge" k="discharge" col="#7FA054" opts={['Dry', 'Sticky', 'Creamy', 'Watery', 'Egg white']} />

        <div style={{ fontSize: 11.5, color: BASE.taupe, fontStyle: 'italic', lineHeight: 1.55, marginBottom: 20 }}>Energy Capacity is your quick whole-day snapshot. The calendar keeps it visible beside the cycle details you choose to track.</div>
        <div style={{ height: 90, paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    )
  }

  if (tab === 'body' && bodyView === 'cycle' && cycArticle) {
    const a = cycArticle
    const Block = ({ label, children, col }) => <><div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: col || '#C9558E', margin: '24px 0 10px' }}>{label}</div>{children}</>
    const Bullets = ({ items, col }) => items.map((x, i) => <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 7 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: col || '#C9558E', marginTop: 8, flexShrink: 0 }} /><span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{x}</span></div>)
    const Para = ({ children }) => <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.68, marginBottom: 14 }}>{children}</div>
    return (
      <div className="fade-in" style={{ padding: '10px 20px 0' }}>
        <div onClick={() => setCycArticle(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: 'pointer', marginBottom: 16 }}>‹ Understand Your Body</div>
        <div style={{ fontSize: 30 }}>{a.ic}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, color: BASE.cream, marginTop: 4 }}>{a.title}</div>
        {a.desc && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 14.5, color: BASE.taupe, marginTop: 8 }}>{a.desc}</div>}
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
        {a.body && a.body.map((p, i) => <Para key={i}>{p}</Para>)}
        {a.seek && <div style={{ borderRadius: 16, background: 'rgba(214,92,78,0.09)', border: '1px solid rgba(214,92,78,0.3)', padding: '16px 18px', marginTop: 22 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#D65C4E', marginBottom: 8 }}>WHEN TO SEEK CARE</div>{Array.isArray(a.seek) ? <Bullets items={a.seek} col="#D65C4E" /> : <Para>{a.seek}</Para>}</div>}
        {(a.tip || a.note) && <div style={{ borderRadius: 16, background: 'rgba(201,123,168,0.1)', padding: '16px 18px', marginTop: 14 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#C97BA8', marginBottom: 6 }}>A NURSE'S NOTE</div><div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 16, color: BASE.cream }}>{a.tip || a.note}</div></div>}
        <div style={{ fontSize: 11, color: BASE.taupe, textAlign: 'center', fontStyle: 'italic', margin: '18px 0 26px' }}>General education, not medical advice.</div>
      </div>
    )
  }

  if (tab === 'body' && bodyView === 'cycle') {
    const setup = cycleNow != null
    const now = new Date()
    const viewDate = new Date(now.getFullYear(), now.getMonth() + cycleMonth, 1)
    const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const startWeekday = (firstDay.getDay() + 6) % 7
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
    const todayISOstr = now.toISOString().slice(0, 10)
    const cells = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
    const currentPhase = cycleNow ? CYCLE_PHASES[cycleNow.phase] : null
    const trackFrom = lastPeriod ? new Date(lastPeriod + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null
    const periodDue = cycleNow && cycleNow.day >= cycleNow.length - 1 && !periodDismissed
    const legacyCapByDate = {}
    ;(history || []).forEach((h) => { if (h.dateISO && h.color) legacyCapByDate[h.dateISO] = h.color })
    const capacityForDate = (iso) => ((cycleLogs || {})[iso] || {}).energyCapacity || legacyCapByDate[iso] || null

    if (!setup) {
      return <div className="fade-in" style={{ padding: '10px 18px 0' }}><div style={{ borderRadius: 22, padding: '26px 22px', background: 'linear-gradient(135deg,#9B6BC3,#5E7FB0)', color: '#fff', marginBottom: 18 }}><div style={{ fontSize: 30 }}>🌙</div><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginTop: 6 }}>Understand your rhythm. Support your body.</div><div style={{ fontSize: 13, marginTop: 6, fontStyle: 'italic' }}>Your cycle is information — not a limitation.</div></div><div style={{ textAlign: 'center', padding: '26px 20px', borderRadius: 18, background: BASE.surface, border: '1px dashed ' + BASE.border }}><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: BASE.cream, marginBottom: 8 }}>Set up your cycle</div><button onClick={() => { setTmpLen('28'); setTmpStart(''); setEditCycle(true) }} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#9B6BC3,#5E7FB0)', color: '#fff', fontWeight: 700 }}>Set up my cycle</button></div></div>
    }

    const fertileMeta = fertileWindowFor(cycleNow.length)
    return (
      <div className="fade-in" style={{ padding: '10px 18px 0' }}>
        <div style={{ borderRadius: 22, padding: '20px', background: 'linear-gradient(135deg,#9B6BC3,#5E7FB0)', color: '#fff', marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.7, textTransform: 'uppercase', opacity: .8 }}>Today</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginTop: 4 }}>
            <div><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>Cycle Day {cycleNow.day}</div><div style={{ fontSize: 13, marginTop: 6 }}>{currentPhase.emoji} {currentPhase.name}</div></div>
            <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ''); setEditCycle(true) }} style={{ padding: '8px 13px', borderRadius: 999, border: '1px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.14)', color: '#fff', fontWeight: 700 }}>Track / Edit</button>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 13.5, marginTop: 10 }}>{currentPhase.insight}</div>
        </div>

        {trackFrom && <div style={{ padding: '11px 13px', borderRadius: 12, background: BASE.surface, border: '1px solid ' + BASE.border, marginBottom: 14, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}><div style={{ fontSize: 11.5, color: BASE.taupe }}>Tracking from: <b style={{ color: BASE.creamDim }}>{trackFrom}</b> · {cycleNow.length}-day cycle</div><button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ''); setEditCycle(true) }} style={{ background: 'none', border: 'none', color: '#9B6BC3', fontWeight: 700 }}>✏️ Edit</button></div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}><button onClick={() => setCycleMonth(cycleMonth - 1)} style={{ background: 'none', border: 'none', color: BASE.taupe, fontSize: 18 }}>‹</button><div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>{monthLabel}</div><button onClick={() => setCycleMonth(cycleMonth + 1)} style={{ background: 'none', border: 'none', color: BASE.taupe, fontSize: 18 }}>›</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>{['M','T','W','T','F','S','S'].map((d,i)=><div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: BASE.taupe }}>{d}</div>)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 14 }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />
            const iso = cell.toISOString().slice(0, 10)
            const c = computeCycle(effCycleLength || cycleLength, lastPeriod, cell)
            const standardPhase = c ? CYCLE_PHASES[c.phase] : null
            const inFertileWindow = !!(c && c.day >= fertileMeta.start && c.day <= fertileMeta.end)
            const isPredictedOvulation = !!(c && c.day === fertileMeta.ov)
            const displayPhase = inFertileWindow ? CYCLE_PHASES.ovulation : standardPhase
            const isToday = iso === todayISOstr
            const lg = (cycleLogs || {})[iso] || {}
            const capKey = capacityForDate(iso)
            const capacity = CAPACITY_META[capKey] || null
            const hasSex = Array.isArray(lg.sex) && lg.sex.length > 0
            const periodDrops = lg.period === 'Heavy' ? 3 : lg.period === 'Medium' ? 2 : lg.period === 'Light' ? 1 : 0
            const bcTaken = lg.bc === 'Taken'
            const spottingColor = SPOTTING[lg.spotting] || null
            return <div key={i} style={{ aspectRatio: '1', borderRadius: 9, background: displayPhase ? displayPhase.soft : 'transparent', border: isToday ? '2px solid ' + displayPhase.color : '1px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 3, left: 3, right: 3, height: 8, display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden' }}>
                {capacity && <span style={{ width: 5, height: 5, borderRadius: '50%', background: capacity.color, flexShrink: 0 }} />}
                {hasSex && <span style={{ fontSize: 6.5, color: '#E3799F', lineHeight: 1 }}>♥</span>}
                {Array.from({ length: periodDrops }).map((_, j) => <span key={j} style={{ fontSize: 6.5, lineHeight: 1 }}>🩸</span>)}
                {spottingColor && <span style={{ width: 5, height: 5, borderRadius: '50%', background: spottingColor }} />}
                {bcTaken && <span style={{ width: 5, height: 5, borderRadius: '50%', background: BC_DOT }} />}
              </div>
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: displayPhase ? displayPhase.color : BASE.taupe }}>{cell.getDate()}</div>
              {c && <div style={{ fontSize: 7.5, color: displayPhase.color, opacity: .8 }}>d{c.day}</div>}
              {isPredictedOvulation && <span style={{ position: 'absolute', right: 3, bottom: 3, width: 6, height: 6, borderRadius: '50%', background: CYCLE_PHASES.ovulation.color, border: '1px solid rgba(255,255,255,.9)' }} />}
            </div>
          })}
        </div>

        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: BASE.taupe, textAlign: 'center', marginBottom: 7 }}>Cycle phases</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 10 }}>{CYCLE_PHASE_ORDER.map((k)=>{const ph=CYCLE_PHASES[k];return <div key={k} style={{ display:'flex',alignItems:'center',gap:5 }}><span style={{ width:11,height:11,borderRadius:3.5,background:ph.soft,border:'1.5px solid '+ph.color }}/><span style={{ fontSize:10.5,color:BASE.taupe }}>{ph.name.replace(' Phase','')}</span></div>})}</div>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: BASE.taupe, textAlign: 'center', marginBottom: 6 }}>Calendar markers</div>
        <div style={{ display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',marginBottom:8 }}>
          {Object.entries(CAPACITY_META).map(([k,v])=><div key={k} style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:v.color}}/><span style={{fontSize:9.5,color:BASE.taupe}}>{v.label} {v.range}</span></div>)}
          <span style={{display:'flex',alignItems:'center',gap:4,fontSize:9.5,color:BASE.taupe}}><span style={{fontSize:9,color:'#E3799F',lineHeight:1}}>♥</span> Sex</span>
          <span style={{display:'flex',alignItems:'center',gap:4,fontSize:9.5,color:BASE.taupe}}><span style={{fontSize:9,lineHeight:1}}>🩸</span> Period</span>
          <span style={{display:'flex',alignItems:'center',gap:4,fontSize:9.5,color:BASE.taupe}}><span style={{width:6,height:6,borderRadius:'50%',background:'#8A5A7A',display:'inline-block',flexShrink:0}}/> Spotting</span>
          <span style={{display:'flex',alignItems:'center',gap:4,fontSize:9.5,color:BASE.taupe}}><span style={{width:6,height:6,borderRadius:'50%',background:BC_DOT,display:'inline-block',flexShrink:0}}/> Birth control</span>
        </div>
        <div style={{ fontSize: 10.5, color: BASE.taupe, textAlign: 'center', lineHeight: 1.5, marginBottom: 12 }}>The fertile window is shown as a full predicted week. The small lower-right dot marks estimated ovulation day.</div>

        <button onClick={() => { const iso = new Date().toISOString().slice(0,10); setLastPeriod(iso); try { window.localStorage.setItem('cap_last_period', iso) } catch(e){}; if(user&&db){try{db.from('profiles').update({setup:{...(setupData||{}),lastPeriod:iso}}).eq('id',user.id).then(()=>{})}catch(e){}}; setPeriodDismissed(true) }} style={{ width:'100%',padding:10,borderRadius:11,border:'1px dashed rgba(155,107,195,.4)',background:'rgba(155,107,195,.06)',color:'#9B6BC3',fontWeight:700,marginBottom:14 }}>🌙 My period started today</button>

        {periodDue && <div style={{ borderRadius:16,background:'rgba(155,107,195,.1)',border:'1px solid rgba(155,107,195,.35)',padding:'16px 18px',marginBottom:14 }}><div style={{fontSize:14,fontWeight:700,color:BASE.cream}}>Did your period start today?</div><div style={{display:'flex',gap:10,marginTop:12}}><button onClick={()=>{const iso=new Date().toISOString().slice(0,10);setLastPeriod(iso);setPeriodDismissed(true)}} style={{flex:1,padding:12,borderRadius:12,border:'none',background:'linear-gradient(135deg,#9B6BC3,#5E7FB0)',color:'#fff',fontWeight:700}}>Yes, today</button><button onClick={()=>setPeriodDismissed(true)} style={{flex:1,padding:12,borderRadius:12,border:'1px solid '+BASE.border,background:'transparent',color:BASE.creamDim,fontWeight:700}}>Not yet</button></div></div>}

        <div style={{ borderRadius:18,background:currentPhase.soft,border:'1px solid '+currentPhase.color,padding:'17px 18px',marginBottom:14 }}>
          <div style={{ fontSize:10.5,fontWeight:700,letterSpacing:1,color:currentPhase.color,textTransform:'uppercase' }}>Today · Cycle Day {cycleNow.day}</div>
          <div style={{ fontFamily:"'Cormorant Garamond', serif",fontSize:21,fontWeight:700,color:BASE.cream,margin:'2px 0 8px' }}>{currentPhase.emoji} {currentPhase.name}</div>
          {(currentPhase.feels||[]).slice(0,4).map((f,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:6}}><span style={{width:5,height:5,borderRadius:'50%',background:currentPhase.color,marginTop:7}}/><span style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.5}}>{f}</span></div>)}
          {(currentPhase.supportToday||currentPhase.suggestions||[]).slice(0,4).map((s,i)=><div key={'s'+i} style={{display:'flex',gap:8,marginBottom:6}}><span style={{width:5,height:5,borderRadius:'50%',background:currentPhase.color,marginTop:7}}/><span style={{fontSize:12.5,color:BASE.creamDim,lineHeight:1.5}}>{s}</span></div>)}
        </div>

        <div style={{ fontFamily:"'Cormorant Garamond', serif",fontSize:22,fontWeight:700,marginBottom:4 }}>Understand Your Body</div>
        <div style={{ fontSize:12.5,color:BASE.taupe,lineHeight:1.55,marginBottom:16 }}>Written to help you understand what you're feeling — never to worry you.</div>
        {[["🌙","Your Cycle","What happens in each phase",CYCLE_DEEP],["🤍","Common Questions","The things women actually search",CYCLE_QA],["🌸","Health Conditions","PCOS, endometriosis, PMDD and more",CYCLE_CONDITIONS],["👶","Postpartum","What's normal, and when to call",CYCLE_POSTPARTUM],["💊","Birth Control","Understanding your options",CYCLE_BC],["🌱","Fertility","Ovulation and your fertile window",CYCLE_FERTILITY]].map(([ic,name,sub,items])=>{const open=cycLib===name;return <div key={name} style={{borderRadius:16,background:BASE.surface,border:'1px solid '+BASE.border,marginBottom:9,overflow:'hidden'}}><div onClick={()=>setCycLib(open?null:name)} style={{display:'flex',alignItems:'center',gap:12,padding:'15px 16px',cursor:'pointer'}}><span style={{fontSize:20}}>{ic}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:BASE.cream}}>{name}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:12.5,color:BASE.taupe,marginTop:2}}>{sub}</div></div><span style={{color:BASE.taupe}}>›</span></div>{open&&<div className="fade-in" style={{padding:'0 12px 12px'}}>{items.map((it)=><div key={it.id} onClick={()=>setCycArticle(it)} style={{display:'flex',alignItems:'center',gap:11,padding:'12px 14px',borderRadius:12,border:'1px solid '+BASE.border,marginBottom:7,cursor:'pointer'}}><span style={{fontSize:17}}>{it.ic}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:BASE.cream}}>{it.title}</div><div style={{fontFamily:"'Cormorant Garamond', serif",fontStyle:'italic',fontSize:11.5,color:BASE.taupe}}>{it.desc}</div></div><span style={{color:BASE.taupe}}>›</span></div>)}</div>}</div>})}
        <div style={{ fontSize:11,color:BASE.taupe,textAlign:'center',fontStyle:'italic',lineHeight:1.6,margin:'14px 0 20px' }}>General education, not medical advice. Your provider knows your situation best.</div>
        <div style={{height:20}}/>
      </div>
    )
  }

  return null
}
