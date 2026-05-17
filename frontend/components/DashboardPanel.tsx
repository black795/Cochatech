"use client"

import type { KallpaAnalysis } from "@/types/kallpa"
import KPICards from "@/frontend/components/KPICards"
import EquilibriumBadge from "@/frontend/components/EquilibriumBadge"
import CostsTable from "@/frontend/components/CostsTable"
import CostsPieChart from "@/frontend/components/CostsPieChart"
import KallpaInsightCard from "@/frontend/components/KallpaInsightCard"
import RecommendationsCard from "@/frontend/components/RecommendationsCard"

export default function DashboardPanel({ analysis }: { analysis: KallpaAnalysis | null }) {
  if (!analysis) {
    return (
      <div
        style={{
          height: "100%",
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--green-pale)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 12,
          }}
        >
          📊
        </div>
        <p style={{ fontWeight: 700, color: "var(--text-mid)", fontSize: 15 }}>
          Tu análisis aparecerá acá
        </p>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, maxWidth: 260, lineHeight: 1.6 }}>
          Contale a Kallpa de tu negocio en el chat. Cuando tenga suficiente info, vas a ver acá tus KPIs, gráficos y consejos.
        </p>
      </div>
    )
  }

  const { dashboard_data, financial_indicators, excel_simulation } = analysis
  const {
    emprendedora,
    charts,
    supera_punto_equilibrio,
    kallpa_insight,
    producto_singular,
    producto_plural,
    ventas_actuales_mes,
  } = dashboard_data

  return (
    <div
      className="animate-fadeIn"
      style={{
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        paddingRight: 2,
      }}
    >
      {/* Business header card */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--green-deep) 0%, var(--green-mid) 100%)",
          borderRadius: "var(--radius-xl)",
          padding: "20px 22px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: 10,
            fontWeight: 800,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {emprendedora.fecha_analisis}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 100,
            padding: "3px 10px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--green-light)",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--green-light)",
              animation: "pulseDot 2s ease-in-out infinite",
            }}
          />
          Negocio activo
        </div>

        <h2
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 20,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 4,
          }}
        >
          {emprendedora.nombre}
        </h2>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
          {emprendedora.rubro}&nbsp;·&nbsp;{emprendedora.ciudad}
        </p>
      </div>

      <KPICards
        indicators={financial_indicators}
        productoSingular={producto_singular}
        productoPlural={producto_plural}
      />

      <EquilibriumBadge
        progress={charts.equilibrio_progress}
        supera={supera_punto_equilibrio}
        productoPlural={producto_plural}
      />

      {!supera_punto_equilibrio && (
        <RecommendationsCard
          indicators={financial_indicators}
          ventasActuales={ventas_actuales_mes}
          productoPlural={producto_plural}
        />
      )}

      <CostsPieChart data={charts.distribucion_costos} />

      <CostsTable items={excel_simulation} />

      <KallpaInsightCard insight={kallpa_insight} />
    </div>
  )
}
