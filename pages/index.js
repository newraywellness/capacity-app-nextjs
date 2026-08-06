import { useState, useEffect, useMemo, useRef } from 'react'
import Head from 'next/head'
import { CYCLEPREF, EQUIP, HOPES, LEVELS, QUOTES, SEASONS, SHARE_LEVELS } from '../data/checkin'
import { PHASE_ORDER, computeCycle } from '../data/cycle'
import { STARTER_FOODS, gramsFor, mealAsFood, r1 } from '../data/nourish'
import { WO_TYPES } from '../data/train'
import { db } from '../lib/supabase'
import { BASE, ENV, THEMES, colorFromPct, dayIndex } from '../lib/theme'
import { Sky, Garden } from '../lib/atmosphere'
import { NourishAir, HerbGarden, NOURISH_BG } from '../lib/herbs'
import { BloomAir, BloomAccents, BloomScene, BLOOM_BG } from '../lib/bloomair'
import { CycleAir, CYCLE_BG } from '../lib/cycleair'
import { renderHome } from '../views/home'
import { renderTrain } from '../views/train'
import { renderCycle } from '../views/cycle'
import { renderNourish } from '../views/nourish'
import { renderBloom } from '../views/bloom'
import { renderProgress } from '../views/progress'
import { renderMore } from '../views/more'

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [tab, setTab] = useState("today")
  const [pct, setPct] = useState(50)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
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
  // auth UX: guest preview, password recovery, status messages
  const [guest, setGuest] = useState(false)
  const [authView, setAuthView] = useState("welcome")
  const [firstName, setFirstName] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [setupData, setSetupData] = useState(null)
  const [setupStep, setSetupStep] = useState(0)
  const [introStep, setIntroStep] = useState(0)
  const [draftSetup, setDraftSetup] = useState({ season: "", hopes: [], level: "", equip: "", cyclePref: "" })
  const [recovery, setRecovery] = useState(false)
  const [authMsg, setAuthMsg] = useState("")
  const [newPass, setNewPass] = useState("")
  // share-with-partner (couples capacity check-in)
  const [shareLevel, setShareLevel] = useState("yellow")
  const [shareTrue, setShareTrue] = useState([])
  const [shareNeed, setShareNeed] = useState([])
  const [shareContext, setShareContext] = useState("")
  const [shareStatus, setShareStatus] = useState("")

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
  const [progressView, setProgressView] = useState("trends")
  const [capRange, setCapRange] = useState("month")
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
  const [foodDays, setFoodDays] = useState({})
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [savedFoods, setSavedFoods] = useState([])
  const [myFoods, setMyFoods] = useState([])
  const [saveFoodName, setSaveFoodName] = useState("")
  const [myMeals, setMyMeals] = useState([])
  const [recentFoods, setRecentFoods] = useState([])
  const [addFoodFor, setAddFoodFor] = useState(null)
  const [addTab, setAddTab] = useState("search")
  const [foodQuery, setFoodQuery] = useState("")
  const [foodPick, setFoodPick] = useState(null)
  const [entryEdit, setEntryEdit] = useState(null)
  const [quickAdd, setQuickAdd] = useState({ name: "", cal: "", p: "", c: "", f: "" })
  const [saveMealName, setSaveMealName] = useState("")
  const [mealEdit, setMealEdit] = useState(null)
  const [calcInputs, setCalcInputs] = useState(null)
  const [calcResult, setCalcResult] = useState(null)
  const [mealType, setMealType] = useState("breakfast")
  const [mealFilter, setMealFilter] = useState(null)
  const [mealOpen, setMealOpen] = useState(null)
  const [weekPlan, setWeekPlan] = useState({})
  const [groceryChecked, setGroceryChecked] = useState({})
  const [groceryManual, setGroceryManual] = useState([])
  const [groceryAdd, setGroceryAdd] = useState("")
  const [learnOpen, setLearnOpen] = useState(null)
  const [macrosOpen, setMacrosOpen] = useState(false)
  const [quickFilter, setQuickFilter] = useState(null)
  const [weekPick, setWeekPick] = useState(null)
  const [pulse, setPulse] = useState(null)
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
  const [cycLogDate, setCycLogDate] = useState(new Date().toISOString().slice(0, 10))
  const [cycleMonth, setCycleMonth] = useState(0)
  const [eduPhase, setEduPhase] = useState(null)
  const [woEnv, setWoEnv] = useState("gym")
  const [recoveryOpen, setRecoveryOpen] = useState(null)
  const [recoveryDone, setRecoveryDone] = useState(false)
  const [woMode, setWoMode] = useState("overview")
  const [guidedIdx, setGuidedIdx] = useState(0)
  const [restLeft, setRestLeft] = useState(0)
  const [lifeMsg, setLifeMsg] = useState("")

  useEffect(() => {
    try { setWoLog(JSON.parse(localStorage.getItem("nr_workout_log") || "[]")) } catch (e) {}
    try { const n = localStorage.getItem("nr_nutrition"); if (n) setNutrition(JSON.parse(n)) } catch (e) {}
    try { const sb = localStorage.getItem("nr_bloom_saved"); if (sb) setSavedBloom(JSON.parse(sb)) } catch (e) {}
    try { const cl = localStorage.getItem("nr_cycle_logs"); if (cl) setCycleLogs(JSON.parse(cl)) } catch (e) {}
    try { setUseAvgCycleRaw(localStorage.getItem("nr_use_avg_cycle") === "1") } catch (e) {}
    try { const wk = localStorage.getItem("nr_week_plan"); if (wk) setWeekPlan(JSON.parse(wk)) } catch (e) {}
    try { const gm = localStorage.getItem("nr_grocery_manual"); if (gm) setGroceryManual(JSON.parse(gm)) } catch (e) {}
    try { const gc = localStorage.getItem("nr_grocery_checked"); if (gc) setGroceryChecked(JSON.parse(gc)) } catch (e) {}
    try { const fd = localStorage.getItem("nr_food_days"); if (fd) setFoodDays(JSON.parse(fd)) } catch (e) {}
    try { const sf = localStorage.getItem("nr_saved_foods"); if (sf) setSavedFoods(JSON.parse(sf)) } catch (e) {}
    try { const mf = localStorage.getItem("nr_my_foods"); if (mf) setMyFoods(JSON.parse(mf)) } catch (e) {}
    try { const mm = localStorage.getItem("nr_my_meals"); if (mm) setMyMeals(JSON.parse(mm)) } catch (e) {}
    try { const mf = localStorage.getItem("nr_my_foods"); if (mf) setMyFoods(JSON.parse(mf)) } catch (e) {}
    try { const rf = localStorage.getItem("nr_recent_foods"); if (rf) setRecentFoods(JSON.parse(rf)) } catch (e) {}
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
    try { const n = localStorage.getItem("nr_name"); if (n) setFirstName(n) } catch (e) {}
    try { const st = localStorage.getItem("nr_setup"); if (st) setSetupData(JSON.parse(st)) } catch (e) {}
  }, [])

  useEffect(() => { checkAuth() }, [])

  useEffect(() => {
    // Clear any manual workout selection when the program changes (selection is per-program, per-session).
    setSelectedWoKey(null)
    setForceTrainMenu(false)
    setWoTier(null)
  }, [programId])

  useEffect(() => {
    // Lock background scroll only for the cycle editor modal (a true overlay).
    if (typeof document === "undefined") return
    if (editCycle) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = prev }
    }
  }, [editCycle])

  useEffect(() => {
    // Instant capacity restore from local cache (only if it's still today), before Supabase responds.
    try {
      const raw = localStorage.getItem("nr_today_cap")
      if (raw) {
        const cached = JSON.parse(raw)
        const today = new Date().toISOString().slice(0, 10)
        if (cached && cached.date === today && typeof cached.pct === "number") {
          setPct(cached.pct)
          setCheckedIn(true)
        }
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (restLeft <= 0) return
    const t = setTimeout(() => setRestLeft((n) => n - 1), 1000)
    return () => clearTimeout(t)
  }, [restLeft])

  useEffect(() => {
    const { data: sub } = db.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true)
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
        if (p.data) {
          setProfile(p.data)
          if (p.data.setup) {
            const sd = p.data.setup
            setSetupData(sd)
            if (sd.name) { setFirstName(sd.name); try { localStorage.setItem("nr_name", sd.name) } catch (e) {} }
            if (sd.nutrition) { setNutrition(sd.nutrition); try { localStorage.setItem("nr_nutrition", JSON.stringify(sd.nutrition)) } catch (e) {} }
            if (Array.isArray(sd.savedBloom)) { setSavedBloom(sd.savedBloom); try { localStorage.setItem("nr_bloom_saved", JSON.stringify(sd.savedBloom)) } catch (e) {} }
            if (sd.cycleLogs && typeof sd.cycleLogs === "object") { setCycleLogs(sd.cycleLogs); try { localStorage.setItem("nr_cycle_logs", JSON.stringify(sd.cycleLogs)) } catch (e) {} }
            if (typeof sd.useAvgCycle === "boolean") { setUseAvgCycleRaw(sd.useAvgCycle); try { localStorage.setItem("nr_use_avg_cycle", sd.useAvgCycle ? "1" : "0") } catch (e) {} }
            try { localStorage.setItem("nr_setup", JSON.stringify(sd)) } catch (e) {}
          } else if (p.data.first_name) {
            setFirstName(p.data.first_name)
          }
          // Cross-device program restore (profile wins over local if present)
          if (p.data.program) {
            setProgramId(p.data.program)
            if (p.data.program_start) setProgramStart(p.data.program_start)
            try { localStorage.setItem("nr_program", p.data.program); if (p.data.program_start) localStorage.setItem("nr_program_start", p.data.program_start) } catch (e) {}
          }
        }
        await loadHistory(u.id)
        await loadWorkouts(u.id)
      }
    } catch (err) { console.log(err) }
    setLoading(false)
  }

  const loadHistory = async (uid) => {
    const { data } = await db.from("checkins").select("*").eq("user_id", uid).order("date", { ascending: true })
    const rows = data || []
    setHistory(rows.map((d) => ({
      date: new Date(d.date + "T00:00:00"),
      dateISO: d.date,
      pct: d.pct,
      color: d.color,
      factors: Array.isArray(d.factors) ? d.factors : [],
      supports: Array.isArray(d.supports) ? d.supports : [],
      note: d.one_thing || "",
    })))
    const today = new Date().toISOString().slice(0, 10)
    const todayRow = rows.find((d) => d.date === today)
    if (todayRow) {
      setCheckedIn(true)
      setPct(todayRow.pct)
      if (Array.isArray(todayRow.factors)) setFactors(todayRow.factors)
      if (Array.isArray(todayRow.supports)) setSupports(todayRow.supports)
      if (todayRow.one_thing) setOneThing(todayRow.one_thing)
      try { localStorage.setItem("nr_today_cap", JSON.stringify({ date: today, pct: todayRow.pct })) } catch (e) {}
    }
  }

  const loadWorkouts = async (uid) => {
    try {
      const { data } = await db.from("workouts").select("*").eq("user_id", uid).order("date", { ascending: true })
      if (!data) return
      const remote = data.map((w) => ({ date: w.date, type: w.workout_type, color: w.color, program: w.program, sets: w.sets_done }))
      // Merge: remote is source of truth per date; keep any local-only dates too.
      let local = []
      try { local = JSON.parse(localStorage.getItem("nr_workout_log") || "[]") } catch (e) {}
      const byDate = {}
      local.forEach((w) => { byDate[w.date] = w })
      remote.forEach((w) => { byDate[w.date] = w })
      const merged = Object.values(byDate).sort((a, b) => (a.date < b.date ? -1 : 1))
      setWoLog(merged)
      try { localStorage.setItem("nr_workout_log", JSON.stringify(merged)) } catch (e) {}
    } catch (e) {}
  }

  const handleLogin = async () => {
    try {
      const res = await db.auth.signInWithPassword({ email, password })
      if (res.error) { setAuthMsg(res.error.message || "Login failed — check your email and password."); return }
      if (res.data.user) {
        setUser(res.data.user)
        const p = await db.from("profiles").select("*").eq("id", res.data.user.id).single()
        if (p.data) setProfile(p.data)
        await loadHistory(res.data.user.id)
        await loadWorkouts(res.data.user.id)
        setEmail(""); setPassword(""); setAuthMsg("")
      }
    } catch (err) { setAuthMsg("Login failed — please try again.") }
  }

  const handleSignUp = async () => {
    try {
      const res = await db.auth.signUp({ email, password })
      if (res.error) { setAuthMsg(res.error.message || "Sign up failed — please try again."); return }
      if (res.data.user) {
        await db.from("profiles").insert([{ id: res.data.user.id, email, has_membership: false }])
        setUser(res.data.user); setEmail(""); setPassword(""); setAuthMsg("")
      }
    } catch (err) { setAuthMsg("Sign up failed — please try again.") }
  }

  const handleLogout = async () => {
    await db.auth.signOut()
    setUser(null); setProfile(null); setCheckedIn(false); setHistory([])
    setNutrition(null); setSavedBloom([]); setCycleLogs({}); setUseAvgCycleRaw(false); setBloomPillar(null); setBloomArticle(null); setGlowTopic(null); setGlowSheet(null); setGlowOpen(["guides", "wins"]); setGlowItem(null); setFoodDays({}); setSavedFoods([]); setMyFoods([]); setMyMeals([]); setRecentFoods([]); setWeekPlan({}); setGroceryManual([]); setGroceryChecked({}); setPlanView(null); setNourishView("today")
    setPct(50); setFactors([]); setSupports([]); setOneThing("")
    setProgramId(null); setWoLog([]); setSetupData(null); setFirstName("")
    setCycleLength(""); setLastPeriod(""); setPeriodDismissed(false)
    setTab("today"); setBodyView("gym")
    try {
      ["nr_today_cap", "nr_program", "nr_program_start", "nr_workout_log", "nr_name", "nr_setup", "cap_cycle_length", "cap_last_period", "nr_bloom_notes", "nr_nutrition", "nr_bloom_saved", "nr_cycle_logs", "nr_use_avg_cycle", "nr_food_days", "nr_saved_foods", "nr_my_foods", "nr_my_meals", "nr_my_foods", "nr_recent_foods", "nr_week_plan", "nr_grocery_manual", "nr_grocery_checked"].forEach((k) => localStorage.removeItem(k))
    } catch (e) {}
  }

  const handleForgot = async () => {
    if (!email) { setAuthMsg("Enter your email above first, then tap reset."); return }
    setAuthMsg("")
    try {
      await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
      setAuthMsg("Check your email for a link to reset your password.")
    } catch (err) { setAuthMsg("Couldn't send the reset email — double-check the address.") }
  }

  const handleSetNewPassword = async () => {
    if (newPass.length < 6) { setAuthMsg("Password must be at least 6 characters."); return }
    try {
      const { error } = await db.auth.updateUser({ password: newPass })
      if (error) { setAuthMsg(error.message); return }
      setRecovery(false); setNewPass(""); setAuthMsg("")
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
    try { if (user) db.from("profiles").update({ setup: { ...(setupData || {}), cycleLogs: next } }).eq("id", user.id).then(() => {}) } catch (e) {}
  }

  const isSavedBloom = (id) => savedBloom.indexOf(id) >= 0
  const toggleSaveBloom = (id) => {
    const wasSaved = isSavedBloom(id)
    const next = wasSaved ? savedBloom.filter((x) => x !== id) : [...savedBloom, id]
    setSavedBloom(next)
    try { localStorage.setItem("nr_bloom_saved", JSON.stringify(next)) } catch (e) {}
    try { if (user) db.from("profiles").update({ setup: { ...(setupData || {}), savedBloom: next } }).eq("id", user.id).then(() => {}) } catch (e) {}
    // Anonymous aggregate count — fires ONLY on the unsaved -> saved transition.
    // Not on unsave, not on reload, not on cross-device sync: those paths never
    // reach here, they only ever call setSavedBloom directly. Signed-in only,
    // because EXECUTE is granted to authenticated alone.
    if (!wasSaved && user) {
      try { db.rpc("bump_bloom_save", { item: id }).then(() => {}, () => {}) } catch (e) {}
    }
  }

  const saveNutrition = (n) => {
    setNutrition(n)
    try { localStorage.setItem("nr_nutrition", JSON.stringify(n)) } catch (e) {}
    try { if (user) db.from("profiles").update({ setup: { ...(setupData || {}), nutrition: n } }).eq("id", user.id).then(() => {}) } catch (e) {}
  }
  // ---- Food log: persistent, per-date, per-meal ----
  const persistDays = (days) => { setFoodDays(days); try { localStorage.setItem("nr_food_days", JSON.stringify(days)) } catch (e) {} }
  const dayFor = (d) => foodDays[d] || { items: [], water: 0 }
  const setDay = (d, patch) => persistDays({ ...foodDays, [d]: { ...dayFor(d), ...patch } })
  const addEntries = (entries, d) => {
    const date = d || logDate
    const cur = dayFor(date)
    setDay(date, { items: [...cur.items, ...entries] })
  }
  const updateEntry = (id, patch, d) => {
    const date = d || logDate
    const cur = dayFor(date)
    setDay(date, { items: cur.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) })
  }
  const deleteEntry = (id, d) => {
    const date = d || logDate
    const cur = dayFor(date)
    setDay(date, { items: cur.items.filter((x) => x.id !== id) })
  }
  const setWaterCount = (n) => { const v = Math.max(0, n); setDay(logDate, { water: v }) }
  const newId = () => Date.now() + Math.floor(Math.random() * 1000)
  // Build a log entry from a food + quantity/unit (real serving math), or from fixed nutrition.
  // Nutrition for exactly 1 unit of a food, unrounded (rounding only happens on displayed totals).
  const perUnitOf = (food, unit) => {
    if (!food) return null
    if (food.fixed) return { cal: food.fixed.cal, p: food.fixed.p, c: food.fixed.c, f: food.fixed.f }
    const g = gramsFor(food, 1, unit)
    if (g == null || !food.per100) return null
    const k = g / 100
    return { cal: food.per100.cal * k, p: food.per100.p * k, c: food.per100.c * k, f: food.per100.f * k }
  }
  // A logged entry always stores `per` (per 1 unit). Daily totals = per x qty, so quantity
  // changes stay consistent whether nutrition came from the database or the user corrected it.
  const entryPer = (e) => {
    if (e.per) return e.per
    const q = Number(e.qty) || 1
    return { cal: (e.cal || 0) / q, p: (e.p || 0) / q, c: (e.c || 0) / q, f: (e.f || 0) / q }
  }
  const totalsFrom = (per, qty) => ({ cal: Math.round(per.cal * qty), p: r1(per.p * qty), c: r1(per.c * qty), f: r1(per.f * qty) })
  const makeEntry = (food, qty, unit, meal) => {
    const q = Number(qty) || 0
    const per = perUnitOf(food, unit)
    if (!per) return null
    return { id: newId(), meal, name: food.name, foodId: food.id, qty: q, unit, per, ...totalsFrom(per, q), partial: !!food.partial }
  }
  const saveMyFoods = (arr) => { setMyFoods(arr); try { localStorage.setItem("nr_my_foods", JSON.stringify(arr)) } catch (e) {} }
  // Look up a source food across the starter set and the user's own corrected foods.
  const findFood = (id) => myFoods.find((x) => x.id === id) || STARTER_FOODS.find((x) => x.id === id) || null
  const rememberRecent = (food, qty, unit) => {
    const key = food.id + "|" + unit
    const next = [{ food, qty, unit, key }, ...recentFoods.filter((r) => r.key !== key)].slice(0, 20)
    setRecentFoods(next); try { localStorage.setItem("nr_recent_foods", JSON.stringify(next)) } catch (e) {}
  }
  const toggleFavorite = (food) => {
    const on = savedFoods.some((x) => x.id === food.id)
    const next = on ? savedFoods.filter((x) => x.id !== food.id) : [...savedFoods, food]
    setSavedFoods(next); try { localStorage.setItem("nr_saved_foods", JSON.stringify(next)) } catch (e) {}
  }
  const saveMyMeals = (arr) => { setMyMeals(arr); try { localStorage.setItem("nr_my_meals", JSON.stringify(arr)) } catch (e) {} }
  // Log a True Reverie recipe meal straight into a meal slot
  const logMeal = (m, slot) => { const e = makeEntry(mealAsFood(m), 1, "serving", slot || "snack"); if (e) addEntries([e]) }
  const saveWeekPlan = (wp) => { setWeekPlan(wp); try { localStorage.setItem("nr_week_plan", JSON.stringify(wp)) } catch (e) {} }
  const saveGroceryManual = (arr) => { setGroceryManual(arr); try { localStorage.setItem("nr_grocery_manual", JSON.stringify(arr)) } catch (e) {} }
  const saveGroceryChecked = (obj) => { setGroceryChecked(obj); try { localStorage.setItem("nr_grocery_checked", JSON.stringify(obj)) } catch (e) {} }

  const persistProgram = (pid) => {
    const iso = new Date().toISOString().slice(0, 10)
    if (pid) {
      setProgramId(pid); setProgramStart(iso)
      try { localStorage.setItem("nr_program", pid); localStorage.setItem("nr_program_start", iso) } catch (e) {}
      if (user && db) { try { db.from("profiles").update({ program: pid, program_start: iso }).eq("id", user.id).then(() => {}) } catch (e) {} }
    } else {
      setProgramId(null)
      try { localStorage.removeItem("nr_program"); localStorage.removeItem("nr_program_start") } catch (e) {}
      if (user && db) { try { db.from("profiles").update({ program: null, program_start: null }).eq("id", user.id).then(() => {}) } catch (e) {} }
    }
  }

  const saveCheckin = async () => {
    setSaving(true); setSaveErr("")
    const color = colorFromPct(pct)
    const today = new Date().toISOString().slice(0, 10)
    const { error } = await db.from("checkins").upsert(
      { user_id: user.id, date: today, pct, color, factors, supports, one_thing: oneThing },
      { onConflict: "user_id,date" }
    )
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    setCheckedIn(true)
    try { localStorage.setItem("nr_today_cap", JSON.stringify({ date: today, pct })) } catch (e) {}
    await loadHistory(user.id)
  }

  // Persists cycle setup without leaving the screen. Cycle Settings now sit
  // inline above tracking, so saving them must not navigate away.
  const setUseAvgCycle = (v) => {
    setUseAvgCycleRaw(v)
    try { localStorage.setItem("nr_use_avg_cycle", v ? "1" : "0") } catch (e) {}
    try { if (user) db.from("profiles").update({ setup: { ...(setupData || {}), useAvgCycle: v } }).eq("id", user.id).then(() => {}) } catch (e) {}
  }

  const saveCycleSettings = (start, len) => {
    const L = String(Math.max(20, Math.min(45, parseInt(len) || 28)))
    setCycleLength(L)
    if (start) setLastPeriod(start)
    try {
      window.localStorage.setItem("cap_cycle_length", L)
      if (start) window.localStorage.setItem("cap_last_period", start)
    } catch (e) {}
    if (user && db) { try { db.from("profiles").update({ setup: { ...(setupData || {}), cycleLength: L, lastPeriod: start || lastPeriod } }).eq("id", user.id).then(() => {}) } catch (e) {} }
  }

  const saveCycle = () => {
    const L = String(Math.max(20, Math.min(45, parseInt(tmpLen) || 28)))
    setCycleLength(L)
    setLastPeriod(tmpStart)
    try {
      window.localStorage.setItem("cap_cycle_length", L)
      window.localStorage.setItem("cap_last_period", tmpStart)
    } catch (e) {}
    if (user && db) { try { db.from("profiles").update({ setup: { ...(setupData || {}), cycleLength: L, lastPeriod: tmpStart } }).eq("id", user.id).then(() => {}) } catch (e) {} }
    setEditCycle(false)
  }

  const buildShareMessage = () => {
    const L = SHARE_LEVELS[shareLevel]
    const lines = [`My capacity today: ${L.emoji} ${L.label}`]
    if (shareTrue.length) lines.push(`What's true for me: ${shareTrue.join(", ")}`)
    if (shareNeed.length) lines.push(`What I need: ${shareNeed.join(", ")}`)
    if (shareContext.trim()) lines.push(shareContext.trim())
    lines.push("— shared via True Reverie · The Capacity Method")
    return lines.join("\n")
  }

  const flashStatus = (msg) => { setShareStatus(msg); setTimeout(() => setShareStatus(""), 2500) }

  const handleShare = async () => {
    const msg = buildShareMessage()
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text: msg })
        flashStatus("Shared")
        return
      }
    } catch (e) { /* user canceled or unsupported — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(msg)
      flashStatus("Copied — paste it to your partner")
    } catch (e) { flashStatus("Copy the message below to share") }
  }

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(buildShareMessage())
      flashStatus("Copied to clipboard")
    } catch (e) { flashStatus("Select the message below to copy") }
  }

  const Fonts = () => (
    <Head>
      <title>The Capacity Method · True Reverie</title>
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
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #FFFFFF; cursor: pointer; border: 3px solid var(--accent, #D08560); }
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

  if (!user && !guest) {
    const envA = ENV(new Date().getHours(), null)
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: envA.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 70, left: "50%", marginLeft: -55, width: 110, height: 110, borderRadius: "50%", background: envA.dark ? "radial-gradient(circle,#F5E6C4 30%,rgba(245,230,196,0.35) 60%,rgba(245,230,196,0) 78%)" : "radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)" }} />
          {envA.dark && <><span style={{ position: "absolute", top: 46, left: 60, color: "#E8B84B", opacity: 0.7, fontSize: 11, animation: "twinkle 3.5s ease-in-out infinite" }}>{"✦"}</span><span style={{ position: "absolute", top: 110, right: 52, color: "#E8B84B", opacity: 0.6, fontSize: 9, animation: "twinkle 4.5s ease-in-out infinite" }}>{"✦"}</span></>}
          {authView === "welcome" && (
            <div className="fade-in" style={{ textAlign: "center", position: "relative" }}>
              <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 54, color: envA.dark ? "#FFF6EC" : "#4A2F45", marginBottom: 2 }}>True Reverie</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: envA.dark ? "rgba(255,246,236,0.72)" : "#A97FA0", marginBottom: 4 }}>Dream her. Become Her.</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, color: envA.dark ? "#FFF6EC" : "#3D2545", margin: "18px 0 8px", lineHeight: 1.25 }}>A wellness app that adapts to your real life.</h1>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: envA.dark ? "rgba(255,246,236,0.8)" : "#8E6C88", marginBottom: 34 }}>Less thinking. More living.</p>
              <button onClick={() => { setAuthView("signup"); setAuthMsg("") }} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 15, boxShadow: "0 10px 26px rgba(168,123,209,0.4)" }}>Get Started</button>
              <button onClick={() => { setAuthView("login"); setAuthMsg("") }} style={{ width: "100%", marginTop: 12, padding: 14, background: envA.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)", color: envA.dark ? "#FFF6EC" : "#4A2F45", border: `1px solid ${envA.dark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"}`, borderRadius: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Already have an account? Log In</button>
              <div onClick={() => { setGuest(true); setAuthMsg("") }} style={{ marginTop: 22, fontSize: 13, fontWeight: 600, color: envA.dark ? "#F0C879" : "#C9558E", cursor: "pointer" }}>Try a Preview {"→"}</div>
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

  if (!user && guest) {
    const gcur = colorFromPct(pct)
    const GT = THEMES[gcur]
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ "--accent": GT.accent, background: BASE.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", padding: "0 22px 40px" }}>
          <header style={{ padding: "26px 0 6px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 40, color: BASE.cream }}>True Reverie</div>
            <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: BASE.taupe, marginTop: 6 }}>The Capacity Method</div>
          </header>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 24, textAlign: "center", margin: "24px 0 4px" }}>How's your capacity today?</h2>
          <div style={{ textAlign: "center", margin: "10px 0 4px" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 64, fontWeight: 600, color: GT.accent }}>{pct}</span>
            <span style={{ fontSize: 22, color: BASE.taupe }}>%</span>
          </div>
          <input type="range" min="0" max="100" step="5" value={pct} onChange={(e) => setPct(+e.target.value)} style={{ width: "100%", margin: "8px 0 14px", background: `linear-gradient(90deg, ${GT.accent} ${pct}%, ${BASE.surface2} ${pct}%)` }} />
          <div style={{ textAlign: "center", fontSize: 14, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1, marginBottom: 22 }}>{gcur === "red" ? "Red Day — Restoration Mode" : gcur === "yellow" ? "Yellow Day — Steady Pace" : "Green Day — Full Capacity"}</div>
          <div style={{ padding: 20, borderRadius: 16, background: GT.tint, border: `1px solid rgba(${GT.glow},0.3)`, textAlign: "center", marginBottom: 24 }}>
            <p style={{ fontFamily: "'Sacramento', cursive", fontSize: 26, lineHeight: 1.35, color: GT.accent }}>{"\u201C"}{QUOTES[gcur]}{"\u201D"}</p>
            <p style={{ fontSize: 11, color: BASE.taupe, marginTop: 8, letterSpacing: 1 }}>— VANESSA, RN</p>
          </div>
          <p style={{ fontSize: 14, color: BASE.creamDim, textAlign: "center", lineHeight: 1.6, marginBottom: 18 }}>This is your daily check-in. Create a free account to save your days, see your trends, and unlock your cycle insights.</p>
          <button onClick={() => { setGuest(false); setAuthMsg("") }} style={{ width: "100%", padding: 16, background: GT.accent, color: "#FFFFFF", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Create my free account</button>
          <button onClick={() => setGuest(false)} style={{ width: "100%", padding: 12, background: "transparent", color: BASE.taupe, border: `1px solid ${BASE.border}`, borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Back</button>
        </div>
      </>
    )
  }

  if (user && !setupData && introStep < 2) {
    const envS = ENV(new Date().getHours(), null)
    if (introStep === 0) {
      return (
        <><Fonts /><GlobalStyle />
          <div style={{ background: envS.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -20, fontSize: 130, opacity: 0.08 }}>🌸</div>
            <div style={{ position: "absolute", bottom: 40, left: -24, fontSize: 90, opacity: 0.07 }}>🌷</div>
            <div className="fade-in" style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#C9558E", marginBottom: 20 }}>True Reverie</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 40, color: envS.dark ? "#FFF6EC" : "#3D2545", lineHeight: 1.1, marginBottom: 24 }}>Welcome to<br />True Reverie</h1>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 21, color: envS.dark ? "#F0C879" : "#C9558E", lineHeight: 1.35, marginBottom: 22 }}>Your capacity changes every day.</div>
              <p style={{ fontSize: 15.5, color: envS.dark ? "rgba(255,246,236,0.9)" : "#5A4458", lineHeight: 1.7, marginBottom: 14 }}>Some days you have energy to build. Some days you're simply trying to make it through.</p>
              <p style={{ fontSize: 15.5, color: envS.dark ? "rgba(255,246,236,0.9)" : "#5A4458", lineHeight: 1.7, marginBottom: 40 }}>True Reverie helps you stop fighting your body and start working with it — by matching your workouts, nutrition, recovery, and support to the version of you that showed up today.</p>
              <button onClick={() => setIntroStep(1)} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 16, cursor: "pointer", fontWeight: 700, fontSize: 15, letterSpacing: 0.3, boxShadow: "0 10px 26px rgba(200,110,170,0.28)" }}>Get Started</button>
            </div>
          </div>
        </>
      )
    }
    const CAP_CARDS = [
      { emoji: "🟢", label: "Green", range: "71–100%", lines: ["I have energy today.", "Let's build."], color: "#7FA054", soft: "rgba(127,160,84,0.12)" },
      { emoji: "🟡", label: "Yellow", range: "36–70%", lines: ["I'm functioning, but running low.", "Let's protect progress."], color: "#D08F2E", soft: "rgba(208,143,46,0.12)" },
      { emoji: "🔴", label: "Red", range: "0–35%", lines: ["I'm depleted.", "Recovery IS the workout."], color: "#D65C4E", soft: "rgba(214,92,78,0.12)" },
    ]
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: envS.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 26px" }}>
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 30, color: envS.dark ? "#FFF6EC" : "#3D2545", lineHeight: 1.15, marginBottom: 22, textAlign: "center" }}>Meet the Capacity Method</h1>
            {CAP_CARDS.map((c) => (
              <div key={c.label} style={{ borderRadius: 18, background: envS.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.8)", border: `1px solid ${c.color}`, borderLeft: `5px solid ${c.color}`, padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: envS.dark ? "#FFF6EC" : "#3D2545" }}>{c.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.range}</span>
                </div>
                {c.lines.map((ln, i) => (
                  <div key={i} style={{ fontSize: 14, color: envS.dark ? "rgba(255,246,236,0.88)" : "#5A4458", lineHeight: 1.5, fontWeight: i === c.lines.length - 1 ? 700 : 400 }}>{ln}</div>
                ))}
              </div>
            ))}
            <div style={{ textAlign: "center", margin: "22px 0 30px" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: envS.dark ? "#F0C879" : "#C9558E", marginBottom: 8 }}>Your capacity isn't your character.</div>
              <div style={{ fontSize: 14, color: envS.dark ? "rgba(255,246,236,0.85)" : "#5A4458", lineHeight: 1.6 }}>It changes every day. True Reverie changes with you.</div>
            </div>
            <button onClick={() => setIntroStep(2)} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 16, cursor: "pointer", fontWeight: 700, fontSize: 15, letterSpacing: 0.3, boxShadow: "0 10px 26px rgba(200,110,170,0.28)" }}>Continue</button>
          </div>
        </div>
      </>
    )
  }

  if (user && !setupData) {
    const envS = ENV(new Date().getHours(), null)
    const steps = [
      { key: "season", q: "What season are you in?", opts: SEASONS, multi: false },
      { key: "hopes", q: "What are you hoping True Reverie helps with most?", opts: HOPES, multi: true },
      { key: "level", q: "Your movement experience?", opts: LEVELS, multi: false },
      { key: "equip", q: "Where will you move?", opts: EQUIP, multi: false },
      { key: "cyclePref", q: "Would you like cycle tracking?", opts: CYCLEPREF, multi: false },
    ]
    const st = steps[setupStep]
    const val = draftSetup[st.key]
    const pick = (o) => {
      if (st.multi) {
        const arr = val.includes(o) ? val.filter((x) => x !== o) : [...val, o]
        setDraftSetup({ ...draftSetup, [st.key]: arr })
      } else setDraftSetup({ ...draftSetup, [st.key]: o })
    }
    const canNext = st.multi ? val.length > 0 : !!val
    const finish = () => {
      const data = { ...draftSetup, name: firstName }
      setSetupData(data)
      try { localStorage.setItem("nr_setup", JSON.stringify(data)); localStorage.setItem("nr_name", firstName) } catch (e) {}
      try { db.from("profiles").update({ setup: data, first_name: firstName }).eq("id", user.id).then(() => {}) } catch (e) {}
    }
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: envS.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px" }}>
          <div className="fade-in" key={setupStep}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#C9558E", marginBottom: 8 }}>TELL US ABOUT YOU {"·"} {setupStep + 1} OF {steps.length}</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, color: envS.dark ? "#FFF6EC" : "#3D2545", marginBottom: 20, lineHeight: 1.25 }}>{st.q}</h2>
            {st.opts.map((o) => {
              const on = st.multi ? val.includes(o) : val === o
              return (
                <div key={o} onClick={() => pick(o)} style={{ padding: "15px 17px", borderRadius: 14, marginBottom: 9, cursor: "pointer", background: on ? "linear-gradient(135deg,rgba(233,132,180,0.9),rgba(168,123,209,0.9))" : "rgba(255,255,255,0.75)", color: on ? "#FFFFFF" : "#4A3050", border: `1px solid ${on ? "transparent" : "rgba(255,255,255,0.9)"}`, fontSize: 14.5, fontWeight: 600 }}>{o}</div>
              )
            })}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {setupStep > 0 && <button onClick={() => setSetupStep(setupStep - 1)} style={{ flex: 1, padding: 14, background: "rgba(255,255,255,0.6)", color: "#4A3050", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Back</button>}
              {setupStep < steps.length - 1
                ? <button disabled={!canNext} onClick={() => setSetupStep(setupStep + 1)} style={{ flex: 2, padding: 14, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: canNext ? 1 : 0.45 }}>Continue</button>
                : <button disabled={!canNext} onClick={finish} style={{ flex: 2, padding: 14, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: canNext ? 1 : 0.45 }}>Done {"→"}</button>}
            </div>
            <div onClick={finish} style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: envS.dark ? "rgba(255,246,236,0.6)" : "#8E6C88", cursor: "pointer" }}>Skip for now</div>
          </div>
        </div>
      </>
    )
  }

  const themeKey = checkedIn ? colorFromPct(pct) : "none"
  const T = THEMES[themeKey]
  const cur = colorFromPct(pct)
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const envRoot = ENV(new Date().getHours(), checkedIn ? cur : null)
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

  const Protocol = () => {
    const RED = ["Drink water", "Eat something with protein", "Basic hygiene", "Take medications", "Rest when possible"]
    return (
      <div className="fade-in" style={{ marginTop: 26 }}>
        <div style={{ textAlign: "center", padding: "0 6px 22px" }}>
          <p style={{ fontFamily: "'Sacramento', cursive", fontSize: 30, lineHeight: 1.35, color: T.accent }}>{"\u201C"}{QUOTES[cur]}{"\u201D"}</p>
          <p style={{ fontSize: 11, color: BASE.taupe, marginTop: 8, letterSpacing: 1 }}>— VANESSA, RN</p>
        </div>
        <div style={{ padding: 18, borderRadius: 16, background: T.tint, border: `1px solid rgba(${T.glow},0.3)` }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: T.accent, fontWeight: 700 }}>{T.label} · {T.word}</div>
          {cur === "red" && (
            <>
              <p style={{ fontSize: 14, color: BASE.creamDim, margin: "12px 0 14px", lineHeight: 1.6 }}>Your only goal today is to stay safe, stable, and minimally supported. Everything else can wait.</p>
              <div style={{ fontSize: 11, color: BASE.taupe, marginBottom: 8, fontWeight: 600 }}>BASELINE CARE</div>
              {RED.map((item, i) => (
                <div key={i} onClick={() => setBaseline(baseline.map((b, j) => (j === i ? !b : b)))} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer", borderBottom: i < 4 ? `0.5px solid ${BASE.border}` : "none" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${baseline[i] ? T.accent : BASE.taupe}`, background: baseline[i] ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#FFFFFF" }}>{baseline[i] ? "✓" : ""}</span>
                  <span style={{ fontSize: 14, color: baseline[i] ? BASE.taupe : BASE.cream, textDecoration: baseline[i] ? "line-through" : "none" }}>{item}</span>
                </div>
              ))}
            </>
          )}
          {cur === "yellow" && (
            <>
              <p style={{ fontSize: 14, color: BASE.creamDim, margin: "12px 0 14px", lineHeight: 1.6 }}>You can do things — you just can't do everything. Handle today while protecting tomorrow.</p>
              {[["Essential", "Must happen: work, childcare, meals"], ["Important", "Pick one or two: errands, movement, prep"], ["Optional", "Let it wait: deep cleaning, catching up"]].map(([h, d], i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? `0.5px solid ${BASE.border}` : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{h}</div>
                  <div style={{ fontSize: 13, color: BASE.creamDim, marginTop: 2 }}>{d}</div>
                </div>
              ))}
            </>
          )}
          {cur === "green" && (
            <>
              <p style={{ fontSize: 14, color: BASE.creamDim, margin: "12px 0 14px", lineHeight: 1.6 }}>You're resourced. This is the time for the things Red and Yellow days can't hold.</p>
              {["Plan and set goals", "Deep or creative work", "A bigger project or habit", "Connection and growth"].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", fontSize: 14, color: BASE.cream }}><span style={{ color: T.accent }}>›</span>{item}</div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  // ---- analytics over history ----
  const topOf = (rows, key) => {
    const tally = {}
    rows.forEach((r) => (r[key] || []).forEach((v) => { tally[v] = (tally[v] || 0) + 1 }))
    const arr = Object.entries(tally).sort((a, b) => b[1] - a[1])
    return arr.length ? arr[0][0] : null
  }

  const stats = (() => {
    if (!history.length) return null
    const counts = { red: 0, yellow: 0, green: 0 }
    let sum = 0
    history.forEach((d) => { counts[d.color]++; sum += d.pct })
    return { counts, avg: Math.round(sum / history.length), top: Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] }
  })()

  // capacity average per cycle phase (needs cycle set + history)
  const phaseAverages = (() => {
    if (!cycleLength || !lastPeriod || !history.length) return null
    const buckets = { menstrual: [], follicular: [], ovulation: [], luteal: [] }
    history.forEach((d) => {
      const c = computeCycle(effCycleLength, lastPeriod, d.date)
      if (c) buckets[c.phase].push(d.pct)
    })
    const out = {}
    let any = false
    PHASE_ORDER.forEach((p) => {
      if (buckets[p].length) { out[p] = Math.round(buckets[p].reduce((a, b) => a + b, 0) / buckets[p].length); any = true }
      else out[p] = null
    })
    return any ? out : null
  })()

  // monthly capacity report (current calendar month)
  const report = (() => {
    if (!history.length) return null
    const now = new Date()
    const m = now.getMonth(), y = now.getFullYear()
    const rows = history.filter((d) => d.date.getMonth() === m && d.date.getFullYear() === y)
    if (!rows.length) return { empty: true, monthName: now.toLocaleDateString("en-US", { month: "long" }) }
    const counts = { red: 0, yellow: 0, green: 0 }
    let sum = 0
    rows.forEach((d) => { counts[d.color]++; sum += d.pct })
    const avg = Math.round(sum / rows.length)
    const redRows = rows.filter((d) => d.color === "red")
    const greenRows = rows.filter((d) => d.color === "green")
    const trigger = topOf(redRows.length ? redRows : rows, "factors")
    const recovery = topOf(greenRows.length ? greenRows : rows, "supports")
    let bestPhase = null
    if (phaseAverages) {
      const ranked = PHASE_ORDER.filter((p) => phaseAverages[p] != null).sort((a, b) => phaseAverages[b] - phaseAverages[a])
      if (ranked.length) bestPhase = ranked[0]
    }
    const reminder = counts.green >= counts.red
      ? "You had at least as many Green Days as Red this month — your patterns are leaning steadier. That's worth noticing."
      : "Red Days outnumbered Green this month. That's information, not failure — it shows where your system needed more support."
    return { empty: false, monthName: now.toLocaleDateString("en-US", { month: "long" }), avg, counts, trigger, recovery, bestPhase, days: rows.length }
  })()


  // ============ PROGRESS DASHBOARD ANALYTICS ============
  // All derived from real check-in history and workout log. Observational, never prescriptive.
  const progressData = (() => {
    const H = [...history].filter((d) => d.dateISO && typeof d.pct === "number").sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1))
    const todayISO = new Date().toISOString().slice(0, 10)
    const tierOf = (d) => (d.pct < 15 ? "recovery" : d.color)
    // Recovery-day count (below 15%)
    const recoveryDays = H.filter((d) => d.pct < 15).length
    // ---- Capacity momentum: compare last ~14 days vs the prior ~14 days ----
    const momentum = (() => {
      if (H.length < 6) return null
      const recent = H.slice(-14), prior = H.slice(-28, -14)
      if (!recent.length || prior.length < 3) return null
      const avg = (arr) => arr.reduce((s, d) => s + d.pct, 0) / arr.length
      const rAvg = avg(recent), pAvg = avg(prior)
      const delta = Math.round(rAvg - pAvg)
      if (delta >= 5) return { dir: "up", icon: "⬆️", delta, msg: "Your average capacity has gradually increased over recent weeks. Whatever you've been doing, it's supporting you." }
      if (delta <= -5) return { dir: "down", icon: "⬇️", delta, msg: "Your capacity has dipped recently. Recovery may deserve a little extra attention — and that's a wise thing to give it." }
      return { dir: "steady", icon: "➡️", delta, msg: "Your capacity has stayed relatively steady lately. Steady is its own kind of progress." }
    })()
    // ---- Weekly patterns: average capacity by day of week ----
    const weekly = (() => {
      if (H.length < 10) return null
      const days = [[], [], [], [], [], [], []] // Sun..Sat
      H.forEach((d) => { const wd = new Date(d.dateISO + "T12:00:00").getDay(); days[wd].push(d.pct) })
      const named = days.map((arr, i) => ({ i, n: arr.length, avg: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null }))
      const eligible = named.filter((x) => x.n >= 2)
      if (eligible.length < 4) return null
      const DOW = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"]
      const hi = [...eligible].sort((a, b) => b.avg - a.avg)[0]
      const lo = [...eligible].sort((a, b) => a.avg - b.avg)[0]
      const out = []
      if (hi && hi.avg != null) out.push(`Your capacity has tended to be highest on ${DOW[hi.i]}.`)
      if (lo && lo.i !== hi.i) out.push(`${DOW[lo.i]} have often been a lower-capacity time for you.`)
      return out.length ? out : null
    })()
    // ---- Recovery patterns: which supports precede higher-capacity days ----
    const recoveryPatterns = (() => {
      if (H.length < 8) return null
      const greenRows = H.filter((d) => d.color === "green")
      if (greenRows.length < 3) return null
      // supports most commonly logged ON green days
      const supTally = {}
      greenRows.forEach((d) => (d.supports || []).forEach((s) => { supTally[s] = (supTally[s] || 0) + 1 }))
      const topSup = Object.entries(supTally).sort((a, b) => b[1] - a[1])[0]
      // factor most commonly logged on red days
      const redRows = H.filter((d) => d.color === "red")
      const facTally = {}
      redRows.forEach((d) => (d.factors || []).forEach((f) => { facTally[f] = (facTally[f] || 0) + 1 }))
      const topFac = Object.entries(facTally).sort((a, b) => b[1] - a[1])[0]
      const out = []
      if (topSup && topSup[1] >= 2) out.push(`"${topSup[0]}" is commonly present around your Green Days.`)
      if (topFac && topFac[1] >= 2) out.push(`"${topFac[0]}" has often shown up on your lower-capacity days.`)
      return out.length ? out : null
    })()
    // ---- Movement stats ----
    const totalWorkouts = woLog.length
    const totalMinutes = woLog.reduce((s, w) => s + (w.minutes || w.mins || (Array.isArray(w.sets) ? 0 : 0) || 25), 0) // ~25 min default when unknown
    const catTally = {}
    woLog.forEach((w) => { const lbl = (WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label; catTally[lbl] = (catTally[lbl] || 0) + 1 })
    const favCat = Object.entries(catTally).sort((a, b) => b[1] - a[1])[0]
    // ---- Check-in streak (consecutive days up to today) ----
    const checkinStreak = (() => {
      if (!H.length) return 0
      const set = new Set(H.map((d) => d.dateISO))
      let streak = 0
      const cursor = new Date(todayISO + "T12:00:00")
      // allow streak to count from today or yesterday backward
      if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
      while (set.has(cursor.toISOString().slice(0, 10))) { streak++; cursor.setDate(cursor.getDate() - 1) }
      return streak
    })()
    // ---- Workout streak (consecutive weeks with >=1 workout) is complex; use consecutive-day movement streak ----
    const workoutStreak = (() => {
      if (!woLog.length) return 0
      const set = new Set(woLog.map((w) => w.date))
      let streak = 0
      const cursor = new Date(todayISO + "T12:00:00")
      if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
      while (set.has(cursor.toISOString().slice(0, 10))) { streak++; cursor.setDate(cursor.getDate() - 1) }
      return streak
    })()
    // ---- Dynamic header insight line ----
    const headerLine = (() => {
      const timeless = ["You're learning your rhythm.", "Small steps are adding up.", "Every check-in teaches us something.", "Your patterns are becoming clearer.", "Progress isn't always louder — it can be steadier.", "One day at a time is becoming real progress."]
      const personal = []
      if (checkinStreak >= 3) personal.push(`You've checked in ${checkinStreak} days in a row — you're building a clearer picture of your rhythm.`)
      if (momentum && momentum.dir === "up") personal.push("Your capacity has been finding a steadier, stronger rhythm lately.")
      if (recoveryDays >= 3) personal.push("You've been honoring recovery more often lately, and that matters.")
      if (stats && stats.counts.green >= 3 && stats.counts.green >= stats.counts.red) personal.push("Your Green Days have been showing up more often.")
      const pool = personal.length ? personal.concat(timeless.slice(0, 2)) : timeless
      return pool[dayIndex(pool.length)]
    })()
    // ---- Biggest Win: pick the most meaningful, data-backed accomplishment ----
    const biggestWin = (() => {
      const wins = []
      if (checkinStreak >= 7) wins.push({ p: 5, t: `You checked in ${checkinStreak} days in a row — consistency is quietly becoming one of your strengths.` })
      else if (checkinStreak >= 3) wins.push({ p: 2, t: `You've checked in ${checkinStreak} days running. Showing up is the whole practice.` })
      if (momentum && momentum.dir === "up" && momentum.delta >= 5) wins.push({ p: 5, t: `Your average capacity has risen about ${momentum.delta}% recently — real, quiet progress.` })
      if (recoveryDays >= 2) wins.push({ p: 4, t: "You prioritized recovery instead of pushing through exhaustion. That's strength, not stepping back." })
      // First green after a run of red
      const sortedH = H
      for (let i = 1; i < sortedH.length; i++) {
        if (sortedH[i].color === "green" && sortedH[i - 1] && sortedH[i - 1].color === "red") { wins.push({ p: 3, t: "You reached a Green day after harder ones — proof your capacity rebuilds." }); break }
      }
      if (phaseAverages && PHASE_ORDER.every((p) => phaseAverages[p] != null)) wins.push({ p: 4, t: "You've now logged your capacity through every cycle phase — a full picture of your rhythm." })
      if (workoutStreak >= 2) wins.push({ p: 3, t: `You've moved ${workoutStreak} days in a row. Momentum is building.` })
      if (totalWorkouts >= 1) wins.push({ p: 1, t: `You've completed ${totalWorkouts} workout${totalWorkouts > 1 ? "s" : ""} — every one counted.` })
      if (!wins.length) return "Every day you check in, you're learning something about yourself. That's where rebuilding begins."
      const maxP = Math.max(...wins.map((w) => w.p))
      const top = wins.filter((w) => w.p === maxP)
      return top[dayIndex(top.length)].t
    })()
    // ---- Monthly reflection (rotating, data-aware) ----
    const monthlyReflection = (() => {
      if (!report || report.empty) return null
      const g = report.counts.green, r = report.counts.red
      const pool = []
      if (g >= r) pool.push("You gave yourself more Green Days than Red this month. Progress doesn't always feel dramatic, but consistency is quietly changing your capacity.")
      if (g >= r) pool.push("More Green than Red this month — your system has been finding steadier ground. That's worth pausing on.")
      if (r > g) pool.push("This month asked a lot of you, yet you continued showing up. Even your Red Days became valuable information instead of failure.")
      if (r > g) pool.push("A heavier month, and still you kept checking in. Meeting yourself honestly on the hard days is its own kind of strength.")
      pool.push("However this month felt, you kept listening to your body. That awareness is the foundation everything else is built on.")
      return pool[dayIndex(pool.length)]
    })()
    // highest/lowest capacity this month
    const monthRows = report && !report.empty ? history.filter((d) => { const dt = d.date; const now = new Date(); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear() }) : []
    const monthHi = monthRows.length ? Math.max(...monthRows.map((d) => d.pct)) : null
    const monthLo = monthRows.length ? Math.min(...monthRows.map((d) => d.pct)) : null
    // ---- Cycle phase analysis (avg + most-common tier per phase, min 3 check-ins) ----
    const cyclePhases = (() => {
      if (!cycleLength || !lastPeriod || H.length < 3) return null
      const PHASE_MIN = 3
      const stats = { menstrual: { n: 0, sum: 0, colors: {} }, follicular: { n: 0, sum: 0, colors: {} }, ovulation: { n: 0, sum: 0, colors: {} }, luteal: { n: 0, sum: 0, colors: {} } }
      H.forEach((d) => {
        const cc = computeCycle(effCycleLength, lastPeriod, new Date(d.dateISO + "T00:00:00"))
        if (!cc || !stats[cc.phase]) return
        const st = stats[cc.phase]; st.n++; st.sum += d.pct
        const tier = tierOf(d); st.colors[tier] = (st.colors[tier] || 0) + 1
      })
      const withEnough = PHASE_ORDER.filter((p) => stats[p].n >= PHASE_MIN)
      if (!withEnough.length) return { none: true }
      const avg = (p) => Math.round(stats[p].sum / stats[p].n)
      const top = (p) => { const c = stats[p].colors; const k = Object.keys(c); return k.length ? k.sort((a, b) => c[b] - c[a])[0] : null }
      let summary = null
      if (withEnough.length >= 2) {
        const ranked = [...withEnough].sort((a, b) => avg(b) - avg(a))
        const PL = { menstrual: "menstrual", follicular: "follicular", ovulation: "ovulatory", luteal: "luteal" }
        if (avg(ranked[0]) !== avg(ranked[ranked.length - 1])) summary = `So far, your check-ins suggest your capacity runs highest during your ${PL[ranked[0]]} phase and lowest during your ${PL[ranked[ranked.length - 1]]} phase.`
      }
      return { rows: PHASE_ORDER.map((p) => ({ phase: p, enough: stats[p].n >= PHASE_MIN, n: stats[p].n, avg: stats[p].n ? avg(p) : null, top: stats[p].n ? top(p) : null })), summary, allFour: withEnough.length === 4 }
    })()
    // ---- Date-indexed lookups for the capacity calendar ----
    const byDate = {}
    history.forEach((d) => { if (d.dateISO) byDate[d.dateISO] = d })
    const woByDate = {}
    woLog.forEach((w) => { if (w.date) { (woByDate[w.date] = woByDate[w.date] || []).push(w) } })
    // ---- Average capacity for a given calendar month (for month-over-month comparison) ----
    const avgForMonth = (y, m) => {
      const rows = history.filter((d) => d.date.getFullYear() === y && d.date.getMonth() === m)
      if (!rows.length) return null
      return Math.round(rows.reduce((s, d) => s + d.pct, 0) / rows.length)
    }
    // ---- Per-month summary for the Year view ----
    const yearMonths = (y) => {
      return Array.from({ length: 12 }, (_, m) => {
        const rows = history.filter((d) => d.date.getFullYear() === y && d.date.getMonth() === m)
        if (!rows.length) return { m, n: 0, avg: null, tier: null }
        const avg = Math.round(rows.reduce((s, d) => s + d.pct, 0) / rows.length)
        const colors = {}
        rows.forEach((d) => { const t = d.pct < 15 ? "recovery" : d.color; colors[t] = (colors[t] || 0) + 1 })
        const tier = Object.keys(colors).sort((a, b) => colors[b] - colors[a])[0]
        return { m, n: rows.length, avg, tier }
      })
    }
    return { momentum, weekly, recoveryPatterns, totalWorkouts, totalMinutes, favCat: favCat ? favCat[0] : null, checkinStreak, workoutStreak, headerLine, biggestWin, monthlyReflection, recoveryDays, monthHi, monthLo, tierOf, cyclePhases, byDate, woByDate, avgForMonth, yearMonths }
  })()

  const ReportLine = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: BASE.taupe }}>{label}</span>
      <span style={{ fontSize: 14, color: BASE.cream, fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  )


  const renderContent = () => {
    const ctx = { Chips, Label, ReportLine, Stat, T, addEntries, addFoodFor, addTab, baseline, bloomArticle, bloomCard, bloomPillar, bloomSection, bodyView, calcInputs, calcResult, capDay, capMonth, capRange, checkedIn, closeBloom, ctxOpen, cur, cycArticle, cycLib, cycLogDate, cycleAvg, cycleLength, cycleLogs, cycleMonth, cycleNow, dateStr, dayFor, deleteEntry, detailProgram, editCycle, editLife, eduPhase, effCycleLength, entryEdit, factors, findFood, foodDays, foodPick, foodQuery, forceTrainMenu, glowItem, glowOpen, glowSheet, glowTopic, groceryAdd, groceryChecked, groceryManual, guidedIdx, handleCopyShare, handleLogout, handleShare, history, isSavedBloom, lastPeriod, learnOpen, libLevel, libOpen, lifeMsg, logDate, logMeal, macrosOpen, makeEntry, mealEdit, mealFilter, mealOpen, mealType, moreView, myFoods, myMeals, newId, nourishView, nutrition, oneThing, openBloomCard, pct, periodDismissed, persistProgram, planView, programId, programStart, progressData, pulse, quickAdd, recentFoods, recovery, recoveryDone, recoveryOpen, rememberRecent, report, restLeft, saveCheckin, saveCycle, saveCycleLog, saveCycleSettings, saveFoodName, saveGroceryChecked, saveGroceryManual, saveMealName, saveMyFoods, saveMyMeals, saveNutrition, saveWeekPlan, savedBloom, savedFoods, saving, selectedWoKey, setAddFoodFor, setAddTab, setBloomArticle, setBloomPillar, setBloomSection, setBodyView, setCalcInputs, setCalcResult, setCapDay, setCapMonth, setCapRange, setCheckedIn, setCtxOpen, setCycArticle, setCycLib, setCycLogDate, setCycleLogs, setCycleMonth, setDay, setDetailProgram, setEditCycle, setEditLife, setEduPhase, setEntryEdit, setFactors, setFirstName, setFoodPick, setFoodQuery, setForceTrainMenu, setGlowItem, setGlowOpen, setGlowSheet, setGlowTopic, setGroceryAdd, setGuidedIdx, setLastPeriod, setLearnOpen, setLibLevel, setLibOpen, setLifeMsg, setMacrosOpen, setMealEdit, setMealFilter, setMealOpen, setMealType, setMoreView, setNourishView, setOneThing, setPct, setPeriodDismissed, setPlanView, setProgressView, setPulse, setQuickAdd, setQuickFilter, setRecoveryDone, setRecoveryOpen, setRestLeft, setSaveFoodName, setSaveMealName, setSelectedWoKey, setSetupData, setShareContext, setShareLevel, setShareNeed, setShareTrue, setSuppOpen, setSupports, setTab, setTmpLen, setTmpStart, setTrainView, setUseAvgCycle, setWaterCount, setWeekPick, setWhyOpen, setWoColor, setWoDone, setWoEnv, setWoKey, setWoLog, setWoLogged, setWoMode, setWoOpen, setWoTier, setWoType, setupData, shareContext, shareLevel, shareNeed, shareStatus, shareTrue, stats, suppOpen, supports, tab, tmpLen, tmpStart, toggle, toggleFavorite, toggleSaveBloom, trainView, updateEntry, useAvgCycle, user, weekPick, weekPlan, whyOpen, woColor, woDone, woEnv, woKey, woLog, woLogged, woMode, woOpen, woTier, woType }
    return renderHome(ctx) || renderTrain(ctx) || renderCycle(ctx) || renderNourish(ctx) || renderBloom(ctx) || renderProgress(ctx) || renderMore(ctx) || null
  }

  return (
    <><Fonts /><GlobalStyle />
      <div style={{ "--accent": T.accent, background: tab === "today" ? envRoot.bg : (tab === "body" && bodyView === "nourish" ? NOURISH_BG(envRoot.mode) : (tab === "bloom" ? BLOOM_BG(envRoot.mode) : (tab === "body" && bodyView === "cycle" ? CYCLE_BG(cycleNow && cycleNow.phase) : BASE.bg))), transition: "background 0.8s ease", minHeight: "100vh", maxWidth: 440, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        {tab === "today" && <Sky mode={envRoot.mode} tint={envRoot.tint} />}
        {tab === "today" && <Garden mode={envRoot.mode} />}
        {tab === "body" && bodyView === "nourish" && <NourishAir mode={envRoot.mode} tint={envRoot.tint} />}
        {tab === "body" && bodyView === "nourish" && <HerbGarden mode={envRoot.mode} subtle={!!planView || nourishView === "supps" || !!addFoodFor || !!foodPick || !!entryEdit} />}
        {tab === "bloom" && <BloomAir mode={envRoot.mode} tint={envRoot.tint} />}
        {tab === "bloom" && !bloomCard && !bloomArticle && !bloomPillar && <BloomAccents mode={envRoot.mode} />}
        {tab === "bloom" && <BloomScene mode={envRoot.mode} subtle={!!bloomCard || !!bloomArticle || !!bloomPillar || !!glowTopic} />}
        {tab === "body" && bodyView === "cycle" && <CycleAir phase={cycleNow && cycleNow.phase} />}
        <div style={{ position: "relative", paddingTop: 14 }}>
          {tab === "body" && (
            <div style={{ display: "flex", gap: 8, padding: "6px 18px 0" }}>
              {[["gym", "Move", "\ud83d\udcaa"], ["nourish", "Nourish", "\ud83c\udf7d\ufe0f"], ["cycle", "Cycle", "\ud83c\udf19"]].map(([k, lbl, ic]) => (
                <button key={k} onClick={() => setBodyView(k)} style={{ flex: 1, padding: "10px 4px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 700, background: bodyView === k ? T.accent : BASE.surface, color: bodyView === k ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${bodyView === k ? T.accent : BASE.border}` }}><span style={{ fontSize: 16, display: "block", marginBottom: 2 }}>{ic}</span>{lbl}</button>
              ))}
            </div>
          )}
          {renderContent()}
          <div style={{ height: 104 }} />
        </div>
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60 }}>
          <div style={{ maxWidth: 440, margin: "0 auto", display: "flex", background: tab === "today" && envRoot.dark ? "rgba(40,28,64,0.92)" : "rgba(255,255,255,0.93)", borderTop: `1px solid ${tab === "today" && envRoot.dark ? "rgba(255,255,255,0.12)" : BASE.border}`, padding: "8px 6px 14px", boxShadow: "0 -6px 24px rgba(60,35,70,0.10)" }}>
            {[["today", "Today", "\u2600\ufe0f"], ["body", "Body", "💪"], ["bloom", "Bloom", "🌸"], ["progress", "Progress", "📈"], ["more", "More", "🤍"]].map(([k, lbl, ic]) => {
              const active = tab === k
              const darkbar = tab === "today" && envRoot.dark
              return (
                <button key={k} onClick={() => { setBloomCard(null); setTab(k) }} style={{ flex: 1, padding: "6px 2px", background: "transparent", border: "none", cursor: "pointer", opacity: active ? 1 : 0.55 }}>
                  <span style={{ fontSize: 19, display: "block", marginBottom: 2, filter: active ? "none" : "grayscale(35%)" }}>{ic}</span>
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

