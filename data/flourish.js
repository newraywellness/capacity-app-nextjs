// ============ FLOURISH ============
// One object per project. Every section — carousels, time feeds, seasonal
// collections, related ideas — is a SELECTOR over this single array. Nothing is
// ever listed twice, and no section is edited when content is added.
//
// Adding a project is exactly three things:
//   1. add one object below
//   2. drop /flourish/<id>.jpg into public/
//   3. assign its tags
// It then appears everywhere it belongs, automatically.
//
// DRAFT CONTENT: the objects below are provisional — enough to exercise every
// selector, feed, template and save path. Copy and images are meant to be
// replaced. Structure is not.

import { seasonPalette } from '../lib/atmosphere'
import { HOLIDAYS } from '../lib/bloomair'

// Centralised so the whole library can move to Supabase Storage in one line.
const F_IMG = (id) => "/flourish/" + id + ".jpg"

// ── VOCABULARY ──────────────────────────────────────────────────────────────
const F_TIMES = [
  { key: "10 Minutes", ic: "⏱️", label: "10 Minutes", sub: "Small and lovely" },
  { key: "30 Minutes", ic: "🕒", label: "30 Minutes", sub: "Worth the half hour" },
  { key: "An Afternoon", ic: "☀️", label: "An Afternoon", sub: "Give it the whole afternoon" },
  { key: "A Weekend", ic: "🌙", label: "A Weekend", sub: "Something to look forward to" },
]

