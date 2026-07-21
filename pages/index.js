import { useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://gidezdugmwtemohkkeyr.supabase.co"
const SUPABASE_KEY = "sb_publishable_bmt_uXzHvBlMTBpvkkRJPA_VpsEfPnp"
const db = createClient(SUPABASE_URL, SUPABASE_KEY)

const BASE = {
  bg: "#FDF7F4", bg2: "#FAF0EC", surface: "#FFFFFF", surface2: "#F6E9E7",
  border: "rgba(42,21,34,0.13)", cream: "#2A1522", creamDim: "#4E2C40",
  taupe: "#8C6577", terracotta: "#D9749B", terracottaDeep: "#C25A84",
}
const THEMES = {
  none: { accent: BASE.terracotta, glow: "217,116,155", tint: "rgba(217,116,155,0.08)", label: "", range: "", word: "" },
  red: { accent: "#D65C4E", glow: "214,92,78", tint: "rgba(214,92,78,0.10)", label: "Red Day", range: "0–35%", word: "Survive · stabilize · simplify" },
  yellow: { accent: "#D08F2E", glow: "208,143,46", tint: "rgba(208,143,46,0.12)", label: "Yellow Day", range: "36–70%", word: "Steady progress, protect tomorrow" },
  green: { accent: "#7FA054", glow: "127,160,84", tint: "rgba(127,160,84,0.12)", label: "Green Day", range: "71–100%", word: "Plan · grow · build" },
}
const colorFromPct = (p) => (p <= 35 ? "red" : p <= 70 ? "yellow" : "green")
const FACTORS = ["Poor sleep", "Interrupted sleep", "Stress", "Work demands", "Parenting", "Hormonal changes", "Anxiety", "Mental load", "Illness", "Grief or loss"]
const SUPPORTS = ["Rest", "Food", "Water", "Quiet", "Connection", "Movement", "Time outside", "Saying no", "Slowing down"]
const QUOTES = {
  red: "Capacity is not character. A Red Day means your system needs support, not pressure.",
  yellow: "Most of life is not lived on Green Days. The goal is to do enough — not everything.",
  green: "Use the energy you have wisely. Build on the good days without spending tomorrow's energy.",
  none: "Stop expecting Green Day performance on Red Day energy.",
}

const SHARE_TRUE = ["Tired", "Overwhelmed", "Anxious", "Emotionally full", "Fine but low energy", "Good but busy"]
const SHARE_NEED = ["Patience", "Help with the kids", "Quiet time", "No heavy conversations", "Teamwork", "Affection", "Just awareness"]
const SHARE_LEVELS = {
  red: { emoji: "🔴", label: "Red — survival mode", short: "Red" },
  yellow: { emoji: "🟡", label: "Yellow — functional but limited", short: "Yellow" },
  green: { emoji: "🟢", label: "Green — resourced & present", short: "Green" },
}

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
const WO_TYPES = [
  { key: "full", label: "Full Body", icon: "\u2728" },
  { key: "legs", label: "Legs", icon: "🦵" },
  { key: "glutes", label: "Glutes", icon: "🍑" },
  { key: "upper", label: "Upper", icon: "💪" },
  { key: "walk", label: "Walk", icon: "🚶\u200d\u2640\ufe0f" },
]
const HERO_GRAD = {
  red: "linear-gradient(135deg, #E0705F 0%, #C34A3B 100%)",
  yellow: "linear-gradient(135deg, #E3A94E 0%, #C07E20 100%)",
  green: "linear-gradient(135deg, #93B061 0%, #66883E 100%)",
}
const demoLink = (name) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " form how to")
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
// Movement pattern = the reusable unit. Each holds level-tiered exercise options with equipment + subs + cues.
const MOVEMENTS = [
  { id: "squat", group: "Lower Body Strength", pattern: "Squat", purpose: "Leg strength, glute development, everyday movement ability.",
    programs: ["foundations", "strength", "balanced", "mama"],
    levels: {
      beginner: [
        { name: "Goblet squat", equip: ["Dumbbell", "Kettlebell"], home: "Hold any weighted object (jug, backpack)", gym: "Dumbbell or kettlebell", cue: "Chest tall, sit between your hips, drive through your heels." },
        { name: "Box squat", equip: ["Bodyweight", "Bench"], home: "Squat to a sturdy chair", gym: "Squat to a box/bench", cue: "Touch the box lightly, don't crash down." },
        { name: "Leg press", equip: ["Machine"], home: "Sub goblet squat", gym: "Leg press machine", cue: "Feet mid-platform, lower to about 90 degrees." },
      ],
      intermediate: [
        { name: "Front squat", equip: ["Barbell", "Dumbbells"], home: "Dumbbell front-racked squat", gym: "Barbell front squat", cue: "Elbows high, brace hard, stay upright." },
        { name: "Hack squat", equip: ["Machine"], home: "Sub goblet squat", gym: "Hack squat machine", cue: "Control the descent, full range you own." },
      ],
      advanced: [
        { name: "Barbell back squat", equip: ["Barbell"], home: "Sub heavy goblet squat", gym: "Barbell + rack", cue: "Brace, sit, drive. Bar path straight over midfoot." },
      ],
    },
    capacity: { green: "Full sets at programmed load.", yellow: "Drop 1 set, keep the load.", red: "Bodyweight or light goblet, 2 easy sets.", recovery: "Skip loading; do slow bodyweight sit-to-stands if any." },
  },
  { id: "hinge", group: "Lower Body Strength", pattern: "Hinge", purpose: "Hamstrings, glutes, and posterior-chain strength.",
    programs: ["foundations", "strength", "balanced"],
    levels: {
      beginner: [
        { name: "Dumbbell Romanian deadlift", equip: ["Dumbbells"], home: "Dumbbells or a loaded backpack", gym: "Dumbbells", cue: "Push hips back, soft knees, feel the hamstrings." },
        { name: "Hip hinge drill", equip: ["Bodyweight", "Dowel"], home: "Broomstick along your back", gym: "Dowel hinge drill", cue: "Hips move back, spine stays long." },
      ],
      intermediate: [
        { name: "Barbell Romanian deadlift", equip: ["Barbell"], home: "Heavy dumbbell RDL", gym: "Barbell RDL", cue: "Bar stays close, hips hinge, squeeze to stand." },
        { name: "Trap bar deadlift", equip: ["Trap bar"], home: "Dumbbell deadlift", gym: "Trap bar", cue: "Push the floor away, proud chest." },
      ],
      advanced: [
        { name: "Conventional deadlift", equip: ["Barbell"], home: "Sub heavy dumbbell RDL", gym: "Barbell", cue: "Brace, wedge, push through the whole foot." },
      ],
    },
    capacity: { green: "Full sets at programmed load.", yellow: "Reduce load ~20%, keep form crisp.", red: "Light dumbbell hinge, 2 sets for the pattern.", recovery: "Hip-hinge mobility only." },
  },
  { id: "glute", group: "Lower Body Strength", pattern: "Glute", purpose: "Hip strength and glute development.",
    programs: ["foundations", "strength", "mama", "balanced"],
    levels: {
      beginner: [
        { name: "Glute bridge", equip: ["Bodyweight"], home: "Floor glute bridge", gym: "Bridge or booty-builder machine", cue: "Squeeze at the top for a full second." },
        { name: "Hip thrust machine", equip: ["Machine"], home: "Shoulders-on-couch hip thrust", gym: "Hip thrust machine", cue: "Chin tucked, ribs down, drive hips up." },
      ],
      intermediate: [
        { name: "Barbell hip thrust", equip: ["Barbell", "Bench"], home: "Single-leg hip thrust", gym: "Barbell + bench", cue: "Full lockout, one-second squeeze." },
        { name: "Cable kickback", equip: ["Cable"], home: "Band kickback", gym: "Cable + ankle strap", cue: "Strict, no swinging \u2014 the glute does the work." },
      ],
      advanced: [
        { name: "Heavy hip thrust", equip: ["Barbell"], home: "Sub single-leg variations", gym: "Barbell + pad", cue: "Load it, but never lose the squeeze." },
      ],
    },
    capacity: { green: "Full programmed sets.", yellow: "Keep the main lift, drop accessory volume.", red: "Bodyweight bridges, 2 sets.", recovery: "Gentle glute activation, no load." },
  },
  { id: "hipstab", group: "Lower Body Strength", pattern: "Hip Stability", purpose: "Hip health, stability, and confidence.",
    programs: ["foundations", "mama", "move", "balanced"],
    levels: {
      beginner: [
        { name: "Hip abduction machine", equip: ["Machine"], home: "Band abduction", gym: "Abduction machine", cue: "Push out, pause, resist on the way back." },
        { name: "Band walks", equip: ["Band"], home: "Mini-band walks", gym: "Mini-band walks", cue: "Stay low, tension the whole time." },
      ],
      intermediate: [
        { name: "Step ups", equip: ["Bench", "Dumbbells"], home: "Stair step-ups", gym: "Box + dumbbells", cue: "Drive through the top foot, control down." },
        { name: "Lateral lunges", equip: ["Bodyweight", "Dumbbell"], home: "Bodyweight lateral lunge", gym: "Dumbbell lateral lunge", cue: "Sit into the working hip, chest tall." },
      ],
      advanced: [
        { name: "Loaded step-up variations", equip: ["Dumbbells", "Barbell"], home: "Weighted stair step-ups", gym: "Loaded step-ups", cue: "Own each rep, no bounce." },
      ],
    },
    capacity: { green: "Full sets.", yellow: "Keep it, lighten the load.", red: "Bodyweight band work, 2 sets.", recovery: "Gentle band activation." },
  },
  { id: "legiso", group: "Lower Body Strength", pattern: "Knee/Leg Isolation", purpose: "Targeted lower-body strength.",
    programs: ["foundations", "strength", "balanced"],
    levels: {
      beginner: [
        { name: "Leg extension", equip: ["Machine"], home: "Seated knee extensions (band)", gym: "Leg extension machine", cue: "Squeeze the quad at the top, lower slow." },
        { name: "Hamstring curl", equip: ["Machine"], home: "Band hamstring curl", gym: "Lying/seated curl", cue: "Control both directions." },
        { name: "Calf raise", equip: ["Bodyweight", "Machine"], home: "Stair calf raise", gym: "Calf machine", cue: "Full range, pause at the top." },
      ],
      intermediate: [], advanced: [],
    },
    capacity: { green: "Full sets.", yellow: "Drop 1 set.", red: "Skip isolation, keep the main lift.", recovery: "Skip." },
  },
  { id: "push", group: "Upper Body Strength", pattern: "Push", purpose: "Chest, shoulders, and pressing strength.",
    programs: ["foundations", "strength", "mama", "balanced"],
    levels: {
      beginner: [
        { name: "Chest press machine", equip: ["Machine"], home: "Incline pushup", gym: "Chest press machine", cue: "Handles at mid-chest, no hard lockout." },
        { name: "Incline pushup", equip: ["Bodyweight"], home: "Hands on couch/counter", gym: "Smith bar incline pushup", cue: "Body in one line, lower with control." },
      ],
      intermediate: [
        { name: "Dumbbell press", equip: ["Dumbbells", "Bench"], home: "Floor dumbbell press", gym: "Bench + dumbbells", cue: "Wrists stacked, smooth tempo." },
      ],
      advanced: [
        { name: "Bench press", equip: ["Barbell", "Bench"], home: "Sub heavy dumbbell press", gym: "Barbell bench", cue: "Control down, drive up, shoulder blades pinned." },
      ],
    },
    capacity: { green: "Full sets at load.", yellow: "Drop 1 set.", red: "Incline/wall pushups, 2 sets.", recovery: "Skip pressing." },
  },
  { id: "pull", group: "Upper Body Strength", pattern: "Pull", purpose: "Back strength, posture, and upper-body confidence.",
    programs: ["foundations", "strength", "mama", "balanced"],
    levels: {
      beginner: [
        { name: "Lat pulldown", equip: ["Machine", "Cable"], home: "Band pulldown", gym: "Lat pulldown", cue: "Pull to your collarbone, elbows lead." },
        { name: "Seated row", equip: ["Machine", "Cable"], home: "Band row", gym: "Seated cable row", cue: "Pull to your ribs, squeeze the mid-back." },
      ],
      intermediate: [
        { name: "Dumbbell row", equip: ["Dumbbells", "Bench"], home: "Single-arm dumbbell row", gym: "Bench + dumbbell", cue: "Flat back, drive the elbow up." },
      ],
      advanced: [
        { name: "Pull-ups", equip: ["Bar"], home: "Band-assisted or door-frame rows", gym: "Assisted pull-up machine", cue: "Full hang to chin over bar, no swing." },
      ],
    },
    capacity: { green: "Full sets.", yellow: "Drop 1 set.", red: "Band rows, 2 sets.", recovery: "Gentle band pull-aparts." },
  },
  { id: "shoulder", group: "Upper Body Strength", pattern: "Shoulder", purpose: "Shoulder strength and healthy overhead movement.",
    programs: ["foundations", "strength", "balanced"],
    levels: {
      beginner: [
        { name: "Shoulder press", equip: ["Dumbbells", "Machine"], home: "Seated dumbbell press", gym: "Machine or dumbbells", cue: "Ribs down, press up and slightly back." },
        { name: "Lateral raise", equip: ["Dumbbells"], home: "Light dumbbells or water bottles", gym: "Dumbbells or cable", cue: "Lead with the elbows, no swing." },
      ],
      intermediate: [
        { name: "Rear delt movements", equip: ["Dumbbells", "Cable"], home: "Band rear-delt pull", gym: "Reverse pec deck", cue: "Squeeze the shoulder blades." },
      ],
      advanced: [],
    },
    capacity: { green: "Full sets.", yellow: "Drop 1 set.", red: "Light laterals, 2 sets.", recovery: "Skip." },
  },
  { id: "deepcore", group: "Core & Stability", pattern: "Deep Core / Postpartum", purpose: "Strength, stability, breathing, and confidence \u2014 not just abs.",
    programs: ["mama", "foundations", "move", "balanced"],
    levels: {
      beginner: [
        { name: "360 breathing", equip: ["Bodyweight"], home: "Lying or seated", gym: "Any quiet spot", cue: "Breathe wide into your ribs, gentle exhale draws the core in." },
        { name: "Heel slides", equip: ["Bodyweight"], home: "On the floor", gym: "On a mat", cue: "Ribs down, slide the heel while the core stays quiet." },
        { name: "Dead bug", equip: ["Bodyweight"], home: "On the floor", gym: "On a mat", cue: "Low back stays down the whole time." },
        { name: "Bird dog", equip: ["Bodyweight"], home: "On hands and knees", gym: "On a mat", cue: "Reach long, don't let the hips rock." },
      ],
      intermediate: [], advanced: [],
    },
    capacity: { green: "Full programmed rounds.", yellow: "Fewer rounds, same quality.", red: "Just 360 breathing.", recovery: "Breathing only \u2014 this is perfect recovery work." },
  },
  { id: "corestab", group: "Core & Stability", pattern: "Core Stability", purpose: "Anti-movement strength: bracing, carrying, staying solid.",
    programs: ["foundations", "strength", "balanced"],
    levels: {
      beginner: [
        { name: "Plank variations", equip: ["Bodyweight"], home: "Knee or full plank", gym: "On a mat", cue: "One straight line, squeeze glutes, quality over seconds." },
      ],
      intermediate: [
        { name: "Pallof press", equip: ["Cable", "Band"], home: "Band Pallof press", gym: "Cable Pallof", cue: "Resist the twist, press straight out." },
        { name: "Carries", equip: ["Dumbbells", "Kettlebell"], home: "Loaded backpack carry", gym: "Farmer carry", cue: "Tall and braced, walk with control." },
      ],
      advanced: [],
    },
    capacity: { green: "Full sets.", yellow: "Drop 1 set.", red: "Short plank holds, 2 sets.", recovery: "Skip or gentle breathing." },
  },
  { id: "walk", group: "Conditioning & Movement", pattern: "Walking", purpose: "Low-impact conditioning anyone can do, any day.",
    programs: ALL_PROGRAMS,
    levels: {
      beginner: [
        { name: "Easy walk", equip: ["None"], home: "Outside or in place", gym: "Treadmill", cue: "Conversational pace \u2014 you could chat the whole time." },
        { name: "Incline walk", equip: ["Treadmill"], home: "Find a hill", gym: "Treadmill incline", cue: "Tall posture, let the incline do the work." },
      ],
      intermediate: [], advanced: [],
    },
    capacity: { green: "Longer or brisk intervals.", yellow: "Steady moderate walk.", red: "Short, easy walk.", recovery: "A gentle stroll counts fully." },
  },
  { id: "mobility", group: "Conditioning & Movement", pattern: "Mobility & Recovery", purpose: "Move gently, restore range, calm the system.",
    programs: ALL_PROGRAMS,
    levels: {
      beginner: [
        { name: "Mobility flow", equip: ["Bodyweight"], home: "Open floor space", gym: "Stretch area", cue: "Move only where it feels good \u2014 nothing forced." },
        { name: "Recovery stretch", equip: ["Bodyweight"], home: "On a mat", gym: "Stretch area", cue: "Hold 30 seconds, ease deeper on each exhale." },
      ],
      intermediate: [], advanced: [],
    },
    capacity: { green: "Optional add-on.", yellow: "A short flow to finish.", red: "This becomes the session.", recovery: "This is the whole point today." },
  },
]
const MOVE_GROUPS = ["Lower Body Strength", "Upper Body Strength", "Core & Stability", "Conditioning & Movement"]
const LEVEL_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" }

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

