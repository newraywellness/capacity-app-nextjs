// ============ RESET ============
// The calmest surface in the app. Suggestions are the content — they open
// nothing, complete nothing, and track nothing. The only navigation is the five
// Explore More pages at the foot.
//
// Capacity changes the COUNT as well as the content: Red shows 3, Yellow 4,
// Green 5. A hard day produces a shorter page. Capacity is never named on
// screen — explaining would point at how little she has.
//
// A very small number of suggestions carry an `extra` — an inline reveal, never
// a destination. Kept rare on purpose.

const S = (ic, text, extra) => (extra ? { ic, text, extra } : { ic, text })

// ── TODAY ───────────────────────────────────────────────────────────────────
const RESET_DAY = {
  red: [
    S("💧", "Drink a full glass of water."),
    S("🪟", "Open a window, even for a minute."),
    S("☀️", "Step outside for five minutes."),
    S("🪥", "Brush your teeth. That counts."),
    S("🚿", "Take a warm shower whenever it suits."),
    S("🎵", "Listen to one calming song and nothing else.", { kind: "songs", mood: "calm" }),
    S("🛏️", "Change into something soft."),
    S("🫖", "Make something warm to drink."),
    S("📵", "Put your phone in another room for ten minutes."),
    S("🌬️", "Take three slow breaths, right now."),
    S("🧦", "Put on clean socks."),
    S("🕯️", "Sit somewhere quiet and do nothing at all."),
  ],
  yellow: [
    S("🌿", "Open the windows while you get ready."),
    S("💧", "Drink a glass of water before your coffee."),
    S("🎵", "Listen to one favourite song without multitasking.", { kind: "songs", mood: "lift" }),
    S("🧘‍♀️", "Stretch for five minutes, however you like."),
    S("📖", "Read one chapter. Or one page."),
    S("💐", "Buy yourself flowers on the way home."),
    S("📓", "Journal for five minutes without editing."),
    S("🧴", "Put on a face mask while you do something else."),
    S("☕", "Make your favourite drink properly, not quickly."),
    S("🚶‍♀️", "Walk around the block with no destination."),
    S("🌤️", "Eat one meal outside, or by a window."),
    S("🎧", "Listen to something you loved at seventeen.", { kind: "songs", mood: "nostalgia" }),
  ],
  green: [
    S("🧺", "Go to the farmers' market with no list."),
    S("📚", "Spend an hour in a bookshop."),
    S("☕", "Take yourself to a coffee shop and stay a while."),
    S("🍞", "Bake something. The house will smell wonderful."),
    S("📞", "Call the friend you keep meaning to call."),
    S("🌅", "Walk somewhere you can see the sky properly."),
    S("🥾", "Go somewhere you've never been in your own town."),
    S("🎨", "Make something with your hands, badly and happily."),
    S("🛍️", "Wander somewhere beautiful with no plan to buy."),
    S("🌊", "Get to water if you can — sea, river, lake, anything."),
    S("🎵", "Put on a full album and listen the whole way through.", { kind: "songs", mood: "album" }),
    S("🌻", "Plant something, even in a pot on the sill."),
  ],
}

// ── TONIGHT ─────────────────────────────────────────────────────────────────
const RESET_NIGHT = {
  red: [
    S("🛁", "A warm shower, no rush."),
    S("🌙", "Get into bed earlier than you need to."),
    S("📵", "Leave your phone charging in another room."),
    S("🕯️", "Turn on a lamp instead of the big light."),
    S("💧", "A glass of water beside the bed."),
    S("🧴", "Wash your face, even if that's the whole routine."),
    S("🫧", "Let the dishes wait until tomorrow."),
    S("🎵", "One quiet song in the dark.", { kind: "songs", mood: "night" }),
    S("🤍", "Say one kind thing to yourself before you sleep."),
    S("🧸", "Get under a heavier blanket."),
    S("😌", "Close your eyes for ten minutes before bed."),
    S("🌡️", "Make the room a little cooler than feels necessary."),
  ],
  yellow: [
    S("📖", "Read ten pages of something you're enjoying."),
    S("🌙", "Put your phone away thirty minutes early."),
    S("🕯️", "Light a candle while you tidy one small thing."),
    S("📓", "Write one sentence about today."),
    S("🛁", "Run a bath, even a short one."),
    S("🧴", "Do the longer version of your skincare tonight."),
    S("🍵", "Make a warm drink and don't take it to your desk."),
    S("🧘‍♀️", "Stretch on the floor for five minutes before bed."),
    S("🎵", "Something slow while you wind down.", { kind: "songs", mood: "night" }),
    S("🪟", "Open a window for a few minutes before you sleep."),
    S("📝", "Write tomorrow's three things down so you can stop holding them."),
    S("🤍", "Go to bed without finishing everything. On purpose."),
  ],
  green: [
    S("🛁", "A long bath with everything you actually like in it."),
    S("🍽️", "Cook something properly, with music on.", { kind: "songs", mood: "cooking" }),
    S("🌆", "Get out for a sunset walk."),
    S("🍷", "Have the nice thing. Not for an occasion."),
    S("📚", "Read in an actual armchair, not in bed."),
    S("🧖‍♀️", "Give yourself the full spa night."),
    S("📞", "Long phone call with someone who makes you laugh."),
    S("🎬", "Watch the film you keep saying you'll watch."),
    S("📓", "Journal properly — a page, not a line."),
    S("🕯️", "Make the whole room warm: lamps, candle, blanket."),
    S("🎵", "Put on a record and don't do anything else.", { kind: "songs", mood: "album" }),
    S("🌌", "Go outside and look up before bed."),
  ],
}

