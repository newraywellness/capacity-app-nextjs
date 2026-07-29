import { PHASES } from './cycle'
import { MOVEMENTS, pickExercise } from './exercises'
import { dayIndex } from '../lib/theme'

const WO_TYPES = [
  { key: "full", label: "Full Body", icon: "\u2728" },
  { key: "legs", label: "Legs", icon: "🦵" },
  { key: "glutes", label: "Glutes", icon: "🍑" },
  { key: "upper", label: "Upper", icon: "💪" },
  { key: "walk", label: "Walk", icon: "🚶\u200d\u2640\ufe0f" },
]

// ============ MOVEMENT LIBRARY ARCHITECTURE ============
// Workouts are composed from: Movement Patterns -> Exercise options (by level) -> Program rules -> Capacity adaptation.
// All five programs draw from this one library; they differ by which patterns/levels/cues they select.
// This phase seeds the STRUCTURE with representative examples, not full content.
const CAPACITY_RULES = {
  green: { label: "Green", note: "Normal programmed sets, reps, and intensity.", color: "#7FA054" },
  yellow: { label: "Yellow", note: "Reduce volume, maintain the movement and your progress.", color: "#D08F2E" },
  red: { label: "Red", note: "Simplify the movement, fewer sets, prioritize confidence.", color: "#D65C4E" },
  recovery: { label: "Recovery", note: "Mobility, walking, breathing, gentle movement only.", color: "#A87BD1" },
}

const ALL_PROGRAMS = ["foundations", "strength", "mama", "move", "balanced"]

