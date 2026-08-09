import { CYCLEPREF, EQUIP, HOPES, LEVELS, SEASONS, SHARE_LEVELS, SHARE_NEED, SHARE_TRUE, ShopItems } from '../data/checkin.js'
import { db } from '../lib/supabase.js'
import { BASE, THEMES } from '../lib/theme.js'
import { BLOOM_PILLARS, BLOOM_TRENDING } from '../data/bloom.js'
import { GLOW_TOPICS, GLOW_BY_KEY } from '../data/glow.js'
import { RESET_EXPLORE } from '../data/reset.js'
import { F_BY_ID, F_IMG } from '../data/flourish.js'

export function renderMore(ctx) {
  const { Chips, Label, T, cycleNow, editLife, firstName, handleCopyShare, handleLogout, handleShare, lastPeriod, lifeMsg, moreView, openBloomCard, savedBloom, savedFilter, setBloomArticle, setBloomPillar, setBodyView, setEditCycle, setEditLife, setFirstName, setFlourishProject, setGlowItem, setGlowSheet, setGlowTopic, setLifeMsg, setMoreView, setResetPage, setSavedFilter, setSetupData, setShareContext, setShareLevel, setShareNeed, setShareTrue, setTab, setTmpLen, setTmpStart, setupData, shareContext, shareLevel, shareNeed, shareStatus, shareTrue, stats, tab, toggle, toggleSaveBloom, user } = ctx
    if (tab === "more" && moreView === "menu") {
      const nm = (setupData && setupData.name) || firstName || "friend"
      // Every current entry point into My Life routes through here so a
      // leftover draft from a previous visit (left via bottom-nav rather than
      // Back) can never shadow the actually-saved name or other fields.
      const openMyLife = () => { setEditLife(null); setMoreView("mylife") }
      const season = (setupData && setupData.season) || "Your season"

      // Every prop here is optional and defaults to the original single-line
      // look, so existing call sites needed no changes — only the four rows
      // that now carry a subtitle/icon/extra breathing room opt into them.
      const Row = ({ label, sub, icon, onClick, muted, spacious }) => (
        <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", padding: spacious ? "17px 16px" : "15px 16px", cursor: "pointer", borderBottom: `1px solid ${BASE.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            {icon && <span style={{ fontSize: 17, flexShrink: 0 }}>{icon}</span>}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: muted ? 13 : 14, color: muted ? BASE.taupe : BASE.cream, fontWeight: muted ? 500 : 600 }}>{label}</div>
              {sub && <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
            </div>
          </div>
          <span style={{ color: BASE.taupe, fontSize: 16, flexShrink: 0 }}>{"›"}</span>
        </div>
      )
      const Group = ({ title, children, spacious }) => (
        <div style={{ marginBottom: spacious ? 24 : 20 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, margin: "0 4px 8px" }}>{title}</div>
          <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, overflow: "hidden" }}>{children}</div>
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          {/* ── editorial page header ── */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: BASE.cream, lineHeight: 1.1 }}>More</div>
            <div style={{ fontSize: 13, color: BASE.taupe, marginTop: 3, fontStyle: "italic" }}>Your space, your way.</div>
          </div>

          {/* ── MY LIFE — the one gradient element, representing her rather than a setting ── */}
          <div onClick={openMyLife} style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, borderRadius: 20, background: "linear-gradient(135deg,#E984B4,#A87BD1)", cursor: "pointer", marginBottom: 26, boxShadow: "0 10px 26px rgba(168,123,209,0.3)" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{nm[0] ? nm[0].toUpperCase() : "🌸"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>{"🌸"} My Life</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 2 }}>{nm}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.9)" }}>{season}</div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 20 }}>{"›"}</span>
          </div>

          {/* ── MY WELLNESS — elevated labels over the same existing destinations.
              "Capacity reminders" and "Workout reminders" both currently open the
              My Life editor (there's no dedicated reminders screen yet) — that
              exact handler is preserved rather than invented around. ── */}
          <Group title="My Wellness">
            <Row label="My Capacity" sub="Check-ins & reminders" onClick={() => setMoreView("capacity")} />
            <Row label="My Cycle" sub="Cycle tracking & preferences" onClick={() => { setTmpLen(cycleNow ? String(cycleNow.length) : "28"); setTmpStart(lastPeriod || ""); setTab("body"); setBodyView("cycle"); setEditCycle(true) }} />
            <Row label="My Movement" sub="Workout reminders & preferences" onClick={openMyLife} />
          </Group>

          {/* ── TRUE REVERIE — the ecosystem. Slightly more air, small icons. ── */}
          <Group title="True Reverie" spacious>
            <Row icon="♡" label="Saved Ideas" sub="Everything you've kept, in one place." onClick={() => { setSavedFilter("All"); setMoreView("saved") }} spacious />
            <Row icon="✦" label="The Capacity Method" sub="Understand the method behind your days." onClick={() => setMoreView("about")} spacious />
            <Row icon="💌" label="Share with a partner" sub="Send them your capacity check-in." onClick={() => setMoreView("share")} spacious />
            <Row icon="🛍" label="Shop" sub="Wearable reminders from True Reverie." onClick={() => setMoreView("shop")} spacious />
          </Group>

          {/* ── APP SETTINGS — deliberately recedes: muted color, no subtitles. ── */}
          <Group title="App Settings">
            <Row label="Morning greeting" muted onClick={openMyLife} />
            <Row label="Motion & sound" muted onClick={openMyLife} />
            <Row label="Theme" muted onClick={openMyLife} />
          </Group>

          {/* ── HELP & LEGAL ── */}
          <Group title="Help & Legal">
            <Row label="Contact & feedback" muted onClick={() => setMoreView("about")} />
            <Row label="Privacy & terms" muted onClick={() => setMoreView("about")} />
          </Group>

          <button onClick={handleLogout} style={{ width: "100%", padding: 14, borderRadius: 14, background: "transparent", color: BASE.taupe, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Log Out</button>
        </div>
      )
    }
    if (tab === "more" && moreView === "capacity") {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setMoreView("menu")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039 More"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>My Capacity</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 22 }}>Make the Capacity Method fit your day.</div>

          {/* No Capacity-specific setting exists in the app yet — reminders,
              check-in timing, etc. are all still just labels. Rather than
              invent a toggle with nothing behind it, this states that plainly,
              in the same voice the app already uses for "not built yet"
              (see Progress's Movement section, Flourish's "coming soon"). */}
          <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "26px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{"\ud83e\udd0d"}</div>
            <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.65 }}>Nothing to configure yet. As Capacity-specific reminders and preferences are built, they'll live here.</div>
          </div>
        </div>
      )
    }
    if (tab === "more" && moreView === "mylife") {
      const d = editLife || setupData || {}
      const displayName = d.name || firstName || ""
      const setField = (k, v) => setEditLife({ ...(editLife || setupData || {}), [k]: v })
      const toggleHope = (h) => {
        const cur2 = (editLife || setupData || {}).hopes || []
        const arr = cur2.includes(h) ? cur2.filter((x) => x !== h) : [...cur2, h]
        setField("hopes", arr)
      }
      const saveLife = () => {
        // Resolve, don't just merge: if the Name field was never touched this
        // session, editLife.name is undefined and a plain spread would carry
        // forward whatever setupData.name already was — including blank, if
        // it had drifted blank before. Fall back through firstName as a last
        // resort so a save can heal a blank name but can never re-blank one.
        const name = (editLife && editLife.name) || (setupData && setupData.name) || firstName || ""
        const data = { ...(setupData || {}), ...(editLife || {}), name }
        setSetupData(data)
        if (name) setFirstName(name)
        try { localStorage.setItem("nr_setup", JSON.stringify(data)); if (name) localStorage.setItem("nr_name", name) } catch (e) {}
        try { if (user) db.from("profiles").update({ setup: data, first_name: name }).eq("id", user.id).then(() => {}) } catch (e) {}
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
            <input value={displayName} onChange={(e) => setField("name", e.target.value)} placeholder="Your name" style={{ ...inputStyle, marginBottom: 14 }} />
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
    if (tab === "more" && moreView === "saved") {
      // One resolver per current save-ID scheme. Each returns the real content's
      // own metadata plus an `open` action that sets exactly the state the
      // original screen already expects — Saved Ideas never renders its own
      // detail view, only routes back into the real one.
      const resolve = (id) => {
        if (id.indexOf("article:") === 0) {
          const a = BLOOM_TRENDING.find((x) => x.id === id.slice(8))
          return a ? { id, cat: "Bloom", ic: a.ic, title: a.title, sub: a.desc,
            open: () => { setBloomArticle(a); setTab("bloom") } } : null
        }
        if (id.indexOf("win:") === 0) {
          const rid = id.slice(4)
          for (const t of GLOW_TOPICS) {
            const w = (t.wins || []).find((x) => x.id === rid)
            if (w) return { id, cat: "Glow", ic: w.ic, title: w.name, sub: t.name + " \u00b7 Quick Win",
              open: () => { setBloomPillar("glow"); setGlowTopic(t.key); setGlowSheet(w); setTab("bloom") } }
          }
          return null
        }
        if (id.indexOf("glow:") === 0) {
          const rest = id.slice(5)
          const sep = rest.indexOf(":")
          if (sep < 0) return null
          const topicKey = rest.slice(0, sep), itemId = rest.slice(sep + 1)
          const t = GLOW_BY_KEY(topicKey)
          if (!t) return null
          const pools = [["Product", t.guides], ["Type", t.types], ["Learn", t.learn]]
          for (const [kind, arr] of pools) {
            const it = (arr || []).find((x) => (x.id || x.n) === itemId)
            if (it) return { id, cat: "Glow", ic: it.ic || "\u2728", title: it.title || it.n, sub: t.name + " \u00b7 " + kind,
              open: () => { setBloomPillar("glow"); setGlowTopic(topicKey); setGlowItem(it); setTab("bloom") } }
          }
          return null
        }
        if (id.indexOf("reset:") === 0) {
          const P = RESET_EXPLORE.find((x) => x.id === id.slice(6))
          return P ? { id, cat: "Reset", ic: P.ic, title: P.title, sub: P.sub,
            open: () => { setBloomPillar("reset"); setResetPage(P.id); setTab("bloom") } } : null
        }
        if (id.indexOf("flourish:") === 0) {
          const P = F_BY_ID(id.slice(9))
          return P ? { id, cat: "Flourish", ic: P.emoji, title: P.title, sub: P.sub, img: F_IMG(P.id), time: P.time, category: P.category,
            open: () => { setBloomPillar("flourish"); setFlourishProject(P.id); setTab("bloom") } } : null
        }
        // Legacy IDs from before the Glow rebuild — resolved best-effort so an
        // old save doesn't just vanish, but not surfaced as its own filter
        // category since nothing can create a new one today.
        if (id.indexOf("topic:") === 0) {
          const rid = id.slice(6)
          for (const Pl of BLOOM_PILLARS) {
            const c = (Pl.cards || []).find((x) => x.n === rid)
            if (c) return { id, cat: "Glow", ic: c.ic, title: c.n, sub: Pl.name,
              open: () => { openBloomCard(c); setTab("bloom") } }
          }
          return null
        }
        return null
      }

      const items = (savedBloom || []).map(resolve).filter(Boolean)
      const cats = Array.from(new Set(items.map((it) => it.cat)))
      const shown = savedFilter === "All" ? items : items.filter((it) => it.cat === savedFilter)

      // A small photograph-shaped placeholder, matching Flourish's own visual
      // language, for the one save type that has real imagery.
      const SavedImg = ({ src, emoji }) => (
        <div style={{ position: "relative", width: 60, height: 75, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "linear-gradient(150deg,#F3E4EC 0%,#E9DCEE 45%,#DCD3E8 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 20, opacity: 0.28 }}>{emoji}</span>
          {src && <img src={src} alt="" loading="lazy" onError={(e) => { e.target.style.display = "none" }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
      )

      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setMoreView("menu")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039 More"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Saved Ideas</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 20 }}>Everything you've kept, in one place.</div>

          {cats.length > 1 && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
              {["All", ...cats].map((c) => (
                <span key={c} onClick={() => setSavedFilter(c)} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", background: savedFilter === c ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface, color: savedFilter === c ? "#fff" : BASE.creamDim, border: `1px solid ${savedFilter === c ? "transparent" : BASE.border}` }}>{c}</span>
              ))}
            </div>
          )}

          {items.length === 0 ? (
            <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "30px 22px", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{"\u2661"}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: BASE.cream, marginBottom: 6 }}>Nothing saved yet.</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.65 }}>Tap the heart on anything you want to find again.</div>
            </div>
          ) : shown.map((it) => (
            <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px", borderRadius: 16, background: "#FDFBFA", border: `1px solid ${BASE.border}`, marginBottom: 10 }}>
              <div onClick={it.open} style={{ cursor: "pointer", flexShrink: 0 }}>
                {it.img !== undefined
                  ? <SavedImg src={it.img} emoji={it.ic} />
                  : <div style={{ width: 44, height: 44, borderRadius: 12, background: BASE.surface2 || BASE.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{it.ic}</div>}
              </div>
              <div onClick={it.open} style={{ flex: 1, minWidth: 0, cursor: "pointer" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C9558E", marginBottom: 3 }}>{it.cat}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: BASE.cream, lineHeight: 1.25 }}>{it.title}</div>
                {it.sub && <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2, lineHeight: 1.35 }}>{it.sub}</div>}
                {it.time && <div style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 3 }}>{it.time}{it.category && it.category.length ? " \u00b7 " + it.category[0] : ""}</div>}
              </div>
              <span onClick={() => toggleSaveBloom(it.id)} style={{ fontSize: 18, color: "#C9558E", cursor: "pointer", flexShrink: 0 }}>{"\u2665"}</span>
            </div>
          ))}
          <div style={{ height: 20 }} />
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
