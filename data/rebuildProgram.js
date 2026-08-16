// ============ REBUILD PROGRAM: FEEL LIKE YOURSELF AGAIN ============
// 28 experiences, not 28 days. No streaks, no calendar, no "behind." Every
// experience carries four capacity doses (green/yellow/red/recovery) that
// change the SIZE of the thing, never its identity — Red is never "do
// nothing," Recovery is never pretending to be Green.
//
// `dimensions` tags which of the 8 things the program is learning about her
// this experience touches. Reaction options carry a `weight` (and an
// optional `surprise` flag) so the weekly reveals and the final Reverie can
// tally real, lightweight signals from what she actually chose — never
// fabricated insight. This is arithmetic on her own answers, not a
// recommendation engine.

const DIMENSIONS = ["Pleasure", "Identity", "Self-Expression", "Novelty", "Autonomy", "Connection", "Environment", "Anticipation"]

const DIM_PHRASE = {
  "Pleasure": "sensory pleasure \u2014 the small, physical stuff that feels good",
  "Identity": "figuring out who you are right now, not who you used to be",
  "Self-Expression": "expressing yourself \u2014 how you look, sound, and show up",
  "Novelty": "novelty \u2014 new places, new things, breaking the loop",
  "Autonomy": "doing things because you want to, with nobody else voting",
  "Connection": "the people who make you feel most like yourself",
  "Environment": "your surroundings \u2014 the spaces that shape your mood",
  "Anticipation": "having something ahead of you to look forward to",
}

const DEFAULT_REACTION = {
  question: "How did that feel?",
  options: [
    { key: "loved", label: "Loved this", weight: 1 },
    { key: "nice", label: "Nice", weight: 0.5 },
    { key: "notme", label: "Not really me", weight: -1 },
    { key: "surprised", label: "Surprised me", weight: 1, surprise: true },
  ],
}