// ============ PROGRAM TEMPLATE ENGINE ============
// A workout = a list of movement-pattern SLOTS (not exercises). The Exercise Selection Engine
// (next phase) fills each slot from MOVEMENTS by the program's level + equipment. The Capacity
// Engine adds/removes slots. Programs feel different by requesting different pattern combinations.
// slot: { pattern: <MOVEMENTS.id>, role: "primary"|"accessory"|"optional"|"core"|"finisher" }
const WORKOUT_TEMPLATES = {
  // ---- STRONG FOUNDATIONS ----
  "foundations:full": { title: "Full Body Strength", focus: "Learning full-body strength", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "hinge", role: "primary" },
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" },
    { pattern: "corestab", role: "core" }, { pattern: "glute", role: "optional" } ] },
  "foundations:legs": { title: "Lower Body Strength", focus: "Building leg and glute strength", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "hinge", role: "primary" },
    { pattern: "glute", role: "primary" }, { pattern: "legiso", role: "accessory" },
    { pattern: "corestab", role: "core" } ] },
  "foundations:upper": { title: "Upper Body Strength", focus: "Building upper-body confidence", slots: [
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" },
    { pattern: "shoulder", role: "primary" }, { pattern: "corestab", role: "core" } ] },
  "foundations:glutes": { title: "Glutes + Core", focus: "Glute strength and a solid core", slots: [
    { pattern: "glute", role: "primary" }, { pattern: "squat", role: "primary" },
    { pattern: "hipstab", role: "accessory" }, { pattern: "deepcore", role: "core" }, { pattern: "corestab", role: "core" } ] },
  // ---- BUILD STRENGTH ----
  "strength:lowerA": { title: "Lower Strength A", focus: "Heavy squat + hinge", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "hinge", role: "primary" },
    { pattern: "glute", role: "primary" }, { pattern: "legiso", role: "accessory" }, { pattern: "corestab", role: "core" } ] },
  "strength:upperA": { title: "Upper Strength A", focus: "Heavy push + pull", slots: [
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" },
    { pattern: "shoulder", role: "primary" }, { pattern: "corestab", role: "accessory" }, { pattern: "corestab", role: "core" } ] },
  "strength:lowerB": { title: "Lower Strength B", focus: "Hinge-led strength", slots: [
    { pattern: "hinge", role: "primary" }, { pattern: "squat", role: "primary" },
    { pattern: "glute", role: "primary" }, { pattern: "hipstab", role: "accessory" }, { pattern: "corestab", role: "core" } ] },
  "strength:upperB": { title: "Upper Strength B", focus: "Push-led strength", slots: [
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" },
    { pattern: "shoulder", role: "primary" }, { pattern: "corestab", role: "core" } ] },
  "strength:accessories": { title: "Accessories + Core", focus: "Supporting lifts and core strength", slots: [
    { pattern: "glute", role: "primary" }, { pattern: "legiso", role: "accessory" },
    { pattern: "shoulder", role: "accessory" }, { pattern: "corestab", role: "core" }, { pattern: "corestab", role: "core" } ] },
  // ---- STRONG MAMA REBUILD ----
  "mama:full": { title: "Full Body Rebuild", focus: "Controlled, connected full-body strength", slots: [
    { pattern: "deepcore", role: "primary" }, { pattern: "squat", role: "primary" }, { pattern: "hinge", role: "primary" },
    { pattern: "push", role: "accessory" }, { pattern: "glute", role: "accessory" }, { pattern: "mobility", role: "finisher" } ] },
  "mama:core": { title: "Core + Stability", focus: "Deep core, breathing, pelvic floor", slots: [
    { pattern: "deepcore", role: "primary" }, { pattern: "deepcore", role: "primary" },
    { pattern: "hipstab", role: "accessory" }, { pattern: "mobility", role: "finisher" } ] },
  "mama:upper": { title: "Upper Body + Posture", focus: "Gentle pressing, pulling, and posture", slots: [
    { pattern: "pull", role: "primary" }, { pattern: "push", role: "primary" },
    { pattern: "shoulder", role: "accessory" }, { pattern: "deepcore", role: "core" } ] },
  "mama:legs": { title: "Lower Body + Core", focus: "Controlled lower-body strength with deep core", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "glute", role: "primary" },
    { pattern: "hipstab", role: "accessory" }, { pattern: "deepcore", role: "core" }, { pattern: "deepcore", role: "core" } ] },
  "mama:glutes": { title: "Glutes + Core", focus: "Hip strength, stability, and deep core", slots: [
    { pattern: "glute", role: "primary" }, { pattern: "squat", role: "accessory" },
    { pattern: "hipstab", role: "accessory" }, { pattern: "deepcore", role: "core" }, { pattern: "corestab", role: "core" } ] },
  // ---- JUST MOVE (<= ~20 min, low decisions) ----
  "move:full": { title: "Full Body Express", focus: "A little of everything, in under 20 minutes", cap: 20, slots: [
    { pattern: "squat", role: "primary" }, { pattern: "push", role: "accessory" }, { pattern: "pull", role: "accessory" }, { pattern: "deepcore", role: "core" } ] },
  "move:walk": { title: "Walk", focus: "Just a walk \u2014 that's the whole workout, and it counts", cap: 20, slots: [
    { pattern: "walk", role: "primary" } ] },
  "move:legs": { title: "Lower Body Express", focus: "Simple, gentle leg movement", cap: 20, slots: [
    { pattern: "squat", role: "primary" }, { pattern: "glute", role: "accessory" }, { pattern: "hipstab", role: "optional" } ] },
  "move:upper": { title: "Upper Body Express", focus: "Easy pressing and pulling", cap: 20, slots: [
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" }, { pattern: "mobility", role: "finisher" } ] },
  "move:glutes": { title: "Glutes + Core Express", focus: "Quick hip and core work", cap: 20, slots: [
    { pattern: "glute", role: "primary" }, { pattern: "deepcore", role: "core" }, { pattern: "corestab", role: "optional" } ] },
  // ---- BALANCED STRENGTH ----
  "balanced:full": { title: "Full Body Strength", focus: "Balanced full-body session", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "hinge", role: "primary" },
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" },
    { pattern: "corestab", role: "core" }, { pattern: "mobility", role: "optional" } ] },
  "balanced:upper": { title: "Upper Body", focus: "Push, pull, and shoulders", slots: [
    { pattern: "push", role: "primary" }, { pattern: "pull", role: "primary" },
    { pattern: "shoulder", role: "primary" }, { pattern: "corestab", role: "core" } ] },
  "balanced:legs": { title: "Lower Body", focus: "Squat, hinge, glutes", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "hinge", role: "primary" },
    { pattern: "glute", role: "primary" }, { pattern: "corestab", role: "core" } ] },
  "balanced:conditioning": { title: "Conditioning + Core", focus: "Low-impact conditioning and stability", slots: [
    { pattern: "walk", role: "primary" }, { pattern: "corestab", role: "core" }, { pattern: "mobility", role: "finisher" } ] },
  "balanced:flow": { title: "Full Body Flow", focus: "Flowing full-body movement", slots: [
    { pattern: "squat", role: "primary" }, { pattern: "push", role: "primary" },
    { pattern: "pull", role: "accessory" }, { pattern: "mobility", role: "finisher" } ] },
  "balanced:glutes": { title: "Glutes + Core", focus: "Hip strength and a stable core", slots: [
    { pattern: "glute", role: "primary" }, { pattern: "hipstab", role: "accessory" },
    { pattern: "squat", role: "accessory" }, { pattern: "corestab", role: "core" } ] },
}

// Weekly schedule maps each weekday (0=Mon..6=Sun) to a template key or "recovery".
// This REPLACES the loose split[] for programs that define a schedule; split stays as fallback.
const PROGRAM_SCHEDULE = {
  foundations: ["foundations:full", "walk+mobility", "foundations:legs", "foundations:upper", "walk+recovery", "foundations:glutes", "recovery"],
  strength: ["strength:lowerA", "strength:upperA", "walk+mobility", "strength:lowerB", "strength:upperB", "strength:accessories", "recovery"],
  mama: ["mama:full", "walk+mobility", "mama:legs", "mama:upper", "walk", "mama:glutes", "recovery"],
  move: ["move:full", "move:walk", "move:legs", "move:upper", "walk+mobility", "move:glutes", "recovery"],
  balanced: ["balanced:full", "walk+mobility", "balanced:legs", "balanced:upper", "balanced:conditioning", "balanced:glutes", "recovery"],
}

// Progression philosophy per program (shown to user; drives future load/rep logic).
const PROGRESSION = {
  foundations: [{ wk: "Weeks 1-2", note: "Learn the movements. Light and controlled." }, { wk: "Weeks 3-5", note: "Build confidence and volume." }, { wk: "Weeks 6-8", note: "Add strength and consistency." }],
  strength: [{ wk: "Ongoing", note: "Progressive overload: increase load, then reps, always protecting technique. Advanced options bring in barbells and heavier resistance." }],
  mama: [{ wk: "Throughout", note: "Never rush intensity. Quality over difficulty, always. Deep core and breathing lead every week." }],
  move: [{ wk: "6 weeks", note: "Consistency over intensity. Sessions stay around 20 minutes. Momentum is the whole goal." }],
  balanced: [{ wk: "8 weeks", note: "Rotate strength, mobility, and conditioning so the body stays capable and the routine stays sustainable." }],
}

