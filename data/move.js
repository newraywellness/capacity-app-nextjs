// ============ MOVE ============
// True Reverie no longer builds guided programs — Move is a small, curated
// discovery surface. Every idea is tagged the same way Flourish's projects
// are: mood / time / category / capacity, so nothing here needs to change
// shape when real personalization (or Rebuilds) arrives later. `category`
// intentionally reuses the exact vocabulary the future preference list needs
// (Pilates, Dance, Strength, Walking, Yoga, Gym, Running, Cycling, Barre,
// Mobility, Outdoors) — one list, not two that could drift.
//
// DELIBERATELY SMALL. The brief is explicit: fewer specific, desirable ideas
// beat dozens of generic ones. This is architecture, not the library.

const MOODS = ["Feel strong", "Get out of my head", "Dance", "Stretch", "Sweat", "Calm down", "Move without thinking", "Get outside"]
const TIMES = [
  { key: "5 min", ic: "\u26a1" },
  { key: "10 min", ic: "\ud83d\udd52" },
  { key: "15 min", ic: "\ud83d\udd53" },
  { key: "30 min", ic: "\ud83d\udd54" },
  { key: "I've got time", ic: "\ud83c\udf24\ufe0f" },
]
const CATEGORIES = ["Pilates", "Dance", "Strength", "Walking", "Yoga", "Gym", "Running", "Cycling", "Barre", "Mobility", "Outdoors"]

// The three zones are a suggestion, never a gate — Mood/Quick Moves/Explore
// below are never filtered by capacity, only this one section is.
const CAPACITY_ZONES = {
  red: { label: "Red", line: "Gentler, lower-demand movement may fit today." },
  yellow: { label: "Yellow", line: "Moderate, feel-good movement is often a good fit." },
  green: { label: "Green", line: "You may want to use the energy you have for something longer, stronger, sweatier, or more challenging." },
}

