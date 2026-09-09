import { GLOW_TOPICS, GLOW_BY_KEY } from "../data/glow.js"
import { BASE } from "../lib/theme.js"

// Glow discovery feed.
// Keeps data/glow.js unchanged and turns the existing Glow records into
// Bloom-style cards:
//   vertical scroll = discover the next idea
//   horizontal swipe = get the useful information immediately

const TYPE_META = {
  win: { label: "Quick Win", icon: "✨" },
  learn: { label: "Learn", icon: "📖" },
  guide: { label: "Products We Love", icon: "🛍️" },
  type: { label: "Know Yourself", icon: "♡" },
  extra: { label: "Worth Knowing", icon: "✦" },
  wardrobe: { label: "Style Idea", icon: "👗" },
}

const GRADS = {
  hair: "linear-gradient(150deg,#F7E8EE 0%,#E9D9EC 48%,#D9D2EA 100%)",
  skin: "linear-gradient(150deg,#F8E7ED 0%,#F0DADF 48%,#E6D8EA 100%)",
  makeup: "linear-gradient(150deg,#F6E1EB 0%,#EAD6E8 48%,#DACEE5 100%)",
  perfume: "linear-gradient(150deg,#F5E9F1 0%,#E8DCEB 48%,#DCD5E8 100%)",
  nails: "linear-gradient(150deg,#F8E5EC 0%,#ECD9E6 48%,#DED1E3 100%)",
  brows: "linear-gradient(150deg,#F1E7E2 0%,#E6D8D4 48%,#DCCFDD 100%)",
  lips: "linear-gradient(150deg,#F8E3E8 0%,#EDD4DF 48%,#E1D2E4 100%)",
  jewelry: "linear-gradient(150deg,#F6EDDF 0%,#EDE1D4 48%,#DED7E3 100%)",
  facials: "linear-gradient(150deg,#E9EEF0 0%,#E0E3EA 48%,#D9D5E6 100%)",
  body: "linear-gradient(150deg,#EEF0E8 0%,#E6E2DD 48%,#DDD5E2 100%)",
  wardrobe: "linear-gradient(150deg,#EFE8E2 0%,#E3D9D8 48%,#D9D2E1 100%)",
}

const titleOf = (x) => x.title || x.name || x.n || ""
const teaserOf = (x) => x.desc || x.b || x.i || x.sub || x.why || ""
const idOf = (x, i) => x.id || x.n || x.title || i

function flattenWardrobe(T) {
  if (!T || !T.wardrobe) return []
  const W = T.wardrobe
  return []
    .concat(W.today || [], W.ideas || [], W.gym || [], W.plates || [])
    .map((item) => ({ kind: "wardrobe", topic: T, item }))
}

function recordsForTopic(T) {
  if (!T) return []

  if (T.editorial) {
    return [
      ...flattenWardrobe(T),
      ...(T.learn || []).map((item) => ({ kind: "learn", topic: T, item })),
    ]
  }

  const groups = [
    (T.wins || []).map((item) => ({ kind: "win", topic: T, item })),
    (T.learn || []).map((item) => ({ kind: "learn", topic: T, item })),
    (T.guides || []).map((item) => ({ kind: "guide", topic: T, item })),
    (T.types || []).map((item) => ({ kind: "type", topic: T, item })),
    (T.extra || []).map((item) => ({ kind: "extra", topic: T, item })),
  ]

  const out = []
  let i = 0
  let added = true

  while (added) {
    added = false
    groups.forEach((g) => {
      if (g[i]) {
        out.push(g[i])
        added = true
      }
    })
    i += 1
  }

  return out
}

function mixedGlowFeed() {
  const topicFeeds = GLOW_TOPICS.map((T) => recordsForTopic(T))
  const out = []
  let i = 0
  let added = true

  while (added) {
    added = false
    topicFeeds.forEach((feed) => {
      if (feed[i]) {
        out.push(feed[i])
        added = true
      }
    })
    i += 1
  }

  return out
}

function Slide({ children }) {
  return (
    <div
      style={{
        flex: "0 0 100%",
        scrollSnapAlign: "start",
        minWidth: 0,
        maxHeight: 690,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 2.1,
        textTransform: "uppercase",
        color: "#C9558E",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  )
}

function DotList({ items, tone = "#C9558E", numbered = false }) {
  if (!items || !items.length) return null

  return (
    <div>
      {items.map((x, i) => (
        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
          {numbered ? (
            <span
              style={{
                flexShrink: 0,
                width: 23,
                height: 23,
                borderRadius: "50%",
                background: "rgba(201,85,142,0.11)",
                color: tone,
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 1,
              }}
            >
              {i + 1}
            </span>
          ) : (
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: tone,
                marginTop: 8,
                flexShrink: 0,
              }}
            />
          )}

          <span style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.58 }}>{x}</span>
        </div>
      ))}
    </div>
  )
}

