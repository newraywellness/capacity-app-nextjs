const FACTORS = ["Poor sleep", "Interrupted sleep", "Stress", "Work demands", "School", "Parenting", "Hormonal changes", "Anxiety", "Mental load", "Illness", "Grief or loss"]

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

const RESETS = [
  { name: "The 5-minute space reset", icon: "🏵\ufe0f", how: "Pick ONE spot — the counter, your nightstand. Timer for 5 minutes. Reset only that. One calm corner does some of the calming for you." },
  { name: "Long-exhale breathing", icon: "🌬\ufe0f", how: "Two minutes: breathe in for 4, out for 8. The long exhale is the fastest lever your body has for switching off alarm mode." },
  { name: "Step outside", icon: "\u2600\ufe0f", how: "Ten minutes of daylight, ideally morning. It sets your energy rhythm and quiets the noise. No phone required." },
  { name: "The pretty glass ritual", icon: "🥂", how: "Your water, but in the prettiest glass you own. Tiny sensory pleasures are how ordinary days start feeling beautiful." },
  { name: "Phone down, lights low", icon: "🌙", how: "Pick one wind-down anchor tonight — phone away a little earlier, lights dimmed. Tomorrow begins tonight." },
]

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

export { FACTORS, SUPPORTS, QUOTES, SHARE_TRUE, SHARE_NEED, SHARE_LEVELS, REFRAMES, RESETS, SUGGEST, NEXT_STEP, SEASONS, HOPES, LEVELS, EQUIP, CYCLEPREF, ShopItems }
