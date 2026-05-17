"use client"

import type { EquilibriumProgress } from "@/types/kallpa"

export default function EquilibriumBadge({
  progress,
  supera,
  productoPlural = "unidades",
}: {
  progress: EquilibriumProgress
  supera: boolean
  productoPlural?: string
}) {
  const { ventas_actuales, punto_equilibrio, porcentaje_avance, excedente_unidades } = progress
  const barPct = Math.min(100, porcentaje_avance)

  const bg = supera
    ? "linear-gradient(135deg, #1a6b4a 0%, #0a4a32 100%)"
    : "linear-gradient(135deg, #b85c0a 0%, #7a3a00 100%)"
  const barGradient = supera
    ? "linear-gradient(90deg, #75daa8, #b1f0ce)"
    : "linear-gradient(90deg, #f4a261, #ffd6a5)"
  const accentColor = supera ? "#b1f0ce" : "#ffd6a5"

  return (
    <div
      style={{
        background: bg,
        borderRadius: "var(--radius-xl)",
        padding: "20px 22px",
      }}
    >
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{supera ? "🎉" : "⚠️"}</span>
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 17,
            fontWeight: 900,
            color: "#fff",
            margin: 0,
          }}
        >
          {supera ? "¡Estás en ganancia, pues!" : "Necesitás vender más unidades nomás"}
        </h3>
      </div>

      {/* Stats */}
      <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", marginBottom: 14 }}>
        Vendés {ventas_actuales} · Equilibrio en {punto_equilibrio} · Excedente:{" "}
        <strong style={{ color: accentColor }}>
          {excedente_unidades} {productoPlural}
        </strong>
      </p>

      {/* Bar + percentage */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 100,
            height: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 100,
              width: `${barPct}%`,
              background: barGradient,
              animation: "barFill 1.2s cubic-bezier(0.4,0,0.2,1) both 0.3s",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {porcentaje_avance}%
        </span>
      </div>
    </div>
  )
}
