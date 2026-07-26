import { useState, useEffect, useMemo, useRef } from 'react'
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
// ============ NOURISH DATA (Phase 1: structure, not deep content) ============
const NOURISH_CAP = {
  green: { emoji: "🟢", label: "Green Day", dayTitle: "Today is a build day.", line: "I have time and energy to support myself.",
    focusList: ["Protein with each meal", "Hydration throughout the day", "Fuel your movement", "Prepare a little for tomorrow"],
    prep: "Full prep welcome", reminder: "Great day to cook a little extra for tomorrow.",
    cards: [{ emoji: "🥤", title: "Hydration", body: "Aim for water with every meal and around movement." }, { emoji: "🥩", title: "Protein idea", body: "Build a plate around a palm or two of protein." }, { emoji: "🍠", title: "Easy meal", body: "Protein + a colorful carb + something green." }, { emoji: "🛒", title: "Prep ahead", body: "Cook one extra portion for tomorrow's easy day." }] },
  yellow: { emoji: "🟡", label: "Yellow Day", dayTitle: "Today is a support day.", line: "I can make intentional choices, but I need simplicity.",
    focusList: ["Simple balanced meals", "Enough protein", "Reduce decision fatigue", "Prepare one thing ahead"],
    prep: "Light prep", reminder: "Simple still counts. Reach for what's already easy.",
    cards: [{ emoji: "🥤", title: "Hydration", body: "Keep a water bottle where you'll see it." }, { emoji: "🥩", title: "Protein idea", body: "Rotisserie chicken, Greek yogurt, or eggs." }, { emoji: "🍠", title: "Easy meal", body: "One good plate is enough. Protein first." }, { emoji: "🛒", title: "Prep ahead", body: "Prep just one thing you'll be glad to have." }] },
  red: { emoji: "🔴", label: "Red Day", dayTitle: "Today is nourish-and-survive.", line: "I need nourishment with minimal effort.",
    focusList: ["Easiest protein option", "Hydration", "Convenient support", "Zero guilt"],
    prep: "No cooking needed", reminder: "Fed is the goal today. That is enough.",
    cards: [{ emoji: "🥤", title: "Hydration", body: "Water or electrolytes. Even a few sips help." }, { emoji: "🥩", title: "Protein idea", body: "Protein shake, jerky, cheese, or a yogurt cup." }, { emoji: "🍠", title: "Easy meal", body: "Assembled, not cooked. Anything counts today." }, { emoji: "🛒", title: "Support", body: "Convenience food is real food. Use it kindly." }] },
  recovery: { emoji: "🌙", label: "Recovery Day", dayTitle: "Today is restoration.", line: "My body needs gentle support.",
    focusList: ["Gentle, nourishing meals", "Hydration", "Recovery support", "Extra care"],
    prep: "Gentle & easy", reminder: "Water, protein, and rest. Your body is rebuilding.",
    cards: [{ emoji: "🥤", title: "Hydration", body: "Warm or cold, keep fluids steady today." }, { emoji: "🥩", title: "Protein idea", body: "Soup with protein, eggs, or a smoothie." }, { emoji: "🍠", title: "Gentle meal", body: "Easy-to-digest, comforting, nourishing." }, { emoji: "🌙", title: "Rest", body: "Nourishment and rest are the same work today." }] },
}
const FOOD_PATHS = [
  { id: "strength", emoji: "✨", name: "Build Strength", tag: "Support muscle growth and training.", grad: "linear-gradient(135deg,#E984B4,#A54E86)",
    goal: "Give your body the material and fuel it needs to build strength and recover well.",
    focus: ["Protein consistency across the day", "Strength and training support", "Recovery nutrition after sessions"],
    macros: [{ name: "Protein", note: "Your building material." }, { name: "Carbs", note: "Your training fuel." }, { name: "Fats", note: "Your support system." }, { name: "Calories", note: "Your body's energy supply." }],
    grocery: { Protein: ["Chicken", "Greek yogurt", "Eggs", "Lean beef", "Protein powder"], Carbs: ["Rice", "Potatoes", "Oats", "Fruit"], Fats: ["Olive oil", "Avocado", "Nuts"], Produce: ["Leafy greens", "Peppers", "Berries"], Convenience: ["Rotisserie chicken", "Pre-cooked rice", "Protein bars"] },
    prep: [{ cap: "Low-capacity week", note: "Prep one protein and one easy carb." }, { cap: "Medium week", note: "Prep 2-3 meal components to mix and match." }, { cap: "High-capacity week", note: "Batch cook proteins and carbs, create variety." }] },
  { id: "fatloss", emoji: "🌱", name: "Fat Loss Support", tag: "Sustainable nutrition while keeping your strength.", grad: "linear-gradient(135deg,#9CC79A,#6E9E6B)",
    goal: "Learn how to create a supportive energy balance while keeping your strength and energy. Not about being smaller.",
    focus: ["Protein to protect muscle and stay full", "Fullness with volume and fiber", "Portions that feel sustainable", "Habits you can keep for good"],
    macros: [{ name: "Protein", note: "Protects muscle and keeps you full." }, { name: "Carbs", note: "Fuel your workouts and your day." }, { name: "Fats", note: "Support hormones and satisfaction." }, { name: "Calories", note: "A gentle, supportive balance, not a punishment." }],
    grocery: { Protein: ["Chicken", "Fish", "Greek yogurt", "Eggs", "Tofu"], Carbs: ["Potatoes", "Rice", "Fruit", "Beans"], Fats: ["Avocado", "Olive oil", "Nuts (portioned)"], Produce: ["Big leafy greens", "Broccoli", "Berries", "Cucumbers"], Convenience: ["Pre-portioned proteins", "Frozen veg", "Rice pouches"] },
    prep: [{ cap: "Low-capacity week", note: "One protein, one carb, plenty of easy produce." }, { cap: "Medium week", note: "Prep protein and a big batch of veg for volume." }, { cap: "High-capacity week", note: "Build a few balanced meals you actually look forward to." }] },
  { id: "mama", emoji: "🤱", name: "Strong Mama", tag: "Support postpartum recovery and busy seasons.", grad: "linear-gradient(135deg,#F0B7D4,#C97BA8)",
    goal: "Support recovery, energy, and rebuilding with realistic meals that fit real motherhood.",
    focus: ["Recovery-supporting nutrition", "Realistic, one-handed-friendly meals", "Steady energy through the day", "Hydration, especially if nursing"],
    macros: [{ name: "Protein", note: "Rebuilds tissue and supports recovery." }, { name: "Carbs", note: "Energy for the demands of the day." }, { name: "Fats", note: "Support hormones and healing." }, { name: "Calories", note: "Enough fuel, especially if nursing." }],
    grocery: { Protein: ["Eggs", "Greek yogurt", "Rotisserie chicken", "Cottage cheese"], Carbs: ["Oats", "Fruit", "Toast", "Rice"], Fats: ["Nut butter", "Avocado", "Olive oil"], Produce: ["Pre-washed greens", "Frozen berries", "Baby carrots"], Convenience: ["Protein shakes", "Cheese sticks", "Pre-cut fruit"] },
    prep: [{ cap: "Low-capacity week", note: "Snacks you can eat one-handed. Protein wherever possible." }, { cap: "Medium week", note: "Prep a couple of grab-and-go proteins." }, { cap: "High-capacity week", note: "Batch a soup or two you can freeze in portions." }] },
  { id: "energy", emoji: "⚡", name: "Energy", tag: "Balanced meals, hydration, and daily energy.", grad: "linear-gradient(135deg,#F0C879,#D8A94E)",
    goal: "Keep steady energy through consistent, balanced meals and good hydration.",
    focus: ["Balanced meals with all three macros", "Hydration through the day", "Consistent fueling, not skipping"],
    macros: [{ name: "Protein", note: "Steadies blood sugar and fullness." }, { name: "Carbs", note: "Your main, quick energy source." }, { name: "Fats", note: "Slow, lasting energy." }, { name: "Calories", note: "Enough, consistently, to feel good." }],
    grocery: { Protein: ["Eggs", "Chicken", "Yogurt", "Beans"], Carbs: ["Oats", "Rice", "Fruit", "Whole grain bread"], Fats: ["Nuts", "Avocado", "Olive oil"], Produce: ["Bananas", "Greens", "Peppers"], Convenience: ["Trail mix", "Yogurt cups", "Fruit"] },
    prep: [{ cap: "Low-capacity week", note: "Keep easy balanced snacks on hand." }, { cap: "Medium week", note: "Prep breakfast and one balanced lunch." }, { cap: "High-capacity week", note: "Set up balanced meals across the week." }] },
  { id: "simple", emoji: "🏡", name: "Simple Nourishment", tag: "Realistic, low-complexity meals for real life.", grad: "linear-gradient(135deg,#C6A3E0,#8A5EB0)",
    goal: "Support does not have to be complicated. Nourish yourself with the least friction possible.",
    focus: ["The easiest supportive choice", "Protein + something else, that's it", "No rules, no complexity", "Kindness over perfection"],
    macros: [{ name: "Protein", note: "Pick the easiest one available." }, { name: "Carbs", note: "Whatever's simple and on hand." }, { name: "Fats", note: "They come along naturally, don't overthink." }, { name: "Calories", note: "Enough to feel okay. That's the whole goal." }],
    grocery: { Protein: ["Rotisserie chicken", "Eggs", "Greek yogurt", "Canned tuna"], Carbs: ["Microwave rice", "Bread", "Fruit"], Fats: ["Cheese", "Nut butter"], Produce: ["Bagged salad", "Baby carrots", "Frozen veg"], Convenience: ["Frozen meals", "Protein shakes", "Pre-cut everything"] },
    prep: [{ cap: "Low-capacity week", note: "No prep. Buy things that need zero cooking." }, { cap: "Medium week", note: "Prep one single thing if you have it in you." }, { cap: "High-capacity week", note: "Even now, keep it simple. Simple is the point." }] },
]
const GROCERY_CATS = [["Protein", "🥩"], ["Carbs", "🍠"], ["Fats", "🥑"], ["Produce", "🥦"], ["Convenience", "🧺"]]
const MACROS = [
  { emoji: "🥩", name: "Protein", supports: ["Muscle repair", "Strength", "Fullness", "Recovery"] },
  { emoji: "🍠", name: "Carbohydrates", supports: ["Energy", "Training performance", "Brain function"] },
  { emoji: "🥑", name: "Fats", supports: ["Hormones", "Nutrient absorption", "Satisfaction"] },
  { emoji: "🔥", name: "Calories", supports: ["Understanding energy balance", "Maintenance", "Gaining", "Losing"] },
]
// Supplements populated (education, not medical advice). Ordered: protein + creatine first (closest to Train).
const SUPPLEMENTS = [
  { emoji: "🥛", name: "Protein Powder", what: "A convenient concentrated protein source, usually from whey (milk) or plant blends.", why: "People use it to hit protein goals easily, especially around workouts or busy mornings.", benefits: "Supports muscle repair and recovery when overall protein is adequate; convenient and filling.", considerations: "It's a food, not magic. Whole-food protein works too. Check for added sugars if that matters to you.", pro: "If you have kidney concerns or milk allergies, talk with your provider first." },
  { emoji: "💪", name: "Creatine", what: "One of the most researched supplements; a compound your muscles use for quick energy.", why: "People use creatine monohydrate to support strength, training performance, and recovery.", benefits: "Well studied for supporting strength and training output; may support muscle over time with training.", considerations: "A common dose is around 3-5g daily. It may cause slight water retention early on, which is normal.", pro: "If you're pregnant, nursing, or have kidney concerns, discuss with your provider first." },
  { emoji: "🧂", name: "Electrolytes", what: "Minerals like sodium, potassium, and magnesium that help your body balance fluids.", why: "People use them for hydration, especially with heavy sweating, heat, or low-carb eating.", benefits: "May support hydration and reduce that sluggish, headachy feeling when you're low.", considerations: "You may not need extra if you eat balanced meals. Watch added sugar in some drink mixes.", pro: "If you have blood pressure or heart concerns, check sodium amounts with your provider." },
  { emoji: "🌙", name: "Magnesium", what: "A mineral involved in hundreds of processes, including muscle and nerve function.", why: "People use it for sleep, muscle relaxation, and to fill a common dietary gap.", benefits: "Studied for supporting sleep quality and muscle relaxation; many people don't get enough from food.", considerations: "Forms differ (glycinate is gentle; citrate can loosen stools). Start low.", pro: "If you take medications or have kidney concerns, ask your provider before adding it." },
  { emoji: "☀️", name: "Vitamin D", what: "A vitamin your skin makes from sunlight, involved in bone health and immunity.", why: "People supplement when sun exposure is low or bloodwork shows they're low.", benefits: "Supports bone health and immune function; deficiency is common, especially in winter.", considerations: "More isn't always better. A blood test can tell you if you actually need it.", pro: "Ask your provider to check your level and suggest a dose that fits you." },
  { emoji: "🐟", name: "Omega-3", what: "Healthy fats (EPA and DHA) found in fish oil and some algae.", why: "People use them to support heart, brain, and joint health when they don't eat much fish.", benefits: "Studied for supporting heart and brain health and a healthy inflammatory response.", considerations: "Quality varies. Look for third-party tested products to avoid rancid oils.", pro: "If you take blood thinners, talk with your provider before starting." },
  { emoji: "🌾", name: "Fiber", what: "The part of plants your body doesn't digest, feeding your gut and slowing digestion.", why: "People use it to support digestion, fullness, and steady blood sugar when food falls short.", benefits: "Supports digestion, fullness, and gut health; most people eat less than recommended.", considerations: "Increase slowly and drink water, or you may feel bloated. Food sources count too.", pro: "If you have a gut condition, check with your provider on the right type." },
  { emoji: "✨", name: "Collagen", what: "A protein that gives structure to skin, joints, and connective tissue.", why: "People use it hoping to support skin, hair, nails, and joints.", benefits: "Some studies suggest support for skin elasticity and joints; research is still growing.", considerations: "It's a protein, so it counts toward your intake, but it's low in some amino acids.", pro: "If you're pregnant or have allergies to the source, check with your provider." },
]
const NOURISH_PROGRAM_MSG = {
  foundations: "Your body is learning. Nourishment supports consistency.",
  strength: "Your training asks more from your body. Your fuel should support that.",
  mama: "Your body is rebuilding. Support is the priority.",
  move: "Small choices create momentum.",
  balanced: "Build a sustainable relationship with movement and food.",
}
// Nourish: Timing & Recovery education (shared across programs).
const NOURISH_TIMING = {
  title: "Fueling Before & After Your Sessions",
  intro: "Nutrition can support your movement without rigid rules or perfection. Fuel needs vary with intensity, timing, preference, and capacity \u2014 some sessions feel better with fuel beforehand, others need no extra planning.",
  cards: [
    { emoji: "🔋", title: "Before Your Workout", goal: "Support energy and performance.", rows: [["Strength training days", "Protein support, some carbohydrates for training fuel, and hydration."], ["Short or low-capacity days", "Keep it simple: normal meals, hydration, easy support."]] },
    { emoji: "💧", title: "After Your Workout", goal: "Support recovery and adaptation.", rows: [["Protein", "Provides the building blocks your muscles use."], ["Carbohydrates", "Help replenish your energy."], ["Hydration", "Supports normal body function."]] },
  ],
  capacity: [["Green", "You may have more flexibility to plan your nutrition around training.", "#7FA054"], ["Yellow", "Choose simple support. Reduce decisions, not nourishment.", "#D08F2E"], ["Red", "Your goal today is support. Easy meals still count.", "#D65C4E"], ["Recovery", "Recovery is part of progress.", "#A87BD1"]],
}
const NOURISH_RECOVERY = {
  title: "Supporting Your Body After Movement",
  intro: "Recovery is where your body adapts. It's not something to earn or rush \u2014 it's part of getting stronger.",
  cards: [
    { emoji: "💪", title: "Muscle Recovery", body: "Resistance training creates a small, healthy stress on your muscles. With rest and protein, your body rebuilds them a little stronger than before." },
    { emoji: "😴", title: "Sleep + Recovery", body: "A lot of recovery happens while you sleep. Rest is when your body does much of its repair work, which is why sleep matters as much as training." },
    { emoji: "💧", title: "Hydration", body: "Fluids support nearly every process in your body. Electrolytes can help when you've sweated a lot or on hotter days." },
    { emoji: "🚶", title: "Gentle Recovery Movement", body: "Walking, mobility, stretching, and lower-intensity movement all support recovery. You'll find these in Train on your recovery days." },
  ],
  close: "Your body does not only become stronger during the workout. It becomes stronger when you recover.",
}
const NOURISH_PROGRAM_FOCUS = {
  foundations: ["Protein habits", "Balanced meals", "Hydration"],
  strength: ["Protein", "Carbohydrates", "Recovery"],
  mama: ["Nourishment", "Recovery", "Realistic meals"],
  move: ["Simple meals", "Consistency"],
  balanced: ["Balance across all three macros", "Sustainable habits", "Hydration"],
}
// ============ NOURISH REDESIGN: PLANS, MEALS, TARGETS ============
// Nutrition plans (practical goals). Content restructured from the original Food Paths.
const NUTRITION_PLANS = [
  { id: "fatloss", emoji: "🌱", name: "Fat Loss", tag: "A supportive energy balance while keeping your strength.", grad: "linear-gradient(135deg,#9CC79A,#6E9E6B)",
    forWho: "You'd like to gradually lose fat while protecting your muscle, energy, and sanity.",
    helps: ["Keeps protein high so you hold onto strength", "Builds meals that actually keep you full", "Uses a gentle deficit, never a punishing one"],
    expect: "A modest calorie target with high protein. Slow and steady, not dramatic. Nothing is off-limits.",
    deficit: -0.15, proteinPerLb: 0.8, note: "This is about supporting your body, not shrinking it." },
  { id: "strength", emoji: "💪", name: "Build Strength", tag: "Fuel your training and build muscle.", grad: "linear-gradient(135deg,#E984B4,#A54E86)",
    forWho: "You're training consistently and want the fuel to build and recover well.",
    helps: ["Protein spread across the day for muscle repair", "Enough carbs to power your sessions", "Recovery-focused meal timing"],
    expect: "Calories at or slightly above maintenance with strong protein. Enough food to actually build.",
    deficit: 0.05, proteinPerLb: 0.9, note: "You cannot build something out of nothing. Eating enough is part of training." },
  { id: "mama", emoji: "🤱", name: "Postpartum Rebuild", tag: "Support recovery, energy, and rebuilding.", grad: "linear-gradient(135deg,#F0B7D4,#C97BA8)",
    forWho: "You're rebuilding after having a baby and need realistic nourishment that fits real motherhood.",
    helps: ["Prioritizes recovery and steady energy", "One-handed, low-effort meal ideas", "Extra care around hydration and fueling enough"],
    expect: "Maintenance-level energy or more. We will not put you in a deficit here — recovery comes first.",
    deficit: 0, proteinPerLb: 0.8, note: "Your body is rebuilding. This is not the season to eat less." },
  { id: "energy", emoji: "⚡", name: "Energy Support", tag: "Steady energy through balanced, consistent meals.", grad: "linear-gradient(135deg,#F0C879,#D8A94E)",
    forWho: "You want to stop crashing through your afternoons and feel steadier all day.",
    helps: ["Balanced meals so blood sugar stays steadier", "Consistent fueling instead of skipping and crashing", "Hydration built into your day"],
    expect: "Maintenance calories with balance across all three macros. The goal is feeling good, not restriction.",
    deficit: 0, proteinPerLb: 0.7, note: "Eating enough, regularly, is the most underrated energy strategy there is." },
  { id: "hormone", emoji: "🌸", name: "Hormone Support", tag: "Nourishment that supports your cycle and hormones.", grad: "linear-gradient(135deg,#C6A3E0,#8A5EB0)",
    forWho: "You want to eat in a way that supports your cycle, mood, and hormonal health.",
    helps: ["Enough fat and calories to support hormone production", "Fiber and steady blood sugar", "Nourishment that adapts to your cycle phase"],
    expect: "Maintenance calories with adequate fat and fiber. Under-eating is the main thing we avoid here.",
    deficit: 0, proteinPerLb: 0.7, note: "Hormones need enough food. Chronic under-fueling works against you." },
]
const PLAN_BY_ID = (id) => NUTRITION_PLANS.find((p) => p.id === id) || null
// Plain-language macro education
const MACRO_PLAIN = [
  { emoji: "🥩", name: "Protein", body: "Helps build and repair muscle, and helps keep you full." },
  { emoji: "🍠", name: "Carbs", body: "Give your body energy." },
  { emoji: "🥑", name: "Fat", body: "Supports hormones, your brain, and fullness." },
]
// ---- Meal library. cal/p/c/f are approximate per serving; min = prep minutes. ----
const MEALS = [
  { n: "Greek yogurt, berries & granola", t: "breakfast", cal: 340, p: 28, c: 38, f: 8, min: 3, tags: ["High Protein", "5 Minutes", "No Cook", "Grab & Go", "Sweet"], ing: [["Dairy", "Greek yogurt"], ["Produce", "Berries"], ["Pantry", "Granola"]] },
  { n: "Scrambled eggs, toast & avocado", t: "breakfast", cal: 420, p: 24, c: 32, f: 22, min: 10, tags: ["High Protein", "Family Friendly"], ing: [["Protein", "Eggs"], ["Pantry", "Bread"], ["Produce", "Avocado"]] },
  { n: "Protein oatmeal", t: "breakfast", cal: 380, p: 30, c: 48, f: 8, min: 5, tags: ["High Protein", "5 Minutes", "Budget Friendly", "Sweet"], ing: [["Pantry", "Oats"], ["Pantry", "Protein powder"], ["Produce", "Banana"]] },
  { n: "Cottage cheese bowl", t: "breakfast", cal: 300, p: 32, c: 22, f: 8, min: 3, tags: ["High Protein", "No Cook", "5 Minutes"], ing: [["Dairy", "Cottage cheese"], ["Produce", "Berries"], ["Pantry", "Honey"]] },
  { n: "Protein smoothie", t: "breakfast", cal: 350, p: 32, c: 40, f: 6, min: 5, tags: ["High Protein", "5 Minutes", "Grab & Go", "Sweet"], ing: [["Pantry", "Protein powder"], ["Frozen", "Frozen berries"], ["Produce", "Banana"], ["Dairy", "Milk"]] },
  { n: "Egg & cheese breakfast wrap", t: "breakfast", cal: 400, p: 26, c: 34, f: 18, min: 8, tags: ["High Protein", "Grab & Go", "Family Friendly"], ing: [["Protein", "Eggs"], ["Dairy", "Shredded cheese"], ["Pantry", "Tortillas"]] },
  { n: "Overnight oats", t: "breakfast", cal: 390, p: 24, c: 50, f: 10, min: 5, tags: ["Low Prep", "Budget Friendly", "Grab & Go", "Sweet"], ing: [["Pantry", "Oats"], ["Dairy", "Greek yogurt"], ["Pantry", "Chia seeds"]] },
  { n: "Turkey sausage & eggs", t: "breakfast", cal: 380, p: 34, c: 8, f: 22, min: 10, tags: ["High Protein", "Family Friendly"], ing: [["Protein", "Turkey sausage"], ["Protein", "Eggs"]] },
  { n: "Chicken wrap", t: "lunch", cal: 450, p: 38, c: 40, f: 14, min: 8, tags: ["High Protein", "5 Minutes", "Grab & Go"], ing: [["Protein", "Cooked chicken"], ["Pantry", "Tortillas"], ["Produce", "Lettuce"]] },
  { n: "Tuna salad over greens", t: "lunch", cal: 340, p: 34, c: 12, f: 16, min: 5, tags: ["High Protein", "No Cook", "Budget Friendly"], ing: [["Protein", "Canned tuna"], ["Produce", "Salad greens"], ["Pantry", "Mayo"]] },
  { n: "Leftover chicken & rice bowl", t: "lunch", cal: 480, p: 40, c: 50, f: 12, min: 5, tags: ["High Protein", "Low Prep"], ing: [["Protein", "Cooked chicken"], ["Pantry", "Rice"], ["Frozen", "Frozen vegetables"]] },
  { n: "Turkey sandwich", t: "lunch", cal: 420, p: 32, c: 42, f: 12, min: 5, tags: ["5 Minutes", "Family Friendly", "Budget Friendly"], ing: [["Protein", "Deli turkey"], ["Pantry", "Bread"], ["Dairy", "Cheese slices"]] },
  { n: "Cottage cheese & crackers plate", t: "lunch", cal: 360, p: 30, c: 30, f: 12, min: 3, tags: ["No Cook", "5 Minutes"], ing: [["Dairy", "Cottage cheese"], ["Pantry", "Crackers"], ["Produce", "Cucumber"]] },
  { n: "Chicken caesar salad", t: "lunch", cal: 420, p: 38, c: 14, f: 24, min: 10, tags: ["High Protein"], ing: [["Protein", "Cooked chicken"], ["Produce", "Romaine"], ["Pantry", "Caesar dressing"]] },
  { n: "Burrito bowl", t: "lunch", cal: 520, p: 36, c: 58, f: 16, min: 10, tags: ["High Protein", "Family Friendly"], ing: [["Protein", "Ground beef"], ["Pantry", "Rice"], ["Pantry", "Black beans"], ["Dairy", "Shredded cheese"]] },
  { n: "Soup & grilled cheese", t: "lunch", cal: 480, p: 22, c: 52, f: 20, min: 12, tags: ["Family Friendly", "Budget Friendly"], ing: [["Pantry", "Soup"], ["Pantry", "Bread"], ["Dairy", "Cheese slices"]] },
  { n: "Chicken, sweet potato & vegetables", t: "dinner", cal: 520, p: 42, c: 48, f: 14, min: 25, tags: ["High Protein", "Family Friendly"], ing: [["Protein", "Chicken breast"], ["Produce", "Sweet potato"], ["Produce", "Broccoli"]] },
  { n: "Salmon bowl", t: "dinner", cal: 510, p: 38, c: 42, f: 20, min: 20, tags: ["High Protein"], ing: [["Protein", "Salmon"], ["Pantry", "Rice"], ["Produce", "Cucumber"], ["Produce", "Avocado"]] },
  { n: "Turkey taco bowl", t: "dinner", cal: 500, p: 42, c: 44, f: 16, min: 20, tags: ["High Protein", "Family Friendly", "Budget Friendly"], ing: [["Protein", "Ground turkey"], ["Pantry", "Rice"], ["Pantry", "Taco seasoning"], ["Produce", "Salsa"]] },
  { n: "Beef & vegetable stir fry", t: "dinner", cal: 540, p: 40, c: 46, f: 20, min: 20, tags: ["High Protein", "Family Friendly"], ing: [["Protein", "Lean beef"], ["Frozen", "Stir fry vegetables"], ["Pantry", "Rice"], ["Pantry", "Soy sauce"]] },
  { n: "Sheet pan chicken & vegetables", t: "dinner", cal: 480, p: 44, c: 32, f: 18, min: 30, tags: ["High Protein", "Low Prep", "Family Friendly"], ing: [["Protein", "Chicken thighs"], ["Produce", "Potatoes"], ["Produce", "Peppers"], ["Pantry", "Olive oil"]] },
  { n: "Pasta with ground turkey", t: "dinner", cal: 560, p: 38, c: 62, f: 16, min: 20, tags: ["Family Friendly", "Budget Friendly"], ing: [["Protein", "Ground turkey"], ["Pantry", "Pasta"], ["Pantry", "Marinara"]] },
  { n: "Shrimp, rice & broccoli", t: "dinner", cal: 470, p: 36, c: 52, f: 10, min: 15, tags: ["High Protein"], ing: [["Protein", "Shrimp"], ["Pantry", "Rice"], ["Produce", "Broccoli"]] },
  { n: "Rotisserie chicken, salad & rice", t: "dinner", cal: 490, p: 44, c: 42, f: 14, min: 8, tags: ["High Protein", "Low Prep", "5 Minutes"], ing: [["Protein", "Rotisserie chicken"], ["Produce", "Bagged salad"], ["Pantry", "Microwave rice"]] },
  { n: "Egg fried rice & edamame", t: "dinner", cal: 450, p: 26, c: 56, f: 14, min: 15, tags: ["Budget Friendly", "Family Friendly"], ing: [["Protein", "Eggs"], ["Pantry", "Rice"], ["Frozen", "Edamame"], ["Frozen", "Frozen peas & carrots"]] },
  { n: "Chili", t: "dinner", cal: 480, p: 34, c: 48, f: 16, min: 30, tags: ["Family Friendly", "Budget Friendly"], ing: [["Protein", "Ground beef"], ["Pantry", "Kidney beans"], ["Pantry", "Diced tomatoes"]] },
  { n: "Protein shake", t: "snack", cal: 160, p: 25, c: 8, f: 3, min: 2, tags: ["High Protein", "5 Minutes", "Grab & Go"], ing: [["Pantry", "Protein powder"]] },
  { n: "Greek yogurt cup", t: "snack", cal: 140, p: 17, c: 14, f: 2, min: 1, tags: ["High Protein", "Grab & Go", "No Cook"], ing: [["Dairy", "Greek yogurt cups"]] },
  { n: "Cheese stick & apple", t: "snack", cal: 180, p: 8, c: 22, f: 7, min: 1, tags: ["Grab & Go", "No Cook", "Budget Friendly"], ing: [["Dairy", "String cheese"], ["Produce", "Apples"]] },
  { n: "Beef jerky", t: "snack", cal: 120, p: 20, c: 6, f: 2, min: 1, tags: ["High Protein", "Grab & Go", "Salty"], ing: [["Protein", "Beef jerky"]] },
  { n: "Hummus & vegetables", t: "snack", cal: 180, p: 6, c: 20, f: 9, min: 3, tags: ["No Cook", "Salty"], ing: [["Pantry", "Hummus"], ["Produce", "Baby carrots"]] },
  { n: "Cottage cheese & pineapple", t: "snack", cal: 190, p: 22, c: 18, f: 3, min: 2, tags: ["High Protein", "Sweet", "No Cook"], ing: [["Dairy", "Cottage cheese"], ["Produce", "Pineapple"]] },
  { n: "Protein bar", t: "snack", cal: 210, p: 20, c: 22, f: 7, min: 1, tags: ["High Protein", "Grab & Go", "Sweet"], ing: [["Pantry", "Protein bars"]] },
  { n: "Two hard boiled eggs", t: "snack", cal: 140, p: 12, c: 2, f: 10, min: 1, tags: ["High Protein", "Low Prep", "Budget Friendly"], ing: [["Protein", "Eggs"]] },
  { n: "Dark chocolate & almonds", t: "snack", cal: 200, p: 5, c: 16, f: 14, min: 1, tags: ["Sweet", "Grab & Go"], ing: [["Pantry", "Dark chocolate"], ["Pantry", "Almonds"]] },
  { n: "Popcorn & string cheese", t: "snack", cal: 190, p: 9, c: 22, f: 8, min: 3, tags: ["Salty", "Budget Friendly"], ing: [["Pantry", "Popcorn"], ["Dairy", "String cheese"]] },
]
const MEAL_TYPES = [["breakfast", "Breakfast"], ["lunch", "Lunch"], ["dinner", "Dinner"], ["snack", "Snacks"]]
const MEAL_FILTERS = ["High Protein", "5 Minutes", "Low Prep", "No Cook", "Family Friendly", "Budget Friendly", "Grab & Go", "Sweet", "Salty"]
const GROCERY_CATS2 = ["Produce", "Protein", "Dairy", "Pantry", "Frozen", "Other"]
// Quick help categories -> filter tags
const QUICK_HELP = [
  { emoji: "⚡", label: "Need something fast", filter: "5 Minutes" },
  { emoji: "🥶", label: "No cooking", filter: "No Cook" },
  { emoji: "🎒", label: "Grab & go", filter: "Grab & Go" },
  { emoji: "🥩", label: "High protein", filter: "High Protein" },
  { emoji: "🍫", label: "Sweet craving", filter: "Sweet" },
  { emoji: "🥨", label: "Salty craving", filter: "Salty" },
  { emoji: "👨‍👩‍👧", label: "Family friendly", filter: "Family Friendly" },
  { emoji: "💰", label: "Budget friendly", filter: "Budget Friendly" },
]
// Eating out guidance (general, not a restaurant database)
const EATING_OUT = {
  intro: "Eating out is part of a real life, not a detour from it. Here's how to choose in a way that supports you — no clean/dirty, no earning it back.",
  principles: ["Start with the protein, then build around it", "Vegetables or a side salad add volume and fiber", "Sauces and dressings on the side give you the choice", "If it's a special meal, enjoy it fully. One meal changes nothing."],
  spots: [
    { emoji: "🌯", name: "Mexican / burrito bowls", picks: [["Chicken burrito bowl, no tortilla", "~500 cal · ~40g protein", "High Protein"], ["Two soft tacos with grilled protein", "~450 cal · ~30g protein", "Balanced"], ["Fajitas, skip the extra tortillas", "~520 cal · ~38g protein", "High Protein"]] },
    { emoji: "🍗", name: "Fast casual chicken", picks: [["Grilled chicken sandwich", "~440 cal · ~38g protein", "High Protein"], ["Grilled nuggets & fruit", "~350 cal · ~35g protein", "Lighter"], ["Chicken salad, dressing on the side", "~400 cal · ~34g protein", "Balanced"]] },
    { emoji: "🍔", name: "Burgers", picks: [["Single burger, no mayo", "~500 cal · ~28g protein", "Balanced"], ["Burger, skip the bun top", "~430 cal · ~28g protein", "Lighter"], ["Grilled chicken sandwich instead", "~450 cal · ~35g protein", "High Protein"]] },
    { emoji: "🍝", name: "Italian", picks: [["Grilled chicken with vegetables", "~480 cal · ~45g protein", "High Protein"], ["Pasta with a protein, share the bread", "~600 cal · ~30g protein", "Balanced"], ["Minestrone & a side salad", "~380 cal · ~14g protein", "Lighter"]] },
    { emoji: "🍣", name: "Sushi & Asian", picks: [["Salmon or tuna sashimi & edamame", "~380 cal · ~40g protein", "High Protein"], ["Teriyaki chicken with rice", "~550 cal · ~38g protein", "Balanced"], ["Miso soup & a protein roll", "~420 cal · ~24g protein", "Lighter"]] },
    { emoji: "☕", name: "Coffee shops", picks: [["Egg bites & a latte", "~380 cal · ~24g protein", "High Protein"], ["Protein box", "~450 cal · ~22g protein", "Balanced"], ["Greek yogurt parfait", "~280 cal · ~14g protein", "Lighter"]] },
  ],
  close: "No food is off-limits here. The goal is feeling good afterward, not being perfect.",
}
// Learn topics (existing educational content, relocated)
const LEARN_TOPICS = [
  { emoji: "🥩", name: "Protein", body: "Protein gives your body the material to repair muscle, support recovery, and stay full between meals. Most women feel best somewhere around 0.7-1g per pound of goal body weight, spread across the day rather than crammed into dinner.", tips: ["Aim for a palm-sized portion at each meal", "A protein-rich snack closes most gaps", "Greek yogurt, eggs, chicken, fish, cottage cheese, and protein powder all count"] },
  { emoji: "🍠", name: "Carbohydrates", body: "Carbs are your body's most accessible energy source, and they matter especially around training. Cutting them very low tends to backfire on energy, mood, and workout quality.", tips: ["Fuel your training days a little more generously", "Fruit, potatoes, rice, oats, and bread are all useful", "Pair carbs with protein for steadier energy"] },
  { emoji: "🥑", name: "Fats", body: "Fat supports hormone production, brain function, nutrient absorption, and satisfaction. Going too low on fat for too long can affect your cycle and how full you feel.", tips: ["Include a source at most meals", "Olive oil, avocado, nuts, seeds, and whole eggs are easy options", "Fat is calorie-dense, so portions matter more than avoidance"] },
  { emoji: "🌾", name: "Fiber", body: "Fiber supports digestion, gut health, steadier blood sugar, and fullness. Most people eat well below what they'd benefit from.", tips: ["Aim to add fiber gradually, not all at once", "Vegetables, fruit, beans, and whole grains do the work", "Drink water as you increase it"] },
  { emoji: "💧", name: "Hydration", body: "Fluids support nearly every process in your body. Thirst, fatigue, and hunger can feel similar, so hydration often changes how the whole day feels.", tips: ["Keep water where you can see it", "Electrolytes help after heavy sweating or on hot days", "If you're nursing, your needs are noticeably higher"] },
  { emoji: "⏰", name: "Meal Timing", body: "Total intake matters far more than perfect timing. That said, eating regularly tends to steady energy, and fueling around training can improve how sessions feel.", tips: ["Try not to go extremely long without eating", "Some protein and carbs before training can help", "Protein after training supports recovery"] },
  { emoji: "🏷️", name: "Reading Food Labels", body: "Labels are information, not judgment. The most useful things to notice are the serving size, protein, and fiber — those tell you the most about how a food will actually serve you.", tips: ["Check the serving size first; it's easy to miss", "Protein and fiber are the most useful numbers for fullness", "Ingredient lists are informative, not moral"] },
  { emoji: "🧺", name: "Meal Prep", body: "Prep is about reducing future decisions, not cooking elaborate meals on Sunday. Even prepping one component makes the week easier.", tips: ["Prep components (a protein, a carb, a vegetable), not full meals", "Match your prep to your capacity that week", "Buying pre-cut and pre-cooked food is a completely valid strategy"] },
]
// ---- Target estimation (Mifflin-St Jeor). Estimates only, never medical prescription. ----
const ACTIVITY_LEVELS = [
  { k: "sedentary", label: "Mostly sitting", note: "Desk work, little formal exercise", mult: 1.2 },
  { k: "light", label: "Lightly active", note: "On your feet some, or 1-2 sessions a week", mult: 1.375 },
  { k: "moderate", label: "Moderately active", note: "Training 3-4 times a week", mult: 1.55 },
  { k: "very", label: "Very active", note: "Training 5+ times a week, or a physically demanding job", mult: 1.725 },
]
const CAL_FLOOR = 1500 // we never estimate below this without provider involvement
// Rate of change options (fat loss only). Deliberately gentle — no aggressive deficits offered.
const RATE_OPTIONS = [
  { k: "gentle", label: "Gentle", note: "About 0.5 lb per week", perDay: 250 },
  { k: "steady", label: "Steady", note: "About 1 lb per week", perDay: 500 },
]
// Mifflin-St Jeor BMR -> activity multiplier -> maintenance -> plan-adjusted target -> macros.
// Kept UI-free so the logic can be reviewed or replaced independently.
const calcTargets = (inp) => {
  const age = Number(inp.age) || 30
  const hIn = Number(inp.heightIn) || 65
  const wLb = Number(inp.weightLb) || 150
  const kg = wLb * 0.453592, cm = hIn * 2.54
  const sexConst = inp.sex === "male" ? 5 : -161
  const bmr = Math.round(10 * kg + 6.25 * cm - 5 * age + sexConst)
  const act = (ACTIVITY_LEVELS.find((a) => a.k === inp.activity) || ACTIVITY_LEVELS[1]).mult
  let maintenance = Math.round(bmr * act)
  const plan = PLAN_BY_ID(inp.planId)
  const flags = []
  // Nursing adds real energy needs and rules out a deficit entirely.
  if (inp.nursing) { maintenance += 400; flags.push("nursing") }
  let cal = maintenance
  const wantsDeficit = plan && plan.deficit < 0
  if (wantsDeficit && inp.nursing) { flags.push("noDeficitNursing") }
  else if (wantsDeficit) {
    const rate = (RATE_OPTIONS.find((r) => r.k === inp.rate) || RATE_OPTIONS[0]).perDay
    // Cap the deficit at 20% of maintenance no matter which rate is chosen.
    const capped = Math.min(rate, Math.round(maintenance * 0.2))
    if (capped < rate) flags.push("rateCapped")
    cal = maintenance - capped
  } else if (plan && plan.deficit > 0) {
    cal = Math.round(maintenance * (1 + plan.deficit))
  }
  cal = Math.round(cal / 10) * 10
  // Safety floor: never estimate below BMR or the general floor.
  const floor = Math.max(bmr, CAL_FLOOR)
  if (cal < floor) { cal = Math.round(floor / 10) * 10; flags.push("floored") }
  // Protein from plan; fat ~27% of calories; carbs fill the remainder.
  const perLb = plan ? plan.proteinPerLb : 0.75
  const p = Math.round((wLb * perLb) / 5) * 5
  const f = Math.round((cal * 0.27) / 9 / 5) * 5
  const c = Math.max(0, Math.round((cal - p * 4 - f * 9) / 4 / 5) * 5)
  return { cal, p, c, f, bmr, maintenance, flags }
}
// Protein split guidance -> turns a number into meals
const proteinSplit = (p) => {
  const b = Math.round((p * 0.25) / 5) * 5, l = Math.round((p * 0.25) / 5) * 5, d = Math.round((p * 0.3) / 5) * 5
  return { b, l, d, s: Math.max(0, p - b - l - d) }
}
// ============ FOOD LOGGING ENGINE ============
// Real serving-size math. Every food stores nutrition per 100 g plus the gram weight of
// each household unit it supports, so any quantity/unit combination converts correctly.
// This layer is deliberately UI-free so it can be reviewed, tested, or swapped independently.
const MASS_UNITS = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 }
const foodUnitList = (food) => (food && food.units && food.units.length ? food.units : [{ u: "g", g: 1 }])
// grams represented by qty of unit for a given food (household units carry their own gram weight)
const gramsFor = (food, qty, unit) => {
  const q = Number(qty)
  if (!isFinite(q) || q <= 0) return null
  const own = foodUnitList(food).find((x) => x.u === unit)
  if (own) return q * own.g
  if (MASS_UNITS[unit]) return q * MASS_UNITS[unit]
  return null
}
const r1 = (n) => Math.round(n * 10) / 10
// Nutrition for an arbitrary quantity/unit of a food, derived from its per-100g basis.
const nutrientsFor = (food, qty, unit) => {
  const g = gramsFor(food, qty, unit)
  if (g == null || !food || !food.per100) return null
  const k = g / 100
  return { cal: Math.round(food.per100.cal * k), p: r1(food.per100.p * k), c: r1(food.per100.c * k), f: r1(food.per100.f * k), grams: Math.round(g) }
}
// Sum a list of logged entries into daily/meal totals.
const sumEntries = (entries) => (entries || []).reduce(
  (a, e) => ({ cal: a.cal + (e.cal || 0), p: a.p + (e.p || 0), c: a.c + (e.c || 0), f: a.f + (e.f || 0) }),
  { cal: 0, p: 0, c: 0, f: 0 }
)
// ---- STARTER FOOD SET ----
// A small set of common whole foods using standard reference values (per 100 g edible portion).
// This is intentionally NOT a comprehensive database — see searchFoods() for the API integration point.
const STARTER_FOODS = [
  { id: "egg", name: "Egg, whole", per100: { cal: 143, p: 12.6, c: 0.7, f: 9.5 }, units: [{ u: "large egg", g: 50 }, { u: "g", g: 1 }, { u: "oz", g: 28.35 }] },
  { id: "eggwhite", name: "Egg white", per100: { cal: 52, p: 10.9, c: 0.7, f: 0.2 }, units: [{ u: "large white", g: 33 }, { u: "g", g: 1 }] },
  { id: "chicken", name: "Chicken breast, cooked", per100: { cal: 165, p: 31, c: 0, f: 3.6 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "turkeyg", name: "Ground turkey 93%, cooked", per100: { cal: 203, p: 27, c: 0, f: 10 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "beefg", name: "Ground beef 90%, cooked", per100: { cal: 217, p: 26, c: 0, f: 11.8 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "salmon", name: "Salmon, cooked", per100: { cal: 208, p: 22.1, c: 0, f: 13.4 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "shrimp", name: "Shrimp, cooked", per100: { cal: 99, p: 24, c: 0.2, f: 0.3 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "tuna", name: "Tuna, canned in water", per100: { cal: 116, p: 25.5, c: 0, f: 0.8 }, units: [{ u: "can", g: 142 }, { u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "turkeydeli", name: "Turkey, deli sliced", per100: { cal: 104, p: 17, c: 3, f: 2.5 }, units: [{ u: "slice", g: 28 }, { u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "tofu", name: "Tofu, firm", per100: { cal: 144, p: 17, c: 2.8, f: 8.7 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "gyogurt", name: "Greek yogurt, plain nonfat", per100: { cal: 59, p: 10.3, c: 3.6, f: 0.4 }, units: [{ u: "cup", g: 245 }, { u: "container", g: 170 }, { u: "g", g: 1 }] },
  { id: "cottage", name: "Cottage cheese, 2%", per100: { cal: 84, p: 11, c: 4.3, f: 2.3 }, units: [{ u: "cup", g: 226 }, { u: "g", g: 1 }] },
  { id: "milk", name: "Milk, 2%", per100: { cal: 50, p: 3.3, c: 4.8, f: 2 }, units: [{ u: "cup", g: 244 }, { u: "g", g: 1 }] },
  { id: "cheddar", name: "Cheddar cheese", per100: { cal: 403, p: 23, c: 3.1, f: 33 }, units: [{ u: "slice", g: 28 }, { u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "whey", name: "Whey protein powder", per100: { cal: 400, p: 80, c: 8, f: 5 }, units: [{ u: "scoop", g: 30 }, { u: "g", g: 1 }] },
  { id: "oats", name: "Oats, dry", per100: { cal: 389, p: 16.9, c: 66.3, f: 6.9 }, units: [{ u: "cup", g: 81 }, { u: "g", g: 1 }] },
  { id: "rice", name: "White rice, cooked", per100: { cal: 130, p: 2.7, c: 28, f: 0.3 }, units: [{ u: "cup", g: 158 }, { u: "g", g: 1 }] },
  { id: "quinoa", name: "Quinoa, cooked", per100: { cal: 120, p: 4.4, c: 21.3, f: 1.9 }, units: [{ u: "cup", g: 185 }, { u: "g", g: 1 }] },
  { id: "pasta", name: "Pasta, cooked", per100: { cal: 131, p: 5, c: 25, f: 1.1 }, units: [{ u: "cup", g: 140 }, { u: "g", g: 1 }] },
  { id: "bread", name: "Bread, whole wheat", per100: { cal: 247, p: 13, c: 41, f: 3.4 }, units: [{ u: "slice", g: 32 }, { u: "g", g: 1 }] },
  { id: "tortilla", name: "Tortilla, flour", per100: { cal: 306, p: 8.2, c: 51, f: 7.6 }, units: [{ u: "tortilla", g: 45 }, { u: "g", g: 1 }] },
  { id: "potato", name: "Potato, cooked", per100: { cal: 87, p: 1.9, c: 20.1, f: 0.1 }, units: [{ u: "medium", g: 173 }, { u: "cup", g: 156 }, { u: "g", g: 1 }] },
  { id: "sweetpot", name: "Sweet potato, cooked", per100: { cal: 90, p: 2, c: 20.7, f: 0.1 }, units: [{ u: "medium", g: 130 }, { u: "cup", g: 200 }, { u: "g", g: 1 }] },
  { id: "blackbeans", name: "Black beans, cooked", per100: { cal: 132, p: 8.9, c: 23.7, f: 0.5 }, units: [{ u: "cup", g: 172 }, { u: "g", g: 1 }] },
  { id: "banana", name: "Banana", per100: { cal: 89, p: 1.1, c: 22.8, f: 0.3 }, units: [{ u: "medium", g: 118 }, { u: "g", g: 1 }] },
  { id: "apple", name: "Apple", per100: { cal: 52, p: 0.3, c: 13.8, f: 0.2 }, units: [{ u: "medium", g: 182 }, { u: "g", g: 1 }] },
  { id: "orange", name: "Orange", per100: { cal: 47, p: 0.9, c: 11.8, f: 0.1 }, units: [{ u: "medium", g: 131 }, { u: "g", g: 1 }] },
  { id: "blueberry", name: "Blueberries", per100: { cal: 57, p: 0.7, c: 14.5, f: 0.3 }, units: [{ u: "cup", g: 148 }, { u: "g", g: 1 }] },
  { id: "strawberry", name: "Strawberries", per100: { cal: 32, p: 0.7, c: 7.7, f: 0.3 }, units: [{ u: "cup", g: 152 }, { u: "g", g: 1 }] },
  { id: "broccoli", name: "Broccoli, cooked", per100: { cal: 35, p: 2.4, c: 7.2, f: 0.4 }, units: [{ u: "cup", g: 156 }, { u: "g", g: 1 }] },
  { id: "spinach", name: "Spinach, raw", per100: { cal: 23, p: 2.9, c: 3.6, f: 0.4 }, units: [{ u: "cup", g: 30 }, { u: "g", g: 1 }] },
  { id: "avocado", name: "Avocado", per100: { cal: 160, p: 2, c: 8.5, f: 14.7 }, units: [{ u: "medium", g: 150 }, { u: "half", g: 75 }, { u: "g", g: 1 }] },
  { id: "almonds", name: "Almonds", per100: { cal: 579, p: 21.2, c: 21.6, f: 49.9 }, units: [{ u: "oz", g: 28.35 }, { u: "g", g: 1 }] },
  { id: "pb", name: "Peanut butter", per100: { cal: 588, p: 25, c: 20, f: 50 }, units: [{ u: "tbsp", g: 16 }, { u: "g", g: 1 }] },
  { id: "oliveoil", name: "Olive oil", per100: { cal: 884, p: 0, c: 0, f: 100 }, units: [{ u: "tbsp", g: 13.5 }, { u: "tsp", g: 4.5 }, { u: "g", g: 1 }] },
  { id: "butter", name: "Butter", per100: { cal: 717, p: 0.9, c: 0.1, f: 81 }, units: [{ u: "tbsp", g: 14 }, { u: "g", g: 1 }] },
  { id: "honey", name: "Honey", per100: { cal: 304, p: 0.3, c: 82.4, f: 0 }, units: [{ u: "tbsp", g: 21 }, { u: "g", g: 1 }] },
  { id: "coffee", name: "Coffee, black", per100: { cal: 1, p: 0.1, c: 0, f: 0 }, units: [{ u: "cup", g: 237 }, { u: "g", g: 1 }] },
]
// ---- FOOD SEARCH ADAPTER ----
// INTEGRATION POINT: replace the body of this function with a call to a real nutrition API
// (see notes in the summary). It must return objects shaped like STARTER_FOODS entries:
//   { id, name, per100: { cal, p, c, f }, units: [{ u: <label>, g: <grams per 1 unit> }] }
// Everything downstream (serving math, logging, totals) already works with that shape.
const searchFoods = (query) => {
  const q = String(query || "").trim().toLowerCase()
  if (!q) return []
  return STARTER_FOODS.filter((f) => f.name.toLowerCase().indexOf(q) >= 0)
}
// New Ray recipe meals exposed as loggable "foods" (nutrition already stored with each meal).
const mealAsFood = (m) => ({ id: "nr:" + m.n, name: m.n, newRay: true, per100: null, fixed: { cal: m.cal, p: m.p, c: m.c, f: m.f }, units: [{ u: "serving", g: 0 }] })
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
// ============ BLOOM — the emotional heart (Phase 1) ============
// Luxury = intentionally caring for yourself. One invitation. Never a checklist.
const BLOOM_INVITATIONS = {
  green: [
    { emoji: "🕯️", text: "Draw yourself a slow bath and light a candle." },
    { emoji: "💄", text: "Do your makeup today — just because it's yours to enjoy." },
    { emoji: "🌸", text: "Buy yourself flowers and put them where you'll see them." },
    { emoji: "✨", text: "Wear your favorite perfume and the earrings you save for later." },
    { emoji: "🛁", text: "Give yourself the full spa night. You've earned the softness." },
  ],
  yellow: [
    { emoji: "🌿", text: "Wash your face slowly, like it's a small ritual." },
    { emoji: "📖", text: "Read one page of something beautiful." },
    { emoji: "💅", text: "Moisturize before bed and let that be enough." },
    { emoji: "☀️", text: "Open the windows and let some air in." },
    { emoji: "🎧", text: "Play one song you love and do nothing else." },
  ],
  red: [
    { emoji: "🫖", text: "Make a warm cup of tea and hold it for a minute." },
    { emoji: "💋", text: "A little lip balm. That counts as care today." },
    { emoji: "🪮", text: "Brush your hair, gently. Nothing more is needed." },
    { emoji: "💧", text: "Splash your face with water. A small reset." },
    { emoji: "🛌", text: "Let yourself rest. Rest is care too." },
  ],
}
const BLOOM_SECTIONS = [
  { id: "appearance", emoji: "✨", name: "Appearance", grad: "linear-gradient(135deg,#F0B7D4,#C97BA8)",
    intro: "Feeling cared for, not chasing perfection.",
    cards: [
      { n: "Skincare", ic: "🌸", intro: "Simple routines that help you feel refreshed and cared for.",
        blocks: [
          { h: "Morning Routine", items: ["☀️ Cleanse or rinse", "✨ Serum (optional)", "🧴 Moisturizer", "🌞 SPF"] },
          { h: "Evening Routine", items: ["🌙 Remove makeup / SPF", "🫧 Cleanse", "✨ Treatment or serum if desired", "🧴 Moisturizer"] },
        ],
        note: "Consistency with simple basics matters more than having a complicated routine.",
        future: "Product recommendations, a routine builder, and New Ray skincare are on the way." },
      { n: "Hair", ic: "💇\u200d♀️", intro: "Small rituals that help you feel put together.",
        blocks: [
          { h: "Little rituals", items: ["A simple wash routine that works for you", "Heat protection before styling", "One or two easy go-to styles", "Refreshing second-day hair", "A hair mask when it needs love", "Simple, low-effort maintenance"] },
        ] },
      { n: "Makeup", ic: "💄", intro: "Enhance, don't hide.",
        blocks: [
          { h: "Everyday confidence", items: ["A 5-minute everyday face", "Groomed brows", "A coat of mascara", "A little blush for life", "A lip product you love", "Simple looks that feel like you"] },
        ] },
      { n: "Perfume", ic: "🌸", intro: "A small ritual that becomes part of your identity.",
        blocks: [
          { h: "Your signature", items: ["Finding your scent style", "Everyday vs. special occasion", "How and where to apply fragrance", "Layering scents", "Creating memories through scent"] },
        ],
        future: "Vanessa's favorites and recommendations are coming to this space." },
      { n: "Jewelry", ic: "💎", intro: "The little details that make an ordinary day feel special.",
        blocks: [
          { h: "The details", items: ["Everyday pieces you never take off", "A signature piece that's yours", "Simple, effortless styling", "Wearing something just because you love it"] },
        ] },
      { n: "Nails", ic: "💅", intro: "Small details that make you feel polished.",
        blocks: [
          { h: "Cared-for hands", items: ["Simple at-home care", "Nail health basics", "Colors and styles you enjoy", "Easy maintenance ideas"] },
        ] },
      { n: "Wardrobe", ic: "👗", intro: "Getting dressed in a way that feels like you.",
        blocks: [
          { h: "Dressing like you", items: ["Outfit formulas that always work", "Closet basics worth having", "Finding your personal style", "Pieces that make you feel confident", "Dressing for your current season of life"] },
        ] },
      { n: "Spa Night", ic: "🛁", intro: "Create moments that feel luxurious at home.",
        blocks: [
          { h: "A cozy reset", items: ["A slow shower ritual", "Body care you enjoy", "A hair mask", "A candle and some music", "A cozy evening reset"] },
        ] },
      { n: "Facials", ic: "✨", intro: "Professional skincare and intentional care.",
        blocks: [
          { h: "Intentional care", items: ["What facials actually are", "Common treatments explained", "A little skin education", "Future New Ray services"] },
        ] },
      { n: "Brows", ic: "🪮", intro: "Small details that brighten your features.",
        blocks: [
          { h: "Framing your face", items: ["Grooming basics", "A little shaping education", "Simple maintenance"] },
        ] },
      { n: "Lips", ic: "💋", intro: "A tiny ritual that makes you feel cared for.",
        blocks: [
          { h: "Soft and cared for", items: ["Lip hydration", "Lip products you love", "Simple everyday care"] },
        ] },
      { n: "Body Care", ic: "🧴", intro: "Caring for the skin you're in, gently.",
        blocks: [
          { h: "Everyday softness", items: ["Moisturizing after a shower", "A body oil or butter you love", "Gentle exfoliation now and then", "A scent that feels like you"] },
        ] },
    ] },
  { id: "mind", emoji: "🧠", name: "Mind", grad: "linear-gradient(135deg,#C6A3E0,#8A5EB0)",
    intro: "Mental restoration, not productivity.",
    cards: [
      { n: "Reading", ic: "📖", intro: "A quiet escape that's just yours.",
        blocks: [{ h: "A reading ritual", items: ["Creating a reading ritual you look forward to", "Choosing books that pull you in", "Even one page counts"] }] },
      { n: "Journaling", ic: "🖋️", intro: "Getting what's in your head onto the page.",
        blocks: [{ h: "On the page", items: ["A brain dump to clear your mind", "A few lines of gratitude", "Gentle reflection prompts"] }] },
      { n: "Breathing", ic: "🌬️", intro: "A reset you can do anywhere, anytime.",
        blocks: [{ h: "Come back to calm", items: ["Long-exhale breathing", "Short calming moments through the day"] }] },
      { n: "Quiet Time", ic: "🕊️", intro: "Moments without input, just for you.",
        blocks: [{ h: "Stillness", items: ["Coffee alone, uninterrupted", "Sitting outside for a few minutes", "Time without a screen or a task"] }] },
      { n: "Music", ic: "🎧", intro: "The fastest way to shift how you feel.",
        blocks: [{ h: "Sound as care", items: ["Playlists for different moods", "Music to shift your energy", "Listening as its own kind of self-care"] }] },
      { n: "Gratitude", ic: "🤍", intro: "Noticing what's already good.",
        blocks: [{ h: "Small joys", items: ["Noticing the small joys", "A daily moment of reflection"] }] },
      { n: "Visualization", ic: "🌙", intro: "Picturing the woman you're becoming.",
        blocks: [{ h: "Future self", items: ["Imagining your future self", "Getting clear on what you want", "Growing into your identity"] }] },
      { n: "Learning", ic: "📚", intro: "Feeding your curiosity.",
        blocks: [{ h: "Stay curious", items: ["Learning a new skill", "Following your curiosity, just because"] }] },
      { n: "Creating", ic: "🎨", intro: "Making something that's only yours.",
        blocks: [{ h: "Make something", items: ["Art in any form", "A hobby you love", "Creativity with no goal but joy"] }] },
      { n: "Reflection", ic: "💭", intro: "Looking back to see how far you've come.",
        blocks: [{ h: "Recognizing growth", items: ["Looking back gently", "Recognizing your own growth"] }] },
    ] },
  { id: "lifestyle", emoji: "🌿", name: "Lifestyle", grad: "linear-gradient(135deg,#B9D4A8,#7FA054)",
    intro: "Creating a life you enjoy living.",
    cards: [
      { n: "Flowers", ic: "🌸", intro: "Bringing a little beauty into your space.",
        blocks: [{ h: "Beauty at home", items: ["Bringing beauty into your space", "Simple arrangements you can do yourself"] }] },
      { n: "Baking", ic: "🧁", intro: "Creating something warm with your hands.",
        blocks: [{ h: "Comfort and creating", items: ["The joy of creating", "Comfort in the process", "Something to share"] }] },
      { n: "Photography", ic: "📷", intro: "Learning to see beauty everywhere.",
        blocks: [{ h: "Capturing moments", items: ["Capturing the moments you love", "Learning to see beauty in the ordinary"] }] },
      { n: "Violin", ic: "🎻", intro: "Returning to a passion that's yours.",
        blocks: [{ h: "Your own thing", items: ["Returning to a passion", "Creativity for its own sake", "An identity outside your responsibilities"] }] },
      { n: "Gardening", ic: "🌱", intro: "Slowing down and watching things grow.",
        blocks: [{ h: "Growth and nature", items: ["The rhythm of growth", "A quiet connection with nature"] }] },
      { n: "Date Yourself", ic: "🍷", intro: "Enjoying your own company, on purpose.",
        blocks: [{ h: "Solo joy", items: ["A coffee shop by yourself", "A slow hour in a bookstore", "Solo outings, just because"] }] },
      { n: "Farmer's Market", ic: "🧺", intro: "The pleasure of slow, seasonal living.",
        blocks: [{ h: "Slow living", items: ["The rhythm of slow living", "Seasonal experiences to look forward to"] }] },
      { n: "Sunrise Walk", ic: "🌅", intro: "A quiet start that's entirely yours.",
        blocks: [{ h: "Fresh air", items: ["Fresh air first thing", "A few quiet moments before the day begins"] }] },
      { n: "Creative Hobby", ic: "🎨", intro: "Making time for the things that light you up.",
        blocks: [{ h: "Time for you", items: ["Making time for yourself", "Doing something purely because you love it"] }] },
    ] },
]
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
  const mode = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "evening"
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
  const [myFoods, setMyFoods] = useState([])
  const [saveFoodName, setSaveFoodName] = useState(null)
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
    setNutrition(null); setFoodDays({}); setSavedFoods([]); setMyFoods([]); setMyMeals([]); setMyFoods([]); setRecentFoods([]); setWeekPlan({}); setGroceryManual([]); setGroceryChecked({}); setPlanView(null); setNourishView("today")
    setPct(50); setFactors([]); setSupports([]); setOneThing("")
    setProgramId(null); setWoLog([]); setSetupData(null); setFirstName("")
    setCycleLength(""); setLastPeriod(""); setPeriodDismissed(false)
    setTab("today"); setBodyView("gym")
    try {
      ["nr_today_cap", "nr_program", "nr_program_start", "nr_workout_log", "nr_name", "nr_setup", "cap_cycle_length", "cap_last_period", "nr_bloom_notes", "nr_nutrition", "nr_food_days", "nr_saved_foods", "nr_my_foods", "nr_my_meals", "nr_my_foods", "nr_recent_foods", "nr_week_plan", "nr_grocery_manual", "nr_grocery_checked"].forEach((k) => localStorage.removeItem(k))
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
  const saveMyFoods = (arr) => { setMyFoods(arr); try { localStorage.setItem("nr_my_foods", JSON.stringify(arr)) } catch (e) {} }
  // Resolve a food id across the starter set, the user's own foods, and favorites.
  const findFood = (id) => STARTER_FOODS.find((x) => x.id === id) || myFoods.find((x) => x.id === id) || savedFoods.find((x) => x.id === id) || null
  const saveMyMeals = (arr) => { setMyMeals(arr); try { localStorage.setItem("nr_my_meals", JSON.stringify(arr)) } catch (e) {} }
  // Log a New Ray recipe meal straight into a meal slot
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

  if (user && !setupData && introStep < 2) {
    const envS = ENV(new Date().getHours(), null)
    if (introStep === 0) {
      return (
        <><Fonts /><GlobalStyle />
          <div style={{ background: envS.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -20, fontSize: 130, opacity: 0.08 }}>🌸</div>
            <div style={{ position: "absolute", bottom: 40, left: -24, fontSize: 90, opacity: 0.07 }}>🌷</div>
            <div className="fade-in" style={{ position: "relative" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#C9558E", marginBottom: 20 }}>New Ray</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 40, color: envS.dark ? "#FFF6EC" : "#3D2545", lineHeight: 1.1, marginBottom: 24 }}>Welcome to<br />New Ray</h1>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 21, color: envS.dark ? "#F0C879" : "#C9558E", lineHeight: 1.35, marginBottom: 22 }}>Your capacity changes every day.</div>
              <p style={{ fontSize: 15.5, color: envS.dark ? "rgba(255,246,236,0.9)" : "#5A4458", lineHeight: 1.7, marginBottom: 14 }}>Some days you have energy to build. Some days you're simply trying to make it through.</p>
              <p style={{ fontSize: 15.5, color: envS.dark ? "rgba(255,246,236,0.9)" : "#5A4458", lineHeight: 1.7, marginBottom: 40 }}>New Ray helps you stop fighting your body and start working with it — by matching your workouts, nutrition, recovery, and support to the version of you that showed up today.</p>
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
              <div style={{ fontSize: 14, color: envS.dark ? "rgba(255,246,236,0.85)" : "#5A4458", lineHeight: 1.6 }}>It changes every day. New Ray changes with you.</div>
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
        const cc = computeCycle(cycleLength, lastPeriod, new Date(d.dateISO + "T00:00:00"))
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
      const chooseIt = () => { persistProgram(p.id); setDetailProgram(null) }
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
                  <button onClick={() => persistProgram(p.id)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: p.grad, color: "#fff", fontSize: 13, fontWeight: 700 }}>Choose</button>
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
      const recovery = pct < 15
      const capKey = recovery ? "recovery" : cur
      const session = buildSession(programId, sched.weekday, capKey)
      const phase = phaseFor(programId, sched.week)
      const _coachBank = (PROGRAM_COACH_LINES[programId] && PROGRAM_COACH_LINES[programId][recovery ? "recovery" : cur]) || COACH_LINES[recovery ? "recovery" : cur] || []
      const coachLine = _coachBank[sched.week % _coachBank.length] || ""
      const version = CAP_VERSION[recovery ? "red" : cur]
      // --- Workout selection: recommendation vs. manual selection ---
      // recommendedWorkout = today's scheduled template key (never overwritten)
      const recommendedWorkout = (PROGRAM_SCHEDULE[programId] || [])[sched.weekday] || "recovery"
      // A manual selection only applies if it's a real, non-recovery template in this program
      const validSelected = selectedWoKey && WORKOUT_TEMPLATES[selectedWoKey] ? selectedWoKey : null
      // activeWorkout = selectedWorkout ?? recommendedWorkout
      // In "train anyway" mode where the recommendation is recovery, fall back to the first real workout.
      const firstRealKey = (PROGRAM_SCHEDULE[programId] || []).find((k) => k !== "recovery" && WORKOUT_TEMPLATES[k])
      const activeWorkout = validSelected || (recommendedWorkout === "recovery" ? (firstRealKey || recommendedWorkout) : recommendedWorkout)
      // Capacity TIER is separate from workout CATEGORY. Below 15% the default is recovery, but
      // "Train anyway" trains the Red-day version (never green/yellow). At 15-35% cur is already "red".
      const activeTier = recovery ? (forceTrainMenu ? "red" : "recovery") : cur
      const scheduleKey = recommendedWorkout
      const isRest = activeWorkout === "recovery"
      // Build the session from the ACTIVE workout template, not just the weekday
      const activeTpl = WORKOUT_TEMPLATES[activeWorkout] || null
      const activeSession = activeTpl ? { slots: activeTpl.slots, title: activeTpl.title, focus: activeTpl.focus } : session
      const woType2 = activeSession.slots[0] ? activeSession.slots[0].pattern : "walk"
      const typeLabel = activeSession.title
      const isManual = !!validSelected && validSelected !== recommendedWorkout
      const mins = version.mins
      const heroGrad = recovery ? "linear-gradient(135deg,#8A6FA8,#5E4578)" : HERO_GRAD[cur]
      const pctThroughWeeks = Math.round((sched.week / prog.weeks) * 100)
      const programComplete = sched.complete
      // Coach insight: rotating message + history-aware opener
      const todayISO = new Date().toISOString().slice(0, 10)
      const insightCap = recovery ? "recovery" : cur
      const insightTitle = COACH_INSIGHT_TITLE[insightCap]
      const insightBank = COACH_INSIGHTS[insightCap]
      let insightMsg = insightBank[dayIndex(insightBank.length)]
      // History-aware touch: if a recent (<=2 days) workout hit the same area, acknowledge recovery
      const area = bodyAreaOf(typeLabel)
      const recentSame = area && woLog.some((w) => {
        const days = (new Date(todayISO + "T12:00:00") - new Date(w.date + "T12:00:00")) / 86400000
        return days > 0 && days <= 2 && bodyAreaOf(w.type) === area
      })
      const recentDiff = area && woLog.some((w) => {
        const days = (new Date(todayISO + "T12:00:00") - new Date(w.date + "T12:00:00")) / 86400000
        return days > 0 && days <= 2 && bodyAreaOf(w.type) && bodyAreaOf(w.type) !== area
      })
      if (insightCap === "green" && recentDiff) insightMsg = `Your ${area} has recovered well since your last session, and your energy is here today. A great opportunity to build while respecting tomorrow.`
      else if (insightCap === "yellow" && recentSame) insightMsg = `You trained similar muscles recently, so today's lighter session lets them keep recovering while you hold onto your momentum.`
      // Workouts the user can manually choose within this program.
      // Walk/mobility schedule days ("walk+mobility", "walk+recovery") map to the real walk template.
      const walkTplKey = WORKOUT_TEMPLATES[programId + ":walk"] ? programId + ":walk" : (WORKOUT_TEMPLATES["move:walk"] ? "move:walk" : null)
      const resolveSchedKey = (k) => {
        if (WORKOUT_TEMPLATES[k]) return k
        if (k === "walk+mobility" || k === "walk+recovery" || k === "conditioning" || k === "walk") return walkTplKey
        return null
      }
      const progSchedRaw = [...new Set((PROGRAM_SCHEDULE[programId] || []).filter((k) => k !== "recovery"))]
      const _seenTpl = {}
      const manualOptions = progSchedRaw.map((k) => {
        const tplKey = resolveSchedKey(k)
        if (!tplKey || !WORKOUT_TEMPLATES[tplKey] || _seenTpl[tplKey]) return null
        _seenTpl[tplKey] = true
        return { key: tplKey, title: WORKOUT_TEMPLATES[tplKey].title, pattern: (WORKOUT_TEMPLATES[tplKey].slots[0] || {}).pattern }
      }).filter(Boolean)
      // Ensure a Walk option is always present if the program's week includes any walking day.
      const hasWalkDay = (PROGRAM_SCHEDULE[programId] || []).some((k) => k.includes("walk") || k === "conditioning")
      if (walkTplKey && hasWalkDay && !manualOptions.some((o) => o.key === walkTplKey)) {
        manualOptions.push({ key: walkTplKey, title: WORKOUT_TEMPLATES[walkTplKey].title, pattern: (WORKOUT_TEMPLATES[walkTplKey].slots[0] || {}).pattern })
      }
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
                <div key={i} onClick={() => { const tgt = target === "self" ? programId : target; persistProgram(tgt || null) }} style={{ padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{t}</div>
                  <div style={{ fontSize: 12, color: BASE.taupe, marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                </div>
              ))}
              <div style={{ height: 20 }} />
            </div>
            )
          })() : ((recovery || isRest) && !forceTrainMenu) ? (
            <>
              <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#B9A0CE,#7E5E9E)", color: "#fff", boxShadow: "0 14px 32px rgba(120,80,130,0.3)", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -28, top: -28, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
                <svg style={{ position: "absolute", right: 22, top: 20, opacity: 0.8 }} width="34" height="34" viewBox="0 0 40 40"><path d="M28 4 A 16 16 0 1 0 36 22 A 12.5 12.5 0 0 1 28 4 Z" fill="#F0E3B8" /></svg>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "rgba(255,255,255,0.8)", position: "relative" }}>TODAY'S VERSION</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, margin: "6px 0 10px", position: "relative" }}>Recovery</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.94)", lineHeight: 1.6, position: "relative" }}>Recovery is part of the program, not a break from it. Your body gets stronger when it has time to rebuild.</div>
              </div>

              <div style={{ borderRadius: 18, background: "linear-gradient(135deg,rgba(168,123,209,0.1),rgba(126,94,158,0.1))", border: "1px solid rgba(168,123,209,0.3)", padding: "18px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -14, top: -14, fontSize: 54, opacity: 0.1 }}>🌙</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#9B6BC3", marginBottom: 7, position: "relative" }}>{COACH_INSIGHT_TITLE.recovery}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: BASE.cream, lineHeight: 1.5, position: "relative" }}>{COACH_INSIGHTS.recovery[dayIndex(COACH_INSIGHTS.recovery.length)]}</div>
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

              <button onClick={() => { setRecoveryDone(true) }} style={{ width: "100%", marginTop: 6, padding: 16, borderRadius: 16, border: "none", cursor: "pointer", background: recoveryDone ? "rgba(168,123,209,0.15)" : "linear-gradient(135deg,#B9A0CE,#8A6FA8)", color: recoveryDone ? "#8A6FA8" : "#fff", fontSize: 15.5, fontWeight: 800, boxShadow: recoveryDone ? "none" : "0 10px 26px rgba(138,111,168,0.35)" }}>{recoveryDone ? "Recovery logged \u2713 well done" : "Start Recovery"}</button>

              <div onClick={() => { setForceTrainMenu(true); setSelectedWoKey(null) }} style={{ textAlign: "center", marginTop: 14, fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer" }}>Train anyway {"\u2192"}</div>
              <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", marginTop: 4, fontStyle: "italic", lineHeight: 1.5 }}>No shame in it — recovery is just today's recommendation, not a rule.</div>
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
                <div style={{ fontSize: 12.5, color: BASE.creamDim, fontStyle: "italic", marginBottom: 12 }}>{activeSession.focus}</div>
                {activeSession.slots.map((sl, i) => { const m = MOVEMENTS.find((x) => x.id === sl.pattern) || { pattern: sl.pattern, group: "" }; return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < activeSession.slots.length - 1 ? `1px solid ${BASE.border}` : "none" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(168,123,209,0.15)", color: "#A87BD1", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13.5, color: BASE.cream, fontWeight: 600 }}>{m.pattern}</span>
                    <span style={{ fontSize: 10, color: BASE.taupe, textTransform: "capitalize" }}>{sl.role}</span>
                  </div>
                )})}
                <div style={{ fontSize: 10.5, color: BASE.taupe, marginTop: 10, fontStyle: "italic" }}>Your coach picks the exact exercise for each slot from the movement library.</div>
              </div>

              <div style={{ borderRadius: 18, background: "linear-gradient(135deg,rgba(233,132,180,0.09),rgba(168,123,209,0.09))", border: "1px solid rgba(168,123,209,0.28)", padding: "18px 20px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -14, top: -14, fontSize: 54, opacity: 0.1 }}>🤍</div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C9558E", marginBottom: 7, position: "relative" }}>{insightTitle}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: BASE.cream, lineHeight: 1.5, position: "relative" }}>{insightMsg}</div>
              </div>

              <button onClick={() => { setWoColor(cur); setWoKey(activeWorkout); setWoTier(activeTier); setWoType(woType2); setTrainView("workout") }} style={{ width: "100%", padding: 18, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 17, fontWeight: 800, boxShadow: "0 10px 26px rgba(168,123,209,0.4)", marginBottom: 16 }}>{isManual ? `Start ${typeLabel}` : `Start Recommended: ${typeLabel}`}</button>

              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>Or choose another workout</div>
              <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 12, lineHeight: 1.5 }}>Today's recommendation fits your capacity best, but your life is yours. Pick anything in your program — you won't fall behind.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {manualOptions.map((mo) => {
                  const isRec = mo.key === recommendedWorkout
                  const isSel = mo.key === activeWorkout
                  return (
                    <div key={mo.key} onClick={() => { setSelectedWoKey(mo.key === recommendedWorkout ? null : mo.key) }} style={{ padding: "13px 14px", borderRadius: 13, background: isSel ? "linear-gradient(135deg,rgba(233,132,180,0.16),rgba(168,123,209,0.16))" : BASE.surface, border: `1px solid ${isSel ? "#C9558E" : BASE.border}`, cursor: "pointer" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{mo.title}</div>
                      {isRec && <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: "#C9558E", textTransform: "uppercase", marginTop: 2 }}>Recommended</div>}
                      {isSel && !isRec && <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: "#C9558E", textTransform: "uppercase", marginTop: 2 }}>Selected</div>}
                    </div>
                  )
                })}
              </div>

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
            <button onClick={() => { if (confirm("Change your program? Your progress in the current one is kept, but a new program starts today.")) { persistProgram(null) } }} style={{ flex: 1, padding: 11, borderRadius: 12, background: "transparent", color: BASE.creamDim, border: `1px solid ${BASE.border}`, cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>Change Program</button>
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
                <div style={{ marginTop: 12, height: 90, borderRadius: 10, background: "linear-gradient(135deg,rgba(233,132,180,0.15),rgba(168,123,209,0.15))", display: "flex", alignItems: "center", justifyContent: "center", color: BASE.taupe, fontSize: 11, fontStyle: "italic" }}>🎬 Video guides are on the way</div>
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

    if (tab === "body" && bodyView === "cycle") {
      const setup = cycleNow != null
      const now = new Date()
      const viewDate = new Date(now.getFullYear(), now.getMonth() + cycleMonth, 1)
      const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
      const startWeekday = (firstDay.getDay() + 6) % 7 // Mon=0
      const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
      const todayISOstr = now.toISOString().slice(0, 10)
      const cells = []
      for (let i = 0; i < startWeekday; i++) cells.push(null)
      for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))
      const cur = cycleNow ? CYCLE_PHASES[cycleNow.phase] : null
      // Actual logged capacity by date (from check-in history) — the second overlay layer.
      const capByDate = {}
      history.forEach((h) => { if (h.dateISO && h.color) capByDate[h.dateISO] = h.color })
      const CAP_DOT = { red: "#D65C4E", yellow: "#E8B84B", green: "#7FA054" }
      // "Tracking from" line
      const trackFrom = lastPeriod ? new Date(lastPeriod + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null
      // Period check-in: is a new period likely due? (cycle day rolled back near 1)
      const periodDue = cycleNow && cycleNow.day >= (cycleNow.length - 1) && !periodDismissed
      // Four-phase capacity analysis (observation only, never prediction or prescription).
      // Each check-in is assigned to the phase that was active ON ITS DATE via computeCycle,
      // so editing cycle dates automatically re-buckets history on next render (rule 7).
      const PHASE_KEYS = ["menstrual", "follicular", "ovulation", "luteal"]
      const PHASE_LABEL = { menstrual: "Menstrual", follicular: "Follicular", ovulation: "Ovulatory", luteal: "Luteal" }
      const PHASE_MIN = 3 // minimum check-ins in a phase before we describe it as a pattern
      const phaseStats = { menstrual: { n: 0, sum: 0, colors: {} }, follicular: { n: 0, sum: 0, colors: {} }, ovulation: { n: 0, sum: 0, colors: {} }, luteal: { n: 0, sum: 0, colors: {} } }
      let analyzedTotal = 0
      history.forEach((h) => {
        if (!h.dateISO || !h.color) return
        const cc = computeCycle(cycleLength, lastPeriod, new Date(h.dateISO + "T00:00:00"))
        if (!cc || !phaseStats[cc.phase]) return
        const st = phaseStats[cc.phase]
        st.n++
        if (typeof h.pct === "number") st.sum += h.pct
        // Derive a display tier that includes Recovery (<15%) as its own bucket
        const tier = (typeof h.pct === "number" && h.pct < 15) ? "recovery" : h.color
        st.colors[tier] = (st.colors[tier] || 0) + 1
        analyzedTotal++
      })
      const CAP_WORD = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
      const CAP_COLOR = { green: "#7FA054", yellow: "#E8B84B", red: "#D65C4E", recovery: "#A87BD1" }
      const phaseAvg = (ph) => { const st = phaseStats[ph]; return st.n ? Math.round(st.sum / st.n) : null }
      const phaseTop = (ph) => { const c = phaseStats[ph].colors; const keys = Object.keys(c); if (!keys.length) return null; return keys.sort((a, b) => c[b] - c[a])[0] }
      const phasesWithEnough = PHASE_KEYS.filter((p) => phaseStats[p].n >= PHASE_MIN)
      const allFourReady = phasesWithEnough.length === 4
      // Build the narrative summary comparing phases (only among phases with enough data)
      const buildSummary = () => {
        if (!phasesWithEnough.length) return null
        const ranked = [...phasesWithEnough].sort((a, b) => phaseAvg(b) - phaseAvg(a))
        const highest = ranked[0], lowest = ranked[ranked.length - 1]
        if (phasesWithEnough.length >= 2 && phaseAvg(highest) !== phaseAvg(lowest)) {
          return `So far, your check-ins suggest your capacity has tended to run highest during your ${PHASE_LABEL[highest].toLowerCase()} phase and lowest during your ${PHASE_LABEL[lowest].toLowerCase()} phase.`
        }
        return `So far, your capacity has looked relatively steady across the phases you've logged. Keep checking in to see how your rhythm develops.`
      }
      const patternSummary = buildSummary()

      if (!setup) {
        return (
          <div className="fade-in" style={{ padding: "10px 18px 0" }}>
            {editCycle && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(43,27,61,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditCycle(false)}>
                <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: BASE.bg2 || "#FFF9F5", borderRadius: 22, padding: "24px 22px", boxShadow: "0 20px 50px rgba(43,27,61,0.4)" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>Set up your cycle</div>
                  <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.5, marginBottom: 18 }}>This stays private and is only ever context — never a limit.</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>First day of your last period</div>
                  <input type="date" value={tmpStart} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setTmpStart(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, color: BASE.cream, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>Average cycle length: {tmpLen} days</div>
                  <input type="range" min="20" max="45" value={tmpLen} onChange={(e) => setTmpLen(e.target.value)} style={{ width: "100%", marginBottom: 4 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: BASE.taupe, marginBottom: 20 }}><span>20</span><span>45</span></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setEditCycle(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>Cancel</button>
                    <button onClick={saveCycle} disabled={!tmpStart} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", cursor: tmpStart ? "pointer" : "default", background: tmpStart ? "linear-gradient(135deg,#9B6BC3,#5E7FB0)" : BASE.surface2, color: tmpStart ? "#fff" : BASE.taupe, fontSize: 13.5, fontWeight: 700 }}>Save</button>
                  </div>
                  <div onClick={() => { const iso = new Date().toISOString().slice(0, 10); setTmpStart(iso) }} style={{ textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 700, color: "#9B6BC3", cursor: "pointer" }}>My period started today {"\u2192"}</div>
                </div>
              </div>
            )}
            <div style={{ borderRadius: 22, padding: "26px 22px", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
              <div style={{ fontSize: 30 }}>🌙</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginTop: 6 }}>Understand your rhythm. Support your body.</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", marginTop: 6, fontStyle: "italic" }}>Your cycle is information — not a limitation.</div>
            </div>
            <div style={{ textAlign: "center", padding: "26px 20px", borderRadius: 18, background: BASE.surface, border: "1px dashed " + BASE.border }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: BASE.cream, marginBottom: 8 }}>Set up your cycle</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Add your typical cycle length and the start date of your last period, and Cycle will map your phases. This stays private and is only ever context — never a limit.</div>
              <button onClick={() => { setTmpLen("28"); setTmpStart(""); setEditCycle(true) }} style={{ padding: "12px 20px", borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", fontSize: 13.5, fontWeight: 700 }}>Set up my cycle</button>
            </div>
          </div>
        )
      }

      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          {editCycle && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(43,27,61,0.55)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setEditCycle(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: BASE.bg2 || "#FFF9F5", borderRadius: 22, padding: "24px 22px", boxShadow: "0 20px 50px rgba(43,27,61,0.4)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>Edit your cycle</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.5, marginBottom: 18 }}>Update these anytime your cycle changes. You're always in control of this.</div>

                <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>First day of your last period</div>
                <input type="date" value={tmpStart} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setTmpStart(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, color: BASE.cream, fontSize: 14, marginBottom: 16, outline: "none", boxSizing: "border-box" }} />

                <div style={{ fontSize: 12, fontWeight: 700, color: BASE.creamDim, marginBottom: 6 }}>Average cycle length: {tmpLen} days</div>
                <input type="range" min="20" max="45" value={tmpLen} onChange={(e) => setTmpLen(e.target.value)} style={{ width: "100%", marginBottom: 4 }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: BASE.taupe, marginBottom: 20 }}><span>20</span><span>45</span></div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setEditCycle(false)} style={{ flex: 1, padding: 13, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>Cancel</button>
                  <button onClick={saveCycle} disabled={!tmpStart} style={{ flex: 1, padding: 13, borderRadius: 12, border: "none", cursor: tmpStart ? "pointer" : "default", background: tmpStart ? "linear-gradient(135deg,#9B6BC3,#5E7FB0)" : BASE.surface2, color: tmpStart ? "#fff" : BASE.taupe, fontSize: 13.5, fontWeight: 700 }}>Save</button>
                </div>
                <div onClick={() => { const iso = new Date().toISOString().slice(0, 10); setTmpStart(iso) }} style={{ textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 700, color: "#9B6BC3", cursor: "pointer" }}>My period started today {"\u2192"}</div>
              </div>
            </div>
          )}
          <div style={{ borderRadius: 22, padding: "24px 22px", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", marginBottom: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ fontSize: 28 }}>🌙</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>Understand your rhythm. Support your body.</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.92)", marginTop: 6, fontStyle: "italic" }}>Your cycle is information — not a limitation.</div>
            <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setEditCycle(true) }} style={{ marginTop: 14, padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{"\u2699\ufe0f Edit Cycle"}</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => setCycleMonth(cycleMonth - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: BASE.taupe, fontSize: 18, padding: "0 8px" }}>{"\u2039"}</button>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>{monthLabel}</div>
            <button onClick={() => setCycleMonth(cycleMonth + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: BASE.taupe, fontSize: 18, padding: "0 8px" }}>{"\u203a"}</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (<div key={i} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: BASE.taupe }}>{d}</div>))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 14 }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={i} />
              const iso = cell.toISOString().slice(0, 10)
              const c = computeCycle(cycleLength, lastPeriod, cell)
              const ph = c ? CYCLE_PHASES[c.phase] : null
              const isToday = iso === todayISOstr
              const capColor = capByDate[iso]
              const isPast = cell <= now
              return (
                <div key={i} style={{ aspectRatio: "1", borderRadius: 9, background: ph ? ph.soft : "transparent", border: isToday ? "2px solid " + (ph ? ph.color : "#C9558E") : "1px solid transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 600, color: ph ? ph.color : BASE.taupe }}>{cell.getDate()}</div>
                  {c && <div style={{ fontSize: 7.5, color: ph.color, opacity: 0.8 }}>d{c.day}</div>}
                  <div style={{ position: "absolute", top: 3, right: 3, width: 6, height: 6, borderRadius: "50%", background: capColor ? CAP_DOT[capColor] : "transparent", border: capColor ? "none" : (isPast ? "1px solid rgba(150,140,150,0.35)" : "none") }} />
                </div>
              )
            })}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, justifyContent: "center" }}>
            {CYCLE_PHASE_ORDER.map((k) => { const ph = CYCLE_PHASES[k]; return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: ph.color }} /><span style={{ fontSize: 10.5, color: BASE.taupe }}>{ph.name.replace(" Phase", "")}</span></div>
            )})}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12, justifyContent: "center", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: BASE.taupe, fontWeight: 700 }}>Your capacity:</span>
            {[["green", "Green"], ["yellow", "Yellow"], ["red", "Red"]].map(([k, lbl]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: CAP_DOT[k] }} /><span style={{ fontSize: 10, color: BASE.taupe }}>{lbl}</span></div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: "50%", border: "1px solid rgba(150,140,150,0.5)" }} /><span style={{ fontSize: 10, color: BASE.taupe }}>No check-in</span></div>
          </div>
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", lineHeight: 1.5, marginBottom: 6 }}>Two layers: the day's color is your estimated cycle phase, the dot is the capacity you actually logged. Over time, your own patterns show themselves.</div>
          {trackFrom && (
            <div style={{ padding: "12px 14px", borderRadius: 12, background: BASE.surface, border: "1px solid " + BASE.border, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, color: BASE.taupe }}>Tracking from: <b style={{ color: BASE.creamDim }}>{trackFrom}</b> {"\u00b7"} {cycleNow.length}-day cycle</div>
                <button onClick={() => { setTmpLen(String(cycleNow.length)); setTmpStart(lastPeriod || ""); setEditCycle(true) }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9B6BC3", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{"\u270f\ufe0f Edit"}</button>
              </div>
              <button onClick={() => { const iso = new Date().toISOString().slice(0, 10); setLastPeriod(iso); try { window.localStorage.setItem("cap_last_period", iso) } catch (e) {}; if (user && db) { try { db.from("profiles").update({ setup: { ...(setupData || {}), lastPeriod: iso } }).eq("id", user.id).then(() => {}) } catch (e) {} }; setPeriodDismissed(true) }} style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px dashed rgba(155,107,195,0.4)", background: "rgba(155,107,195,0.06)", color: "#9B6BC3", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{"\ud83c\udf19 My period started today"}</button>
            </div>
          )}

          {periodDue && (
            <div style={{ borderRadius: 16, background: "rgba(155,107,195,0.1)", border: "1px solid rgba(155,107,195,0.35)", padding: "16px 18px", marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream, marginBottom: 3 }}>Did your period start today?</div>
              <div style={{ fontSize: 12, color: BASE.taupe, marginBottom: 12, lineHeight: 1.5 }}>One tap keeps your calendar accurate — no digging through settings.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { const iso = new Date().toISOString().slice(0, 10); setLastPeriod(iso); try { window.localStorage.setItem("cap_last_period", iso) } catch (e) {}; if (user && db) { try { db.from("profiles").update({ setup: { ...(setupData || {}), lastPeriod: iso } }).eq("id", user.id).then(() => {}) } catch (e) {} } }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#9B6BC3,#5E7FB0)", color: "#fff", fontSize: 13, fontWeight: 700 }}>Yes, today</button>
                <button onClick={() => { setPeriodDismissed(true) }} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid " + BASE.border, background: "transparent", color: BASE.creamDim, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Not yet</button>
              </div>
            </div>
          )}

          <div style={{ borderRadius: 18, background: cur.soft, border: "1px solid " + cur.color, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: cur.color, textTransform: "uppercase" }}>Cycle Day {cycleNow.day}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: BASE.cream, margin: "2px 0 8px" }}>{cur.emoji} {cur.name}</div>
            <div style={{ fontSize: 13.5, color: BASE.cream, lineHeight: 1.5, marginBottom: 12 }}>{cur.insight}</div>
            {cur.suggestions.map((sg, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: cur.color }} /><span style={{ fontSize: 12.5, color: BASE.creamDim }}>{sg}</span></div>))}
          </div>

          {cycleNow.phase === "menstrual" && cycleNow.day <= 2 && (
            <div style={{ borderRadius: 18, background: "linear-gradient(135deg,rgba(201,123,168,0.14),rgba(126,94,158,0.14))", border: "1px solid rgba(201,123,168,0.3)", padding: "18px 20px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 20 }}>🍫</span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: BASE.cream }}>A Little Comfort</span></div>
              <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 10 }}>Your body is asking for care today. Enjoyment and nourishment can both be part of wellness.</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{["A favorite sweet treat", "A warm drink", "A comfort meal"].map((it, i) => (<span key={i} style={{ fontSize: 11.5, color: "#B36B93", background: "rgba(201,123,168,0.12)", padding: "5px 11px", borderRadius: 999 }}>{it}</span>))}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: "#B36B93" }}>Pleasure is part of taking care of yourself.</div>
            </div>
          )}

          <div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 16 }}>🔄</span><span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>Your cycle is one piece of your capacity picture.</span></div>
            <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55 }}>Sleep, stress, motherhood, work, life demands, and recovery all matter too. Cycle offers context — but you always choose your capacity for the day. Nothing here is assigned for you.</div>
          </div>


          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Understand each phase</div>
          <div style={{ fontSize: 12.5, color: BASE.taupe, marginBottom: 14 }}>Tap any phase to learn what's happening and how to support yourself.</div>
          {CYCLE_PHASE_ORDER.map((k) => {
            const ph = CYCLE_PHASES[k]
            const open = eduPhase === k
            return (
              <div key={k} style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + (open ? ph.color : BASE.border), marginBottom: 10, overflow: "hidden" }}>
                <div onClick={() => setEduPhase(open ? null : k)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", cursor: "pointer" }}>
                  <span style={{ width: 12, height: 12, borderRadius: "50%", background: ph.color }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700, color: BASE.cream }}>{ph.emoji} {ph.name}</div><div style={{ fontSize: 11, color: BASE.taupe }}>{ph.meaning}</div></div>
                  <span style={{ color: BASE.taupe }}>{open ? "\u2212" : "+"}</span>
                </div>
                {open && (
                  <div className="fade-in" style={{ padding: "0 16px 16px" }}>
                    {ph.edu.map(([sec, body], i) => (<div key={i} style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: ph.color, textTransform: "uppercase", marginBottom: 3 }}>{sec}</div><div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{body}</div></div>))}
                    <div style={{ borderRadius: 10, background: ph.soft, padding: "10px 13px", marginTop: 4 }}><div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14, color: BASE.cream }}>{ph.message}</div></div>
                  </div>
                )}
              </div>
            )
          })}
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", margin: "8px 0 20px", lineHeight: 1.6 }}>Cycle context can appear in Train and Nourish over time — but your capacity always decides today. You can always train.</div>
          <div style={{ height: 10 }} />
        </div>
      )
    }

    if (tab === "body" && bodyView === "nourish") {
      const capKey = checkedIn ? (pct < 15 ? "recovery" : cur) : "yellow"
      const nc = NOURISH_CAP[capKey]
      const plan = nutrition && nutrition.planId ? PLAN_BY_ID(nutrition.planId) : null
      const targets = nutrition && nutrition.targets ? nutrition.targets : null
      const today0 = new Date().toISOString().slice(0, 10)
      const dayRec = foodDays[logDate] || { items: [], water: 0 }
      const dayItems = dayRec.items || []
      const water = dayRec.water || 0
      const eaten = sumEntries(dayItems)
      const isToday = logDate === today0
      const shiftDate = (n) => { const d = new Date(logDate + "T12:00:00"); d.setDate(d.getDate() + n); const iso = d.toISOString().slice(0, 10); if (iso <= today0) { setLogDate(iso); setAddFoodFor(null); setEntryEdit(null) } }
      const dateLabel = isToday ? "Today" : new Date(logDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      const rem = targets ? { cal: targets.cal - eaten.cal, p: targets.p - eaten.p, c: targets.c - eaten.c, f: targets.f - eaten.f } : null
      const hour = new Date().getHours()
      const nextType = hour < 10 ? "breakfast" : hour < 15 ? "lunch" : hour < 20 ? "dinner" : "snack"
      const nextTypeLabel = (MEAL_TYPES.find((m) => m[0] === nextType) || ["", "Meal"])[1]
      const isPostpartum = setupData && setupData.season === "Postpartum"
      const SoftCard = ({ children, style }) => (<div style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "16px 17px", marginBottom: 12, ...style }}>{children}</div>)
      const Back = ({ to, label }) => (
        <div onClick={to} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039 " + label}</div>
      )
      const MacroRow = ({ label, have, goal, unit, color }) => {
        const pctFill = goal > 0 ? Math.min(100, Math.round((have / goal) * 100)) : 0
        const left = Math.max(0, goal - have)
        return (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{label}</span>
              <span style={{ fontSize: 12, color: BASE.taupe }}>{Math.round(have)} / {goal}{unit}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: pctFill + "%", height: "100%", borderRadius: 999, background: color, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 4 }}>{left > 0 ? `${Math.round(left)}${unit} to go` : "Target met"}</div>
          </div>
        )
      }
      const MealCard = ({ m, onPick, compact }) => (
        <div onClick={() => onPick && onPick(m)} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", marginBottom: 8, cursor: onPick ? "pointer" : "default" }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream, marginBottom: 3 }}>{m.n}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 11.5, color: BASE.taupe }}>
            <span style={{ color: "#E984B4", fontWeight: 700 }}>{m.p}g protein</span>
            <span>{m.cal} cal</span>
            <span>{m.min} min</span>
          </div>
          {!compact && m.tags && <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>{m.tags.slice(0, 3).map((t) => <span key={t} style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 999, background: "rgba(233,132,180,0.12)", color: "#C9558E", fontWeight: 700 }}>{t}</span>)}</div>}
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div style={{ display: "flex", gap: 6, padding: 4, background: "rgba(255,255,255,0.05)", borderRadius: 999, marginBottom: 18 }}>
            {[["today", "🍽 Today"], ["plan", "📋 Plan"], ["supps", "✨ Supps"]].map(([k, lbl]) => (
              <button key={k} onClick={() => { setNourishView(k); setPlanView(null); setSuppOpen(null); setMealOpen(null); setQuickFilter(null) }} style={{ flex: 1, padding: "8px 3px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: nourishView === k ? "#fff" : "transparent", color: nourishView === k ? "#C9558E" : BASE.taupe, boxShadow: nourishView === k ? "0 2px 8px rgba(120,80,130,0.12)" : "none" }}>{lbl}</button>
            ))}
          </div>

          {/* ================= TODAY ================= */}
          {nourishView === "today" && !targets && (
            <div className="fade-in">
              <div style={{ borderRadius: 22, background: "linear-gradient(160deg,#FBEEF4,#EFE7F6)", padding: "34px 24px", textAlign: "center", marginBottom: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -16, right: -10, fontSize: 88, opacity: 0.14 }}>🍽</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: "#3D2545", lineHeight: 1.2, position: "relative" }}>Let's make nourishment easier.</div>
                <div style={{ fontSize: 14, color: "#5A4458", lineHeight: 1.65, marginTop: 12, position: "relative" }}>We'll help you figure out your targets, choose a goal, and turn it into food you can actually eat.</div>
              </div>
              <button onClick={() => { setNourishView("plan"); setPlanView("choose") }} style={{ width: "100%", padding: 17, borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 16, fontWeight: 800, boxShadow: "0 10px 26px rgba(168,123,209,0.35)", marginBottom: 16 }}>Build My Plan</button>
              <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 8 }}>{nc.emoji} {nc.dayTitle}</div>
                <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 10 }}>{nc.reminder}</div>
                <div onClick={() => { setNourishView("plan"); setPlanView("meals") }} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer" }}>Browse meal ideas {"\u203a"}</div>
              </div>
            </div>
          )}

          {nourishView === "today" && targets && !addFoodFor && !entryEdit && !mealEdit && (
            <div className="fade-in">
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 2 }}>Today's Nourishment</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: BASE.taupe, textTransform: "uppercase" }}>Today's plan</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#C9558E" }}>{plan ? plan.emoji + " " + plan.name : "Custom"}</span>
              </div>

              {/* Date navigation */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", borderRadius: 999, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 16 }}>
                <span onClick={() => shiftDate(-1)} style={{ fontSize: 17, color: BASE.creamDim, cursor: "pointer", padding: "0 6px" }}>{"\u2039"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isToday ? "#C9558E" : BASE.cream }}>{dateLabel}</span>
                <span onClick={() => shiftDate(1)} style={{ fontSize: 17, color: isToday ? BASE.border : BASE.creamDim, cursor: isToday ? "default" : "pointer", padding: "0 6px" }}>{"\u203a"}</span>
              </div>

              {/* Protein hero */}
              <div style={{ borderRadius: 20, background: "linear-gradient(160deg,rgba(233,132,180,0.12),rgba(168,123,209,0.1))", border: "1px solid rgba(233,132,180,0.3)", padding: "20px 22px", marginBottom: 14 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", marginBottom: 4 }}>Protein — your priority</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: BASE.cream, lineHeight: 1 }}>{Math.round(eaten.p)}</span>
                  <span style={{ fontSize: 17, color: BASE.taupe }}>/ {targets.p}g</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.09)", overflow: "hidden", margin: "12px 0 7px" }}>
                  <div style={{ width: Math.min(100, Math.round((eaten.p / targets.p) * 100)) + "%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#E984B4,#A87BD1)", transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 13, color: BASE.creamDim, fontWeight: 600 }}>{rem.p > 0 ? `${Math.round(rem.p)}g to go` : "You've hit your protein today \u2713"}</div>
              </div>

              {/* Calories + macros */}
              <div style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>Calories</span>
                  <span style={{ fontSize: 13, color: BASE.taupe }}><span style={{ color: BASE.cream, fontWeight: 700 }}>{Math.round(eaten.cal)}</span> / {targets.cal}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: Math.min(100, Math.round((eaten.cal / targets.cal) * 100)) + "%", height: "100%", borderRadius: 999, background: "#E8B84B" }} />
                </div>
                <div style={{ fontSize: 11, color: BASE.taupe, marginBottom: 18 }}>{rem.cal > 0 ? `About ${Math.round(rem.cal)} left today` : "You've reached your estimate for today"}</div>
                <MacroRow label="Carbohydrates" have={eaten.c} goal={targets.c} unit="g" color="#7FA054" />
                <MacroRow label="Fat" have={eaten.f} goal={targets.f} unit="g" color="#9B6BC3" />
                <div style={{ borderTop: `0.5px solid ${BASE.border}`, paddingTop: 14, marginTop: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>💧 Water</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span onClick={() => setWaterCount(water - 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: BASE.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: BASE.creamDim, fontSize: 16 }}>{"\u2212"}</span>
                      <span style={{ fontSize: 13, color: BASE.cream, fontWeight: 700, minWidth: 54, textAlign: "center" }}>{water} / 8</span>
                      <span onClick={() => setWaterCount(water + 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: BASE.surface2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: BASE.creamDim, fontSize: 16 }}>+</span>
                    </div>
                  </div>
                </div>
                <div onClick={() => setMacrosOpen(!macrosOpen)} style={{ fontSize: 12, fontWeight: 700, color: "#C9558E", cursor: "pointer", marginTop: 14 }}>{macrosOpen ? "\u2212" : "+"} What are macros?</div>
                {macrosOpen && (
                  <div className="fade-in" style={{ marginTop: 10 }}>
                    {MACRO_PLAIN.map((m) => (
                      <div key={m.name} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
                        <span style={{ fontSize: 16 }}>{m.emoji}</span>
                        <div><span style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream }}>{m.name}. </span><span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{m.body}</span></div>
                      </div>
                    ))}
                    <div style={{ fontSize: 12, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.5 }}>Calories are the total energy these three provide. You don't need to understand any of this to use Nourish.</div>
                  </div>
                )}
              </div>

              {/* Today's Food — grouped by meal */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>{isToday ? "Today's food" : "Food logged"}</div>
              {!dayItems.length && (
                <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "22px 20px", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream, marginBottom: 4 }}>Nothing logged yet.</div>
                  <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.6, marginBottom: 14 }}>Start wherever you are. There's no wrong place to begin.</div>
                  <button onClick={() => { setAddFoodFor("breakfast"); setAddTab("search") }} style={{ padding: "11px 20px", borderRadius: 999, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 13, fontWeight: 800 }}>+ Add breakfast</button>
                </div>
              )}
              {MEAL_TYPES.map(([slot, lbl]) => {
                const items = dayItems.filter((x) => x.meal === slot)
                const tot = sumEntries(items)
                return (
                  <div key={slot} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 16px", marginBottom: 9 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: items.length ? 10 : 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.5, color: BASE.cream, textTransform: "uppercase" }}>{lbl}</span>
                      <span style={{ fontSize: 11.5, color: BASE.taupe }}>{items.length ? `${Math.round(tot.cal)} cal · ${r1(tot.p)}g protein` : "Not logged"}</span>
                    </div>
                    {items.map((it) => (
                      <div key={it.id} onClick={() => { const src = findFood(it.foodId); setEntryEdit(src || it.custom ? it : { ...it, custom: { unit: it.unit, per: { cal: it.cal / (Number(it.qty) || 1), p: it.p / (Number(it.qty) || 1), c: it.c / (Number(it.qty) || 1), f: it.f / (Number(it.qty) || 1) } } }); setSaveFoodName("") }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `0.5px solid ${BASE.border}`, cursor: "pointer" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>{it.name}</div>
                          <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{it.qty} {it.unit}{it.qty > 1 && it.unit !== "g" && it.unit !== "oz" ? "s" : ""} · {Math.round(it.cal)} cal · {r1(it.p)}g protein{it.partial ? " · partial entry" : ""}</div>
                        </div>
                        <span style={{ color: BASE.taupe, fontSize: 16 }}>{"\u203a"}</span>
                      </div>
                    ))}
                    <div onClick={() => { setAddFoodFor(slot); setAddTab("search"); setFoodQuery("") }} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer", paddingTop: items.length ? 10 : 0, borderTop: items.length ? `0.5px solid ${BASE.border}` : "none" }}>+ Add food</div>
                  </div>
                )
              })}
              {dayItems.length > 0 && (
                <div onClick={() => { setSaveMealName(""); setMealEdit({ from: logDate }) }} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: BASE.taupe, cursor: "pointer", margin: "10px 0 4px" }}>Save a meal from today's food</div>
              )}
              <div style={{ height: 12 }} />
              {/* What should I eat next */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 8px" }}>What should I eat next?</div>
              <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 12 }}>{rem.p > 5 ? `You have about ${Math.round(rem.p)}g of protein left today. Here are ${nextTypeLabel.toLowerCase()} ideas that would help:` : `You're doing well on your targets. A few ${nextTypeLabel.toLowerCase()} ideas if you're hungry:`}</div>
              {(() => { const goal = Math.min(45, Math.max(15, rem.p)); return MEALS.filter((m) => m.t === nextType).sort((a, b) => Math.abs(a.p - goal) - Math.abs(b.p - goal)).slice(0, 3) })().map((m) => (
                <div key={m.n} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{m.n}</div>
                    <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2 }}><span style={{ color: "#E984B4", fontWeight: 700 }}>~{m.p}g protein</span> · {m.cal} cal · {m.min} min</div>
                  </div>
                  <span onClick={() => logMeal(m, nextType)} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer", flexShrink: 0 }}>Log</span>
                </div>
              ))}
              <div onClick={() => { setNourishView("plan"); setPlanView("meals") }} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer", margin: "4px 2px 20px" }}>See all meal ideas {"\u203a"}</div>

              {/* Quick help */}
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>Quick help</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                {QUICK_HELP.slice(0, 6).map((q) => (
                  <div key={q.label} onClick={() => { setNourishView("plan"); setPlanView("meals"); setMealFilter(q.filter) }} style={{ borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "12px 13px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{q.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BASE.cream }}>{q.label}</span>
                  </div>
                ))}
              </div>
              <div onClick={() => { setNourishView("plan"); setPlanView("eatout") }} style={{ borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
                <span style={{ fontSize: 17 }}>🍴</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, flex: 1 }}>Eating out?</span>
                <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
              </div>

              <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, marginBottom: 18 }}>These targets are estimates to guide you, not rules to obey. Some days you'll need more. That's information, not failure.</div>
            </div>
          )}


          {/* ---- ADD FOOD ---- */}
          {nourishView === "today" && targets && addFoodFor && !foodPick && (() => {
            const slotLabel = (MEAL_TYPES.find((m) => m[0] === addFoodFor) || ["", "Meal"])[1]
            const TABS = [["search", "Search"], ["recent", "Recent"], ["favorites", "Favorites"], ["mymeals", "My Meals"], ["newray", "New Ray"], ["quick", "Quick Add"]]
            const openPick = (food, qty, unit) => setFoodPick({ food, qty: qty || 1, unit: unit || foodUnitList(food)[0].u })
            return (
              <div className="fade-in">
                <Back to={() => { setAddFoodFor(null); setFoodQuery("") }} label={dateLabel} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Add to {slotLabel.toLowerCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {TABS.map(([k, lbl]) => (
                    <button key={k} onClick={() => setAddTab(k)} style={{ flex: "1 1 30%", padding: "9px 6px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: addTab === k ? "#C9558E" : BASE.surface, color: addTab === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
                  ))}
                </div>

                {addTab === "search" && (
                  <>
                    <input value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)} placeholder="Search foods…" style={{ width: "100%", padding: "13px 15px", borderRadius: 13, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14.5, outline: "none", marginBottom: 12 }} />
                    {(() => {
                      const q = foodQuery.trim().toLowerCase()
                      // Your saved/corrected foods come first, then the starter set.
                      const mine = myFoods.filter((x) => !q || x.name.toLowerCase().indexOf(q) >= 0)
                      const std = q ? searchFoods(foodQuery) : []
                      const rows = [...mine, ...std]
                      return rows.map((fd) => (
                        <div key={fd.id} onClick={() => openPick(fd)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${fd.mine ? "rgba(233,132,180,0.4)" : BASE.border}`, marginBottom: 7, cursor: "pointer" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: BASE.cream }}>{fd.name}</span>
                              {fd.mine && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: "#C9558E", background: "rgba(233,132,180,0.14)", padding: "2px 7px", borderRadius: 999 }}>YOURS</span>}
                            </div>
                            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{fd.per100 ? `${fd.per100.cal} cal · ${fd.per100.p}g protein per 100g` : `${fd.fixed.cal} cal · ${fd.fixed.p}g protein per ${foodUnitList(fd)[0].u}`}</div>
                          </div>
                          <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                        </div>
                      ))
                    })()}
                    {foodQuery.trim() && !searchFoods(foodQuery).length && !myFoods.some((x) => x.name.toLowerCase().indexOf(foodQuery.trim().toLowerCase()) >= 0) && (
                      <div style={{ padding: 20, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center" }}>
                        <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 10 }}>Not in the starter food list yet.</div>
                        <div onClick={() => setAddTab("quick")} style={{ fontSize: 12.5, fontWeight: 700, color: "#C9558E", cursor: "pointer" }}>Use Quick Add instead {"\u203a"}</div>
                      </div>
                    )}
                    {!foodQuery.trim() && (
                      <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(233,184,75,0.08)", border: "1px solid rgba(233,184,75,0.25)", fontSize: 12, color: BASE.creamDim, lineHeight: 1.6 }}>Search covers a starter set of {STARTER_FOODS.length} common whole foods for now. For packaged and restaurant foods, use Quick Add or New Ray meals — a full food database is coming.</div>
                    )}
                  </>
                )}

                {addTab === "recent" && (
                  recentFoods.length ? recentFoods.map((r) => (
                    <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 7 }}>
                      <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openPick(r.food, r.qty, r.unit)}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: BASE.cream }}>{r.food.name}</div>
                        <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{r.qty} {r.unit}</div>
                      </div>
                      <span onClick={() => { const en = makeEntry(r.food, r.qty, r.unit, addFoodFor); if (en) { addEntries([en]); rememberRecent(r.food, r.qty, r.unit); setAddFoodFor(null) } }} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>Add</span>
                    </div>
                  )) : <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe }}>Foods you log will show up here for one-tap repeat logging.</div>
                )}

                {addTab === "favorites" && (
                  savedFoods.length ? savedFoods.map((fd) => (
                    <div key={fd.id} onClick={() => openPick(fd)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 15px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 7, cursor: "pointer" }}>
                      <span style={{ fontSize: 14 }}>💗</span>
                      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: BASE.cream }}>{fd.name}</div>
                      <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                    </div>
                  )) : <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Tap the heart when adding a food to save it here for quick access.</div>
                )}

                {addTab === "mymeals" && (
                  myMeals.length ? myMeals.map((mm) => {
                    const tot = sumEntries(mm.items)
                    return (
                      <div key={mm.id} style={{ borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "13px 15px", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{mm.name}</span>
                          <span onClick={() => saveMyMeals(myMeals.filter((x) => x.id !== mm.id))} style={{ fontSize: 15, color: BASE.taupe, cursor: "pointer" }}>{"\u00d7"}</span>
                        </div>
                        <div style={{ fontSize: 11, color: BASE.taupe, marginBottom: 6 }}>{mm.items.map((i) => i.name).join(", ")}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ flex: 1, fontSize: 11.5, color: BASE.creamDim }}>{Math.round(tot.cal)} cal · {r1(tot.p)}g protein</span>
                          <span onClick={() => { addEntries(mm.items.map((i) => ({ ...i, id: newId(), meal: addFoodFor }))); setAddFoodFor(null) }} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>Add</span>
                        </div>
                      </div>
                    )
                  }) : <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Log a few foods, then use "Save a meal from today's food" to turn them into a reusable meal.</div>
                )}

                {addTab === "newray" && MEAL_TYPES.map(([t, lbl]) => (
                  <div key={t} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 7 }}>{lbl}</div>
                    {MEALS.filter((m) => m.t === t).slice(0, 4).map((m) => (
                      <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 13, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 6 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>{m.n}</div>
                          <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 1 }}>{m.cal} cal · {m.p}g protein</div>
                        </div>
                        <span onClick={() => { logMeal(m, addFoodFor); setAddFoodFor(null) }} style={{ fontSize: 11, fontWeight: 800, color: "#fff", background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "7px 13px", borderRadius: 999, cursor: "pointer" }}>Add</span>
                      </div>
                    ))}
                  </div>
                ))}

                {addTab === "quick" && (() => {
                  const q = quickAdd
                  const st = { width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none", marginBottom: 10 }
                  const hasCal = q.cal !== "" && Number(q.cal) >= 0
                  const incomplete = q.c === "" || q.f === ""
                  return (
                    <>
                      <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.6, marginBottom: 12 }}>Already know the numbers? Enter what you have — calories alone is enough.</div>
                      <input value={q.name} onChange={(e) => setQuickAdd({ ...q, name: e.target.value })} placeholder="Name (optional)" style={st} />
                      <input value={q.cal} onChange={(e) => setQuickAdd({ ...q, cal: e.target.value })} type="number" inputMode="numeric" placeholder="Calories" style={st} />
                      <input value={q.p} onChange={(e) => setQuickAdd({ ...q, p: e.target.value })} type="number" inputMode="numeric" placeholder="Protein (g)" style={st} />
                      <input value={q.c} onChange={(e) => setQuickAdd({ ...q, c: e.target.value })} type="number" inputMode="numeric" placeholder="Carbs (g) — optional" style={st} />
                      <input value={q.f} onChange={(e) => setQuickAdd({ ...q, f: e.target.value })} type="number" inputMode="numeric" placeholder="Fat (g) — optional" style={st} />
                      {hasCal && incomplete && <div style={{ fontSize: 11.5, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.55, marginBottom: 12 }}>Leaving carbs or fat blank is fine — those daily totals will just be a little incomplete.</div>}
                      <button onClick={() => { if (!hasCal) return; addEntries([{ id: newId(), meal: addFoodFor, name: q.name.trim() || "Quick add", qty: 1, unit: "entry", cal: Math.round(Number(q.cal)), p: Number(q.p) || 0, c: Number(q.c) || 0, f: Number(q.f) || 0, partial: incomplete }]); setQuickAdd({ name: "", cal: "", p: "", c: "", f: "" }); setAddFoodFor(null) }} disabled={!hasCal} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: hasCal ? "pointer" : "default", background: hasCal ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface2, color: hasCal ? "#fff" : BASE.taupe, fontSize: 14.5, fontWeight: 800 }}>Add to {slotLabel.toLowerCase()}</button>
                    </>
                  )
                })()}
                <div style={{ height: 20 }} />
              </div>
            )
          })()}

          {/* ---- SERVING EDITOR ---- */}
          {nourishView === "today" && targets && foodPick && (() => {
            const { food, qty, unit } = foodPick
            const n = food.fixed ? { cal: food.fixed.cal * qty, p: food.fixed.p * qty, c: food.fixed.c * qty, f: food.fixed.f * qty, grams: 0 } : nutrientsFor(food, qty, unit)
            const slotLabel = (MEAL_TYPES.find((m) => m[0] === addFoodFor) || ["", "Meal"])[1]
            const fav = savedFoods.some((x) => x.id === food.id)
            return (
              <div className="fade-in">
                <Back to={() => setFoodPick(null)} label="Add food" />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
                  <div style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{food.name}</div>
                  <span onClick={() => toggleFavorite(food)} style={{ fontSize: 20, cursor: "pointer", opacity: fav ? 1 : 0.35 }}>💗</span>
                </div>
                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 7 }}>Amount</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <input value={qty} onChange={(e) => setFoodPick({ ...foodPick, qty: e.target.value })} type="number" inputMode="decimal" step="0.25" style={{ width: 92, padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 15, outline: "none" }} />
                  <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {foodUnitList(food).map((u) => (
                      <div key={u.u} onClick={() => setFoodPick({ ...foodPick, unit: u.u })} style={{ padding: "9px 13px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: unit === u.u ? "#A87BD1" : "transparent", color: unit === u.u ? "#fff" : BASE.creamDim, border: `1px solid ${unit === u.u ? "#A87BD1" : BASE.border}` }}>{u.u}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
                  {[["Calories", n ? Math.round(n.cal) : "—", "#E8B84B"], ["Protein", n ? r1(n.p) + "g" : "—", "#E984B4"], ["Carbs", n ? r1(n.c) + "g" : "—", "#7FA054"], ["Fat", n ? r1(n.f) + "g" : "—", "#9B6BC3"]].map(([l, v, col]) => (
                    <div key={l} style={{ borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: col }}>{v}</div>
                      <div style={{ fontSize: 9.5, color: BASE.taupe, marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                {n && n.grams > 0 && <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", marginBottom: 16 }}>about {n.grams} g</div>}
                <button onClick={() => { const en = makeEntry(food, Number(qty), unit, addFoodFor || "snack"); if (en) { addEntries([en]); rememberRecent(food, Number(qty), unit); setFoodPick(null); setAddFoodFor(null) } }} style={{ width: "100%", padding: 16, borderRadius: 15, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 15, fontWeight: 800, marginBottom: 20 }}>Add to {slotLabel.toLowerCase()}</button>
              </div>
            )
          })()}

          {/* ---- ENTRY EDITOR ---- */}
          {nourishView === "today" && targets && entryEdit && (() => {
            const it = entryEdit
            const food = findFood(it.foodId)
            const q = Number(it.qty) || 0
            // Nutrition shown is always FOR THE CURRENT AMOUNT.
            // Priority: a manual override for this unit > the source food's math > the stored values.
            const live = (() => {
              if (it.custom && it.custom.unit === it.unit) {
                const p = it.custom.per
                return { cal: p.cal * q, p: p.p * q, c: p.c * q, f: p.f * q }
              }
              if (food) {
                if (food.fixed) return { cal: food.fixed.cal * q, p: food.fixed.p * q, c: food.fixed.c * q, f: food.fixed.f * q }
                const n = nutrientsFor(food, q, it.unit)
                if (n) return n
              }
              return { cal: it.cal, p: it.p, c: it.c, f: it.f }
            })()
            const overridden = !!(it.custom && it.custom.unit === it.unit)
            // Editing a value sets a per-unit override so later amount changes scale correctly.
            const editNutr = (k, val) => {
              const num = Number(val)
              const next = { cal: live.cal, p: live.p, c: live.c, f: live.f }
              next[k] = isFinite(num) ? Math.max(0, num) : 0
              const div = q > 0 ? q : 1
              setEntryEdit({ ...it, custom: { unit: it.unit, per: { cal: next.cal / div, p: next.p / div, c: next.c / div, f: next.f / div } } })
            }
            const nutrField = (k, label, color) => (
              <div key={k} style={{ flex: 1 }}>
                <input value={k === "cal" ? Math.round(live.cal) : r1(live[k])} onChange={(e) => editNutr(k, e.target.value)} type="number" inputMode="decimal" style={{ width: "100%", padding: "12px 4px", borderRadius: 12, background: BASE.surface, border: `1px solid ${overridden ? "#C9558E" : BASE.border}`, color: color, fontSize: 16, fontWeight: 800, outline: "none", textAlign: "center" }} />
                <div style={{ fontSize: 9.5, color: BASE.taupe, marginTop: 3, textAlign: "center" }}>{label}</div>
              </div>
            )
            return (
              <div className="fade-in">
                <Back to={() => { setEntryEdit(null); setSaveFoodName("") }} label={dateLabel} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 14 }}>{it.name}</div>

                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 7 }}>Amount</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input value={it.qty} onChange={(e) => setEntryEdit({ ...it, qty: e.target.value })} type="number" inputMode="decimal" step="0.25" style={{ width: 92, padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 15, outline: "none" }} />
                  <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "flex-start" }}>
                    {food ? foodUnitList(food).map((u) => (
                      <div key={u.u} onClick={() => setEntryEdit({ ...it, unit: u.u, custom: it.custom && it.custom.unit === u.u ? it.custom : null })} style={{ padding: "9px 13px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: it.unit === u.u ? "#A87BD1" : "transparent", color: it.unit === u.u ? "#fff" : BASE.creamDim, border: `1px solid ${it.unit === u.u ? "#A87BD1" : BASE.border}` }}>{u.u}</div>
                    )) : <div style={{ padding: "10px 13px", fontSize: 12.5, color: BASE.taupe }}>{it.unit}</div>}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 7 }}>
                  <span style={{ fontSize: 11.5, color: BASE.taupe }}>Nutrition for {it.qty || 0} {it.unit}</span>
                  {overridden && <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: "#C9558E" }}>EDITED</span>}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  {nutrField("cal", "Calories", "#E8B84B")}
                  {nutrField("p", "Protein", "#E984B4")}
                  {nutrField("c", "Carbs", "#7FA054")}
                  {nutrField("f", "Fat", "#9B6BC3")}
                </div>
                <div style={{ fontSize: 11, color: BASE.taupe, lineHeight: 1.55, marginBottom: 16, fontStyle: "italic" }}>
                  {overridden
                    ? `Your values apply to this entry only. Changing the amount scales them from ${r1(it.custom.per.cal)} cal per ${it.unit}.`
                    : "These update automatically with the amount. Edit any of them to match your actual label."}
                </div>

                {overridden && (
                  <div style={{ borderRadius: 14, background: "rgba(233,132,180,0.07)", border: "1px solid rgba(233,132,180,0.28)", padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 7 }}>Save this version?</div>
                    <div style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 10 }}>Keep your corrected numbers so you never have to fix this food again.</div>
                    <input value={saveFoodName} onChange={(e) => setSaveFoodName(e.target.value)} placeholder={"My " + it.name} style={{ width: "100%", padding: "11px 13px", borderRadius: 11, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 13.5, outline: "none", marginBottom: 9 }} />
                    <button onClick={() => {
                      const nm = (saveFoodName.trim() || ("My " + it.name))
                      const fd = { id: "my:" + newId(), name: nm, mine: true, fixed: { cal: Math.round(it.custom.per.cal), p: r1(it.custom.per.p), c: r1(it.custom.per.c), f: r1(it.custom.per.f) }, units: [{ u: it.unit, g: 0 }] }
                      saveMyFoods([...myFoods, fd])
                      rememberRecent(fd, 1, it.unit)
                      updateEntry(it.id, { name: nm, foodId: fd.id, qty: q, unit: it.unit, meal: it.meal, cal: Math.round(live.cal), p: r1(live.p), c: r1(live.c), f: r1(live.f), custom: it.custom })
                      setEntryEdit(null); setSaveFoodName("")
                    }} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 13, fontWeight: 800 }}>Save as my food</button>
                  </div>
                )}

                <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>Move to</div>
                <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                  {MEAL_TYPES.map(([sl, lbl]) => (
                    <div key={sl} onClick={() => setEntryEdit({ ...it, meal: sl })} style={{ flex: 1, textAlign: "center", padding: "9px 2px", borderRadius: 999, cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: it.meal === sl ? "#C9558E" : "transparent", color: it.meal === sl ? "#fff" : BASE.creamDim, border: `1px solid ${it.meal === sl ? "#C9558E" : BASE.border}` }}>{lbl}</div>
                  ))}
                </div>

                <button onClick={() => { updateEntry(it.id, { qty: q, unit: it.unit, meal: it.meal, cal: Math.round(live.cal), p: r1(live.p), c: r1(live.c), f: r1(live.f), custom: it.custom || null }); setEntryEdit(null); setSaveFoodName("") }} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 14.5, fontWeight: 800, marginBottom: 9 }}>Save changes</button>
                <button onClick={() => { const cd = dayFor(logDate); setDay(logDate, { items: [...cd.items, { ...it, qty: q, id: newId(), cal: Math.round(live.cal), p: r1(live.p), c: r1(live.c), f: r1(live.f) }] }); setEntryEdit(null); setSaveFoodName("") }} style={{ width: "100%", padding: 13, borderRadius: 13, border: `1px solid ${BASE.border}`, cursor: "pointer", background: "transparent", color: BASE.creamDim, fontSize: 13.5, fontWeight: 700, marginBottom: 9 }}>Duplicate</button>
                <button onClick={() => { deleteEntry(it.id); setEntryEdit(null); setSaveFoodName("") }} style={{ width: "100%", padding: 13, borderRadius: 13, border: "none", cursor: "pointer", background: "transparent", color: "#D65C4E", fontSize: 13.5, fontWeight: 700, marginBottom: 20 }}>Remove from log</button>
              </div>
            )
          })()}

          {/* ---- SAVE A MEAL ---- */}
          {nourishView === "today" && targets && mealEdit && (() => {
            const items = (foodDays[logDate] || { items: [] }).items
            const chosen = mealEdit.picked || {}
            const picked = items.filter((i) => chosen[i.id])
            const tot = sumEntries(picked)
            return (
              <div className="fade-in">
                <Back to={() => setMealEdit(null)} label={dateLabel} />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Save a meal</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Pick the foods that go together, name it, and you can log the whole thing in one tap next time.</div>
                {items.map((i) => (
                  <div key={i.id} onClick={() => setMealEdit({ ...mealEdit, picked: { ...chosen, [i.id]: !chosen[i.id] } })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 12, background: BASE.surface, border: `1px solid ${chosen[i.id] ? "#C9558E" : BASE.border}`, marginBottom: 7, cursor: "pointer" }}>
                    <span style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${chosen[i.id] ? "#C9558E" : BASE.border}`, background: chosen[i.id] ? "#C9558E" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 800 }}>{chosen[i.id] ? "\u2713" : ""}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>{i.name}</div>
                      <div style={{ fontSize: 11, color: BASE.taupe }}>{Math.round(i.cal)} cal · {r1(i.p)}g protein</div>
                    </div>
                  </div>
                ))}
                {picked.length > 0 && (
                  <>
                    <div style={{ fontSize: 12.5, color: BASE.creamDim, textAlign: "center", margin: "12px 0" }}>{Math.round(tot.cal)} cal · {r1(tot.p)}g protein</div>
                    <input value={saveMealName} onChange={(e) => setSaveMealName(e.target.value)} placeholder="Name this meal…" style={{ width: "100%", padding: "13px 15px", borderRadius: 13, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14.5, outline: "none", marginBottom: 12 }} />
                    <button onClick={() => { if (!saveMealName.trim()) return; saveMyMeals([...myMeals, { id: newId(), name: saveMealName.trim(), items: picked.map((i) => ({ ...i })) }]); setMealEdit(null); setSaveMealName("") }} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 14.5, fontWeight: 800, marginBottom: 20 }}>Save meal</button>
                  </>
                )}
                <div style={{ height: 18 }} />
              </div>
            )
          })()}

          {/* ================= PLAN ================= */}
          {nourishView === "plan" && !planView && (
            <div className="fade-in">
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Your Nourish Plan</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 18 }}>This is where you set your direction. Today turns it into food you can actually eat.</div>
              {plan ? (
                <div style={{ borderRadius: 18, background: plan.grad, padding: "18px 20px", marginBottom: 8, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", right: -12, top: -12, fontSize: 62, opacity: 0.16 }}>{plan.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: "rgba(255,255,255,0.85)", textTransform: "uppercase", position: "relative" }}>Active plan</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 2, position: "relative" }}>{plan.name}</div>
                  {targets && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.95)", marginTop: 4, position: "relative" }}>{targets.cal} cal · {targets.p}g protein · {targets.c}g carbs · {targets.f}g fat</div>}
                </div>
              ) : (
                <div style={{ borderRadius: 16, background: BASE.surface, border: `1px dashed ${BASE.border}`, padding: "18px 20px", marginBottom: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6 }}>You haven't chosen a plan yet. Start there and everything else falls into place.</div>
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                {[["choose", "🎯", "Choose your nutrition plan", plan ? "Change your active plan" : "Pick the goal that fits this season"],
                  ["calc", "🧮", "Calculate my targets", targets ? "Review or edit your daily targets" : "Estimate your daily calories and macros"],
                  ["meals", "🍳", "Meal ideas", "Breakfast, lunch, dinner and snacks"],
                  ["week", "📅", "Build my week", "Plan meals for the days ahead"],
                  ["grocery", "🛒", "Build my grocery list", "From your week, or start from scratch"],
                  ["eatout", "🍴", "Eating out", "Practical picks, no guilt"],
                  ["learn", "📖", "Learn", "Protein, carbs, fats, fiber and more"]].map(([k, ic, title, sub]) => (
                  <div key={k} onClick={() => { setPlanView(k); setMealFilter(null); setMealOpen(null) }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "15px 16px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8, cursor: "pointer" }}>
                    <span style={{ fontSize: 20 }}>{ic}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{title}</div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 1 }}>{sub}</div>
                    </div>
                    <span style={{ color: BASE.taupe }}>{"\u203a"}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 18 }} />
            </div>
          )}

          {/* --- Choose plan --- */}
          {nourishView === "plan" && planView === "choose" && (
            <div className="fade-in">
              <Back to={() => setPlanView(null)} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Choose your nutrition plan</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 18 }}>Pick the one that fits the season you're in. You can change it whenever your life changes — none of these are diets.</div>
              {NUTRITION_PLANS.map((p) => {
                const active = nutrition && nutrition.planId === p.id
                return (
                  <div key={p.id} style={{ borderRadius: 18, overflow: "hidden", marginBottom: 14, border: `1px solid ${active ? "#C9558E" : BASE.border}` }}>
                    <div style={{ background: p.grad, padding: "16px 18px", position: "relative" }}>
                      <div style={{ position: "absolute", right: -10, top: -10, fontSize: 54, opacity: 0.16 }}>{p.emoji}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: "#fff", position: "relative" }}>{p.name}</div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.95)", marginTop: 2, position: "relative" }}>{p.tag}</div>
                      {active && <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, color: "#fff", background: "rgba(255,255,255,0.25)", padding: "3px 9px", borderRadius: 999, display: "inline-block", marginTop: 7, position: "relative" }}>ACTIVE</div>}
                    </div>
                    <div style={{ background: BASE.surface, padding: "14px 18px" }}>
                      <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 10 }}>{p.forWho}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 6 }}>How Nourish helps</div>
                      {p.helps.map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9558E", marginTop: 7, flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{h}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: 11.5, color: BASE.taupe, lineHeight: 1.55, margin: "10px 0" }}><span style={{ fontWeight: 700, color: BASE.creamDim }}>What to expect: </span>{p.expect}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: "#C9558E", lineHeight: 1.45, marginBottom: 12 }}>{p.note}</div>
                      <button onClick={() => { saveNutrition({ ...(nutrition || {}), planId: p.id }); setPlanView("calc") }} style={{ width: "100%", padding: 13, borderRadius: 13, border: "none", cursor: "pointer", background: active ? BASE.surface2 : p.grad, color: active ? BASE.creamDim : "#fff", fontSize: 13.5, fontWeight: 800 }}>{active ? "Keep this plan" : "Choose " + p.name}</button>
                    </div>
                  </div>
                )
              })}
              <div style={{ height: 18 }} />
            </div>
          )}

          {/* --- Calculator --- */}
          {nourishView === "plan" && planView === "calc" && (() => {
            const ci = calcInputs || { age: "", heightFt: "", heightIn: "", weightLb: "", activity: "light", nursing: false, sex: "female", rate: "gentle", planId: (nutrition && nutrition.planId) || "energy" }
            const setCI = (k, v) => setCalcInputs({ ...ci, [k]: v })
            const ready = ci.age && ci.heightFt && ci.weightLb
            const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none" }
            return (
              <div className="fade-in">
                <Back to={() => { setPlanView(null); setCalcResult(null) }} label="Plan" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Calculate my targets</div>
                <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>A few details and we'll estimate a starting point. You can edit anything afterward.</div>

                {!calcResult ? (
                  <>
                    <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 14 }}>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Your plan</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                        {NUTRITION_PLANS.map((p) => (
                          <div key={p.id} onClick={() => setCI("planId", p.id)} style={{ padding: "7px 12px", borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: ci.planId === p.id ? "#C9558E" : "transparent", color: ci.planId === p.id ? "#fff" : BASE.creamDim, border: `1px solid ${ci.planId === p.id ? "#C9558E" : BASE.border}` }}>{p.emoji} {p.name}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Sex (used by the energy equation)</div>
                      <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
                        {[["female", "Female"], ["male", "Male"]].map(([k, lbl]) => (
                          <div key={k} onClick={() => setCI("sex", k)} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, cursor: "pointer", fontSize: 12.5, fontWeight: 700, background: ci.sex === k ? "#C9558E" : "transparent", color: ci.sex === k ? "#fff" : BASE.creamDim, border: `1px solid ${ci.sex === k ? "#C9558E" : BASE.border}` }}>{lbl}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Age</div>
                      <input type="number" inputMode="numeric" value={ci.age} onChange={(e) => setCI("age", e.target.value)} placeholder="32" style={{ ...inputStyle, marginBottom: 14 }} />
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Height</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                        <input type="number" inputMode="numeric" value={ci.heightFt} onChange={(e) => setCI("heightFt", e.target.value)} placeholder="5 ft" style={inputStyle} />
                        <input type="number" inputMode="numeric" value={ci.heightIn} onChange={(e) => setCI("heightIn", e.target.value)} placeholder="5 in" style={inputStyle} />
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 6 }}>Weight (lbs)</div>
                      <input type="number" inputMode="numeric" value={ci.weightLb} onChange={(e) => setCI("weightLb", e.target.value)} placeholder="150" style={{ ...inputStyle, marginBottom: 14 }} />
                      <div style={{ fontSize: 11.5, color: BASE.taupe, marginBottom: 8 }}>How active are you day to day?</div>
                      {ACTIVITY_LEVELS.map((a) => (
                        <div key={a.k} onClick={() => setCI("activity", a.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, marginBottom: 7, cursor: "pointer", background: ci.activity === a.k ? "rgba(233,132,180,0.12)" : "transparent", border: `1px solid ${ci.activity === a.k ? "#C9558E" : BASE.border}` }}>
                          <span style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${ci.activity === a.k ? "#C9558E" : BASE.border}`, background: ci.activity === a.k ? "#C9558E" : "transparent", flexShrink: 0 }} />
                          <div><div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{a.label}</div><div style={{ fontSize: 11, color: BASE.taupe }}>{a.note}</div></div>
                        </div>
                      ))}
                      {(PLAN_BY_ID(ci.planId) && PLAN_BY_ID(ci.planId).deficit < 0) && (
                        <>
                          <div style={{ fontSize: 11.5, color: BASE.taupe, margin: "14px 0 8px" }}>Pace that feels sustainable</div>
                          {RATE_OPTIONS.map((rt) => (
                            <div key={rt.k} onClick={() => setCI("rate", rt.k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, marginBottom: 7, cursor: "pointer", background: ci.rate === rt.k ? "rgba(233,132,180,0.12)" : "transparent", border: `1px solid ${ci.rate === rt.k ? "#C9558E" : BASE.border}` }}>
                              <span style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${ci.rate === rt.k ? "#C9558E" : BASE.border}`, background: ci.rate === rt.k ? "#C9558E" : "transparent", flexShrink: 0 }} />
                              <div><div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{rt.label}</div><div style={{ fontSize: 11, color: BASE.taupe }}>{rt.note}</div></div>
                            </div>
                          ))}
                          <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", lineHeight: 1.55, marginBottom: 4 }}>We cap any deficit so it stays supportive — faster isn't better here.</div>
                        </>
                      )}
                      <div onClick={() => setCI("nursing", !ci.nursing)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 13px", borderRadius: 12, marginTop: 8, cursor: "pointer", background: ci.nursing ? "rgba(168,123,209,0.12)" : "transparent", border: `1px solid ${ci.nursing ? "#A87BD1" : BASE.border}` }}>
                        <span style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${ci.nursing ? "#A87BD1" : BASE.border}`, background: ci.nursing ? "#A87BD1" : "transparent", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: BASE.cream }}>I'm currently breastfeeding</span>
                      </div>
                    </div>
                    {(ci.nursing || isPostpartum) && (
                      <div style={{ borderRadius: 14, background: "rgba(168,123,209,0.1)", border: "1px solid rgba(168,123,209,0.3)", padding: "14px 16px", marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#9B6BC3", textTransform: "uppercase", marginBottom: 5 }}>An important note</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>Postpartum and breastfeeding bodies have real, individual needs that a general estimate can't capture. We won't put you in a calorie deficit here, and we'd genuinely encourage you to run any nutrition targets past your own provider or a dietitian.</div>
                      </div>
                    )}
                    <button onClick={() => { if (ready) { const hi = (Number(ci.heightFt) || 0) * 12 + (Number(ci.heightIn) || 0); setCalcResult(calcTargets({ ...ci, heightIn: hi })) } }} disabled={!ready} style={{ width: "100%", padding: 16, borderRadius: 15, border: "none", cursor: ready ? "pointer" : "default", background: ready ? "linear-gradient(135deg,#E984B4,#A87BD1)" : BASE.surface2, color: ready ? "#fff" : BASE.taupe, fontSize: 15.5, fontWeight: 800, marginBottom: 10 }}>Calculate my targets</button>
                    <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", lineHeight: 1.6, marginBottom: 18 }}>These are estimates based on a standard equation — a starting point, not a medical prescription. If you have a health condition, are pregnant, or are under a provider's care, please use their guidance instead.</div>
                  </>
                ) : (() => {
                  const r = calcResult
                  const sp = proteinSplit(r.p)
                  return (
                    <div className="fade-in">
                      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#C9558E", marginBottom: 12, textAlign: "center" }}>Your daily targets</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                        {[["calories", r.cal, "#E8B84B"], ["protein", r.p + "g", "#E984B4"], ["carbs", r.c + "g", "#7FA054"], ["fat", r.f + "g", "#9B6BC3"]].map(([lbl, v, col]) => (
                          <div key={lbl} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 10px", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 700, color: col, lineHeight: 1 }}>{v}</div>
                            <div style={{ fontSize: 11, color: BASE.taupe, marginTop: 4 }}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                      {r.flags.indexOf("noDeficitNursing") >= 0 && (
                        <div style={{ borderRadius: 14, background: "rgba(168,123,209,0.1)", border: "1px solid rgba(168,123,209,0.3)", padding: "13px 15px", marginBottom: 14, fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>Because you're breastfeeding, we've added energy for milk production and removed the calorie deficit. Nourishing yourself well matters more than any goal right now.</div>
                      )}
                      {r.flags.indexOf("floored") >= 0 && (
                        <div style={{ borderRadius: 14, background: "rgba(233,184,75,0.1)", border: "1px solid rgba(233,184,75,0.3)", padding: "13px 15px", marginBottom: 14, fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>We've raised this estimate to a safer minimum. Eating below this without a provider's guidance tends to work against your energy, hormones, and strength.</div>
                      )}
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "4px 2px 10px" }}>What this means</div>
                      <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 14 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E984B4", marginBottom: 4 }}>Protein</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 12 }}>That's about {sp.b}g at breakfast, {sp.l}g at lunch, {sp.d}g at dinner, and {sp.s}g from snacks. A palm-sized portion of meat, a Greek yogurt, or a scoop of protein powder each land around 20-30g.</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7FA054", marginBottom: 4 }}>Carbs</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 12 }}>Use these to fuel your day and your workouts. Rice, potatoes, oats, fruit and bread all count.</div>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#9B6BC3", marginBottom: 4 }}>Fat</div>
                        <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6 }}>Include moderate amounts across your meals for satisfaction, hormones, and nutrition.</div>
                      </div>
                      <button onClick={() => { saveNutrition({ planId: ci.planId, targets: { cal: r.cal, p: r.p, c: r.c, f: r.f }, inputs: ci, savedAt: new Date().toISOString() }); setPlanView(null); setCalcResult(null); setNourishView("today") }} style={{ width: "100%", padding: 16, borderRadius: 15, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 15.5, fontWeight: 800, marginBottom: 10 }}>Save my targets</button>
                      <div onClick={() => setCalcResult(null)} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 20 }}>Adjust my details</div>
                    </div>
                  )
                })()}

                {targets && !calcResult && (
                  <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 10 }}>Or edit your targets directly</div>
                    {[["cal", "Calories"], ["p", "Protein (g)"], ["c", "Carbs (g)"], ["f", "Fat (g)"]].map(([k, lbl]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 12.5, color: BASE.taupe, flex: 1 }}>{lbl}</span>
                        <input type="number" inputMode="numeric" value={targets[k]} onChange={(e) => saveNutrition({ ...nutrition, targets: { ...targets, [k]: Number(e.target.value) || 0 } })} style={{ width: 90, padding: "9px 11px", borderRadius: 10, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 13.5, outline: "none", textAlign: "right" }} />
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginTop: 8, lineHeight: 1.55 }}>Your numbers are yours. Edit them anytime to fit what actually works for your body.</div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* --- Meal ideas --- */}
          {nourishView === "plan" && planView === "meals" && !mealOpen && (
            <div className="fade-in">
              <Back to={() => { setPlanView(null); setMealFilter(null) }} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 12 }}>Meal ideas</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {MEAL_TYPES.map(([k, lbl]) => (
                  <button key={k} onClick={() => setMealType(k)} style={{ flex: 1, padding: "8px 2px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, background: mealType === k ? "#C9558E" : BASE.surface, color: mealType === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {MEAL_FILTERS.map((ft) => (
                  <div key={ft} onClick={() => setMealFilter(mealFilter === ft ? null : ft)} style={{ padding: "6px 11px", borderRadius: 999, cursor: "pointer", fontSize: 11, fontWeight: 700, background: mealFilter === ft ? "#A87BD1" : "transparent", color: mealFilter === ft ? "#fff" : BASE.taupe, border: `1px solid ${mealFilter === ft ? "#A87BD1" : BASE.border}` }}>{ft}</div>
                ))}
              </div>
              {(() => {
                const list = MEALS.filter((m) => m.t === mealType && (!mealFilter || m.tags.indexOf(mealFilter) >= 0))
                if (!list.length) return <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe }}>No meals match that filter yet. Try another one.</div>
                return list.map((m) => <MealCard key={m.n} m={m} onPick={setMealOpen} />)
              })()}
              <div style={{ height: 18 }} />
            </div>
          )}

          {nourishView === "plan" && planView === "meals" && mealOpen && (() => {
            const m = mealOpen
            return (
              <div className="fade-in">
                <Back to={() => setMealOpen(null)} label="Meal ideas" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>{m.n}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[["Protein", m.p + "g", "#E984B4"], ["Carbs", m.c + "g", "#7FA054"], ["Fat", m.f + "g", "#9B6BC3"], ["Calories", m.cal, "#E8B84B"]].map(([lbl, v, col]) => (
                    <div key={lbl} style={{ borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "12px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: col }}>{v}</div>
                      <div style={{ fontSize: 9.5, color: BASE.taupe, marginTop: 2 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, marginBottom: 14 }}>About {m.min} minutes {"\u00b7"} {m.tags.join(" · ")}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 8 }}>What you'll need</div>
                {m.ing.map(([cat, item], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `0.5px solid ${BASE.border}` }}>
                    <span style={{ fontSize: 13, color: BASE.cream }}>{item}</span>
                    <span style={{ fontSize: 11, color: BASE.taupe }}>{cat}</span>
                  </div>
                ))}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", marginBottom: 9 }}>Add to today</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {MEAL_TYPES.map(([sl, lbl]) => (
                      <button key={sl} onClick={() => { logMeal(m, sl); setNourishView("today"); setMealOpen(null); setPlanView(null) }} style={{ flex: 1, padding: "13px 2px", borderRadius: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 12, fontWeight: 800 }}>{lbl}</button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 20 }} />
              </div>
            )
          })()}

          {/* --- Week builder --- */}
          {nourishView === "plan" && planView === "week" && (() => {
            const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + i); return d })
            if (weekPick) {
              const list = MEALS.filter((m) => m.t === weekPick.slot)
              return (
                <div className="fade-in">
                  <Back to={() => setWeekPick(null)} label="My week" />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, marginBottom: 4 }}>Choose a {weekPick.slot}</div>
                  <div style={{ fontSize: 12.5, color: BASE.taupe, marginBottom: 16 }}>{new Date(weekPick.d + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                  {list.map((m) => <MealCard key={m.n} m={m} compact onPick={() => { const wp = { ...weekPlan }; wp[weekPick.d] = { ...(wp[weekPick.d] || {}), [weekPick.slot]: m.n }; saveWeekPlan(wp); setWeekPick(null) }} />)}
                  <div style={{ height: 18 }} />
                </div>
              )
            }
            return (
              <div className="fade-in">
                <Back to={() => setPlanView(null)} label="Plan" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Build my week</div>
                <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 18 }}>Plan as much or as little as you want. Empty days are completely fine — this is a helper, not a contract.</div>
                {days.map((d) => {
                  const key = d.toISOString().slice(0, 10)
                  const dayPlan = weekPlan[key] || {}
                  return (
                    <div key={key} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "14px 16px", marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream, marginBottom: 9 }}>{d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
                      {MEAL_TYPES.map(([slot, lbl]) => (
                        <div key={slot} onClick={() => setWeekPick({ d: key, slot })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", cursor: "pointer", borderTop: `0.5px solid ${BASE.border}` }}>
                          <span style={{ fontSize: 11, color: BASE.taupe, width: 66, flexShrink: 0 }}>{lbl}</span>
                          <span style={{ flex: 1, fontSize: 12.5, color: dayPlan[slot] ? BASE.cream : BASE.taupe, fontStyle: dayPlan[slot] ? "normal" : "italic" }}>{dayPlan[slot] || "Tap to choose"}</span>
                          {dayPlan[slot] && <span onClick={(e) => { e.stopPropagation(); const wp = { ...weekPlan }; const dp = { ...(wp[key] || {}) }; delete dp[slot]; wp[key] = dp; saveWeekPlan(wp) }} style={{ fontSize: 15, color: BASE.taupe }}>{"\u00d7"}</span>}
                        </div>
                      ))}
                    </div>
                  )
                })}
                <button onClick={() => setPlanView("grocery")} style={{ width: "100%", padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#fff", fontSize: 14.5, fontWeight: 800, margin: "6px 0 20px" }}>Build my grocery list {"\u2192"}</button>
              </div>
            )
          })()}

          {/* --- Grocery builder --- */}
          {nourishView === "plan" && planView === "grocery" && (() => {
            // Ingredients from planned meals + manual additions, grouped by category
            const fromPlan = {}
            Object.keys(weekPlan).forEach((d) => {
              const dp = weekPlan[d] || {}
              Object.keys(dp).forEach((slot) => {
                const meal = MEALS.find((m) => m.n === dp[slot])
                if (meal) meal.ing.forEach(([cat, item]) => { fromPlan[cat] = fromPlan[cat] || {}; fromPlan[cat][item] = (fromPlan[cat][item] || 0) + 1 })
              })
            })
            groceryManual.forEach((gm) => { fromPlan[gm.cat] = fromPlan[gm.cat] || {}; fromPlan[gm.cat][gm.item] = fromPlan[gm.cat][gm.item] || 1 })
            const cats = GROCERY_CATS2.filter((c) => fromPlan[c] && Object.keys(fromPlan[c]).length)
            const total = cats.reduce((s, c) => s + Object.keys(fromPlan[c]).length, 0)
            const doneCount = cats.reduce((s, c) => s + Object.keys(fromPlan[c]).filter((it) => groceryChecked[c + ":" + it]).length, 0)
            return (
              <div className="fade-in">
                <Back to={() => setPlanView(null)} label="Plan" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>My grocery list</div>
                <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>{total ? `${doneCount} of ${total} picked up.` : "Add items below, or plan some meals in Build My Week and they'll appear here automatically."}</div>
                <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
                  <input value={groceryAdd} onChange={(e) => setGroceryAdd(e.target.value)} placeholder="Add an item…" style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: BASE.bg2, border: `1px solid ${BASE.border}`, color: BASE.cream, fontSize: 14, outline: "none" }} />
                  <button onClick={() => { if (groceryAdd.trim()) { saveGroceryManual([...groceryManual, { cat: "Other", item: groceryAdd.trim() }]); setGroceryAdd("") } }} style={{ padding: "12px 18px", borderRadius: 12, border: "none", cursor: "pointer", background: "#C9558E", color: "#fff", fontSize: 13.5, fontWeight: 800 }}>Add</button>
                </div>
                {!total ? (
                  <div style={{ padding: 24, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, textAlign: "center", fontSize: 13, color: BASE.taupe, lineHeight: 1.6 }}>Your list is empty. Add items above, or plan meals for the week and their ingredients will fill this in.</div>
                ) : cats.map((cat) => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 8 }}>{cat}</div>
                    {Object.keys(fromPlan[cat]).sort().map((item) => {
                      const k = cat + ":" + item
                      const on = !!groceryChecked[k]
                      const qty = fromPlan[cat][item]
                      return (
                        <div key={k} onClick={() => saveGroceryChecked({ ...groceryChecked, [k]: !on })} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 6, cursor: "pointer", opacity: on ? 0.5 : 1 }}>
                          <span style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${on ? "#7FA054" : BASE.border}`, background: on ? "#7FA054" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{on ? "\u2713" : ""}</span>
                          <span style={{ flex: 1, fontSize: 13.5, color: BASE.cream, textDecoration: on ? "line-through" : "none" }}>{item}</span>
                          {qty > 1 && <span style={{ fontSize: 11, color: BASE.taupe }}>{"\u00d7" + qty}</span>}
                          <span onClick={(e) => { e.stopPropagation(); saveGroceryManual(groceryManual.filter((g) => !(g.cat === cat && g.item === item))) }} style={{ fontSize: 15, color: BASE.taupe }}>{"\u00d7"}</span>
                        </div>
                      )
                    })}
                  </div>
                ))}
                {total > 0 && <div onClick={() => saveGroceryChecked({})} style={{ textAlign: "center", fontSize: 12.5, fontWeight: 700, color: BASE.taupe, cursor: "pointer", margin: "4px 0 20px" }}>Uncheck everything (reuse this list)</div>}
              </div>
            )
          })()}

          {/* --- Eating out --- */}
          {nourishView === "plan" && planView === "eatout" && (
            <div className="fade-in">
              <Back to={() => setPlanView(null)} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 6 }}>Eating out</div>
              <div style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 16 }}>{EATING_OUT.intro}</div>
              <div style={{ borderRadius: 16, background: "rgba(233,132,180,0.07)", border: "1px solid rgba(233,132,180,0.25)", padding: "15px 17px", marginBottom: 18 }}>
                {EATING_OUT.principles.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < EATING_OUT.principles.length - 1 ? 8 : 0 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9558E", marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
              {EATING_OUT.spots.map((sp) => (
                <div key={sp.name} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "15px 17px", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream, marginBottom: 10 }}>{sp.emoji} {sp.name}</div>
                  {sp.picks.map(([nm, macros, tag], i) => (
                    <div key={i} style={{ paddingTop: i ? 9 : 0, marginTop: i ? 9 : 0, borderTop: i ? `0.5px solid ${BASE.border}` : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12.5, color: BASE.cream, fontWeight: 600, flex: 1 }}>{nm}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: tag === "High Protein" ? "rgba(233,132,180,0.15)" : tag === "Lighter" ? "rgba(127,160,84,0.15)" : "rgba(233,184,75,0.15)", color: tag === "High Protein" ? "#E984B4" : tag === "Lighter" ? "#7FA054" : "#E8B84B", flexShrink: 0 }}>{tag}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: BASE.taupe }}>{macros}</div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 15.5, color: "#C9558E", textAlign: "center", lineHeight: 1.5, margin: "14px 0 20px" }}>{EATING_OUT.close}</div>
            </div>
          )}

          {/* --- Learn --- */}
          {nourishView === "plan" && planView === "learn" && !learnOpen && (
            <div className="fade-in">
              <Back to={() => setPlanView(null)} label="Plan" />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 700, marginBottom: 4 }}>Learn</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 16 }}>Useful background, whenever you want it. You never need to read any of this to use Nourish.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {LEARN_TOPICS.map((t) => (
                  <div key={t.name} onClick={() => setLearnOpen(t.name)} style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "18px 12px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 23, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BASE.cream }}>{t.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: BASE.taupe, textTransform: "uppercase", margin: "6px 2px 8px" }}>Around your training</div>
              <SoftCard>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream, marginBottom: 5 }}>{NOURISH_TIMING.title}</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55, marginBottom: 11 }}>{NOURISH_TIMING.intro}</div>
                {NOURISH_TIMING.cards.map((cd, i) => (
                  <div key={i} style={{ borderRadius: 12, background: "rgba(233,132,180,0.06)", padding: "12px 13px", marginBottom: 9 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontSize: 16 }}>{cd.emoji}</span><span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{cd.title}</span></div>
                    <div style={{ fontSize: 11.5, color: BASE.taupe, fontStyle: "italic", marginBottom: 7 }}>{cd.goal}</div>
                    {cd.rows.map(([k, v], j) => (<div key={j} style={{ marginBottom: 5 }}><div style={{ fontSize: 12, fontWeight: 700, color: BASE.cream }}>{k}</div><div style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.45 }}>{v}</div></div>))}
                  </div>
                ))}
              </SoftCard>
              <SoftCard>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, color: BASE.cream, marginBottom: 5 }}>{NOURISH_RECOVERY.title}</div>
                <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55, marginBottom: 11 }}>{NOURISH_RECOVERY.intro}</div>
                {NOURISH_RECOVERY.cards.map((cd, i) => (
                  <div key={i} style={{ marginBottom: 9 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream, marginBottom: 2 }}>{cd.emoji} {cd.title}</div>
                    <div style={{ fontSize: 12, color: BASE.creamDim, lineHeight: 1.5 }}>{cd.body}</div>
                  </div>
                ))}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 14.5, color: "#C9558E", lineHeight: 1.45, marginTop: 6 }}>{NOURISH_RECOVERY.close}</div>
              </SoftCard>
              <div style={{ height: 18 }} />
            </div>
          )}

          {nourishView === "plan" && planView === "learn" && learnOpen && (() => {
            const t = LEARN_TOPICS.find((x) => x.name === learnOpen)
            return (
              <div className="fade-in">
                <Back to={() => setLearnOpen(null)} label="Learn" />
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 27, fontWeight: 700, marginBottom: 12 }}>{t.emoji} {t.name}</div>
                <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.7, marginBottom: 16 }}>{t.body}</div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 9 }}>In practice</div>
                {t.tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, marginBottom: 8 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9558E", marginTop: 7, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: BASE.creamDim, lineHeight: 1.55 }}>{tip}</span>
                  </div>
                ))}
                <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", margin: "18px 0 20px", lineHeight: 1.6 }}>General education, not medical advice. Your provider knows your situation best.</div>
              </div>
            )
          })()}

          {/* ================= SUPPS (unchanged) ================= */}
          {nourishView === "supps" && !suppOpen && (
            <>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Supplements</div>
              <div style={{ fontSize: 13, color: BASE.taupe, lineHeight: 1.6, marginBottom: 8 }}>Learn what supplements are, why people use them, and what questions to consider before adding them.</div>
              <div style={{ fontSize: 11, color: BASE.taupe, fontStyle: "italic", marginBottom: 16 }}>Education from a nurse's perspective — never medical advice.</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SUPPLEMENTS.map((sp) => (
                  <div key={sp.name} onClick={() => setSuppOpen(sp.name)} style={{ borderRadius: 16, background: BASE.surface, border: "1px solid " + BASE.border, padding: "18px 14px", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{sp.emoji}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{sp.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 18 }} />
            </>
          )}

          {nourishView === "supps" && suppOpen && (() => {
            const sp = SUPPLEMENTS.find((x) => x.name === suppOpen)
            const rows = [["What it is", sp.what], ["Why people use it", sp.why], ["Potential benefits studied", sp.benefits], ["Common considerations", sp.considerations], ["When to discuss with a professional", sp.pro]]
            return (
            <div className="fade-in">
              <div onClick={() => setSuppOpen(null)} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 12 }}>{"\u2039 All supplements"}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{sp.emoji} {sp.name}</div>
              {rows.map(([sec, body]) => (
                <SoftCard key={sec}><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 5 }}>{sec}</div><div style={{ fontSize: 13, color: BASE.cream, lineHeight: 1.55 }}>{body}</div></SoftCard>
              ))}
              <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", fontStyle: "italic", margin: "6px 0 18px", lineHeight: 1.6 }}>New Ray shares education, not prescriptions. Always talk with your own provider before starting a supplement.</div>
            </div>
            )
          })()}
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym" && programId && trainView === "workout") {
      const gymColor = woColor || cur
      const _prog = PROG_BY_ID(programId)
      const _sched = progSchedule(_prog, programStart)
      // Capacity tier: use the explicitly resolved tier passed from the selection screen when present.
      // This lets "Train anyway" below 15% correctly train the RED-day version rather than recovery or full.
      const _capKey = woTier || (pct < 15 ? "recovery" : gymColor)
      const _phase = phaseFor(programId, _sched.week)
      // Build from the explicitly chosen workout (woKey) when present; otherwise today's scheduled session.
      const _tpl = woKey && WORKOUT_TEMPLATES[woKey] ? WORKOUT_TEMPLATES[woKey] : null
      const _session = _tpl ? { slots: _tpl.slots, title: _tpl.title, focus: _tpl.focus } : buildSession(programId, _sched.weekday, _capKey)
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
        const entry = { date: todayISO, type: woType, color: gymColor, program: programId, sets: doneSets }
        const next = [...woLog.filter((w) => w.date !== todayISO), entry]
        setWoLog(next); setWoLogged(true)
        try { localStorage.setItem("nr_workout_log", JSON.stringify(next)) } catch (e) {}
        // Cross-device sync (best-effort; localStorage stays the instant layer)
        if (user && db) {
          try {
            db.from("workouts").upsert(
              { user_id: user.id, date: todayISO, program: programId, workout_type: woType, color: gymColor, sets_done: doneSets },
              { onConflict: "user_id,date" }
            ).then(() => {})
          } catch (e) {}
        }
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
                      <div style={{ fontSize: 10.5, opacity: 0.85, marginTop: 2 }}>Video guide on the way</div>
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
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{THEMES[gymColor].label} · {wo.title}</span>
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

    if (tab === "bloom" && bloomCard) {
      const sec = BLOOM_SECTIONS.find((x) => x.cards.some((c) => c.n === bloomCard.n)) || BLOOM_SECTIONS[0]
      const card = bloomCard
      return (
        <div className="fade-in" style={{ padding: 0 }}>
          <div style={{ position: "relative", padding: "26px 24px 30px", background: sec.grad, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -16, right: -10, fontSize: 90, opacity: 0.16 }}>🌸</div>
            <div style={{ position: "absolute", bottom: -24, left: -12, fontSize: 66, opacity: 0.12 }}>🌷</div>
            <div onClick={closeBloom} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 18, position: "relative" }}>{"\u2039"} Back to Bloom</div>
            <div style={{ fontSize: 42, position: "relative" }}>{card.ic}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#fff", marginTop: 6, position: "relative", textShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>{card.n}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 16.5, color: "rgba(255,255,255,0.95)", marginTop: 6, position: "relative", lineHeight: 1.4 }}>{card.intro}</div>
          </div>
          <div style={{ padding: "26px 24px 20px" }}>
            {card.blocks.map((b, bi) => (
              <div key={bi} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#C97BA8", marginBottom: 12 }}>{b.h}</div>
                {b.items && b.items.map((it, ii) => (
                  <div key={ii} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C97BA8", marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontSize: 14.5, color: "#5A4458", lineHeight: 1.5 }}>{it}</span>
                  </div>
                ))}
                {b.body && <div style={{ fontSize: 14.5, color: "#5A4458", lineHeight: 1.6 }}>{b.body}</div>}
              </div>
            ))}
            {card.note && (
              <div style={{ borderRadius: 16, background: "rgba(201,123,168,0.1)", padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#C97BA8", marginBottom: 6 }}>A New Ray reminder</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "#7E5578", lineHeight: 1.45 }}>{card.note}</div>
              </div>
            )}
            {card.future && (
              <div style={{ fontSize: 11.5, color: "#A88BA0", textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>{card.future}</div>
            )}
            <div style={{ fontSize: 11.5, color: "#B39BAE", textAlign: "center", fontStyle: "italic", marginTop: 18, lineHeight: 1.6 }}>Nothing here to complete. Take whatever feels good and leave the rest.</div>
            <button onClick={closeBloom} style={{ width: "100%", marginTop: 22, padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: sec.grad, color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: 0.3 }}>Done</button>
          </div>
        </div>
      )
    }

    if (tab === "bloom") {
      const capKey = checkedIn ? (pct <= 35 ? "red" : pct <= 70 ? "yellow" : "green") : "yellow"
      const invites = BLOOM_INVITATIONS[capKey]
      const invite = invites[dayIndex(invites.length)]
      const sec = BLOOM_SECTIONS.find((x) => x.id === bloomSection) || BLOOM_SECTIONS[0]
      return (
        <div className="fade-in" style={{ padding: "8px 0 0" }}>
          <div style={{ position: "relative", overflow: "hidden", padding: "40px 22px 34px", background: "linear-gradient(160deg,#FBEEF4 0%,#F3E6F2 45%,#EFE7F6 100%)" }}>
            <div style={{ position: "absolute", top: -20, right: -10, fontSize: 90, opacity: 0.16 }}>🌸</div>
            <div style={{ position: "absolute", bottom: -26, left: -14, fontSize: 76, opacity: 0.13 }}>🌷</div>
            <div style={{ position: "absolute", top: 60, left: 30, fontSize: 30, opacity: 0.14 }}>🌸</div>
            <div style={{ position: "relative", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 46, fontWeight: 600, color: "#8A5A86", letterSpacing: 0.5, lineHeight: 1.05 }}>Become Her.</div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#B87BA6", marginTop: 14 }}>Luxury is how you care for yourself.</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#9B7290", marginTop: 12, lineHeight: 1.5, maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>A beautiful life is built through small moments of care.</div>
            </div>
          </div>

          <div style={{ padding: "22px 18px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#C97BA8", textAlign: "center", marginBottom: 12 }}>Today's Invitation</div>
            <div style={{ borderRadius: 24, padding: "30px 24px", background: "linear-gradient(135deg,#F6E2ED,#EDDCEF)", textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 8 }}>
              <div style={{ position: "absolute", top: -18, right: -18, fontSize: 60, opacity: 0.12 }}>🌸</div>
              <div style={{ fontSize: 44, marginBottom: 12 }}>{invite.emoji}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, fontWeight: 600, color: "#7E5578", lineHeight: 1.3, position: "relative" }}>{invite.text}</div>
            </div>
            <div style={{ fontSize: 12, color: BASE.taupe, textAlign: "center", fontStyle: "italic", marginBottom: 26, lineHeight: 1.5 }}>If you do nothing else today, this is enough.</div>

            <div style={{ display: "flex", gap: 8, background: BASE.surface2, borderRadius: 999, padding: 4, marginBottom: 20 }}>
              {BLOOM_SECTIONS.map((x) => (
                <button key={x.id} onClick={() => setBloomSection(x.id)} style={{ flex: 1, padding: "10px 4px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: bloomSection === x.id ? "#fff" : "transparent", color: bloomSection === x.id ? "#C9558E" : BASE.taupe, boxShadow: bloomSection === x.id ? "0 2px 8px rgba(120,80,130,0.12)" : "none" }}><span style={{ fontSize: 15, display: "block", marginBottom: 2 }}>{x.emoji}</span>{x.name}</button>
              ))}
            </div>

            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: "#9B7290", textAlign: "center", marginBottom: 18 }}>{sec.intro}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 24 }}>
              {sec.cards.map((card, i) => (
                <div key={i} onClick={() => openBloomCard(card)} style={{ borderRadius: 18, overflow: "hidden", aspectRatio: "1.35", background: sec.grad, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px 15px", boxShadow: "0 6px 18px rgba(180,130,170,0.16)", cursor: "pointer", transition: "transform 0.25s ease, box-shadow 0.25s ease" }} onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)" }} onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)" }} onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}>
                  <div style={{ position: "absolute", top: 12, right: 13, fontSize: 26, opacity: 0.9 }}>{card.ic}</div>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.12))" }} />
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: "#fff", position: "relative", textShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>{card.n}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", fontStyle: "italic", padding: "0 20px 20px", lineHeight: 1.6 }}>Tap any card to open it. This is an inspiration library — never a checklist.</div>
          </div>
        </div>
      )
    }

    if (tab === "progress") {
      const pd = progressData
      const CAP_C = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
      const CAP_L = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
      const PHL = { menstrual: "Menstrual", follicular: "Follicular", ovulation: "Ovulatory", luteal: "Luteal" }
      const sortedWo = [...woLog].sort((a, b) => (a.date < b.date ? 1 : -1))
      const SectionTitle = ({ children, sub }) => (
        <div style={{ margin: "26px 2px 14px" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontWeight: 700, color: BASE.cream }}>{children}</div>
          {sub && <div style={{ fontSize: 12.5, color: BASE.taupe, fontStyle: "italic", marginTop: 2 }}>{sub}</div>}
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          {/* Dynamic header insight line */}
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 17, color: "#C9558E", lineHeight: 1.4, marginBottom: 4, paddingLeft: 12, borderLeft: "2px solid #E8B84B" }}>{pd.headerLine}</div>

          {/* ===== SECTION 1: CAPACITY JOURNEY ===== */}
          <SectionTitle sub="Patterns, not pressure.">Your Capacity Journey</SectionTitle>
          {!stats ? (
            <div style={{ padding: 24, borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.taupe, fontSize: 14, lineHeight: 1.6, textAlign: "center" }}>Once you start checking in each day, your capacity history will grow here — and patterns will start to show.</div>
          ) : (
            <>
              {/* Range control */}
              <div style={{ display: "flex", gap: 6, padding: 4, background: BASE.surface, borderRadius: 999, border: `1px solid ${BASE.border}`, marginBottom: 18 }}>
                {[["week", "Week"], ["month", "Month"], ["year", "Year"]].map(([k, lbl]) => (
                  <button key={k} onClick={() => { setCapRange(k); setCapDay(null) }} style={{ flex: 1, padding: "8px 0", borderRadius: 999, cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: "none", background: capRange === k ? "linear-gradient(135deg,#E984B4,#A87BD1)" : "transparent", color: capRange === k ? "#fff" : BASE.creamDim }}>{lbl}</button>
                ))}
              </div>

              {(() => {
                const CELL = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
                const CAPL = { green: "Green Day", yellow: "Yellow Day", red: "Red Day", recovery: "Recovery Day" }
                const iso = (dt) => dt.toISOString().slice(0, 10)
                const tierFor = (rec) => rec ? (rec.pct < 15 ? "recovery" : rec.color) : null
                const dowShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

                // ===== WEEK VIEW =====
                if (capRange === "week") {
                  const today = new Date(); today.setHours(12, 0, 0, 0)
                  const days = Array.from({ length: 7 }, (_, i) => { const dt = new Date(today); dt.setDate(dt.getDate() - (6 - i)); return dt })
                  return (
                    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                      {days.map((dt, i) => {
                        const key = iso(dt); const rec = pd.byDate[key]; const tier = tierFor(rec)
                        const sel = capDay === key
                        return (
                          <div key={i} onClick={() => rec && setCapDay(sel ? null : key)} style={{ flex: 1, borderRadius: 14, padding: "10px 4px", textAlign: "center", cursor: rec ? "pointer" : "default", background: tier ? CELL[tier] : BASE.surface, border: `1px solid ${sel ? BASE.cream : (tier ? "transparent" : BASE.border)}`, opacity: rec ? 1 : 0.5 }}>
                            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, color: tier ? "rgba(255,255,255,0.85)" : BASE.taupe, textTransform: "uppercase" }}>{dowShort[dt.getDay()]}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: tier ? "#fff" : BASE.creamDim, margin: "3px 0" }}>{dt.getDate()}</div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: tier ? "rgba(255,255,255,0.95)" : BASE.taupe }}>{rec ? rec.pct + "%" : "—"}</div>
                          </div>
                        )
                      })}
                    </div>
                  )
                }

                // ===== YEAR VIEW =====
                if (capRange === "year") {
                  const y = capMonth.y
                  const months = pd.yearMonths(y)
                  const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                  return (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: BASE.taupe, marginBottom: 12 }}>{y}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {months.map((mo) => (
                          <div key={mo.m} onClick={() => { if (mo.n) { setCapMonth({ y, m: mo.m }); setCapRange("month"); setCapDay(null) } }} style={{ borderRadius: 14, padding: "12px 8px", textAlign: "center", background: BASE.surface, border: `1px solid ${BASE.border}`, cursor: mo.n ? "pointer" : "default", opacity: mo.n ? 1 : 0.45 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: BASE.cream, marginBottom: 6 }}>{MN[mo.m]}</div>
                            {mo.n ? (
                              <>
                                <div style={{ width: 26, height: 26, borderRadius: "50%", background: CELL[mo.tier], margin: "0 auto 5px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10.5, fontWeight: 800 }}>{mo.avg}</div>
                                <div style={{ fontSize: 9.5, color: BASE.taupe }}>avg %</div>
                              </>
                            ) : (
                              <div style={{ fontSize: 10, color: BASE.taupe, fontStyle: "italic", padding: "6px 0" }}>—</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                // ===== MONTH VIEW (calendar heat-map) =====
                const y = capMonth.y, m = capMonth.m
                const first = new Date(y, m, 1)
                const startDow = first.getDay()
                const daysInMonth = new Date(y, m + 1, 0).getDate()
                const monthName = first.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                const cells = []
                for (let i = 0; i < startDow; i++) cells.push(null)
                for (let d = 1; d <= daysInMonth; d++) cells.push(d)
                const canPrev = history.some((h) => h.date < first)
                const nextFirst = new Date(y, m + 1, 1)
                const canNext = nextFirst <= new Date()
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span onClick={() => canPrev && (m === 0 ? setCapMonth({ y: y - 1, m: 11 }) : setCapMonth({ y, m: m - 1 }))} style={{ fontSize: 18, color: canPrev ? BASE.creamDim : BASE.border, cursor: canPrev ? "pointer" : "default", padding: "0 8px" }}>{"\u2039"}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: BASE.cream }}>{monthName}</span>
                      <span onClick={() => canNext && (m === 11 ? setCapMonth({ y: y + 1, m: 0 }) : setCapMonth({ y, m: m + 1 }))} style={{ fontSize: 18, color: canNext ? BASE.creamDim : BASE.border, cursor: canNext ? "pointer" : "default", padding: "0 8px" }}>{"\u203a"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, marginBottom: 6 }}>
                      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 9.5, fontWeight: 700, color: BASE.taupe }}>{d}</div>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5 }}>
                      {cells.map((d, i) => {
                        if (d === null) return <div key={i} />
                        const key = iso(new Date(y, m, d)); const rec = pd.byDate[key]; const tier = tierFor(rec)
                        const sel = capDay === key
                        const isToday = key === new Date().toISOString().slice(0, 10)
                        return (
                          <div key={i} onClick={() => rec && setCapDay(sel ? null : key)} style={{ aspectRatio: "1", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, cursor: rec ? "pointer" : "default", background: tier ? CELL[tier] : "transparent", color: tier ? "#fff" : BASE.taupe, border: sel ? `2px solid ${BASE.cream}` : (tier ? "none" : `1px solid ${isToday ? "#C9558E" : BASE.border}`) }}>{d}</div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Day detail card */}
              {capDay && pd.byDate[capDay] && (() => {
                const rec = pd.byDate[capDay]
                const tier = rec.pct < 15 ? "recovery" : rec.color
                const CELL = { green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" }
                const CAPL = { green: "Green Day", yellow: "Yellow Day", red: "Red Day", recovery: "Recovery Day" }
                const wos = pd.woByDate[capDay] || []
                const cyc = (cycleLength && lastPeriod) ? computeCycle(cycleLength, lastPeriod, new Date(capDay + "T00:00:00")) : null
                const dateLabel = new Date(capDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                const DetailRow = ({ label, value }) => (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "7px 0", borderTop: `0.5px solid ${BASE.border}` }}>
                    <span style={{ fontSize: 12, color: BASE.taupe, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 12.5, color: BASE.cream, fontWeight: 600, textAlign: "right" }}>{value}</span>
                  </div>
                )
                return (
                  <div className="fade-in" style={{ borderRadius: 18, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: CELL[tier] }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: BASE.cream }}>{dateLabel}</span>
                      <span onClick={() => setCapDay(null)} style={{ fontSize: 18, color: BASE.taupe, cursor: "pointer", lineHeight: 1 }}>{"\u00d7"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: CELL[tier] }} />
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: CELL[tier] }}>{CAPL[tier]}</span>
                      <span style={{ fontSize: 13.5, color: BASE.taupe }}>· {rec.pct}%</span>
                    </div>
                    {wos.length > 0 && <DetailRow label="Workout" value={wos.map((w) => (WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label).join(", ")} />}
                    {rec.supports && rec.supports.length > 0 && <DetailRow label="Support" value={rec.supports.join(", ")} />}
                    {rec.factors && rec.factors.length > 0 && <DetailRow label="Affecting you" value={rec.factors.join(", ")} />}
                    {cyc && <DetailRow label="Cycle phase" value={CYCLE_PHASES[cyc.phase] ? CYCLE_PHASES[cyc.phase].name : cyc.phase} />}
                    {rec.note && <DetailRow label="Your one thing" value={rec.note} />}
                  </div>
                )
              })()}

              {/* Hero summary: Average Capacity + comparison */}
              {(() => {
                // Determine the scope for the summary based on range
                let scopeRows, compareText = null
                if (capRange === "week") {
                  const today = new Date(); today.setHours(12, 0, 0, 0)
                  const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() - 6)
                  scopeRows = history.filter((d) => d.date >= cutoff)
                } else if (capRange === "year") {
                  scopeRows = history.filter((d) => d.date.getFullYear() === capMonth.y)
                } else {
                  scopeRows = history.filter((d) => d.date.getFullYear() === capMonth.y && d.date.getMonth() === capMonth.m)
                  // month-over-month comparison
                  const prevM = capMonth.m === 0 ? { y: capMonth.y - 1, m: 11 } : { y: capMonth.y, m: capMonth.m - 1 }
                  const thisAvg = pd.avgForMonth(capMonth.y, capMonth.m)
                  const prevAvg = pd.avgForMonth(prevM.y, prevM.m)
                  if (thisAvg != null && prevAvg != null) {
                    const delta = thisAvg - prevAvg
                    if (delta >= 3) compareText = `\u2191 ${delta}% from last month`
                    else if (delta <= -3) compareText = `\u2193 ${Math.abs(delta)}% from last month — every month has its own shape`
                    else compareText = "Steady compared with last month"
                  }
                }
                if (!scopeRows.length) return <div style={{ fontSize: 12.5, color: BASE.taupe, textAlign: "center", padding: "10px 0 18px", fontStyle: "italic" }}>No check-ins logged in this range yet.</div>
                const c = { green: 0, yellow: 0, red: 0, recovery: 0 }
                let sum = 0
                scopeRows.forEach((d) => { sum += d.pct; const t = d.pct < 15 ? "recovery" : d.color; c[t]++ })
                const avg = Math.round(sum / scopeRows.length)
                const topTier = Object.keys(c).sort((a, b) => c[b] - c[a])[0]
                const CAPL = { green: "Green", yellow: "Yellow", red: "Red", recovery: "Recovery" }
                return (
                  <>
                    <div style={{ textAlign: "center", padding: "6px 0 14px" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe }}>Average Capacity</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 600, color: THEMES[colorFromPct(avg)].accent, lineHeight: 1.05 }}>{avg}%</div>
                      {compareText && <div style={{ fontSize: 12.5, color: BASE.creamDim, marginTop: 2 }}>{compareText}</div>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 }}>
                      {[["Green", c.green, THEMES.green.accent], ["Yellow", c.yellow, THEMES.yellow.accent], ["Red", c.red, THEMES.red.accent], ["Recovery", c.recovery, "#A87BD1"]].map(([lbl, n, col]) => (
                        <div key={lbl} style={{ textAlign: "center", padding: "11px 3px", borderRadius: 12, background: BASE.surface, border: `1px solid ${BASE.border}` }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: col }}>{n}</div>
                          <div style={{ fontSize: 10, color: BASE.taupe }}>{lbl}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: "center", fontSize: 11.5, color: BASE.taupe, marginBottom: 16 }}>Most common: <span style={{ fontWeight: 700, color: ({ green: THEMES.green.accent, yellow: THEMES.yellow.accent, red: THEMES.red.accent, recovery: "#A87BD1" })[topTier] }}>{CAPL[topTier]}</span></div>
                  </>
                )
              })()}

              {/* Capacity Momentum */}
              {pd.momentum && (
                <div style={{ borderRadius: 18, background: "linear-gradient(160deg,rgba(233,132,180,0.08),rgba(168,123,209,0.08))", border: "1px solid rgba(168,123,209,0.28)", padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{pd.momentum.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#C9558E" }}>Capacity Momentum</span>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16.5, color: BASE.cream, lineHeight: 1.5 }}>{pd.momentum.msg}</div>
                </div>
              )}
            </>
          )}

          {/* ===== SECTION 2: LEARNING YOUR PATTERNS ===== */}
          <SectionTitle sub="What your check-ins are quietly revealing.">Learning Your Patterns</SectionTitle>
          <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, padding: "16px 18px", marginBottom: 12 }}>
            {/* Cycle patterns */}
            {pd.cyclePhases && !pd.cyclePhases.none ? (
              <>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#9B6BC3", textTransform: "uppercase", marginBottom: 8 }}>Cycle Patterns</div>
                {pd.cyclePhases.summary && <div style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.6, marginBottom: 10 }}>{pd.cyclePhases.summary}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                  {pd.cyclePhases.rows.map((r) => (
                    <div key={r.phase} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 11, background: BASE.surface2 || "rgba(255,255,255,0.03)", border: `1px solid ${BASE.border}` }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.enough && r.top ? CAP_C[r.top] : "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: BASE.cream, width: 78, flexShrink: 0 }}>{PHL[r.phase]}</span>
                      {r.enough ? (
                        <span style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11.5, color: BASE.taupe }}>Avg {r.avg}%</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: CAP_C[r.top], padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.05)" }}>{CAP_L[r.top]}</span>
                        </span>
                      ) : <span style={{ flex: 1, fontSize: 11, color: BASE.taupe, fontStyle: "italic" }}>Not enough check-ins yet</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12.5, color: BASE.taupe, lineHeight: 1.55 }}>{cycleLength && lastPeriod ? "As you check in through each cycle phase, your rhythm will start to appear here." : "Turn on cycle tracking in the Body tab to see how your capacity moves through your cycle."}</div>
            )}
            {/* Weekly patterns */}
            {pd.weekly && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${BASE.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#C9558E", textTransform: "uppercase", marginBottom: 8 }}>Weekly Patterns</div>
                {pd.weekly.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 4 }}>{w}</div>)}
              </div>
            )}
            {/* Recovery patterns */}
            {pd.recoveryPatterns && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${BASE.border}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#7FA054", textTransform: "uppercase", marginBottom: 8 }}>Recovery Patterns</div>
                {pd.recoveryPatterns.map((w, i) => <div key={i} style={{ fontSize: 12.5, color: BASE.creamDim, lineHeight: 1.55, marginBottom: 4 }}>{w}</div>)}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: BASE.taupe, lineHeight: 1.55, fontStyle: "italic", marginTop: 16, paddingTop: 14, borderTop: `0.5px solid ${BASE.border}` }}>These are patterns — not rules. Your capacity is always yours to choose.</div>
          </div>

          {/* ===== SECTION 3: MONTHLY REFLECTION ===== */}
          {report && !report.empty && (
            <>
              <SectionTitle sub={`A gentle look back at ${report.monthName}.`}>Monthly Reflection</SectionTitle>
              <div style={{ borderRadius: 20, background: `linear-gradient(160deg, ${BASE.surface}, ${BASE.bg2})`, border: `1px solid ${BASE.border}`, padding: "22px 20px" }}>
                <div style={{ textAlign: "center", marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: BASE.taupe, textTransform: "uppercase", letterSpacing: 1 }}>{report.monthName} · Average capacity</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: 600, color: THEMES[colorFromPct(report.avg)].accent, lineHeight: 1.1 }}>{report.avg}%</div>
                  {(pd.monthHi != null) && <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 2 }}>Highest {pd.monthHi}% · Lowest {pd.monthLo}%</div>}
                </div>
                <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
                  {[["Green", report.counts.green, THEMES.green.accent], ["Yellow", report.counts.yellow, THEMES.yellow.accent], ["Red", report.counts.red, THEMES.red.accent], ["Recovery", pd.recoveryDays, "#A87BD1"]].map(([lbl, n, c]) => (
                    <div key={lbl} style={{ flex: 1, textAlign: "center", padding: "11px 3px", borderRadius: 12, background: BASE.surface2 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: c }}>{n}</div>
                      <div style={{ fontSize: 10, color: BASE.taupe }}>{lbl}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `0.5px solid ${BASE.border}`, paddingTop: 12 }}>
                  {pd.favCat && <ReportLine label="Favorite workout" value={pd.favCat} />}
                  {report.recovery && <ReportLine label="Most helpful recovery habit" value={report.recovery} />}
                  {report.bestPhase && <ReportLine label="Highest-capacity phase" value={PHASES[report.bestPhase].emoji + " " + PHASES[report.bestPhase].name} />}
                </div>
                {pd.monthlyReflection && <p style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.65, marginTop: 16, fontStyle: "italic" }}>{pd.monthlyReflection}</p>}
              </div>
            </>
          )}

          {/* ===== SECTION 4: MOVEMENT HISTORY ===== */}
          <SectionTitle sub="Every session counted.">Movement History</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <Stat label="Total workouts" value={pd.totalWorkouts} accent={T.accent} />
            <Stat label="Movement minutes" value={"~" + pd.totalMinutes} accent="#9B6BC3" />
            <Stat label="Favorite category" value={pd.favCat || "—"} accent="#C9558E" />
            <Stat label="Current streak" value={pd.workoutStreak + (pd.workoutStreak === 1 ? " day" : " days")} accent={THEMES.green.accent} />
          </div>
          {!sortedWo.length ? (
            <div style={{ padding: 22, borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, color: BASE.taupe, fontSize: 13.5, lineHeight: 1.6, textAlign: "center" }}>Finish a workout in the Body tab and it will show up here.</div>
          ) : (
            sortedWo.slice(0, 8).map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", borderRadius: 14, background: BASE.surface, border: `1px solid ${BASE.border}`, marginBottom: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: "50%", background: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BASE.cream }}>{(WO_TYPES.find((t) => t.key === w.type) || { label: w.type }).label}</div>
                  <div style={{ fontSize: 11.5, color: BASE.taupe, marginTop: 1 }}>{new Date(w.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{w.program ? " · " + (PROG_BY_ID(w.program).name) : ""}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: THEMES[w.color] ? THEMES[w.color].accent : BASE.terracotta }}>{THEMES[w.color] ? THEMES[w.color].label.split(" ")[0] : ""}</span>
              </div>
            ))
          )}
          {sortedWo.length > 8 && <div style={{ fontSize: 11.5, color: BASE.taupe, textAlign: "center", marginTop: 4 }}>Showing your 8 most recent · {sortedWo.length} total</div>}

          {/* ===== BIGGEST WIN ===== */}
          <div style={{ borderRadius: 20, background: "linear-gradient(135deg,#E984B4,#A87BD1)", padding: "22px 22px", margin: "26px 0 20px", position: "relative", overflow: "hidden", boxShadow: "0 12px 30px rgba(168,123,209,0.32)" }}>
            <div style={{ position: "absolute", right: -16, top: -16, fontSize: 80, opacity: 0.14 }}>✨</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.9)", position: "relative" }}>✨ Biggest Win</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: "#fff", lineHeight: 1.35, marginTop: 8, position: "relative" }}>{pd.biggestWin}</div>
          </div>
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
            <Row label="Cycle settings" onClick={() => { setTmpLen(cycleNow ? String(cycleNow.length) : "28"); setTmpStart(lastPeriod || ""); setTab("body"); setBodyView("cycle"); setEditCycle(true) }} />
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
