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

// True Reverie recipe meals exposed as loggable "foods" (nutrition already stored with each meal).
const mealAsFood = (m) => ({ id: "nr:" + m.n, name: m.n, newRay: true, per100: null, fixed: { cal: m.cal, p: m.p, c: m.c, f: m.f }, units: [{ u: "serving", g: 0 }] })

export { NOURISH_CAP, FOOD_PATHS, GROCERY_CATS, MACROS, SUPPLEMENTS, NOURISH_PROGRAM_MSG, NOURISH_TIMING, NOURISH_RECOVERY, NOURISH_PROGRAM_FOCUS, NUTRITION_PLANS, PLAN_BY_ID, MACRO_PLAIN, MEALS, MEAL_TYPES, MEAL_FILTERS, GROCERY_CATS2, QUICK_HELP, EATING_OUT, LEARN_TOPICS, ACTIVITY_LEVELS, CAL_FLOOR, RATE_OPTIONS, calcTargets, proteinSplit, MASS_UNITS, foodUnitList, gramsFor, r1, nutrientsFor, sumEntries, STARTER_FOODS, searchFoods, mealAsFood }