function NurseNote({ children, label = "A nurse's note" }) {
  if (!children) return null

  return (
    <div
      style={{
        borderRadius: 17,
        background: "rgba(201,123,168,0.10)",
        padding: "17px 18px",
        marginTop: 6,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "#C97BA8",
          marginBottom: 7,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 16,
          color: BASE.cream,
          lineHeight: 1.48,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function ProductTier({ icon, label, item }) {
  if (!item) return null

  return (
    <div
      style={{
        display: "flex",
        gap: 11,
        padding: "13px 14px",
        borderRadius: 14,
        background: BASE.surface,
        border: `1px solid ${BASE.border}`,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1.3 }}>{icon}</span>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: BASE.taupe,
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 13.5,
            fontWeight: 700,
            color: BASE.cream,
            marginTop: 3,
            lineHeight: 1.3,
          }}
        >
          {item.n}
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 12.5,
            color: BASE.taupe,
            marginTop: 4,
            lineHeight: 1.45,
          }}
        >
          {item.w}
        </div>
      </div>
    </div>
  )
}

function ProductSet({ prod }) {
  if (!prod) return null

  return (
    <>
      <ProductTier icon="💰" label="Budget" item={prod.budget} />
      <ProductTier icon="🥇" label="Best overall" item={prod.best} />
      <ProductTier icon="✨" label="Luxury" item={prod.lux} />
    </>
  )
}

function ContentPage({ title, eyebrow, children }) {
  return (
    <div style={{ padding: "24px 20px 26px" }}>
      <Eyebrow>{eyebrow}</Eyebrow>

      {title && (
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 23,
            fontWeight: 700,
            color: BASE.cream,
            lineHeight: 1.18,
            marginBottom: 14,
          }}
        >
          {title}
        </div>
      )}

      {children}
    </div>
  )
}

