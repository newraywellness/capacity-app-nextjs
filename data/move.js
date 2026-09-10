// ============ MOVE ============
// Curated movement discovery. Browse first, filters optional.
// Cards can expose a written walkthrough and/or an external creator video.

const MOODS = ["Feel strong", "Get out of my head", "Dance", "Stretch", "Sweat", "Calm down", "Move without thinking", "Get outside"]

const TIMES = [
  { key: "5 min", ic: "⚡" },
  { key: "10 min", ic: "🕒" },
  { key: "15 min", ic: "🕓" },
  { key: "30 min", ic: "🕔" },
  { key: "I've got time", ic: "🌤️" },
]

const CATEGORIES = ["Pilates", "Dance", "Strength", "Walking", "Yoga", "Gym", "Running", "Cycling", "Barre", "Mobility", "Outdoors"]

const CAPACITY_ZONES = {
  red: { label: "Red", line: "Gentler, lower-demand movement may fit today." },
  yellow: { label: "Yellow", line: "Moderate, feel-good movement is often a good fit." },
  green: { label: "Green", line: "You may want something longer, stronger, sweatier, or more challenging." },
}

const MOVE_IDEAS = [
  {
    id: "dance-one-song", emoji: "💃", title: "Dance It Out",
    hook: "One song, full volume, curtains closed. That's the whole workout.",
    mood: ["Dance", "Move without thinking"], time: ["5 min"], category: ["Dance"], capacity: ["red", "yellow", "green"],
    creator: null, videoUrl: null,
    walkthrough: ["Pick one song you already love.", "Give yourself the whole song to move however you want.", "Stop when the song ends. You did enough."]
  },
  {
    id: "slow-flow-yoga", emoji: "🧘‍♀️", title: "Slow Flow, Then Nothing",
    hook: "A gentle yoga sequence that ends in five minutes of doing absolutely nothing.",
    mood: ["Calm down", "Stretch"], time: ["15 min"], category: ["Yoga"], capacity: ["red", "yellow"],
    creator: null, videoUrl: null,
    walkthrough: ["Start with slow cat-cow and shoulder rolls.", "Move through a few gentle lunges and folds.", "Finish lying down for a few quiet minutes."]
  },
  {
    id: "walk-no-destination", emoji: "🌿", title: "Walk With No Destination",
    hook: "No podcast, no pace to hit — just you, moving, and noticing things.",
    mood: ["Get out of my head", "Get outside"], time: ["30 min", "I've got time"], category: ["Walking", "Outdoors"], capacity: ["red", "yellow", "green"],
    creator: null, videoUrl: null,
    walkthrough: ["Step outside without choosing a pace.", "Walk until you feel like turning around.", "Notice five things you would have missed from the car."]
  },
  {
    id: "pilates-shake", emoji: "🌀", title: "Pilates 'Til It Shakes",
    hook: "A mat flow that gets your abs shaking in the best possible way.",
    mood: ["Feel strong", "Sweat"], time: ["15 min"], category: ["Pilates"], capacity: ["yellow", "green"],
    creator: null, videoUrl: null,
    walkthrough: ["Start with dead bugs or toe taps.", "Add bridges and slow leg work.", "Finish with a short plank series, stopping before form falls apart."]
  },
  {
    id: "barre-burnout", emoji: "🩰", title: "Barre Burnout",
    hook: "The kind where your legs are jelly by the last set. Worth it.",
    mood: ["Feel strong", "Sweat"], time: ["30 min"], category: ["Barre"], capacity: ["green"],
    creator: null, videoUrl: null,
    walkthrough: ["Use a chair or counter for balance.", "Alternate small-range squats, calf raises, and leg lifts.", "Keep the movements controlled and take breaks when you need them."]
  },
  {
    id: "heavy-lift", emoji: "🏋️‍♀️", title: "Go Heavy Today",
    hook: "Use the energy you have for a few strong, controlled lifts.",
    mood: ["Feel strong"], time: ["I've got time"], category: ["Strength", "Gym"], capacity: ["green"],
    creator: null, videoUrl: null,
    walkthrough: ["Choose two or three lifts you know well.", "Warm up before your heavier working sets.", "Keep technique clean and leave the gym feeling capable, not wrecked."]
  },
  {
    id: "easy-spin", emoji: "🚲", title: "Easy Spin, Wandering Mind",
    hook: "Just enough resistance to feel your legs move while your mind goes quiet.",
    mood: ["Move without thinking", "Get out of my head"], time: ["15 min", "30 min"], category: ["Cycling"], capacity: ["yellow", "green"],
    creator: null, videoUrl: null,
    walkthrough: ["Start easy for a few minutes.", "Settle into a pace you could maintain without bargaining with yourself.", "Back off for the final two minutes and finish calmer than you started."]
  },
  {
    id: "five-min-stretch", emoji: "🌸", title: "Five Minutes, No Goal",
    hook: "Pure stretch. No target — just what feels good.",
    mood: ["Stretch", "Calm down"], time: ["5 min"], category: ["Mobility"], capacity: ["red", "yellow", "green"],
    creator: null, videoUrl: null,
    walkthrough: ["Roll your shoulders and neck slowly.", "Open your hips and hamstrings without forcing range.", "Finish with one long exhale and call it done."]
  },
  {
    id: "proper-run", emoji: "🏃‍♀️", title: "The Run You'll Be Glad You Did",
    hook: "A real run for the day you want to use your energy.",
    mood: ["Sweat", "Feel strong"], time: ["30 min", "I've got time"], category: ["Running"], capacity: ["green"],
    creator: null, videoUrl: null,
    walkthrough: ["Start easier than you think you need to.", "Settle into a sustainable middle stretch.", "Finish with a few easy minutes instead of stopping abruptly."]
  },
  {
    id: "shake-it-out", emoji: "✨", title: "Shake It Out",
    hook: "One song of arms, hips, whatever wants to move. No choreography required.",
    mood: ["Dance", "Move without thinking"], time: ["5 min"], category: ["Dance"], capacity: ["red", "yellow"],
    creator: null, videoUrl: null,
    walkthrough: ["Put on one song.", "Move every part of you that feels tense or restless.", "When it ends, decide whether you're done or want one more."]
  },
  {
    id: "golden-hour-walk", emoji: "🌅", title: "Golden Hour Walk",
    hook: "A slow lap of the neighborhood while the light does something beautiful.",
    mood: ["Calm down", "Get outside"], time: ["30 min"], category: ["Walking", "Outdoors"], capacity: ["red", "yellow"],
    creator: null, videoUrl: null,
    walkthrough: ["Head outside near sunset if you can.", "Leave the pace goal at home.", "Walk long enough to notice the light change."]
  },
  {
    id: "sit-all-day-mobility", emoji: "🧍‍♀️", title: "For the Parts That Sit All Day",
    hook: "A short mobility flow for hips, spine, and shoulders that have had enough of your desk.",
    mood: ["Stretch"], time: ["10 min"], category: ["Mobility"], capacity: ["red", "yellow", "green"],
    creator: null, videoUrl: null,
    walkthrough: ["Open the chest with slow shoulder circles.", "Move through cat-cow or standing spinal flexion.", "Finish with hip flexor and hamstring stretches."]
  },
  {
    id: "nicole-pilates", emoji: "🌀", title: "Pilates Strength Flow",
    hook: "A Pilates-forward strength session, led by Move With Nicole.",
    mood: ["Feel strong"], time: ["I've got time"], category: ["Pilates"], capacity: ["yellow", "green"],
    creator: "Move With Nicole",
    videoUrl: "https://www.youtube.com/channel/UCEbbyBuyQiHpKiOMj9GFhVw",
    walkthrough: []
  },
  {
    id: "jo-walk", emoji: "💃", title: "Dance-Walk Workout",
    hook: "A walking workout that sneaks in real movement — led by growwithjo.",
    mood: ["Move without thinking", "Dance"], time: ["30 min"], category: ["Walking"], capacity: ["yellow", "green"],
    creator: "growwithjo",
    videoUrl: "https://www.youtube.com/watch?v=yV4jyj8Hr1g",
    walkthrough: []
  },
]

const CREATORS = [
  { name: "Move With Nicole", ic: "🧘‍♀️", blurb: "Pilates-inspired strength, low-impact and joyful.", url: "https://www.youtube.com/channel/UCEbbyBuyQiHpKiOMj9GFhVw" },
  { name: "growwithjo", ic: "🌱", blurb: "Walking workouts that don't feel like a workout.", url: "https://www.youtube.com/channel/UCZUUZFex6AaIU4QTopFudYA" },
]

const byMood = m => MOVE_IDEAS.filter(i => i.mood.includes(m))
const byTime = t => MOVE_IDEAS.filter(i => i.time.includes(t))
const byCategory = c => MOVE_IDEAS.filter(i => i.category.includes(c))
const byCapacity = zone => MOVE_IDEAS.filter(i => i.capacity.includes(zone))
const M_BY_ID = id => MOVE_IDEAS.find(i => i.id === id) || null

export { MOVE_IDEAS, MOODS, TIMES, CATEGORIES, CAPACITY_ZONES, CREATORS, byMood, byTime, byCategory, byCapacity, M_BY_ID }