// ============ EXERCISE BANK (populated: Strong Foundations patterns) ============
// EXERCISES[patternId] = { homeBeginner:[], homeEquip:[], gym:[] }. Each exercise:
// { name, sets, reps, cue, how:[steps], ai:true? (AI-coach priority) }
// Reusable across programs; the selection engine picks by environment + level + capacity.
const EXERCISES = {
  squat: {
    homeBeginner: [
      { name: "Sit-to-stand squat", sets: 3, reps: "8-10", ai: true, cue: "Stand up from a chair without using your hands.", how: ["Sit tall at the edge of a sturdy chair.", "Press through your heels to stand all the way up.", "Lower slowly back down with control."] },
      { name: "Chair squat", sets: 3, reps: "10", ai: true, cue: "Tap the chair, don't sit and rest.", how: ["Stand in front of a chair, feet shoulder-width.", "Sit back until you lightly touch the seat.", "Drive up through your heels, chest tall."] },
      { name: "Bodyweight squat", sets: 3, reps: "10-12", ai: true, cue: "Sit between your hips, chest proud.", how: ["Feet shoulder-width, toes slightly out.", "Sit back and down as far as is comfortable.", "Push the floor away to stand tall."] },
    ],
    homeEquip: [
      { name: "Goblet squat", sets: 3, reps: "10", cue: "Hold the weight at your chest, elbows inside knees.", how: ["Hold a dumbbell vertically against your chest.", "Squat down, chest tall, until elbows brush your knees.", "Drive up through your heels."] },
      { name: "Dumbbell squat", sets: 3, reps: "10", cue: "Weights at your sides, controlled.", how: ["Hold a dumbbell in each hand at your sides.", "Squat to a depth you control.", "Stand tall, squeezing your glutes."] },
    ],
    gym: [
      { name: "Leg press", sets: 3, reps: "12", ai: true, cue: "Feet mid-platform, lower to about 90 degrees.", how: ["Sit with feet hip-width on the platform.", "Lower until knees reach about 90 degrees.", "Press out smooth, no hard lockout."] },
      { name: "Goblet squat", sets: 3, reps: "10", cue: "Chest tall, controlled depth.", how: ["Hold a dumbbell at your chest.", "Squat to a depth you control.", "Drive up through the heels."] },
      { name: "Hack squat machine", sets: 3, reps: "10", cue: "Control the descent, own the range.", how: ["Shoulders under the pads, feet mid-platform.", "Lower with control.", "Press up without locking hard."] },
      { name: "Barbell back squat", sets: 4, reps: "6-8", cue: "Brace hard, sit between your hips, drive up.", how: ["Bar on your upper back, hands secure.", "Brace your core, sit down and back.", "Drive through the whole foot to stand. Add weight only when form holds."] },
    ],
  },
  hinge: {
    homeBeginner: [
      { name: "Hip hinge drill", sets: 3, reps: "10", cue: "Hips move back, spine stays long.", how: ["Stand with soft knees, hands on your hips.", "Push your hips straight back, chest leading.", "Squeeze your glutes to stand tall."] },
      { name: "Bodyweight good morning", sets: 3, reps: "10", cue: "Feel the hamstrings, not the low back.", how: ["Hands crossed on your chest, soft knees.", "Hinge forward pushing hips back.", "Rise by squeezing your glutes."] },
      { name: "Glute bridge", sets: 3, reps: "12", ai: true, cue: "Squeeze at the top for a full second.", how: ["Lie on your back, knees bent, feet flat.", "Drive hips up through your heels.", "Squeeze, then lower slowly."] },
    ],
    homeEquip: [
      { name: "Dumbbell Romanian deadlift", sets: 3, reps: "10", ai: true, cue: "Push hips back, weights close to your legs.", how: ["Hold dumbbells in front of your thighs.", "Push hips back, weights sliding down your legs.", "When hamstrings pull, squeeze glutes to stand."] },
    ],
    gym: [
      { name: "Dumbbell Romanian deadlift", sets: 3, reps: "10", ai: true, cue: "Hamstrings load, back stays flat.", how: ["Dumbbells in front, soft knees.", "Hinge hips back until you feel the stretch.", "Stand tall by squeezing your glutes."] },
      { name: "Cable pull-through", sets: 3, reps: "12", cue: "Hips do the work, not your arms.", how: ["Face away from a low cable, rope between legs.", "Hinge hips back, then drive them forward.", "Squeeze glutes at the top."] },
    ],
  },
  glute: {
    homeBeginner: [
      { name: "Glute bridge", sets: 3, reps: "12", ai: true, cue: "Drive through your heels, full squeeze.", how: ["Knees bent, feet flat and close to your hips.", "Lift hips until your body forms a line.", "Squeeze hard, lower slow."] },
      { name: "Single-leg glute bridge", sets: 3, reps: "8/side", cue: "Hips stay level the whole time.", how: ["From a bridge, extend one leg.", "Drive up through the planted heel.", "Keep both hips even. Switch sides."] },
      { name: "Frog pumps", sets: 3, reps: "15", cue: "Soles together, pump from the glutes.", how: ["Soles of feet together, knees wide.", "Drive hips up squeezing your glutes.", "Short, controlled pumps."] },
    ],
    homeEquip: [
      { name: "Dumbbell hip thrust", sets: 3, reps: "10", ai: true, cue: "Chin tucked, ribs down, full lockout.", how: ["Upper back on a couch, dumbbell over hips.", "Drive hips up until level.", "Squeeze one second at the top."] },
      { name: "Banded glute bridge", sets: 3, reps: "15", cue: "Push knees out against the band.", how: ["Band above your knees, bridge position.", "Lift hips while pressing knees outward.", "Squeeze and lower slow."] },
    ],
    gym: [
      { name: "Hip thrust machine", sets: 3, reps: "12", ai: true, cue: "Ribs down, drive to full lockout.", how: ["Set the pad across your hips.", "Drive up until your body is level.", "One-second squeeze at the top."] },
      { name: "Booty builder machine", sets: 3, reps: "12", cue: "Controlled, glute-led reps.", how: ["Position hips against the pad.", "Press up through the glutes.", "Lower with control."] },
      { name: "Cable kickback", sets: 3, reps: "12/side", cue: "Strict, no swinging.", how: ["Ankle strap on the low cable.", "Kick straight back with a glute squeeze.", "Return slowly."] },
    ],
  },
  hipstab: {
    homeBeginner: [
      { name: "Side-lying leg raise", sets: 3, reps: "12/side", cue: "Lift from the hip, don't roll back.", how: ["Lie on your side, legs stacked.", "Raise the top leg with control.", "Lower slowly. Switch sides."] },
      { name: "Standing hip abduction", sets: 3, reps: "12/side", cue: "Stand tall, lift to the side.", how: ["Hold a wall for balance.", "Lift one leg out to the side.", "Control it back down."] },
      { name: "Lateral steps", sets: 3, reps: "10/side", cue: "Stay low, push through the side.", how: ["Half-squat position.", "Step wide to one side, then follow.", "Keep tension the whole time."] },
    ],
    homeEquip: [
      { name: "Band lateral walks", sets: 3, reps: "10/side", cue: "Stay low, tension the whole time.", how: ["Band above your knees, half-squat.", "Step sideways keeping the band tight.", "Don't let your feet snap together."] },
    ],
    gym: [
      { name: "Hip abduction machine", sets: 3, reps: "15", cue: "Push out, pause, resist back.", how: ["Sit tall, pads outside your knees.", "Push out as far as comfortable, pause.", "Resist on the way back in."] },
    ],
  },
  legiso: {
    homeBeginner: [
      { name: "Wall sit", sets: 3, reps: "20-40 sec", cue: "Thighs parallel, breathe.", how: ["Back against a wall, slide to a sit.", "Hold with thighs about parallel.", "Breathe steadily through the hold."] },
      { name: "Standing calf raise", sets: 3, reps: "15", cue: "Full range, pause at the top.", how: ["Rise onto the balls of your feet.", "Pause at the top.", "Lower slowly."] },
      { name: "Hamstring bridge walkout", sets: 3, reps: "10", cue: "Heels walk out, hips stay up.", how: ["From a glute bridge, walk heels out.", "Keep hips lifted as legs extend.", "Walk back in and lower."] },
    ],
    homeEquip: [
      { name: "Slider hamstring curl", sets: 3, reps: "10", cue: "Hips up, curl the heels in.", how: ["Bridge with heels on sliders/towels.", "Curl heels toward you, hips high.", "Extend slowly."] },
    ],
    gym: [
      { name: "Leg extension", sets: 3, reps: "12", cue: "Squeeze the quad at the top.", how: ["Pad on your lower shins.", "Extend to straight, squeeze.", "Lower slow."] },
      { name: "Seated hamstring curl", sets: 3, reps: "12", cue: "Control both directions.", how: ["Pad behind your lower calves.", "Curl down with control.", "Return slowly."] },
      { name: "Seated calf machine", sets: 3, reps: "15", cue: "Full stretch, full squeeze.", how: ["Pads on your thighs, balls of feet on platform.", "Press up to full height.", "Lower for a full stretch."] },
    ],
  },
}