function buildSlides(record) {
  const { kind, item: x } = record
  const title = titleOf(x)
  const slides = []

  if (kind === "win") {
    slides.push(
      <Slide key="why">
        <ContentPage eyebrow="Why it works" title={title}>
          <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.68 }}>{x.why}</div>
        </ContentPage>
      </Slide>
    )

    slides.push(
      <Slide key="how">
        <ContentPage eyebrow="How to use it" title={title}>
          <DotList items={x.how || []} numbered />
        </ContentPage>
      </Slide>
    )

    if (x.prod) {
      slides.push(
        <Slide key="products">
          <ContentPage eyebrow="Products we love" title={title}>
            <ProductSet prod={x.prod} />
          </ContentPage>
        </Slide>
      )
    }

    if (x.tip) {
      slides.push(
        <Slide key="tip">
          <ContentPage eyebrow="Worth knowing" title={title}>
            <NurseNote label="Nurse's tip">{x.tip}</NurseNote>
          </ContentPage>
        </Slide>
      )
    }
  }

  if (kind === "learn") {
    const body = x.body || []

    body.forEach((para, i) => {
      slides.push(
        <Slide key={"body-" + i}>
          <ContentPage eyebrow={i === 0 ? "The answer" : "Keep swiping"} title={i === 0 ? title : null}>
            <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.72 }}>{para}</div>
          </ContentPage>
        </Slide>
      )
    })

    if (x.note) {
      slides.push(
        <Slide key="note">
          <ContentPage eyebrow="Worth knowing" title={title}>
            <NurseNote>{x.note}</NurseNote>
          </ContentPage>
        </Slide>
      )
    }
  }

  if (kind === "guide") {
    if (x.when) {
      slides.push(
        <Slide key="when">
          <ContentPage eyebrow="When it fits" title={title}>
            <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.68 }}>{x.when}</div>
          </ContentPage>
        </Slide>
      )
    }

    if (x.p) {
      slides.push(
        <Slide key="products">
          <ContentPage eyebrow="Products we love" title={title}>
            <ProductSet prod={x.p} />
          </ContentPage>
        </Slide>
      )
    }
  }

  if (kind === "type") {
    if (x.do) {
      slides.push(
        <Slide key="do">
          <ContentPage eyebrow="Try this" title={title}>
            <DotList items={x.do} tone="#7FA054" />
          </ContentPage>
        </Slide>
      )
    }

    if (x.no) {
      slides.push(
        <Slide key="skip">
          <ContentPage eyebrow="Skip this" title={title}>
            <DotList items={x.no} tone="#D65C4E" />
          </ContentPage>
        </Slide>
      )
    }
  }

  if (kind === "extra") {
    if (x.what) {
      slides.push(
        <Slide key="what">
          <ContentPage eyebrow="What it is" title={title}>
            <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.66, marginBottom: 18 }}>{x.what}</div>

            {x.who && (
              <>
                <Eyebrow>Who it's for</Eyebrow>
                <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.66 }}>{x.who}</div>
              </>
            )}
          </ContentPage>
        </Slide>
      )

      if (x.downtime || x.best) {
        slides.push(
          <Slide key="best">
            <ContentPage eyebrow="What to expect" title={title}>
              {x.downtime && (
                <div style={{ fontSize: 14, color: BASE.creamDim, lineHeight: 1.66, marginBottom: 18 }}>
                  <strong style={{ color: BASE.cream }}>Downtime: </strong>
                  {x.downtime}
                </div>
              )}

              {(x.best || []).map(([concern, mark], i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px",
                    borderRadius: 12,
                    background: BASE.surface,
                    border: `1px solid ${BASE.border}`,
                    marginBottom: 6,
                  }}
                >
                  <span>{mark}</span>
                  <span style={{ fontSize: 13, color: mark === "❌" ? BASE.taupe : BASE.cream }}>{concern}</span>
                </div>
              ))}
            </ContentPage>
          </Slide>
        )
      }

      if (x.worth) {
        slides.push(
          <Slide key="worth">
            <ContentPage eyebrow="Worth the money?" title={title}>
              <div
                style={{
                  borderRadius: 17,
                  background: BASE.surface,
                  border: `1px solid ${BASE.border}`,
                  padding: "17px 18px",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: BASE.cream }}>
                  {x.worth[0]} {x.worth[1]}
                </div>
                <div style={{ fontSize: 13.5, color: BASE.creamDim, lineHeight: 1.64, marginTop: 9 }}>
                  {x.worth[2]}
                </div>
              </div>
            </ContentPage>
          </Slide>
        )
      }

      if (x.avoid) {
        slides.push(
          <Slide key="avoid">
            <ContentPage eyebrow="Avoid afterwards" title={title}>
              <DotList items={x.avoid} tone="#D65C4E" />
            </ContentPage>
          </Slide>
        )
      }

      if (x.note) {
        slides.push(
          <Slide key="note">
            <ContentPage eyebrow="Worth knowing" title={title}>
              <NurseNote>{x.note}</NurseNote>
            </ContentPage>
          </Slide>
        )
      }
    } else {
      if (x.do) {
        slides.push(
          <Slide key="do">
            <ContentPage eyebrow="Try this" title={title}>
              <DotList items={x.do} tone="#7FA054" />
            </ContentPage>
          </Slide>
        )
      }

      if (x.no) {
        slides.push(
          <Slide key="no">
            <ContentPage eyebrow="Skip this" title={title}>
              <DotList items={x.no} tone="#D65C4E" />
            </ContentPage>
          </Slide>
        )
      }
    }
  }

  if (kind === "wardrobe" && x.items && x.items.length) {
    slides.push(
      <Slide key="look">
        <ContentPage eyebrow="The look" title={title}>
          <DotList items={x.items} />
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 12.5,
              color: BASE.taupe,
              marginTop: 14,
            }}
          >
            Shoppable links can drop into this same card later without changing the layout.
          </div>
        </ContentPage>
      </Slide>
    )
  }

  return slides
}

