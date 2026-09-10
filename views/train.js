import { MOVE_IDEAS, MOODS, TIMES, CATEGORIES, CAPACITY_ZONES, M_BY_ID } from '../data/move.js'
import { BASE, colorFromPct, dayIndex } from '../lib/theme.js'

const MOVE_GRADIENTS = {
  Pilates: "linear-gradient(145deg,#EEDFF2,#D9C7E5)",
  Dance: "linear-gradient(145deg,#F3D9E5,#E7BFD3)",
  Strength: "linear-gradient(145deg,#DDD8E9,#C8C0DA)",
  Walking: "linear-gradient(145deg,#DCE8D7,#C4D6BE)",
  Yoga: "linear-gradient(145deg,#E8E0D6,#D7CCBE)",
  Gym: "linear-gradient(145deg,#DADCE5,#C3C7D4)",
  Running: "linear-gradient(145deg,#E4DDD7,#CEC1B7)",
  Cycling: "linear-gradient(145deg,#D9E4E8,#C0D2D9)",
  Barre: "linear-gradient(145deg,#F0E2E5,#DFC8CE)",
  Mobility: "linear-gradient(145deg,#E4E6DC,#CED5C4)",
  Outdoors: "linear-gradient(145deg,#DCE7D8,#C7D8C1)",
}

const ideaGradient = (idea) => {
  const first = (idea.category || [])[0]
  return MOVE_GRADIENTS[first] || "linear-gradient(145deg,#E9E1EA,#D8CEDD)"
}

const getPrimaryCategory = (idea) => (idea.category || [])[0] || "Move"
const hasAny = (arr, value) => !value || (arr || []).includes(value)