const EXPERIENCES = [
  // ══════════════ WEEK 1 — NOTICE HER ══════════════
  {
    id: 1, week: 1, title: "The Wrong Store Mission",
    why: "Before we can find her, we have to stop assuming we already know what she likes.",
    dimensions: ["Novelty", "Identity"],
    anchor: {
      text: "Go somewhere you normally have absolutely no reason to enter. You are not shopping for something practical \u2014 your mission is to find one thing that makes you think, \u201cWait\u2026 I kind of love that.\u201d You can leave with a photo, a note, a tiny inexpensive item, or simply the memory.",
      examples: ["Antique store", "International grocery store", "Music store", "Art supply store", "Garden center", "A bookstore section you never visit", "Fabric shop", "Specialty food shop", "Hobby store"],
    },
    makeItYours: { prompt: "Choose your mission:", choices: ["Weirdest store", "Prettiest store", "Most unfamiliar store"] },
    capacity: {
      green: "Go somewhere unfamiliar and spend 20\u201340 minutes exploring, no agenda.",
      yellow: "Stop inside one place already near something you're doing today.",
      red: "Browse one unfamiliar online shop or category for 5 minutes and save one thing that unexpectedly catches you.",
      recovery: "Look around your own home and find one object, style, or detail you forgot you genuinely like.",
    },
    addOn: "Take one photo titled \u201cApparently I\u2019m into this.\u201d",
    nurseTip: null,
    reaction: null,
  },
  {
    id: 2, week: 1, title: "Borrow a Personality",
    why: "Not becoming your best self \u2014 just seeing what happens when you try someone else on for a few hours.",
    dimensions: ["Self-Expression", "Identity"],
    anchor: {
      text: "Choose a version of yourself you've always been slightly intrigued by and test-drive her for part of the day. This isn't \u201cbecome your best self.\u201d It's simpler: borrow her, see what happens.",
      examples: ["Red lipstick at Target", "Dressed nicer than necessary", "The woman who orders the strange menu item", "The woman who wears bold earrings", "The woman who sits alone with a book", "The woman who plays loud music while cooking", "Sporty version", "Ultra-feminine version", "Artistic version", "Minimalist version"],
    },
    makeItYours: { prompt: "Which version are you curious about?", choices: ["A bolder version", "A softer version", "A more put-together version", "A more relaxed version"] },
    capacity: {
      green: "Fully test-drive the version for several hours.",
      yellow: "Choose one visible behavior or style detail and wear it through your day.",
      red: "Change one tiny thing: fragrance, earrings, lipstick, hairstyle, or playlist.",
      recovery: "Save 3 images representing versions of yourself you're curious about, for later.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "How did borrowing her feel?",
      options: [
        { key: "absolutely", label: "Absolutely me", weight: 1 },
        { key: "fun", label: "Fun to borrow", weight: 0.5 },
        { key: "cute_no", label: "Cute but no", weight: -0.5 },
        { key: "never", label: "Never again", weight: -1 },
      ],
    },
  },
  {
    id: 3, week: 1, title: "The Childhood Taste Test",
    why: "Not to recreate childhood \u2014 to find out which parts of her are still actually true.",
    dimensions: ["Identity", "Novelty"],
    anchor: {
      text: "Choose three things you genuinely loved when you were younger \u2014 one food, one song, show, or movie, and one activity or object. Revisit all three, then decide honestly: which one still belongs to me?",
      examples: [],
    },
    makeItYours: { prompt: "Choose your three:", choices: ["A food I loved", "A song, show, or movie", "An activity or object"] },
    capacity: {
      green: "Revisit all three \u2014 the food, the song or show, and the activity.",
      yellow: "Revisit two of the three.",
      red: "Revisit one, in the smallest version \u2014 one bite, one song, five minutes.",
      recovery: "Just remember all three in detail, without needing to revisit any of them today.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "For each one \u2014 still you, or not?",
      options: [
        { key: "still", label: "Still me", weight: 1 },
        { key: "memory", label: "Nice memory", weight: 0.5 },
        { key: "outgrown", label: "Outgrown", weight: -0.5 },
        { key: "surprised", label: "Surprised me", weight: 1, surprise: true },
      ],
    },
  },
  {
    id: 4, week: 1, title: "Tiny Obsession",
    why: "Curiosity doesn't need to justify itself by becoming useful.",
    dimensions: ["Novelty", "Pleasure"],
    anchor: {
      text: "For the next day or two, allow yourself to become mildly obsessed with one harmless, specific thing. It does not need to become useful. It does not need to become a hobby. Curiosity is enough.",
      examples: ["Find the best cookie nearby", "Learn perfume notes", "Identify birds in your yard", "Perfect one mocktail", "Learn about a weird historical event", "Find your favorite apple variety", "Learn 3 phrases in another language", "Test different hair clips or styles", "Learn to make one excellent sauce", "Rank every seasonal drink you try"],
    },
    makeItYours: null,
    capacity: {
      green: "Chase it properly \u2014 taste-test, research, or try a few versions over the two days.",
      yellow: "Spend one real session on it today, 20\u201330 minutes.",
      red: "Look up one fact or try one version, five minutes total.",
      recovery: "Just pick what your tiny obsession would be, and let yourself want it.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "How did the obsession feel?",
      options: [
        { key: "more", label: "I want more of this", weight: 1 },
        { key: "fun_minute", label: "Fun for a minute", weight: 0.5 },
        { key: "not_thing", label: "Not my thing", weight: -0.5 },
        { key: "surprised", label: "Surprised me", weight: 1, surprise: true },
      ],
    },
  },
  {
    id: 5, week: 1, title: "Secret Tuesday",
    why: "One thing today that isn't optimized, negotiated, posted, or done for someone else.",
    dimensions: ["Autonomy"],
    anchor: {
      text: "Do one completely unnecessary thing today, and tell nobody beforehand. The point isn't secrecy \u2014 it's doing one thing that wasn't optimized, negotiated, posted, practical, or done for someone else.",
      examples: ["Drive somewhere for dessert", "Watch a movie at noon", "Stop at an unusual shop", "Buy a ridiculous magazine", "Eat dinner somewhere unexpected", "Sit somewhere beautiful", "Try a temporary hair color", "Get a fancy drink for no reason"],
    },
    makeItYours: null,
    capacity: {
      green: "Go do the unnecessary thing, fully, wherever it takes you.",
      yellow: "Do a smaller version that fits inside today's plans already.",
      red: "Order or get the small unnecessary thing without leaving your usual path.",
      recovery: "Decide what your Secret Tuesday would be, and save it for when you have more in the tank.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 6, week: 1, title: "Dress for Somewhere You're Not Going",
    why: "The clothes are never really about the clothes.",
    dimensions: ["Self-Expression", "Anticipation"],
    anchor: {
      text: "Choose somewhere you wish you were going tonight. Dress like you're going there. Then continue your normal evening.",
      examples: ["Paris caf\u00e9", "Beach town", "Concert", "Expensive hotel bar", "Little Italian restaurant", "Art opening", "Rooftop dinner"],
    },
    makeItYours: { prompt: "Optional: match the imaginary destination further with", choices: ["Food", "Drink", "Music"] },
    capacity: {
      green: "Fully dress the part \u2014 outfit, and match food, drink, or music to the destination.",
      yellow: "Change one real piece of the outfit and keep it on through the evening.",
      red: "Put on one thing \u2014 earrings, a scent, lipstick \u2014 that belongs to that imaginary place.",
      recovery: "Picture the outfit in detail and decide what you'd wear, for whenever you're ready.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Which part felt surprisingly natural?",
      options: [
        { key: "outfit", label: "The outfit", weight: 1 },
        { key: "mood", label: "The mood it created", weight: 1 },
        { key: "awkward", label: "It felt a little silly", weight: -0.5 },
        { key: "surprised", label: "Surprised me", weight: 1, surprise: true },
      ],
    },
  },
  {
    id: 7, week: 1, title: "The $0 Souvenir",
    why: "Turning an ordinary outing into something your brain actually remembers.",
    dimensions: ["Environment", "Pleasure"],
    anchor: {
      text: "Go somewhere ordinary. Come home with one souvenir that costs nothing.",
      examples: ["A photo", "A pressed leaf", "A phrase you overheard", "A little sketch", "A receipt", "A playlist named after the outing", "A saved map pin", "A tiny written observation"],
    },
    makeItYours: null,
    capacity: {
      green: "Go somewhere ordinary specifically for this, and really look for the souvenir.",
      yellow: "Notice and collect one during an outing you already have planned.",
      red: "Find your $0 souvenir from wherever you already are today.",
      recovery: "Write down one ordinary memory from recently that you'd want to keep.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },

  // ══════════════ WEEK 2 — FIND WHAT FEELS GOOD ══════════════
  {
    id: 8, week: 2, title: "The Three-Dollar Upgrade",
    why: "A small, honest experiment in what pleasure is actually made of.",
    dimensions: ["Pleasure"],
    anchor: {
      text: "Pick one extremely ordinary part of your day. Give yourself a tiny budget \u2014 roughly $3\u2013$10 \u2014 to make that single moment noticeably better. You may upgrade one moment. Not buy a bunch of stuff.",
      examples: ["A new drink with lunch", "Bakery bread instead of normal toast", "Fresh herb for dinner", "A fancy pen for work", "Absurdly good soap", "A tiny bunch of flowers for the bathroom", "New nail color", "A weird snack"],
    },
    makeItYours: null,
    capacity: {
      green: "Plan the moment in advance and fully build the small upgrade around it.",
      yellow: "Grab the upgrade on your way through an errand you already have.",
      red: "Add the smallest version \u2014 one item, one substitution \u2014 to something already happening today.",
      recovery: "Decide what your $3 upgrade would be, and put it on the list for next time you're out.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Did the object matter, or did the ritual matter?",
      options: [
        { key: "object", label: "The object", weight: 0.5 },
        { key: "ritual", label: "The ritual", weight: 1 },
        { key: "both", label: "Honestly, both", weight: 1 },
        { key: "neither", label: "Neither, really", weight: -0.5 },
      ],
    },
  },
  {
    id: 9, week: 2, title: "The Menu Roulette Rule",
    why: "Low-stakes novelty, on command.",
    dimensions: ["Novelty"],
    anchor: {
      text: "Go somewhere that gives you choices \u2014 caf\u00e9, restaurant, grocery store, bakery, drink shop. Choose something using a rule you'd never normally use. (Avoid anything with allergy or safety issues.)",
      examples: ["The thing you can't pronounce", "Employee favorite", "Prettiest packaging", "Third item down", "Something from another country", "The flavor you usually skip"],
    },
    makeItYours: { prompt: "Pick your rule:", choices: ["Can't pronounce it", "Prettiest packaging", "Employee favorite", "Third item down"] },
    capacity: {
      green: "Go somewhere specifically to play menu roulette, and commit to the rule fully.",
      yellow: "Apply the rule during an outing you already have planned.",
      red: "Apply the rule to something small \u2014 a snack, a drink \u2014 wherever you already are.",
      recovery: "Pick your rule for next time, so it's ready when you have the energy.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 10, week: 2, title: "Make the Errand Weird",
    why: "The errand isn't the experience. Breaking autopilot is.",
    dimensions: ["Novelty", "Autonomy"],
    anchor: {
      text: "Take an errand you already have to do. Add one completely unnecessary detour.",
      examples: ["Stop at a park you always pass", "Go inside the tiny shop beside the grocery store", "Get a drink from somewhere new", "Walk one weird aisle", "Take the scenic route", "Photograph the ugliest lawn ornament you can find"],
    },
    makeItYours: null,
    capacity: {
      green: "Add a real detour \u2014 10\u201315 extra minutes, somewhere you wouldn't normally go.",
      yellow: "Add a small detour \u2014 one extra stop, one different route.",
      red: "Notice one thing on the errand you'd normally walk right past.",
      recovery: "Plan the detour you'll add next time you're out.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 11, week: 2, title: "The Bad Mood Upgrade Lab",
    why: "Testing whether the task is the problem, or the experience around it is.",
    dimensions: ["Environment", "Pleasure"],
    anchor: {
      text: "Choose one recurring thing you hate. Experiment with changing the sensory or environmental part of it, rather than forcing yourself to be more disciplined. Test one thing.",
      examples: ["Folding laundry", "The commute", "Dishes", "Getting ready", "Bedtime cleanup", "Grocery shopping"],
    },
    makeItYours: { prompt: "What will you change?", choices: ["Soundtrack", "Lighting", "Scent", "A drink or snack", "Doing it with someone", "A ridiculous timer or game"] },
    capacity: {
      green: "Change two elements at once and do the whole task with the upgrade in place.",
      yellow: "Change one element for the full task.",
      red: "Change one element for just part of the task.",
      recovery: "Decide what you'll try next time this task comes around.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Did changing the experience change how much you hated the task?",
      options: [
        { key: "yes", label: "Yes, noticeably", weight: 1 },
        { key: "little", label: "A little", weight: 0.5 },
        { key: "no", label: "Not really", weight: -0.5 },
        { key: "enjoyed", label: "I actually enjoyed it", weight: 1, surprise: true },
      ],
    },
  },
  {
    id: 12, week: 2, title: "Ask the Algorithm Nothing",
    why: "Not a detox \u2014 an identity experiment. What do you notice on your own?",
    dimensions: ["Autonomy", "Identity"],
    anchor: {
      text: "For a set stretch of today, don't ask TikTok, Pinterest, Instagram, or Google what you should like. Choose something purely because you noticed it \u2014 clothing, food, a hairstyle, a home item, a place, an activity, music.",
      examples: [],
    },
    makeItYours: { prompt: "Choose your category:", choices: ["Something to wear", "Something to eat or drink", "Something for home", "Something to do or listen to"] },
    capacity: {
      green: "Go a full day without input, and choose one real thing purely on your own instinct.",
      yellow: "Go a few hours without input, then choose one thing.",
      red: "Pause before your next scroll and name one thing you already like, unprompted.",
      recovery: "Just notice, today, how often you check before you decide.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Would you have chosen this without seeing someone else choose it first?",
      options: [
        { key: "fully", label: "Yes, fully mine", weight: 1 },
        { key: "mostly", label: "Mostly mine", weight: 0.5 },
        { key: "influenced", label: "Honestly, influenced", weight: -0.5 },
        { key: "unsure", label: "Not sure", weight: 0 },
      ],
    },
  },
  {
    id: 13, week: 2, title: "Make Something Pointlessly Beautiful",
    why: "Not the object \u2014 finding out whether making things beautiful gives her energy.",
    dimensions: ["Pleasure", "Self-Expression"],
    anchor: {
      text: "Create something with no productive purpose.",
      examples: ["Plate your snack ridiculously well", "Arrange a shelf", "Make a tiny bouquet", "Decorate cookies", "Write someone's name beautifully", "Create a silly phone wallpaper", "Make a pretty drink", "Style an outfit you're not wearing anywhere"],
    },
    makeItYours: null,
    capacity: {
      green: "Take real time with it \u2014 20\u201330 minutes of unrushed, pointless beauty.",
      yellow: "Spend 10 minutes making one small thing beautiful.",
      red: "Make one tiny thing a little prettier than it needed to be.",
      recovery: "Look at something beautiful someone else made, and notice what draws you to it.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Did making something absorb you, or irritate you?",
      options: [
        { key: "absorbed", label: "Totally absorbed me", weight: 1 },
        { key: "nice_bit", label: "Nice for a bit", weight: 0.5 },
        { key: "meh", label: "Meh", weight: -0.5 },
        { key: "irritated", label: "Irritated me", weight: -1 },
      ],
    },
  },
  {
    id: 14, week: 2, title: "Plan the Day You'd Actually Want",
    why: "Not a 5 a.m. productive-girl day. A realistic one you'd genuinely look forward to.",
    dimensions: ["Anticipation", "Autonomy"],
    anchor: {
      text: "Build a realistic day you would genuinely look forward to \u2014 not an ideal, aspirational one. This becomes data for later in the program.",
      examples: [],
    },
    makeItYours: { prompt: "Choose across each:", choices: ["Food you'd want", "Out or home", "People or solo", "Getting ready or cozy", "Novelty or familiar", "One thing to anticipate"] },
    capacity: {
      green: "Actually plan and schedule a real version of this day soon.",
      yellow: "Write the day out in full, even if you can't do it yet.",
      red: "Choose your answers across the categories, without writing the full plan.",
      recovery: "Just picture the day. No plan needed yet.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },

  // ══════════════ WEEK 3 — REMEMBER WHO YOU ARE ══════════════
  {
    id: 15, week: 3, title: "The 17-Year-Old You Test",
    why: "What did she assume you'd definitely do, have, wear, know, or be by now?",
    dimensions: ["Identity"],
    anchor: {
      text: "Ask: what did teenage-you assume adult-you would definitely do, have, wear, know, or be? Choose one. Try the smallest real version of it today.",
      examples: ["Wear the thing", "Go somewhere", "Learn something", "Listen to the music", "Make something", "Order something", "Start something"],
    },
    makeItYours: null,
    capacity: {
      green: "Do a full, real version of the thing today.",
      yellow: "Do a meaningful piece of it \u2014 enough to actually feel it.",
      red: "Do the smallest true version \u2014 five minutes, one item, one action.",
      recovery: "Just name what it was, and sit with why it stuck with you.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Where does it land?",
      options: [
        { key: "still", label: "Still me", weight: 1 },
        { key: "memory", label: "Cute memory", weight: 0.5 },
        { key: "outgrew", label: "I outgrew her", weight: -0.5 },
        { key: "why_stop", label: "Wait\u2026 why did I stop?", weight: 1, surprise: true },
      ],
    },
  },
  {
    id: 16, week: 3, title: "Nobody Else Gets a Vote",
    why: "Autonomy, not selfishness \u2014 one harmless thing decided by you alone.",
    dimensions: ["Autonomy"],
    anchor: {
      text: "Choose one harmless thing today with nobody else in mind. Not \u201cwhat would he like,\u201d not \u201cwhat's easiest for the kids,\u201d not \u201cwhat looks normal.\u201d Just what you want.",
      examples: ["Meal", "Outfit", "Music", "A room detail", "Your route", "An activity", "A drink", "A movie", "A purchase within reasonable budget"],
    },
    makeItYours: null,
    capacity: {
      green: "Choose freely across the whole day \u2014 meal, activity, and one more thing.",
      yellow: "Choose one full thing with nobody else's preference factored in.",
      red: "Choose one small thing \u2014 a drink, a route, a song \u2014 purely for you.",
      recovery: "Just notice today how many small decisions you make with someone else in mind.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 17, week: 3, title: "The Alter Ego Hour",
    why: "Playful permission, on a timer.",
    dimensions: ["Self-Expression", "Identity"],
    anchor: {
      text: "Create a tiny alter ego for one hour. Give her a name or vibe, one visual cue, one behavior, and one rule. \u201cVivienne orders dessert.\u201d Or: \u201cSunday [you] wears earrings and turns the lights down while cooking.\u201d",
      examples: [],
    },
    makeItYours: { prompt: "Give her:", choices: ["A name or vibe", "One visual cue", "One behavior", "One rule"] },
    capacity: {
      green: "Run the full hour, fully in character, with all four pieces in place.",
      yellow: "Run a shorter window \u2014 20\u201330 minutes \u2014 with two of the pieces.",
      red: "Just do the one behavior or visual cue, no full hour required.",
      recovery: "Design her on paper \u2014 name, vibe, rule \u2014 and save her for later.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "What part of her should you steal permanently?",
      options: [
        { key: "behavior", label: "The behavior", weight: 1 },
        { key: "visual", label: "The visual cue", weight: 1 },
        { key: "rule", label: "The rule", weight: 1 },
        { key: "none", label: "None of it, honestly", weight: -0.5 },
      ],
    },
  },
  {
    id: 18, week: 3, title: "Hands Busy, Brain Off",
    why: "A useful signal, disguised as a craft project: does making things absorb you?",
    dimensions: ["Pleasure", "Environment"],
    anchor: {
      text: "Make something physical with your hands. Not for productivity \u2014 just to see what it does to your brain.",
      examples: ["Clay", "Collage", "Baking", "Flower arranging", "A bracelet", "Painting", "A puzzle", "Lego", "Gardening", "Decorating", "A recipe from scratch"],
    },
    makeItYours: { prompt: "Choose your category:", choices: ["Made with food", "Made with your hands \u2014 craft", "Made in the garden or outdoors"] },
    capacity: {
      green: "Set aside real time \u2014 an hour or more \u2014 for a full project.",
      yellow: "Spend 20\u201330 minutes on a small version.",
      red: "Ten minutes, smallest possible version.",
      recovery: "Watch or look at someone else's version and notice if you feel drawn in.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "Did making something absorb you, or irritate you?",
      options: [
        { key: "absorbed", label: "Totally absorbed me", weight: 1 },
        { key: "nice_bit", label: "Nice for a bit", weight: 0.5 },
        { key: "meh", label: "Meh", weight: -0.5 },
        { key: "irritated", label: "Irritated me", weight: -1 },
      ],
    },
  },
  {
    id: 19, week: 3, title: "The Tiny Field Trip",
    why: "This is True Reverie turning a random afternoon into an actual memory.",
    dimensions: ["Novelty", "Environment", "Anticipation"],
    anchor: {
      text: "Choose somewhere close enough that you normally wouldn't call it a \u201ctrip.\u201d Leave your normal radius. The destination should be mildly interesting. Give the outing a purpose or title, and bring back one tiny memory.",
      examples: ["Tiny museum", "Greenhouse", "Historic street", "Specialty bakery", "Weird roadside thing", "Local bookstore", "Lake lookout", "Plant nursery", "A neighborhood you never visit", "Farm stand"],
    },
    makeItYours: { prompt: "Give the outing a title:", choices: [] },
    capacity: {
      green: "Take the full trip \u2014 leave your radius, spend real time there.",
      yellow: "Choose something slightly outside your radius but on the way to something else.",
      red: "Look up one place worth the trip and save it, plus notice one \u201cclose but unexplored\u201d spot nearby.",
      recovery: "Picture the tiny field trip you'd take, and keep it ready for when you have more capacity.",
    },
    addOn: "Bring back one tiny memory \u2014 a photo, an object, or a written note.",
    nurseTip: null,
    reaction: null,
  },
  {
    id: 20, week: 3, title: "Do Something Younger You Would Think Is Cool",
    why: "Not responsible. Not what your peers expect. What would actually impress her?",
    dimensions: ["Identity", "Novelty"],
    anchor: {
      text: "Ask: what would a younger version of you think was genuinely cool about your life? Deliberately do one thing that earns younger-you's approval. It can be tiny.",
      examples: ["Drive your own car somewhere spontaneous", "Wear something bold", "Make an adult money purchase", "Take the kids somewhere magical", "Go to a concert", "Cook something impressive", "Stay up for a movie", "Create something"],
    },
    makeItYours: null,
    capacity: {
      green: "Do the real, full version \u2014 whatever it actually takes.",
      yellow: "Do a scaled version that still genuinely counts.",
      red: "Do the smallest true version, five to ten minutes.",
      recovery: "Just decide what would earn her approval, and hold onto it.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 21, week: 3, title: "The Person Test",
    why: "Recognizing which relationships make her feel most like herself \u2014 no relationship therapy required.",
    dimensions: ["Connection"],
    anchor: {
      text: "Think of three people you interact with. After spending time with each, notice which feeling most often shows up: energized, comforted, neutral, or drained. Then choose one person who feels especially good to be around, and create a tiny point of connection with them.",
      examples: ["A voice memo", "Coffee", "A call", "A meme", "An invitation", "Sitting together", "A tiny plan"],
    },
    makeItYours: { prompt: "Your tiny point of connection:", choices: ["A message or voice memo", "An invitation", "Just sitting with them"] },
    capacity: {
      green: "Reach out and make a real, specific plan with them.",
      yellow: "Send the message, call, or invitation today.",
      red: "Send one small, low-effort message \u2014 a meme, a thought, a check-in.",
      recovery: "Just notice, today, who came to mind first.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "How did being with them feel?",
      options: [
        { key: "energized", label: "Energized", weight: 1 },
        { key: "comforted", label: "Comforted", weight: 1 },
        { key: "neutral", label: "Neutral", weight: 0 },
        { key: "drained", label: "Drained", weight: -1 },
      ],
    },
  },

  // ══════════════ WEEK 4 — BUILD MORE OF HER ══════════════
  {
    id: 22, week: 4, title: "More of This",
    why: "She chooses what deserves to stay \u2014 nothing gets prescribed blindly.",
    dimensions: ["Identity", "Anticipation"],
    anchor: {
      text: "Look back at what's genuinely lit you up so far. Choose one you want more of in your actual life, and turn it into something small and repeatable \u2014 not a habit forced on you, one you actually chose.",
      examples: ["A tiny field trip once a month", "A \u201cdress for nowhere\u201d evening now and then", "A \u201ctry one weird thing\u201d ritual"],
    },
    makeItYours: { prompt: "Which do you want more of?", choices: [] },
    capacity: {
      green: "Design the full repeatable version and put it somewhere you'll actually see it.",
      yellow: "Decide the rhythm \u2014 how often \u2014 even if the details aren't set yet.",
      red: "Just name the one thing you want more of.",
      recovery: "Sit with what came to mind first, no decision needed yet.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 23, week: 4, title: "Claim One Thing as Yours",
    why: "This is mine because I like it \u2014 no other justification required.",
    dimensions: ["Autonomy", "Identity"],
    anchor: {
      text: "Choose one thing that belongs to her \u2014 not the household. Then protect it in the smallest realistic way.",
      examples: ["One hour", "One playlist", "One corner", "One ritual", "One drink", "One recurring outing", "One hobby", "One object", "One night", "One tradition"],
    },
    makeItYours: null,
    capacity: {
      green: "Claim it and put a real, protected boundary around it starting this week.",
      yellow: "Claim it and tell one person it's yours.",
      red: "Just name the one thing that's yours.",
      recovery: "Notice what you almost said, and let that be enough for today.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 24, week: 4, title: "Make One Place Recognizably Yours",
    why: "Identity, expressed through environment \u2014 not a cleaning task.",
    dimensions: ["Environment", "Self-Expression"],
    anchor: {
      text: "Choose one tiny space and make it visibly feel like her. This isn't organizing homework \u2014 it's identity you can see.",
      examples: ["Nightstand", "Bathroom counter", "Desk", "Car", "Kitchen corner", "Side table", "Closet section", "Porch chair"],
    },
    makeItYours: null,
    capacity: {
      green: "Fully redo the space \u2014 clear it, then add what actually feels like you.",
      yellow: "Add one or two things that make it feel like yours, without a full reset.",
      red: "Add one small object or detail that's unmistakably you.",
      recovery: "Decide which space you'd choose, and what you'd want it to say about you.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 25, week: 4, title: "Build My Good Day",
    why: "Using everything the program has learned so far to sketch her actual kind of good day.",
    dimensions: ["Pleasure", "Anticipation", "Environment"],
    anchor: {
      text: "Build a personalized good-day out of what you've shown this program you actually like.",
      examples: [],
    },
    makeItYours: { prompt: "Choose across each:", choices: ["Wake-up vibe", "Food", "Getting ready", "Environment", "Movement", "People", "Novelty", "Rest", "One thing to anticipate"] },
    capacity: {
      green: "Fill out the full good day and actually schedule a version of it soon.",
      yellow: "Fill out the full good day as a reference for later.",
      red: "Pick your top 3 categories and answer those.",
      recovery: "Just picture it. No building required today.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 26, week: 4, title: "Pick Your Next Tiny Obsession",
    why: "A future identity thread \u2014 not productivity, not self-improvement. Just curiosity with a direction.",
    dimensions: ["Novelty", "Identity"],
    anchor: {
      text: "Based on what you've been curious about so far, choose something you want to get slightly better at or know more about. This should not become productivity or self-improvement \u2014 it's allowed to just be interesting.",
      examples: ["Coffee", "Flowers", "Makeup", "Baking", "Photography", "Plants", "Strength", "Styling", "Local exploring", "Cooking", "Perfume", "Interior styling", "A language", "Art"],
    },
    makeItYours: { prompt: "Choose your direction:", choices: [] },
    capacity: {
      green: "Take a real first step \u2014 a class, a purchase, a real session of learning.",
      yellow: "Look into it properly \u2014 research, plan, or a first small attempt.",
      red: "Just name it, and save one resource or idea to start from.",
      recovery: "Let yourself want it. That's the whole step today.",
    },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
  {
    id: 27, week: 4, title: "Stop Waiting on One Thing",
    why: "Not the full leap. Just evidence: I started.",
    dimensions: ["Autonomy", "Identity"],
    anchor: {
      text: "Ask: what's one harmless thing you keep saying \u201csomeday\u201d about? Create the smallest real action today \u2014 not the full leap.",
      examples: ["Wear it", "Cut it", "Book it", "Learn it", "Ask", "Go", "Make it", "Start it", "Change it", "Try it"],
    },
    makeItYours: null,
    capacity: {
      green: "Take the real step \u2014 book it, start it, do it.",
      yellow: "Take a meaningful step toward it \u2014 research it, price it out, take the first real action.",
      red: "Take the smallest possible action \u2014 one search, one message, one minute.",
      recovery: "Just name the thing you've been putting off. Naming it counts.",
    },
    addOn: null,
    nurseTip: null,
    reaction: {
      question: "How did starting feel?",
      options: [
        { key: "relief", label: "Relief \u2014 finally", weight: 1 },
        { key: "good", label: "Good, small win", weight: 1 },
        { key: "scary", label: "Honestly scary", weight: 0 },
        { key: "surprised", label: "Surprised me", weight: 1, surprise: true },
      ],
    },
  },
  {
    id: 28, week: 4, title: "Your Reverie",
    why: "The culmination of the whole Rebuild \u2014 not another task, a reveal.",
    dimensions: [],
    anchor: {
      text: "You were never supposed to become exactly who you used to be. We were looking for what still feels like you \u2014 and what wants to come next.",
      examples: [],
    },
    makeItYours: null,
    capacity: { green: "", yellow: "", red: "", recovery: "" },
    addOn: null,
    nurseTip: null,
    reaction: null,
  },
]

const WEEKLY_REVEALS = [
  { afterExp: 7, title: "Your First Sparks", lowDataLine: "A few things are starting to stand out.", closing: "Keep going. We're still finding her." },
  { afterExp: 14, title: "Your Pleasure Profile", lowDataLine: "Here's what seems to be lighting you up lately.", closing: null },
  { afterExp: 21, title: "The Version of You That's Showing Up", lowDataLine: "You aren't trying to become your old self again. Something newer is showing up.", closing: null },
]

const EXP_BY_ID = (id) => EXPERIENCES.find((e) => e.id === id) || null

export { DIMENSIONS, DIM_PHRASE, DEFAULT_REACTION, EXPERIENCES, WEEKLY_REVEALS, EXP_BY_ID }
