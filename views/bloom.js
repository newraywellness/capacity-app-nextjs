import { BLOOM_INVITATIONS, BLOOM_PILLARS, BLOOM_SECTIONS, BLOOM_TRENDING } from '../data/bloom.js'
import { GLOW_TOPICS, GLOW_BY_KEY } from '../data/glow.js'
import { RESET_DAY, RESET_NIGHT, RESET_SONGS, RESET_EXPLORE } from '../data/reset.js'
import { F_TIMES, F_IMG, F_BY_ID, byTag, seasonalSet, timeFeed, relatedByMood } from '../data/flourish.js'
import { BASE, dayIndex } from '../lib/theme.js'

export function renderBloom(ctx) {
  const { bloomArticle, bloomCard, bloomPillar, checkedIn, closeBloom, cur, flourishProject, flourishTime, glowItem, glowOpen, glowSheet, glowTopic, isSavedBloom, openBloomCard, pct, resetPage, resetSeed, resetSongs, setBloomArticle, setBloomPillar, setFlourishProject, setFlourishTime, setGlowItem, setGlowOpen, setGlowSheet, setGlowTopic, setResetPage, setResetSongs, surpriseReset, tab, toggleSaveBloom } = ctx

    // One save control for all of Glow/Reset/Flourish, so "obvious and
    // consistent" is true by construction rather than by copying styles
    // between call sites. `overlay` is for the two spots a heart sits on top
    // of a photograph (Flourish rail cards, Flourish time-feed cards) rather
    // than in a plain header row.
    const Heart = ({ id, overlay }) => {
      const saved = isSavedBloom(id)
      return (
        <span onClick={(e) => { if (e && e.stopPropagation) e.stopPropagation(); toggleSaveBloom(id) }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 9, margin: -9, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
            background: overlay ? "rgba(255,255,255,0.85)" : "transparent", boxShadow: overlay ? "0 1px 4px rgba(0,0,0,0.15)" : "none" }}>
          <span style={{ fontSize: 24, lineHeight: 1, color: saved ? "#C9558E" : (overlay ? "#C79BB4" : BASE.taupe) }}>{saved ? "\u2665" : "\u2661"}</span>
        </span>
      )
    }

    // Pass 1 navigation only — the four sections stay exactly as they were;
    // this is just a consistent way to jump directly between their top-level
    // views. Deep nested state (a specific Glow item, a specific Flourish
    // project, a Reset Explore page) is cleared on switch so each tab always
    // opens at that section's own landing, never a stale sub-screen.
    const switchPillar = (k) => {
      setGlowTopic(null); setGlowItem(null); setGlowSheet(null)
      setFlourishProject(null); setFlourishTime(null)
      setResetPage(null)
      setBloomPillar(k)
    }
    const BloomTabs = () => (
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["foryou", "For You"], ["glow", "Glow"], ["flourish", "Flourish"], ["seasonal", "Seasonal"]].map(([k, lbl]) => {
          const active = k === "foryou" ? !bloomPillar : bloomPillar === k
          return (
            <span key={k} onClick={() => switchPillar(k === "foryou" ? null : k)}
              style={{ flex: 1, textAlign: "center", padding: "10px 4px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                background: active ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface,
                color: active ? "#fff" : BASE.creamDim,
                border: `1px solid ${active ? "transparent" : BASE.border}` }}>{lbl}</span>
          )
        })}
      </div>
    )

    if (tab === "bloom" && bloomCard) {
      const sec = BLOOM_PILLARS.find((x) => x.cards.some((c) => c.n === bloomCard.n)) || BLOOM_PILLARS[0]
      const card = bloomCard
      return (
        <div className="fade-in" style={{ padding: 0 }}>
          <div style={{ position: "relative", padding: "26px 24px 30px", background: sec.grad, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -16, right: -10, fontSize: 90, opacity: 0.16 }}>🌸</div>
            <div style={{ position: "absolute", bottom: -24, left: -12, fontSize: 66, opacity: 0.12 }}>🌷</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, position: "relative" }}>
              <span onClick={closeBloom} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700 }}>{"\u2039"} Back</span>
              <span onClick={() => toggleSaveBloom("topic:" + card.n)} style={{ fontSize: 20, cursor: "pointer", lineHeight: 1, opacity: isSavedBloom("topic:" + card.n) ? 1 : 0.55 }}>{isSavedBloom("topic:" + card.n) ? "\u2665" : "\u2661"}</span>
            </div>
            <div style={{ fontSize: 42, position: "relative" }}>{card.ic}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#fff", marginTop: 6, position: "relative", textShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>{card.n}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16.5, color: "rgba(255,255,255,0.95)", marginTop: 6, position: "relative", lineHeight: 1.4 }}>{card.intro}</div>
          </div>
          <div style={{ padding: "26px 24px 20px" }}>
            {card.blocks.map((b, bi) => (
              <div key={bi} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#C97BA8", marginBottom: 12 }}>{b.h}</div>
                {b.items && b.items.map((it, ii) => (
                  <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C97BA8", marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontSize: 14.5, color: "#5A4458", lineHeight: 1.5 }}>{it}</span>
                  </div>
                ))}
                {b.body && <div style={{ fontSize: 14.5, color: "#5A4458", lineHeight: 1.6 }}>{b.body}</div>}
              </div>
            ))}
            {card.note && (
              <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A True Reverie reminder</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "#7E5578", lineHeight: 1.45 }}>{card.note}</div>
              </div>
            )}
            {card.future && (
              <div style={{ fontSize: 11.5, color: "#A88BA0", textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>{card.future}</div>
            )}
            <div style={{ fontSize: 11.5, color: "#B39BAE", textAlign: "center", fontStyle: "italic", marginTop: 18, lineHeight: 1.6 }}>Nothing here to complete. Take whatever feels good and leave the rest.</div>
            <button onClick={closeBloom} style={{ width: "100%", marginTop: 22, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: sec.grad, color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>Done</button>
          </div>
        </div>
      )
    }
    // ── ARTICLE ──────────────────────────────────────────────────────────
    if (tab === "bloom" && bloomArticle) {
      const a = bloomArticle
      const sid = "article:" + a.id
      return (
        <div className="fade-in" style={{ padding: 0 }}>
          <div style={{ position: "relative", padding: "26px 24px 30px", background: "linear-gradient(135deg,#F0B7D4,#A87BD1)", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -16, right: -10, fontSize: 90, opacity: 0.14 }}>{a.ic}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, position: "relative" }}>
              <span onClick={() => setBloomArticle(null)} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700 }}>{"\u2039"} Back</span>
              <span onClick={() => toggleSaveBloom(sid)} style={{ fontSize: 20, cursor: "pointer", lineHeight: 1, opacity: isSavedBloom(sid) ? 1 : 0.55 }}>{isSavedBloom(sid) ? "\u2665" : "\u2661"}</span>
            </div>
            <div style={{ fontSize: 38, position: "relative" }}>{a.ic}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "#fff", marginTop: 6, position: "relative", lineHeight: 1.15 }}>{a.title}</div>
          </div>
          <div style={{ padding: "26px 24px 24px" }}>
            {a.body.map((para, i) => (
              <div key={i} style={{ fontSize: 14.5, color: "#5A4458", lineHeight: 1.65, marginBottom: 16 }}>{para}</div>
            ))}
            {a.note && (
              <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginTop: 6, marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A nurse's note</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16.5, color: "#7E5578", lineHeight: 1.45 }}>{a.note}</div>
              </div>
            )}
            <div style={{ fontSize: 11.5, color: "#B39BAE", textAlign: "center", fontStyle: "italic", marginTop: 14, lineHeight: 1.6 }}>General education, not medical advice. Your provider knows your situation best.</div>
            <button onClick={() => setBloomArticle(null)} style={{ width: "100%", marginTop: 22, padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#F0B7D4,#A87BD1)", color: "#fff", fontSize: 14, fontWeight: 700 }}>Done</button>
          </div>
        </div>
      )
    }


    // ══════════════ GLOW · quick-win sheet ══════════════
    if (tab === "bloom" && glowSheet) {
      const w = glowSheet, sid = "win:" + w.id
      const Tier = ({ ic, label, item }) => (
        <div style={{ display: "flex", gap: 11, padding: "13px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
          <span style={{ fontSize: 16, lineHeight: 1.3 }}>{ic}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: BASE.taupe }}>{label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: BASE.cream, marginTop: 3, lineHeight: 1.3 }}>{item.n}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 4, lineHeight: 1.45 }}>{item.w}</div>
          </div>
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span onClick={() => setGlowSheet(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>{"\u2039 Back"}</span>
            <Heart id={sid} />
          </div>
          <div style={{ fontSize: 30 }}>{w.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream, marginTop: 4, lineHeight: 1.15 }}>{w.name}</div>

          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "26px 0 10px" }}>Why it works</div>
          <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.65 }}>{w.why}</div>

          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "26px 0 10px" }}>How to use</div>
          {w.how.map((h, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9558E", marginTop: 8, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{h}</span>
            </div>
          ))}

          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "26px 0 10px" }}>Products we love</div>
          <Tier ic="💰" label="Budget" item={w.prod.budget} />
          <Tier ic="🥇" label="Best overall" item={w.prod.best} />
          <Tier ic="✨" label="Luxury" item={w.prod.lux} />

          <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", margin: "18px 0 8px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>Nurse's tip</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, lineHeight: 1.45 }}>{w.tip}</div>
          </div>
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, margin: "16px 0 26px" }}>General education, not medical advice. Patch test anything new.</div>
        </div>
      )
    }

    // ══════════════ GLOW · an item inside a section ══════════════
    if (tab === "bloom" && glowTopic && glowItem) {
      const T = GLOW_BY_KEY(glowTopic), it = glowItem
      const Tier = ({ ic, label, item }) => (
        <div style={{ display: "flex", gap: 11, padding: "13px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
          <span style={{ fontSize: 16, lineHeight: 1.3 }}>{ic}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: BASE.taupe }}>{label}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: BASE.cream, marginTop: 3, lineHeight: 1.3 }}>{item.n}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 4, lineHeight: 1.45 }}>{item.w}</div>
          </div>
        </div>
      )
      const List = ({ label, items, col }) => (
        <>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: col, margin: "22px 0 10px" }}>{label}</div>
          {items.map((x, i) => (
            <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, marginTop: 8, flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{x}</span>
            </div>
          ))}
        </>
      )
      const sid = "glow:" + glowTopic + ":" + (it.id || it.n)
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span onClick={() => setGlowItem(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>{"\u2039 Back"}</span>
            <Heart id={sid} />
          </div>
          {it.img && (
            <>
              <img src={it.img} alt={it.title} style={{ width: "100%", display: "block", borderRadius: 18, border: `1px solid ${BASE.border}` }} />
              {it.items && (
                <>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 10px" }}>Shop the look</div>
                  {it.items.map((piece, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 7 }}>
                      <span style={{ flex: 1, fontSize: 13.5, color: BASE.cream }}>{piece}</span>
                      <span style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic" }}>link soon</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, margin: "14px 0 26px" }}>Shoppable links are on the way.</div>
                </>
              )}
            </>
          )}
          {it.ic && !it.img && <div style={{ fontSize: 28 }}>{it.ic}</div>}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream, marginTop: 4, lineHeight: 1.18 }}>{it.title || it.n}</div>
          {(it.desc || it.b || it.i) && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 8, lineHeight: 1.5 }}>{it.desc || it.b || it.i}</div>}

          {/* Professional treatment record: what · who · downtime · best for · verdict · aftercare */}
          {it.what && (
            <>
              {[["What it is", it.what], ["Who it's for", it.who], ["Downtime", it.downtime]].map(([lbl, txt]) => (
                <div key={lbl}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 9px" }}>{lbl}</div>
                  <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.65 }}>{txt}</div>
                </div>
              ))}

              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 10px" }}>Best for</div>
              {it.best.map(([concern, mark], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 13px", borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{mark}</span>
                  <span style={{ flex: 1, fontSize: 13, color: mark === "❌" ? BASE.taupe : BASE.cream, fontWeight: mark === "✅" ? 600 : 400 }}>{concern}</span>
                </div>
              ))}
              <div style={{ fontSize: 10.5, color: BASE.taupe, fontStyle: "italic", marginTop: 8, lineHeight: 1.5 }}>✅ well supported {"\u00b7"} 🤔 modest or mixed evidence {"\u00b7"} ❌ not what it's for</div>

              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 10px" }}>Worth the money?</div>
              <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 18 }}>{it.worth[0]}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{it.worth[1]}</span>
                </div>
                <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6, marginTop: 9 }}>{it.worth[2]}</div>
              </div>

              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 10px" }}>Avoid afterwards</div>
              {it.avoid.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 9, marginBottom: 7 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D65C4E", marginTop: 8, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{a}</span>
                </div>
              ))}
            </>
          )}

          {it.when && (
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 18, padding: "12px 14px", borderRadius: 13, background: "rgba(255,255,255,0.05)", border: `1px solid ${BASE.border}` }}>
              <span style={{ fontSize: 14, lineHeight: 1.4 }}>🕰️</span>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: BASE.taupe }}>When to wear it</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: BASE.creamDim, marginTop: 3, lineHeight: 1.45 }}>{it.when}</div>
              </div>
            </div>
          )}
          {it.do && <List label="Do this" items={it.do} col="#7FA054" />}
          {it.no && <List label="Skip this" items={it.no} col="#D65C4E" />}

          {it.p && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 10px" }}>Products we love</div>
              <Tier ic="💰" label="Budget" item={it.p.budget} />
              <Tier ic="🥇" label="Best overall" item={it.p.best} />
              <Tier ic="✨" label="Luxury" item={it.p.lux} />
            </>
          )}

          {it.body && (
            <div style={{ marginTop: 20 }}>
              {it.body.map((para, i) => (
                <div key={i} style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.68, marginBottom: 15 }}>{para}</div>
              ))}
            </div>
          )}
          {it.note && (
            <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginTop: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A nurse's note</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, lineHeight: 1.45 }}>{it.note}</div>
            </div>
          )}
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, margin: "20px 0 26px" }}>General education, not medical advice.</div>
        </div>
      )
    }

    // ══════════════ GLOW · WARDROBE (editorial) ══════════════
    // Images lead, text supports. Horizontal galleries rather than lists.
    if (tab === "bloom" && glowTopic === "wardrobe" && !glowItem) {
      const T = GLOW_BY_KEY("wardrobe"), WD = T.wardrobe
      const isOpen = (k) => (Array.isArray(glowOpen) ? glowOpen : ["guides", "wins"]).indexOf(k) >= 0
      const open = Array.isArray(glowOpen) ? glowOpen : ["guides", "wins"]
      const toggle = (k) => { if (setGlowOpen) setGlowOpen(isOpen(k) ? open.filter((x) => x !== k) : [...open, k]) }

      const Rail = ({ items, w }) => (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory", padding: "2px 22px 6px", margin: "0 -22px" }}>
          {items.map((o) => (
            <div key={o.id} onClick={() => setGlowItem(o)} style={{ flex: "0 0 auto", width: w, scrollSnapAlign: "center", cursor: "pointer" }}>
              <img src={o.img} alt={o.title} loading="lazy" style={{ width: "100%", display: "block", borderRadius: 16, border: `1px solid ${BASE.border}` }} />
              <div style={{ marginTop: 9 }}>
                {o.eyebrow && <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "#C9558E" }}>{o.eyebrow}</div>}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream, marginTop: 2, lineHeight: 1.2 }}>{o.title}</div>
                {o.sub && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>{o.sub}</div>}
              </div>
            </div>
          ))}
        </div>
      )

      const Head = ({ ic, name, sub }) => (
        <div style={{ margin: "0 0 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 17 }}>{ic}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", color: BASE.taupe }}>{name}</span>
          </div>
          {sub && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: BASE.taupe, marginTop: 5 }}>{sub}</div>}
        </div>
      )

      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div onClick={() => setGlowTopic(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 Glow"}</div>
          <div style={{ fontSize: 30 }}>{T.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 2 }}>Wardrobe</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 6, marginBottom: 30 }}>Who do you want to be today?</div>

          <Head ic="👗" name="Today's Outfit" sub="Current in style inspiration" />
          <Rail items={WD.today} w={252} />

          <div style={{ height: 38 }} />
          <Head ic="✨" name="Outfit Ideas" sub="Everyday looks, elevated" />
          <Rail items={WD.ideas} w={186} />

          <div style={{ height: 38 }} />
          <Head ic="💪" name="Gym Style" sub="Strong. Confident. Comfortable." />
          <Rail items={WD.gym} w={252} />

          {/* full-width editorial plates */}
          {WD.plates.map((pl) => (
            <div key={pl.id} style={{ marginTop: 38 }}>
              <Head ic={pl.ic} name={pl.title} sub={pl.sub} />
              <img src={pl.img} alt={pl.title} loading="lazy" onClick={() => setGlowItem(pl)}
                style={{ width: "100%", display: "block", borderRadius: 16, border: `1px solid ${BASE.border}`, cursor: "pointer" }} />
            </div>
          ))}

          {/* the only written section, kept deliberately short */}
          <div style={{ height: 34 }} />
          <div onClick={() => toggle("learn")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 4px 12px", cursor: "pointer" }}>
            <span style={{ fontSize: 19 }}>📖</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>Learn</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>Four short reads, no more</div>
            </div>
            <span style={{ color: BASE.taupe, fontSize: 15, transform: isOpen("learn") ? "rotate(90deg)" : "none", transition: "transform 0.22s ease" }}>{"\u203a"}</span>
          </div>
          {isOpen("learn") && (
            <div className="fade-in">
              {T.learn.map((a) => (
                <div key={a.id} onClick={() => setGlowItem(a)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 15, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8, cursor: "pointer" }}>
                  <span style={{ fontSize: 19 }}>{a.ic}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream, lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 3 }}>{a.desc}</div>
                  </div>
                  <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                </div>
              ))}
            </div>
          )}

          <div onClick={() => toggle("favs")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 4px 12px", cursor: "pointer" }}>
            <span style={{ fontSize: 19 }}>❤️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>Women's Favorites</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>The most-saved looks</div>
            </div>
            <span style={{ color: BASE.taupe, fontSize: 15, transform: isOpen("favs") ? "rotate(90deg)" : "none", transition: "transform 0.22s ease" }}>{"\u203a"}</span>
          </div>
          {isOpen("favs") && (
            <div className="fade-in" style={{ borderRadius: 18, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "26px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 9 }}>{"\u2661"}</div>
              <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.65 }}>As women save looks, the most-loved outfits will gather here.</div>
            </div>
          )}
          <div style={{ height: 30 }} />
        </div>
      )
    }

    // ══════════════ GLOW · a topic ══════════════
    // Ordered the way she actually arrives: what should I buy, what should I do,
    // how is my situation different, why does this work, what do others love.
    // Products and Quick Wins are open on arrival; the rest wait to be asked for.
    if (tab === "bloom" && glowTopic) {
      const T = GLOW_BY_KEY(glowTopic)
      // Defensive: if this view ever renders before the state that feeds it,
      // fall back to the intended defaults rather than crashing the page.
      const open = Array.isArray(glowOpen) ? glowOpen : ["guides", "wins"]
      const isOpen = (k) => open.indexOf(k) >= 0
      const toggle = (k) => { if (setGlowOpen) setGlowOpen(isOpen(k) ? open.filter((x) => x !== k) : [...open, k]) }

      const Row = ({ x, onTap }) => (
        <div onClick={onTap} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 15, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8, cursor: "pointer" }}>
          {x.ic && <span style={{ fontSize: 19 }}>{x.ic}</span>}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream, lineHeight: 1.3 }}>{x.title || x.name || x.n}</div>
            {(x.desc || x.b || x.i) && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 3, lineHeight: 1.4 }}>{x.desc || x.b || x.i}</div>}
          </div>
          <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
        </div>
      )

      const Grouped = ({ items, onTap }) => {
        if (!items.length || !items[0].g) return items.map((x, i) => <Row key={i} x={x} onTap={() => onTap(x)} />)
        const order = []
        items.forEach((x) => { if (order.indexOf(x.g) < 0) order.push(x.g) })
        return order.map((gname, gi) => (
          <div key={gname} style={{ marginBottom: gi < order.length - 1 ? 26 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "#C9558E", marginBottom: 10 }}>{gname}</div>
            {items.filter((x) => x.g === gname).map((x, i) => <Row key={i} x={x} onTap={() => onTap(x)} />)}
          </div>
        ))
      }

      const Section = ({ k, ic, name, sub, children }) => (
        <div style={{ marginBottom: 14 }}>
          <div onClick={() => toggle(k)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 4px 12px", cursor: "pointer" }}>
            <span style={{ fontSize: 19 }}>{ic}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{name}</div>
              {sub && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>{sub}</div>}
            </div>
            <span style={{ color: BASE.taupe, fontSize: 15, transform: isOpen(k) ? "rotate(90deg)" : "none", transition: "transform 0.22s ease" }}>{"\u203a"}</span>
          </div>
          {isOpen(k) && <div className="fade-in" style={{ paddingBottom: 6 }}>{children}</div>}
        </div>
      )

      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div onClick={() => setGlowTopic(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 Glow"}</div>
          <div style={{ fontSize: 32 }}>{T.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 4, marginBottom: 10 }}>{T.name}</div>

          <Section k="guides" ic="🛍️" name="Products We Love" sub="Curated by True Reverie">
            <Grouped items={T.guides || []} onTap={(x) => setGlowItem(x)} />
          </Section>

          <Section k="wins" ic="✨" name="Quick Wins" sub="Fast, useful, evidence-based">
            <Grouped items={T.wins || []} onTap={(x) => setGlowSheet(x)} />
          </Section>

          {T.extra && (
            <Section k="extra" ic={T.extraIc} name={T.extraName} sub={T.extraSub}>
              <Grouped items={T.extra} onTap={(x) => setGlowItem(x)} />
            </Section>
          )}

          <Section k="types" ic={T.typesIc} name={T.typesName} sub={T.typesSub}>
            <Grouped items={T.types || []} onTap={(x) => setGlowItem(x)} />
          </Section>

          <Section k="learn" ic="📖" name="Learn" sub="The why, when you want it">
            <Grouped items={T.learn || []} onTap={(x) => setGlowItem(x)} />
          </Section>

          <Section k="favs" ic="❤️" name="Women's Favorites" sub="Loved by the community">
            <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "24px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 9 }}>{"\u2661"}</div>
              <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.65 }}>Built from what thousands of women save. As saves gather, the most-loved discoveries in {T.name} will appear here.</div>
            </div>
          </Section>

          <div style={{ height: 30 }} />
        </div>
      )
    }

    // ══════════════ RESET · an Explore More page ══════════════
    if (tab === "bloom" && bloomPillar === "reset" && resetPage) {
      const P = RESET_EXPLORE.find((x) => x.id === resetPage) || RESET_EXPLORE[0]
      const capKey3 = !checkedIn ? "yellow" : pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green"
      const sid = "reset:" + P.id
      const Label = ({ children }) => (
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9B6BC3", margin: "26px 0 12px" }}>{children}</div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span onClick={() => setResetPage(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>{"\u2039 Reset"}</span>
            <Heart id={sid} />
          </div>
          <div style={{ fontSize: 30 }}>{P.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream, marginTop: 4, lineHeight: 1.18 }}>{P.title}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 6 }}>{P.sub}</div>
          <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.65, marginTop: 16 }}>{P.intro}</div>

          {P.steps && (<>
            <Label>{P.id === "deep-stretch" ? "The sequence" : "How to"}</Label>
            {P.steps.map((st, i) => (
              <div key={i} style={{ display: "flex", gap: 13, marginBottom: 15 }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "rgba(155,107,195,0.14)", color: "#9B6BC3", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{st[0]}{st.length > 2 && <span style={{ fontWeight: 500, color: BASE.taupe }}> {"\u00b7"} {st[1]}</span>}</div>
                  <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginTop: 3 }}>{st.length > 2 ? st[2] : st[1]}</div>
                </div>
              </div>
            ))}
          </>)}

          {P.byCapacity && (<>
            <Label>Ideas for today</Label>
            {(P.byCapacity[capKey3] || P.byCapacity.yellow).map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#9B6BC3", marginTop: 8, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{x}</span>
              </div>
            ))}
          </>)}

          {P.prompts && P.prompts.map(([grp, list]) => (
            <div key={grp}>
              <Label>{grp}</Label>
              {list.map((q, i) => (
                <div key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15.5, color: BASE.cream, lineHeight: 1.5, padding: "11px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>{q}</div>
              ))}
            </div>
          ))}

          {P.techniques && (<>
            <Label>Techniques</Label>
            {P.techniques.map(([name, when, how], i) => (
              <div key={i} style={{ borderRadius: 15, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "15px 17px", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{name}</div>
                <div style={{ fontSize: 11.5, color: "#9B6BC3", fontWeight: 600, marginTop: 3 }}>{when}</div>
                <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginTop: 7 }}>{how}</div>
              </div>
            ))}
          </>)}

          {P.tips && (<>
            <Label>Worth knowing</Label>
            {P.tips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#9B6BC3", marginTop: 8, flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{t}</span>
              </div>
            ))}
          </>)}

          <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginTop: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A nurse's note</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, lineHeight: 1.45 }}>{P.note}</div>
          </div>
          <div style={{ height: 30 }} />
        </div>
      )
    }

    // ══════════════ RESET ══════════════
    // Suggestions are the content. They open nothing, complete nothing, track
    // nothing. The only navigation on this page is Explore More.
    if (tab === "bloom" && bloomPillar === "reset") {
      const capKey2 = !checkedIn ? "yellow" : pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green"
      const COUNT = { red: 3, yellow: 4, green: 5 }[capKey2]
      const seedFor = (which) => {
        const d = new Date().toISOString().slice(0, 10)
        return resetSeed && resetSeed.d === d ? (resetSeed[which] || 0) : 0
      }
      const window_ = (pool, off) => {
        const out = []
        for (let i = 0; i < COUNT; i++) out.push(pool[(off * COUNT + i) % pool.length])
        return out
      }
      const dayList = window_(RESET_DAY[capKey2], seedFor("day"))
      const nightList = window_(RESET_NIGHT[capKey2], seedFor("night"))

      const Label = ({ children }) => (
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: BASE.taupe, textAlign: "center", opacity: 0.85 }}>{children}</div>
      )
      const Line = ({ s, i, section }) => {
        const key = section + ":" + i + ":" + s.text
        const openSongs = resetSongs === key
        return (
          <div style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
              <span style={{ fontSize: 17, lineHeight: 1.35, flexShrink: 0 }}>{s.ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17.5, color: BASE.cream, lineHeight: 1.45 }}>{s.text}</div>
                {s.extra && s.extra.kind === "songs" && (
                  <div onClick={() => setResetSongs(openSongs ? null : key)}
                    style={{ fontSize: 11.5, fontWeight: 700, color: "#9B6BC3", marginTop: 7, cursor: "pointer", letterSpacing: 0.2 }}>
                    {openSongs ? "Hide" : RESET_SONGS[s.extra.mood].label} {openSongs ? "" : "\u203a"}
                  </div>
                )}
                {openSongs && (
                  <div className="fade-in" style={{ marginTop: 9 }}>
                    {RESET_SONGS[s.extra.mood].songs.map((song, si) => (
                      <div key={si} style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.7 }}>{song}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
      const Surprise = ({ which }) => (
        <div onClick={() => surpriseReset(which)} style={{ textAlign: "center", marginTop: 4, cursor: "pointer" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#9B6BC3", letterSpacing: 0.3 }}>{"\u2728"} Surprise me</span>
        </div>
      )

      return (
        <div className="fade-in" style={{ padding: "0 24px" }}>
          <div onClick={() => setBloomPillar(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", paddingTop: 10, marginBottom: 20 }}>{"\u2039 Bloom"}</div>

          <div style={{ textAlign: "center", paddingTop: 6 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: BASE.cream, lineHeight: 1.1 }}>Reset</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, marginTop: 10, lineHeight: 1.45 }}>A gentle reminder that today is enough.</div>
          </div>

          <div style={{ height: 52 }} />
          <Label>Today's Reset</Label>
          <div style={{ height: 20 }} />
          {dayList.map((s, i) => <Line key={i} s={s} i={i} section="day" />)}
          <Surprise which="day" />

          <div style={{ height: 52 }} />
          <Label>Tonight's Reset</Label>
          <div style={{ height: 20 }} />
          {nightList.map((s, i) => <Line key={i} s={s} i={i} section="night" />)}
          <Surprise which="night" />

          <div style={{ height: 56 }} />
          <Label>Explore More</Label>
          <div style={{ height: 20 }} />
          {RESET_EXPLORE.map((P) => (
            <div key={P.id} onClick={() => setResetPage(P.id)}
              style={{ display: "flex", alignItems: "center", gap: 13, padding: "15px 17px", borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 19 }}>{P.ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{P.title}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>{P.sub}</div>
              </div>
              <span style={{ color: BASE.taupe, fontSize: 16 }}>{"\u203a"}</span>
            </div>
          ))}
          <div style={{ height: 44 }} />
        </div>
      )
    }

    // ── shared: image with a branded placeholder until photography exists ──
    const FImg = ({ p, radius, ratio }) => (
      <div style={{ position: "relative", width: "100%", aspectRatio: ratio || "4 / 5", borderRadius: radius === 0 ? 0 : (radius || 16), overflow: "hidden",
        background: "linear-gradient(150deg,#F3E4EC 0%,#E9DCEE 45%,#DCD3E8 100%)",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 52, opacity: 0.24 }}>{p.emoji}</span>
        <img src={F_IMG(p.id)} alt={p.title} loading="lazy"
          onError={(e) => { e.target.style.display = "none" }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    )

    // ══════════════ FLOURISH · project ══════════════
    if (tab === "bloom" && bloomPillar === "flourish" && flourishProject) {
      const P = F_BY_ID(flourishProject)
      if (!P) { setFlourishProject(null); return null }
      const sid = "flourish:" + P.id
      const rel = relatedByMood(P, 6)
      const isRecipe = (P.category || []).some((c) => ["Baking", "Cooking", "Coffee", "Tea"].indexOf(c) >= 0)
      const Label = ({ children }) => (
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "26px 0 12px" }}>{children}</div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", marginBottom: 14 }}>
            <span onClick={() => setFlourishProject(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>{"\u2039 Back"}</span>
            <Heart id={sid} />
          </div>
          <div style={{ padding: "0 22px" }}><FImg p={P} /></div>
          <div style={{ padding: "0 22px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream, marginTop: 18, lineHeight: 1.18 }}>{P.emoji} {P.title}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, marginTop: 6 }}>{P.sub}</div>
            <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 10 }}>
              {P.time}{P.category && P.category.length ? " · " + P.category.join(", ") : ""}{P.season && P.season.length ? " · " + P.season.join(", ") : ""}
            </div>
            <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.68, marginTop: 16 }}>{P.intro}</div>

            {P.materials && P.materials.length > 0 && (<>
              <Label>{isRecipe ? "Ingredients" : "Materials"}</Label>
              {P.materials.map((m2, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9558E", marginTop: 8, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{m2}</span>
                </div>
              ))}
            </>)}

            {P.steps && P.steps.length > 0 && (<>
              <Label>How to</Label>
              {P.steps.map((st, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <span style={{ flexShrink: 0, width: 23, height: 23, borderRadius: "50%", background: "rgba(201,85,142,0.12)", color: "#C9558E", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.6 }}>{st}</span>
                </div>
              ))}
            </>)}

            {P.tips && P.tips.length > 0 && (<>
              <Label>Worth knowing</Label>
              {P.tips.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#7FA054", marginTop: 8, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.55 }}>{t}</span>
                </div>
              ))}
            </>)}

            {P.shop && P.shop.length > 0 && (<>
              <Label>Shop this</Label>
              {P.shop.map((x, i) => <div key={i} style={{ fontSize: 13.5, color: BASE.creamDim, marginBottom: 7 }}>{x}</div>)}
            </>)}
            {P.creator && <div style={{ fontSize: 12, color: BASE.taupe, fontStyle: "italic", marginTop: 16 }}>{P.creator}</div>}

            {P.note && (
              <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginTop: 22 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A nurse's note</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.cream, lineHeight: 1.45 }}>{P.note}</div>
              </div>
            )}
          </div>

          {rel.label && (
            <div style={{ marginTop: 30 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, padding: "0 22px", marginBottom: 12 }}>{rel.label}</div>
              <div style={{ display: "flex", gap: 11, overflowX: "auto", WebkitOverflowScrolling: "touch", padding: "2px 22px 6px" }}>
                {rel.items.map((r) => (
                  <div key={r.id} onClick={() => setFlourishProject(r.id)} style={{ flex: "0 0 auto", width: 132, cursor: "pointer" }}>
                    <FImg p={r} radius={13} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: BASE.cream, marginTop: 7, lineHeight: 1.3 }}>{r.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: 34 }} />
        </div>
      )
    }

    // ══════════════ FLOURISH · a time feed ══════════════
    if (tab === "bloom" && bloomPillar === "flourish" && flourishTime) {
      const T2 = F_TIMES.find((t) => t.key === flourishTime) || F_TIMES[0]
      const feed = timeFeed(T2.key, new Date())
      return (
        <div className="fade-in" style={{ padding: "10px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", marginBottom: 12 }}>
            <span onClick={() => setFlourishTime(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>{"\u2039 Flourish"}</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: BASE.taupe }}>{T2.ic} {T2.label}</span>
          </div>
          {feed.length === 0 ? (
            <div style={{ margin: "0 22px", borderRadius: 18, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "30px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{T2.ic}</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.65 }}>More ideas for {T2.label.toLowerCase()} are on the way.</div>
            </div>
          ) : (
            <div style={{ scrollSnapType: "y mandatory", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
              {feed.map((p) => (
                <div key={p.id} onClick={() => setFlourishProject(p.id)}
                  style={{ scrollSnapAlign: "start", padding: "0 22px 22px", cursor: "pointer" }}>
                  <div style={{ position: "relative" }}>
                    <FImg p={p} ratio="4 / 5" />
                    <div style={{ position: "absolute", top: 14, right: 29 }}><Heart id={"flourish:" + p.id} overlay /></div>
                  </div>
                  <div style={{ paddingTop: 12 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: BASE.cream, lineHeight: 1.2 }}>{p.emoji} {p.title}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: BASE.taupe, marginTop: 4 }}>{p.sub}</div>
                    <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 7 }}>{p.minutes >= 1440 ? "Overnight" : p.minutes + " min"}{p.category && p.category.length ? " · " + p.category[0] : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ height: 30 }} />
        </div>
      )
    }

    // ══════════════ FLOURISH · landing ══════════════
    if (tab === "bloom" && bloomPillar === "flourish") {
      const season = seasonalSet(new Date(), 4)
      const Rail2 = ({ items }) => (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory", padding: "2px 22px 6px", margin: "0 -22px" }}>
          {items.map((p) => {
            const sid = "flourish:" + p.id
            return (
              <div key={p.id} style={{ flex: "0 0 auto", width: 172, scrollSnapAlign: "center" }}>
                <div style={{ position: "relative" }}>
                  <div onClick={() => setFlourishProject(p.id)} style={{ cursor: "pointer" }}><FImg p={p} /></div>
                  <div style={{ position: "absolute", top: 6, right: 7 }}><Heart id={sid} overlay /></div>
                </div>
                <div onClick={() => setFlourishProject(p.id)} style={{ cursor: "pointer", marginTop: 9 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream, lineHeight: 1.22 }}>{p.title}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 3, lineHeight: 1.35 }}>{p.sub}</div>
                </div>
              </div>
            )
          })}
        </div>
      )
      const Head = ({ children }) => (
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", color: BASE.taupe, marginBottom: 13 }}>{children}</div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <BloomTabs />
          <div onClick={() => setBloomPillar(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 18 }}>{"\u2039 Bloom"}</div>
          <div style={{ fontSize: 30 }}>{"\ud83d\udcd6"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 2 }}>Flourish</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 6, marginBottom: 32 }}>Learn, create, and become her.</div>

          <Head>{"\u2b50"} This Week's Highlights</Head>
          <Rail2 items={byTag("Highlight")} />

          <div style={{ height: 36 }} />
          <Head>{"\u2764\ufe0f"} Flourish Favorites</Head>
          <Rail2 items={byTag("Flourish Favorite")} />

          <div style={{ height: 36 }} />
          <Head>{"🍂"} {season.label}</Head>
          <Rail2 items={season.items} />

          <div style={{ height: 40 }} />
          <Head>Browse by Time</Head>
          {F_TIMES.map((t) => (
            <div key={t.key} onClick={() => setFlourishTime(t.key)}
              style={{ display: "flex", alignItems: "center", gap: 13, padding: "16px 17px", borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 19 }}>{t.ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{t.label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>{t.sub}</div>
              </div>
              <span style={{ color: BASE.taupe, fontSize: 16 }}>{"\u203a"}</span>
            </div>
          ))}
          <div style={{ height: 40 }} />
        </div>
      )
    }

    // ── INSIDE A PILLAR ──────────────────────────────────────────────────
    // ══════════════ SEASONAL · Pass 1 placeholder only ══════════════
    if (tab === "bloom" && bloomPillar === "seasonal") {
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <BloomTabs />
          <div style={{ textAlign: "center", padding: "60px 14px" }}>
            <div style={{ fontSize: 30, marginBottom: 14 }}>{"\ud83c\udf42"}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream }}>Seasonal</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, marginTop: 10, lineHeight: 1.55 }}>Something new is always around the corner.</div>
          </div>
        </div>
      )
    }
    if (tab === "bloom" && bloomPillar) {
      const P = BLOOM_PILLARS.find((x) => x.key === bloomPillar) || BLOOM_PILLARS[0]
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <BloomTabs />
          <div onClick={() => setBloomPillar(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 Bloom"}</div>
          <div style={{ fontSize: 30 }}>{P.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream, marginTop: 4 }}>{P.name}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 4, marginBottom: 22 }}>{P.sub}</div>
          {/* Built topics lead with value: three tappable quick wins, then More. */}
          {P.key === "glow" && GLOW_TOPICS.map((T) => (
            <div key={T.key} style={{ borderRadius: 20, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 18px 14px", marginBottom: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{T.ic}</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream }}>{T.name}</span>
              </div>
              {/* Editorial topics lead with an image rather than a list. */}
              {T.editorial ? (
                <>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: BASE.taupe, margin: "8px 0 12px" }}>Who do you want to be today?</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {T.wardrobe.today.concat(T.wardrobe.ideas).slice(0, 3).map((o) => (
                      <img key={o.id} src={o.img} alt={o.title} loading="lazy"
                        style={{ flex: 1, width: "33%", aspectRatio: "3 / 4", objectFit: "cover", objectPosition: "top", display: "block", borderRadius: 12, border: `1px solid ${BASE.border}` }} />
                    ))}
                  </div>
                </>
              ) : (
              <>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: "#C9558E", margin: "14px 0 8px" }}>{"\u2728"} Quick Wins</div>
              {(T.wins || []).slice(0, 3).map((w) => (
                <div key={w.id} onClick={() => setGlowSheet(w)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${BASE.border}`, marginBottom: 6, cursor: "pointer" }}>
                  <span style={{ fontSize: 14 }}>{w.ic}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: BASE.creamDim }}>{w.name}</span>
                  <span style={{ color: BASE.taupe, fontSize: 15 }}>{"\u203a"}</span>
                </div>
              ))}
              </>
              )}
              <div onClick={() => { setGlowTopic(T.key); setGlowOpen(["guides", "wins", "learn"]); setGlowItem(null) }} style={{ textAlign: "right", fontSize: 13, fontWeight: 800, color: "#C9558E", cursor: "pointer", padding: "10px 2px 2px", letterSpacing: 0.3 }}>{T.editorial ? "Explore" : "More"} {"\u2192"}</div>
            </div>
          ))}

          {/* Everything not yet built to that standard keeps its existing card. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {P.cards.filter((c) => !(P.key === "glow" && ["Hair", "Skincare", "Makeup", "Perfume", "Nails", "Brows", "Lips", "Jewelry", "Facials", "Body Care", "Wardrobe"].indexOf(c.n) >= 0)).map((c) => (
              <div key={c.n} onClick={() => openBloomCard(c)} style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "20px 12px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 24 }}>{c.ic}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, marginTop: 8 }}>{c.n}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 26 }} />
        </div>
      )
    }

    // ── BLOOM LANDING ────────────────────────────────────────────────────
    if (tab === "bloom") {
      const capKey = checkedIn ? (pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green") : "yellow"
      // Defensive: a partially-deployed data file should degrade, not white-screen.
      const invites = (BLOOM_INVITATIONS && BLOOM_INVITATIONS[capKey]) || []
      const inviteRaw = invites.length ? invites[dayIndex(invites.length)] : null
      const invite = inviteRaw && typeof inviteRaw === "object" ? inviteRaw : { emoji: "\ud83e\udd0d", text: inviteRaw || "Be gentle with yourself today." }
      const trending = Array.isArray(BLOOM_TRENDING) ? BLOOM_TRENDING : []
      const feat = trending.length ? trending[dayIndex(trending.length)] : null
      const fid = feat ? "article:" + feat.id : ""
      const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 2.6, textTransform: "uppercase", color: BASE.taupe }

      return (
        <div className="fade-in" style={{ padding: "0 24px" }}>

          <div style={{ paddingTop: 18 }}><BloomTabs /></div>

          {/* ── greeting · no date, no subtitle ── */}
          <div style={{ paddingTop: 8, textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: BASE.cream, lineHeight: 1.08, letterSpacing: 0.2 }}>Wonderful Discoveries</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, lineHeight: 1.4, marginTop: 10 }}>Things you didn't know you needed.</div>
          </div>

          {/* ── TRENDING ── */}
          <div style={{ height: 44 }} />
          <div style={{ ...LABEL, textAlign: "center" }}>Trending</div>
          <div style={{ height: 16 }} />
          {feat && <div onClick={() => setBloomArticle(feat)} style={{ borderRadius: 22, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "22px 22px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -14, right: -8, fontSize: 78, opacity: 0.08 }}>{feat.ic}</div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{feat.ic}</span>
              <span onClick={(e) => { e.stopPropagation(); toggleSaveBloom(fid) }} style={{ fontSize: 19, cursor: "pointer", lineHeight: 1, color: "#C9558E", opacity: isSavedBloom(fid) ? 1 : 0.4, padding: "0 0 8px 12px" }}>{isSavedBloom(fid) ? "\u2665" : "\u2661"}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 12, lineHeight: 1.18, position: "relative" }}>{feat.title}</div>
            <div style={{ fontSize: 14.5, color: BASE.taupe, lineHeight: 1.6, marginTop: 10, position: "relative" }}>{feat.desc}</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: 0.4, color: "#C9558E", marginTop: 16, position: "relative" }}>Read {"\u203a"}</div>
          </div>}

          {/* ── three pillars · stacked, so a fourth can join later ── */}
          <div style={{ height: 48 }} />
          {(BLOOM_PILLARS || []).map((P, i) => (
            <div key={P.key} onClick={() => switchPillar(P.key)} style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 20, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 20px", cursor: "pointer", marginBottom: i < BLOOM_PILLARS.length - 1 ? 12 : 0, minHeight: 84 }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{P.ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: BASE.cream, lineHeight: 1.1 }}>{P.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: BASE.taupe, marginTop: 3 }}>{P.sub}</div>
              </div>
              <span style={{ color: BASE.taupe, fontSize: 17 }}>{"\u203a"}</span>
            </div>
          ))}

          {/* ── TODAY'S INVITATION · closes the page, asks nothing ── */}
          <div style={{ height: 52 }} />
          <div style={{ textAlign: "center", paddingBottom: 48 }}>
            <div style={LABEL}>Today's invitation</div>
            <div style={{ fontSize: 28, marginTop: 16 }}>{invite.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 26, color: BASE.cream, lineHeight: 1.4, marginTop: 10 }}>{invite.text}</div>
            <div onClick={() => switchPillar("reset")} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", marginTop: 18, cursor: "pointer", letterSpacing: 0.2 }}>More gentle ideas in Reset {"\u2192"}</div>
          </div>

        </div>
      )
    }
  return null
}
