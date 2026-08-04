import { BLOOM_INVITATIONS, BLOOM_PILLARS, BLOOM_SECTIONS, BLOOM_TRENDING } from '../data/bloom'
import { BASE, dayIndex } from '../lib/theme'

export function renderBloom(ctx) {
  const { bloomArticle, bloomCard, bloomPillar, checkedIn, closeBloom, isSavedBloom, openBloomCard, pct, setBloomArticle, setBloomPillar, tab, toggleSaveBloom } = ctx
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

    // ── INSIDE A PILLAR ──────────────────────────────────────────────────
    if (tab === "bloom" && bloomPillar) {
      const P = BLOOM_PILLARS.find((x) => x.key === bloomPillar) || BLOOM_PILLARS[0]
      return (
        <div className="fade-in" style={{ padding: "10px 22px 0" }}>
          <div onClick={() => setBloomPillar(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 16 }}>{"\u2039 Bloom"}</div>
          <div style={{ fontSize: 30 }}>{P.ic}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream, marginTop: 4 }}>{P.name}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: BASE.taupe, marginTop: 4, marginBottom: 22 }}>{P.sub}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
            {P.cards.map((c) => (
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
      const hour = new Date().getHours()
      const greetWord = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
      const capKey = checkedIn ? (pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green") : "yellow"
      const invites = BLOOM_INVITATIONS[capKey]
      const invite = invites[dayIndex(invites.length)]
      const feat = BLOOM_TRENDING[dayIndex(BLOOM_TRENDING.length)]
      const fid = "article:" + feat.id
      const LABEL = { fontSize: 9.5, fontWeight: 700, letterSpacing: 2.6, textTransform: "uppercase", color: BASE.taupe }

      return (
        <div className="fade-in" style={{ padding: "0 24px" }}>

          {/* ── greeting · no date, no subtitle ── */}
          <div style={{ paddingTop: 26, textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 21, color: BASE.cream, lineHeight: 1.1 }}>{greetWord}</div>
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
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27.5, fontWeight: 700, color: BASE.cream, marginTop: 12, lineHeight: 1.2, position: "relative" }}>{feat.title}</div>
            <div style={{ fontSize: 13.5, color: BASE.taupe, lineHeight: 1.62, marginTop: 10, position: "relative" }}>{feat.desc}</div>
            <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: 0.3, color: "#C9558E", marginTop: 16, position: "relative" }}>Read {"\u203a"}</div>
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
            <div style={{ fontSize: 26, marginTop: 16 }}>{invite.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 24, color: BASE.cream, lineHeight: 1.42, marginTop: 10 }}>{invite.text}</div>
          </div>

        </div>
      )
    }
  return null
}
