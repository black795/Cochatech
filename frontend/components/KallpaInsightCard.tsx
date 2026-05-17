"use client"

const FALLBACK_INSIGHT =
  "¡Tu negocio ya está tomando forma, pues! De a poco vamos ordenando los números nomás."

export default function KallpaInsightCard({ insight }: { insight: string }) {
  const text = insight && insight.trim().length > 10 ? insight : FALLBACK_INSIGHT

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      {/* Avatar */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--green-mid), var(--green-deep))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          fontWeight: 900,
          color: "#fff",
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(10,74,50,0.3)",
        }}
      >
        KA
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 6,
          }}
        >
          Kallpa · Asesor Financiero Digital
        </p>
        <div
          style={{
            background: "#fff",
            border: "1.5px solid var(--border)",
            borderRadius: "4px 16px 16px 16px",
            padding: "16px 18px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-dark)",
              lineHeight: 1.65,
              whiteSpace: "pre-line",
            }}
          >
            {text}
          </p>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textAlign: "right",
              marginTop: 8,
            }}
          >
            Análisis automático ✓✓
          </p>
        </div>
      </div>
    </div>
  )
}
