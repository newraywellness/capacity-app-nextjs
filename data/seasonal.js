// ============ SEASONAL ============
// An evergreen library, not nine permanent tabs. Every season exists in this
// file from day one (so "browse Christmas in July" already works structurally)
// but only Fall has real content yet — everything else is an honest, empty
// array until it's actually written, never filler.
//
// Items share the exact same shape For You's cards use (id/type/title/teaser/
// image/emoji/tags/detail), reusing that proven card component rather than
// inventing a second one. The one addition — detail.sections, an array of
// {heading, body} — exists because Seasonal content (an outing, a porch
// refresh) doesn't cleanly fit For You's four fixed detail templates, and
// forcing it to would mean either lying about the section headings or
// editing those shared templates. It's additive: For You's existing recipe/
// beauty/home/outing types are completely untouched by it.

const SEASONS = [
  { key: "late-summer", label: "Late Summer" },
  { key: "fall", label: "Fall" },
  { key: "halloween", label: "Halloween" },
  { key: "thanksgiving", label: "Thanksgiving" },
  { key: "christmas", label: "Christmas" },
  { key: "winter", label: "Winter" },
  { key: "valentines", label: "Valentine's" },
  { key: "spring", label: "Spring" },
  { key: "summer", label: "Summer" },
]

const SEASONAL_ITEMS = [
  {
    id: "apple-orchard-afternoon", season: "fall", type: "outing", emoji: "\ud83c\udf4e",
    title: "Apple Orchard Afternoon", teaser: "Cider, apples, and nowhere else you need to be.",
    tags: ["Go", "Fall", "2\u20133 hr", "$$"],
    detail: {
      sections: [
        { heading: "Make It a Day", body: [
          "Go later in the afternoon, when the light is softer.",
          "Pick apples if the orchard offers it.",
          "Get cider or a seasonal treat.",
          "Take a slow lap instead of rushing through.",
          "Bring home enough apples to make something later.",
        ] },
        { heading: "Little Add-On", body: [
          "Pick one recipe you'll make with the apples when you get home.",
        ] },
      ],
    },
  },
  {
    id: "cozy-fall-porch-refresh", season: "fall", type: "home", emoji: "\ud83c\udf83",
    title: "Cozy Fall Porch Refresh", teaser: "A few small changes that make coming home feel completely different.",
    tags: ["Home", "Fall", "30 min", "$$"],
    detail: {
      sections: [
        { heading: "What You Need", body: [
          "One seasonal planter or mums.",
          "A pumpkin or two.",
          "A warm outdoor light or lantern, if you already have one.",
          "Your existing doormat, or a simple layered mat if you'd like.",
        ] },
        { heading: "How To", body: [
          "Clear away summer clutter.",
          "Anchor the space with the planter.",
          "Add pumpkins asymmetrically rather than lining everything up.",
          "Turn on warm lighting near dusk.",
          "Stop before it becomes a giant decorating project.",
        ] },
        { heading: "Keep It Easy", body: [
          "Use what you already own first. This should feel like a seasonal refresh, not an expensive porch makeover.",
        ] },
      ],
    },
  },
  // Every other season exists as a real, selectable entry — deliberately
  // empty rather than populated with filler. Add items here later using the
  // exact same shape as the two Fall entries above.
]

const bySeason = (key) => SEASONAL_ITEMS.filter((i) => i.season === key)
const SEASON_LABEL = (key) => (SEASONS.find((s) => s.key === key) || {}).label || "This season"
const SE_BY_ID = (id) => SEASONAL_ITEMS.find((i) => i.id === id) || null

export { SEASONS, SEASONAL_ITEMS, bySeason, SEASON_LABEL, SE_BY_ID }