// Capacity approach: how many slots survive at each capacity level (optional/finisher drop first).
const CAPACITY_SLOT_RULE = {
  green: { keep: "all", note: "Full planned workout \u2014 normal sets, reps, and progression." },
  yellow: { drop: ["optional", "finisher"], note: "Reduce volume. Keep the important patterns, remove the optional work." },
  red: { keep: ["primary"], addRecovery: false, note: "Maintain the habit. Primary patterns only, simpler variations, fewer sets." },
  recovery: { replaceWith: ["mobility", "walk", "deepcore"], note: "Recovery-focused movement: walking, mobility, breathing, gentle core." },
}

// THE ENGINE: given a program + weekday + capacity, return today's slot list (patterns only).
const buildSession = (progId, weekday, capKey) => {
  const schedule = PROGRAM_SCHEDULE[progId] || []
  const key = schedule[weekday] || "recovery"
  // Non-strength scheduled days
  const simpleDays = { recovery: ["mobility", "walk", "deepcore"], walk: ["walk", "mobility"], "walk+mobility": ["walk", "mobility"], "walk+recovery": ["walk", "mobility"], "mobility+recovery": ["mobility", "deepcore"], mobility: ["mobility", "walk"], conditioning: ["walk", "corestab", "mobility"] }
  if (capKey === "recovery") return { title: "Recovery", focus: "Gentle, restorative movement", slots: CAPACITY_SLOT_RULE.recovery.replaceWith.map((p) => ({ pattern: p, role: "primary" })) }
  if (simpleDays[key]) return { title: key.split("+").map((w) => w[0].toUpperCase() + w.slice(1)).join(" + "), focus: "Movement & recovery", slots: simpleDays[key].map((p) => ({ pattern: p, role: "primary" })) }
  const tmpl = WORKOUT_TEMPLATES[key]
  if (!tmpl) return { title: "Recovery", focus: "Gentle movement", slots: simpleDays.recovery.map((p) => ({ pattern: p, role: "primary" })) }
  let slots = tmpl.slots.slice()
  if (capKey === "yellow") slots = slots.filter((s) => !["optional", "finisher"].includes(s.role))
  if (capKey === "red") slots = slots.filter((s) => s.role === "primary" || s.role === "core").slice(0, 3)
  return { title: tmpl.title, focus: tmpl.focus, slots, cap: tmpl.cap }
}


// Build the full exercise list for today's session (slots -> concrete exercises), capacity-aware sets.
const resolveSession = (session, env, capKey, phase, progId) => {
  const seen = {}
  const repBias = phase && phase.repBias ? phase.repBias : 0
  return session.slots.map((sl) => {
    const i = (seen[sl.pattern] = (seen[sl.pattern] || 0)) // 0,1,2 for repeated patterns
    seen[sl.pattern]++
    const ex = pickExercise(sl.pattern, env, i, progId)
    if (!ex) return null
    let sets = ex.sets
    // Duration-based single sessions (walks, mobility flows, recovery) stay one continuous session —
    // the minimum-two-set rule is for multi-set strength work only. Bumping a single walk to 2 would
    // make lower-capacity days longer than Green, which is the opposite of the intent.
    const isDurationSession = ex.sets === 1 || /min\b/.test(String(ex.reps))
    if (!isDurationSession) {
      if (capKey === "yellow") sets = Math.max(2, sets - 1)
      if (capKey === "red") sets = 2
    }
    // Phase rep bias: gently nudge rep targets up as confidence builds (display only, non-destructive)
    let reps = ex.reps
    if (repBias && capKey !== "red" && /^\d+/.test(String(reps))) {
      const m = String(reps).match(/^(\d+)(?:-(\d+))?(.*)$/)
      if (m) { const lo = +m[1] + repBias; const hi = m[2] ? +m[2] + repBias : null; reps = hi ? `${lo}-${hi}${m[3]}` : `${lo}${m[3]}` }
    }
    // Strength phase: progressive overload cue on primary lifts (add a little weight when it feels controlled)
    let cue = ex.cue
    if (phase && phase.addWeight && sl.role === "primary" && capKey === "green") {
      cue = ex.cue + " When this feels controlled, add a little weight."
    }
    return { ...ex, sets, reps, cue, role: sl.role, pattern: sl.pattern }
  }).filter(Boolean)
}

