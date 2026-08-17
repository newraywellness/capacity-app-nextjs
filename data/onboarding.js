// ============ ONBOARDING (NEW) ============
// Replaces the old fitness-first onboarding entirely. Nothing here reads
// from or touches data/checkin.js's SEASONS/HOPES/LEVELS/EQUIP/CYCLEPREF —
// those stay exactly as they are for My Life's own editing screen, which
// still uses them. This is a clean, separate set of questions for the
// product as it exists today: Bloom, Taste, Body, Rebuild, Progress.

const GOALS = [
  "I want to feel like myself again",
  "I want more fun in my life",
  "I want to take better care of myself",
  "I want my life to feel less chaotic",
  "I want to understand my body better",
  "I want to feel more confident",
  "I want to get out and do more",
  "I want my home to feel better",
  "I want healthier routines that actually fit my life",
  "I'm not totally sure \u2014 I just want something to change",
]

const INTERESTS = [
  "Baking", "Cooking", "Beauty", "Hair", "Skincare", "Makeup", "Nails",
  "Fashion & outfits", "Home & decorating", "Crafts & DIY", "Gardening & plants",
  "Books", "Movies & cozy nights", "Coffee & caf\u00e9s", "Trying new foods",
  "Little outings", "Day trips", "Travel", "Fitness & movement", "Outdoors",
  "Hosting", "Seasonal things", "Photography", "Learning something new",
  "Surprise me",
]

const EXPERIENCES = [
  "Cozy at home", "Getting out of the house", "Trying something new", "Making something",
  "Getting dressed up", "Food-centered", "Being outside", "Doing something with people",
  "Doing something alone", "Spontaneous little adventures", "Projects with a satisfying result",
]

const DESIRES = [
  "Fun", "Energy", "Confidence", "Calm", "Connection", "Creativity", "Spontaneity",
  "Feeling put together", "Time that feels like mine", "A home I enjoy being in",
  "Better food and routines", "Understanding my body", "Something to look forward to",
]

const CAPACITY_FACTORS = [
  "Sleep", "Stress", "Parenting or caregiving", "Work", "Mental health",
  "Cycle or hormones", "Physical health or pain", "Life just gets busy", "Something else",
]

export { GOALS, INTERESTS, EXPERIENCES, DESIRES, CAPACITY_FACTORS }