// ── PROJECTS ────────────────────────────────────────────────────────────────
const FLOURISH = [
  { id: "lemon-loaf", emoji: "🍋", title: "Lemon Loaf", sub: "Rainy afternoon favourite.",
    time: "30 Minutes", minutes: 35, season: ["Spring", "Summer"], tags: ["Highlight", "Flourish Favorite"],
    category: ["Baking"], mood: ["Cozy", "Rainy Day", "Solo"],
    intro: "The loaf that makes a whole house smell like a good day. Forgiving enough that you can talk to someone while you make it.",
    materials: ["225g plain flour", "200g caster sugar", "3 eggs", "175g butter, softened", "2 lemons — zest and juice", "1 tsp baking powder", "Pinch of salt", "100g icing sugar for the glaze"],
    steps: ["Heat the oven to 170°C and line a loaf tin.",
      "Beat butter and sugar until pale — a full three minutes, longer than feels necessary.",
      "Add eggs one at a time, then the zest of both lemons.",
      "Fold in flour, baking powder and salt until just combined. Stop early rather than late.",
      "Bake 45–50 minutes until a skewer comes out clean.",
      "While warm, spoon over the juice of one lemon. Let it soak in.",
      "Glaze with icing sugar and the second lemon's juice once fully cool."],
    tips: ["Zest before you juice. Everyone learns this the hard way once.",
      "It's better on day two, if it lasts that long.",
      "Freezes beautifully in slices."],
    note: "Baking is one of the few activities that occupies your hands and your attention at the same time — which is exactly why it settles a restless afternoon.",
    shop: [], creator: null },

  { id: "grocery-store-flowers", emoji: "💐", title: "Grocery Store Flowers", sub: "Five pounds can change a room.",
    time: "10 Minutes", minutes: 10, season: [], tags: ["Highlight"],
    category: ["Flowers", "Home"], mood: ["Slow Morning", "Solo", "Restful"],
    intro: "The cheapest supermarket bunch looks expensive once it's been split up. Most of the work is deciding not to put it all in one vase.",
    materials: ["One supermarket bunch", "Two or three small vessels — jars, glasses, a jug", "Scissors"],
    steps: ["Cut every stem at an angle, under running water if you can.",
      "Strip any leaves that would sit below the waterline.",
      "Split the bunch across two or three small vessels rather than one big one.",
      "Put one somewhere unexpected — a bathroom, a bedside, the kitchen windowsill.",
      "Change the water every two days and they'll last twice as long."],
    tips: ["Odd numbers of stems look more natural than even.",
      "Smaller vessels make cheap flowers look considered.",
      "Buy the bunch in bud, not in full bloom."],
    note: "There's decent evidence that flowers in the home lift mood measurably. It's one of the smallest interventions with a real effect.",
    shop: [], creator: null },

  { id: "coffee-shop-at-home", emoji: "☕", title: "Coffee Shop At Home", sub: "Slow mornings taste better.",
    time: "10 Minutes", minutes: 10, season: [], tags: ["Flourish Favorite"],
    category: ["Coffee"], mood: ["Slow Morning", "Cozy", "Solo"],
    intro: "Not about equipment. About making the drink properly and then actually sitting down with it.",
    materials: ["Your usual coffee", "A cup you like", "Ten minutes"],
    steps: ["Make it the slow way, whatever that means in your kitchen.",
      "Warm the cup with hot water first — it genuinely changes the drink.",
      "Sit somewhere that isn't your desk.",
      "No phone. This is the whole point.",
      "Finish it while it's still hot."],
    tips: ["Grind fresh if you can. It's the single biggest difference.",
      "A nicer cup makes a bigger difference than a nicer machine.",
      "Ten minutes is enough. This isn't a project."],
    note: "Caffeine has a three to seven hour half-life, so a slow morning coffee is kinder to your sleep than an afternoon one.",
    shop: [], creator: null },

  { id: "garden-picnic", emoji: "🌷", title: "Garden Picnic", sub: "No special occasion required.",
    time: "An Afternoon", minutes: 150, season: ["Spring", "Summer"], tags: ["Highlight"],
    category: ["Hosting", "Cooking"], mood: ["Outdoors", "Social", "Family"],
    intro: "A blanket, some good bread and whatever's in the fridge. The garden counts. So does the park at the end of the road.",
    materials: ["A blanket", "Good bread", "Cheese and something sharp — cornichons, pickled onions", "Fruit", "Something cold to drink", "A flask if it's not quite warm enough"],
    steps: ["Pack cold things last and in one bag.",
      "Bring one proper knife. It changes everything.",
      "Take a cushion. Ground is harder than you remember.",
      "Leave your phone in the bag.",
      "Stay longer than you planned to."],
    tips: ["Cut fruit at home, not there.",
      "A tea towel doubles as a napkin and a plate.",
      "Late afternoon light is better than midday."],
    note: "Time outdoors improves mood and sleep even in short doses — and the effect doesn't require exercise, just being out there.",
    shop: [], creator: null },

  { id: "watercolor-florals", emoji: "🎨", title: "Watercolor Florals", sub: "Beginner friendly.",
    time: "An Afternoon", minutes: 120, season: ["Spring"], tags: ["Highlight", "Flourish Favorite"],
    category: ["Painting", "Watercolor", "Crafts"], mood: ["Creative", "Solo", "Restful"],
    intro: "Loose watercolour flowers are forgiving in a way most painting isn't. The mistakes look intentional.",
    materials: ["A basic watercolour set", "Watercolour paper — 300gsm, this matters", "Two brushes: a round no.6 and a fine liner", "Two jars of water", "Kitchen roll"],
    steps: ["Wet the paper lightly where the flower will go.",
      "Drop colour into the wet area and let it spread. Don't chase it.",
      "Add a second, darker drop at the base while it's still damp.",
      "Let it dry completely before adding stems — impatience is the main failure mode.",
      "Stems and leaves in one confident stroke each. Slow strokes look laboured."],
    tips: ["Cheap paper is the reason most beginners give up. Everything else can be cheap.",
      "Less water than you think for detail, more than you think for washes.",
      "Paint five bad ones before judging."],
    note: "Absorbing, repetitive creative work reduces rumination in a way passive rest often doesn't. It's the doing that helps, not the outcome.",
    shop: [], creator: null },

  { id: "cinnamon-rolls", emoji: "🥐", title: "Cinnamon Rolls", sub: "Worth the whole morning.",
    time: "A Weekend", minutes: 210, season: ["Autumn", "Winter", "Christmas"], tags: ["Flourish Favorite"],
    category: ["Baking"], mood: ["Cozy", "Family", "Rainy Day"],
    intro: "A proper weekend project. Mostly waiting, which is the good part.",
    materials: ["500g strong white flour", "7g fast-action yeast", "300ml warm milk", "75g butter, melted", "1 egg", "For the filling: 100g soft butter, 150g brown sugar, 2 tbsp cinnamon", "Cream cheese icing"],
    steps: ["Mix the dough and knead ten minutes. It should feel tacky, not sticky.",
      "Rise until doubled — an hour, maybe more in a cold kitchen.",
      "Roll to a rectangle, spread with filling right to the edges.",
      "Roll tightly, cut with dental floss rather than a knife.",
      "Second rise, 45 minutes, in the tin.",
      "Bake 25 minutes at 180°C.",
      "Ice while warm so it melts into the swirls."],
    tips: ["Dental floss gives clean cuts. A knife squashes them.",
      "Overnight in the fridge for the second rise means Sunday morning rolls.",
      "Underbake slightly rather than over."],
    note: "The waiting is the point. A project with built-in pauses gives a weekend shape without filling it.",
    shop: [], creator: null },

  { id: "cozy-reading-corner", emoji: "📚", title: "Cozy Reading Corner", sub: "One chair, done properly.",
    time: "30 Minutes", minutes: 30, season: ["Autumn", "Winter"], tags: ["Flourish Favorite"],
    category: ["Home", "Reading"], mood: ["Cozy", "Restful", "Solo"],
    intro: "Not a renovation. Moving a chair, adding a lamp, and deciding that corner is for reading.",
    materials: ["A chair you already own", "A lamp — warm bulb, not overhead", "A small table for a cup", "A blanket", "Something to read"],
    steps: ["Choose the corner with the best natural light for daytime.",
      "Angle the chair away from the television. This does most of the work.",
      "Add a lamp at shoulder height rather than overhead.",
      "Somewhere to put a cup down — this is the bit people forget.",
      "Put the book there. Not on the shelf."],
    tips: ["Warm bulbs, 2700K or lower.",
      "If your phone lives in that chair too, the corner won't work.",
      "One good blanket beats three thin ones."],
    note: "Reading before bed lowers heart rate and eases the transition to sleep — more reliably than most sleep products.",
    shop: [], creator: null },

  { id: "charcuterie-night", emoji: "🧀", title: "Charcuterie Night", sub: "Dinner without cooking.",
    time: "30 Minutes", minutes: 30, season: [], tags: ["Flourish Favorite"],
    category: ["Hosting", "Cooking"], mood: ["Social", "Cozy", "Romantic"],
    intro: "The most forgiving way to feed people. Assembly, not cooking, and it always looks better than the effort involved.",
    materials: ["Three cheeses — one soft, one hard, one blue if you like it", "Two cured meats", "Something sweet: figs, grapes, honey", "Something sharp: cornichons, olives", "Bread and crackers", "A board"],
    steps: ["Take the cheese out an hour early. This matters more than anything else.",
      "Put cheeses down first, spaced apart, then fill around them.",
      "Fold the meats rather than laying them flat — it takes seconds and looks far better.",
      "Fill every gap. Empty board looks sparse; full board looks generous.",
      "One small bowl of something wet — honey, chutney — for height."],
    tips: ["Odd numbers of everything.",
      "Cheese at room temperature tastes completely different.",
      "A supermarket board and good bread beats an expensive board and cheap bread."],
    note: "Sharing a board rather than plated food changes how a meal feels — it slows everyone down and keeps people at the table longer.",
    shop: [], creator: null },

  { id: "candlelit-bath", emoji: "🕯️", title: "Candlelit Bath", sub: "The unhurried version.",
    time: "10 Minutes", minutes: 10, season: ["Winter"], tags: [],
    category: ["Self Care"], mood: ["Restful", "Solo", "Cozy"],
    intro: "Ten minutes of setting up turns a bath into something else entirely.",
    materials: ["Epsom salts", "One candle", "A cold drink", "A dry towel within reach"],
    steps: ["Warm, not hot — hot water strips the skin barrier.",
      "Salts in while it's running.",
      "One candle. Overhead light off.",
      "Phone in another room, genuinely.",
      "Twenty minutes maximum, then moisturise on damp skin."],
    tips: ["A cold drink in a warm bath is disproportionately good.",
      "Anything longer than 20 minutes dries skin out.",
      "Moisturise within three minutes of getting out."],
    note: "A warm bath about ninety minutes before bed helps you fall asleep faster — the drop in body temperature afterwards is what does it.",
    shop: [], creator: null },

  { id: "pumpkin-decorating", emoji: "🎃", title: "Pumpkin Decorating", sub: "No carving required.",
    time: "An Afternoon", minutes: 90, season: ["Autumn", "Halloween"], tags: ["Highlight"],
    category: ["Crafts", "Home", "DIY"], mood: ["Family", "Creative", "Holiday"],
    intro: "White paint, dried flowers and no mess. Lasts far longer than a carved one.",
    materials: ["Pumpkins — any size, mixed is better", "White or cream paint", "Dried flowers or eucalyptus", "Twine", "A glue gun"],
    steps: ["Two thin coats of paint rather than one thick. Let it dry properly between.",
      "Group in odd numbers at different heights.",
      "Glue small dried arrangements at the stem.",
      "Twine around the stem to finish.",
      "Keep them out of direct sun and they'll last the whole season."],
    tips: ["Mixed sizes look better than matching.",
      "Cream reads more expensive than bright white.",
      "Uncarved pumpkins last months. Carved ones last days."],
    note: "Seasonal rituals give the year texture. It's a small thing that makes months feel distinct rather than continuous.",
    shop: [], creator: null },

  { id: "orange-garlands", emoji: "🍊", title: "Orange Garlands", sub: "The whole house smells like December.",
    time: "An Afternoon", minutes: 180, season: ["Winter", "Christmas"], tags: ["Highlight"],
    category: ["Crafts", "Home", "DIY"], mood: ["Cozy", "Holiday", "Family"],
    intro: "Mostly oven time. The drying is what fills the house with the smell.",
    materials: ["4–6 oranges", "Twine", "A large needle", "Cinnamon sticks", "Bay leaves or dried eucalyptus"],
    steps: ["Slice oranges about 5mm thick — thinner dries faster but tears.",
      "Pat dry properly with kitchen roll. Wet slices go brown.",
      "Bake at 90°C for 3 hours, turning once.",
      "Cool completely before threading or they'll stick.",
      "Thread with cinnamon sticks and bay between slices."],
    tips: ["The lowest oven setting for longest gives the best colour.",
      "They keep for years in a paper bag.",
      "Blood oranges dry to a beautiful deep red."],
    note: "Scent is the sense most directly wired to memory. A smell you make yourself every December becomes the one your children remember.",
    shop: [], creator: null },

  { id: "antique-shopping", emoji: "🕰️", title: "Antique Shopping", sub: "Buy nothing, look at everything.",
    time: "An Afternoon", minutes: 180, season: [], tags: ["Flourish Favorite"],
    category: ["Travel", "Home"], mood: ["Adventurous", "Solo", "Slow Morning"],
    intro: "One of the few kinds of shopping that's genuinely enjoyable when you buy nothing.",
    materials: ["Comfortable shoes", "Cash — many places still prefer it", "A tape measure in your bag"],
    steps: ["Go early. The good things go first and the dealers are chattier.",
      "Ask about anything you like. Most dealers love talking about their stock.",
      "Measure before you fall in love.",
      "Prices are usually negotiable, politely.",
      "Leave if nothing calls to you. That was still a good afternoon."],
    tips: ["Take a photo of anything you're unsure about and walk away for an hour.",
      "Small glassware and linens are where the value usually is.",
      "Weekday mornings are quietest."],
    note: "Buying something with a history rather than something new is one of the cheapest ways to make a home feel like yours.",
    shop: [], creator: null },

  { id: "homemade-pasta", emoji: "🍝", title: "Homemade Pasta", sub: "Easier than it sounds.",
    time: "A Weekend", minutes: 150, season: [], tags: ["Flourish Favorite"],
    category: ["Cooking"], mood: ["Creative", "Family", "Social"],
    intro: "Flour and eggs. That's the whole ingredient list, and it's genuinely worth doing once.",
    materials: ["300g '00' flour", "3 eggs", "A pinch of salt", "A rolling pin, or a machine if you have one"],
    steps: ["Flour in a mound, well in the middle, eggs in the well.",
      "Bring it together with a fork, then hands. It'll look wrong before it looks right.",
      "Knead ten full minutes. This is the part people cut short.",
      "Rest 30 minutes wrapped, at room temperature.",
      "Roll thin enough to see your hand through it.",
      "Cook two to three minutes. Fresh pasta is fast."],
    tips: ["Rest is not optional — unrested dough springs back and fights you.",
      "Semolina, not flour, to stop cut pasta sticking.",
      "Make it with someone. It's a two-person job and better for it."],
    note: "Cooking something from scratch with your hands is absorbing in a way that following a recipe on a screen isn't.",
    shop: [], creator: null },

  { id: "morning-pages", emoji: "📓", title: "Morning Pages", sub: "Three pages, before anything else.",
    time: "30 Minutes", minutes: 25, season: [], tags: [],
    category: ["Reading", "Self Care"], mood: ["Slow Morning", "Solo", "Creative"],
    intro: "Longhand, first thing, no editing. It's not journalling and it isn't meant to be good.",
    materials: ["A notebook you don't mind ruining", "A pen that writes easily"],
    steps: ["Before your phone. This is the whole discipline.",
      "Three pages, longhand, whatever is in your head.",
      "Do not stop to think. Write 'I don't know what to write' until something comes.",
      "Never reread them. Ever.",
      "Close the book and get on with the day."],
    tips: ["Longhand matters — typing is too fast to bypass the editor.",
      "Three pages is the number. Two isn't enough to get past the surface.",
      "Missing days is fine. Rereading isn't."],
    note: "Expressive writing has genuine evidence behind it for reducing rumination. The mechanism seems to be getting the loop out of your head and onto something external.",
    shop: [], creator: null },

  { id: "farmers-market", emoji: "🧺", title: "Farmers' Market", sub: "Go with no list.",
    time: "30 Minutes", minutes: 45, season: ["Spring", "Summer", "Autumn"], tags: [],
    category: ["Cooking", "Travel"], mood: ["Outdoors", "Slow Morning", "Social"],
    intro: "Better with no plan. Buy what looks good and work out dinner afterwards.",
    materials: ["A tote", "Cash", "An hour with nothing after it"],
    steps: ["Walk the whole market once before buying anything.",
      "Ask one person what's best this week. They'll tell you honestly.",
      "Buy one thing you don't recognise.",
      "Coffee at the end, sitting down.",
      "Decide dinner on the walk home."],
    tips: ["Late in the day for bargains, early for the best of it.",
      "Bring your own bag and small notes.",
      "The ugly vegetables usually taste identical."],
    note: "Eating seasonally isn't nutritionally magic, but it does mean produce picked closer to ripe — which is why it tastes better.",
    shop: [], creator: null },

  { id: "gallery-alone", emoji: "🖼️", title: "A Gallery, Alone", sub: "Nobody rushing you.",
    time: "An Afternoon", minutes: 120, season: [], tags: [],
    category: ["Travel", "Photography"], mood: ["Solo", "Restful", "Adventurous"],
    intro: "Galleries are better alone. You can stand in front of one thing for as long as you want.",
    materials: ["Comfortable shoes", "Headphones if you'd like them"],
    steps: ["Pick one room rather than the whole building.",
      "Find one piece you like and stay with it for five full minutes.",
      "Skip anything that doesn't hold you. Nobody's marking this.",
      "Sit down at least once.",
      "Leave before you're tired. Coming back is allowed."],
    tips: ["Weekday afternoons are nearly empty.",
      "Most galleries are free or have a free day.",
      "One room properly beats six rooms quickly."],
    note: "Looking at art has measurable effects on mood and stress — but only when you slow down enough to actually look.",
    shop: [], creator: null },

  { id: "valentines-breakfast", emoji: "💌", title: "Valentine's Breakfast", sub: "Better than dinner reservations.",
    time: "30 Minutes", minutes: 40, season: ["Valentine's", "Winter"], tags: [],
    category: ["Cooking", "Hosting"], mood: ["Romantic", "Family", "Slow Morning"],
    intro: "Restaurants are impossible on the fourteenth. Breakfast at home is quieter, cheaper and considerably nicer.",
    materials: ["Good bread", "Eggs", "Something pink — grapefruit, raspberries, rhubarb", "Proper coffee", "A flower on the table"],
    steps: ["Lay the table the night before. It takes four minutes and changes the morning.",
      "One flower in a glass is enough.",
      "Cook one thing properly rather than three things quickly.",
      "No phones on the table.",
      "Stay at the table after you've finished eating."],
    tips: ["Heart-shaped anything is optional and slightly better avoided.",
      "Works just as well for a friend, a child, or yourself.",
      "Buy the flowers on the thirteenth."],
    note: "Rituals matter more than grand gestures for how connected people feel. Small and repeated beats big and occasional.",
    shop: [], creator: null },

  { id: "mothers-day-tea", emoji: "🫖", title: "Mother's Day Tea", sub: "The proper version, at home.",
    time: "An Afternoon", minutes: 150, season: ["Mother's Day", "Spring"], tags: [],
    category: ["Baking", "Hosting", "Tea"], mood: ["Family", "Social", "Cozy"],
    intro: "Afternoon tea at home costs a fifth of the price and everyone stays longer.",
    materials: ["Scones — bought is completely fine", "Clotted cream and jam", "Cucumber and smoked salmon for sandwiches", "Good tea, loose if you have it", "Whatever china you own"],
    steps: ["Warm the pot first. It genuinely matters.",
      "Crusts off, cut into fingers. It looks like effort and takes two minutes.",
      "Scones warm, not hot.",
      "Tiered stand if you have one, three plates if you don't.",
      "Sit down with everyone else rather than hosting from the kitchen."],
    tips: ["Loose leaf tastes noticeably better and costs less per cup.",
      "Assemble sandwiches an hour ahead, covered with a damp tea towel.",
      "Cream or jam first is a regional argument and unwinnable."],
    note: "The point isn't the food. It's that everyone sits at a table together for two hours, which almost never otherwise happens.",
    shop: [], creator: null },

  { id: "sunset-walk", emoji: "🌅", title: "Sunset Walk", sub: "Same route, better hour.",
    time: "10 Minutes", minutes: 20, season: [], tags: [],
    category: ["Travel", "Self Care"], mood: ["Outdoors", "Restful", "Solo"],
    intro: "The walk you already take, moved to the hour before sunset.",
    materials: ["Shoes"],
    steps: ["Check what time sunset actually is. It's earlier than you think.",
      "Leave twenty minutes before.",
      "No podcast, no phone call. Just walking.",
      "Turn around at the light rather than at a distance.",
      "Notice one thing you haven't before."],
    tips: ["Evening light does something to a familiar street.",
      "Ten minutes counts.",
      "Cold weather is not a reason not to. Coat, then go."],
    note: "Light exposure in the evening as well as the morning helps anchor your circadian rhythm — useful if you struggle to fall asleep.",
    shop: [], creator: null },

  { id: "cookie-decorating", emoji: "🍪", title: "Cookie Decorating", sub: "Messy on purpose.",
    time: "A Weekend", minutes: 180, season: ["Winter", "Christmas"], tags: ["Highlight"],
    category: ["Baking", "Crafts"], mood: ["Family", "Holiday", "Creative"],
    intro: "The kind of afternoon children remember. Low stakes, high mess, and nobody minds how they turn out.",
    materials: ["Sugar cookie dough — bought is fine", "Royal icing", "Food colouring", "Piping bags or squeeze bottles", "Sprinkles"],
    steps: ["Bake and cool completely. Warm cookies melt icing, every time.",
      "Make icing two consistencies: thick to outline, thinner to flood.",
      "Outline first, let it set fifteen minutes, then flood.",
      "Sprinkles go on wet icing.",
      "Dry overnight before stacking."],
    tips: ["Squeeze bottles are far easier for children than piping bags.",
      "Fewer colours look better than many.",
      "Accept that half will be a mess. That's the correct outcome."],
    note: "Traditions don't have to be well executed to work. Children remember doing it with you, not how the cookies looked.",
    shop: [], creator: null },

  { id: "weekend-away", emoji: "🚗", title: "One Night Away", sub: "An hour from home is enough.",
    time: "A Weekend", minutes: 1440, season: [], tags: [],
    category: ["Travel"], mood: ["Adventurous", "Romantic", "Restful"],
    intro: "One night, somewhere an hour away. Cheaper than a holiday and it resets you almost as well.",
    materials: ["One small bag", "A booking somewhere with a bath if possible"],
    steps: ["Pick somewhere within ninety minutes. Travel time eats the point.",
      "Book somewhere to eat before you go, so you don't spend the evening deciding.",
      "One bag each. Genuinely one night's worth.",
      "Leave Friday evening rather than Saturday morning.",
      "Come home Sunday morning, not Sunday night."],
    tips: ["Off-season and midweek are a fraction of the price.",
      "Somewhere walkable beats somewhere beautiful you have to drive around.",
      "Don't plan the second day."],
    note: "Short breaks give most of the restorative benefit of long ones — the recovery happens in the first couple of days.",
    shop: [], creator: null },
]