const PROGRAMS = [
  { id: "foundations", emoji: "🌱", name: "Strong Foundations", tag: "Build consistency & confidence",
    promise: "Start where you are. Build strength and confidence.",
    desc: "Learn strength training and build lifelong habits. For beginners or anyone returning after time away.",
    purpose: "Teach strength training fundamentals, build consistency, and remove the intimidation of the gym.",
    bestFor: ["Beginners", "Returning after time away", "New to the gym", "Anyone wanting a strong foundation"],
    builds: ["Strength", "Confidence", "Consistency", "Movement skills"],
    style: "Compound moves, machines, dumbbells, walking", equip: "Home or Gym", weeks: 8, difficulty: "Beginner",
    goal: "Feel confident and capable.", next: "strength",
    split: ["full", "walk", "legs", "upper", "walk", "glutes", "rest"], grad: "linear-gradient(135deg,#9CC79A,#6E9E6B)" },
  { id: "strength", emoji: "💪", name: "Build Strength", tag: "Get stronger every week",
    promise: "Get stronger every week.",
    desc: "Increase strength and build muscle with progressive overload. For women with basic lifting experience.",
    purpose: "Progressive strength training focused on building muscle and measurably increasing strength.",
    bestFor: ["Women with lifting experience", "Graduates of Strong Foundations", "Anyone wanting structured progression"],
    builds: ["Measurable strength", "Muscle", "Progression", "Gym confidence"],
    style: "Barbells, machines, dumbbells, progressive overload", equip: "Gym", weeks: 12, difficulty: "Intermediate",
    goal: "Build measurable strength.", next: "balanced",
    split: ["legs", "upper", "walk", "glutes", "full", "upper", "rest"], grad: "linear-gradient(135deg,#E984B4,#A54E86)" },
  { id: "mama", emoji: "🤱", name: "Strong Mama Rebuild", tag: "Rebuild gently, respect healing",
    promise: "Rebuild gently. Respect healing.",
    desc: "Postpartum recovery that reconnects the core and rebuilds strength gradually. Includes pelvic-floor awareness. Never rushed.",
    purpose: "Help postpartum women reconnect with their bodies and rebuild strength safely, at their own pace.",
    bestFor: ["Postpartum women cleared for exercise", "Returning after pregnancy", "Rebuilding core & pelvic floor"],
    builds: ["Core connection", "Pelvic-floor awareness", "Gentle strength", "Mobility", "Confidence in your body"],
    style: "Core connection, pelvic floor awareness, mobility, gentle strength, walking", equip: "Home or Gym", weeks: 10, difficulty: "Gentle · postpartum",
    goal: "Feel strong and confident in your body again.", next: "foundations",
    split: ["walk", "full", "walk", "glutes", "walk", "upper", "rest"], grad: "linear-gradient(135deg,#F0B7D4,#C97BA8)" },
  { id: "move", emoji: "🚶", name: "Just Move", tag: "Momentum without pressure",
    promise: "Momentum without pressure.",
    desc: "Walking, light resistance, simple sessions. Built for overwhelmed seasons and anyone who struggles with consistency.",
    purpose: "Make movement possible during overwhelming seasons. Consistency always comes before intensity here.",
    bestFor: ["Busy women", "Moms", "Beginners", "Anyone struggling with consistency"],
    builds: ["A sustainable habit", "Energy", "Momentum", "A gentle relationship with movement"],
    style: "Walking, light resistance, simple full-body movement (never over ~20 min)", equip: "Home", weeks: 6, difficulty: "Low-pressure",
    goal: "Create a sustainable movement habit.", next: "foundations",
    split: ["walk", "full", "walk", "walk", "legs", "walk", "rest"], grad: "linear-gradient(135deg,#7FB3E8,#4E85C2)" },
  { id: "balanced", emoji: "⚖️", name: "Balanced Strength", tag: "Feel healthy & capable",
    promise: "Feel healthy, capable, and strong.",
    desc: "A blend of strength, mobility, conditioning, and recovery. For women who want longevity and to feel good, not chase aesthetics.",
    purpose: "Create a sustainable fitness lifestyle that combines strength, mobility, conditioning, and recovery.",
    bestFor: ["Women wanting overall wellness", "Longevity over aesthetics", "A balanced, forever routine"],
    builds: ["Strength", "Mobility", "Conditioning", "Energy", "A body that feels good to live in"],
    style: "Strength, mobility, conditioning, recovery", equip: "Home or Gym", weeks: 8, difficulty: "All levels",
    goal: "Build a body that feels good to live in.", next: "balanced",
    split: ["full", "walk", "upper", "legs", "walk", "glutes", "rest"], grad: "linear-gradient(135deg,#C6A3E0,#8A5EB0)" },
]

