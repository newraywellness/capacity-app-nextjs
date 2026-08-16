// ============ MOVE ============
// True Reverie no longer builds guided fitness programs. Move is now a small,
// editorial movement-discovery surface: capacity-aware, mood/time/category
// browsable, and structurally ready for real personalization and Rebuilds
// later — neither of which is built here. The exported name (renderTrain)
// and the "gym" bodyView key are unchanged on purpose; the visible label was
// already "Move" in the nav before this rewrite (pages/index.js), so nothing
// upstream needed to change — only what renders inside this tab.
//
// data/train.js and data/exercises.js (the old program/exercise engine) are
// deliberately NOT imported here — they remain untouched because Today,
// More, and Progress still depend on their exports (PROG_BY_ID, progSchedule,
// WO_TYPES). This file simply stops being one of their consumers.

import { MOVE_IDEAS, MOODS, TIMES, CATEGORIES, CAPACITY_ZONES, CREATORS, byMood, byTime, byCategory, byCapacity, M_BY_ID } from '../data/move.js'
import { BASE, THEMES, colorFromPct, dayIndex } from '../lib/theme.js'

export function renderTrain(ctx) {
  const { bodyView, cur, checkedIn, isSavedBloom, moveCategory, moveMood, moveSurpriseIdx, moveTime, pct, savedBloom, setMoveCategory, setMoveMood, setMoveSurpriseIdx, setMoveTime, tab, toggleSaveBloom } = ctx
  if (!(tab === "body" && bodyView === "gym")) return null

  const capKey = !checkedIn ? "yellow" : colorFromPct(pct)
  const zone = CAPACITY_ZONES[capKey]

  // ── shared building blocks, used everywhere an idea appears ──────────────
  const Head = ({ ic, name, sub }) => (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <span style={{ fontSize: 17 }}>{ic}</span>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: BASE.cream }}>{name}</span>
      </div>
      {sub && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: BASE.taupe, marginTop: 4 }}>{sub}</div>}
    </div>
  )

  const SaveHeart = ({ id }) => {
    const saved = isSavedBloom(id)
    return (
      <span onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); toggleSaveBloom(id) }}
        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 7, margin: -7, borderRadius: "50%", cursor: "pointer", flexShrink: 0 }}>
        <span style={{ fontSize: 19, color: saved ? "#C9558E" : BASE.taupe, lineHeight: 1 }}>{saved ? "\u2665" : "\u2661"}</span>
      </span>
    )
  }

  const IdeaCard = ({ idea, w }) => (
    <div style={{ width: w || 190, flexShrink: 0, borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "15px 15px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <span style={{ fontSize: 22 }}>{idea.emoji}</span>
        <SaveHeart id={"move:" + idea.id} />
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: BASE.cream, marginTop: 8, lineHeight: 1.25 }}>{idea.title}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12, color: BASE.taupe, marginTop: 5, lineHeight: 1.45 }}>{idea.hook}</div>
      {idea.creator && <div style={{ fontSize: 10, color: "#9B6BC3", fontWeight: 700, marginTop: 8, letterSpacing: 0.3 }}>{"\u2192 "}{idea.creator}</div>}
    </div>
  )

  const Rail = ({ items }) => (
    <div style={{ display: "flex", gap: 11, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory", padding: "2px 22px 4px", margin: "0 -22px" }}>
      {items.map((idea) => <div key={idea.id} style={{ scrollSnapAlign: "start" }}><IdeaCard idea={idea} /></div>)}
    </div>
  )

  const Chip = ({ label, ic, selected, onClick }) => (
    <span onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 15px", borderRadius: 999, marginRight: 8, marginBottom: 8, cursor: "pointer",
      fontSize: 12.5, fontWeight: selected ? 700 : 500,
      background: selected ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface,
      color: selected ? "#fff" : BASE.creamDim,
      border: `1px solid ${selected ? "transparent" : BASE.border}` }}>
      {ic && <span style={{ fontSize: 12 }}>{ic}</span>}{label}
    </span>
  )

  const Reveal = ({ items, emptyNote }) => (
    <div className="fade-in" style={{ marginTop: 4 }}>
      {items.length ? <Rail items={items.slice(0, 3)} /> : (
        <div style={{ margin: "0 22px", fontSize: 12, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.6 }}>{emptyNote || "More ideas for this are on the way."}</div>
      )}
    </div>
  )

  // ── Surprise Me: a sensible default (today's pick, same all day) until she
  // taps for another — never a blank prompt, always something to see. ──────
  const surpriseIdx = moveSurpriseIdx === null ? dayIndex(MOVE_IDEAS.length) : moveSurpriseIdx
  const surpriseIdea = MOVE_IDEAS[surpriseIdx]
  const nextSurprise = () => setMoveSurpriseIdx((surpriseIdx + 1 + Math.floor(dayIndex(7))) % MOVE_IDEAS.length)

  // ── Saved: reuses the exact same savedBloom/toggleSaveBloom every other
  // save in the app uses — a "move:" prefix, not a second system. ──────────
  const savedMoveIdeas = (savedBloom || [])
    .filter((id) => id.indexOf("move:") === 0)
    .map((id) => M_BY_ID(id.slice(5)))
    .filter(Boolean)

  const recSuggestions = byCapacity(capKey).slice(0, 3)

  return (
    <div className="fade-in" style={{ padding: "10px 22px 60px" }}>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: BASE.cream, lineHeight: 1.1 }}>Move</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, marginTop: 8, marginBottom: 34 }}>What would feel good today?</div>

      {/* ═══ YOUR CAPACITY — a suggestion, never a restriction; everything
           below remains fully browsable regardless of this section. ═══ */}
      <div>
        <Head ic={"\ud83c\udf38"} name={"Your Capacity \u00b7 " + zone.label + " " + pct + "%"} sub={zone.line} />
        <Rail items={recSuggestions} />
      </div>

      {/* ═══ SURPRISE ME ═══ */}
      <div style={{ marginTop: 34 }}>
        <Head ic={"\u2728"} name="Surprise Me" sub="Let True Reverie choose for you." />
        <div style={{ borderRadius: 20, background: "linear-gradient(150deg,#F3E4EC 0%,#E9DCEE 55%,#DCD3E8 100%)", border: "1px solid rgba(168,123,209,0.25)", padding: "20px 20px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <span style={{ fontSize: 30 }}>{surpriseIdea.emoji}</span>
            <SaveHeart id={"move:" + surpriseIdea.id} />
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: BASE.cream, marginTop: 10 }}>{surpriseIdea.title}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: BASE.creamDim, marginTop: 6, lineHeight: 1.5 }}>{surpriseIdea.hook}</div>
          {surpriseIdea.creator && <div style={{ fontSize: 11, color: "#9B6BC3", fontWeight: 700, marginTop: 10 }}>{"\u2192 "}{surpriseIdea.creator}</div>}
          <div onClick={nextSurprise} style={{ textAlign: "center", marginTop: 16, padding: "12px 0", borderRadius: 13, background: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8B5FA8" }}>Surprise Me Again {"\u2192"}</span>
          </div>
        </div>
      </div>

      {/* ═══ MOVE FOR YOUR MOOD ═══ */}
      <div style={{ marginTop: 34 }}>
        <Head ic={"\ud83d\udcad"} name="Move For Your Mood" sub="What are you in the mood for?" />
        <div>{MOODS.map((m) => <Chip key={m} label={m} selected={moveMood === m} onClick={() => setMoveMood(moveMood === m ? null : m)} />)}</div>
        {moveMood && <Reveal items={byMood(moveMood)} />}
      </div>

      {/* ═══ QUICK MOVES ═══ */}
      <div style={{ marginTop: 34 }}>
        <Head ic={"\u23f1\ufe0f"} name="Quick Moves" sub="Something that fits your actual day." />
        <div>{TIMES.map((t) => <Chip key={t.key} label={t.key} ic={t.ic} selected={moveTime === t.key} onClick={() => setMoveTime(moveTime === t.key ? null : t.key)} />)}</div>
        {moveTime && <Reveal items={byTime(moveTime)} />}
      </div>

      {/* ═══ EXPLORE ═══ */}
      <div style={{ marginTop: 34 }}>
        <Head ic={"\ud83e\udded"} name="Explore" sub="Browse by what you already know you love." />
        <div>{CATEGORIES.map((c) => <Chip key={c} label={c} selected={moveCategory === c} onClick={() => setMoveCategory(moveCategory === c ? null : c)} />)}</div>
        {moveCategory && <Reveal items={byCategory(moveCategory)} emptyNote={"More " + moveCategory + " ideas are coming soon."} />}
      </div>

      {/* ═══ CREATORS WE LOVE ═══ */}
      <div style={{ marginTop: 34 }}>
        <Head ic={"\ud83c\udf9e\ufe0f"} name="Creators We Love" sub="Movement from voices outside True Reverie." />
        {CREATORS.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 15px", borderRadius: 15, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 9 }}>
            <span style={{ fontSize: 20 }}>{c.ic}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{c.name}</div>
              <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2, lineHeight: 1.4 }}>{c.blurb}</div>
            </div>
            <span style={{ fontSize: 10, color: BASE.taupe, fontStyle: "italic", flexShrink: 0 }}>Coming soon</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.6, marginTop: 6 }}>True Reverie doesn't own or host this content. Once linked, every entry will credit its creator and point you to their official page.</div>
      </div>

      {/* ═══ SAVED ═══ */}
      <div style={{ marginTop: 34 }}>
        <Head ic={"\u2661"} name="Saved" sub="Ideas you've kept, ready when you are." />
        {savedMoveIdeas.length ? (
          <Rail items={savedMoveIdeas} />
        ) : (
          <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.6 }}>Tap the heart on any idea to keep it here.</div>
        )}
      </div>

      {/* Clears the fixed bottom nav + iPhone home-indicator safe area —
          same proven spacer already used in views/cycle.js and Bloom. */}
      <div style={{ height: 20, paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  )
}