// ── SEASON RESOLUTION ───────────────────────────────────────────────────────
// Uses the SAME engines already driving atmosphere. Holidays first, then the
// underlying season. Mother's Day is added here only — it belongs to content,
// not to the atmosphere layer, so bloomair stays untouched.
const HOLIDAY_LABEL = {
  valentines: "Valentine's", easter: "Easter", halloween: "Halloween",
  christmas: "Christmas", harvest: "Autumn", thanks: "Autumn", newyear: "Winter",
}
const SEASON_LABEL = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" }

const mothersDay = (y) => {
  const d = new Date(y, 4, 1)                     // US: second Sunday in May
  const first = (7 - d.getDay()) % 7
  return new Date(y, 4, 1 + first + 7)
}

const currentSeasonLabel = (now) => {
  const d = now || new Date()
  const H = HOLIDAYS(d)
  const keys = Object.keys(H).sort((a, b) => H[b] - H[a])
  if (keys.length) {
    const best = keys.find((k) => k === "halloween" || k === "christmas" || k === "valentines" || k === "easter") || keys[0]
    if (HOLIDAY_LABEL[best]) return HOLIDAY_LABEL[best]
  }
  const md = mothersDay(d.getFullYear())
  const days = (md - d) / 86400000
  if (days >= 0 && days <= 12) return "Mother's Day"
  return SEASON_LABEL[seasonPalette(d).season] || "Spring"
}

