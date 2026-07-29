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

export { ALL_PROGRAMS, MOVEMENTS, MOVE_GROUPS, LEVEL_LABEL, EXERCISES, EXERCISES_UPPER, PROGRAM_ENV_DEFAULT, PROGRAM_EXERCISE_PREF, pickExercise }
