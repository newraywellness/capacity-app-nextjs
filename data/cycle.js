const PHASES = {
  menstrual: {
    emoji: "🩸", name: "Menstrual", accent: "#C97B6E",
    thisIsntYou: "Rest is productive. Recovery is part of building capacity — not time taken away from it. Lower energy here isn't you slipping.",
    lookingAhead: "You're in your menstrual phase. Keep your schedule lighter where you can, prioritize warmth, rest, and food, and let \u2018enough\u2019 be enough.",
  },
  follicular: {
    emoji: "🌱", name: "Follicular", accent: "#94AC6E",
    thisIsntYou: "You may notice more steadiness or motivation now. Use it intentionally — and don't expect yourself to feel this way every day. This is a season, not a standard.",
    lookingAhead: "You're in your follicular phase. Often a good window for planning and starting things. Build gently — you don't have to spend it all at once.",
  },
  ovulation: {
    emoji: "☀️", name: "Ovulation", accent: "#E3AC5E",
    thisIsntYou: "This is often a higher-energy window. It can feel like your \u2018real\u2019 self — but every phase is you. Don't set the bar here for all the others.",
    lookingAhead: "You're around your ovulation window. A good time for connection and anything that takes a little more social energy. Enjoy it without overcommitting.",
  },
  luteal: {
    emoji: "🍂", name: "Luteal", accent: "#B98A6E",
    thisIsntYou: "You're not becoming lazy or \u2018less.\u2019 Capacity often dips in this phase. Adjust your expectations — not your worth.",
    lookingAhead: "You're heading into your luteal phase — historically a lower-capacity stretch for many. A good week to protect sleep, lean on protein and hydration, and give yourself extra grace.",
  },
}

const PHASE_ORDER = ["menstrual", "follicular", "ovulation", "luteal"]


// Estimate cycle day + phase from cycle length and last period start date
function computeCycle(cycleLength, lastPeriodISO, when) {
  if (!cycleLength || !lastPeriodISO) return null
  const L = Math.max(20, Math.min(45, parseInt(cycleLength)))
  const start = new Date(lastPeriodISO + "T00:00:00")
  const ref = when ? new Date(when) : new Date()
  const ms = 86400000
  const diff = Math.floor((ref - start) / ms)
  if (isNaN(diff)) return null
  const day = (((diff % L) + L) % L) + 1
  const ovu = Math.max(12, L - 14)
  let phase
  if (day <= 5) phase = "menstrual"
  else if (day < ovu - 1) phase = "follicular"
  else if (day <= ovu + 1) phase = "ovulation"
  else phase = "luteal"
  return { day, phase, length: L }
}

const PHASE_SUGGESTION = { menstrual: "red", follicular: "green", ovulation: "green", luteal: "yellow" }

// ============ CYCLE PHASE PRESENTATION (Phase 1: colors + education) ============
// Reuses computeCycle/PHASES engine; adds the spec's calendar colors + education content.
const CYCLE_PHASES = {
  menstrual: { key: "menstrual", emoji: "🌑", name: "Menstrual Phase", color: "#7E5E9E", soft: "rgba(126,94,158,0.14)", meaning: "Rest, restoration, reflection",
    insight: "Today may be a day to offer yourself extra support.",
    suggestions: ["Hydration", "Nourishing meals", "Gentle movement if you feel like it", "Recovery"],
    message: "Rest is not falling behind.",
    edu: [["What is happening", "Your period has begun as hormone levels are at their lowest. This is the start of a new cycle."], ["What some women notice", "Lower energy, a need for warmth and rest, or cramps. Everyone is different, and however you feel is valid."], ["Movement support", "Gentle movement like walking, mobility, or light strength if it feels good. Rest is equally valid."], ["Nourishment support", "Focus on nourishment, hydration, and comfort. Iron-rich foods can be supportive."], ["Recovery support", "Prioritize sleep and warmth. This is a natural window to slow down."]] },
  follicular: { key: "follicular", emoji: "🌱", name: "Follicular Phase", color: "#6E9E6B", soft: "rgba(110,158,107,0.14)", meaning: "Growth, rebuilding, increasing energy",
    insight: "Your energy may be building. A nice window to start things.",
    suggestions: ["Movement that feels good", "Balanced meals", "Hydration", "Try something new"],
    message: "Build when your body feels ready.",
    edu: [["What is happening", "Estrogen is rising as your body prepares to release an egg. Energy often starts to climb."], ["Energy awareness", "Many women notice more steadiness and motivation. Use it intentionally, without expecting it every day."], ["Training support", "Often a good window to build, add a little, or try something new if you feel ready."], ["Nourishment support", "Balanced meals with protein and colorful carbs support the building energy."]] },
  ovulation: { key: "ovulation", emoji: "☀️", name: "Ovulation Phase", color: "#D8A94E", soft: "rgba(216,169,78,0.16)", meaning: "Connection, confidence, higher energy awareness",
    insight: "Often a higher-energy window. Enjoy it while still listening.",
    suggestions: ["Movement you enjoy", "Connection and social energy", "Hydration", "Protein with meals"],
    message: "Use your energy, while still listening.",
    edu: [["What is happening", "An egg is released and estrogen peaks. This is often the highest-energy point of the cycle."], ["Energy awareness", "You may feel confident and social. Every phase is you, so try not to set the bar only here."], ["Training support", "A natural window for anything that takes a little more energy, if you feel up to it."], ["Recovery support", "Even in a high-energy phase, hydration and rest keep you feeling good."]] },
  luteal: { key: "luteal", emoji: "🌙", name: "Luteal Phase", color: "#5E7FB0", soft: "rgba(94,127,176,0.14)", meaning: "Preparation, slowing down, increased support",
    insight: "Your needs may be shifting. That is information, not failure.",
    suggestions: ["Consistent meals", "Extra hydration", "Protein and satisfying food", "Protect your sleep"],
    message: "Changing needs are information, not failure.",
    edu: [["What is happening", "Progesterone rises as your body prepares for the next cycle. Energy may gradually taper."], ["Support needs", "Many notice a need for more rest, more food, and more grace. This is completely normal."], ["Training considerations", "Movement still feels good for many. Let capacity decide the intensity, not the calendar."], ["Nourishment considerations", "Consistent meals and satisfying nutrition may feel especially supportive right now."]] },
}

const CYCLE_PHASE_ORDER = ["menstrual", "follicular", "ovulation", "luteal"]

export { PHASES, PHASE_ORDER, computeCycle, PHASE_SUGGESTION, CYCLE_PHASES, CYCLE_PHASE_ORDER }
