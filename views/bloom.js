import { BLOOM_INVITATIONS, BLOOM_PILLARS, BLOOM_SECTIONS, BLOOM_TRENDING } from '../data/bloom'
import { GLOW_TOPICS, GLOW_BY_KEY } from '../data/glow'
import { BASE, dayIndex } from '../lib/theme'

export function renderBloom(ctx) {
  const { bloomArticle, bloomCard, bloomPillar, checkedIn, closeBloom, glowItem, glowSection, glowSheet, glowTopic, isSavedBloom, openBloomCard, pct, setBloomArticle, setBloomPillar, setGlowItem, setGlowSection, setGlowSheet, setGlowTopic, tab, toggleSaveBloom } = ctx
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
            <span onClick={() => toggleSaveBloom(sid)} style={{ fontSize: 19, cursor: "pointer", color: "#C9558E", opacity: isSavedBloom(sid) ? 1 : 0.4 }}>{isSavedBloom(sid) ? "\u2665" : "\u2661"}</span>
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
          <Tier ic="\u2728" label="Luxury" item={w.prod.lux} />

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
            <span onClick={() => toggleSaveBloom(sid)} style={{ fontSize: 19, cursor: "pointer", color: "#C9558E", opacity: isSavedBloom(sid) ? 1 : 0.4 }}>{isSavedBloom(sid) ? "\u2665" : "\u2661"}</span>
          </div>
          {it.ic && <div style={{ fontSize: 28 }}>{it.ic}</div>}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream, marginTop: 4, lineHeight: 1.18 }}>{it.title || it.n}</div>
          {(it.desc || it.b || it.i) && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 8, lineHeight: 1.5 }}>{it.desc || it.b || it.i}</div>}

          {it.do && <List label="Do this" items={it.do} col="#7FA054" />}
          {it.no && <List label="Skip this" items={it.no} col="#D65C4E" />}

          {it.p && (
            <>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", margin: "24px 0 10px" }}>Products we love</div>
              <Tier ic="💰" label="Budget" item={it.p.budget} />
              <Tier ic="🥇" label="Best overall" item={it.p.best} />
              <Tier ic="\u2728" label="Luxury" item={it.p.lux} />
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

    // ══════════════ GLOW · a section list ══════════════
    if (tab === "bloom" && glowTopic && glowSection) {
      const T = GLOW_BY_KEY(glowTopic)
      const SEC = { wins: ["\u2728 Quick Wins", T.wins], types: [T.key === "hair" ? "💇‍♀️ Hair Types" : "🧴 Skin Types", T.types],
                    guides: ["🛍️ Product Guides", T.guides], learn: ["📖 Learn", T.learn],
                    favs: ["\u2764\uFE0F Women's Favorites", []] }
      const [title, items] = SEC[glowSection] || ["", []]
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div onClick={() => setGlowSection(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 " + T.name}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: BASE.cream, marginBottom: 18 }}>{title}</div>

          {glowSection === "favs" ? (
            <div style={{ borderRadius: 18, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "28px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{"\u2661"}</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.65 }}>Women's Favorites are built from what thousands of women save. As saves gather, the most-loved discoveries in {T.name} will appear here.</div>
            </div>
          ) : (() => {
            // A long list becomes a few calm sections. Grouping is presentation
            // only — nothing is hidden and nothing is removed.
            const Row = ({ x }) => (
              <div onClick={() => (glowSection === "wins" ? setGlowSheet(x) : setGlowItem(x))}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderRadius: 15, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8, cursor: "pointer" }}>
                {x.ic && <span style={{ fontSize: 19 }}>{x.ic}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream, lineHeight: 1.3 }}>{x.title || x.name || x.n}</div>
                  {(x.desc || x.b || x.i) && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 3, lineHeight: 1.4 }}>{x.desc || x.b || x.i}</div>}
                </div>
                <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
              </div>
            )
            const grouped = items.length > 0 && items[0].g
            if (!grouped) return items.map((x, i) => <Row key={i} x={x} />)
            const order = []
            items.forEach((x) => { if (order.indexOf(x.g) < 0) order.push(x.g) })
            return order.map((gname, gi) => (
              <div key={gname} style={{ marginBottom: gi < order.length - 1 ? 30 : 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: "#C9558E", marginBottom: 12 }}>{gname}</div>
                {items.filter((x) => x.g === gname).map((x, i) => <Row key={i} x={x} />)}
              </div>
            ))
          })()}
          <div style={{ height: 26 }} />
        </div>
      )
    }

    // ══════════════ GLOW · a topic ══════════════
    if (tab === "bloom" && glowTopic) {
      const T = GLOW_BY_KEY(glowTopic)
      const SECTIONS = [
        ["wins", "\u2728", "Quick Wins", T.wins.length + " fast, useful things"],
        ["types", T.key === "hair" ? "💇‍♀️" : "🧴", T.key === "hair" ? "Hair Types" : "Skin Types", "Advice that fits your " + T.name.toLowerCase()],
        ["guides", "🛍️", "Product Guides", T.guides.length + " curated collections"],
        ["learn", "📖", "Learn", "The why, when you want it"],
        ["favs", "\u2764\uFE0F", "Women's Favorites", "Loved by the community"],
      ]
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div onClick={() => { setGlowTopic(null); setGlowSection(null) }} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 Glow"}</div>
          <div style={{ fontSize: 32 }}>{T.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 4 }}>{T.name}</div>
          <div style={{ height: 22 }} />
          {SECTIONS.map(([k, ic, name, sub]) => (
            <div key={k} onClick={() => setGlowSection(k)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "17px 18px", borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, cursor: "pointer" }}>
              <span style={{ fontSize: 21 }}>{ic}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 12.5, color: BASE.taupe, marginTop: 2 }}>{sub}</div>
              </div>
              <span style={{ color: BASE.taupe, fontSize: 17 }}>{"\u203a"}</span>
            </div>
          ))}
          <div style={{ height: 26 }} />
        </div>
      )
    }

    // ── INSIDE A PILLAR ──────────────────────────────────────────────────
    if (tab === "bloom" && bloomPillar) {
      const P = BLOOM_PILLARS.find((x) => x.key === bloomPillar) || BLOOM_PILLARS[0]
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
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
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: "#C9558E", margin: "14px 0 8px" }}>{"\u2728"} Quick Wins</div>
              {T.wins.slice(0, 3).map((w) => (
                <div key={w.id} onClick={() => setGlowSheet(w)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${BASE.border}`, marginBottom: 6, cursor: "pointer" }}>
                  <span style={{ fontSize: 14 }}>{w.ic}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: BASE.creamDim }}>{w.name}</span>
                  <span style={{ color: BASE.taupe, fontSize: 15 }}>{"\u203a"}</span>
                </div>
              ))}
              <div onClick={() => { setGlowTopic(T.key); setGlowSection(null); setGlowItem(null) }} style={{ textAlign: "right", fontSize: 13, fontWeight: 800, color: "#C9558E", cursor: "pointer", padding: "8px 2px 2px", letterSpacing: 0.3 }}>More {"\u2192"}</div>
            </div>
          ))}

          {/* Everything not yet built to that standard keeps its existing card. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {P.cards.filter((c) => !(P.key === "glow" && (c.n === "Hair" || c.n === "Skincare"))).map((c) => (
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
      const invites = BLOOM_INVITATIONS[capKey]
      const invite = invites[dayIndex(invites.length)]
      const feat = BLOOM_TRENDING[dayIndex(BLOOM_TRENDING.length)]
      const fid = "article:" + feat.id
      const LABEL = { fontSize: 10.5, fontWeight: 700, letterSpacing: 2.6, textTransform: "uppercase", color: BASE.taupe }

      return (
        <div className="fade-in" style={{ padding: "0 24px" }}>

          {/* ── greeting · no date, no subtitle ── */}
          <div style={{ paddingTop: 26, textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: BASE.cream, lineHeight: 1.08, letterSpacing: 0.2 }}>Wonderful Discoveries</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, lineHeight: 1.4, marginTop: 10 }}>Things you didn't know you needed.</div>
          </div>

          {/* ── TRENDING ── */}
          <div style={{ height: 44 }} />
          <div style={{ ...LABEL, textAlign: "center" }}>Trending</div>
          <div style={{ height: 16 }} />
          <div onClick={() => setBloomArticle(feat)} style={{ borderRadius: 22, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "22px 22px 20px", cursor: "pointer", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -14, right: -8, fontSize: 78, opacity: 0.08 }}>{feat.ic}</div>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{feat.ic}</span>
              <span onClick={(e) => { e.stopPropagation(); toggleSaveBloom(fid) }} style={{ fontSize: 19, cursor: "pointer", lineHeight: 1, color: "#C9558E", opacity: isSavedBloom(fid) ? 1 : 0.4, padding: "0 0 8px 12px" }}>{isSavedBloom(fid) ? "\u2665" : "\u2661"}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: BASE.cream, marginTop: 12, lineHeight: 1.18, position: "relative" }}>{feat.title}</div>
            <div style={{ fontSize: 14.5, color: BASE.taupe, lineHeight: 1.6, marginTop: 10, position: "relative" }}>{feat.desc}</div>
            <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: 0.4, color: "#C9558E", marginTop: 16, position: "relative" }}>Read {"\u203a"}</div>
          </div>

          {/* ── three pillars · stacked, so a fourth can join later ── */}
          <div style={{ height: 48 }} />
          {BLOOM_PILLARS.map((P, i) => (
            <div key={P.key} onClick={() => setBloomPillar(P.key)} style={{ display: "flex", alignItems: "center", gap: 16, borderRadius: 20, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 20px", cursor: "pointer", marginBottom: i < BLOOM_PILLARS.length - 1 ? 12 : 0, minHeight: 84 }}>
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
          </div>

        </div>
      )
    }
  return null
}