const EXERCISES_UPPER = {
  push: {
    homeBeginner: [
      { name: "Wall pushup", sets: 3, reps: "10-12", ai: true, cue: "Body in one line, control down.", how: ["Hands on the wall, slightly wider than shoulders.", "Lower your chest toward the wall.", "Press back without sagging your hips."] },
      { name: "Incline pushup", sets: 3, reps: "8-10", cue: "Hands on a couch or counter.", how: ["Hands on a raised surface, body straight.", "Lower your chest with control.", "Press back up in one line."] },
      { name: "Knee pushup", sets: 3, reps: "8", cue: "Straight line from knees to head.", how: ["On your knees, hands under shoulders.", "Lower your chest toward the floor.", "Press up, hips level."] },
    ],
    homeEquip: [
      { name: "Dumbbell chest press", sets: 3, reps: "10", cue: "Wrists stacked, smooth tempo.", how: ["Lie on the floor or a bench, dumbbells up.", "Lower until your elbows touch down.", "Press up without locking hard."] },
    ],
    gym: [
      { name: "Chest press machine", sets: 3, reps: "10", ai: true, cue: "Handles at mid-chest, smooth press.", how: ["Adjust the seat so handles sit at mid-chest.", "Press out with control.", "Return over 2-3 seconds."] },
      { name: "Dumbbell bench press", sets: 3, reps: "10", cue: "Control down, drive up.", how: ["Lie on a bench, dumbbells over your chest.", "Lower with control to chest level.", "Press up, shoulder blades pinned."] },
      { name: "Bench press", sets: 4, reps: "6-8", cue: "Control down, drive up, shoulder blades pinned.", how: ["Lie on the bench, grip just outside shoulders.", "Lower the bar to mid-chest with control.", "Press up powerfully. Use a spotter as you get heavier."] },
      { name: "Incline dumbbell press", sets: 3, reps: "8-10", cue: "Bench low incline, press smooth.", how: ["Set the bench to a low incline.", "Press the dumbbells up and slightly together.", "Lower with control to the stretch."] },
    ],
  },
  pull: {
    homeBeginner: [
      { name: "Towel row", sets: 3, reps: "12", cue: "Squeeze the shoulder blades.", how: ["Loop a towel around a sturdy post.", "Lean back, arms straight.", "Pull your chest to your hands, squeezing your back."] },
      { name: "Prone Y-T-W raises", sets: 3, reps: "8 each", cue: "Lift from the upper back.", how: ["Lie face down, arms out in a Y.", "Lift the arms, then move to T, then W.", "Small, controlled lifts."] },
    ],
    homeEquip: [
      { name: "Band row", sets: 3, reps: "12", cue: "Pull to your ribs, squeeze.", how: ["Anchor a band at chest height.", "Pull the handles to your ribs.", "Squeeze your mid-back, release slow."] },
      { name: "Dumbbell row", sets: 3, reps: "10/side", cue: "Flat back, drive the elbow up.", how: ["One hand on a chair, hinge forward.", "Row the dumbbell to your hip.", "Lower with control. Switch sides."] },
    ],
    gym: [
      { name: "Lat pulldown", sets: 3, reps: "10", ai: true, cue: "Pull to your collarbone, elbows lead.", how: ["Grip slightly wider than shoulders.", "Pull the bar to your collarbone.", "Release slowly all the way up."] },
      { name: "Seated row machine", sets: 3, reps: "10", ai: true, cue: "Pull to your ribs, squeeze the mid-back.", how: ["Sit tall, feet braced.", "Pull the handle to your lower ribs.", "Let it back out slowly."] },
    ],
  },
  shoulder: {
    homeBeginner: [
      { name: "Arm circles", sets: 3, reps: "20", cue: "Small, controlled circles.", how: ["Arms out to your sides.", "Make small circles forward, then back.", "Keep your shoulders relaxed."] },
      { name: "Pike progression", sets: 3, reps: "8", cue: "Hips high, gentle head dip.", how: ["Hands and feet down, hips high (upside-down V).", "Bend your elbows to lower your head gently.", "Press back up."] },
      { name: "Wall shoulder taps", sets: 3, reps: "10/side", cue: "Core tight, no rocking.", how: ["Plank position facing the floor.", "Tap one hand to the opposite shoulder.", "Keep your hips still. Alternate."] },
    ],
    homeEquip: [
      { name: "Dumbbell lateral raise", sets: 3, reps: "12", cue: "Lead with the elbows, no swing.", how: ["Light dumbbells at your sides.", "Raise out to shoulder height.", "Lower slowly."] },
    ],
    gym: [
      { name: "Shoulder press machine", sets: 3, reps: "10", cue: "Ribs down, press up and slightly back.", how: ["Adjust the seat, handles at shoulder height.", "Press up without arching your back.", "Lower to ear height with control."] },
    ],
  },
  deepcore: {
    homeBeginner: [
      { name: "360 breathing", sets: 2, reps: "8 breaths", ai: true, cue: "Breathe wide into your ribs.", how: ["Sit or lie comfortably, hands on your ribs.", "Breathe in wide, feeling your ribs expand all around.", "Exhale slowly, gently drawing your core in."] },
      { name: "Dead bug", sets: 3, reps: "8/side", ai: true, cue: "Low back stays down the whole time.", how: ["On your back, arms up, knees bent up.", "Lower one arm and the opposite leg.", "Return and switch, keeping your back flat."] },
      { name: "Bird dog", sets: 3, reps: "8/side", ai: true, cue: "Reach long, don't let your hips rock.", how: ["On hands and knees.", "Reach one arm and the opposite leg out.", "Keep your hips level. Switch sides."] },
      { name: "Heel slides", sets: 3, reps: "10/side", cue: "Ribs down, core quiet.", how: ["On your back, knees bent.", "Slide one heel out along the floor.", "Draw it back without your back arching."] },
    ],
    homeEquip: [], gym: [],
  },
  corestab: {
    homeBeginner: [
      { name: "Modified plank", sets: 3, reps: "20-30 sec", ai: true, cue: "One straight line from knees to head.", how: ["Forearms down, knees on the floor.", "Squeeze glutes, pull your ribs down.", "Hold, breathing steadily."] },
      { name: "Full plank", sets: 3, reps: "20-40 sec", ai: true, cue: "Quality over seconds.", how: ["Forearms down, body in one line.", "Squeeze glutes, brace your core.", "Stop when your hips start to sag."] },
    ],
    homeEquip: [
      { name: "Band Pallof press", sets: 3, reps: "10/side", cue: "Resist the twist, press straight out.", how: ["Band anchored at chest height, at your side.", "Press it straight out from your chest.", "Resist the pull to rotate. Switch sides."] },
    ],
    gym: [
      { name: "Cable Pallof press", sets: 3, reps: "10/side", cue: "Brace, press, resist rotation.", how: ["Cable at chest height, stand side-on.", "Press the handle straight out.", "Hold, resisting the twist. Switch sides."] },
      { name: "Farmer carry", sets: 3, reps: "30 sec", cue: "Tall and braced, walk with control.", how: ["Hold a heavy dumbbell in each hand.", "Stand tall, shoulders back.", "Walk with control, core tight."] },
    ],
  },
  walk: {
    homeBeginner: [
      { name: "Outdoor walk", sets: 1, reps: "15-30 min", cue: "Conversational pace, enjoy it.", how: ["Head outside if you can.", "Walk at a pace where you could chat.", "No pace goal - movement is the point."] },
      { name: "Indoor walking intervals", sets: 1, reps: "15 min", cue: "March, mix in faster bursts.", how: ["March in place or around your home.", "Add a faster minute now and then.", "Keep it light and steady."] },
    ],
    homeEquip: [], gym: [
      { name: "Incline treadmill walk", sets: 1, reps: "20-30 min", cue: "Tall posture, let the incline work.", how: ["Set a gentle incline.", "Walk at a comfortable, purposeful pace.", "Stand tall, relaxed shoulders."] },
      { name: "Bike or elliptical", sets: 1, reps: "20 min", cue: "Steady, easy effort.", how: ["Set an easy resistance.", "Keep a steady rhythm.", "Breathe comfortably throughout."] },
    ],
  },
  mobility: {
    homeBeginner: [
      { name: "Mobility flow", sets: 1, reps: "5-10 min", cue: "Move only where it feels good.", how: ["Slow neck and shoulder circles.", "Cat-cow, hip circles, gentle lunges.", "Nothing forced - just open the body."] },
      { name: "Recovery stretch", sets: 1, reps: "5-8 min", cue: "Hold 30 seconds, breathe.", how: ["Stretch hamstrings, hips, chest, back.", "Hold each for 30 seconds.", "Ease deeper on each exhale."] },
    ],
    homeEquip: [], gym: [],
  },
}

// Merge upper-body patterns into the exercise bank
Object.assign(EXERCISES, EXERCISES_UPPER)
// Program -> which environments/levels it prefers (Strong Foundations = beginner-first, all 3 environments)
const PROGRAM_ENV_DEFAULT = "gym" // user can toggle; Foundations supports homeBeginner/homeEquip/gym
// THE SELECTION ENGINE: Program -> Template -> Pattern -> Equipment -> Level -> Capacity -> Exercise
// Given a pattern id + environment + an index (for variety), return a concrete exercise.
// Program-specific exercise preferences: when a pattern offers multiple options, favor these by name.
const PROGRAM_EXERCISE_PREF = {
  mama: ["360 breathing", "Dead bug", "Bird dog", "Heel slides", "Glute bridge", "Sit-to-stand squat", "Bodyweight squat", "Step ups", "Seated row machine", "Chest press machine", "Lat pulldown", "Farmer carry", "Side-lying leg raise", "Hip abduction machine", "Band row", "Modified plank", "Dumbbell hip thrust"],
  balanced: ["Goblet squat", "Leg press", "Dumbbell Romanian deadlift", "Hip thrust machine", "Lateral lunges", "Step ups", "Chest press machine", "Dumbbell press", "Lat pulldown", "Seated row machine", "Shoulder press", "Farmer carry", "Band Pallof press", "Cable Pallof press", "Full plank", "Dead bug", "Bird dog", "Easy walk", "Mobility flow"],
  strength: ["Barbell back squat", "Goblet squat", "Leg press", "Barbell Romanian deadlift", "Dumbbell Romanian deadlift", "Barbell hip thrust", "Hip thrust machine", "Step ups", "Dumbbell press", "Bench press", "Chest press machine", "Lat pulldown", "Seated row machine", "Dumbbell row", "Shoulder press", "Farmer carry", "Cable Pallof press", "Full plank", "Easy walk"],
  move: ["Easy walk", "Indoor walking intervals", "Chair squat", "Sit-to-stand squat", "Bodyweight squat", "Glute bridge", "Bird dog", "Dead bug", "Band row", "Wall pushup", "Incline pushup", "Step ups", "Band lateral walks", "Farmer carry", "Shoulder press", "Mobility flow", "Recovery stretch", "360 breathing"],
}
const pickExercise = (patternId, env, idx, progId) => {
  const bank = EXERCISES[patternId]
  if (!bank) return null
  // environment fallback chain so every slot always resolves to something
  const chain = env === "homeBeginner" ? ["homeBeginner", "homeEquip", "gym"]
    : env === "homeEquip" ? ["homeEquip", "homeBeginner", "gym"]
    : ["gym", "homeEquip", "homeBeginner"]
  for (const e of chain) {
    if (bank[e] && bank[e].length) {
      const list = bank[e]
      const prefs = PROGRAM_EXERCISE_PREF[progId]
      if (prefs) {
        // favor a preferred exercise in this list; keep idx variety among preferred if several match
        const preferred = list.filter((x) => prefs.includes(x.name)).sort((a, b) => prefs.indexOf(a.name) - prefs.indexOf(b.name))
        if (preferred.length) return preferred[idx % preferred.length]
      }
      return list[idx % list.length]
    }
  }
  return null
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
    if (capKey === "yellow") sets = Math.max(2, sets - 1)
    if (capKey === "red") sets = 2
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
  foundations: { title: "You built your foundation.", weeksWord: "Eight weeks", message: "Eight weeks of showing up for yourself. You learned the movements, built the habit, and got stronger. That's yours to keep.", paths: [["Repeat, a little stronger", "Run Strong Foundations again with more confidence and resistance.", "self"], ["Move into Build Strength", "Progressive lifting for your next chapter.", "strength"], ["Try Balanced Strength", "Strength, mobility, and conditioning for the long run.", "balanced"], ["Choose another path", "Browse all the New Ray programs.", null]] },
  mama: { title: "You're ready for your next chapter.", weeksWord: "Ten weeks", message: "Ten weeks of honoring your body while it rebuilt. You reconnected, grew stronger, and did it with patience. That strength is yours.", paths: [["Repeat Strong Mama Rebuild", "Move through the rebuild again, meeting your body where it is now.", "self"], ["Begin Strong Foundations", "Step into structured strength training with confidence.", "foundations"], ["Begin Balanced Strength", "Strength, mobility, and conditioning for the long run.", "balanced"], ["Choose another path", "Browse all the New Ray programs.", null]] },
  balanced: { title: "Strength is part of your life now.", weeksWord: "Eight weeks", message: "You've built a body that supports your life. Keep growing in the direction that excites you most \u2014 this is a way of living, not a finish line.", paths: [["Repeat Balanced Strength", "Keep the sustainable rhythm going, a little stronger.", "self"], ["Begin Build Strength", "Ready for more? Step into progressive lifting.", "strength"], ["Return to Strong Foundations", "Revisit the fundamentals anytime.", "foundations"], ["Explore another path", "Browse all the New Ray programs.", null]] },
  strength: { title: "Look how far you've come.", weeksWord: "Twelve weeks", message: "You're stronger than when you began \u2014 in more ways than one. Twelve weeks of showing up, lifting with intention, and trusting the process. This strength is yours.", paths: [["Repeat Build Strength", "Run it back with heavier progressive overload.", "self"], ["Move into Balanced Strength", "Shift toward sustainable, balanced training.", "balanced"], ["Return to Strong Foundations", "Revisit the fundamentals anytime.", "foundations"], ["Explore another path", "Browse all the New Ray programs.", null]] },
  move: { title: "You kept moving forward.", weeksWord: "Six weeks", message: "Momentum is one of the strongest things you can build \u2014 and you built it, one gentle day at a time. However busy life got, you kept showing up. That's everything.", paths: [["Repeat Just Move", "Keep your momentum going, gently.", "self"], ["Begin Strong Foundations", "Ready to build? Step into structured strength.", "foundations"], ["Begin Balanced Strength", "Sustainable strength for everyday life.", "balanced"], ["Explore another path", "Browse all the New Ray programs.", null]] },
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

const GLOW_THRESHOLD = { red: 1, yellow: 3, green: 4 }
const REFRAMES = [
  "You're not lazy. You're depleted. There's a difference.",
  "Capacity is not character.",
  "Stop planning every day like it's a good day.",
  "This is a hard season, not a character flaw.",
  "Rest isn't something you earn after everything's done.",
  "Tiny is not nothing. On the hard days, tiny IS the win.",
  "You don't have to wait for an easier season to become her.",
  "You planned for a woman who didn't wake up today. Plan for the one who did.",
  "You can't hate yourself into becoming her. You can only be gentle enough to keep showing up.",
]
const BLOOM_PROMPTS = [
  "The woman I'm becoming is someone who...",
  "What would make today 1% softer?",
  "One thing I want more of, that I've felt guilty for wanting:",
  "What did I do today that counted — even if it was tiny?",
  "Whose voice is my inner critic... and do I want to keep listening to it?",
  "What's one honest 'no' I need to say this week?",
  "What's one small promise I can keep to myself tomorrow?",
]
const RESETS = [
  { name: "The 5-minute space reset", icon: "🏵\ufe0f", how: "Pick ONE spot — the counter, your nightstand. Timer for 5 minutes. Reset only that. One calm corner does some of the calming for you." },
  { name: "Long-exhale breathing", icon: "🌬\ufe0f", how: "Two minutes: breathe in for 4, out for 8. The long exhale is the fastest lever your body has for switching off alarm mode." },
  { name: "Step outside", icon: "\u2600\ufe0f", how: "Ten minutes of daylight, ideally morning. It sets your energy rhythm and quiets the noise. No phone required." },
  { name: "The pretty glass ritual", icon: "🥂", how: "Your water, but in the prettiest glass you own. Tiny sensory pleasures are how ordinary days start feeling beautiful." },
  { name: "Phone down, lights low", icon: "🌙", how: "Pick one wind-down anchor tonight — phone away a little earlier, lights dimmed. Tomorrow begins tonight." },
]
const dayIndex = (len) => { const d = new Date(); return (d.getFullYear() * 366 + Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)) % len }


