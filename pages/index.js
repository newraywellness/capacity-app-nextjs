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
  { key: "legs", label: "Legs", icon: "\ud83e\uddb5" },
  { key: "glutes", label: "Glutes", icon: "\ud83c\udf51" },
  { key: "upper", label: "Upper", icon: "\ud83d\udcaa" },
  { key: "walk", label: "Walk", icon: "\ud83d\udeb6\u200d\u2640\ufe0f" },
]
const WEEK_PLAN = [
  { d: "Mon", t: "full" }, { d: "Tue", t: "walk" }, { d: "Wed", t: "legs" },
  { d: "Thu", t: "upper" }, { d: "Fri", t: "walk" }, { d: "Sat", t: "glutes" }, { d: "Sun", t: "rest" },
]
const HERO_GRAD = {
  red: "linear-gradient(135deg, #E0705F 0%, #C34A3B 100%)",
  yellow: "linear-gradient(135deg, #E3A94E 0%, #C07E20 100%)",
  green: "linear-gradient(135deg, #93B061 0%, #66883E 100%)",
}
const demoLink = (name) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " form how to")
const GLOWUP = [
  { key: "water", icon: "\ud83d\udca7", red: "One glass of water", yellow: "Water before coffee", green: "Water before coffee + one refill" },
  { key: "protein", icon: "\ud83c\udf73", red: "One easy protein (yogurt, cheese stick)", yellow: "Protein at breakfast", green: "Protein anchoring every meal" },
  { key: "move", icon: "\ud83d\udc5f", red: "Step outside or stretch for 2 minutes", yellow: "A 10-minute walk", green: "Your workout (see Body)" },
  { key: "kind", icon: "\ud83d\udc9c", red: "Catch one harsh thought, answer kindly", yellow: "Catch one harsh thought, answer kindly", green: "Catch one harsh thought, answer kindly" },
  { key: "soft", icon: "\ud83c\udf38", red: "One soft touch \u2014 candle, pretty glass", yellow: "5-minute reset of one space", green: "Reset one space + one soft touch" },
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
  "What did I do today that counted \u2014 even if it was tiny?",
  "Whose voice is my inner critic... and do I want to keep listening to it?",
  "What's one honest 'no' I need to say this week?",
  "What's one small promise I can keep to myself tomorrow?",
]
const RESETS = [
  { name: "The 5-minute space reset", icon: "\ud83c\udff5\ufe0f", how: "Pick ONE spot \u2014 the counter, your nightstand. Timer for 5 minutes. Reset only that. One calm corner does some of the calming for you." },
  { name: "Long-exhale breathing", icon: "\ud83c\udf2c\ufe0f", how: "Two minutes: breathe in for 4, out for 8. The long exhale is the fastest lever your body has for switching off alarm mode." },
  { name: "Step outside", icon: "\u2600\ufe0f", how: "Ten minutes of daylight, ideally morning. It sets your energy rhythm and quiets the noise. No phone required." },
  { name: "The pretty glass ritual", icon: "\ud83e\udd42", how: "Your water, but in the prettiest glass you own. Tiny sensory pleasures are how ordinary days start feeling beautiful." },
  { name: "Phone down, lights low", icon: "\ud83c\udf19", how: "Pick one wind-down anchor tonight \u2014 phone away a little earlier, lights dimmed. Tomorrow begins tonight." },
]
const dayIndex = (len) => { const d = new Date(); return (d.getFullYear() * 366 + Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)) % len }