// ============ PROGRAM PHASES (8-week progression) ============
// Phases drive difficulty over time: which experience level the selector favors, and set/rep emphasis.
// Program completion screens (title, message, next paths).
const COMPLETION = {
  foundations: { title: "You built your foundation.", weeksWord: "Eight weeks", message: "Eight weeks of showing up for yourself. You learned the movements, built the habit, and got stronger. That's yours to keep.", paths: [["Repeat, a little stronger", "Run Strong Foundations again with more confidence and resistance.", "self"], ["Move into Build Strength", "Progressive lifting for your next chapter.", "strength"], ["Try Balanced Strength", "Strength, mobility, and conditioning for the long run.", "balanced"], ["Choose another path", "Browse all the True Reverie programs.", null]] },
  mama: { title: "You're ready for your next chapter.", weeksWord: "Ten weeks", message: "Ten weeks of honoring your body while it rebuilt. You reconnected, grew stronger, and did it with patience. That strength is yours.", paths: [["Repeat Strong Mama Rebuild", "Move through the rebuild again, meeting your body where it is now.", "self"], ["Begin Strong Foundations", "Step into structured strength training with confidence.", "foundations"], ["Begin Balanced Strength", "Strength, mobility, and conditioning for the long run.", "balanced"], ["Choose another path", "Browse all the True Reverie programs.", null]] },
  balanced: { title: "Strength is part of your life now.", weeksWord: "Eight weeks", message: "You've built a body that supports your life. Keep growing in the direction that excites you most \u2014 this is a way of living, not a finish line.", paths: [["Repeat Balanced Strength", "Keep the sustainable rhythm going, a little stronger.", "self"], ["Begin Build Strength", "Ready for more? Step into progressive lifting.", "strength"], ["Return to Strong Foundations", "Revisit the fundamentals anytime.", "foundations"], ["Explore another path", "Browse all the True Reverie programs.", null]] },
  strength: { title: "Look how far you've come.", weeksWord: "Twelve weeks", message: "You're stronger than when you began \u2014 in more ways than one. Twelve weeks of showing up, lifting with intention, and trusting the process. This strength is yours.", paths: [["Repeat Build Strength", "Run it back with heavier progressive overload.", "self"], ["Move into Balanced Strength", "Shift toward sustainable, balanced training.", "balanced"], ["Return to Strong Foundations", "Revisit the fundamentals anytime.", "foundations"], ["Explore another path", "Browse all the True Reverie programs.", null]] },
  move: { title: "You kept moving forward.", weeksWord: "Six weeks", message: "Momentum is one of the strongest things you can build \u2014 and you built it, one gentle day at a time. However busy life got, you kept showing up. That's everything.", paths: [["Repeat Just Move", "Keep your momentum going, gently.", "self"], ["Begin Strong Foundations", "Ready to build? Step into structured strength.", "foundations"], ["Begin Balanced Strength", "Sustainable strength for everyday life.", "balanced"], ["Explore another path", "Browse all the True Reverie programs.", null]] },
}

const PROGRAM_PHASES = {
  foundations: [
    { name: "Learn Your Body", weeks: [1, 2], level: "beginner", goal: "Create confidence and learn the movement patterns.", emphasis: "Proper form, controlled reps, building the routine.", repBias: 0, coach: "This week is about learning the movements. Slow and controlled beats heavy every time." },
    { name: "Build Confidence", weeks: [3, 5], level: "beginner", goal: "Increase strength and comfort.", emphasis: "A little more volume and resistance. Increase reps first, then weight.", repBias: 2, coach: "You know these movements now. Add a rep or a little weight when it feels good \u2014 no rush." },
    { name: "Build Strength", weeks: [6, 8], level: "intermediate", goal: "Feel stronger and more capable.", emphasis: "Progressive overload and cleaner technique. Advanced-beginner options appear.", repBias: 1, addWeight: true, coach: "You've built a real foundation. Trust it \u2014 you're stronger than week one, and it shows." },
  ],
  mama: [
    { name: "Reconnect", weeks: [1, 3], level: "beginner", goal: "Reconnect with your body \u2014 breathing, deep core, and pelvic floor.", emphasis: "Breathing, deep core activation, pelvic floor awareness, walking, mobility, and gentle strength.", repBias: 0, coach: "You are rebuilding something incredible. Slow is not falling behind." },
    { name: "Rebuild", weeks: [4, 7], level: "beginner", goal: "Rebuild full-body strength and stability with confidence.", emphasis: "Full-body strength, hip stability, balance, and core endurance. Volume increases gradually.", repBias: 1, coach: "Your strength is returning one movement at a time. Your body deserves this patience." },
    { name: "Strength Again", weeks: [8, 10], level: "intermediate", goal: "Move into functional, compound strength \u2014 never rushed.", emphasis: "Compound movements and functional strength, preparing you for Strong Foundations or Balanced Strength.", repBias: 1, addWeight: true, coach: "Look how far you've come. This strength is yours, and you earned it gently." },
  ],
  balanced: [
    { name: "Build the Base", weeks: [1, 2], level: "beginner", goal: "Movement quality, consistency, and finding your rhythm.", emphasis: "Learn the flow of the week. Quality reps, showing up, feeling capable.", repBias: 0, coach: "We're building something sustainable. Consistency beats intensity, every time." },
    { name: "Build Capacity", weeks: [3, 5], level: "intermediate", goal: "Grow strength, work capacity, mobility, and endurance.", emphasis: "Gradually increase the challenge while keeping every session enjoyable.", repBias: 1, coach: "Strong bodies make everyday life easier. Leave a little energy for the rest of your day." },
    { name: "Live Strong", weeks: [6, 8], level: "intermediate", goal: "Balanced, athletic, sustainable fitness you can keep for years.", emphasis: "Finish stronger while still feeling fresh enough to enjoy life outside the gym.", repBias: 1, addWeight: true, coach: "You don't need to prove anything today. This is a body built to support your life." },
  ],
  strength: [
    { name: "Build Technique", weeks: [1, 4], level: "intermediate", goal: "Learn the compound lifts with quality and confidence.", emphasis: "Movement quality first. Learn the big lifts, build consistency, own the technique.", repBias: 0, coach: "Technique first. Strength follows. Strong women aren't built overnight." },
    { name: "Build Strength", weeks: [5, 8], level: "intermediate", goal: "Progressive overload \u2014 add load and intensity intentionally.", emphasis: "Now we grow: add weight or reps each week while protecting your form.", repBias: 1, addWeight: true, coach: "Excellent control. Now let's grow from here \u2014 progress is measured one workout at a time." },
    { name: "Lift Strong", weeks: [9, 12], level: "advanced", goal: "Power, control, and long-term strength.", emphasis: "Become stronger without sacrificing movement quality. This is confident, capable lifting.", repBias: 2, addWeight: true, coach: "Look how strong you've become. Your future strength is built by today's consistency." },
  ],
  move: [
    { name: "Start Moving", weeks: [1, 2], level: "beginner", goal: "Create momentum with simple movement and walking.", emphasis: "Just start. Walking and easy movement, building the habit of showing up.", repBias: 0, coach: "You made it here today. That's enough to begin." },
    { name: "Build Routine", weeks: [3, 4], level: "beginner", goal: "Settle into a gentle, consistent rhythm.", emphasis: "Light strength, mobility, and a little more energy. Small steps become strong habits.", repBias: 0, coach: "Small steps become strong habits. Movement is an act of caring for yourself." },
    { name: "Ready for More", weeks: [5, 6], level: "beginner", goal: "Grow confidence and prepare for whatever comes next.", emphasis: "Slightly longer sessions and a touch more strength. You can absolutely keep going.", repBias: 1, coach: "Look what you've built. You can absolutely keep going." },
  ],
}

