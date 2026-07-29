import { BLOOM_INVITATIONS, BLOOM_SECTIONS } from '../data/bloom'
import { BASE, dayIndex } from '../lib/theme'

export function renderBloom(ctx) {
  const { bloomCard, bloomSection, checkedIn, closeBloom, openBloomCard, pct, setBloomSection, tab } = ctx
    if (tab === "bloom" && bloomCard) {
      const sec = BLOOM_SECTIONS.find((x) => x.cards.some((c) => c.n === bloomCard.n)) || BLOOM_SECTIONS[0]
      const card = bloomCard
      return (
        <div className="fade-in" style={{ padding: 0 }}>
          <div style={{ position: "relative", padding: "26px 24px 30px", background: sec.grad, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -16, right: -10, fontSize: 90, opacity: 0.16 }}>🌸</div>
            <div style={{ position: "absolute", bottom: -24, left: -12, fontSize: 66, opacity: 0.12 }}>🌷</div>
            <div onClick={closeBloom} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 18, position: "relative" }}>{"\u2039"} Back to Bloom</div>
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
    if (tab === "bloom") {
      const capKey = checkedIn ? (pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green") : "yellow"
      const invites = BLOOM_INVITATIONS[capKey]
      const invite = invites[dayIndex(invites.length)]
      const sec = BLOOM_SECTIONS.find((x) => x.id === bloomSection) || BLOOM_SECTIONS[0]
      return (
        <div className="fade-in" style={{ padding: "8px 0 0" }}>
          <div style={{ position: "relative", overflow: "hidden", padding: "40px 22px 34px", background: "linear-gradient(160deg,#FBEEF4 0%,#F3E6F2 45%,#EFE7F6 100%)" }}>
            <div style={{ position: "absolute", top: -20, right: -10, fontSize: 90, opacity: 0.16 }}>🌸</div>
            <div style={{ position: "absolute", bottom: -26, left: -14, fontSize: 76, opacity: 0.13 }}>🌷</div>
            <div style={{ position: "absolute", top: 60, left: 30, fontSize: 30, opacity: 0.14 }}>🌸</div>
            <div style={{ position: "relative", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 46, fontWeight: 600, color: "#8A5A86", letterSpacing: 0.5, lineHeight: 1.05 }}>Become Her.</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#B87BA6", marginTop: 14 }}>Luxury is how you care for yourself.</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#9B7290", marginTop: 12, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>A beautiful life is built through small moments of care.</div>
            </div>
          </div>

          <div style={{ padding: "22px 18px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C97BA8", textAlign: "center", marginBottom: 12 }}>Today's Invitation</div>
            <div style={{ borderRadius: 24, padding: "30px 24px", background: "linear-gradient(135deg,#F6E2ED,#EDDCEF)", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 8 }}>
              <div style={{ position: "absolute", top: -18, right: -18, fontSize: 60, opacity: 0.12 }}>🌸</div>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{invite.emoji}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 600, color: "#7E5578", lineHeight: 1.3, position: "relative" }}>{invite.text}</div>
            </div>
            <div style={{ fontSize: 12, color: BASE.taupe, textAlign: "center", fontStyle: "italic", marginBottom: 26, lineHeight: 1.5 }}>If you do nothing else today, this is enough.</div>

            <div style={{ display: "flex", gap: 8, background: BASE.surface2, borderRadius: 999, padding: 4, marginBottom: 20 }}>
              {BLOOM_SECTIONS.map((x) => (
                <button key={x.id} onClick={() => setBloomSection(x.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: bloomSection === x.id ? "#fff" : "transparent", color: bloomSection === x.id ? "#C9558E" : BASE.taupe, boxShadow: bloomSection === x.id ? "0 2px 8px rgba(120,80,130,0.12)" : "none" }}><span style={{ fontSize: 15, display: "block", marginBottom: 2 }}>{x.emoji}</span>{x.name}</button>
              ))}
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "#9B7290", textAlign: "center", marginBottom: 18 }}>{sec.intro}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 24 }}>
              {sec.cards.map((card, i) => (
                <div key={i} onClick={() => openBloomCard(card)} style={{ borderRadius: 18, overflow: "hidden", aspectRatio: "1.35", background: sec.grad, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px 15px", boxShadow: "0 6px 18px rgba(180,130,170,0.16)", cursor: "pointer", transition: "transform 0.25s ease, box-shadow 0.25s ease" }} onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)" }} onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)" }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}>
                  <div style={{ position: "absolute", top: 12, right: 13, fontSize: 26, opacity: 0.9 }}>{card.ic}</div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.12))" }} />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: "#fff", position: "relative", textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>{card.n}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", padding: "0 20px 20px", lineHeight: 1.6 }}>Tap any card to open it. This is an inspiration library — never a checklist.</div>
          </div>
        </div>
      )
    }
  return null
}