const WORKOUTS = {
  walk: {
    red: { title: "Show Up Gently", time: "10-20 min", note: "On a Red day, showing up IS the workout. Walk, then go home proud.", exercises: [
      { name: "Treadmill walk - easy pace", sets: 1, reps: "10-20 min", cue: "Flat or a gentle incline.", how: ["Start slow for 2 minutes and let your body arrive.", "Settle into a pace where you could chat comfortably.", "Stop while it still feels good - that is the point today."] },
    ]},
    yellow: { title: "The Steady Walk", time: "20-30 min", note: "Purposeful, not punishing. You should be able to talk, but not sing.", exercises: [
      { name: "Treadmill walk - brisk", sets: 1, reps: "20-30 min", cue: "Comfortable but intentional pace.", how: ["Warm up easy for 3 minutes.", "Pick a pace that feels purposeful - talking possible, singing not.", "Last 2 minutes, ease back down."] },
      { name: "Incline minutes (optional)", sets: 1, reps: "5 x 1 min", cue: "Recover flat between.", how: ["Raise incline to 3-5% for one minute.", "Return to flat for 1-2 minutes to recover.", "Repeat up to 5 times if it feels good."] },
    ]},
    green: { title: "Cardio That Builds", time: "40-60 min", note: "You have energy today - use it well, without spending tomorrow's.", exercises: [
      { name: "Warmup walk", sets: 1, reps: "5 min", cue: "Ease in.", how: ["Start flat and easy.", "Gradually pick up pace over 5 minutes."] },
      { name: "Incline or jog intervals", sets: 1, reps: "8-10 x 2 min", cue: "Work 2 min, easy 1 min.", how: ["Push pace or incline for 2 minutes - breathing hard but controlled.", "Recover at an easy pace for 1 minute.", "Repeat 8-10 rounds."] },
      { name: "Cooldown + stretch", sets: 1, reps: "5-10 min", cue: "Let your heart rate come all the way down.", how: ["Walk slow until breathing is normal.", "Stretch calves, quads, and hips gently."] },
    ]},
  },
  full: {
    red: { title: "The Gentle Circuit", time: "~15 min", note: "Light, kind movement. Every rep here fully counts.", exercises: [
      { name: "Squat to a bench", sets: 2, reps: "10", cue: "Control over speed.", how: ["Stand in front of a bench, feet shoulder-width.", "Sit back slowly until you lightly touch the bench.", "Stand tall by driving through your heels."] },
      { name: "Wall or incline pushups", sets: 2, reps: "8-10", cue: "Body in one line.", how: ["Hands on a wall or raised bar, body straight.", "Lower your chest slowly toward your hands.", "Press back up without letting hips sag."] },
      { name: "Band or light seated row", sets: 2, reps: "10", cue: "Squeeze the shoulder blades.", how: ["Sit tall, arms extended holding band or handle.", "Pull toward your ribs, squeezing shoulder blades together.", "Release slowly with control."] },
      { name: "Stretch anything tight", sets: 1, reps: "5 min", cue: "Whatever feels kind today.", how: ["Pick 2-3 areas that feel tight.", "Hold each stretch 30 seconds, breathing slow."] },
    ]},
    yellow: { title: "Short + Solid", time: "~25 min", note: "Three lifts, done well. Enough beats impressive.", exercises: [
      { name: "Goblet squat", sets: 3, reps: "10", cue: "Elbows inside knees at the bottom.", how: ["Hold a dumbbell vertically at your chest.", "Squat down slowly, chest tall, until elbows brush inner knees.", "Drive up through your heels."] },
      { name: "Seated cable row", sets: 3, reps: "10", cue: "Pull to your ribs, not your neck.", how: ["Sit tall, feet braced, grab the handle.", "Pull to your lower ribs, squeezing your mid-back.", "Let the weight pull your arms back out slowly."] },
      { name: "Machine chest press", sets: 3, reps: "10", cue: "Smooth both directions.", how: ["Adjust the seat so handles sit at mid-chest.", "Press out without locking elbows hard.", "Return slowly - 2 to 3 seconds back."] },
    ]},
    green: { title: "The Full Builder", time: "40-60 min", note: "The complete session - strength you will feel all week.", exercises: [
      { name: "Goblet or barbell squat", sets: 4, reps: "8-10", cue: "Brace your core hard.", how: ["Brace like someone is about to poke your stomach.", "Sit down between your hips, knees tracking over toes.", "Drive up hard through the whole foot."] },
      { name: "Romanian deadlift", sets: 3, reps: "10", cue: "Feel hamstrings, not low back.", how: ["Hold weights in front of thighs, soft knees.", "Push your hips straight back, weights sliding down your legs.", "When hamstrings pull, squeeze glutes and stand tall."] },
      { name: "Chest press", sets: 3, reps: "8-10", cue: "Control down, powerful up.", how: ["Lower with control for 2-3 seconds.", "Press up strong without bouncing.", "Keep wrists stacked over elbows."] },
      { name: "Lat pulldown", sets: 3, reps: "10", cue: "Lead with the elbows.", how: ["Grip slightly wider than shoulders, chest tall.", "Pull the bar to your collarbone, elbows driving down.", "Release slowly all the way up."] },
      { name: "Plank", sets: 3, reps: "30-45 sec", cue: "Quality over seconds.", how: ["Forearms down, body in one straight line.", "Squeeze glutes, pull ribs down.", "Stop when your hips start to sag."] },
    ]},
  },
  legs: {
    red: { title: "Legs, Softly", time: "~15 min", note: "Blood flow, not breakdown. Gentle counts.", exercises: [
      { name: "Easy bike or walk", sets: 1, reps: "10 min", cue: "Conversational pace.", how: ["Low resistance, easy rhythm.", "Just warm the legs and lift your mood."] },
      { name: "Glute bridge", sets: 2, reps: "12", cue: "Squeeze at the top.", how: ["Lie on your back, knees bent, feet flat.", "Drive hips up through your heels.", "Squeeze glutes for a full second at the top, lower slow."] },
      { name: "Calf raises", sets: 2, reps: "12", cue: "Slow up, slower down.", how: ["Rise onto the balls of your feet.", "Pause at the top.", "Lower down over 2-3 seconds."] },
    ]},
    yellow: { title: "Essential Legs", time: "~25 min", note: "The big movers, kept honest and short.", exercises: [
      { name: "Goblet squat", sets: 3, reps: "10", cue: "Depth you can control.", how: ["Weight at your chest, feet shoulder-width.", "Squat to a depth you fully control.", "Drive up through the heels."] },
      { name: "Leg press", sets: 3, reps: "12", cue: "Never slam the weight.", how: ["Feet mid-platform, hip-width apart.", "Lower until knees reach about 90 degrees.", "Press out without locking knees hard."] },
      { name: "Glute bridge", sets: 3, reps: "12", cue: "Drive through the heels.", how: ["Knees bent, feet flat and close to your hips.", "Lift hips until body forms a line, squeeze hard.", "Lower with control."] },
    ]},
    green: { title: "Leg Day, For Real", time: "45-60 min", note: "Five movements. Strong legs carry everything else.", exercises: [
      { name: "Squat", sets: 4, reps: "8", cue: "Brace, sit, drive.", how: ["Brace your core before every rep.", "Sit down between your hips, chest proud.", "Drive up through the whole foot."] },
      { name: "Romanian deadlift", sets: 3, reps: "10", cue: "Hips back, hamstrings loaded.", how: ["Soft knees, weights close to your legs.", "Push hips back until hamstrings pull.", "Squeeze glutes to stand - do not yank with your back."] },
      { name: "Leg press", sets: 3, reps: "10-12", cue: "Full control.", how: ["Lower slowly to about 90 degrees.", "Press out smooth and strong.", "Keep knees tracking over toes."] },
      { name: "Walking lunges", sets: 3, reps: "10/leg", cue: "Long steps, torso proud.", how: ["Step long, lower the back knee toward the floor.", "Push through the front heel to step through.", "Keep your torso tall the whole time."] },
      { name: "Hip thrust", sets: 3, reps: "12", cue: "Full squeeze at the top.", how: ["Upper back on a bench, bar or weight over hips.", "Drive hips up until your body is level, chin tucked.", "Squeeze glutes hard for a second at the top."] },
    ]},
  },
  glutes: {
    red: { title: "Glutes, Gently", time: "~15 min", note: "Wake them up kindly. Activation still builds.", exercises: [
      { name: "Glute bridge", sets: 2, reps: "12", cue: "Slow and squeezed.", how: ["Feet flat and close to your hips.", "Lift and squeeze for a full second at the top.", "Lower over 2-3 seconds."] },
      { name: "Clamshells", sets: 2, reps: "12/side", cue: "Keep hips stacked.", how: ["Lie on your side, knees bent, feet together.", "Open the top knee like a clamshell without rolling back.", "Close slowly. Switch sides."] },
      { name: "Standing kickbacks", sets: 2, reps: "10/side", cue: "Squeeze, do not swing.", how: ["Hold something for balance, stand tall.", "Kick one leg straight back with a glute squeeze.", "Return with control - no momentum."] },
    ]},
    yellow: { title: "Glute Essentials", time: "~25 min", note: "The moves that actually build - the honest middle version.", exercises: [
      { name: "Hip thrust or glute bridge", sets: 3, reps: "10", cue: "Chin tucked, full squeeze.", how: ["Upper back on a bench (or floor bridge).", "Drive hips up until level, squeeze hard.", "Lower with control."] },
      { name: "Sumo goblet squat", sets: 3, reps: "10", cue: "Wide stance, toes out.", how: ["Feet wide, toes turned out, weight at chest.", "Squat down keeping knees pushed out.", "Drive up squeezing your glutes."] },
      { name: "Cable or band kickbacks", sets: 3, reps: "12/side", cue: "Glute does the work.", how: ["Attach cable or band at ankle, hold support.", "Kick straight back with a hard glute squeeze.", "Return slow - never let it swing."] },
    ]},
    green: { title: "The Glute Builder", time: "45-60 min", note: "The full session. This is where shape gets built.", exercises: [
      { name: "Hip thrust", sets: 4, reps: "10", cue: "Your main lift today - load it.", how: ["Upper back on a bench, weight over hips.", "Drive up until level, chin tucked, ribs down.", "One-second hard squeeze at the top, lower slow."] },
      { name: "Romanian deadlift", sets: 3, reps: "10", cue: "Glutes finish the lift.", how: ["Push hips back, weights close to your legs.", "Feel the hamstring stretch.", "Squeeze glutes to stand tall - they do the work."] },
      { name: "Bulgarian split squat", sets: 3, reps: "8/leg", cue: "Front leg does everything.", how: ["Back foot on a bench behind you.", "Lower straight down, front knee over toes.", "Push through the front heel to rise."] },
      { name: "Cable kickbacks", sets: 3, reps: "12/side", cue: "Strict and squeezed.", how: ["Cable at ankle, slight forward lean, hold support.", "Kick back and slightly up, squeezing hard.", "Control the return every rep."] },
      { name: "Hip abduction machine", sets: 3, reps: "15", cue: "Push out, pause, resist back.", how: ["Sit tall, pads outside your knees.", "Push out as far as comfortable and pause.", "Resist the weight on the way back in."] },
    ]},
  },
  upper: {
    red: { title: "Upper, Easy Does It", time: "~15 min", note: "Wake the muscles up without emptying the tank.", exercises: [
      { name: "Band pull-aparts", sets: 2, reps: "12", cue: "Arms straight, blades squeeze.", how: ["Hold a band at shoulder height, arms straight.", "Pull it apart until it touches your chest.", "Return slowly."] },
      { name: "Wall pushups", sets: 2, reps: "8-10", cue: "Slow beats many.", how: ["Hands on the wall, body in one line.", "Lower your chest slowly toward the wall.", "Press back without sagging hips."] },
      { name: "Light dumbbell curls", sets: 2, reps: "10", cue: "Elbows glued to sides.", how: ["Light weights, palms up.", "Curl without swinging.", "Lower over 2-3 seconds."] },
    ]},
    yellow: { title: "Upper Essentials", time: "~25 min", note: "Push, pull, press. The trio that keeps you strong.", exercises: [
      { name: "Lat pulldown", sets: 3, reps: "10", cue: "Elbows down and back.", how: ["Grip slightly wider than shoulders.", "Pull to your collarbone, chest tall.", "Release slowly all the way."] },
      { name: "Machine chest press", sets: 3, reps: "10", cue: "Smooth tempo.", how: ["Handles at mid-chest height.", "Press out without hard lockout.", "Return over 2-3 seconds."] },
      { name: "Seated shoulder press", sets: 3, reps: "10", cue: "Ribs down - do not arch.", how: ["Back supported, weights at shoulder height.", "Press up and slightly back.", "Lower to ear height with control."] },
    ]},
    green: { title: "The Upper Builder", time: "40-60 min", note: "The full session. Strong shoulders, strong posture, strong you.", exercises: [
      { name: "Lat pulldown", sets: 4, reps: "10", cue: "Chest tall, elbows lead.", how: ["Wide grip, slight lean back.", "Pull to collarbone, squeezing lats.", "Slow full release each rep."] },
      { name: "Chest press", sets: 4, reps: "8-10", cue: "Control the negative.", how: ["Lower for 2-3 seconds - that is where strength builds.", "Press up strong.", "Keep shoulder blades pinned back."] },
      { name: "Seated row", sets: 3, reps: "10", cue: "Mid-back, not arms.", how: ["Sit tall, pull the handle to your lower ribs.", "Squeeze between your shoulder blades.", "Release slow."] },
      { name: "Shoulder press", sets: 3, reps: "10", cue: "Biceps by the ears.", how: ["Press up and slightly back.", "Do not arch your lower back.", "Lower with control to ear height."] },
      { name: "Curls + triceps pushdown superset", sets: 3, reps: "12 each", cue: "Back to back, finish strong.", how: ["Do a set of curls, elbows pinned.", "Immediately do a set of pushdowns.", "Rest one minute, repeat."] },
    ]},
  },
}

