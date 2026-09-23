import { BASE } from '../lib/theme.js'

export function renderMore(ctx) {
  const {
    tab,
    moreView,
    setMoreView,
    setTab,
    setBodyView,
    setEditCycle,
    firstName,
    handleLogout,
  } = ctx

  if (tab !== "more") return null

  const ink = "#3D2545"
  const muted = "#8E6C88"
  const pink = "#C9558E"
  const border = "rgba(92,64,92,0.10)"
  const card = "rgba(255,255,255,0.78)"

  const Back = () => (
    <button
      onClick={() => setMoreView("menu")}
      style={{
        border: "none",
        background: "transparent",
        color: muted,
        padding: "0 0 18px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {"‹"} Back to More
    </button>
  )

  const Shell = ({ children }) => (
    <div
      className="fade-in"
      style={{
        minHeight: "100vh",
        padding: "54px 20px 28px",
        color: ink,
        background: "linear-gradient(180deg,#FFF9F7 0%,#FBF1F5 100%)",
      }}
    >
      {children}
    </div>
  )

  const DetailTitle = ({ title, sub }) => (
    <div style={{ marginBottom: 22 }}>
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 31,
          lineHeight: 1.05,
          fontWeight: 600,
          margin: 0,
          color: ink,
        }}
      >
        {title}
      </h1>
      {sub && (
        <p style={{ margin: "7px 0 0", color: muted, fontSize: 13.5, lineHeight: 1.55 }}>
          {sub}
        </p>
      )}
    </div>
  )

  const InfoCard = ({ children }) => (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        background: card,
        border: `1px solid ${border}`,
        boxShadow: "0 8px 28px rgba(84,52,88,0.06)",
        fontSize: 14,
        lineHeight: 1.65,
        color: "#5A4458",
      }}
    >
      {children}
    </div>
  )

  if (moreView === "plus") {
    return (
      <Shell>
        <Back />
        <DetailTitle
          title="True Reverie+"
          sub="Go deeper with the experiences, programs, and tools inside True Reverie."
        />
        <div
          style={{
            padding: 22,
            borderRadius: 24,
            background: "linear-gradient(135deg,rgba(233,132,180,0.18),rgba(168,123,209,0.18))",
            border: "1px solid rgba(201,85,142,0.14)",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 800, color: pink, marginBottom: 8 }}>
            TRUE REVERIE+
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 25,
              fontWeight: 600,
              lineHeight: 1.15,
              marginBottom: 9,
            }}
          >
            More room to become her.
          </div>
          <p style={{ margin: 0, color: "#5A4458", fontSize: 14, lineHeight: 1.65 }}>
            Your membership home is coming next. This will be where you can see what True Reverie+
            unlocks, manage access, and restore a subscription.
          </p>
        </div>
      </Shell>
    )
  }

  if (moreView === "contact") {
    return (
      <Shell>
        <Back />
        <DetailTitle title="Contact & feedback" sub="Questions, ideas, or something not working?" />
        <InfoCard>
          <div style={{ fontWeight: 800, color: ink, marginBottom: 5 }}>True Reverie</div>
          <div>truereverieco@gmail.com</div>
        </InfoCard>
      </Shell>
    )
  }

  if (moreView === "legal") {
    return (
      <Shell>
        <Back />
        <DetailTitle title="Privacy & terms" sub="The legal home for True Reverie." />
        <InfoCard>
          Privacy Policy and Terms of Use will live here in the production app. We’ll wire the final
          documents during the production/Supabase pass.
        </InfoCard>
      </Shell>
    )
  }

  const Row = ({ icon, title, sub, onClick, danger = false }) => (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "15px 16px",
        border: "none",
        borderBottom: `1px solid ${border}`,
        background: "transparent",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          flex: "0 0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: danger ? "rgba(178,75,86,0.08)" : "rgba(201,85,142,0.08)",
          fontSize: 17,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ color: danger ? "#A94C59" : ink, fontSize: 14, fontWeight: 800 }}>{title}</div>
        {sub && <div style={{ color: muted, fontSize: 11.5, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>}
      </div>
      {!danger && <div style={{ color: "#B79AAA", fontSize: 20, lineHeight: 1 }}>{"›"}</div>}
    </button>
  )

  const Group = ({ label, children }) => (
    <section style={{ marginTop: 22 }}>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: 1.8,
          color: "#A97FA0",
          margin: "0 4px 8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          overflow: "hidden",
          borderRadius: 20,
          background: card,
          border: `1px solid ${border}`,
          boxShadow: "0 8px 28px rgba(84,52,88,0.05)",
        }}
      >
        {children}
      </div>
    </section>
  )

  return (
    <Shell>
      <div style={{ marginBottom: 25 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 34,
            fontWeight: 600,
            lineHeight: 1,
            margin: 0,
            color: ink,
          }}
        >
          More
        </h1>
        <p style={{ margin: "7px 0 0", color: muted, fontSize: 13.5 }}>
          Account, membership, and support.
        </p>
      </div>

      <div
        style={{
          padding: "18px 19px",
          borderRadius: 22,
          background: "linear-gradient(135deg,rgba(233,132,180,0.17),rgba(168,123,209,0.17))",
          border: "1px solid rgba(201,85,142,0.12)",
        }}
      >
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.8, color: pink, marginBottom: 5 }}>
          TRUE REVERIE
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24,
            fontWeight: 600,
            color: ink,
          }}
        >
          {firstName && firstName !== "friend" ? firstName : "Your Reverie"}
        </div>
      </div>

      <Group label="MEMBERSHIP">
        <Row
          icon="✦"
          title="True Reverie+"
          sub="Membership, premium experiences, and access."
          onClick={() => setMoreView("plus")}
        />
      </Group>

      <Group label="BODY">
        <Row
          icon="☾"
          title="Cycle settings"
          sub="Cycle length and period tracking settings."
          onClick={() => {
            setBodyView("cycle")
            setTab("body")
            setEditCycle(true)
          }}
        />
      </Group>

      <Group label="SUPPORT">
        <Row
          icon="♡"
          title="Contact & feedback"
          sub="Questions, ideas, or help."
          onClick={() => setMoreView("contact")}
        />
        <Row
          icon="○"
          title="Privacy & terms"
          onClick={() => setMoreView("legal")}
        />
      </Group>

      <Group label="ACCOUNT">
        <Row icon="↪" title="Log Out" danger onClick={handleLogout} />
      </Group>

      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          color: "#B79AAA",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic",
          fontSize: 13,
        }}
      >
        Dream Her. Become Her.
      </div>
    </Shell>
  )
}
