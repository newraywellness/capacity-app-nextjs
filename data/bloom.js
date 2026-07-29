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
        future: "Product recommendations, a routine builder, and True Reverie skincare are on the way." },
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
          { h: "Intentional care", items: ["What facials actually are", "Common treatments explained", "A little skin education", "Future True Reverie services"] },
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

const BLOOM_PROMPTS = [
  "The woman I'm becoming is someone who...",
  "What would make today 1% softer?",
  "One thing I want more of, that I've felt guilty for wanting:",
  "What did I do today that counted — even if it was tiny?",
  "Whose voice is my inner critic... and do I want to keep listening to it?",
  "What's one honest 'no' I need to say this week?",
  "What's one small promise I can keep to myself tomorrow?",
]

export { BLOOM_INVITATIONS, BLOOM_SECTIONS, BLOOM_PROMPTS }