// ---- Atmosphere engine: environment = f(hour, capacity) ----
const ENV = (hour, color) => {
  let mode = hour >= 5 && hour < 11 ? "morning" : hour >= 11 && hour < 17 ? "afternoon" : "evening"
  if (color === "red") mode = "evening"
  const bright = color === "green"
  const bgs = {
    morning: "linear-gradient(180deg,#FFEDD8 0%,#FFE0E4 28%,#F7D8EE 56%,#E6D5F6 100%)",
    afternoon: "linear-gradient(180deg,#FFE3C4 0%,#FFD9D2 30%,#F5D3E8 62%,#E4D0F2 100%)",
    evening: "linear-gradient(180deg,#2E2149 0%,#4A2E5E 40%,#6E3F6E 72%,#8A4E70 100%)",
  }
  return { mode, bright, bg: bgs[mode], dark: mode === "evening" }
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

  useEffect(() => {
    try { setWoLog(JSON.parse(localStorage.getItem("nr_workout_log") || "[]")) } catch (e) {}
    try { setGlowLog(JSON.parse(localStorage.getItem("nr_glow_log") || "{}")) } catch (e) {}
    try { setBloomNotes(JSON.parse(localStorage.getItem("nr_bloom_notes") || "{}")) } catch (e) {}
    try { const n = localStorage.getItem("nr_name"); if (n) setFirstName(n) } catch (e) {}
    try { const st = localStorage.getItem("nr_setup"); if (st) setSetupData(JSON.parse(st)) } catch (e) {}
  }, [])

  useEffect(() => { checkAuth() }, [])

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
        if (p.data) setProfile(p.data)
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
          {envA.dark && <><span style={{ position: "absolute", top: 46, left: 60, color: "#E8B84B", opacity: 0.7, fontSize: 11, animation: "twinkle 3.5s ease-in-out infinite" }}>{"\u2726"}</span><span style={{ position: "absolute", top: 110, right: 52, color: "#E8B84B", opacity: 0.6, fontSize: 9, animation: "twinkle 4.5s ease-in-out infinite" }}>{"\u2726"}</span></>}
          {authView === "welcome" && (
            <div className="fade-in" style={{ textAlign: "center", position: "relative" }}>
              <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: 54, color: envA.dark ? "#FFF6EC" : "#4A2F45", marginBottom: 2 }}>New Ray</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, color: envA.dark ? "#FFF6EC" : "#3D2545", margin: "18px 0 8px", lineHeight: 1.25 }}>A wellness app that adapts to your real life.</h1>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 18, color: envA.dark ? "rgba(255,246,236,0.8)" : "#8E6C88", marginBottom: 34 }}>Less thinking. More living.</p>
              <button onClick={() => { setAuthView("signup"); setAuthMsg("") }} style={{ width: "100%", padding: 16, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 15, boxShadow: "0 10px 26px rgba(168,123,209,0.4)" }}>Get Started</button>
              <button onClick={() => { setAuthView("login"); setAuthMsg("") }} style={{ width: "100%", marginTop: 12, padding: 14, background: envA.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.6)", color: envA.dark ? "#FFF6EC" : "#4A2F45", border: `1px solid ${envA.dark ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"}`, borderRadius: 14, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Already have an account? Log In</button>
              <div onClick={() => { setGuest(true); setAuthMsg("") }} style={{ marginTop: 22, fontSize: 13, fontWeight: 600, color: envA.dark ? "#F0C879" : "#C9558E", cursor: "pointer" }}>Try a Preview {"\u2192"}</div>
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
      try { localStorage.setItem("nr_setup", JSON.stringify(data)) } catch (e) {}
      try { db.from("profiles").update({ setup: data, first_name: firstName }).eq("id", user.id).then(() => {}) } catch (e) {}
    }
    return (
      <><Fonts /><GlobalStyle />
        <div style={{ background: envS.bg, minHeight: "100vh", maxWidth: 440, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px" }}>
          <div className="fade-in" key={setupStep}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: "#C9558E", marginBottom: 8 }}>TELL US ABOUT YOU {"\u00b7"} {setupStep + 1} OF {steps.length}</div>
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
                : <button disabled={!canNext} onClick={finish} style={{ flex: 2, padding: 14, background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", border: "none", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: canNext ? 1 : 0.45 }}>Done {"\u2192"}</button>}
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: mut, fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", marginTop: 6 }}><span>running on empty</span><span>full of energy</span></div>
                <div style={{ fontSize: 11, color: mut, marginTop: 16, lineHeight: 1.55 }}>There is no wrong answer. The whole day shapes itself around this.</div>

                <div onClick={() => setCtxOpen(!ctxOpen)} style={{ marginTop: 18, fontSize: 12, fontWeight: 700, color: env.dark ? "#F0C879" : "#C9558E", cursor: "pointer" }}>{ctxOpen ? "\u2212 Hide context" : "+ Add a little context (optional)"}</div>
                {ctxOpen && (
                  <div className="fade-in" style={{ marginTop: 14 }}>
                    <Label>What's affecting you?</Label>
                    <Chips items={FACTORS} selected={factors} onToggle={(v) => toggle(factors, setFactors, v)} />
                    <div style={{ height: 14 }} />
                    <Label>What would support you most?</Label>
                    <Chips items={SUPPORTS} selected={supports} onToggle={(v) => toggle(supports, setSupports, v)} />
                    <div style={{ height: 14 }} />
                    <Label>Today's one thing</Label>
                    <input type="text" value={oneThing} onChange={(e) => setOneThing(e.target.value)} placeholder="The single thing that would make today a success\u2026" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: env.dark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.8)", border: `1px solid ${cardBd}`, color: ink, fontSize: 13.5, outline: "none" }} />
                  </div>
                )}
                <button onClick={saveCheckin} disabled={saving} style={{ width: "100%", marginTop: 20, padding: 15, borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#E984B4,#A87BD1)", color: "#FFFFFF", fontSize: 14.5, fontWeight: 700, opacity: saving ? 0.6 : 1, boxShadow: "0 8px 22px rgba(168,123,209,0.35)" }}>{saving ? "Setting your day\u2026" : "Set my day"}</button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, color: env.dark ? "#F0C879" : "#C9558E" }}>TODAY IS SET</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: ink, marginTop: 6 }}>{pct}% \u00b7 {THEMES[cur].label}</div>
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
              <div style={{ marginTop: 14, display: "inline-block", padding: "8px 15px", borderRadius: 999, background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 11, fontWeight: 600 }}>No rush \u2014 whenever it happens.</div>
            </div>
          )}

          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 19, color: ink, margin: "30px 0 12px" }}>Today might feel better with\u2026</div>
          {suggs.map((g, i) => (
            <div key={i} className="fade-in" style={{ borderRadius: 16, background: cardBg, border: `1px solid ${cardBd}`, padding: "16px 17px", marginBottom: 10, display: "flex", alignItems: "center", boxShadow: env.dark ? "0 6px 18px rgba(0,0,0,0.25)" : "0 6px 18px rgba(120,80,130,0.08)" }}>
              <div style={{ width: 36, marginRight: 10, textAlign: "center" }}>{SICON(g.icon, env.dark ? "#F0C879" : "#C9558E")}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15.5, color: ink, lineHeight: 1.45 }}>{g.text}</div>
            </div>
          ))}

          <div style={{ textAlign: "center", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 13, color: mut, margin: "28px 0 0" }}>New Ray changes with you \u2014 morning to evening, full to empty.</div>
        </div>
      )
    }

    if (tab === "body" && bodyView === "gym") {
      const gymColor = woColor || cur
      const wo = WORKOUTS[woType][gymColor]
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
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 26, textAlign: "center", margin: "14px 0 2px" }}>Train the body you woke up with</h2>
          <p style={{ textAlign: "center", color: BASE.taupe, fontSize: 12, margin: "0 0 14px" }}>{thisWeek.length} workout{thisWeek.length === 1 ? "" : "s"} this week</p>

          <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
            {WEEK_PLAN.map((p, idx) => {
              const isToday = idx === weekday
              const done = dayDone(idx)
              const rest = p.t === "rest"
              return (
                <div key={p.d} onClick={() => { if (!rest) setWoType(p.t) }} style={{ flex: 1, textAlign: "center", cursor: rest ? "default" : "pointer", padding: "8px 2px", borderRadius: 12, background: isToday ? THEMES[gymColor].tint : BASE.surface, border: `1.5px solid ${isToday ? THEMES[gymColor].accent : BASE.border}`, opacity: rest ? 0.55 : 1 }}>
                  <div style={{ fontSize: 9.5, color: BASE.taupe, fontWeight: 700, textTransform: "uppercase" }}>{p.d}</div>
                  <div style={{ fontSize: 13, marginTop: 3 }}>{done ? "\u2713" : rest ? "\u2014" : ""}</div>
                  <div style={{ fontSize: 8.5, color: done ? THEMES.green.accent : BASE.taupe, fontWeight: 600, textTransform: "capitalize", marginTop: 1 }}>{rest ? "rest" : WO_TYPES.find((t) => t.key === p.t).label.split(" ")[0]}</div>
                </div>
              )
            })}
          </div>

          {suggestion && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", borderRadius: 12, background: THEMES[suggestion].tint, border: `1px solid rgba(${THEMES[suggestion].glow},0.35)`, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: BASE.creamDim }}>Cycle hint: <b style={{ color: THEMES[suggestion].accent }}>{cycleNow.phase}</b> (day {cycleNow.day}) often feels like a {THEMES[suggestion].label}</span>
              <button onClick={() => setWoColor(suggestion)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: THEMES[suggestion].accent, color: "#FFFFFF", fontSize: 11, fontWeight: 700 }}>Use it</button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {["red", "yellow", "green"].map((k) => {
              const active = gymColor === k
              return (
                <div key={k} onClick={() => setWoColor(k)} style={{ flex: 1, cursor: "pointer", textAlign: "center", padding: "11px 6px", borderRadius: 14, background: active ? THEMES[k].tint : BASE.surface, border: `1.5px solid ${active ? THEMES[k].accent : BASE.border}` }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, color: THEMES[k].accent }}>{THEMES[k].label.split(" ")[0]}</div>
                </div>
              )
            })}
          </div>
          {!woColor && <p style={{ textAlign: "center", color: BASE.taupe, fontSize: 11, margin: "0 0 10px" }}>Following today's check-in ({THEMES[cur].label}). Tap a color to override.</p>}

          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {WO_TYPES.map((t) => (
              <button key={t.key} onClick={() => setWoType(t.key)} style={{ flex: 1, minWidth: 62, padding: "10px 4px", background: woType === t.key ? HERO_GRAD[gymColor] : BASE.surface, color: woType === t.key ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${woType === t.key ? "transparent" : BASE.border}`, borderRadius: 14, cursor: "pointer", fontSize: 11.5, fontWeight: 800, boxShadow: woType === t.key ? `0 4px 12px rgba(${THEMES[gymColor].glow},0.35)` : "none" }}><span style={{ fontSize: 16, display: "block", marginBottom: 2 }}>{t.icon}</span>{t.label}</button>
            ))}
          </div>

          <div style={{ padding: "22px 20px", borderRadius: 22, background: HERO_GRAD[gymColor], marginBottom: 14, boxShadow: `0 10px 26px rgba(${THEMES[gymColor].glow},0.35)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", right: 30, bottom: -50, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.85)" }}>{THEMES[gymColor].label} · {WO_TYPES.find((t) => t.key === woType).label}</span>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: "#FFFFFF", background: "rgba(255,255,255,0.22)", padding: "5px 12px", borderRadius: 999 }}>{wo.time}</span>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 700, color: "#FFFFFF", margin: "10px 0 4px", lineHeight: 1.05, position: "relative" }}>{wo.title}</div>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.92)", margin: "0 0 14px", lineHeight: 1.5, position: "relative" }}>{wo.note}</p>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.25)", overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${totalSets ? Math.round((doneSets / totalSets) * 100) : 0}%`, background: "#FFFFFF", borderRadius: 999, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", marginTop: 6, fontWeight: 800, position: "relative" }}>{doneSets} / {totalSets} sets complete</div>
          </div>

          {wo.exercises.map((ex, i) => {
            const open = woOpen === i
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
                    {ex.how.map((step, si) => (
                      <div key={si} style={{ display: "flex", gap: 9, marginBottom: si === ex.how.length - 1 ? 0 : 7 }}>
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
          <p style={{ fontSize: 13, color: BASE.taupe, marginBottom: 18 }}>The mental glow up {"\u2014"} one gentle shift at a time.</p>

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
          <p style={{ fontSize: 13, color: BASE.taupe, marginBottom: 20 }}>{woLog.length} logged {"\u00b7"} every one counted.</p>
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
          {chevron && <span style={{ color: BASE.taupe, fontSize: 16 }}>{"\u203a"}</span>}
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
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{nm[0] ? nm[0].toUpperCase() : "\ud83c\udf38"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>{"\ud83c\udf38"} My Life</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: "#fff", marginTop: 2 }}>{nm}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.9)" }}>{season}</div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 20 }}>{"\u203a"}</span>
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
      const d = setupData || {}
      const Field = ({ label, value }) => (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${BASE.border}` }}>
          <span style={{ fontSize: 13.5, color: BASE.taupe }}>{label}</span>
          <span style={{ fontSize: 13.5, color: BASE.cream, fontWeight: 600 }}>{value || "\u2014"}</span>
        </div>
      )
      const Sec = ({ title, children }) => (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: BASE.taupe, margin: "0 4px 8px" }}>{title}</div>
          <div style={{ borderRadius: 16, background: BASE.surface, border: `1px solid ${BASE.border}`, overflow: "hidden" }}>{children}</div>
        </div>
      )
      return (
        <div className="fade-in" style={{ padding: "10px 18px 0" }}>
          <div onClick={() => setMoreView("menu")} style={{ fontSize: 13, fontWeight: 700, color: BASE.taupe, cursor: "pointer", marginBottom: 14 }}>{"\u2039"} Back</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, marginBottom: 2 }}>{"\ud83c\udf38"} My Life</div>
          <div style={{ fontSize: 12, color: BASE.taupe, marginBottom: 22 }}>Everything here centers on your life, not your stats.</div>
          <Sec title="About Me"><Field label="Name" value={d.name} /><Field label="My season" value={d.season} /></Sec>
          <Sec title="My Goals">{(d.hopes && d.hopes.length ? d.hopes : ["\u2014"]).map((h, i) => (<Field key={i} label={i === 0 ? "Hoping for" : ""} value={h} />))}</Sec>
          <Sec title="My Gym"><Field label="Experience" value={d.level} /><Field label="Equipment" value={d.equip} /></Sec>
          <Sec title="My Preferences"><Field label="Cycle tracking" value={d.cyclePref} /><Field label="Morning greeting" value="On" /></Sec>
          <div style={{ fontSize: 11, color: BASE.taupe, textAlign: "center", margin: "6px 0 4px", lineHeight: 1.6 }}>Editing your life details is coming soon. For now, these come from your welcome setup.</div>
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
                <div style={{ position: "absolute", top: 40, left: 60, color: "#F0C879", fontSize: 9, animation: "twinkle 3s ease-in-out infinite" }}>{"\u2726"}</div>
                <div style={{ position: "absolute", top: 110, left: 150, color: "#F0C879", fontSize: 7, animation: "twinkle 4.4s ease-in-out infinite" }}>{"\u2726"}</div>
                <div style={{ position: "absolute", top: 84, right: 130, color: "#F0C879", fontSize: 8, animation: "twinkle 3.7s ease-in-out infinite" }}>{"\u2726"}</div>
                <div style={{ position: "absolute", top: 210, left: 36, width: 6, height: 6, borderRadius: "50%", background: "#F0C879", boxShadow: "0 0 10px 4px rgba(240,200,121,0.5)", animation: "flicker 3.2s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: 300, right: 44, width: 5, height: 5, borderRadius: "50%", background: "#F0C879", boxShadow: "0 0 9px 3px rgba(240,200,121,0.45)", animation: "flicker 4.6s ease-in-out infinite" }} />
              </>
            )}
          </div>
        )}
        <div style={{ position: "relative", paddingTop: 14 }}>
          {tab === "body" && (
            <div style={{ display: "flex", gap: 8, padding: "6px 18px 0" }}>
              {[["gym", "Gym"], ["cycle", "Cycle"]].map(([k, lbl]) => (
                <button key={k} onClick={() => setBodyView(k)} style={{ flex: 1, padding: 8, borderRadius: 999, cursor: "pointer", fontSize: 12, fontWeight: 700, background: bodyView === k ? T.accent : BASE.surface, color: bodyView === k ? "#FFFFFF" : BASE.creamDim, border: `1px solid ${bodyView === k ? T.accent : BASE.border}` }}>{lbl}</button>
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
            {[["today", "Today", "\u2600\ufe0f"], ["body", "Body", "\ud83d\udcaa"], ["bloom", "Bloom", "\ud83c\udf38"], ["progress", "Progress", "\ud83d\udcc8"], ["more", "More", "\ud83e\udd0d"]].map(([k, lbl, ic]) => {
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
