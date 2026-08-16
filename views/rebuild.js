// ============ REBUILD (LANDING PAGE ONLY) ============
// This is intentionally just a program library, not the programs themselves.
// Every entry is "coming-soon" — tapping any card reveals a small honest
// note in place, never a broken or fake destination. No day screens, no
// Capacity adaptation, no progress tracking, no enrollment, no persistence
// beyond which card's note is currently showing (purely local UI state).
//
// Deliberately independent of Move/Nourish/Bloom's data — Rebuild will one
// day pull suggestions from those worlds, but that integration is real
// future work, not something to fake here with placeholder wiring.

import { featuredProgram, otherPrograms } from '../data/rebuild.js'
import { BASE } from '../lib/theme.js'

export function renderRebuild(ctx) {
  const { rebuildComingSoon, setRebuildComingSoon, tab } = ctx
  if (tab !== "rebuild") return null

  const toggle = (id) => setRebuildComingSoon(rebuildComingSoon === id ? null : id)
  const Badge = ({ light }) => (
    <span style={{ display: "inline-block", padding: light ? "7px 15px" : "5px 12px", borderRadius: 999,
      background: light ? "rgba(255,255,255,0.18)" : (BASE.bg2 || BASE.surface2), border: light ? "1px solid rgba(255,255,255,0.35)" : "none" }}>
      <span style={{ fontSize: light ? 11 : 10, fontWeight: 700, letterSpacing: 0.4, color: light ? "#fff" : BASE.taupe }}>Coming Soon</span>
    </span>
  )
  const Note = ({ light }) => (
    <div className="fade-in" style={{ marginTop: 12, fontSize: light ? 12.5 : 12, fontStyle: "italic", color: light ? "rgba(255,255,255,0.95)" : "#9B6BC3" }}>We're still building this Rebuild. {"\u2728"}</div>
  )

  return (
    <div className="fade-in" style={{ padding: "10px 22px 0" }}>

      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: BASE.cream, lineHeight: 1.1 }}>Rebuild</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16, color: BASE.taupe, marginTop: 8 }}>What version of you are we building next?</div>
      <div style={{ fontSize: 12.5, color: BASE.taupe, marginTop: 10, lineHeight: 1.5 }}>Guided experiences designed to help something in your life actually change.</div>

      {/* ═══ FEATURED ═══ */}
      {featuredProgram && (
        <div onClick={() => toggle(featuredProgram.id)} style={{ borderRadius: 26, overflow: "hidden", cursor: "pointer", marginTop: 32, background: featuredProgram.gradient, padding: "34px 26px 30px", boxShadow: "0 14px 34px rgba(60,25,70,0.22)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.72)", marginBottom: 16 }}>Featured</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>{featuredProgram.title}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginTop: 10, letterSpacing: 0.2 }}>{featuredProgram.duration}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15.5, color: "rgba(255,255,255,0.94)", marginTop: 16, lineHeight: 1.55 }}>{featuredProgram.outcome}</div>
          <div style={{ marginTop: 20 }}><Badge light /></div>
          {rebuildComingSoon === featuredProgram.id && <Note light />}
        </div>
      )}

      {/* ═══ MORE WAYS TO REBUILD ═══ */}
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: BASE.cream }}>More ways to rebuild</div>
      </div>

      {otherPrograms.map((p) => (
        <div key={p.id} onClick={() => toggle(p.id)} style={{ borderRadius: 20, overflow: "hidden", cursor: "pointer", marginBottom: 16, border: `1px solid ${BASE.border}`, background: BASE.surface }}>
          <div style={{ height: 78, background: p.gradient }} />
          <div style={{ padding: "16px 18px 18px" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: BASE.cream, lineHeight: 1.2 }}>{p.title}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#9B6BC3", marginTop: 6, letterSpacing: 0.2 }}>{p.duration}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: BASE.creamDim, marginTop: 9, lineHeight: 1.5 }}>{p.outcome}</div>
            <div style={{ marginTop: 13 }}><Badge /></div>
            {rebuildComingSoon === p.id && <Note />}
          </div>
        </div>
      ))}

      {/* Clears the fixed bottom nav + iPhone home-indicator safe area —
          same proven spacer used across Bloom, Move, and Cycle. */}
      <div style={{ height: 44, paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  )
}
