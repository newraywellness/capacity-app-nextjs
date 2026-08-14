// ============ REBUILD (PLACEHOLDER — PASS 1) ============
// Rebuild is a future guided-program world (Feel Like Yourself Again, The
// Glow-Up Rebuild, Postpartum Rebuild, etc.) that will eventually draw
// suggestions from Move, Nourish, and Bloom. None of that exists yet, on
// purpose — this file is intentionally a single static screen with zero
// data, zero state, and zero dependencies on anything else in the app. Its
// only job is to give the new bottom-nav position somewhere safe to land.

import { BASE } from '../lib/theme.js'

export function renderRebuild(ctx) {
  const { tab } = ctx
  if (tab !== "rebuild") return null
  return (
    <div className="fade-in" style={{ padding: "10px 22px 60px", textAlign: "center" }}>
      <div style={{ paddingTop: 90 }}>
        <div style={{ fontSize: 30, marginBottom: 14 }}>{"\ud83c\udf31"}</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: BASE.cream }}>Rebuild</div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, marginTop: 12, lineHeight: 1.6, padding: "0 24px" }}>Guided seasons for the moments that need more than a single day. Coming soon.</div>
      </div>
    </div>
  )
}