// Per-program coaching overlays (gentler for Mama). Falls back to COACH_LINES.
const PROGRAM_COACH_LINES = {
  mama: {
    green: ["Your strength is returning one movement at a time.", "You are rebuilding something incredible.", "Strong and connected \u2014 your body remembers this."],
    yellow: ["Slow is not falling behind.", "We've gentled today so you can honor where you are.", "Meeting your body where it is today is wisdom, not weakness."],
    red: ["Your body deserves patience, especially today.", "Showing up softly still counts, mama.", "Rest and rebuild \u2014 that is the whole point of this work."],
    recovery: ["Breathing and walking are real rebuilding.", "Today's gentleness is tomorrow's strength.", "Your body is healing, and that is the work."],
  },
  balanced: {
    green: ["Strong bodies make everyday life easier.", "We're building something sustainable.", "Consistency beats intensity \u2014 this is the long game."],
    yellow: ["Leave a little energy for the rest of your day.", "We've trimmed today to keep you fresh and consistent.", "You don't need to prove anything today."],
    red: ["A sustainable body knows when to ease off.", "The highest-value movements today, and nothing more.", "Protecting your energy is how this lasts for years."],
    recovery: ["Recovery is where sustainable strength is built.", "A walk and some mobility is a complete, healthy day.", "Rest today so you can enjoy moving tomorrow."],
  },
  strength: {
    green: ["Technique first. Strength follows.", "Excellent control. Now let's grow from here.", "Progress is measured one workout at a time."],
    yellow: ["We've kept your main lifts and trimmed the rest.", "Smart training protects the big lifts on lighter days.", "Strength is earned through patience \u2014 today counts."],
    red: ["Just the highest-value lifts today. That's real training.", "Come back stronger \u2014 backing off today is strategy, not weakness.", "Strong women aren't built by grinding through every day."],
    recovery: ["Strength is built through recovery as much as training.", "Your muscles grow on days like today.", "Rest is part of the program, and it's making you stronger."],
  },
  move: {
    green: ["You made it here today. That's enough to begin.", "Small steps become strong habits.", "Movement is an act of caring for yourself."],
    yellow: ["You don't have to do everything. Just this next movement.", "This counts. Every bit of it counts.", "Showing up is the whole win today."],
    red: ["The hardest part was showing up, and you already did.", "One or two gentle movements is a complete day here.", "This counts. You kept your momentum alive."],
    recovery: ["A walk and some breathing is a real, complete day.", "Moving gently forward is exactly the point.", "You kept going. That's the strongest thing you can do."],
  },
}

const phaseFor = (progId, week) => {
  const phases = PROGRAM_PHASES[progId]
  if (!phases) return null
  return phases.find((ph) => week >= ph.weeks[0] && week <= ph.weeks[1]) || phases[phases.length - 1]
}

// Coaching voice bank \u2014 calm, encouraging, never intimidating.
const COACH_LINES = {
  green: ["You're building strength one controlled movement at a time.", "Strong, steady, and in control. This is your day.", "Quality before speed \u2014 every rep counts."],
  yellow: ["We've trimmed today so you can still show up well.", "Protecting your energy is part of getting stronger.", "Enough is enough today. You're still moving forward."],
  red: ["Showing up differently still counts.", "The simplest version today keeps your streak of caring for yourself alive.", "This is exactly what a strong week looks like on a hard day."],
  recovery: ["Rest is part of progress, not a break from it.", "Your body rebuilds on days like today.", "Gentle movement today makes tomorrow's stronger."],
}

