// ============ FOR YOU — FEED PROTOTYPE ============
// Six hand-picked ideas, not a content library. Each carries a `type` that
// decides which detail template renders on the flip side — recipe/beauty/
// home/outing all get their own shape rather than one rigid template forced
// on everything. `timeBucket` is separate from the display `tags` so Browse
// by Time can filter against a small fixed vocabulary without messing with
// how the time actually reads on the card.
//
// The movement card intentionally reuses data/move.js rather than inventing
// a parallel idea — one source of truth for movement content, not two.

const FOR_YOU_ITEMS = [
  {
    id: "brown-butter-cookies", type: "recipe", emoji: "\ud83c\udf6a", image: "/bloom/apple-cider-cookies.jpeg",
    title: "Brown Butter Apple Cider Cookies", teaser: "The brown butter changes everything.",
    tags: ["Bake", "45 min", "$"], timeBucket: "I've got time",
    detail: {
      ingredients: ["1 cup butter, browned and cooled", "1 cup boiled apple cider (reduced to \u00bc cup)", "2\u00bc cups flour", "1 tsp cinnamon", "1 tsp baking soda", "1 cup brown sugar", "1 egg + 1 yolk", "1 tsp vanilla"],
      steps: ["Brown the butter until deep amber and nutty-smelling, then cool slightly.", "Boil apple cider down to about \u00bc cup, syrupy \u2014 this is the secret.", "Cream browned butter with sugars, then add egg, yolk, vanilla, and cooled cider syrup.", "Fold in flour, cinnamon, and baking soda. Chill dough 30 minutes.", "Bake at 350\u00b0F for 10\u201312 minutes until edges are set but centers look slightly underdone."],
      note: "No cider on hand? Reduce apple juice the same way \u2014 you'll lose a little tang but keep the cozy.",
    },
  },

  {
    id: "heatless-waves", type: "beauty", emoji: "\ud83c\udf80", image: "/bloom/heatless-waves.jpeg",
    title: "Overnight Silk Heatless Waves", teaser: "Wake up with waves you didn't have to burn your hair for.",
    tags: ["Beauty", "10 min", "At home"], timeBucket: "15 min",
    detail: {
      need: ["A silk or satin scrunchie (regular elastics crease)", "A little leave-in conditioner or hair oil", "Damp, not soaking, hair"],
      steps: ["Work a small amount of leave-in or oil through damp hair.", "Gather hair into a high pony with the silk scrunchie, then twist the ponytail into a loose bun around itself.", "Secure with a second scrunchie or clip, and sleep on it.", "In the morning, release and finger-comb \u2014 don't brush, or you'll lose the wave."],
      nurseTip: "Silk and satin cause far less friction than cotton, which means less breakage while you sleep \u2014 worth the switch even beyond this one style.",
      products: ["A proper silk scrunchie (not synthetic satin, it matters)", "A lightweight leave-in \u2014 too heavy and the wave falls flat"],
    },
  },

  {
    id: "blanket-fort-movie-night", type: "home", emoji: "\ud83d\udecb\ufe0f", image: "/bloom/blanket-fort-movie-night.jpeg",
    title: "Blanket Fort Movie Night", teaser: "Pillows, fairy lights, and permission to do nothing productive.",
    tags: ["Cozy", "At home", "Free"], timeBucket: "30 min",
    detail: {
      need: ["Every blanket and pillow you own", "Chairs or a couch to anchor the corners", "String lights if you have them", "Something warm to drink"],
      steps: ["Drape blankets between furniture to make a low ceiling \u2014 it doesn't need to be structurally sound, just cave-like.", "Pile in every pillow and blanket left over.", "Tuck in the lights, dim the real ones, and pick something you've already seen before \u2014 lower stakes, more comfort.", "Phones outside the fort. That's the whole rule."],
    },
  },

  {
    id: "farmers-market-run", type: "outing", emoji: "\ud83e\uddfa", image: "/bloom/golden-hour-farmers-market-stroll.jpeg",
    title: "Golden Hour Farmers Market Run", teaser: "Go before the good tomatoes are gone.",
    tags: ["Go", "1 hr", "$"], timeBucket: "1 hour",
    detail: {
      idea: "A slow, unhurried lap of your local farmers market \u2014 not a grocery run, an outing.",
      makeItFun: ["Go alone or bring someone, but leave the list at home \u2014 buy what looks good, not what you planned.", "Get something to eat or drink while you walk instead of saving it for later.", "Talk to one vendor about how something's grown or made \u2014 most people love being asked."],
      details: "Best an hour or two before the market closes, when it's quieter and vendors are often willing to let things go for less.",
    },
  },

  // Movement — pulled from data/move.js rather than duplicated. See M_BY_ID
  // below; this entry only carries display-specific fields (tags, timeBucket).
  {
    id: "movement:nicole-pilates",
    type: "movement",
    moveId: "nicole-pilates",
    image: "/bloom/serene-home-pilates-by-daylight.jpeg",
    tags: ["Sweat", "15 min", "Pilates"],
    timeBucket: "15 min",
  },

  {
    id: "simmer-pot", type: "home", emoji: "\ud83d\udd6f\ufe0f", image: "/bloom/cinnamon-vanilla-simmer-pot.jpeg",
    title: "Cinnamon-Vanilla Simmer Pot", teaser: "Your house smells like a candle you didn't have to buy.",
    tags: ["Make", "5 min", "At home"], timeBucket: "5 min",
    detail: {
      need: ["A small pot of water", "A cinnamon stick or 1 tsp ground cinnamon", "A splash of vanilla extract", "Orange or apple peel if you have it"],
      steps: ["Add everything to a small pot of water.", "Bring to a low simmer, then turn down as low as it'll go.", "Let it simmer on the stove for as long as you're home \u2014 top off with water as it reduces."],
    },
  },
]

const TIME_FILTERS = ["5 min", "15 min", "30 min", "1 hour", "I've got time"]

const byTimeBucket = (t) => FOR_YOU_ITEMS.filter((i) => i.timeBucket === t)
const FY_BY_ID = (id) => FOR_YOU_ITEMS.find((i) => i.id === id) || null

export { FOR_YOU_ITEMS, TIME_FILTERS, byTimeBucket, FY_BY_ID }