// ---- Atmosphere engine: environment = f(hour, capacity) ----
const ENV = (hour, color) => {
  const mode = hour >= 5 && hour < 11 ? "morning" : hour >= 11 && hour < 17 ? "afternoon" : "evening"
  const bright = color === "green"
  const quiet = color === "red"
  const bgs = {
    morning: "linear-gradient(180deg,#FFEDD8 0%,#FFE0E4 28%,#F7D8EE 56%,#E6D5F6 100%)",
    afternoon: "linear-gradient(180deg,#FFE3C4 0%,#FFD9D2 30%,#F5D3E8 62%,#E4D0F2 100%)",
    evening: "linear-gradient(180deg,#2E2149 0%,#4A2E5E 40%,#6E3F6E 72%,#8A4E70 100%)",
  }
  // Red softens the current time of day (calmer, more muted) but never forces night while it's daytime.
  const quietBgs = {
    morning: "linear-gradient(180deg,#F6E9E4 0%,#F3E2E8 34%,#EBE0EE 66%,#E2DCEE 100%)",
    afternoon: "linear-gradient(180deg,#F1E4DA 0%,#EEDFE2 34%,#E9DEEC 66%,#E1DAEC 100%)",
    evening: "linear-gradient(180deg,#2E2149 0%,#4A2E5E 40%,#6E3F6E 72%,#8A4E70 100%)",
  }
  const bg = quiet ? quietBgs[mode] : bgs[mode]
  return { mode, bright, quiet, bg, dark: mode === "evening" }
}
const SUGGEST = {
  none: [
    { icon: "water", text: "A glass of water before your next coffee" },
    { icon: "food", text: "Something with protein, whenever breakfast happens" },
    { icon: "heart", text: "One kind thought toward yourself" },
  ],
  red: [
    { icon: "water", text: "A glass of water, slowly" },
    { icon: "heart", text: "Ten quiet minutes that belong to you" },
    { icon: "moon", text: "Permission to do less today" },
  ],
  yellow: [
    { icon: "water", text: "A glass of water before your next coffee" },
    { icon: "food", text: "Something with protein, whenever breakfast happens" },
    { icon: "heart", text: "One kind thought toward yourself" },
  ],
  green: [
    { icon: "water", text: "A glass of water before your next coffee" },
    { icon: "food", text: "Something with protein, whenever breakfast happens" },
    { icon: "move", text: "Movement while the energy is here" },
    { icon: "heart", text: "One kind thought toward yourself" },
  ],
}
const NEXT_STEP = (color, hour) => {
  if (color === "red") return { line: "Rest counts as progress today.", sub: "Chosen for a Red day - recovery is the work" }
  if (color === "green") return hour < 12
    ? { line: "Your full workout, while the tank is full.", sub: "Chosen for a Green day - energy likes to be used" }
    : { line: "Something that moves you forward today.", sub: "Chosen for a Green day - you have room to grow" }
  return hour < 12
    ? { line: "A ten-minute walk, whenever the day allows.", sub: "Chosen for a Yellow day - steady beats intense" }
    : { line: "One meaningful thing, then permission to coast.", sub: "Chosen for a Yellow day - protect your energy" }
}
const SICON = (k, c) => {
  if (k === "water") return <svg width="20" height="24" viewBox="0 0 20 24"><path d="M10 2 C 14 8, 17 12, 17 16 A 7 7 0 1 1 3 16 C 3 12, 6 8, 10 2 Z" fill="none" stroke={c} strokeWidth="1.4" /></svg>
  if (k === "food") return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 13 H 19 A 8 8 0 0 1 3 13 Z" fill="none" stroke={c} strokeWidth="1.4" /><path d="M8 9 C 8 7, 9 7, 9 5 M 13 9 C 13 7, 14 7, 14 5" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" /></svg>
  if (k === "move") return <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="5" r="2.2" fill="none" stroke={c} strokeWidth="1.4" /><path d="M11 7.5 L 11 13 M 11 9 L 6.5 11.5 M 11 9 L 15.5 11 M 11 13 L 7.5 19 M 11 13 L 14.5 19" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" /></svg>
  if (k === "moon") return <svg width="20" height="20" viewBox="0 0 20 20"><path d="M14 2 A 8.5 8.5 0 1 0 18 12 A 6.8 6.8 0 0 1 14 2 Z" fill="none" stroke={c} strokeWidth="1.4" /></svg>
  return <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 17 C 4 12, 2 9, 2 6.5 A 3.6 3.6 0 0 1 10 5 A 3.6 3.6 0 0 1 18 6.5 C 18 9, 16 12, 10 17 Z" fill="none" stroke={c} strokeWidth="1.4" /></svg>
}
const SEASONS = ["Busy professional", "Mom", "Postpartum", "Student", "Caregiver", "Other"]
const HOPES = ["More energy", "Lose weight", "Build strength", "Feel calmer", "Create routines", "Reduce overwhelm"]
const LEVELS = ["Beginner", "Intermediate", "Advanced"]
const EQUIP = ["Home", "Gym", "Both"]
const CYCLEPREF = ["Yes", "No", "Later"]

