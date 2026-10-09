import { useState, useEffect, useMemo, useRef } from 'react'
import Head from 'next/head'
import { GOALS, INTERESTS } from '../data/onboarding.js'
import { PHASE_ORDER, computeCycle } from '../data/cycle.js'
import { WO_TYPES } from '../data/train.js'
import { db } from '../lib/supabase.js'
import { BASE, ENV, THEMES, colorFromPct, dayIndex } from '../lib/theme.js'
import { Sky, Garden } from '../lib/atmosphere.js'
import { NourishAir, HerbGarden, NOURISH_BG } from '../lib/herbs.js'
import { BloomAir, BloomAccents, BloomScene, BLOOM_BG } from '../lib/bloomair.js'
import { CycleAir, CYCLE_BG } from '../lib/cycleair.js'
import { renderTrain } from '../views/train.js'
import { renderCycle } from '../views/cycle.js'
import { renderNourish } from '../views/nourish.js'
import { renderBloom } from '../views/bloom.js'
import { renderReverie } from '../views/reverie.js'
import { renderCommunity } from '../views/community.js'
import { renderMore } from '../views/more.js'
import { renderRebuild } from '../views/rebuild.js'

const cycleLocalDateISO = (date = new Date()) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function App() {
  // PROTOTYPE-ONLY AUTH BYPASS — remove when rebuilding production auth.
  // This is not a production auth change: Supabase, checkAuth, login/signup/
  // recovery, and the onboarding wizard are all left fully intact below —
  // they simply never fire, because `user` and `setupData` are seeded
  // truthy from the very first render, so every existing gate (`!user`,
  // `user && !setupData`, `loading`) is satisfied immediately. The existing
  // localStorage-loading effect further down is untouched and still runs:
  // if real nr_setup/nr_name data exists, it overwrites these placeholders
  // moments later exactly as it always has.
  const PROTOTYPE_MODE = false
  const PROTOTYPE_USER = { id: "prototype-user", email: "prototype@truereverie.local" }

  const [user, setUser] = useState(PROTOTYPE_MODE ? PROTOTYPE_USER : null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState("bloom")
  const [pct, setPct] = useState(50)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(PROTOTYPE_MODE ? false : true)
  const [history, setHistory] = useState([])
  const [checkedIn, setCheckedIn] = useState(false)
  const [factors, setFactors] = useState([])
  const [supports, setSupports] = useState([])
  const [oneThing, setOneThing] = useState("")
  const [baseline, setBaseline] = useState([false, false, false, false, false])
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState("")
  // cycle settings (stored on device for v1)
  const [cycleLength, setCycleLength] = useState("")
  const [lastPeriod, setLastPeriod] = useState("")
  const [editCycle, setEditCycle] = useState(false)
  const [periodDismissed, setPeriodDismissed] = useState(false)
  const [tmpLen, setTmpLen] = useState("28")
  const [tmpStart, setTmpStart] = useState("")
  // auth UX: password recovery, status messages
  const [authView, setAuthView] = useState("welcome")
  const [firstName, setFirstName] = useState(PROTOTYPE_MODE ? "friend" : "")
  const [confirmPw, setConfirmPw] = useState("")
  const [setupData, setSetupData] = useState(PROTOTYPE_MODE ? { goals: [], interest_categories: [], name: "" } : null)
  const [setupStep, setSetupStep] = useState(0)
  const [introStep, setIntroStep] = useState(0)
  const [draftSetup, setDraftSetup] = useState({ goals: [], interest_categories: [] })
  const [recovery, setRecovery] = useState(false)
  const [authMsg, setAuthMsg] = useState("")
  const [newPass, setNewPass] = useState("")
  // share-with-partner (couples capacity check-in)
  const [setShareStatus] = useState("")

  const [woColor, setWoColor] = useState(null)
  const [woType, setWoType] = useState("full")
  const [woKey, setWoKey] = useState(null)
  const [woTier, setWoTier] = useState(null)
  const [forceTrainMenu, setForceTrainMenu] = useState(false)
  const [woDone, setWoDone] = useState({})
  const [woOpen, setWoOpen] = useState(null)
  const [woLog, setWoLog] = useState([])
  const [selectedWoKey, setSelectedWoKey] = useState(null)
  const [woLogged, setWoLogged] = useState(false)
  const [bodyView, setBodyView] = useState("gym")
  const [progressView, setProgressView] = useState("trends") // kept as a call target for Train's "History" button
  const [savedFilter, setSavedFilter] = useState("All") // Saved Ideas' category filter
  // Move discovery — which mood/time/category chip is expanded, and which
  // Surprise Me pick is showing. Ephemeral browsing state, not persisted.
  const [moveMood, setMoveMood] = useState(null)
  const [moveTime, setMoveTime] = useState(null)
  const [moveCategory, setMoveCategory] = useState(null)
  const [moveSearch, setMoveSearch] = useState("")
  const [moveSurpriseIdx, setMoveSurpriseIdx] = useState(null)
  // For You feed prototype — Browse by Time filter, lightweight local Like/
  // Did-This state (Save reuses the existing savedBloom system instead),
  // and a toggle for the non-destructive search placeholder.
  const [feedTimeFilter, setFeedTimeFilter] = useState(null)
  const [feedMoodFilter, setFeedMoodFilter] = useState(null)
  const [feedRotation, setFeedRotation] = useState(null)
  const [bloomFeedLimit, setBloomFeedLimit] = useState(12)
  const [likedFeed, setLikedFeed] = useState([])
  const [doneFeed, setDoneFeed] = useState([])
  const [contentInteractions, setContentInteractions] = useState([])
  const [bloomSearchOpen, setBloomSearchOpen] = useState(false)
  // Seasonal — which season is selected (defaults to fall) and whether the
  // Browse Seasons picker is expanded. Ephemeral UI state, not persisted.
  const [seasonalSeason, setSeasonalSeason] = useState("fall")
  const [seasonalBrowseOpen, setSeasonalBrowseOpen] = useState(false)
  // My Reverie — the personal home for what she saves, lives, and becomes.
  const [reverieSection, setReverieSection] = useState("home") // home | saved | history
  const [reverieEntries, setReverieEntries] = useState([])
  const [reverieSearch, setReverieSearch] = useState("")
  const [reverieComposerOpen, setReverieComposerOpen] = useState(false)
  const [reverieDraft, setReverieDraft] = useState({ title: "", note: "", date: new Date().toISOString().slice(0, 10), photo: null, share: false })
  const [rebuildComingSoon, setRebuildComingSoon] = useState(null) // program id, or null
  // Feel Like Yourself Again — navigation state is ephemeral (fine to reset on
  // reload, same as everywhere else in the app). Actual progress is bundled
  // into one object and persisted to localStorage, same pattern as setupData.
  const [rebuildActiveProgram, setRebuildActiveProgram] = useState(null)
  const [rebuildDynamicExpId, setRebuildDynamicExpId] = useState(null)
  const [rebuildView, setRebuildView] = useState("intro") // 'intro'|'home'|'exp'|'reveal'|'recap'|'journey'
  const [rebuildCapPick, setRebuildCapPick] = useState(null) // manual capacity override for the open experience
  const [rebuildFLYA, setRebuildFLYA] = useState({ started: false, currentExp: 1, completed: [], log: {} })
  // Rebuild discovery shell — separate from individual program content/progress.
  const [rebuildSection, setRebuildSection] = useState("rebuild") // rebuild | feel-better | rituals
  const [rebuildCurrent, setRebuildCurrentRaw] = useState([])
  const [rebuildSaved, setRebuildSavedRaw] = useState([])
  const [rebuildStartWarning, setRebuildStartWarning] = useState(null)
  // Prototype membership flag. Production will replace this with real subscription entitlement.
  const [rebuildPlus] = useState(false)

  // Which month "This Month" is showing. Independent from capMonth (the
  // Capacity calendar's own range control) so paging one doesn't move the other.
  const [reviewMonth, setReviewMonth] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() } })
  const [capRange, setCapRange] = useState("week") // "This Week" is the section's default snapshot, not the calendar month
  const [capMonth, setCapMonth] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() } })
  const [capDay, setCapDay] = useState(null)
  const [moreView, setMoreView] = useState("menu")
  const [glowLog, setGlowLog] = useState({})
  const [bloomNotes, setBloomNotes] = useState({})
  const [bloomSection, setBloomSection] = useState("appearance")
  const [bloomCard, setBloomCard] = useState(null)
  const bloomScrollRef = useRef(0)
  const [ctxOpen, setCtxOpen] = useState(false)
  const [editLife, setEditLife] = useState(null)
  const [programId, setProgramId] = useState(null)
  const [programStart, setProgramStart] = useState(null)
  const [trainView, setTrainView] = useState("home")
  const [whyOpen, setWhyOpen] = useState(false)
  const [detailProgram, setDetailProgram] = useState(null)
  const [libOpen, setLibOpen] = useState(null)
  const [libLevel, setLibLevel] = useState("beginner")
  const [nourishView, setNourishView] = useState("today")
  const [foodPath, setFoodPath] = useState(null)
  const [suppOpen, setSuppOpen] = useState(null)
  const [planView, setPlanView] = useState(null)
  const [nutrition, setNutrition] = useState(null)
  const [mealType, setMealType] = useState(null)
  const [mealFilter, setMealFilter] = useState(null)
  const [learnOpen, setLearnOpen] = useState(null)
  const [bloomPillar, setBloomPillar] = useState(null)
  const [bloomArticle, setBloomArticle] = useState(null)
  const [savedBloom, setSavedBloom] = useState([])
  const [glowTopic, setGlowTopic] = useState(null)
  const [glowSheet, setGlowSheet] = useState(null)
  const [glowOpen, setGlowOpen] = useState(["guides", "wins"])
  const [glowItem, setGlowItem] = useState(null)
  const [cycLib, setCycLib] = useState(null)
  const [cycArticle, setCycArticle] = useState(null)
  const [cycleLogs, setCycleLogs] = useState({})
  const [useAvgCycle, setUseAvgCycleRaw] = useState(false)
  const [greetingOn, setGreetingOnRaw] = useState(true) // default ON unless an existing preference says otherwise
  const [greetingStyle, setGreetingStyleRaw] = useState("name_formal")
  const [cycLogDate, setCycLogDate] = useState(() => cycleLocalDateISO())
  // Which slice of the suggestion pool is showing. Scoped to the day so
  // Surprise Me keeps moving forward rather than repeating within a day.
  const [resetSeed, setResetSeed] = useState({ d: "", day: 0, night: 0 })
  const [resetPage, setResetPage] = useState(null)
  const [flourishTime, setFlourishTime] = useState(null)
  const [flourishProject, setFlourishProject] = useState(null)
  const [resetSongs, setResetSongs] = useState(null)
  const [cycleMonth, setCycleMonth] = useState(0)
  const [eduPhase, setEduPhase] = useState(null)
  const [woEnv, setWoEnv] = useState("gym")
  const [recoveryOpen, setRecoveryOpen] = useState(null)
  const [recoveryDone, setRecoveryDone] = useState(false)
  const [woMode, setWoMode] = useState("overview")
  const [guidedIdx, setGuidedIdx] = useState(0)
  const [restLeft, setRestLeft] = useState(0)
  const [lifeMsg, setLifeMsg] = useState("")
  // Supabase-backed Bloom discoveries. Hard-coded discoveries remain as fallback/content during migration.
  const [supabaseBloomRows, setSupabaseBloomRows] = useState([])
  const [supabaseMoveRows, setSupabaseMoveRows] = useState([])
  const [supabaseNourishRows, setSupabaseNourishRows] = useState([])
  const [supabaseCycleRows, setSupabaseCycleRows] = useState([])
  const [supabaseRebuildRows, setSupabaseRebuildRows] = useState([])
  const [supabaseFeelBetterRows, setSupabaseFeelBetterRows] = useState([])
  const [supabaseRitualRows, setSupabaseRitualRows] = useState([])
  const [supabaseRebuildExperiences, setSupabaseRebuildExperiences] = useState([])
  const [rebuildProgressRows, setRebuildProgressRows] = useState([])

  useEffect(() => {
    try { const rb = localStorage.getItem("nr_rebuild_flya"); if (rb) setRebuildFLYA(JSON.parse(rb)) } catch (e) {}
    try { const rc = localStorage.getItem("nr_rebuild_current"); if (rc) setRebuildCurrentRaw(JSON.parse(rc)) } catch (e) {}
    try { const rs = localStorage.getItem("nr_rebuild_saved"); if (rs) setRebuildSavedRaw(JSON.parse(rs)) } catch (e) {}
    try { const re = localStorage.getItem("nr_reverie_entries"); if (re) setReverieEntries(JSON.parse(re)) } catch (e) {}
    try { const df = localStorage.getItem("nr_done_feed"); if (df) setDoneFeed(JSON.parse(df)) } catch (e) {}
    try { const lf = localStorage.getItem("nr_liked_feed"); if (lf) setLikedFeed(JSON.parse(lf)) } catch (e) {}
    try { const next = (parseInt(localStorage.getItem("nr_bloom_visit") || "0", 10) + 1) % 997; localStorage.setItem("nr_bloom_visit", String(next)); setFeedRotation(next) } catch (e) {}
    try { const n = localStorage.getItem("nr_nutrition"); if (n) setNutrition(JSON.parse(n)) } catch (e) {}
    try { const sb = localStorage.getItem("nr_bloom_saved"); if (sb) setSavedBloom(JSON.parse(sb)) } catch (e) {}
    try { const cl = localStorage.getItem("nr_cycle_logs"); if (cl) setCycleLogs(JSON.parse(cl)) } catch (e) {}
    try { setUseAvgCycleRaw(localStorage.getItem("nr_use_avg_cycle") === "1") } catch (e) {}
    try { const go = localStorage.getItem("nr_greeting_on"); if (go !== null) setGreetingOnRaw(go === "1") } catch (e) {}
    try { const gs = localStorage.getItem("nr_greeting_style"); if (gs) setGreetingStyleRaw(gs) } catch (e) {}
    try {
      const rs = JSON.parse(localStorage.getItem("nr_reset_seed") || "null")
      if (rs && rs.d === new Date().toISOString().slice(0, 10)) setResetSeed(rs)
    } catch (e) {}
    try {
      // migrate the previous single-day log format, if present
      const legacy = JSON.parse(localStorage.getItem("nr_food_log") || "null")
      if (legacy && legacy.date) {
        setFoodDays((prev) => prev[legacy.date] ? prev : { ...prev, [legacy.date]: { items: (legacy.items || []).map((i) => ({ ...i, meal: i.meal || "snack", name: i.name || i.n })), water: legacy.water || 0 } })
        localStorage.removeItem("nr_food_log")
      }
    } catch (e) {}
    try { setGlowLog(JSON.parse(localStorage.getItem("nr_glow_log") || "{}")) } catch (e) {}
    try { setBloomNotes(JSON.parse(localStorage.getItem("nr_bloom_notes") || "{}")) } catch (e) {}
    try { const pid = localStorage.getItem("nr_program"); if (pid) setProgramId(pid) } catch (e) {}
    try { const ps = localStorage.getItem("nr_program_start"); if (ps) setProgramStart(ps) } catch (e) {}
    let cachedName = null
    try { cachedName = localStorage.getItem("nr_name"); if (cachedName) setFirstName(cachedName) } catch (e) {}
    try {
      const st = localStorage.getItem("nr_setup")
      if (st) {
        const parsed = JSON.parse(st)
        if (!parsed.name && cachedName) parsed.name = cachedName // nr_setup's embedded name can go stale; nr_name is the more reliable copy
        setSetupData(parsed)
      }
    } catch (e) {}
  }, [])

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    let cancelled = false

    const loadPublishedStudioContent = async () => {
      const { data, error } = await db
        .from("tr_content")
        .select("id,title,content_type,format,category,image_url,is_premium,is_featured,content,extra_pages,published_at,created_at")
        .in("content_type", ["bloom", "move", "nourish", "cycle", "rebuild", "feel_better", "ritual"])
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })

      if (cancelled) return
      if (error) {
        console.error("Could not load True Reverie Studio content from Supabase:", error.message)
        return
      }
      const rows = data || []
      setSupabaseBloomRows(rows.filter(row => row.content_type === "bloom"))
      setSupabaseMoveRows(rows.filter(row => row.content_type === "move"))
      setSupabaseNourishRows(rows.filter(row => row.content_type === "nourish"))
      setSupabaseCycleRows(rows.filter(row => row.content_type === "cycle"))
      setSupabaseRebuildRows(rows.filter(row => row.content_type === "rebuild"))
      setSupabaseFeelBetterRows(rows.filter(row => row.content_type === "feel_better"))
      setSupabaseRitualRows(rows.filter(row => row.content_type === "ritual"))
      const { data: expData, error: expError } = await db.from("tr_rebuild_experiences").select("*").eq("status","published").order("sort_order",{ascending:true})
      if (!cancelled && !expError) setSupabaseRebuildExperiences(expData || [])
    }

    loadPublishedStudioContent()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    // Clear any manual workout selection when the program changes (selection is per-program, per-session).
    setSelectedWoKey(null)
    setForceTrainMenu(false)
    setWoTier(null)
  }, [programId])

  // Cycle tracking is a normal full-page screen now, not a modal.
  // Do not lock document.body scrolling when editCycle is open.


  useEffect(() => {
    if (restLeft <= 0) return
    const t = setTimeout(() => setRestLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [restLeft])

  useEffect(() => {
    // Recovery links can come back in a few different shapes depending on the
    // Supabase auth flow/browser. Recognize all of them, plus a same-device
    // pending flag set when the reset email is requested. Keep that flag until
    // the password is actually changed so normal auth/profile routing cannot
    // swallow the reset-password screen.
    const detectRecovery = async () => {
      try {
        const qs = new URLSearchParams(window.location.search)
        const hash = new URLSearchParams((window.location.hash || "").replace(/^#/, ""))
        const marked = qs.get("recovery") === "1" || qs.get("type") === "recovery" || hash.get("type") === "recovery"
        const pending = localStorage.getItem("tr_password_recovery_pending") === "1"
        const { data } = await db.auth.getSession()
        if ((marked || pending) && data?.session) setRecovery(true)
      } catch (e) {}
    }
    detectRecovery()

    const { data: sub } = db.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        try { localStorage.setItem("tr_password_recovery_pending", "1") } catch (e) {}
        setRecovery(true)
      }
    })
    return () => { try { sub.subscription.unsubscribe() } catch (e) {} }
  }, [])

  useEffect(() => {
    try {
      const L = window.localStorage.getItem("cap_cycle_length")
      const S = window.localStorage.getItem("cap_last_period")
      if (L) setCycleLength(L)
      if (S) setLastPeriod(S)
      if (L) setTmpLen(L)
      if (S) setTmpStart(S)
    } catch (e) {}
  }, [])

  const checkAuth = async () => {
    try {
      const s = await db.auth.getSession()
      if (s.data.session) {
        const u = s.data.session.user
        setUser(u)
        const p = await db.from("profiles").select("*").eq("id", u.id).single()

        // Phase 6: Cycle tracking now belongs to the signed-in account.
        // One private row stores settings + the existing flexible per-day log object,
        // so the Cycle UI does not need to change as tracking options evolve.
        try {
          const ct = await db.from("tr_cycle_tracking").select("cycle_length,last_period,use_avg_cycle,logs").eq("user_id", u.id).maybeSingle()
          if (ct.data) {
            const c = ct.data
            if (c.cycle_length) { const L = String(c.cycle_length); setCycleLength(L); setTmpLen(L); try { localStorage.setItem("cap_cycle_length", L) } catch (e) {} }
            if (c.last_period) { setLastPeriod(c.last_period); setTmpStart(c.last_period); try { localStorage.setItem("cap_last_period", c.last_period) } catch (e) {} }
            if (typeof c.use_avg_cycle === "boolean") { setUseAvgCycleRaw(c.use_avg_cycle); try { localStorage.setItem("nr_use_avg_cycle", c.use_avg_cycle ? "1" : "0") } catch (e) {} }
            if (c.logs && typeof c.logs === "object" && !Array.isArray(c.logs)) { setCycleLogs(c.logs); try { localStorage.setItem("nr_cycle_logs", JSON.stringify(c.logs)) } catch (e) {} }
          }
        } catch (e) {}

        if (p.data) {
          setProfile(p.data)
          if (p.data.setup) {
            const sd = p.data.setup
            // Two independent copies of "name" can drift (setup.name vs. the
            // top-level first_name column). Resolve through both, and heal
            // sd.name in place so every later write in this block — including
            // the unconditional nr_setup save just below — persists the fix.
            const resolvedName = sd.name || p.data.first_name || ""
            if (resolvedName && sd.name !== resolvedName) sd.name = resolvedName
            setSetupData(sd)
            if (resolvedName) { setFirstName(resolvedName); try { localStorage.setItem("nr_name", resolvedName) } catch (e) {} }
            if (sd.nutrition) { setNutrition(sd.nutrition); try { localStorage.setItem("nr_nutrition", JSON.stringify(sd.nutrition)) } catch (e) {} }
            if (Array.isArray(sd.savedBloom)) { setSavedBloom(sd.savedBloom); try { localStorage.setItem("nr_bloom_saved", JSON.stringify(sd.savedBloom)) } catch (e) {} }
            if (sd.cycleLogs && typeof sd.cycleLogs === "object") { setCycleLogs(sd.cycleLogs); try { localStorage.setItem("nr_cycle_logs", JSON.stringify(sd.cycleLogs)) } catch (e) {} }
            if (typeof sd.useAvgCycle === "boolean") { setUseAvgCycleRaw(sd.useAvgCycle); try { localStorage.setItem("nr_use_avg_cycle", sd.useAvgCycle ? "1" : "0") } catch (e) {} }
            if (typeof sd.greetingOn === "boolean") { setGreetingOnRaw(sd.greetingOn); try { localStorage.setItem("nr_greeting_on", sd.greetingOn ? "1" : "0") } catch (e) {} }
            if (sd.greetingStyle) { setGreetingStyleRaw(sd.greetingStyle); try { localStorage.setItem("nr_greeting_style", sd.greetingStyle) } catch (e) {} }
            try { localStorage.setItem("nr_setup", JSON.stringify(sd)) } catch (e) {}
          } else {
            // Supabase is the source of truth for onboarding. Do not let an old
            // nr_setup cache from another/prototype account skip onboarding.
            setSetupData(null)
            if (p.data.first_name) setFirstName(p.data.first_name)
          }
          // Cross-device program restore (profile wins over local if present)
          if (p.data.program) {
            setProgramId(p.data.program)
            if (p.data.program_start) setProgramStart(p.data.program_start)
            try { localStorage.setItem("nr_program", p.data.program); if (p.data.program_start) localStorage.setItem("nr_program_start", p.data.program_start) } catch (e) {}
          }
        }
        await loadContentInteractions(u.id)
        await loadRebuildProgress(u.id)
      }
    } catch (err) { console.log(err) }
    setLoading(false)
  }

  const loadContentInteractions = async (uid) => {
    if (!uid) return
    const { data, error } = await db.from("tr_user_content_interactions").select("*").eq("user_id", uid).order("created_at", { ascending: false })
    if (error) { console.log("interaction load", error); return }
    const rows = data || []
    setContentInteractions(rows)
    setSavedBloom(rows.filter((r) => r.action === "saved").map((r) => r.content_key))
    setDoneFeed(rows.filter((r) => r.action === "did_this").map((r) => r.content_key))
  }

  const hasInteraction = (action, contentKey) => contentInteractions.some((r) => r.action === action && r.content_key === String(contentKey))

  const setInteraction = async (action, contentKey, meta = {}) => {
    if (!user || user.id === "prototype-user") return false
    const key = String(contentKey)
    const existing = contentInteractions.find((r) => r.action === action && r.content_key === key)
    if (existing) {
      setContentInteractions((prev) => prev.filter((r) => !(r.action === action && r.content_key === key)))
      const { error } = await db.from("tr_user_content_interactions").delete().eq("user_id", user.id).eq("action", action).eq("content_key", key)
      if (error) { console.log("interaction delete", error); await loadContentInteractions(user.id); return false }
      return false
    }
    const row = {
      user_id: user.id, action, content_key: key,
      content_type: meta.contentType || key.split(":")[0] || "content",
      title: meta.title || key.replace(/^[^:]+:/, "").replace(/[-_]/g, " "),
      image_url: meta.image || meta.image_url || null,
      metadata: meta || {}
    }
    setContentInteractions((prev) => [{ ...row, id: `optimistic-${Date.now()}`, created_at: new Date().toISOString() }, ...prev])
    const { error } = await db.from("tr_user_content_interactions").insert(row)
    if (error) { console.log("interaction insert", error); await loadContentInteractions(user.id); return false }
    return true
  }

  const toggleDidThis = (contentKey, meta = {}) => setInteraction("did_this", contentKey, meta)

  const loadRebuildProgress = async (uid) => {
    if (!uid) return
    const { data, error } = await db.from("tr_rebuild_progress").select("*").eq("user_id", uid).order("updated_at", { ascending: false })
    if (error) { console.log("rebuild progress load", error); return }
    const rows = data || []
    setRebuildProgressRows(rows)
    // Supabase is authoritative for signed-in Rebuild membership/progress.
    const activeKeys = rows.filter((r) => r.status === "active").map((r) => r.program_key)
    if (activeKeys.length) setRebuildCurrentRaw(activeKeys)
    const legacy = rows.find((r) => r.program_key === "feel-like-yourself-again")
    if (legacy) {
      const next = {
        started: true,
        currentExp: Number(legacy.current_experience_number) || 1,
        completed: Array.isArray(legacy.completed_experience_ids) ? legacy.completed_experience_ids.map(Number).filter(Number.isFinite) : [],
        log: legacy.log && typeof legacy.log === "object" ? legacy.log : {},
      }
      setRebuildFLYA(next)
      try { localStorage.setItem("nr_rebuild_flya", JSON.stringify(next)) } catch (e) {}
    }
  }

  const getRebuildProgress = (programKey) => rebuildProgressRows.find((r) => r.program_key === String(programKey)) || null

  const startRebuildProgress = async ({ programKey, rebuildId = null, currentExperienceId = null, currentExperienceNumber = 1 }) => {
    if (!user || user.id === "prototype-user") return null
    const key = String(programKey)
    const existing = getRebuildProgress(key)
    const row = {
      user_id: user.id,
      program_key: key,
      rebuild_id: rebuildId,
      status: "active",
      current_experience_id: currentExperienceId,
      current_experience_number: currentExperienceNumber || 1,
      completed_experience_ids: existing?.completed_experience_ids || [],
      log: existing?.log || {},
      started_at: existing?.started_at || new Date().toISOString(),
      completed_at: null,
      updated_at: new Date().toISOString(),
    }
    setRebuildProgressRows((prev) => [row, ...prev.filter((r) => r.program_key !== key)])
    const { data, error } = await db.from("tr_rebuild_progress").upsert(row, { onConflict: "user_id,program_key" }).select().single()
    if (error) { console.log("rebuild progress start", error); await loadRebuildProgress(user.id); return null }
    setRebuildProgressRows((prev) => [data, ...prev.filter((r) => r.program_key !== key)])
    return data
  }

  const completeRebuildExperience = async ({ programKey, rebuildId = null, experienceId, experienceNumber, nextExperienceId = null, nextExperienceNumber = null, logPatch = null, isLast = false }) => {
    if (!user || user.id === "prototype-user") return null
    const key = String(programKey)
    const existing = getRebuildProgress(key)
    const completed = Array.from(new Set([...(Array.isArray(existing?.completed_experience_ids) ? existing.completed_experience_ids : []), experienceId]))
    const row = {
      user_id: user.id,
      program_key: key,
      rebuild_id: rebuildId,
      status: isLast ? "completed" : "active",
      current_experience_id: isLast ? experienceId : nextExperienceId,
      current_experience_number: isLast ? experienceNumber : (nextExperienceNumber || experienceNumber + 1),
      completed_experience_ids: completed,
      log: { ...(existing?.log || {}), ...(logPatch || {}) },
      started_at: existing?.started_at || new Date().toISOString(),
      completed_at: isLast ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    setRebuildProgressRows((prev) => [row, ...prev.filter((r) => r.program_key !== key)])
    const { data, error } = await db.from("tr_rebuild_progress").upsert(row, { onConflict: "user_id,program_key" }).select().single()
    if (error) { console.log("rebuild progress complete", error); await loadRebuildProgress(user.id); return null }
    setRebuildProgressRows((prev) => [data, ...prev.filter((r) => r.program_key !== key)])
    return data
  }


  const handleLogin = async () => {
    setLoading(true)
    try {
      const res = await db.auth.signInWithPassword({ email, password })
      if (res.error) { setAuthMsg(res.error.message || "Login failed — check your email and password."); setLoading(false); return }
      if (res.data.user) {
        setSetupData(null)
        setEmail(""); setPassword(""); setAuthMsg("")
        await checkAuth()
      }
    } catch (err) { setAuthMsg("Login failed — please try again."); setLoading(false) }
  }

  const handleSignUp = async () => {
    try {
      const cleanName = firstName.trim()
      const res = await db.auth.signUp({
        email,
        password,
        options: { data: { first_name: cleanName } },
      })
      if (res.error) { setAuthMsg(res.error.message || "Sign up failed — please try again."); return }
      if (res.data.session && res.data.user) {
        // The database trigger creates the profile. Upsert here too so this also
        // works in projects where email confirmation is disabled.
        await db.from("profiles").upsert([{ id: res.data.user.id, email, first_name: cleanName, has_membership: false }], { onConflict: "id" })
        setUser(res.data.user)
        setSetupData(null)
        setEmail(""); setPassword(""); setConfirmPw(""); setAuthMsg("")
        await checkAuth()
      } else if (res.data.user) {
        // Supabase email confirmation is enabled: stay on auth until the link is used.
        setPassword(""); setConfirmPw("")
        setAuthMsg("Account created — check your email to confirm it, then log in.")
      }
    } catch (err) { setAuthMsg("Sign up failed — please try again.") }
  }

  const handleLogout = async () => {
    // PROTOTYPE-ONLY AUTH BYPASS — remove when rebuilding production auth.
    // Logging out would otherwise wipe local Rebuild/Bloom/Cycle/Nourish data
    // and strand the app on a login screen there's no real account to use.
    if (PROTOTYPE_MODE) return
    await db.auth.signOut()
    setUser(null); setProfile(null)
    setNutrition(null); setSavedBloom([]); setCycleLogs({}); setUseAvgCycleRaw(false); setGreetingOnRaw(true); setGreetingStyleRaw("name_formal"); setResetSeed({ d: "", day: 0, night: 0 }); setResetPage(null); setFlourishTime(null); setFlourishProject(null); setBloomPillar(null); setBloomArticle(null); setGlowTopic(null); setGlowSheet(null); setGlowOpen(["guides", "wins"]); setGlowItem(null); setPlanView(null); setNourishView("today")
    setProgramId(null); setSetupData(null); setFirstName("")
    setCycleLength(""); setLastPeriod(""); setPeriodDismissed(false)
    setTab("bloom"); setBodyView("gym")
    try {
      ["nr_program", "nr_program_start", "nr_name", "nr_setup", "cap_cycle_length", "cap_last_period", "nr_bloom_notes", "nr_nutrition", "nr_bloom_saved", "nr_cycle_logs", "nr_use_avg_cycle", "nr_greeting_on", "nr_greeting_style", "nr_reset_seed"].forEach((k) => localStorage.removeItem(k))
    } catch (e) {}
  }

  const handleForgot = async () => {
    if (!email) { setAuthMsg("Enter your email above first, then tap reset."); return }
    setAuthMsg("")
    try {
      // Always give Supabase a fully-qualified recovery destination. This is
      // the URL embedded into the recovery flow and must also be allowed in
      // Supabase Authentication > URL Configuration.
      const recoveryUrl = `${window.location.origin}/?recovery=1`
      const { error } = await db.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: recoveryUrl,
      })
      if (error) { setAuthMsg(error.message || "Couldn't send the reset email."); return }
      try { localStorage.setItem("tr_password_recovery_pending", "1") } catch (e) {}
      setAuthMsg("Check your email for a link to reset your password.")
    } catch (err) { setAuthMsg("Couldn't send the reset email — double-check the address.") }
  }

  const handleSetNewPassword = async () => {
    if (newPass.length < 6) { setAuthMsg("Password must be at least 6 characters."); return }
    try {
      const { error } = await db.auth.updateUser({ password: newPass })
      if (error) { setAuthMsg(error.message); return }
      try { localStorage.removeItem("tr_password_recovery_pending") } catch (e) {}
      setRecovery(false); setNewPass(""); setAuthMsg("")
      try {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`
        window.history.replaceState({}, "", cleanUrl)
      } catch (e) {}
      await checkAuth()
    } catch (err) { setAuthMsg("Couldn't update password. Try the reset link again.") }
  }

  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  // Persist program selection: localStorage (instant) + profile (cross-device). Pass null to clear.
  const openBloomCard = (card) => {
    try { bloomScrollRef.current = window.scrollY || 0 } catch (e) {}
    setBloomCard(card)
    try { window.scrollTo(0, 0) } catch (e) {}
  }
  const closeBloom = () => {
    setBloomCard(null)
    setTimeout(() => { try { window.scrollTo(0, bloomScrollRef.current) } catch (e) {} }, 0)
  }

  // ---- Nourish: plan + food log persistence ----
  // Private Bloom saves. Mirrors how nutrition persists: localStorage for speed,
  // profiles.setup for cross-device. No schema change, no shared write.
  // The anonymous aggregate counter is deliberately NOT called from here yet —
  // see the note in the summary before that ships.
  // One tracking record per calendar date. Local and profile are written in the
  // same call so the two can never drift apart.
  const saveCycleLog = (date, patch) => {
    const prev = cycleLogs[date] || {}
    const entry = { ...prev, ...patch }
    Object.keys(entry).forEach((k) => {
      const v = entry[k]
      if (v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) delete entry[k]
    })
    const next = { ...cycleLogs }
    if (Object.keys(entry).length === 0) delete next[date]
    else next[date] = entry
    setCycleLogs(next)
    try { localStorage.setItem("nr_cycle_logs", JSON.stringify(next)) } catch (e) {}
    try { if (user && user.id !== "prototype-user") db.from("tr_cycle_tracking").upsert({ user_id: user.id, logs: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).then(() => {}) } catch (e) {}
  }

  const isSavedBloom = (id) => hasInteraction("saved", id) || savedBloom.indexOf(id) >= 0
  const toggleSaveBloom = async (id, meta = {}) => {
    const key = String(id)
    if (user && user.id !== "prototype-user") {
      const nowSaved = await setInteraction("saved", key, meta)
      setSavedBloom((prev) => nowSaved ? (prev.includes(key) ? prev : [...prev, key]) : prev.filter((x) => x !== key))
      return
    }
    const wasSaved = savedBloom.includes(key)
    setSavedBloom(wasSaved ? savedBloom.filter((x) => x !== key) : [...savedBloom, key])
  }

  // Feel Like Yourself Again progress — one bundled object, same durability
  // pattern as everything else real in this app (localStorage immediately,
  // folded into the existing profiles.setup sync for signed-in users). Not a
  // new persistence system: same JSON blob column, same one-line addition
  // already used for savedBloom, cycleLogs, greetingOn, and useAvgCycle.
  const updateRebuildFLYA = (updater) => {
    setRebuildFLYA((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
      try { localStorage.setItem("nr_rebuild_flya", JSON.stringify(next)) } catch (e) {}
      try {
        if (user && user.id !== "prototype-user") {
          db.from("profiles").update({ setup: { ...(setupData || {}), rebuildFLYA: next } }).eq("id", user.id).then(() => {})
          const legacyRow = {
            user_id: user.id, program_key: "feel-like-yourself-again", rebuild_id: null,
            status: next.completed?.length >= 28 ? "completed" : "active",
            current_experience_id: null, current_experience_number: Number(next.currentExp) || 1,
            completed_experience_ids: next.completed || [], log: next.log || {},
            started_at: new Date().toISOString(), completed_at: next.completed?.length >= 28 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          }
          db.from("tr_rebuild_progress").upsert(legacyRow, { onConflict: "user_id,program_key" }).then(({ error }) => { if (error) console.log("legacy rebuild progress", error) })
          setRebuildProgressRows((prevRows) => [legacyRow, ...prevRows.filter((r) => r.program_key !== "feel-like-yourself-again")])
        }
      } catch (e) {}
      return next
    })
  }

  const saveNutrition = (n) => {
    setNutrition(n)
    try { localStorage.setItem("nr_nutrition", JSON.stringify(n)) } catch (e) {}
    try { if (user && user.id !== "prototype-user") db.from("profiles").update({ setup: { ...(setupData || {}), nutrition: n } }).eq("id", user.id).then(() => {}) } catch (e) {}
  }

  const persistProgram = (pid) => {
    const iso = new Date().toISOString().slice(0, 10)
    if (pid) {
      setProgramId(pid); setProgramStart(iso)
      try { localStorage.setItem("nr_program", pid); localStorage.setItem("nr_program_start", iso) } catch (e) {}
      if (user && db && user.id !== "prototype-user") { try { db.from("profiles").update({ program: pid, program_start: iso }).eq("id", user.id).then(() => {}) } catch (e) {} }
    } else {
      setProgramId(null)
      try { localStorage.removeItem("nr_program"); localStorage.removeItem("nr_program_start") } catch (e) {}
      if (user && db && user.id !== "prototype-user") { try { db.from("profiles").update({ program: null, program_start: null }).eq("id", user.id).then(() => {}) } catch (e) {} }
    }
  }


  // Persists cycle setup without leaving the screen. Cycle Settings now sit
  // inline above tracking, so saving them must not navigate away.
  // Advances one section's window through its pool. Local only — this is a
  // within-the-day preference, not something worth syncing to a profile.
  const surpriseReset = (which) => {
    const d = new Date().toISOString().slice(0, 10)
    const base = resetSeed.d === d ? resetSeed : { d, day: 0, night: 0 }
    const next = { ...base, d, [which]: base[which] + 1 }
    setResetSeed(next)
    try { localStorage.setItem("nr_reset_seed", JSON.stringify(next)) } catch (e) {}
  }

  const setUseAvgCycle = (v) => {
    setUseAvgCycleRaw(v)
    try { localStorage.setItem("nr_use_avg_cycle", v ? "1" : "0") } catch (e) {}
    try { if (user && user.id !== "prototype-user") db.from("tr_cycle_tracking").upsert({ user_id: user.id, use_avg_cycle: v, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).then(() => {}) } catch (e) {}
  }

  const setGreetingOn = (v) => {
    setGreetingOnRaw(v)
    try { localStorage.setItem("nr_greeting_on", v ? "1" : "0") } catch (e) {}
    try { if (user && user.id !== "prototype-user") db.from("profiles").update({ setup: { ...(setupData || {}), greetingOn: v } }).eq("id", user.id).then(() => {}) } catch (e) {}
  }
  const setGreetingStyle = (v) => {
    setGreetingStyleRaw(v)
    try { localStorage.setItem("nr_greeting_style", v) } catch (e) {}
    try { if (user && user.id !== "prototype-user") db.from("profiles").update({ setup: { ...(setupData || {}), greetingStyle: v } }).eq("id", user.id).then(() => {}) } catch (e) {}
  }

  const saveCycleSettings = (start, len) => {
    const L = String(Math.max(20, Math.min(45, parseInt(len) || 28)))
    setCycleLength(L)
    if (start) setLastPeriod(start)
    try {
      window.localStorage.setItem("cap_cycle_length", L)
      if (start) window.localStorage.setItem("cap_last_period", start)
    } catch (e) {}
    if (user && db && user.id !== "prototype-user") { try { db.from("tr_cycle_tracking").upsert({ user_id: user.id, cycle_length: Number(L), last_period: start || lastPeriod || null, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).then(() => {}) } catch (e) {} }
  }

  const saveCycle = () => {
    const L = String(Math.max(20, Math.min(45, parseInt(tmpLen) || 28)))
    setCycleLength(L)
    setLastPeriod(tmpStart)
    try {
      window.localStorage.setItem("cap_cycle_length", L)
      window.localStorage.setItem("cap_last_period", tmpStart)
    } catch (e) {}
    if (user && db && user.id !== "prototype-user") { try { db.from("tr_cycle_tracking").upsert({ user_id: user.id, cycle_length: Number(L), last_period: tmpStart || null, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).then(() => {}) } catch (e) {} }
    setEditCycle(false)
  }



  const Fonts = () => (
    <Head>
      <title>True Reverie</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Sacramento&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </Head>
  )

  const GlobalStyle = () => (
    <style jsx global>{`
      * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      html, body { background: #FDF7F4; color: #2A1522; font-family: 'Nunito Sans', -apple-system, sans-serif; }
      ::-webkit-scrollbar { width: 0; }
      a { text-decoration: none; }
      input[type=range] { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; outline: none; }
      input[type=range]::-webkit-slider-runnable-track { -webkit-appearance: none; height: 6px; border-radius: 999px; background: transparent; border: none; }
      input[type=range]::-moz-range-track { height: 6px; border-radius: 999px; background: transparent; border: none; }
      /* Once ::-webkit-slider-runnable-track has an explicit height, WebKit aligns
         the thumb to the TOP of the track instead of centring it. Offset by half
         the difference: (6px track - 26px thumb) / 2 = -10px. */
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #FFFFFF; cursor: pointer; border: 3px solid var(--accent, #D08560); margin-top: -10px; }
      input[type=range]::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #FFFFFF; cursor: pointer; border: 3px solid var(--accent, #D08560); }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @keyframes breathe { 0%,100% { opacity: .9; } 50% { opacity: 1; } }
      @keyframes drift { 0% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-16px,-12px) rotate(-5deg); } 100% { transform: translate(0,0) rotate(0deg); } }
      @keyframes flicker { 0%,100% { opacity: .35; } 50% { opacity: .95; } }
      @keyframes mistfloat { 0%,100% { transform: translateX(0); } 50% { transform: translateX(18px); } }
      @keyframes twinkle { 0%,100% { opacity: .4; } 50% { opacity: .9; } }
      @keyframes crossing { 0% { transform: translateX(-46px) translateY(0); } 50% { transform: translateX(210px) translateY(-24px); } 100% { transform: translateX(470px) translateY(6px); } }
      @keyframes flutter { 0%,100% { transform: rotate(-4deg) scaleX(1); } 50% { transform: rotate(4deg) scaleX(.88); } }
      @keyframes pollen { 0% { transform: translate(0,0); opacity: 0; } 25% { opacity: .55; } 75% { opacity: .35; } 100% { transform: translate(24px,-96px); opacity: 0; } }
      @keyframes firefly { 0%,100% { opacity: .12; transform: translate(0,0); } 50% { opacity: .95; transform: translate(11px,-9px); } }
      @keyframes sway { 0%,100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
      @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
      .fade-in { animation: fadeIn 0.5s ease both; }
      .glow-breathe { animation: breathe 6s ease-in-out infinite; }
    `}</style>
  )

  if (loading) {
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: BASE.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 440, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 46, color: BASE.cream }}>True Reverie</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.taupe, marginTop: 6, textAlign: "center" }}>Dream her. Become Her.</div>
          </div>
        </div>
      </>
    )
  }

  if (recovery) {
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: BASE.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 44, color: BASE.cream, marginBottom: 8 }}>True Reverie</div>
            <div style={{ fontSize: 13, color: BASE.creamDim }}>Choose a new password</div>
          </div>
          <input type="password" placeholder="New password" value={newPass} onChange={(e) => setNewPass(e.target.value)} style={{ width: "100%", padding: 14, background: BASE.surface2, border: `1px solid ${BASE.border}`, color: BASE.cream, borderRadius: 8, fontSize: 14, marginBottom: 16 }} />
          {authMsg && <div style={{ fontSize: 13, color: BASE.creamDim, textAlign: "center", marginBottom: 14, lineHeight: 1.5 }}>{authMsg}</div>}
          <button onClick={handleSetNewPassword} style={{ width: "100%", padding: 16, background: BASE.terracotta, color: "#FFFFFF", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>Save new password</button>
        </div>
      </>
    )
  }

  if (!user) {
    const envA = ENV(new Date().getHours(), null)
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: envA.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 70, left: "50%", marginLeft: -55, width: 110, height: 110, borderRadius: "50%", background: envA.dark ? "radial-gradient(circle,#F5E6C4 30%,rgba(245,230,196,0.35) 60%,rgba(245,230,196,0) 78%)" : "radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)" }} />
          {envA.dark && <><span style={{ position: "absolute", top: 46, left: 60, color: "#E8B84B", opacity: 0.7, fontSize: 11, animation: "twinkle 3.5s ease-in-out infinite" }}>{"✦"}</span><span style={{ position: "absolute", top: 110, right: 52, color: "#E8B84B", opacity: 0.6, fontSize: 9, animation: "twinkle 4.5s ease-in-out infinite" }}>{"✦"}</span></>}
          {authView === "welcome" && (
            <div className="fade-in" style={{ textAlign: "center", position: "relative" }}>
              <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 54, color: envA.dark ? "#FFF6EC" : "#4A2F45", marginBottom: 2 }}>True Reverie</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: envA.dark ? "rgba(255,246,236,0.72)" : "#A97FA0", marginBottom: 22 }}>Dream Her. Become Her.</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: envA.dark ? "rgba(255,246,236,0.85)" : "#5A4458", lineHeight: 1.5, marginBottom: 34 }}>One place to discover what you love, understand what you need, and build more of the life you actually want.</p>
              <button onClick={() => { setAuthView("signup"); setAuthMsg("") }} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 15, boxShadow: "0 10px 26px rgba(168,123,209,0.4)" }}>Create Account</button>
              <button onClick={() => { setAuthView("login"); setAuthMsg("") }} style={{ width: "100%", marginTop: 12, padding: 14, background: envA.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)", color: envA.dark ? "#FFF6EC" : "#4A2F45", border: `1px solid ${envA.dark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"}`, borderRadius: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Sign In</button>
            </div>
          )}
          {authView === "login" && (
            <div className="fade-in" style={{ position: "relative" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 600, color: envA.dark ? "#FFF6EC" : "#3D2545", marginBottom: 18, textAlign: "center" }}>Welcome back</div>
              <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMsg("") }} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", color: "#3D2545", borderRadius: 12, fontSize: 14, marginBottom: 12 }} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", color: "#3D2545", borderRadius: 12, fontSize: 14, marginBottom: 8 }} />
              <div onClick={handleForgot} style={{ fontSize: 12, color: envA.dark ? "rgba(255,246,236,0.7)" : "#8E6C88", textAlign: "right", marginBottom: 16, cursor: "pointer" }}>Forgot password?</div>
              {authMsg && <div style={{ fontSize: 13, color: envA.dark ? "#FFD9A0" : "#8E4A70", textAlign: "center", marginBottom: 14, lineHeight: 1.5 }}>{authMsg}</div>}
              <button onClick={handleLogin} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>Log In</button>
              <div onClick={() => { setAuthView("welcome"); setAuthMsg("") }} style={{ marginTop: 18, textAlign: "center", fontSize: 13, color: envA.dark ? "rgba(255,246,236,0.7)" : "#8E6C88", cursor: "pointer" }}>{"\u2190"} Back</div>
            </div>
          )}
          {authView === "signup" && (
            <div className="fade-in" style={{ position: "relative" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 600, color: envA.dark ? "#FFF6EC" : "#3D2545", marginBottom: 18, textAlign: "center" }}>Create your account</div>
              <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", color: "#3D2545", borderRadius: 12, fontSize: 14, marginBottom: 12 }} />
              <input type="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMsg("") }} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", color: "#3D2545", borderRadius: 12, fontSize: 14, marginBottom: 12 }} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", color: "#3D2545", borderRadius: 12, fontSize: 14, marginBottom: 12 }} />
              <input type="password" placeholder="Confirm password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={{ width: "100%", padding: 14, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.9)", color: "#3D2545", borderRadius: 12, fontSize: 14, marginBottom: 14 }} />
              {authMsg && <div style={{ fontSize: 13, color: envA.dark ? "#FFD9A0" : "#8E4A70", textAlign: "center", marginBottom: 12, lineHeight: 1.5 }}>{authMsg}</div>}
              <button onClick={() => {
                if (!firstName.trim()) { setAuthMsg("What should we call you? Add your first name."); return }
                if (password !== confirmPw) { setAuthMsg("Those passwords do not match yet."); return }
                try { localStorage.setItem("nr_name", firstName.trim()) } catch (e) {}
                handleSignUp()
              }} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 15 }}>Create Account</button>
              <button onClick={async () => { try { const { error } = await db.auth.signInWithOAuth({ provider: "google" }); if (error) setAuthMsg("Google sign-in is not configured yet.") } catch (e) { setAuthMsg("Google sign-in is not configured yet.") } }} style={{ width: "100%", marginTop: 10, padding: 14, background: "rgba(255,255,255,0.85)", color: "#3D2545", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Continue with Google</button>
              <div onClick={() => { setAuthView("welcome"); setAuthMsg("") }} style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: envA.dark ? "rgba(255,246,236,0.7)" : "#8E6C88", cursor: "pointer" }}>{"\u2190"} Back</div>
            </div>
          )}
        </div>
      </>
    )
  }

  if (user && !setupData) {
    const envS = ENV(new Date().getHours(), null)
    const steps = [
      { key: "goals", type: "q", q: "What would you love more of right now?", sub: "Choose up to 3.", opts: GOALS, max: 3 },
      { key: "interest_categories", type: "q", q: "What sounds like you?", sub: "Choose anything that fits.", opts: INTERESTS },
      { type: "final" },
    ]
    const st = steps[setupStep]
    const val = st.key ? draftSetup[st.key] : null
    const pick = (o) => {
      const next = val.includes(o) ? val.filter((x) => x !== o) : (st.max && val.length >= st.max ? val : [...val, o])
      setDraftSetup({ ...draftSetup, [st.key]: next })
    }
    const canNext = st.type === "q" ? val.length > 0 : true
    const finish = async () => {
      const data = { ...draftSetup, name: firstName }
      try {
        const { error } = await db.from("profiles").upsert({ id: user.id, email: user.email || null, setup: data, first_name: firstName, has_membership: false }, { onConflict: "id" })
        if (error) { setAuthMsg(error.message || "Could not save onboarding yet."); return }
        setSetupData(data)
        try { localStorage.setItem("nr_setup", JSON.stringify(data)); localStorage.setItem("nr_name", firstName) } catch (e) {}
      } catch (e) { setAuthMsg("Could not save onboarding yet. Please try again.") }
    }
    const advance = () => (setupStep < steps.length - 1 ? setSetupStep(setupStep + 1) : finish())
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: envS.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px" }}>
          <div className="fade-in" key={setupStep}>
            {st.type === "q" && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#C9558E", marginBottom: 8 }}>TELL US ABOUT YOU {"·"} {setupStep + 1} OF {steps.length}</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, color: envS.dark ? "#FFF6EC" : "#3D2545", marginBottom: st.sub ? 6 : 20, lineHeight: 1.25 }}>{st.q}</h2>
                {st.sub && <div style={{ fontSize: 13.5, color: envS.dark ? "rgba(255,246,236,0.75)" : "#8E6C88", fontStyle: "italic", marginBottom: 18 }}>{st.sub}</div>}
                {st.opts.map((o) => {
                  const on = val.includes(o)
                  return (
                    <div key={o} onClick={() => pick(o)} style={{ padding: "15px 17px", borderRadius: 14, marginBottom: 9, cursor: "pointer", background: on ? "linear-gradient(135deg,rgba(233,132,180,0.9),rgba(168,123,209,0.9))" : "rgba(255,255,255,0.75)", color: on ? "#FFFFFF" : "#4A3050", border: `1px solid ${on ? "transparent" : "rgba(255,255,255,0.9)"}`, fontSize: 14.5, fontWeight: 600 }}>{o}</div>
                  )
                })}
              </>
            )}
            {st.type === "final" && (
              <>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 28, color: envS.dark ? "#FFF6EC" : "#3D2545", lineHeight: 1.2, marginBottom: 18 }}>Your Reverie is ready.</h1>
                <p style={{ fontSize: 15, color: envS.dark ? "rgba(255,246,236,0.88)" : "#5A4458", lineHeight: 1.65, marginBottom: 8 }}>True Reverie will start with what you chose — then keep learning from what you save, try, love, and come back to.</p>
              </>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {setupStep > 0 && <button onClick={() => setSetupStep(setupStep - 1)} style={{ flex: 1, padding: 14, background: "rgba(255,255,255,0.6)", color: "#4A3050", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Back</button>}
              <button disabled={!canNext} onClick={advance} style={{ flex: 2, padding: 14, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: canNext ? 1 : 0.45 }}>
                {st.type === "final" ? "Enter True Reverie" : "Continue"}
              </button>
            </div>
            {st.type === "q" && <div onClick={finish} style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: envS.dark ? "rgba(255,246,236,0.6)" : "#8E6C88", cursor: "pointer" }}>Skip for now</div>}
          </div>
        </div>
      </>
    )
  }

  const themeKey = "none"
  const T = THEMES[themeKey]
  const cur = "yellow"
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const envRoot = ENV(new Date().getHours(), null)
  // A period "start" is a logged period day whose previous day has none.
  // Two consecutive starts make one completed cycle; the current, unfinished
  // cycle is deliberately excluded from the average.
  const periodStarts = (() => {
    const days = Object.keys(cycleLogs || {}).filter((d) => (cycleLogs[d] || {}).period).sort()
    const out = []
    days.forEach((d) => {
      const prev = new Date(d + "T00:00:00"); prev.setDate(prev.getDate() - 1)
      if (days.indexOf(prev.toISOString().slice(0, 10)) < 0) out.push(d)
    })
    return out
  })()

  const cycleAvg = (() => {
    if (periodStarts.length < 3) return null          // need 3 starts for 2 completed cycles
    const gaps = []
    for (let i = 1; i < periodStarts.length; i++) {
      const a = new Date(periodStarts[i - 1] + "T00:00:00"), b = new Date(periodStarts[i] + "T00:00:00")
      const g = Math.round((b - a) / 86400000)
      if (g >= 15 && g <= 60) gaps.push(g)             // ignore implausible gaps
    }
    if (gaps.length < 2) return null
    return { avg: Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length), cycles: gaps.length }
  })()

  // Predictions use the calculated average only when she has switched it on.
  const effCycleLength = useAvgCycle && cycleAvg ? String(cycleAvg.avg) : cycleLength

  const cycleNow = computeCycle(effCycleLength, lastPeriod)

  const Label = ({ children }) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, marginBottom: 10 }}>{children}</div>
  )

  const Chips = ({ items, selected, onToggle }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item) => {
        const on = selected.includes(item)
        return (
          <button key={item} onClick={() => onToggle(item)} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer", background: on ? THEMES[cur].accent : BASE.surface, color: on ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${on ? THEMES[cur].accent : BASE.border}`, fontWeight: on ? 700 : 500 }}>
            {item}
          </button>
        )
      })}
    </div>
  )

  const Stat = ({ label, value, accent }) => (
    <div style={{ padding: 16, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}` }}>
      <div style={{ fontSize: 11, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: accent }}>{value}</div>
    </div>
  )



  const setRebuildCurrent = (next) => setRebuildCurrentRaw((prev) => {
    const value = typeof next === "function" ? next(prev) : next
    try { localStorage.setItem("nr_rebuild_current", JSON.stringify(value)) } catch (e) {}
    return value
  })
  const setRebuildSaved = (next) => setRebuildSavedRaw((prev) => {
    const value = typeof next === "function" ? next(prev) : next
    try { localStorage.setItem("nr_rebuild_saved", JSON.stringify(value)) } catch (e) {}
    return value
  })

  const renderContent = () => {
    const ctx = { Chips, Label, Stat, supabaseBloomRows, supabaseMoveRows, supabaseNourishRows, supabaseCycleRows, supabaseRebuildRows, supabaseFeelBetterRows, supabaseRitualRows, supabaseRebuildExperiences, rebuildDynamicExpId, setRebuildDynamicExpId, rebuildProgressRows, getRebuildProgress, startRebuildProgress, completeRebuildExperience, T, baseline, bloomArticle, bloomCard, bloomPillar, bloomSearchOpen, bloomSection, bodyView, capDay, capMonth, capRange, checkedIn, closeBloom, ctxOpen, cur, cycArticle, cycLib, cycLogDate, cycleAvg, cycleLength, cycleLogs, cycleMonth, cycleNow, dateStr, detailProgram, doneFeed, contentInteractions, editCycle, editLife, eduPhase, effCycleLength, factors, bloomFeedLimit, feedMoodFilter, feedRotation, feedTimeFilter, firstName, flourishProject, flourishTime, forceTrainMenu, glowItem, glowOpen, glowSheet, glowTopic, greetingOn, greetingStyle, guidedIdx, handleLogout, history, isSavedBloom, lastPeriod, learnOpen, libLevel, libOpen, lifeMsg, likedFeed, mealFilter, mealType, moreView, moveCategory, moveMood, moveSearch, moveSurpriseIdx, moveTime, nourishView, nutrition, oneThing, openBloomCard, pct, periodDismissed, persistProgram, planView, programId, programStart, rebuildActiveProgram, rebuildCapPick, rebuildComingSoon, rebuildCurrent, rebuildFLYA, rebuildPlus, rebuildSaved, rebuildSection, rebuildStartWarning, rebuildView, recovery, recoveryDone, recoveryOpen, resetPage, resetSeed, resetSongs, restLeft, reviewMonth, reverieComposerOpen, reverieDraft, reverieEntries, reverieSearch, reverieSection, saveCycle, saveCycleLog, saveCycleSettings, saveNutrition, savedBloom, savedFilter, saving, seasonalBrowseOpen, seasonalSeason, selectedWoKey, setBloomArticle, setBloomPillar, setBloomSearchOpen, setBloomSection, setBodyView, setCapDay, setCapMonth, setCapRange, setCheckedIn, setCtxOpen, setCycArticle, setCycLib, setCycLogDate, setCycleLogs, setCycleMonth, setDetailProgram, setDoneFeed, setEditCycle, setEditLife, setEduPhase, setFactors, setBloomFeedLimit, setFeedMoodFilter, setFeedRotation, setFeedTimeFilter, setFirstName, setFlourishProject, setFlourishTime, setForceTrainMenu, setGlowItem, setGlowOpen, setGlowSheet, setGlowTopic, setGreetingOn, setGreetingStyle, setGuidedIdx, setLastPeriod, setLearnOpen, setLibLevel, setLibOpen, setLifeMsg, setLikedFeed, setMealFilter, setMealType, setMoreView, setMoveCategory, setMoveMood, setMoveSearch, setMoveSurpriseIdx, setMoveTime, setNourishView, setOneThing, setPct, setPeriodDismissed, setPlanView, setRebuildActiveProgram, setRebuildCapPick, setRebuildComingSoon, setRebuildCurrent, setRebuildSaved, setRebuildSection, setRebuildStartWarning, setRebuildView, setReverieComposerOpen, setReverieDraft, setReverieEntries, setReverieSearch, setReverieSection, setRecoveryDone, setRecoveryOpen, setResetPage, setResetSongs, setRestLeft, setReviewMonth, setSavedFilter, setSeasonalBrowseOpen, setSeasonalSeason, setSelectedWoKey, setSetupData, setSuppOpen, setSupports, setTab, setTmpLen, setTmpStart, setTrainView, setUseAvgCycle, setWhyOpen, setWoColor, setWoDone, setWoEnv, setWoKey, setWoLogged, setWoMode, setWoOpen, setWoTier, setWoType, setupData, suppOpen, supports, surpriseReset, tab, tmpLen, tmpStart, toggle, toggleSaveBloom, toggleDidThis, hasInteraction, trainView, updateRebuildFLYA, useAvgCycle, user, whyOpen, woColor, woDone, woEnv, woKey, woLog, woLogged, woMode, woOpen, woTier, woType }
    return renderTrain(ctx) || renderCycle(ctx) || renderNourish(ctx) || renderBloom(ctx) || renderReverie(ctx) || renderCommunity(ctx) || renderMore(ctx) || renderRebuild(ctx) || null
  }

  return (
    <><Fonts /><GlobalStyle />
      <div style={{ "--accent": T.accent, background: tab === "today" ? envRoot.bg : (tab === "body" && bodyView === "nourish" ? NOURISH_BG(envRoot.mode) : (tab === "bloom" ? BLOOM_BG("afternoon") : (tab === "body" && bodyView === "cycle" ? CYCLE_BG(cycleNow && cycleNow.phase) : (tab === "reverie" ? "linear-gradient(180deg,#FFF9F7 0%,#FBF1F5 100%)" : (tab === "community" ? "linear-gradient(180deg,#FFF9F7 0%,#F5EEF8 100%)" : BASE.bg))))), transition: "background 0.8s ease", minHeight: "100vh", maxWidth: 440, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        {tab === "today" && <Sky mode={envRoot.mode} tint={envRoot.tint} />}
        {tab === "today" && <Garden mode={envRoot.mode} />}
        {tab === "body" && bodyView === "nourish" && <NourishAir mode={envRoot.mode} tint={envRoot.tint} />}
        {tab === "body" && bodyView === "nourish" && <HerbGarden mode={envRoot.mode} subtle={!!planView || nourishView === "supps"} />}
        {tab === "bloom" && <BloomAir mode="afternoon" tint={null} />}
        {tab === "bloom" && !bloomCard && !bloomArticle && !bloomPillar && <BloomAccents mode="afternoon" />}
        {tab === "bloom" && <BloomScene mode="afternoon" subtle={!!bloomCard || !!bloomArticle || !!bloomPillar || !!glowTopic} />}
        {tab === "body" && bodyView === "cycle" && <CycleAir phase={cycleNow && cycleNow.phase} />}
        <div style={{ position: "relative", paddingTop: 14 }}>
          {tab === "body" && (
            <div style={{ display: "flex", gap: 8, padding: "6px 18px 0" }}>
              {[["gym", "Move", "\ud83d\udcaa"], ["nourish", "Nourish", "\ud83c\udf7d\ufe0f"], ["cycle", "Cycle", "\ud83c\udf19"]].map(([k, lbl, ic]) => {
                const active = bodyView === k
                return (
                  <button key={k} onClick={() => setBodyView(k)} style={{ flex: 1, padding: "10px 4px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 700, background: active ? T.accent : BASE.surface, color: active ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${active ? T.accent : BASE.border}` }}><span style={{ fontSize: 16, display: "block", marginBottom: 2 }}>{ic}</span>{lbl}</button>
                )
              })}
            </div>
          )}
          {renderContent()}
          <div style={{ height: 104 }} />
        </div>
        <div onClick={() => { setMoreView("menu"); setTab("more") }} style={{ position: "fixed", top: 16, right: 18, zIndex: 70, width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(60,35,70,0.12)" }}>
          <span style={{ fontSize: 15, color: BASE.creamDim, lineHeight: 1 }}>{"\u2630"}</span>
        </div>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60 }}>
          <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", background: tab === "today" && envRoot.dark ? "rgba(40,28,64,0.92)" : "rgba(255,255,255,0.93)", borderTop: `1px solid ${tab === "today" && envRoot.dark ? "rgba(255,255,255,0.12)" : BASE.border}`, padding: "8px 6px 14px", boxShadow: "0 -6px 24px rgba(60,35,70,0.10)" }}>
            {[["bloom", "Bloom", "\ud83c\udf38"], ["body", "Body", "\ud83d\udcaa"], ["rebuild", "Rebuild", "\ud83c\udf31"], ["reverie", "My Reverie", "\u2661"], ["community", "Community", "✨"]].map(([k, lbl, ic]) => {
              const active = tab === k
              const darkbar = tab === "today" && envRoot.dark
              return (
                <button key={k} onClick={() => {
                  if (k === "bloom" && tab === "bloom") {
                    setBloomCard(null); setBloomArticle(null); setBloomPillar(null); setBloomSearchOpen(false);
                    setFeedMoodFilter(null); setFeedTimeFilter(null); setBloomFeedLimit(12); setFeedRotation((n) => n + 1);
                    if (typeof window !== "undefined") window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    return;
                  }
                  setBloomCard(null);
                  if (k === "reverie") { setReverieSection("home"); setReverieSearch("") }
                  if (k === "body") { setBodyView("gym"); setTab("body") } else { setTab(k) }
                }} style={{ flex: 1, padding: "6px 2px", background: "transparent", border: "none", cursor: "pointer", opacity: active ? 1 : 0.55 }}>
                  <span style={{ fontSize: k === "community" ? 23 : 19, display: "block", marginBottom: 2, filter: k === "community" ? "none" : (active ? "none" : "grayscale(35%)") }}>{ic}</span>
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: darkbar ? "#F5E9F2" : (active ? "#C9558E" : BASE.taupe) }}>{lbl}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

