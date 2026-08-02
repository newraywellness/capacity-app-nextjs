const BASE = {
  bg: "#FDF7F4", bg2: "#FAF0EC", surface: "#FFFFFF", surface2: "#F6E9E7",
  border: "rgba(42,21,34,0.13)", cream: "#2A1522", creamDim: "#4E2C40",
  taupe: "#8C6577", terracotta: "#D9749B", terracottaDeep: "#C25A84",
}

const THEMES = {
  none: { accent: BASE.terracotta, glow: "217,116,155", tint: "rgba(217,116,155,0.08)", label: "", range: "", word: "" },
  red: { accent: "#D65C4E", glow: "214,92,78", tint: "rgba(214,92,78,0.10)", label: "Red Day", range: "0–35%", word: "Survive · stabilize · simplify" },
  yellow: { accent: "#D08F2E", glow: "208,143,46", tint: "rgba(208,143,46,0.12)", label: "Yellow Day", range: "36–70%", word: "Steady progress, protect tomorrow" },
  green: { accent: "#7FA054", glow: "127,160,84", tint: "rgba(127,160,84,0.12)", label: "Green Day", range: "71–100%", word: "Plan · grow · build" },
}

const colorFromPct = (p) => (p <= 35 ? "red" : p <= 70 ? "yellow" : "green")

const HERO_GRAD = {
  red: "linear-gradient(135deg, #E0705F 0%, #C34A3B 100%)",
  yellow: "linear-gradient(135deg, #E3A94E 0%, #C07E20 100%)",
  green: "linear-gradient(135deg, #93B061 0%, #66883E 100%)",
}

const demoLink = (name) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " form how to")

const GLOW_THRESHOLD = { red: 1, yellow: 3, green: 4 }

const dayIndex = (len) => { const d = new Date(); return (d.getFullYear() * 366 + Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)) % len }



// ---- Atmosphere engine: environment = f(hour, capacity) ----
const ENV = (hour, color) => {
  // Night is its own mode now: after midnight the moon becomes the only thing
  // in the sky and the whole page quiets down. Greeting copy is unaffected —
  // night still reads as "Good evening", which is intended for 12–5am.
  const mode = hour >= 5 && hour < 12 ? "morning"
    : hour >= 12 && hour < 18 ? "afternoon"
    : hour >= 18 ? "evening"
    : "night"
  const bright = color === "green"
  const quiet = color === "red"
  const bgs = {
    morning: "linear-gradient(180deg,#FFEDD8 0%,#FFE0E4 28%,#F7D8EE 56%,#E6D5F6 100%)",
    afternoon: "linear-gradient(180deg,#FFE3C4 0%,#FFD9D2 30%,#F5D3E8 62%,#E4D0F2 100%)",
    evening: "linear-gradient(180deg,#2E2149 0%,#4A2E5E 40%,#6E3F6E 72%,#8A4E70 100%)",
    night: "linear-gradient(180deg,#191331 0%,#271C44 38%,#3A2854 70%,#4A3260 100%)",
  }
  // Red softens the current time of day (calmer, more muted) but never forces night while it's daytime.
  const quietBgs = {
    morning: "linear-gradient(180deg,#F6E9E4 0%,#F3E2E8 34%,#EBE0EE 66%,#E2DCEE 100%)",
    afternoon: "linear-gradient(180deg,#F1E4DA 0%,#EEDFE2 34%,#E9DEEC 66%,#E1DAEC 100%)",
    evening: "linear-gradient(180deg,#2E2149 0%,#4A2E5E 40%,#6E3F6E 72%,#8A4E70 100%)",
    night: "linear-gradient(180deg,#191331 0%,#271C44 38%,#3A2854 70%,#4A3260 100%)",
  }
  const bg = quiet ? quietBgs[mode] : bgs[mode]
  const dark = mode === "evening" || mode === "night"
  // A wash in the capacity's hue. Deliberately near the threshold of noticing —
  // the day should feel a little fresher or a little softer, not look recoloured.
  const tints = {
    green: dark ? "linear-gradient(180deg,rgba(150,200,150,0.09),rgba(150,200,150,0) 60%)" : "linear-gradient(180deg,rgba(150,195,140,0.11),rgba(150,195,140,0) 55%)",
    yellow: dark ? "linear-gradient(180deg,rgba(240,200,120,0.09),rgba(240,200,120,0) 60%)" : "linear-gradient(180deg,rgba(240,190,110,0.11),rgba(240,190,110,0) 55%)",
    red: dark ? "linear-gradient(180deg,rgba(226,150,165,0.09),rgba(226,150,165,0) 60%)" : "linear-gradient(180deg,rgba(226,150,160,0.12),rgba(226,150,160,0) 55%)",
  }
  const tint = color ? tints[color] || null : null
  return { mode, bright, quiet, bg, dark, tint }
}

const SICON = (k, c) => {
  if (k === "water") return <svg width="20" height="24" viewBox="0 0 20 24"><path d="M10 2 C 14 8, 17 12, 17 16 A 7 7 0 1 1 3 16 C 3 12, 6 8, 10 2 Z" fill="none" stroke={c} strokeWidth="1.4" /></svg>
  if (k === "food") return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 13 H 19 A 8 8 0 0 1 3 13 Z" fill="none" stroke={c} strokeWidth="1.4" /><path d="M8 9 C 8 7, 9 7, 9 5 M 13 9 C 13 7, 14 7, 14 5" fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" /></svg>
  if (k === "move") return <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="5" r="2.2" fill="none" stroke={c} strokeWidth="1.4" /><path d="M11 7.5 L 11 13 M 11 9 L 6.5 11.5 M 11 9 L 15.5 11 M 11 13 L 7.5 19 M 11 13 L 14.5 19" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" /></svg>
  if (k === "moon") return <svg width="20" height="20" viewBox="0 0 20 20"><path d="M14 2 A 8.5 8.5 0 1 0 18 12 A 6.8 6.8 0 0 1 14 2 Z" fill="none" stroke={c} strokeWidth="1.4" /></svg>
  return <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 17 C 4 12, 2 9, 2 6.5 A 3.6 3.6 0 0 1 10 5 A 3.6 3.6 0 0 1 18 6.5 C 18 9, 16 12, 10 17 Z" fill="none" stroke={c} strokeWidth="1.4" /></svg>
}

export { BASE, THEMES, colorFromPct, HERO_GRAD, demoLink, GLOW_THRESHOLD, dayIndex, ENV, SICON }