// ── SELECTORS ───────────────────────────────────────────────────────────────
const byTag = (tag) => FLOURISH.filter((p) => (p.tags || []).indexOf(tag) >= 0)
const byTime = (t) => FLOURISH.filter((p) => p.time === t)
const byCategory = (c) => FLOURISH.filter((p) => (p.category || []).indexOf(c) >= 0)

// Seasonal carousel, topped up with evergreen so it never looks abandoned.
const seasonalSet = (now, min) => {
  const label = currentSeasonLabel(now)
  const matched = FLOURISH.filter((p) => (p.season || []).indexOf(label) >= 0)
  const floor = min || 4
  if (matched.length >= floor) return { label, items: matched }
  const ids = matched.map((p) => p.id)
  const evergreen = FLOURISH.filter((p) => (p.season || []).length === 0 && ids.indexOf(p.id) < 0)
  return { label, items: matched.concat(evergreen).slice(0, Math.max(floor, matched.length)) }
}

// Time feed ordering, derived — seasonal, then Highlight, then Favorite, then rest.
const timeFeed = (t, now) => {
  const label = currentSeasonLabel(now)
  const rank = (p) => {
    if ((p.season || []).indexOf(label) >= 0) return 0
    if ((p.tags || []).indexOf("Highlight") >= 0) return 1
    if ((p.tags || []).indexOf("Flourish Favorite") >= 0) return 2
    return 3
  }
  return byTime(t).slice().sort((a, b) => rank(a) - rank(b) || a.minutes - b.minutes)
}

// Related ideas from shared mood tags. Hidden when nothing meaningful matches.
const relatedByMood = (project, limit) => {
  if (!project || !(project.mood || []).length) return { label: null, items: [] }
  const scored = FLOURISH
    .filter((p) => p.id !== project.id)
    .map((p) => ({ p, n: (p.mood || []).filter((m) => project.mood.indexOf(m) >= 0).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
  if (scored.length < 2) return { label: null, items: [] }
  const top = scored[0].p.mood.find((m) => project.mood.indexOf(m) >= 0) || project.mood[0]
  return { label: "More " + top + " Ideas", items: scored.slice(0, limit || 6).map((x) => x.p) }
}

const F_BY_ID = (id) => FLOURISH.find((p) => p.id === id) || null

export { FLOURISH, F_TIMES, F_IMG, F_BY_ID, byTag, byTime, byCategory, seasonalSet, timeFeed, relatedByMood, currentSeasonLabel }
