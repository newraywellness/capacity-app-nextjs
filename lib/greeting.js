// ============ MORNING GREETING ============
// Shared by Today (which renders the real greeting) and More (which lets her
// choose it), so both always agree on what each style actually says. The
// name is never stored — build() takes it as a parameter, read fresh from
// setupData.name every time, so changing her name in My Life updates every
// name-based style automatically with nothing extra to keep in sync.

// Same hour thresholds as ENV() in lib/theme.js: morning 5–11, afternoon
// 12–17, everything else (including night) reads "Good evening" — this
// intentionally matches Today's existing behavior exactly.
const greetWordFor = (mode) => (mode === "morning" ? "Good morning" : mode === "afternoon" ? "Good afternoon" : "Good evening")

const GREETING_STYLES = [
  { key: "name_formal", label: "Good morning, [Name]", sub: "Uses your saved name", build: (word, name) => word + (name ? ", " + name : "") },
  { key: "love", label: "Good morning, love", sub: null, build: (word) => word + ", love" },
  { key: "beautiful", label: "Good morning, beautiful", sub: null, build: (word) => word + ", beautiful" },
  { key: "name_casual", label: "Morning, [Name]", sub: "Uses your saved name", build: (word, name) => "Morning" + (name ? ", " + name : "") },
  { key: "simple", label: "Good morning", sub: null, build: (word) => word },
]

const GREETING_BY_KEY = (key) => GREETING_STYLES.find((g) => g.key === key) || GREETING_STYLES[0]

export { GREETING_STYLES, GREETING_BY_KEY, greetWordFor }