function GlowFeedCard({ record, isSavedBloom, toggleSaveBloom }) {
  const { kind, topic: T, item: x } = record
  const meta = TYPE_META[kind] || TYPE_META.extra
  const title = titleOf(x)
  const teaser = teaserOf(x)
  const sid = `glow:${T.key}:${kind}:${idOf(x, 0)}`
  const saved = isSavedBloom ? isSavedBloom(sid) : false
  const slides = buildSlides(record)
  const img = x.img || x.image || null

  return (
    <div
      style={{
        borderRadius: 24,
        overflow: "hidden",
        border: `1px solid ${BASE.border}`,
        background: BASE.surface,
        marginBottom: 22,
        boxShadow: "0 12px 34px rgba(76,52,72,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          overflowX: "auto",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        <Slide>
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 5",
              overflow: "hidden",
              background: GRADS[T.key] || GRADS.skin,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {img ? (
              <img
                src={img}
                alt={title}
                loading="lazy"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            ) : (
              <>
                <div style={{ position: "absolute", top: "12%", right: "9%", fontSize: 84, opacity: 0.09 }}>{T.ic}</div>
                <div style={{ position: "absolute", bottom: "9%", left: "8%", fontSize: 66, opacity: 0.07 }}>{x.ic || meta.icon}</div>
                <span
                  style={{
                    fontSize: 72,
                    position: "relative",
                    filter: "drop-shadow(0 8px 18px rgba(80,55,76,0.10))",
                  }}
                >
                  {x.ic || T.ic || meta.icon}
                </span>
              </>
            )}

            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(8px)",
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: 1.3,
                  textTransform: "uppercase",
                  color: "#765266",
                }}
              >
                {meta.label}
              </span>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.68)",
                  backdropFilter: "blur(8px)",
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: 1.1,
                  textTransform: "uppercase",
                  color: "#8C6B7C",
                }}
              >
                {T.name}
              </span>
            </div>

            <span
              onClick={(e) => {
                e.stopPropagation()
                if (toggleSaveBloom) toggleSaveBloom(sid)
              }}
              style={{
                position: "absolute",
                top: 13,
                right: 14,
                width: 38,
                height: 38,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(8px)",
                color: saved ? "#C9558E" : "#9A7B8D",
                fontSize: 22,
                cursor: "pointer",
              }}
            >
              {saved ? "♥" : "♡"}
            </span>

            {slides.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 13,
                  right: 14,
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#6B4A5E",
                  fontStyle: "italic",
                  background: "rgba(255,255,255,0.78)",
                  backdropFilter: "blur(8px)",
                  padding: "6px 10px",
                  borderRadius: 999,
                }}
              >
                Swipe for details →
              </div>
            )}
          </div>

          <div style={{ padding: "16px 18px 20px" }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                fontWeight: 700,
                color: BASE.cream,
                lineHeight: 1.2,
              }}
            >
              {title}
            </div>

            {teaser && (
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontSize: 13.5,
                  color: BASE.taupe,
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                {teaser}
              </div>
            )}
          </div>
        </Slide>

        {slides}
      </div>
    </div>
  )
}

function TopicRail({ topicKey, onTopicChange }) {
  const choices = [{ key: null, ic: "✨", name: "For You" }, ...GLOW_TOPICS]

  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        padding: "2px 24px 8px",
        margin: "0 -24px",
        scrollSnapType: "x proximity",
        scrollbarWidth: "none",
      }}
    >
      {choices.map((T) => {
        const active = topicKey === T.key

        return (
          <div
            key={T.key || "all"}
            onClick={() => onTopicChange(T.key)}
            style={{
              flex: "0 0 auto",
              minWidth: 74,
              height: 72,
              borderRadius: 17,
              border: `1px solid ${active ? "rgba(201,85,142,0.38)" : BASE.border}`,
              background: active ? "rgba(201,85,142,0.10)" : BASE.surface,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              scrollSnapAlign: "start",
              cursor: "pointer",
              padding: "0 10px",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{T.ic}</span>

            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                whiteSpace: "nowrap",
                color: active ? "#C9558E" : BASE.creamDim,
              }}
            >
              {T.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function GlowDiscovery({
  topicKey,
  setTopicKey,
  isSavedBloom,
  toggleSaveBloom,
  tabs,
}) {
  const T = topicKey ? GLOW_BY_KEY(topicKey) : null
  const feed = T ? recordsForTopic(T) : mixedGlowFeed()

  return (
    <div className="fade-in" style={{ padding: "0 24px" }}>
      <div style={{ paddingTop: 48 }}>{tabs}</div>

      <div style={{ paddingTop: 8, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            fontWeight: 600,
            color: BASE.cream,
            lineHeight: 1.08,
            letterSpacing: 0.2,
          }}
        >
          Glow
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: 15,
            color: BASE.taupe,
            lineHeight: 1.4,
            marginTop: 10,
          }}
        >
          Feel beautiful. Know more.
        </div>
      </div>

      <div style={{ marginTop: 25 }}>
        <TopicRail topicKey={topicKey || null} onTopicChange={setTopicKey} />
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          marginBottom: 17,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.1,
          textTransform: "uppercase",
          color: BASE.taupe,
        }}
      >
        {T ? T.name : "For you"}
      </div>

      <div>
        {feed.map((record, i) => (
          <GlowFeedCard
            key={`${record.topic.key}:${record.kind}:${idOf(record.item, i)}`}
            record={record}
            isSavedBloom={isSavedBloom}
            toggleSaveBloom={toggleSaveBloom}
          />
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          color: BASE.taupe,
          textAlign: "center",
          fontStyle: "italic",
          lineHeight: 1.6,
          margin: "8px 12px 12px",
        }}
      >
        General beauty and wellness education. Health-related guidance is informational, not individualized medical advice.
      </div>

      <div style={{ height: 44, paddingBottom: "env(safe-area-inset-bottom)" }} />
    </div>
  )
}