// ============ AI COACH FOUNDATION LAYER ============
// Reusable coach data per exercise. Specific exercises can override; everything else gets
// sensible defaults built from the exercise's own cue + how steps. Future video plugs into `demo`.
const COACH_OVERRIDES = {
  "Chair squat": { intro: "Let's start with the chair squat \u2014 the safest way to learn to squat well.", mistakes: ["Collapsing straight down instead of sitting back", "Letting the knees cave inward", "Using momentum to bounce off the chair"], encourage: ["That's it \u2014 controlled and strong.", "Beautiful. Sit back, drive up.", "You're learning the pattern that changes everything."] },
  "Bodyweight squat": { intro: "The bodyweight squat is your foundation. Master this and everything else follows.", mistakes: ["Heels lifting off the floor", "Rounding the lower back", "Not reaching a comfortable depth"], encourage: ["Strong and steady.", "Push the floor away \u2014 there you go.", "Every rep is teaching your body."] },
  "Leg press": { intro: "The leg press lets you build real leg strength with full support.", mistakes: ["Locking the knees hard at the top", "Letting the knees cave in", "Going so deep your hips tuck under"], encourage: ["Smooth and controlled.", "Strong legs are being built right now.", "Press through the whole foot \u2014 lovely."] },
  "Dumbbell Romanian deadlift": { intro: "The Romanian deadlift teaches the hinge \u2014 one of the most useful movements you'll ever learn.", mistakes: ["Rounding the back instead of hinging", "Bending the knees too much (that's a squat)", "Letting the weights drift away from the legs"], encourage: ["Feel those hamstrings \u2014 that's the work.", "Hips back, chest proud. Perfect.", "This is the move that protects your back for life."] },
  "Glute bridge": { intro: "The glute bridge wakes up the muscles that support your whole body.", mistakes: ["Pushing through the toes instead of the heels", "Arching the lower back to get higher", "Rushing the reps"], encourage: ["Squeeze at the top \u2014 hold it.", "Those glutes are switching on beautifully.", "Slow and strong beats fast every time."] },
  "Hip thrust machine": { intro: "The hip thrust is the single best move for building glute strength.", mistakes: ["Overextending the lower back at the top", "Chin lifting up instead of tucked", "Short, partial range of motion"], encourage: ["Full lockout, ribs down \u2014 gorgeous.", "This is where strength gets built.", "One second squeeze. You've got it."] },
  "Chest press machine": { intro: "The chest press builds upper-body strength with full support and control.", mistakes: ["Locking the elbows hard", "Flaring the elbows too wide", "Pressing too fast"], encourage: ["Control down, drive up.", "Strong press \u2014 that's it.", "Your upper body is getting stronger every set."] },
  "Lat pulldown": { intro: "The lat pulldown builds the back strength that gives you posture and confidence.", mistakes: ["Leaning back too far", "Pulling with the arms instead of the back", "Bringing the bar behind the neck"], encourage: ["Lead with the elbows \u2014 feel your back work.", "Tall and strong.", "Beautiful pull. Squeeze and release slow."] },
  "Seated row machine": { intro: "The seated row builds a strong back and healthy shoulders.", mistakes: ["Hunching the shoulders up", "Using momentum to yank the weight", "Pulling to the wrong spot"], encourage: ["Pull to your ribs, squeeze.", "Mid-back doing the work \u2014 perfect.", "Posture strength, right here."] },
  "Dead bug": { intro: "The dead bug teaches your deep core to stay stable \u2014 the foundation of all strength.", mistakes: ["Letting the lower back arch off the floor", "Holding the breath", "Moving too fast"], encourage: ["Low back stays down \u2014 there you go.", "Slow and controlled is the whole point.", "This quiet work builds real strength."] },
  "Bird dog": { intro: "The bird dog builds the stability that protects your back and steadies your whole body.", mistakes: ["Letting the hips rock side to side", "Arching the back", "Rushing the reach"], encourage: ["Reach long, stay level.", "Beautiful control.", "This is strength you'll feel in everything."] },
  "Modified plank": { intro: "The plank teaches your whole core to brace and hold \u2014 quality over seconds.", mistakes: ["Letting the hips sag", "Lifting the hips too high", "Holding the breath"], encourage: ["One straight line \u2014 perfect.", "Breathe and brace.", "Stop while it still feels strong."] },
  "Full plank": { intro: "The full plank is total-core strength. Every second counts when the form is right.", mistakes: ["Hips sagging toward the floor", "Shoulders creeping up to the ears", "Holding past good form"], encourage: ["Squeeze everything \u2014 strong line.", "Quality over seconds, always.", "You're stronger than last week."] },
}

// Dynamic coach data for ANY exercise. The Guided player calls this.
const coachData = (ex) => {
  const o = COACH_OVERRIDES[ex.name] || {}
  return {
    intro: o.intro || `Here's ${ex.name.toLowerCase()}. ${ex.cue}`,
    setup: ex.how || [],
    cue: ex.cue,
    mistakes: o.mistakes || ["Rushing the reps instead of controlling them", "Holding your breath \u2014 keep it steady", "Losing your form to add weight too soon"],
    encourage: o.encourage || ["You're building strength one controlled movement at a time.", "Strong and steady \u2014 that's the work.", "Quality before speed. You've got this."],
    demo: null, // future: { videoUrl, poster } plugs in here per exercise
    hasVideo: false,
  }
}

const PROG_BY_ID = (id) => PROGRAMS.find((p) => p.id === id) || PROGRAMS[0]

// Deterministic schedule: days since program start -> week + weekday -> workout type
const progSchedule = (prog, startISO) => {
  const start = startISO ? new Date(startISO + "T00:00:00") : new Date()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const dayNum = Math.max(0, Math.floor((today - start) / 86400000))
  const rawWeek = Math.floor(dayNum / 7) + 1 // counts up; can exceed prog.weeks (triggers completion)
  const week = Math.min(rawWeek, prog.weeks) // clamp for schedule/phase lookups
  const weekday = (today.getDay() + 6) % 7
  const type = prog.split[weekday]
  return { week, rawWeek, weekday, type, totalWeeks: prog.weeks, complete: rawWeek > prog.weeks }
}

