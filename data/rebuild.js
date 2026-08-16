// ============ REBUILD ============
// The program library for Rebuild's landing page only. No program has real
// content yet — every entry is intentionally "coming-soon" until its actual
// interior is designed and built separately. Fields are deliberately limited
// to what the landing page needs (id/title/duration/outcome/status/gradient/
// image). Future fields this will eventually need — premium/free status,
// program content, user progress — are NOT added yet, per instruction not to
// over-engineer a landing-page prototype.
//
// `image` stays null on every entry on purpose: real cover photography isn't
// ready, and the brief is explicit that emoji shouldn't be the primary
// artwork here (unlike Move/For You/Seasonal). Each program instead gets its
// own gradient, drawn from True Reverie's existing palette (plum/magenta/
// pink/teal/gold, plus the lilac already used for CTAs elsewhere), so the
// library has some visual variety without needing photography yet.

const REBUILD_PROGRAMS = [
  {
    id: "feel-like-yourself-again", title: "Feel Like Yourself Again", featured: true,
    duration: "28 experiences \u00b7 move at your own pace",
    outcome: "Reconnect with the woman underneath survival mode. Rediscover what makes life feel like yours and build more of it back in.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#3C1959 0%,#7A3A6E 45%,#A44181 100%)",
  },
  {
    id: "glow-up-rebuild", title: "The Glow-Up Rebuild", featured: false,
    duration: "21 experiences",
    outcome: "Take care of yourself again \u2014 hair, skin, style, body care, confidence, routines, and visible little wins that make you feel put together.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#DA618B 0%,#E0A253 100%)",
  },
  {
    id: "get-your-shit-together", title: "Get Your Shit Together", featured: false,
    duration: "14 experiences",
    outcome: "Clear the background chaos and make everyday life feel manageable again.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#3C1959 0%,#159492 100%)",
  },
  {
    id: "home-reset", title: "The Home Reset", featured: false,
    duration: "21 experiences",
    outcome: "Make home feel calmer, easier to maintain, and better to walk into.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#E0A253 0%,#DA618B 60%,#A44181 100%)",
  },
  {
    id: "relationship-reconnect", title: "Relationship Reconnect", featured: false,
    duration: "14 experiences",
    outcome: "Feel like partners again instead of two people managing a household.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#A44181 0%,#DA618B 100%)",
  },
  {
    id: "postpartum-rebuild", title: "Postpartum Rebuild", featured: false,
    duration: "Multi-week",
    outcome: "Feel human and more like yourself again after having a baby \u2014 without pretending postpartum life is simple.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#DA618B 0%,#C9A8D9 100%)",
  },
  {
    id: "come-back-to-yourself", title: "Come Back to Yourself", featured: false,
    duration: "21\u201330 experiences",
    outcome: "For the woman who has spent so long taking care of everyone else that she stopped knowing what she wants.",
    status: "coming-soon", image: null,
    gradient: "linear-gradient(135deg,#3C1959 0%,#A87BD1 100%)",
  },
]

const featuredProgram = REBUILD_PROGRAMS.find((p) => p.featured) || null
const otherPrograms = REBUILD_PROGRAMS.filter((p) => !p.featured)

export { REBUILD_PROGRAMS, featuredProgram, otherPrograms }