const MOVE_IDEAS = [
  { id: "dance-one-song", emoji: "\ud83d\udc83", title: "Dance It Out", hook: "One song, full volume, curtains closed. That's the whole workout.",
    mood: ["Dance", "Move without thinking"], time: ["5 min"], category: ["Dance"], capacity: ["red", "yellow", "green"], creator: null },
  { id: "slow-flow-yoga", emoji: "\ud83e\uddd8\u200d\u2640\ufe0f", title: "Slow Flow, Then Nothing", hook: "A gentle yoga sequence that ends in five minutes of doing absolutely nothing.",
    mood: ["Calm down", "Stretch"], time: ["15 min"], category: ["Yoga"], capacity: ["red", "yellow"], creator: null },
  { id: "walk-no-destination", emoji: "\ud83c\udf3f", title: "Walk With No Destination", hook: "No podcast, no pace to hit \u2014 just you, moving, and noticing things.",
    mood: ["Get out of my head", "Get outside"], time: ["30 min", "I've got time"], category: ["Walking", "Outdoors"], capacity: ["red", "yellow", "green"], creator: null },
  { id: "pilates-shake", emoji: "\ud83c\udf00", title: "Pilates 'Til It Shakes", hook: "A mat flow that gets your abs shaking in the best possible way.",
    mood: ["Feel strong", "Sweat"], time: ["15 min"], category: ["Pilates"], capacity: ["yellow", "green"], creator: null },
  { id: "barre-burnout", emoji: "\ud83e\ude70", title: "Barre Burnout", hook: "The kind where your legs are jelly by the last set. Worth it.",
    mood: ["Feel strong", "Sweat"], time: ["30 min"], category: ["Barre"], capacity: ["green"], creator: null },
  { id: "heavy-lift", emoji: "\ud83c\udfcb\ufe0f\u200d\u2640\ufe0f", title: "Go Heavy Today", hook: "Find the weight that scares you a little, and lift it anyway.",
    mood: ["Feel strong"], time: ["I've got time"], category: ["Strength", "Gym"], capacity: ["green"], creator: null },
  { id: "easy-spin", emoji: "\ud83d\udeb2", title: "Easy Spin, Wandering Mind", hook: "Just enough resistance to feel your legs move while your mind goes quiet.",
    mood: ["Move without thinking", "Get out of my head"], time: ["15 min", "30 min"], category: ["Cycling"], capacity: ["yellow", "green"], creator: null },
  { id: "five-min-stretch", emoji: "\ud83c\udf38", title: "Five Minutes, No Goal", hook: "Pure stretch. No timer pressure, no target \u2014 just what feels good.",
    mood: ["Stretch", "Calm down"], time: ["5 min"], category: ["Mobility"], capacity: ["red", "yellow", "green"], creator: null },
  { id: "proper-run", emoji: "\ud83c\udfc3\u200d\u2640\ufe0f", title: "The Run You'll Be Glad You Did", hook: "Not a jog you're enduring \u2014 a real run you actually look forward to finishing.",
    mood: ["Sweat", "Feel strong"], time: ["30 min", "I've got time"], category: ["Running"], capacity: ["green"], creator: null },
  { id: "shake-it-out", emoji: "\u2728", title: "Shake It Out", hook: "One song of arms, hips, whatever wants to move. No choreography required.",
    mood: ["Dance", "Move without thinking"], time: ["5 min"], category: ["Dance"], capacity: ["red", "yellow"], creator: null },
  { id: "golden-hour-walk", emoji: "\ud83c\udf05", title: "Golden Hour Walk", hook: "A slow lap of the neighborhood while the light does something beautiful.",
    mood: ["Calm down", "Get outside"], time: ["30 min"], category: ["Walking", "Outdoors"], capacity: ["red", "yellow"], creator: null },
  { id: "sit-all-day-mobility", emoji: "\ud83e\uddcf\u200d\u2640\ufe0f", title: "For the Parts That Sit All Day", hook: "A short mobility flow for hips, spine, and shoulders that have had enough of your desk.",
    mood: ["Stretch"], time: ["10 min"], category: ["Mobility"], capacity: ["red", "yellow", "green"], creator: null },
  { id: "nicole-pilates", emoji: "\ud83c\udf00", title: "Pilates Strength Flow", hook: "A Pilates-forward strength session, led by Move With Nicole.",
    mood: ["Feel strong"], time: ["15 min"], category: ["Pilates"], capacity: ["yellow", "green"], creator: "Move With Nicole" },
  { id: "jo-walk", emoji: "\ud83d\udc83", title: "Dance-Walk Workout", hook: "A walking workout that sneaks in real movement \u2014 led by growwithjo.",
    mood: ["Move without thinking", "Dance"], time: ["30 min"], category: ["Walking"], capacity: ["yellow", "green"], creator: "growwithjo" },
]

// Two example creators only — UI foundation for a future curated partner
// list. No scraped or embedded content, no fabricated links: url stays null
// until a real, permitted destination exists.
const CREATORS = [
  { name: "Move With Nicole", ic: "\ud83e\uddd8\u200d\u2640\ufe0f", blurb: "Pilates-inspired strength, low-impact and genuinely joyful.", url: null },
  { name: "growwithjo", ic: "\ud83c\udf31", blurb: "Walking workouts that don't feel like a workout.", url: null },
]

const byMood = (m) => MOVE_IDEAS.filter((i) => i.mood.indexOf(m) >= 0)
const byTime = (t) => MOVE_IDEAS.filter((i) => i.time.indexOf(t) >= 0)
const byCategory = (c) => MOVE_IDEAS.filter((i) => i.category.indexOf(c) >= 0)
const byCapacity = (zone) => MOVE_IDEAS.filter((i) => i.capacity.indexOf(zone) >= 0)
const M_BY_ID = (id) => MOVE_IDEAS.find((i) => i.id === id) || null

export { MOVE_IDEAS, MOODS, TIMES, CATEGORIES, CAPACITY_ZONES, CREATORS, byMood, byTime, byCategory, byCapacity, M_BY_ID }