// Capacity -> today's version (label, minutes, note)
// ============ COACH INSIGHT CARD ============
// Dynamic, rotating coaching notes. Title changes by capacity; message explains WHY today's
// recommendation makes sense. Rotated daily via dayIndex so users don't see the same line repeatedly.
const COACH_INSIGHT_TITLE = { green: "Today's Opportunity", yellow: "Today's Focus", red: "Today's Support", recovery: "Today's Recovery" }

const COACH_INSIGHTS = {
  green: [
    "Your body has the energy to build today. This is a great opportunity to make real progress while still respecting tomorrow.",
    "You're in Green today — energy is here and your body is ready to work. Let's use today's capacity wisely and finish feeling strong, not spent.",
    "Green means your body has recovered well and has room to build. A good day to show up fully and give today's session your energy.",
    "You've got capacity to build today. Meet it with intention — strong, controlled work now is what tomorrow's strength is made of.",
  ],
  yellow: [
    "You're running a little lower today. This session is trimmed to keep your momentum moving forward without draining what you have.",
    "Yellow means you're functioning, but running low. We'll protect your progress with a simpler session and let you keep the habit alive.",
    "A little less in the tank today, and that's okay. Today is about maintaining — showing up gently still moves you forward.",
    "You're steady but not at full charge. This lighter session keeps you consistent while leaving something for the rest of your day.",
  ],
  red: [
    "Today isn't about pushing harder. Small, intentional movement supports recovery and makes it easier to come back stronger tomorrow.",
    "Red means your reserves are low. We've kept only the highest-value movement so you can move a little and still protect your energy.",
    "This is a gentle day by design. A short, simple session honors where you are and keeps the thread of your routine unbroken.",
    "Low capacity is information, not failure. Today's movement is light on purpose — enough to feel good, never enough to set you back.",
  ],
  recovery: [
    "Your body is asking for recovery today. Rest isn't losing progress — it's how progress continues. Taking care of yourself today makes tomorrow possible.",
    "Today your body needs restoration, not a workout. Gentle movement or rest is exactly the right choice, and it's part of the plan.",
    "Recovery is the work today. Let yourself slow down — this is how your body rebuilds and comes back stronger.",
    "You're depleted, and that deserves care, not pressure. Rest, breathe, move gently if you like. Tomorrow will meet you where you are.",
  ],
}

// Optional history-aware opener: if the same body area was trained very recently, acknowledge recovery.
const bodyAreaOf = (title) => { const t = (title || "").toLowerCase(); if (t.includes("lower") || t.includes("leg") || t.includes("glute")) return "lower body"; if (t.includes("upper")) return "upper body"; if (t.includes("full")) return "full body"; return null }

const CAP_VERSION = {
  green: { label: "Full session", mins: [40, 55], note: "You have room today \u2014 this is the full workout, at full volume." },
  yellow: { label: "Shortened", mins: [25, 32], note: "Because today is a Yellow day, we shortened the workout, reduced volume, and removed the finisher." },
  red: { label: "Movement only", mins: [12, 18], note: "Because today is a Red day, this is a short, gentle movement session. Showing up is the whole win." },
}

const RECOVERY_OPTIONS = [
  { key: "mobility", icon: "\ud83e\uddd8\u200d\u2640\ufe0f", name: "10-minute mobility", mins: "10 min", how: ["Slow neck and shoulder circles, both directions.", "Cat-cow on hands and knees, 10 slow rounds.", "Hip circles and gentle lunges to open the hips.", "Move only where it feels good \u2014 nothing forced."] },
  { key: "stretch", icon: "\ud83c\udf3f", name: "Gentle stretching", mins: "8-10 min", how: ["Hold each stretch 30 seconds, breathing slow.", "Hamstrings, hip flexors, chest, and lower back.", "Never bounce; ease deeper on each exhale.", "This is care, not a workout."] },
  { key: "walk", icon: "\ud83d\udeb6\u200d\u2640\ufe0f", name: "Easy walk", mins: "10-20 min", how: ["Flat, easy pace \u2014 you could chat the whole time.", "Outside if you can, for the light and air.", "No pace goal. Movement is the only point.", "Come home feeling better than you left."] },
  { key: "breath", icon: "\ud83c\udf2c\ufe0f", name: "Breathwork & reset", mins: "5 min", how: ["Breathe in for 4, out for 8, for two minutes.", "The long exhale calms your nervous system.", "Then sit quietly for a few breaths.", "This counts. Rest is training too."] },
]

export { WO_TYPES, CAPACITY_RULES, ALL_PROGRAMS, WORKOUT_TEMPLATES, PROGRAM_SCHEDULE, PROGRESSION, CAPACITY_SLOT_RULE, buildSession, resolveSession, PROGRAMS, COMPLETION, PROGRAM_PHASES, PROGRAM_COACH_LINES, phaseFor, COACH_LINES, COACH_OVERRIDES, coachData, PROG_BY_ID, progSchedule, COACH_INSIGHT_TITLE, COACH_INSIGHTS, bodyAreaOf, CAP_VERSION, RECOVERY_OPTIONS }