// ── SONG SUGGESTIONS ────────────────────────────────────────────────────────
// An inline reveal, never a page. No playlist links — those would need a real
// account and a maintained playlist, and an invented URL helps nobody.
const RESET_SONGS = {
  calm:      { label: "A few quiet ones", songs: ["Weightless — Marconi Union", "Saturn — Sleeping At Last", "Re: Stacks — Bon Iver", "Holocene — Bon Iver", "The Night We Met — Lord Huron"] },
  lift:      { label: "A few that lift", songs: ["Dog Days Are Over — Florence + The Machine", "Feeling Good — Nina Simone", "Golden — Harry Styles", "September — Earth, Wind & Fire", "Put Your Records On — Corinne Bailey Rae"] },
  nostalgia: { label: "A few from back then", songs: ["Dreams — Fleetwood Mac", "Landslide — Fleetwood Mac", "Wonderwall — Oasis", "Torn — Natalie Imbruglia", "Linger — The Cranberries"] },
  night:     { label: "A few for the evening", songs: ["Nightswimming — R.E.M.", "Harvest Moon — Neil Young", "Blue — Joni Mitchell", "Vincent — Don McLean", "First Day of My Life — Bright Eyes"] },
  album:     { label: "Albums worth the whole hour", songs: ["Blue — Joni Mitchell", "For Emma, Forever Ago — Bon Iver", "Rumours — Fleetwood Mac", "Carrie & Lowell — Sufjan Stevens", "Norman Fucking Rockwell! — Lana Del Rey"] },
  cooking:   { label: "A few for the kitchen", songs: ["Valerie — Amy Winehouse", "Lovely Day — Bill Withers", "Sunday Morning — Maroon 5", "L-O-V-E — Nat King Cole", "Islands In The Stream — Dolly Parton & Kenny Rogers"] },
}

