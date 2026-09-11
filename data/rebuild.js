// ============ REBUILD LIBRARY ============
// Discovery metadata only. Full program content lives in separate program files.

const REBUILD_PROGRAMS = [
  {
    id: "feel-like-yourself-again", title: "Feel Like Yourself Again", featured: true, premium: false, kind: "rebuild",
    duration: "28 experiences", pace: "Move at your own pace",
    outcome: "Reconnect with the woman underneath survival mode. Rediscover what makes life feel like yours and build more of it back in.",
    tags: ["Identity", "Self"], status: "live",
    gradient: "linear-gradient(145deg,#3C1959 0%,#7A3A6E 46%,#A44181 100%)",
  },
  {
    id: "postpartum-rebuild", title: "Postpartum Rebuild", premium: true, kind: "rebuild",
    duration: "21 experiences", pace: "Move at your own pace",
    outcome: "You don't need to get your old self back. Make room for the woman who's here now — body, identity, home, relationships, and all.",
    tags: ["Postpartum", "Identity"], status: "preview",
    gradient: "linear-gradient(145deg,#C98CA8 0%,#D9B6C9 52%,#B7A4CE 100%)",
  },
  {
    id: "glow-up-rebuild", title: "The Glow-Up Rebuild", premium: true, kind: "rebuild",
    duration: "21 experiences", pace: "Move at your own pace",
    outcome: "Take care of yourself again — hair, skin, style, body care, confidence, routines, and visible little wins that make you feel put together.",
    tags: ["Confidence", "Self-care"], status: "preview",
    gradient: "linear-gradient(145deg,#D96591 0%,#E49B74 100%)",
  },
  {
    id: "get-your-shit-together", title: "Get Your Shit Together", premium: true, kind: "rebuild",
    duration: "14 experiences", pace: "Move at your own pace",
    outcome: "Clear the background chaos and make everyday life feel manageable again.",
    tags: ["Life reset", "Routines"], status: "preview",
    gradient: "linear-gradient(145deg,#403064 0%,#247F88 100%)",
  },
  {
    id: "home-reset", title: "The Home Reset", premium: true, kind: "rebuild",
    duration: "21 experiences", pace: "Move at your own pace",
    outcome: "Make home feel calmer, easier to maintain, and better to walk into.",
    tags: ["Home", "Routines"], status: "preview",
    gradient: "linear-gradient(145deg,#DFA15B 0%,#D96F91 58%,#B54E87 100%)",
  },
  {
    id: "come-back-to-yourself", title: "Come Back to Yourself", premium: true, kind: "rebuild",
    duration: "28 experiences", pace: "Move at your own pace",
    outcome: "For the woman who has spent so long taking care of everyone else that she stopped knowing what she wants.",
    tags: ["Identity", "Burnout"], status: "preview",
    gradient: "linear-gradient(145deg,#4A285F 0%,#8E68A9 55%,#C08CB9 100%)",
  },
  {
    id: "get-out-of-the-funk", title: "Get Out of the Funk", premium: false, kind: "quick",
    duration: "5 experiences", pace: "A quick Rebuild",
    outcome: "You've felt off for a while. Don't reinvent your life — just create a little movement again.",
    tags: ["Quick reset", "Mood"], status: "preview",
    gradient: "linear-gradient(145deg,#78958A 0%,#B8BDA1 100%)",
  },
  {
    id: "weekend-reset", title: "The Weekend Reset", premium: false, kind: "quick",
    duration: "3 experiences", pace: "A quick Rebuild",
    outcome: "A small reset for your space, your head, and the week waiting on the other side.",
    tags: ["Quick reset", "Home"], status: "preview",
    gradient: "linear-gradient(145deg,#B9A3D4 0%,#D6B7C8 100%)",
  },
]

const RITUALS = [
  { id:"closing-shift", title:"The Closing Shift", meta:"EVENING · 10 MIN", premium:false, desc:"Put the house and your brain to bed — just enough to make tomorrow easier.", gradient:"linear-gradient(145deg,#495777,#8C7D9B)" },
  { id:"before-everyone-needs-you", title:"Before Everyone Needs You", meta:"MORNING · 5 MIN", premium:false, desc:"Five quiet minutes that belong to you before the day starts asking.", gradient:"linear-gradient(145deg,#D8B6A3,#E3CBAF)" },
  { id:"everything-shower", title:"The Everything Shower", meta:"ANYTIME · 20 MIN", premium:true, desc:"The whole production — hair, skin, body care, lotion, and feeling human again.", gradient:"linear-gradient(145deg,#C98EAE,#AFA1CF)" },
  { id:"soft-sunday", title:"Soft Sunday Reset", meta:"SUNDAY · 30 MIN", premium:true, desc:"Not a productivity marathon. Just enough care to make Monday feel kinder.", gradient:"linear-gradient(145deg,#8FA68D,#C7BDA0)" },
  { id:"five-things", title:"I Can't Deal With My House", meta:"ANYTIME · 5 MIN", premium:false, desc:"Five things. That's it. A tiny ritual for when the mess feels louder than you are.", gradient:"linear-gradient(145deg,#B49B8D,#D2B9B0)" },
  { id:"night-before-work", title:"Night-Before Work Reset", meta:"EVENING · 15 MIN", premium:true, desc:"Remove a few decisions from tomorrow morning and let tonight end sooner.", gradient:"linear-gradient(145deg,#526D7C,#9BAFB1)" },
]

const featuredProgram = REBUILD_PROGRAMS.find((p) => p.featured) || null
const otherPrograms = REBUILD_PROGRAMS.filter((p) => !p.featured)

export { REBUILD_PROGRAMS, RITUALS, featuredProgram, otherPrograms }