const ShopItems = [
  { name: "Respectfully, No", price: "$54", blurb: "For the art of the boundary.", url: "https://new-ray-wellness.myshopify.com/products/hoodie-respectfully-no-floral-graphic-pullover" },
  { name: "Out of Office: Nervous System Maintenance", price: "$58", blurb: "A Red Day, worn proudly.", url: "https://new-ray-wellness.myshopify.com/products/minimalist-hoodie-subtle-embossed-text-crew-pullover" },
  { name: "Capacity is not Character", price: "$54", blurb: "The reminder, on your sleeve.", url: "https://new-ray-wellness.myshopify.com/products/capacity-is-not-character-hoodie-new-ray-wellness-motivational-sweatshirt" },
]

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
  const [tmpLen, setTmpLen] = useState("28")
  const [tmpStart, setTmpStart] = useState("")
  // auth UX: guest preview, password recovery, status messages
  const [guest, setGuest] = useState(false)
  const [authView, setAuthView] = useState("welcome")
  const [firstName, setFirstName] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [setupData, setSetupData] = useState(null)
  const [setupStep, setSetupStep] = useState(0)
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
  const [woDone, setWoDone] = useState({})
  const [woOpen, setWoOpen] = useState(null)
  const [woLog, setWoLog] = useState([])
  const [woLogged, setWoLogged] = useState(false)
  const [bodyView, setBodyView] = useState("gym")
  const [progressView, setProgressView] = useState("trends")
  const [moreView, setMoreView] = useState("menu")
  const [glowLog, setGlowLog] = useState({})
  const [bloomNotes, setBloomNotes] = useState({})
  const [ctxOpen, setCtxOpen] = useState(false)
  const [editLife, setEditLife] = useState(null)
  const [programId, setProgramId] = useState(null)
  const [programStart, setProgramStart] = useState(null)
  const [trainView, setTrainView] = useState("home")
  const [whyOpen, setWhyOpen] = useState(false)
  const [detailProgram, setDetailProgram] = useState(null)
  const [libOpen, setLibOpen] = useState(null)
  const [libLevel, setLibLevel] = useState("beginner")
  const [woEnv, setWoEnv] = useState("gym")
  const [recoveryOpen, setRecoveryOpen] = useState(null)
  const [recoveryDone, setRecoveryDone] = useState(false)
  const [woMode, setWoMode] = useState("overview")
  const [guidedIdx, setGuidedIdx] = useState(0)
  const [restLeft, setRestLeft] = useState(0)
  const [lifeMsg, setLifeMsg] = useState("")

  useEffect(() => {
    try { setWoLog(JSON.parse(localStorage.getItem("nr_workout_log") || "[]")) } catch (e) {}
    try { setGlowLog(JSON.parse(localStorage.getItem("nr_glow_log") || "{}")) } catch (e) {}
    try { setBloomNotes(JSON.parse(localStorage.getItem("nr_bloom_notes") || "{}")) } catch (e) {}
    try { const pid = localStorage.getItem("nr_program"); if (pid) setProgramId(pid) } catch (e) {}
    try { const ps = localStorage.getItem("nr_program_start"); if (ps) setProgramStart(ps) } catch (e) {}
    try { const n = localStorage.getItem("nr_name"); if (n) setFirstName(n) } catch (e) {}
    try { const st = localStorage.getItem("nr_setup"); if (st) setSetupData(JSON.parse(st)) } catch (e) {}
  }, [])

  useEffect(() => { checkAuth() }, [])

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
            try { localStorage.setItem("nr_setup", JSON.stringify(sd)) } catch (e) {}
          } else if (p.data.first_name) {
            setFirstName(p.data.first_name)
          }
        }
        await loadHistory(u.id)
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
    })))
    const today = new Date().toISOString().slice(0, 10)
    if (rows.some((d) => d.date === today)) setCheckedIn(true)
  }

  const handleLogin = async () => {
    try {
      const res = await db.auth.signInWithPassword({ email, password })
      if (res.data.user) {
        setUser(res.data.user)
        const p = await db.from("profiles").select("*").eq("id", res.data.user.id).single()
        if (p.data) setProfile(p.data)
        await loadHistory(res.data.user.id)
        setEmail(""); setPassword("")
      }
    } catch (err) { alert("Login failed") }
  }

  const handleSignUp = async () => {
    try {
      const res = await db.auth.signUp({ email, password })
      if (res.data.user) {
        await db.from("profiles").insert([{ id: res.data.user.id, email, has_membership: false }])
        setUser(res.data.user); setEmail(""); setPassword("")
      }
    } catch (err) { alert("Signup failed") }
  }

  const handleLogout = async () => {
    await db.auth.signOut(); setUser(null); setProfile(null); setCheckedIn(false); setHistory([])
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
    await loadHistory(user.id)
  }

  const saveCycle = () => {
    const L = String(Math.max(20, Math.min(45, parseInt(tmpLen) || 28)))
    setCycleLength(L)
    setLastPeriod(tmpStart)
    try {
      window.localStorage.setItem("cap_cycle_length", L)
      window.localStorage.setItem("cap_last_period", tmpStart)
    } catch (e) {}
    setEditCycle(false)
  }

  const buildShareMessage = () => {
    const L = SHARE_LEVELS[shareLevel]
    const lines = [`My capacity today: ${L.emoji} ${L.label}`]
    if (shareTrue.length) lines.push(`What's true for me: ${shareTrue.join(", ")}`)
    if (shareNeed.length) lines.push(`What I need: ${shareNeed.join(", ")}`)
    if (shareContext.trim()) lines.push(shareContext.trim())
    lines.push("— shared via New Ray · The Capacity Method")
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
      <title>The Capacity Method · New Ray Wellness</title>
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
      input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 26px; height: 26px; border-radius: 50%; background: #FFFFFF; cursor: pointer; border: 3px solid var(--accent, #D08560); }
      input[type=range]::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #FFFFFF; cursor: pointer; border: 3px solid var(--accent, #D08560); }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @keyframes breathe { 0%,100% { opacity: .9; } 50% { opacity: 1; } }
      @keyframes drift { 0% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-16px,-12px) rotate(-5deg); } 100% { transform: translate(0,0) rotate(0deg); } }
      @keyframes flicker { 0%,100% { opacity: .35; } 50% { opacity: .95; } }
      @keyframes mistfloat { 0%,100% { transform: translateX(0); } 50% { transform: translateX(18px); } }
      @keyframes twinkle { 0%,100% { opacity: .4; } 50% { opacity: .9; } }
      .fade-in { animation: fadeIn 0.5s ease both; }
      .glow-breathe { animation: breathe 6s ease-in-out infinite; }
    `}</style>
  )

  if (loading) {
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: BASE.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 440, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 46, color: BASE.cream }}>New Ray</div>
        </div>
      </>
    )
  }

  if (recovery) {
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: BASE.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 44, color: BASE.cream, marginBottom: 8 }}>New Ray</div>
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
              <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 54, color: envA.dark ? "#FFF6EC" : "#4A2F45", marginBottom: 2 }}>New Ray</div>
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
            <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 40, color: BASE.cream }}>New Ray</div>
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

  if (user && !setupData) {
    const envS = ENV(new Date().getHours(), null)
    const steps = [
      { key: "season", q: "What season are you in?", opts: SEASONS, multi: false },
      { key: "hopes", q: "What are you hoping New Ray helps with most?", opts: HOPES, multi: true },
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
  const cycleNow = computeCycle(cycleLength, lastPeriod)

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
      const c = computeCycle(cycleLength, lastPeriod, d.date)
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

  const ReportLine = ({ label, value }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <span style={{ fontSize: 13, color: BASE.taupe }}>{label}</span>
      <span style={{ fontSize: 14, color: BASE.cream, fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  )


  const renderContent = () => {
    if (tab === "today") {
      const hour = new Date().getHours()
      const env = ENV(hour, checkedIn ? cur : null)
      const ink = env.dark ? "#F5E9F2" : "#3D2545"
      const mut = env.dark ? "rgba(240,220,240,0.75)" : "#A97FA0"
      const cardBg = env.dark ? "rgba(56,40,84,0.6)" : "rgba(255,255,255,0.62)"
      const cardBd = env.dark ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.85)"
      const nm = (setupData && setupData.name) || ""
      const greetWord = env.mode === "morning" ? "Good morning" : env.mode === "afternoon" ? "Good afternoon" : "Good evening"
      const step = NEXT_STEP(cur, hour)
      const suggs = SUGGEST[checkedIn ? cur : "none"]
      return (
        <div style={{ padding: "10px 20px 0", position: "relative" }}>
          <div className="fade-in" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 28, color: ink }}>{greetWord}{nm ? ", " + nm : ""}</div>
          <div style={{ fontSize: 10, letterSpacing: 2.8, color: mut, textTransform: "uppercase", marginTop: 5 }}>{dateStr}</div>

          <div style={{ marginTop: env.mode === "morning" ? 96 : 34, borderRadius: 22, background: cardBg, border: `1px solid ${cardBd}`, padding: "24px 22px", boxShadow: env.dark ? "0 18px 40px rgba(0,0,0,0.35)" : "0 18px 40px rgba(120,80,130,0.16)", position: "relative" }}>
            {!checkedIn ? (
              <>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: env.dark ? "#F0C879" : "#C9558E" }}>BEFORE ANYTHING ELSE</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: ink, margin: "10px 0 30px", lineHeight: 1.25 }}>How much do you have today?</div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: `${pct}%`, top: -26, transform: "translateX(-50%)", fontSize: 11, fontWeight: 700, color: env.dark ? "#2E2149" : "#C9558E", background: env.dark ? "#F0C879" : "rgba(255,255,255,0.95)", border: env.dark ? "none" : "1px solid rgba(201,85,142,0.3)", borderRadius: 999, padding: "2px 9px", transition: "left 0.1s ease" }}>{pct}%</div>
                  <input type="range" min="0" max="100" step="5" value={pct} onChange={(e) => setPct(+e.target.value)} style={{ width: "100%", background: `linear-gradient(90deg,#E08A8A 0%,#F0C879 50%,#9CC79A 100%)` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: mut, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", marginTop: 8 }}><span>running on empty</span><span>full of energy</span></div>
                <div style={{ fontSize: 11, color: mut, marginTop: 16, lineHeight: 1.55 }}>There is no wrong answer. The whole day shapes itself around this.</div>

                <div onClick={() => setCtxOpen(!ctxOpen)} style={{ marginTop: 18, fontSize: 12, fontWeight: 700, color: env.dark ? "#F0C879" : "#C9558E", cursor: "pointer" }}>{ctxOpen ? "− Hide context" : "+ Add a little context (optional)"}</div>
                {ctxOpen && (
                  <div className="fade-in" style={{ marginTop: 14 }}>
                    <Label>What's affecting you?</Label>
                    <Chips items={FACTORS} selected={factors} onToggle={(v) => toggle(factors, setFactors, v)} />
                    <div style={{ height: 14 }} />
                    <Label>What would support you most?</Label>
                    <Chips items={SUPPORTS} selected={supports} onToggle={(v) => toggle(supports, setSupports, v)} />
                    <div style={{ height: 14 }} />
                    <Label>Today's one thing</Label>
                    <input type="text" value={oneThing} onChange={(e) => setOneThing(e.target.value)} placeholder="The single thing that would make today a success…" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: env.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBd}`, color: ink, fontSize: 13.5, outline: "none" }} />
                  </div>
                )}
                <button onClick={saveCheckin} disabled={saving} style={{ width: "100%", marginTop: 20, padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", fontSize: 14.5, fontWeight: 700, opacity: saving ? 0.6 : 1, boxShadow: "0 8px 22px rgba(168,123,209,0.35)" }}>{saving ? "Setting your day…" : "Set my day"}</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: env.dark ? "#F0C879" : "#C9558E" }}>TODAY IS SET</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: ink, marginTop: 6 }}>{pct}% · {THEMES[cur].label}</div>
                    <div style={{ fontSize: 11, color: mut, marginTop: 3 }}>Nothing else to figure out.</div>
                  </div>
                  <div onClick={() => setCheckedIn(false)} style={{ fontSize: 11, fontWeight: 700, color: mut, cursor: "pointer", textDecoration: "underline" }}>adjust</div>
                </div>
              </>
            )}
          </div>

          {checkedIn && (
            <div className="fade-in" style={{ marginTop: 16, borderRadius: 22, padding: "22px 20px", background: "linear-gradient(135deg,#E984B4 0%,#A87BD1 100%)", boxShadow: "0 14px 32px rgba(168,123,209,0.35)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -34, top: -34, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: "rgba(255,255,255,0.85)" }}>ONE MEANINGFUL NEXT STEP</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 23, color: "#fff", lineHeight: 1.3, margin: "10px 0 6px", position: "relative" }}>{step.line}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.9)", position: "relative" }}>{step.sub}</div>
              <div style={{ marginTop: 14, display: "inline-block", padding: "8px 15px", borderRadius: 999, background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 11, fontWeight: 600 }}>No rush — whenever it happens.</div>
            </div>
          )}

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: ink, margin: "30px 0 12px" }}>Today might feel better with…</div>
          {suggs.map((g, i) => (
            <div key={i} className="fade-in" style={{ borderRadius: 16, background: cardBg, border: `1px solid ${cardBd}`, padding: "16px 17px", marginBottom: 10, display: "flex", alignItems: "center", boxShadow: env.dark ? "0 6px 18px rgba(0,0,0,0.25)" : "0 6px 18px rgba(120,80,130,0.08)" }}>
              <div style={{ width: 36, marginRight: 10, textAlign: "center" }}>{SICON(g.icon, env.dark ? "#F0C879" : "#C9558E")}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15.5, color: ink, lineHeight: 1.45 }}>{g.text}</div>
            </div>
          ))}

          <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: mut, margin: "28px 0 0" }}>New Ray changes with you — morning to evening, full to empty.</div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && !programId && detailProgram) {
      const p = PROG_BY_ID(detailProgram)
      const DAYNAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      const chooseIt = () => { const iso = new Date().toISOString().slice(0,10); setProgramId(p.id); setProgramStart(iso); setDetailProgram(null); try { localStorage.setItem("nr_program", p.id); localStorage.setItem("nr_program_start", iso) } catch (e) {} }
      const Chip = ({ children }) => (<span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 999, background: "rgba(168,123,209,0.1)", color: BASE.creamDim, fontSize: 12, fontWeight: 600, margin: "0 6px 6px 0" }}>{children}</span>)
      const Stat = ({ label, value }) => (<div style={{ flex: "1 0 45%", marginBottom: 12 }}><div style={{ fontSize: 10, letterSpacing: 1.5, color: BASE.taupe, textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 13.5, color: BASE.cream, fontWeight: 600, marginTop: 2 }}>{value}</div></div>)
      const capRows = [["Green", "Full programmed workout.", "#7FA054"], ["Yellow", "Reduced volume while keeping your progress.", "#D08F2E"], ["Red", "Simplified movement to keep consistency.", "#D65C4E"], ["Recovery", "Intentional rest, still connected to the program.", "#A87BD1"]]
      return (
        <div className="fade-in" style={{ padding: "0 0 20px" }}>
          <div style={{ background: p.grad, padding: "20px 20px 26px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
            <div onClick={() => setDetailProgram(null)} style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", cursor: "pointer", marginBottom: 14 }}>{"\u2039 All programs"}</div>
            <div style={{ fontSize: 40, position: "relative" }}>{p.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "#fff", marginTop: 4, position: "relative" }}>{p.name}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.95)", marginTop: 4, position: "relative" }}>{p.promise}</div>
          </div>
          <div style={{ padding: "20px 18px 0" }}>
            <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.65, marginBottom: 22 }}>{p.purpose}</div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>Who this is for</div>
            <div style={{ marginBottom: 22 }}>{p.bestFor.map((b, i) => <Chip key={i}>{b}</Chip>)}</div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>What you will build</div>
            <div style={{ marginBottom: 24 }}>{p.builds.map((b, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: p.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{"\u2713"}</span><span style={{ fontSize: 14, color: BASE.cream }}>{b}</span></div>))}</div>

            <div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <Stat label="Length" value={p.weeks + " weeks"} />
                <Stat label="Experience" value={p.difficulty} />
                <Stat label="Equipment" value={p.equip} />
                <Stat label="Style" value={p.style} />
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 12 }}>Weekly rhythm</div>
            <div style={{ marginBottom: 24 }}>
              {p.split.map((t, i) => { const rest = t === "rest"; const label = rest ? "Recovery" : (WO_TYPES.find((x) => x.key === t) || { label: t }).label; return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: BASE.taupe, width: 30, textTransform: "uppercase" }}>{DAYNAMES[i]}</span>
                  <span style={{ fontSize: 16 }}>{rest ? "🌙" : (WO_TYPES.find((x) => x.key === t) || {}).icon}</span>
                  <span style={{ fontSize: 13.5, color: BASE.cream, fontWeight: 600 }}>{label}</span>
                </div>
              )})}
              <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginTop: 8, textAlign: "center" }}>The pattern repeats each week. The individual workouts come next.</div>
            </div>

            <div style={{ borderRadius: 16, background: "rgba(168,123,209,0.08)", border: "1px solid rgba(168,123,209,0.25)", padding: "18px 18px", marginBottom: 24 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: BASE.cream, lineHeight: 1.5, marginBottom: 14, textAlign: "center" }}>The program stays the same. Today's workout adapts.</div>
              {capRows.map(([k, v, c], i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <span style={{ minWidth: 68, fontSize: 12, fontWeight: 800, color: c }}>{k}</span>
                  <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.45 }}>{v}</span>
                </div>
              ))}
              <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", marginTop: 6 }}>You never fall behind because life happens.</div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>When you finish</div>
            <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 24 }}>Repeat the program stronger, move on to {PROG_BY_ID(p.next).name}, or choose another path. Your progress is always yours.</div>

            <button onClick={chooseIt} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: p.grad, color: "#fff", fontSize: 15.5, fontWeight: 800, boxShadow: "0 10px 26px rgba(120,80,130,0.28)" }}>Choose {p.name}</button>
          </div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && !programId) {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Choose your program</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 22 }}>Pick the journey that feels right for this season of your life. From there, New Ray handles the daily decisions — you choose the destination, we choose today's route.</div>
          {PROGRAMS.map((p) => (
            <div key={p.id} style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: "0 8px 22px rgba(120,80,130,0.12)", border: "1px solid " + BASE.border }}>
              <div style={{ background: p.grad, padding: "20px 20px 18px", position: "relative" }}>
                <div style={{ position: "absolute", right: -24, top: -24, width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
                <div style={{ fontSize: 30, position: "relative" }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 6, position: "relative" }}>{p.name}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13.5, color: "rgba(255,255,255,0.95)", position: "relative", marginTop: 2 }}>{p.promise}</div>
              </div>
              <div style={{ padding: "16px 18px", background: BASE.surface }}>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.cream }}>For:</b> {p.bestFor.slice(0, 2).join(", ")}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.cream }}>Length:</b> {p.weeks} weeks · {p.difficulty}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 14 }}><b style={{ color: BASE.cream }}>Equipment:</b> {p.equip}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setDetailProgram(p.id)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Learn More</button>
                  <button onClick={() => { const iso = new Date().toISOString().slice(0,10); setProgramId(p.id); setProgramStart(iso); try { localStorage.setItem("nr_program", p.id); localStorage.setItem("nr_program_start", iso) } catch (e) {} }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: p.grad, color: "#fff", fontSize: 13, fontWeight: 700 }}>Choose</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && programId && trainView === "home") {
      const prog = PROG_BY_ID(programId)
      const sched = progSchedule(prog, programStart)
      const recovery = pct < 10
      const capKey = recovery ? "recovery" : cur
      const session = buildSession(programId, sched.weekday, capKey)
      const phase = phaseFor(programId, sched.week)
      const _coachBank = (PROGRAM_COACH_LINES[programId] && PROGRAM_COACH_LINES[programId][recovery ? "recovery" : cur]) || COACH_LINES[recovery ? "recovery" : cur] || []
      const coachLine = _coachBank[sched.week % _coachBank.length] || ""
      const version = CAP_VERSION[recovery ? "red" : cur]
      const scheduleKey = (PROGRAM_SCHEDULE[programId] || [])[sched.weekday] || "recovery"
      const isRest = scheduleKey === "recovery"
      const woType2 = session.slots[0] ? session.slots[0].pattern : "walk"
      const typeLabel = session.title
      const mins = version.mins
      const heroGrad = recovery ? "linear-gradient(135deg,#8A6FA8,#5E4578)" : HERO_GRAD[cur]
      const pctThroughWeeks = Math.round((sched.week / prog.weeks) * 100)
      const programComplete = sched.complete
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 24, lineHeight: 1.3, marginBottom: 2 }}>Your body needs today's version of you.</div>
          <div style={{ fontSize: 13, color: BASE.taupe, marginBottom: 16 }}>Let's honor it.</div>

          {phase && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", borderRadius: 14, background: "rgba(127,160,84,0.08)", border: "1px solid rgba(127,160,84,0.25)", marginBottom: 14 }}>
              <div style={{ fontSize: 22 }}>{PROG_BY_ID(programId).emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#6E9E6B", textTransform: "uppercase", fontWeight: 700 }}>Phase {PROGRAM_PHASES[programId] ? PROGRAM_PHASES[programId].indexOf(phase) + 1 : 1} · Week {sched.week}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream }}>{phase.name}</div>
              </div>
            </div>
          )}
          {coachLine && <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15, color: BASE.creamDim, lineHeight: 1.5, marginBottom: 18, paddingLeft: 12, borderLeft: "2px solid #A87BD1" }}>{coachLine}</div>}

          {programComplete ? (() => {
            const done = COMPLETION[programId] || COMPLETION.foundations
            return (
            <div className="fade-in">
              <div style={{ borderRadius: 22, padding: "30px 24px", background: prog.grad, color: "#fff", boxShadow: "0 14px 32px rgba(120,80,130,0.3)", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
                <div style={{ fontSize: 44, position: "relative" }}>{prog.emoji}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, marginTop: 8, position: "relative" }}>{done.title}</div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.94)", lineHeight: 1.6, marginTop: 8, position: "relative" }}>{done.message}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 12 }}>Where to next</div>
              {done.paths.map(([t, d, target], i) => (
                <div key={i} onClick={() => { const tgt = target === "self" ? programId : target; if (tgt) { const iso = new Date().toISOString().slice(0,10); setProgramId(tgt); setProgramStart(iso); try { localStorage.setItem("nr_program", tgt); localStorage.setItem("nr_program_start", iso) } catch (e) {} } else { setProgramId(null); try { localStorage.removeItem("nr_program"); localStorage.removeItem("nr_program_start") } catch (e) {} } }} style={{ padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{t}</div>
                  <div style={{ fontSize: 12, color: BASE.taupe, marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                </div>
              ))}
              <div style={{ height: 20 }} />
            </div>
            )
          })() : (recovery || isRest) ? (
            <>
              <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#B9A0CE,#7E5E9E)", color: "#fff", boxShadow: "0 14px 32px rgba(120,80,130,0.3)", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -28, top: -28, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
                <svg style={{ position: "absolute", right: 22, top: 20, opacity: 0.8 }} width="34" height="34" viewBox="0 0 40 40"><path d="M28 4 A 16 16 0 1 0 36 22 A 12.5 12.5 0 0 1 28 4 Z" fill="#F0E3B8" /></svg>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.8)", position: "relative" }}>TODAY'S VERSION</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, margin: "6px 0 10px", position: "relative" }}>Recovery</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.94)", lineHeight: 1.6, position: "relative" }}>Recovery is part of the program, not a break from it. Your body gets stronger when it has time to rebuild.</div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "0 2px 10px" }}>Choose how to recover</div>
              {RECOVERY_OPTIONS.map((r) => {
                const open = recoveryOpen === r.key
                return (
                  <div key={r.key} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${open ? "#A87BD1" : BASE.border}`, marginBottom: 10, overflow: "hidden" }}>
                    <div onClick={() => setRecoveryOpen(open ? null : r.key)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
                      <span style={{ fontSize: 22 }}>{r.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{r.name}</div>
                        <div style={{ fontSize: 11.5, color: BASE.taupe }}>{r.mins}</div>
                      </div>
                      <span style={{ color: BASE.taupe }}>{open ? "\u2212" : "+"}</span>
                    </div>
                    {open && (
                      <div className="fade-in" style={{ padding: "0 16px 16px" }}>
                        {r.how.map((step, si) => (
                          <div key={si} style={{ display: "flex", gap: 9, marginBottom: 6 }}>
                            <span style={{ minWidth: 18, height: 18, borderRadius: "50%", background: "rgba(168,123,209,0.15)", color: "#A87BD1", fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{si + 1}</span>
                            <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              <button onClick={() => { setRecoveryDone(true) }} style={{ width: "100%", marginTop: 6, padding: 16, borderRadius: 16, border: "none", cursor: "pointer", background: recoveryDone ? "rgba(168,123,209,0.15)" : "linear-gradient(135deg,#B9A0CE,#8A6FA8)", color: recoveryDone ? "#8A6FA8" : "#fff", fontSize: 15.5, fontWeight: 800, boxShadow: recoveryDone ? "none" : "0 10px 26px rgba(138,111,168,0.35)" }}>{recoveryDone ? "Recovery logged \u2713 well done" : "Begin Recovery"}</button>

              <div onClick={() => { setWoColor(cur); setWoType(recovery ? "walk" : "full"); setTrainView("workout") }} style={{ textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", textDecoration: "underline" }}>I want to train today {"\u2192"}</div>
              <div style={{ height: 18 }} />
            </>
          ) : (
            <>
              <div style={{ borderRadius: 22, padding: "24px 22px", background: heroGrad, color: "#fff", boxShadow: `0 14px 32px rgba(${THEMES[cur].glow},0.32)`, position: "relative", overflow: "hidden", marginBottom: 14 }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.13)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.85)" }}>{THEMES[cur].label.toUpperCase()} · {pct}%</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.22)", padding: "4px 11px", borderRadius: 999 }}>{version.label}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.8)", marginTop: 16 }}>TODAY'S VERSION WORKOUT</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, margin: "4px 0 2px", position: "relative" }}>{typeLabel}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", position: "relative" }}>{mins[0]}–{mins[1]} minutes · built for your {pct}% today</div>
              </div>

              <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 3 }}>Today's session</div>
                <div style={{ fontSize: 12.5, color: BASE.creamDim, fontStyle: "italic", marginBottom: 12 }}>{session.focus}</div>
                {session.slots.map((sl, i) => { const m = MOVEMENTS.find((x) => x.id === sl.pattern) || { pattern: sl.pattern, group: "" }; return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < session.slots.length - 1 ? `1px solid ${BASE.border}` : "none" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(168,123,209,0.15)", color: "#A87BD1", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: BASE.cream, fontWeight: 600 }}>{m.pattern}</span>
                    <span style={{ fontSize: 10, color: BASE.taupe, textTransform: "capitalize" }}>{sl.role}</span>
                  </div>
                )})}
                <div style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 10, fontStyle: "italic" }}>Your coach picks the exact exercise for each slot from the movement library.</div>
              </div>

              <button onClick={() => { setWoColor(cur); setWoType(woType2); setTrainView("workout") }} style={{ width: "100%", padding: 18, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 17, fontWeight: 800, boxShadow: "0 10px 26px rgba(168,123,209,0.4)", marginBottom: 14 }}>Start Workout</button>

              <div onClick={() => setWhyOpen(!whyOpen)} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 16px", cursor: "pointer", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>Why today looks different</span>
                  <span style={{ color: BASE.taupe }}>{whyOpen ? "\u2212" : "+"}</span>
                </div>
                {whyOpen && <div className="fade-in" style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginTop: 10 }}>{version.note} No guilt, no falling behind — tomorrow resumes Week {sched.week}.</div>}
              </div>
            </>
          )}

          <div style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 18px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>{prog.emoji}</span>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700 }}>{prog.name}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe }}>Week {sched.week} of {prog.weeks} · Day {sched.weekday + 1}</div>
              </div>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: BASE.surface2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctThroughWeeks}%`, background: prog.grad, borderRadius: 999 }} />
            </div>
            <button onClick={() => setTrainView("week")} style={{ width: "100%", marginTop: 14, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}>View Program</button>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: BASE.taupe, textAlign: "center", lineHeight: 1.5, marginTop: 16 }}>The program is fixed. The daily path inside each program changes with your everyday capacity.</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setTrainView("library")} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>Exercise Library</button>
            <button onClick={() => { setTab("progress"); setProgressView("workouts") }} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>History</button>
            <button onClick={() => { if (confirm("Change your program? Your progress in the current one is kept, but a new program starts today.")) { setProgramId(null); try { localStorage.removeItem("nr_program"); localStorage.removeItem("nr_program_start") } catch (e) {} } }} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>Change Program</button>
          </div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && programId && trainView === "library") {
      const prog = PROG_BY_ID(programId)
      const openMove = libOpen ? MOVEMENTS.find((m) => m.id === libOpen) : null
      if (openMove) {
        const opts = openMove.levels[libLevel] || []
        return (
          <div className="fade-in" style={{ padding: "10px 18px 0" }}>
            <div onClick={() => setLibOpen(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 Movement library"}</div>
            <div style={{ fontSize: 11, letterSpacing: 1.5, color: BASE.taupe, textTransform: "uppercase" }}>{openMove.group}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginTop: 2 }}>{openMove.pattern} Pattern</div>
            <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, margin: "8px 0 18px" }}>{openMove.purpose}</div>

            <div style={{ fontSize: 11, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 8 }}>In these programs</div>
            <div style={{ marginBottom: 20 }}>{openMove.programs.map((pid) => { const pp = PROG_BY_ID(pid); return (<span key={pid} style={{ display: "inline-block", padding: "5px 11px", borderRadius: 999, background: pid === programId ? "rgba(168,123,209,0.18)" : BASE.surface, border: "1px solid " + (pid === programId ? "#A87BD1" : BASE.border), color: BASE.creamDim, fontSize: 11.5, fontWeight: 600, margin: "0 6px 6px 0" }}>{pp.emoji} {pp.name}</span>)})}</div>

            <div style={{ display: "flex", gap: 6, background: BASE.surface2, borderRadius: 999, padding: 4, marginBottom: 16 }}>
              {["beginner", "intermediate", "advanced"].map((lv) => (
                <button key={lv} onClick={() => setLibLevel(lv)} style={{ flex: 1, padding: "8px 4px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: libLevel === lv ? "#fff" : "transparent", color: libLevel === lv ? "#C9558E" : BASE.taupe }}>{LEVEL_LABEL[lv]}</button>
              ))}
            </div>

            {opts.length === 0 ? (
              <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: "1px dashed " + BASE.border, textAlign: "center", color: BASE.taupe, fontSize: 13, lineHeight: 1.6 }}>No {LEVEL_LABEL[libLevel].toLowerCase()} options seeded for this pattern yet. The structure is ready — exercises get added in the next phase.</div>
            ) : opts.map((ex, i) => (
              <div key={i} style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 17px", marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: BASE.cream }}>{ex.name}</div>
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(233,132,180,0.08)", margin: "10px 0" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#C9558E", marginBottom: 3 }}>COACH CUE</div>
                  <div style={{ fontSize: 12.5, color: BASE.cream, lineHeight: 1.5 }}>{ex.cue}</div>
                </div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.creamDim }}>Equipment:</b> {ex.equip.join(", ")}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 4 }}><b style={{ color: BASE.creamDim }}>At home:</b> {ex.home}</div>
                <div style={{ fontSize: 11.5, color: BASE.taupe }}><b style={{ color: BASE.creamDim }}>At the gym:</b> {ex.gym}</div>
                <div style={{ marginTop: 12, height: 90, borderRadius: 10, background: "linear-gradient(135deg,rgba(233,132,180,0.15),rgba(168,123,209,0.15))", display: "flex", alignItems: "center", justifyContent: "center", color: BASE.taupe, fontSize: 11, fontStyle: "italic" }}>Coach demonstration coming soon</div>
              </div>
            ))}

            <div style={{ borderRadius: 14, background: BASE.surface, border: "1px solid " + BASE.border, padding: "14px 16px", margin: "18px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>How it adapts to your capacity</div>
              {["green", "yellow", "red", "recovery"].map((k) => (
                <div key={k} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <span style={{ minWidth: 66, fontSize: 12, fontWeight: 800, color: CAPACITY_RULES[k].color }}>{CAPACITY_RULES[k].label}</span>
                  <span style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.45 }}>{openMove.capacity[k]}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", marginBottom: 18 }}>The movement never disappears when capacity changes — only the version does.</div>
          </div>
        )
      }
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setTrainView("home")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 Today's plan"}</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Movement library</div>
          <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 22 }}>Every workout in New Ray is built from these patterns. One library, five programs — they differ by which movements, levels, and cues they choose.</div>
          {MOVE_GROUPS.map((g) => (
            <div key={g} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#C9558E", textTransform: "uppercase", marginBottom: 10 }}>{g}</div>
              {MOVEMENTS.filter((m) => m.group === g).map((m) => {
                const inProg = m.programs.includes(programId)
                return (
                  <div key={m.id} onClick={() => { setLibOpen(m.id); setLibLevel("beginner") }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 8, cursor: "pointer" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: BASE.cream }}>{m.pattern}</div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2, lineHeight: 1.4 }}>{m.purpose}</div>
                    </div>
                    {inProg && <span style={{ fontSize: 9.5, fontWeight: 700, color: "#7FA054", background: "rgba(127,160,84,0.12)", padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>in {prog.name.split(" ")[prog.name.split(" ").length - 1]}</span>}
                    <span style={{ color: BASE.taupe, fontSize: 18 }}>{"\u203a"}</span>
                  </div>
                )
              })}
            </div>
          ))}
          <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", marginBottom: 18 }}>Architecture ready. Individual exercises and full workouts come in the next phase.</div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && programId && trainView === "week") {
      const prog = PROG_BY_ID(programId)
      const sched = progSchedule(prog, programStart)
      const DAYNAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setTrainView("home")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 Today's plan"}</div>
          <div style={{ borderRadius: 20, padding: "20px 20px", background: prog.grad, color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 96, height: 96, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ fontSize: 28, position: "relative" }}>{prog.emoji}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginTop: 4, position: "relative" }}>{prog.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", position: "relative" }}>Week {sched.week} of {prog.weeks}</div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "0 2px 12px" }}>This week</div>
          {(PROGRAM_SCHEDULE[programId] || prog.split).map((key, i) => {
            const isToday = i === sched.weekday
            const tmpl = WORKOUT_TEMPLATES[key]
            const rest = key === "recovery"
            const simpleNames = { walk: "Walking", "walk+mobility": "Walk + Mobility", "walk+recovery": "Walk + Recovery", "mobility+recovery": "Mobility + Recovery", mobility: "Mobility", conditioning: "Conditioning", recovery: "Recovery" }
            const label = tmpl ? tmpl.title : (simpleNames[key] || "Movement")
            const catIcon = tmpl ? "\ud83c\udfcb\ufe0f" : rest ? "\ud83c\udf19" : key.includes("walk") ? "\ud83d\udeb6" : "\ud83e\uddd8"
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, background: isToday ? "rgba(168,123,209,0.1)" : BASE.surface, border: `1.5px solid ${isToday ? "#A87BD1" : BASE.border}`, marginBottom: 8 }}>
                <div style={{ width: 38, textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: BASE.taupe, textTransform: "uppercase" }}>{DAYNAMES[i]}</div>
                  <div style={{ fontSize: 18, marginTop: 2 }}>{catIcon}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{label}</div>
                  <div style={{ fontSize: 11, color: BASE.taupe }}>{isToday ? "Today · adjusts to your capacity" : rest ? "Rest & rebuild" : tmpl ? tmpl.focus : "Movement & recovery"}</div>
                </div>
                {isToday && <button onClick={() => setTrainView("home")} style={{ padding: "7px 13px", borderRadius: 999, border: "none", cursor: "pointer", background: "#A87BD1", color: "#fff", fontSize: 11.5, fontWeight: 700 }}>Go</button>}
              </div>
            )
          })}

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "22px 2px 12px" }}>How this program grows</div>
          {(PROGRESSION[programId] || []).map((ph, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#C9558E", minWidth: 74 }}>{ph.wk}</div>
              <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{ph.note}</div>
            </div>
          ))}
          <div style={{ borderRadius: 14, background: "rgba(168,123,209,0.08)", border: "1px solid rgba(168,123,209,0.25)", padding: "16px 18px", margin: "18px 0 0", textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16.5, color: BASE.cream, lineHeight: 1.5 }}>The program is fixed. The daily path inside each program changes with your everyday capacity.</div>
            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 8 }}>You never fall behind — you only meet today where it is.</div>
          </div>
          <div style={{ height: 18 }} />
        </div>
      )
    }

    if (tab === "body" && bodyView === "nourish") {
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#F0B77E,#D98A6A)", color: "#fff", boxShadow: "0 14px 32px rgba(200,130,90,0.3)", marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ fontSize: 30 }}>🍽️</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginTop: 6 }}>Nourish</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", lineHeight: 1.5, marginTop: 4 }}>Simple, realistic food support that flexes with your capacity — not another diet to fail.</div>
          </div>
          <div style={{ textAlign: "center", padding: "30px 20px", borderRadius: 18, background: BASE.surface, border: `1px dashed ${BASE.border}` }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: BASE.cream, marginBottom: 8 }}>Coming next</div>
            <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Capacity-based eating support: what to reach for on a Red day, easy protein, real-life meal patterns — all in your nurse's voice, no calorie counting, ever.</div>
          </div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && programId && trainView === "workout") {
      const gymColor = woColor || cur
      const _prog = PROG_BY_ID(programId)
      const _sched = progSchedule(_prog, programStart)
      const _capKey = pct < 10 ? "recovery" : gymColor
      const _phase = phaseFor(programId, _sched.week)
      const _session = buildSession(programId, _sched.weekday, _capKey)
      const _resolved = resolveSession(_session, woEnv, _capKey, _phase, programId)
      const _fallback = { title: _session.title || "Workout", note: _session.focus || "", exercises: [] }
      const wo = (_resolved && _resolved.length)
        ? { title: _session.title, note: _session.focus, exercises: _resolved }
        : _fallback
      const suggestion = cycleNow ? PHASE_SUGGESTION[cycleNow.phase] : null
      const setKey = (i, sx) => woType + "|" + gymColor + "|" + i + "|" + sx
      const toggleSet = (i, sx) => setWoDone((prev) => ({ ...prev, [setKey(i, sx)]: !prev[setKey(i, sx)] }))
      const todayISO = new Date().toISOString().slice(0, 10)
      const weekday = (new Date().getDay() + 6) % 7
      const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekday); weekStart.setHours(0,0,0,0)
      const thisWeek = woLog.filter((w) => new Date(w.date + "T12:00:00") >= weekStart)
      const loggedToday = woLogged || woLog.some((w) => w.date === todayISO)
      const dayDone = (idx) => {
        const d = new Date(weekStart); d.setDate(weekStart.getDate() + idx)
        const iso = d.toISOString().slice(0, 10)
        return woLog.some((w) => w.date === iso)
      }
      const finishWorkout = () => {
        const entry = { date: todayISO, type: woType, color: gymColor }
        const next = [...woLog.filter((w) => w.date !== todayISO), entry]
        setWoLog(next); setWoLogged(true)
        try { localStorage.setItem("nr_workout_log", JSON.stringify(next)) } catch (e) {}
      }
      const totalSets = wo.exercises.reduce((a, e) => a + e.sets, 0)
      const doneSets = wo.exercises.reduce((a, e, i) => a + Array.from({ length: e.sets }).filter((_, sx) => woDone[setKey(i, sx)]).length, 0)
      return (
        <div style={{ padding: "8px 18px 0" }}>
          <div onClick={() => setTrainView("home")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 8 }}>{"\u2039 Today's plan"}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, textAlign: "center", margin: "6px 0 2px" }}>{(WO_TYPES.find((t) => t.key === woType) || {label: "Workout"}).label}</h2>
          <p style={{ textAlign: "center", color: BASE.taupe, fontSize: 12, margin: "0 0 12px" }}>{thisWeek.length} workout{thisWeek.length === 1 ? "" : "s"} this week</p>

          <div style={{ display: "flex", gap: 6, background: BASE.surface2, borderRadius: 999, padding: 4, marginBottom: 10 }}>
            {[["overview", "Overview"], ["guided", "Guided"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setWoMode(k); setGuidedIdx(0) }} style={{ flex: 1, padding: "9px 4px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: woMode === k ? "#fff" : "transparent", color: woMode === k ? "#C9558E" : BASE.taupe, boxShadow: woMode === k ? "0 2px 8px rgba(120,80,130,0.12)" : "none" }}>{lbl === "Guided" ? "\ud83c\udfac Guided" : lbl}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[["homeBeginner", "Home"], ["homeEquip", "Home + weights"], ["gym", "Gym"]].map(([k, lbl]) => (
              <button key={k} onClick={() => setWoEnv(k)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: woEnv === k ? "rgba(168,123,209,0.15)" : BASE.surface, color: woEnv === k ? "#A87BD1" : BASE.taupe, border: `1px solid ${woEnv === k ? "#A87BD1" : BASE.border}` }}>{lbl}</button>
            ))}
          </div>

          {woMode === "guided" ? (() => {
            const ex = wo.exercises[guidedIdx]
            const coach = coachData(ex)
            const encourageLine = coach.encourage[guidedIdx % coach.encourage.length]
            const total = wo.exercises.length
            const exDone = Array.from({ length: ex.sets }).filter((_, sx) => woDone[setKey(guidedIdx, sx)]).length
            const allSetsDone = exDone >= ex.sets
            const completeSet = () => {
              const nextSx = Array.from({ length: ex.sets }).findIndex((_, sx) => !woDone[setKey(guidedIdx, sx)])
              if (nextSx >= 0) { toggleSet(guidedIdx, nextSx); setRestLeft(60) }
            }
            const fmt = (n) => Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0")
            return (
              <div className="fade-in">
                <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
                  {wo.exercises.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < guidedIdx ? "#A87BD1" : i === guidedIdx ? "#E984B4" : BASE.surface2 }} />
                  ))}
                </div>
                <div style={{ textAlign: "center", fontSize: 11, color: BASE.taupe, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>EXERCISE {guidedIdx + 1} OF {total}</div>

                <div style={{ borderRadius: 22, overflow: "hidden", boxShadow: "0 12px 30px rgba(120,80,130,0.16)", marginBottom: 16 }}>
                  <div style={{ height: 200, background: "linear-gradient(135deg,#E984B4,#A87BD1)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.9)" }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto 8px" }}><circle cx="12" cy="7" r="3.2" fill="rgba(255,255,255,0.9)"/><path d="M5 21 C 5 16, 8 14, 12 14 C 16 14, 19 16, 19 21 Z" fill="rgba(255,255,255,0.9)"/></svg>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>YOUR COACH</div>
                      <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>Video demonstration coming soon</div>
                    </div>
                    <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>{encourageLine}</div>
                  </div>
                  <div style={{ padding: "20px 20px", background: BASE.surface }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, color: BASE.cream }}>{ex.name}</div>
                    <div style={{ fontSize: 12.5, color: BASE.creamDim, fontStyle: "italic", lineHeight: 1.5, marginTop: 6 }}>{coach.intro}</div>
                    <div style={{ display: "flex", gap: 20, margin: "12px 0 14px" }}>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#C9558E" }}>{ex.sets}</div><div style={{ fontSize: 10.5, color: BASE.taupe, letterSpacing: 1 }}>SETS</div></div>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#C9558E" }}>{ex.reps}</div><div style={{ fontSize: 10.5, color: BASE.taupe, letterSpacing: 1 }}>REPS</div></div>
                      <div><div style={{ fontSize: 22, fontWeight: 800, color: "#7FA054" }}>{exDone}/{ex.sets}</div><div style={{ fontSize: 10.5, color: BASE.taupe, letterSpacing: 1 }}>DONE</div></div>
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(233,132,180,0.1)", marginBottom: 12 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "#C9558E", letterSpacing: 1, marginBottom: 3 }}>COACH CUE</div>
                      <div style={{ fontSize: 13, color: BASE.cream, lineHeight: 1.5 }}>{coach.cue}</div>
                    </div>
                    <details style={{ marginBottom: 8 }}>
                      <summary style={{ fontSize: 12.5, fontWeight: 700, color: BASE.creamDim, cursor: "pointer" }}>Common mistakes</summary>
                      <div style={{ marginTop: 8 }}>{coach.mistakes.map((mk, mi) => (<div key={mi} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ color: "#D65C4E", fontSize: 12 }}>{"\u2022"}</span><span style={{ fontSize: 12, color: BASE.taupe, lineHeight: 1.5 }}>{mk}</span></div>))}</div>
                    </details>
                    <details style={{ marginBottom: 8 }}>
                      <summary style={{ fontSize: 12.5, fontWeight: 700, color: BASE.creamDim, cursor: "pointer" }}>Modifications & equipment</summary>
                      <div style={{ fontSize: 12, color: BASE.taupe, lineHeight: 1.6, marginTop: 8 }}>Too much today? Do fewer reps or an easier range — the movement still counts. No equipment? Swap for a bodyweight or household version. Use the Home / Gym toggle to switch the whole workout.</div>
                    </details>
                    {ex.how && (
                      <details><summary style={{ fontSize: 12.5, fontWeight: 700, color: BASE.creamDim, cursor: "pointer" }}>How to</summary>
                        <div style={{ marginTop: 8 }}>{ex.how.map((st, hi) => (<div key={hi} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ minWidth: 16, height: 16, borderRadius: "50%", background: "rgba(201,85,142,0.15)", color: "#C9558E", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{hi + 1}</span><span style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.5 }}>{st}</span></div>))}</div>
                      </details>
                    )}
                  </div>
                </div>

                {restLeft > 0 ? (
                  <div className="fade-in" style={{ textAlign: "center", padding: "18px", borderRadius: 16, background: "rgba(168,123,209,0.1)", border: "1px solid rgba(168,123,209,0.3)", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#A87BD1", fontWeight: 700, letterSpacing: 1 }}>REST</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#8A6FA8", margin: "2px 0" }}>{fmt(restLeft)}</div>
                    <div style={{ fontSize: 12, color: BASE.taupe }}>One more set, then you've earned your rest. <span onClick={() => setRestLeft(0)} style={{ color: "#C9558E", fontWeight: 700, cursor: "pointer" }}>Skip</span></div>
                  </div>
                ) : (
                  <button onClick={completeSet} disabled={allSetsDone} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", cursor: allSetsDone ? "default" : "pointer", background: allSetsDone ? "rgba(127,160,84,0.15)" : "linear-gradient(135deg,#E984B4,#A87BD1)", color: allSetsDone ? "#7FA054" : "#fff", fontSize: 15, fontWeight: 800, boxShadow: allSetsDone ? "none" : "0 8px 22px rgba(168,123,209,0.35)", marginBottom: 14 }}>{allSetsDone ? "All sets complete \u2713" : `Complete set ${exDone + 1} of ${ex.sets}`}</button>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setGuidedIdx(Math.max(0, guidedIdx - 1)); setRestLeft(0) }} disabled={guidedIdx === 0} style={{ flex: 1, padding: 13, borderRadius: 12, border: `1px solid ${BASE.border}`, background: "transparent", color: guidedIdx === 0 ? BASE.taupe : BASE.creamDim, cursor: guidedIdx === 0 ? "default" : "pointer", fontSize: 13, fontWeight: 700, opacity: guidedIdx === 0 ? 0.4 : 1 }}>{"\u2039 Previous"}</button>
                  {guidedIdx < total - 1 ? (
                    <button onClick={() => { setGuidedIdx(guidedIdx + 1); setRestLeft(0) }} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "#A87BD1", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{"Next \u203a"}</button>
                  ) : (
                    <button onClick={finishWorkout} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#93B061,#66883E)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Finish {"\u2713"}</button>
                  )}
                </div>
                <div style={{ height: 20 }} />
              </div>
            )
          })() : (
          <>
          <div style={{ padding: "20px 20px", borderRadius: 22, background: HERO_GRAD[gymColor], marginBottom: 16, boxShadow: `0 10px 26px rgba(${THEMES[gymColor].glow},0.35)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{THEMES[gymColor].label} \u00b7 {wo.title}</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", background: "rgba(255,255,255,0.22)", padding: "5px 12px", borderRadius: 999 }}>~{Math.max(15, wo.exercises.length * 6)} min</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: "#FFFFFF", margin: "10px 0 4px", lineHeight: 1.1, position: "relative" }}>{wo.title}</div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.92)", margin: "0 0 14px", lineHeight: 1.5, position: "relative" }}>{wo.note}</p>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.25)", overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${totalSets ? Math.round((doneSets / totalSets) * 100) : 0}%`, background: "#FFFFFF", borderRadius: 999, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", marginTop: 6, fontWeight: 800, position: "relative" }}>{doneSets} / {totalSets} sets complete</div>
          </div>

          {wo.exercises.map((ex, i) => {
            const open = woOpen === i
            const how = ex.how || []
            return (
              <div key={i} style={{ padding: "13px 15px", borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, boxShadow: "0 2px 10px rgba(74,44,56,0.04)" }}>
                <div onClick={() => setWoOpen(open ? null : i)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 14.5, color: BASE.cream, fontWeight: 700 }}>{ex.name}</div>
                    <div style={{ fontSize: 12, color: THEMES[gymColor].accent, fontWeight: 700, whiteSpace: "nowrap" }}>{ex.sets > 1 ? ex.sets + " x " + ex.reps : ex.reps}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 3, lineHeight: 1.45 }}>{ex.cue} <span style={{ color: BASE.terracotta, fontWeight: 700 }}>{open ? "\u2212 close" : "+ how to"}</span></div>
                </div>
                {open && (
                  <div className="fade-in" style={{ marginTop: 10, padding: "11px 13px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}` }}>
                    {how.map((step, si) => (
                      <div key={si} style={{ display: "flex", gap: 9, marginBottom: si === how.length - 1 ? 0 : 7 }}>
                        <span style={{ minWidth: 18, height: 18, borderRadius: "50%", background: THEMES[gymColor].tint, color: THEMES[gymColor].accent, fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{si + 1}</span>
                        <span style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.5 }}>{step}</span>
                      </div>
                    ))}
                    <a href={demoLink(ex.name)} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 11.5, fontWeight: 800, color: BASE.terracotta }}>Watch a demo ↗</a>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {Array.from({ length: ex.sets }).map((_, sx) => {
                    const done = !!woDone[setKey(i, sx)]
                    return (
                      <div key={sx} onClick={() => toggleSet(i, sx)} style={{ width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, background: done ? THEMES[gymColor].accent : "transparent", color: done ? "#FFFFFF" : BASE.taupe, border: `1.5px solid ${done ? THEMES[gymColor].accent : BASE.border}`, transition: "all 0.15s ease" }}>{done ? "\u2713" : sx + 1}</div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {!loggedToday ? (
            <button onClick={finishWorkout} style={{ width: "100%", marginTop: 8, padding: 16, borderRadius: 14, border: "none", cursor: "pointer", background: THEMES[gymColor].accent, color: "#FFFFFF", fontSize: 15, fontWeight: 800 }}>Finish workout {"\u2713"}</button>
          ) : (
            <div className="fade-in" style={{ marginTop: 8, padding: 14, borderRadius: 14, background: THEMES[gymColor].tint, border: `1px solid rgba(${THEMES[gymColor].glow},0.4)`, textAlign: "center", color: THEMES[gymColor].accent, fontSize: 14, fontWeight: 800 }}>Logged for today {"\u2713"} {"\u2014"} that fully counted</div>
          )}

          <p style={{ fontSize: 10.5, color: BASE.taupe, textAlign: "center", margin: "16px 0 0", lineHeight: 1.5 }}>General fitness guidance, not medical advice. Especially if you're postpartum, healing, or managing a condition - move within your provider's guidance.</p>
          </>
          )}
        </div>
      )
    }

    if (tab === "bloom") {
      const todayISO = new Date().toISOString().slice(0, 10)
      const reframe = REFRAMES[dayIndex(REFRAMES.length)]
      const prompt = BLOOM_PROMPTS[dayIndex(BLOOM_PROMPTS.length)]
      const note = bloomNotes[todayISO] || ""
      const saveNote = (v) => {
        const next = { ...bloomNotes, [todayISO]: v }
        setBloomNotes(next)
        try { localStorage.setItem("nr_bloom_notes", JSON.stringify(next)) } catch (e) {}
      }
      return (
        <div className="fade-in" style={{ padding: "8px 18px 0" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, margin: "12px 0 4px" }}>Bloom</h2>
          <p style={{ fontSize: 13, color: BASE.taupe, marginBottom: 18 }}>The mental glow up {"—"} one gentle shift at a time.</p>

          <div style={{ padding: "24px 20px", borderRadius: 22, background: "linear-gradient(135deg, #D9749B 0%, #B44E7C 100%)", marginBottom: 16, boxShadow: "0 10px 26px rgba(217,116,155,0.35)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)", position: "relative" }}>Today's reframe</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 600, color: "#FFFFFF", marginTop: 10, lineHeight: 1.3, position: "relative" }}>{reframe}</div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, marginBottom: 10 }}>Soft resets</div>
          {RESETS.map((r, i) => (
            <div key={i} style={{ padding: "13px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{r.icon} {r.name}</div>
              <div style={{ fontSize: 12, color: BASE.creamDim, marginTop: 4, lineHeight: 1.55 }}>{r.how}</div>
            </div>
          ))}

          <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, margin: "18px 0 8px" }}>Tonight's prompt</div>
          <div style={{ padding: "14px 15px", borderRadius: 14, background: THEMES.none.tint, border: `1px solid rgba(217,116,155,0.3)`, marginBottom: 10 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: BASE.terracottaDeep, lineHeight: 1.4 }}>{prompt}</div>
          </div>
          <textarea value={note} onChange={(e) => saveNote(e.target.value)} placeholder="Write a line or two… it saves as you type." rows={4} style={{ width: "100%", padding: "13px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }} />
          <p style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 8, textAlign: "center" }}>Saved privately on this device.</p>
        </div>
      )
    }

    if (tab === "progress" && progressView === "workouts") {
      const sorted = [...woLog].sort((a, b) => (a.date < b.date ? 1 : -1))
      return (
        <div className="fade-in" style={{ padding: "8px 18px 0" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, margin: "12px 0 6px" }}>Your workouts</h2>
          <p style={{ fontSize: 13, color: BASE.taupe, marginBottom: 20 }}>{woLog.length} logged {"·"} every one counted.</p>
          {!sorted.length ? (
            <div style={{ padding: 24, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.taupe, fontSize: 14, lineHeight: 1.6, textAlign: "center" }}>Finish a workout in the Body tab and it will show up here.</div>
          ) : (
            sorted.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{(WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label}</div>
                  <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 1 }}>{new Date(w.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta }}>{THEMES[w.color] ? THEMES[w.color].label.split(" ")[0] : ""}</span>
              </div>
            ))
          )}
        </div>
      )
    }

    if (tab === "progress" && progressView === "trends") {
      return (
        <div style={{ padding: "8px 18px 0" }} className="fade-in">
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, fontSize: 26, margin: "12px 0 6px" }}>Your capacity over time</h2>
          <p style={{ fontSize: 13, color: BASE.taupe, marginBottom: 22 }}>Patterns, not pressure.</p>
          {!stats ? (
            <div style={{ padding: 24, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.taupe, fontSize: 14, lineHeight: 1.6, textAlign: "center" }}>Once you start checking in each day, your capacity history will grow here — and patterns will start to show.</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140, paddingBottom: 8, borderBottom: `0.5px solid ${BASE.border}` }}>
                {history.map((d, i) => (
                  <div key={i} title={d.pct + "%"} style={{ flex: 1, height: `${d.pct}%`, borderRadius: 3, background: THEMES[d.color].accent, opacity: 0.85 }} />
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "22px 0" }}>
                <Stat label="Average capacity" value={stats.avg + "%"} accent={T.accent} />
                <Stat label="Most common day" value={THEMES[stats.top].label.split(" ")[0]} accent={THEMES[stats.top].accent} />
                <Stat label="Green Days" value={stats.counts.green} accent={THEMES.green.accent} />
                <Stat label="Yellow Days" value={stats.counts.yellow} accent={THEMES.yellow.accent} />
                <Stat label="Red Days" value={stats.counts.red} accent={THEMES.red.accent} />
              </div>

              {report && (
                <div style={{ padding: 22, borderRadius: 18, background: `linear-gradient(160deg, ${BASE.surface}, ${BASE.bg2})`, border: `1px solid ${BASE.border}`, marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 30, color: BASE.cream, textAlign: "center", lineHeight: 1 }}>Your {report.monthName} Report</div>
                  <div style={{ width: 40, height: 2, background: T.accent, margin: "12px auto 18px", borderRadius: 2 }} />
                  {report.empty ? (
                    <p style={{ fontSize: 13, color: BASE.creamDim, textAlign: "center", lineHeight: 1.6 }}>No check-ins yet this month. As you log your days, your {report.monthName} report will appear here.</p>
                  ) : (
                    <>
                      <div style={{ textAlign: "center", marginBottom: 18 }}>
                        <div style={{ fontSize: 11, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1 }}>Average capacity</div>
                        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 600, color: THEMES[colorFromPct(report.avg)].accent }}>{report.avg}%</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                        {[["Green", report.counts.green, THEMES.green.accent], ["Yellow", report.counts.yellow, THEMES.yellow.accent], ["Red", report.counts.red, THEMES.red.accent]].map(([lbl, n, c]) => (
                          <div key={lbl} style={{ flex: 1, textAlign: "center", padding: "12px 4px", borderRadius: 12, background: BASE.surface2 }}>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, color: c }}>{n}</div>
                            <div style={{ fontSize: 11, color: BASE.taupe }}>{lbl} Days</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderTop: `0.5px solid ${BASE.border}`, paddingTop: 14 }}>
                        {report.trigger && <ReportLine label="Most common Red Day trigger" value={report.trigger} />}
                        {report.recovery && <ReportLine label="Strongest recovery factor" value={report.recovery} />}
                        {report.bestPhase && <ReportLine label="Highest-capacity phase" value={PHASES[report.bestPhase].emoji + " " + PHASES[report.bestPhase].name} />}
                      </div>
                      <p style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.65, marginTop: 16, fontStyle: "italic" }}>{report.empty ? "" : (report.counts.green >= report.counts.red ? "You had at least as many Green Days as Red this month — your patterns are leaning steadier. That's worth noticing." : "Red Days outnumbered Green this month. That's information, not failure — it shows where your system needed more support.")}</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )
    }

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
            <Row label="Cycle settings" onClick={() => { setTab("body"); setBodyView("cycle") }} />
          </Group>
          <Group title="New Ray">
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
        <div className="fade-in" style={{ padding: "8px 18px 0" }}>
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
        <div className="fade-in" style={{ padding: "8px 20px 0" }}>
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
        <div className="fade-in" style={{ padding: "8px 20px 0" }}>
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

  return (
    <><Fonts /><GlobalStyle />
      <div style={{ "--accent": T.accent, background: tab === "today" ? envRoot.bg : BASE.bg, transition: "background 0.8s ease", minHeight: "100vh", maxWidth: 440, margin: "0 auto", position: "relative", overflow: "hidden" }}>
        {tab === "today" && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 420, pointerEvents: "none" }}>
            {envRoot.mode === "morning" && (
              <>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 220, background: "linear-gradient(180deg,rgba(240,200,120,0.18),rgba(240,200,120,0))" }} />
                <div style={{ position: "absolute", top: 92, left: "50%", marginLeft: -50, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,#FFE7B8 28%,rgba(255,220,155,0.5) 58%,rgba(255,220,155,0) 76%)", animation: "breathe 6s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: 150, left: -20, right: -20, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.26)", animation: "mistfloat 10s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: 182, left: 70, right: -20, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.2)", animation: "mistfloat 13s ease-in-out infinite" }} />
                <svg style={{ position: "absolute", top: 200, right: 64, opacity: 0.55, animation: "drift 11s ease-in-out infinite" }} width="30" height="23" viewBox="0 0 34 26"><path d="M17 13 C 10 2, 1 4, 3 12 C 4 18, 12 18, 17 13" fill="#C489E0" /><path d="M17 13 C 24 2, 33 4, 31 12 C 30 18, 22 18, 17 13" fill="#E984B4" /></svg>
              </>
            )}
            {envRoot.mode === "afternoon" && (
              <>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 260, background: "linear-gradient(180deg,rgba(240,170,90,0.22),rgba(240,170,90,0))" }} />
                <div style={{ position: "absolute", top: 200, right: -50, width: 190, height: 190, borderRadius: "50%", background: "rgba(255,255,255,0.16)", animation: "mistfloat 12s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: 120, left: 30, width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.7)", animation: "drift 9s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: 260, left: 90, width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.6)", animation: "drift 14s ease-in-out infinite" }} />
              </>
            )}
            {envRoot.mode === "evening" && (
              <>
                <svg style={{ position: "absolute", top: 58, right: 54 }} width="40" height="40" viewBox="0 0 40 40"><path d="M28 4 A 16 16 0 1 0 36 22 A 12.5 12.5 0 0 1 28 4 Z" fill="#F0E3B8" opacity="0.9" /></svg>
                <div style={{ position: "absolute", top: 40, left: 60, color: "#F0C879", fontSize: 9, animation: "twinkle 3s ease-in-out infinite" }}>{"✦"}</div>
                <div style={{ position: "absolute", top: 110, left: 150, color: "#F0C879", fontSize: 7, animation: "twinkle 4.4s ease-in-out infinite" }}>{"✦"}</div>
                <div style={{ position: "absolute", top: 84, right: 130, color: "#F0C879", fontSize: 8, animation: "twinkle 3.7s ease-in-out infinite" }}>{"✦"}</div>
                <div style={{ position: "absolute", top: 210, left: 36, width: 6, height: 6, borderRadius: "50%", background: "#F0C879", boxShadow: "0 0 10px 4px rgba(240,200,121,0.5)", animation: "flicker 3.2s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: 300, right: 44, width: 5, height: 5, borderRadius: "50%", background: "#F0C879", boxShadow: "0 0 9px 3px rgba(240,200,121,0.45)", animation: "flicker 4.6s ease-in-out infinite" }} />
              </>
            )}
          </div>
        )}
        <div style={{ position: "relative", paddingTop: 14 }}>
          {tab === "body" && (
            <div style={{ display: "flex", gap: 8, padding: "6px 18px 0" }}>
              {[["gym", "Train", "\ud83d\udcaa"], ["nourish", "Nourish", "\ud83c\udf7d\ufe0f"], ["cycle", "Cycle", "\ud83c\udf19"]].map(([k, lbl, ic]) => (
                <button key={k} onClick={() => setBodyView(k)} style={{ flex: 1, padding: "10px 4px", borderRadius: 16, cursor: "pointer", fontSize: 12, fontWeight: 700, background: bodyView === k ? T.accent : BASE.surface, color: bodyView === k ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${bodyView === k ? T.accent : BASE.border}` }}><span style={{ fontSize: 16, display: "block", marginBottom: 2 }}>{ic}</span>{lbl}</button>
              ))}
            </div>
          )}
          {tab === "progress" && (
            <div style={{ display: "flex", gap: 8, padding: "6px 18px 0" }}>
              {[["trends", "Trends"], ["workouts", "Workouts"]].map(([k, lbl]) => (
                <button key={k} onClick={() => setProgressView(k)} style={{ flex: 1, padding: 8, borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: progressView === k ? T.accent : BASE.surface, color: progressView === k ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${progressView === k ? T.accent : BASE.border}` }}>{lbl}</button>
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
                <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "6px 2px", background: "transparent", border: "none", cursor: "pointer", opacity: active ? 1 : 0.55 }}>
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