export function renderTrain(ctx) {
  const {
    bodyView, checkedIn, doneFeed = [], isSavedBloom, moveCategory, moveMood, moveTime,
    pct, savedBloom, setDoneFeed, setMoveCategory, setMoveMood, setMoveTime,
    tab, toggleSaveBloom
  } = ctx

  if (!(tab === "body" && bodyView === "gym")) return null

  const capKey = !checkedIn ? "yellow" : colorFromPct(pct)
  const zone = CAPACITY_ZONES[capKey]
  const savedIds = new Set((savedBloom || []).filter(id => String(id).startsWith("move:")).map(id => String(id).slice(5)))
  const savedOnly = moveCategory === "__saved__"
  const activeCategory = savedOnly ? null : moveCategory

  const clearFilters = () => {
    setMoveCategory(null)
    setMoveMood(null)
    setMoveTime(null)
  }

  const isDone = (idea) => doneFeed.includes("move:" + idea.id)
  const toggleDone = (idea) => {
    if (!setDoneFeed) return
    const id = "move:" + idea.id
    setDoneFeed(doneFeed.includes(id) ? doneFeed.filter(x => x !== id) : [...doneFeed, id])
  }

  let feed = MOVE_IDEAS.filter(idea =>
    (!savedOnly || savedIds.has(idea.id)) &&
    hasAny(idea.time, moveTime) &&
    hasAny(idea.mood, moveMood) &&
    hasAny(idea.category, activeCategory)
  )

  // Capacity influences ranking quietly; it never hides content.
  feed = [...feed].sort((a, b) => {
    const aa = (a.capacity || []).includes(capKey) ? 1 : 0
    const bb = (b.capacity || []).includes(capKey) ? 1 : 0
    if (aa !== bb) return bb - aa
    return MOVE_IDEAS.indexOf(a) - MOVE_IDEAS.indexOf(b)
  })

  // Default browse should feel mixed, not grouped.
  if (!moveTime && !moveMood && !activeCategory && !savedOnly && feed.length > 1) {
    const offset = dayIndex(feed.length)
    feed = [...feed.slice(offset), ...feed.slice(0, offset)]
  }

  const SmallTool = ({ icon, label, selected, onClick }) => (
    <div onClick={onClick} style={{
      minHeight: 64, borderRadius: 15, border: `1px solid ${selected ? "#C9558E" : BASE.border}`,
      background: selected ? "rgba(201,85,142,.09)" : BASE.surface,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", padding: "8px 6px"
    }}>
      <div style={{ fontSize: 17 }}>{icon}</div>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: selected ? "#C9558E" : BASE.cream, marginTop: 4 }}>{label}</div>
    </div>
  )

  const Chip = ({ label, selected, onClick }) => (
    <div onClick={onClick} style={{
      flex: "0 0 auto", whiteSpace: "nowrap", padding: "9px 11px", borderRadius: 999,
      border: `1px solid ${selected ? "#C9558E" : BASE.border}`,
      background: selected ? "#C9558E" : BASE.surface,
      color: selected ? "#fff" : BASE.creamDim,
      fontSize: 10.5, fontWeight: 800, cursor: "pointer"
    }}>{label}</div>
  )

  const SaveButton = ({ idea }) => {
    const id = "move:" + idea.id
    const saved = isSavedBloom(id)
    return (
      <button onClick={() => toggleSaveBloom(id)} style={{
        padding: "12px 8px", borderRadius: 13,
        border: `1px solid ${saved ? "#C9558E" : BASE.border}`,
        background: saved ? "rgba(201,85,142,.10)" : BASE.surface,
        color: saved ? "#C9558E" : BASE.creamDim,
        fontSize: 12.5, fontWeight: 800
      }}>{saved ? "♥ Saved" : "♡ Save"}</button>
    )
  }

  const DoneButton = ({ idea }) => {
    const done = isDone(idea)
    return (
      <button onClick={() => toggleDone(idea)} disabled={!setDoneFeed} style={{
        padding: "12px 8px", borderRadius: 13, border: "none",
        background: done ? "rgba(127,160,84,.14)" : "linear-gradient(135deg,#E984B4,#A87BD1)",
        color: done ? "#6F9148" : "#fff", fontSize: 12.5, fontWeight: 800,
        opacity: setDoneFeed ? 1 : .7
      }}>{done ? "✓ I Did This" : "I Did This"}</button>
    )
  }

  const MoveCard = ({ idea }) => {
    const img = idea.img || idea.image || idea.image_url || null
    const primary = getPrimaryCategory(idea)
    const link = idea.videoUrl || idea.url || null
    const walkthrough = idea.walkthrough || []
    const slides = link || walkthrough.length ? 2 : 1

    return (
      <div style={{ borderRadius: 25, overflow: "hidden", border: `1px solid ${BASE.border}`, background: BASE.surface, marginBottom: 24 }}>
        <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain" }}>
          <div style={{ flex: "0 0 100%", scrollSnapAlign: "start" }}>
            <div style={{ position: "relative", aspectRatio: "4 / 5", background: ideaGradient(idea), overflow: "hidden" }}>
              {img ? (
                <img src={img} alt={idea.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontSize: 72 }}>{idea.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase", color: "rgba(70,45,58,.55)" }}>Photo ready</span>
                </div>
              )}

              <div style={{ position: "absolute", top: 15, left: 15, display: "flex", gap: 7, flexWrap: "wrap", maxWidth: "78%" }}>
                <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.15, textTransform: "uppercase", padding: "7px 10px", borderRadius: 999, background: "rgba(255,255,255,.88)", color: "#76576A" }}>{primary}</span>
                {(idea.time || []).slice(0,1).map(t => <span key={t} style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.15, textTransform: "uppercase", padding: "7px 10px", borderRadius: 999, background: "rgba(255,255,255,.88)", color: "#76576A" }}>{t}</span>)}
              </div>

              {slides > 1 && <div style={{ position: "absolute", right: 14, bottom: 14, padding: "7px 11px", borderRadius: 999, background: "rgba(255,255,255,.89)", color: "#76576A", fontSize: 11, fontWeight: 800, fontStyle: "italic" }}>1 of {slides} →</div>}
            </div>

            <div style={{ padding: "18px 20px 19px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, color: BASE.cream, lineHeight: 1.15 }}>{idea.title}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: BASE.taupe, lineHeight: 1.5, marginTop: 7 }}>{idea.hook}</div>
              {idea.creator && <div style={{ fontSize: 10.5, fontWeight: 800, color: "#9B6BC3", marginTop: 9 }}>By {idea.creator}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                <DoneButton idea={idea} />
                <SaveButton idea={idea} />
              </div>
            </div>
          </div>

          {(link || walkthrough.length) && (
            <div style={{ flex: "0 0 100%", scrollSnapAlign: "start", padding: "22px 20px 24px", minHeight: 520 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C9558E" }}>{link ? "Start now" : "Walkthrough"}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: BASE.cream, marginTop: 5 }}>{idea.title}</div>
                </div>
                <div style={{ fontSize: 11, color: "#7FA054", fontWeight: 800 }}>2 of 2 ✓</div>
              </div>

              <div style={{ height: 1, background: BASE.border, margin: "16px 0" }} />

              {walkthrough.length > 0 && (
                <div>
                  {walkthrough.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: `0.5px solid ${BASE.border}` }}>
                      <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(201,85,142,.1)", color: "#C9558E", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {link && (
                <a href={link} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", marginTop: walkthrough.length ? 18 : 4 }}>
                  <div style={{ width: "100%", padding: "14px 15px", borderRadius: 14, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 13.5, fontWeight: 800, textAlign: "center" }}>
                    ▶ Watch workout
                  </div>
                </a>
              )}

              {idea.creator && <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginTop: 10, lineHeight: 1.5 }}>External workout by {idea.creator}. Opens their official YouTube content.</div>}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 20 }}>
                <DoneButton idea={idea} />
                <SaveButton idea={idea} />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const anyFilter = !!(moveTime || moveMood || moveCategory)

  return (
    <div className="fade-in" style={{ padding: "10px 18px 60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        <SmallTool icon="♡" label="Saved" selected={savedOnly} onClick={() => setMoveCategory(savedOnly ? null : "__saved__")} />
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream }}>Move Ideas</div>
          {anyFilter && <div onClick={clearFilters} style={{ fontSize: 11.5, fontWeight: 800, color: "#C9558E", cursor: "pointer" }}>Clear filters</div>}
        </div>

        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, textTransform: "uppercase", color: BASE.taupe, marginBottom: 8 }}>Time</div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
          {TIMES.map(t => <Chip key={t.key} label={t.key} selected={moveTime === t.key} onClick={() => setMoveTime(moveTime === t.key ? null : t.key)} />)}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, textTransform: "uppercase", color: BASE.taupe, marginBottom: 8 }}>Mood</div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4 }}>
          {MOODS.map(m => <Chip key={m} label={m} selected={moveMood === m} onClick={() => setMoveMood(moveMood === m ? null : m)} />)}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.6, textTransform: "uppercase", color: BASE.taupe, marginBottom: 8 }}>Type</div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 5 }}>
          {CATEGORIES.map(c => <Chip key={c} label={c} selected={activeCategory === c} onClick={() => setMoveCategory(activeCategory === c ? null : c)} />)}
        </div>
      </div>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 14, marginBottom: 16 }}>
        {savedOnly ? "Your saved movement ideas." : zone ? "Ideas that fit today are gently ranked first — nothing is hidden." : "Scroll everything, or narrow it down when you want."}
      </div>

      <div>
        {feed.length ? feed.map(idea => <MoveCard key={idea.id} idea={idea} />) : (
          <div style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "28px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 26 }}>✨</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: BASE.cream, marginTop: 8 }}>Nothing fits that combination yet.</div>
            <div style={{ fontSize: 12.5, color: BASE.taupe, marginTop: 6 }}>Clear one filter and keep browsing.</div>
          </div>
        )}
      </div>

      <div style={{ height: 20, paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  )
}