// ── EXPLORE MORE ────────────────────────────────────────────────────────────
// The only places in Reset that open. Five, and no more.
const RESET_EXPLORE = [
  {
    id: "spa-night", ic: "🛁", title: "Spa Night", sub: "The full version, when you have the evening",
    intro: "Not a routine to complete. A sequence to move through slowly, stopping wherever you like.",
    steps: [
      ["Set the room first", "Lamps not overheads, a candle, phone in another room. Do this before anything else — it's what separates a spa night from a shower."],
      ["Start with your hair", "Mask or oil on the lengths now, so it works while you do everything else. Twenty minutes minimum."],
      ["Bath or long shower", "Epsom salts if you have them. Warm rather than hot — hot water strips the barrier you're about to spend an hour supporting."],
      ["Exfoliate gently", "Body only, and only if skin isn't irritated. Once a week is plenty."],
      ["Face, properly", "Double cleanse, then a mask while you're still warm. Fifteen minutes, not until it cracks."],
      ["Moisturise on damp skin", "Within three minutes of getting out. This one step does more than anything else on the list."],
      ["Feet and hands last", "Balm, thick socks. Nobody regrets this bit."],
      ["Get into bed early", "The point isn't the products. It's the unhurried hour and going to bed feeling looked after."],
    ],
    note: "If you only have twenty minutes, do the hair mask and the moisturiser on damp skin. Those two carry most of the benefit.",
  },
  {
    id: "date-yourself", ic: "🍷", title: "Date Yourself", sub: "Your own company, on purpose",
    intro: "Not killing time alone — choosing it. The difference is entirely in the intention.",
    byCapacity: {
      red: ["A coffee somewhere that isn't your kitchen", "Sit in the car and finish the song before going in", "One episode of something, without your phone"],
      yellow: ["Breakfast out with a book", "A film at home, properly — lights off, phone away", "An hour in a bookshop with no purchase in mind"],
      green: ["Lunch at a restaurant, at a table, with a book", "A gallery or museum on your own", "A day trip somewhere an hour away"],
    },
    tips: ["Bring a book rather than your phone — it changes how the time feels, and how people treat you.",
      "Sit at the table, not the bar, if you'd rather not be talked to.",
      "Go somewhere new. Familiar places pull you into familiar thinking.",
      "The awkwardness lasts about ten minutes the first time, and never comes back."],
    note: "Most women who try this once keep doing it. The first time is the only hard one — after that it stops being brave and becomes something you look forward to.",
  },
  {
    id: "journaling", ic: "🖋️", title: "Journaling", sub: "Prompts for when nothing comes",
    intro: "There's no correct way to do this. A sentence counts. A list counts. Complaining counts.",
    prompts: [
      ["When you don't know where to start", ["What do I keep thinking about today?", "What would I say if someone asked how I actually am?", "What am I pretending not to be annoyed about?", "What went better than expected?"]],
      ["When you're overwhelmed", ["What is genuinely mine to carry, and what isn't?", "What would I take off the list if nobody would notice?", "What's the smallest next thing?", "What am I afraid will happen if I rest?"]],
      ["When you feel flat", ["When did I last feel like myself?", "What used to take up my time before?", "What do I miss?", "What would a slightly kinder version of today look like?"]],
      ["When it's been a good day", ["What made it good — specifically?", "Who was part of it?", "What do I want to remember about right now?"]],
    ],
    tips: ["Five minutes is a full session. Set a timer if it helps you stop.",
      "Nobody reads it. Spelling, grammar and coherence are irrelevant.",
      "If you skip three weeks, you haven't failed at journaling. Open it again."],
    note: "Writing things down measurably reduces rumination — the looping thought that won't resolve. That's the mechanism, and it works even when what you've written isn't profound.",
  },
  {
    id: "breathing", ic: "🌬️", title: "Guided Breathing", sub: "Three techniques, and when each helps",
    intro: "Slow breathing shifts you toward the parasympathetic state — the one where your body isn't braced. This is among the fastest physiological levers you have.",
    techniques: [
      ["Physiological sigh", "For: a spike of stress, right now", "Two inhales through the nose — one long, one short sharp top-up — then a long slow exhale through the mouth. Repeat one to three times. This is the fastest known way to lower acute stress, and it works within seconds."],
      ["Box breathing", "For: settling before something", "In for four, hold four, out for four, hold four. Continue for two to five minutes. Used by clinicians and military alike because it's simple enough to do when your hands are shaking."],
      ["4-7-8", "For: falling asleep", "In through the nose for four, hold for seven, out through the mouth for eight. Four cycles. The long exhale is what does the work — it slows the heart rate directly."],
    ],
    tips: ["The exhale matters more than the inhale. Longer out than in, always.",
      "Nose in, mouth out, unless a technique says otherwise.",
      "Feeling light-headed means you're overbreathing — go gentler and slower."],
    note: "If you have a respiratory condition, or breathing exercises make you anxious rather than calmer, stop. For some people focusing on the breath increases distress, and that's a known response rather than a failure.",
  },
  {
    id: "deep-stretch", ic: "🧘‍♀️", title: "Deep Stretch", sub: "Ten minutes, floor only",
    intro: "Not a workout. Long holds, easy breathing, nothing that should hurt. Do it in whatever you're already wearing.",
    steps: [
      ["Child's pose", "2 minutes", "Knees wide, big toes together, arms forward. Let your forehead rest. Breathe into your back."],
      ["Cat–cow", "1 minute", "On hands and knees, alternate arching and rounding with your breath. Slow — this is a mobility drill, not a rep."],
      ["Low lunge, each side", "1 minute each", "Back knee down on something soft. Hips forward, not down. Where most of us are tightest from sitting."],
      ["Figure four on your back", "1 minute each", "Ankle over opposite knee, pull the thigh toward you. Better than a seated version if your back is unhappy."],
      ["Supine twist, each side", "1 minute each", "Knees over to one side, shoulders staying down. Turn your head the other way if it's comfortable."],
      ["Legs up the wall", "2 minutes or longer", "Exactly what it says. Genuinely restorative, and the easiest thing on this list to do badly-but-usefully."],
    ],
    tips: ["Hold long enough to get bored. Tissue change happens after about 90 seconds, not 20.",
      "Breathe normally. Holding your breath is the most common mistake.",
      "Sharp or shooting pain means come out. Stretch should feel like sensation, not warning."],
    note: "If you're within a year of giving birth, go gently with deep twists and anything that pushes the abdomen outward, and skip it entirely if you have pelvic floor symptoms until you've seen a physio. Postpartum tissue is still remodelling long after you feel fine.",
  },
]

export { RESET_DAY, RESET_NIGHT, RESET_SONGS, RESET_EXPLORE }
