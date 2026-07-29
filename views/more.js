import { CYCLEPREF, EQUIP, HOPES, LEVELS, SEASONS, SHARE_LEVELS, SHARE_NEED, SHARE_TRUE, ShopItems } from '../data/checkin'
import { db } from '../lib/supabase'
import { BASE, THEMES } from '../lib/theme'

export function renderMore(ctx) {
  const { Chips, Label, T, cycleNow, editLife, handleCopyShare, handleLogout, handleShare, lastPeriod, lifeMsg, moreView, setBodyView, setEditCycle, setEditLife, setFirstName, setLifeMsg, setMoreView, setSetupData, setShareContext, setShareLevel, setShareNeed, setShareTrue, setTab, setTmpLen, setTmpStart, setupData, shareContext, shareLevel, shareNeed, shareStatus, shareTrue, stats, tab, toggle, user } = ctx
    if (tab === "more" && moreView === "menu") {
      const nm = (setupData && setupData.name) || "friend"
      const season = (setupData && setupData.season) || "Your season"
      const Row = ({ label, onClick, chevron = true }) => (
        <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 16px", cursor: "pointer", borderBottom: `1px solid ${BASE.border}` }}>
          <span style={{ fontSize: 14, color: BASE.cream, fontWeight: 500 }}>{label}</span>
          {chevron && <span style={{ color: BASE.taupe, fontSize: 16 }}>{"›"}</span>}
        </div>
      )
      const Group = ({ title, children }) => (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, margin: "0 4px 8px" }}>{title}</div>
          <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, overflow: "hidden" }}>{children}</div>
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setMoreView("mylife")} style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, borderRadius: 20, background: "linear-gradient(135deg,#E984B4,#A87BD1)", cursor: "pointer", marginBottom: 22, boxShadow: "0 10px 26px rgba(168,123,209,0.3)" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{nm[0] ? nm[0].toUpperCase() : "🌸"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>{"🌸"} My Life</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 2 }}>{nm}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.9)" }}>{season}</div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 20 }}>{"›"}</span>
          </div>

          <Group title="Wellness">
            <Row label="Capacity reminders" onClick={() => setMoreView("mylife")} />
            <Row label="Workout reminders" onClick={() => setMoreView("mylife")} />
            <Row label="Cycle settings" onClick={() => { setTmpLen(cycleNow ? String(cycleNow.length) : "28"); setTmpStart(lastPeriod || ""); setTab("body"); setBodyView("cycle"); setEditCycle(true) }} />
          </Group>
          <Group title="True Reverie">
            <Row label="Share with a partner" onClick={() => setMoreView("share")} />
            <Row label="Shop" onClick={() => setMoreView("shop")} />
            <Row label="The Capacity Method" onClick={() => setMoreView("about")} />
          </Group>
          <Group title="Preferences">
            <Row label="Morning greeting" onClick={() => setMoreView("mylife")} />
            <Row label="Motion & sound" onClick={() => setMoreView("mylife")} />
            <Row label="Theme" onClick={() => setMoreView("mylife")} />
          </Group>
          <Group title="Support">
            <Row label="Contact & feedback" onClick={() => setMoreView("about")} />
            <Row label="Privacy & terms" onClick={() => setMoreView("about")} />
          </Group>
          <button onClick={handleLogout} style={{ width: "100%", padding: 14, borderRadius: 14, background: "transparent", color: BASE.taupe, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Log Out</button>
        </div>
      )
    }
    if (tab === "more" && moreView === "mylife") {
      const d = editLife || setupData || {}
      const setField = (k, v) => setEditLife({ ...(editLife || setupData || {}), [k]: v })
      const toggleHope = (h) => {
        const cur2 = (editLife || setupData || {}).hopes || []
        const arr = cur2.includes(h) ? cur2.filter((x) => x !== h) : [...cur2, h]
        setField("hopes", arr)
      }
      const saveLife = () => {
        const data = { ...(setupData || {}), ...(editLife || {}) }
        setSetupData(data)
        if (data.name) setFirstName(data.name)
        try { localStorage.setItem("nr_setup", JSON.stringify(data)); if (data.name) localStorage.setItem("nr_name", data.name) } catch (e) {}
        try { if (user) db.from("profiles").update({ setup: data, first_name: data.name }).eq("id", user.id).then(() => {}) } catch (e) {}
        setLifeMsg("Saved \u2713")
        setTimeout(() => setLifeMsg(""), 1800)
      }
      const Sec = ({ title, children }) => (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, margin: "0 4px 8px" }}>{title}</div>
          <div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "14px 15px" }}>{children}</div>
        </div>
      )
      const Pick = ({ options, value, onPick }) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {options.map((o) => (
            <div key={o} onClick={() => onPick(o)} style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: value === o ? T.accent : "transparent", color: value === o ? "#FFFFFF" : BASE.creamDim, border: "1px solid " + (value === o ? T.accent : BASE.border) }}>{o}</div>
          ))}
        </div>
      )
      const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: "1px solid " + BASE.border, color: BASE.cream, fontSize: 14, outline: "none" }
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => { setMoreView("menu"); setEditLife(null) }} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039 Back"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 2 }}>{"\ud83c\udf38 My Life"}</div>
          <div style={{ fontSize: 12, color: BASE.taupe, marginBottom: 22 }}>Everything here centers on your life, not your stats. Edit anytime.</div>

          <Sec title="About Me">
            <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Name</div>
            <input value={d.name || ""} onChange={(e) => setField("name", e.target.value)} placeholder="Your name" style={{ ...inputStyle, marginBottom: 14 }} />
            <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>My season</div>
            <Pick options={SEASONS} value={d.season} onPick={(o) => setField("season", o)} />
          </Sec>
          <Sec title="My Goals">
            <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>What you're hoping for (choose any)</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {HOPES.map((h) => { const on = (d.hopes || []).includes(h); return (
                <div key={h} onClick={() => toggleHope(h)} style={{ padding: "8px 14px", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: on ? T.accent : "transparent", color: on ? "#FFFFFF" : BASE.creamDim, border: "1px solid " + (on ? T.accent : BASE.border) }}>{h}</div>
              )})}
            </div>
          </Sec>
          <Sec title="My Gym">
            <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>Experience</div>
            <Pick options={LEVELS} value={d.level} onPick={(o) => setField("level", o)} />
            <div style={{ fontSize: 11.5, color: BASE.taupe, margin: "14px 0 8px" }}>Equipment</div>
            <Pick options={EQUIP} value={d.equip} onPick={(o) => setField("equip", o)} />
          </Sec>
          <Sec title="My Preferences">
            <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>Cycle tracking</div>
            <Pick options={CYCLEPREF} value={d.cyclePref} onPick={(o) => setField("cyclePref", o)} />
          </Sec>

          <button onClick={saveLife} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", fontSize: 14.5, fontWeight: 700, boxShadow: "0 8px 22px rgba(168,123,209,0.3)" }}>Save my life details</button>
          {lifeMsg && <div className="fade-in" style={{ textAlign: "center", color: T.accent, fontSize: 13, fontWeight: 700, marginTop: 12 }}>{lifeMsg}</div>}
        </div>
      )
    }
    if (tab === "more" && moreView === "share") {
      const SL = SHARE_LEVELS[shareLevel]
      const ST = THEMES[shareLevel]
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 26, margin: "12px 0 4px" }}>The Capacity Check-In</h2>
          <p style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.5, marginBottom: 22 }}>Share where you're at with your partner — so they can meet you, instead of guessing.</p>

          <Label>My capacity today</Label>
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            {["red", "yellow", "green"].map((k) => {
              const active = shareLevel === k
              return (
                <div key={k} onClick={() => setShareLevel(k)} style={{ flex: 1, cursor: "pointer", textAlign: "center", padding: "14px 6px", borderRadius: 16, background: active ? THEMES[k].tint : BASE.surface, border: `1.5px solid ${active ? THEMES[k].accent : BASE.border}` }}>
                  <div style={{ fontSize: 20 }}>{SHARE_LEVELS[k].emoji}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: THEMES[k].accent, marginTop: 2 }}>{SHARE_LEVELS[k].short}</div>
                </div>
              )
            })}
          </div>

          <Label>What's true for me today</Label>
          <Chips items={SHARE_TRUE} selected={shareTrue} onToggle={(v) => toggle(shareTrue, setShareTrue, v)} />
          <div style={{ height: 20 }} />
          <Label>What I need today</Label>
          <Chips items={SHARE_NEED} selected={shareNeed} onToggle={(v) => toggle(shareNeed, setShareNeed, v)} />
          <div style={{ height: 20 }} />
          <Label>One line of context (optional)</Label>
          <input type="text" value={shareContext} onChange={(e) => setShareContext(e.target.value)} placeholder="Bad sleep, running low today…" style={{ width: "100%", padding: "13px 15px", borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none" }} />

          <div style={{ marginTop: 26, marginBottom: 8, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, fontWeight: 700 }}>Preview</div>
          <div style={{ padding: 18, borderRadius: 16, background: ST.tint, border: `1px solid rgba(${ST.glow},0.35)` }}>
            <div style={{ fontSize: 15, color: BASE.cream, lineHeight: 1.7 }}>
              <div><strong style={{ color: ST.accent }}>My capacity today:</strong> {SL.emoji} {SL.label}</div>
              {shareTrue.length > 0 && <div style={{ marginTop: 6 }}><strong style={{ color: ST.accent }}>What's true for me:</strong> {shareTrue.join(", ")}</div>}
              {shareNeed.length > 0 && <div style={{ marginTop: 6 }}><strong style={{ color: ST.accent }}>What I need:</strong> {shareNeed.join(", ")}</div>}
              {shareContext.trim() !== "" && <div style={{ marginTop: 6, fontStyle: "italic", color: BASE.creamDim }}>{shareContext.trim()}</div>}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `0.5px solid ${BASE.border}`, fontSize: 10, color: BASE.taupe, letterSpacing: 1 }}>SHARED VIA NEW RAY · THE CAPACITY METHOD</div>
          </div>

          <button onClick={handleShare} style={{ width: "100%", marginTop: 18, padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: ST.accent, color: "#FFFFFF", fontSize: 15, fontWeight: 700 }}>Send to my partner</button>
          <button onClick={handleCopyShare} style={{ width: "100%", marginTop: 10, padding: 13, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Copy message</button>
          {shareStatus && <div style={{ marginTop: 12, textAlign: "center", fontSize: 13, color: ST.accent, fontWeight: 700 }}>{shareStatus}</div>}
        </div>
      )
    }
    if (tab === "more" && moreView === "shop") {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 26, margin: "12px 0 6px" }}>The Capacity Method Shop</h2>
          <p style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.5, marginBottom: 22 }}>Wear the reminder. Soft, oversized, made for low-capacity days.</p>
          {ShopItems.map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
              <div style={{ borderRadius: 16, overflow: "hidden", background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 16 }}>
                <div style={{ height: 220, background: `linear-gradient(135deg, ${BASE.surface2}, ${BASE.bg2})`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: BASE.creamDim, textAlign: "center", lineHeight: 1.4, fontWeight: 500 }}>"{p.name}"</span>
                </div>
                <div style={{ padding: "18px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: T.accent, whiteSpace: "nowrap" }}>{p.price}</div>
                  </div>
                  <div style={{ fontSize: 13, color: BASE.taupe, marginBottom: 14 }}>{p.blurb}</div>
                  <button style={{ width: "100%", textAlign: "center", padding: 13, borderRadius: 10, background: T.accent, color: "#FFFFFF", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer" }}>Add to cart</button>
                </div>
              </div>
            </a>
          ))}
        </div>
      )
    }
    if (tab === "more" && moreView === "about") {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ textAlign: "center", margin: "16px 0 32px" }}>
            <div style={{ width: 92, height: 92, borderRadius: "50%", margin: "0 auto 16px", background: `linear-gradient(135deg, ${T.accent}, ${BASE.terracottaDeep})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Pinyon Script', cursive", fontSize: 44, color: "#FFFFFF", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>V</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Vanessa Parkin</div>
            <div style={{ fontSize: 12, color: BASE.taupe, letterSpacing: 2, textTransform: "uppercase" }}>RN · Mother · Founder</div>
          </div>
          <p style={{ fontFamily: "'Sacramento', cursive", fontSize: 36, textAlign: "center", color: T.accent, lineHeight: 1.3, margin: "0 20px 28px" }}>Capacity is not character.</p>
          <div style={{ padding: "0 20px" }}>
            <div style={{ padding: 20, borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: T.accent }}>Why I built this</div>
              <p style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.8 }}>For years I expected the same output from myself regardless of what I was carrying. As a nurse, wife, and mother of two under two, I kept measuring myself against my best days — and shaming myself when I fell short. The Capacity Method began as a way to stop fighting reality and start working with it.</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: "calc(100% - 40px)", margin: "18px 20px 0", padding: 13, borderRadius: 12, background: "transparent", color: BASE.taupe, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Log Out</button>
        </div>
      )
    }
  return null
}
