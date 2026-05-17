"use client"

import type { KallpaAnalysis } from "@/types/kallpa"
import KPICards from "@/frontend/components/KPICards"
import EquilibriumBadge from "@/frontend/components/EquilibriumBadge"
import CostsTable from "@/frontend/components/CostsTable"
import CostsPieChart from "@/frontend/components/CostsPieChart"
import KallpaInsightCard from "@/frontend/components/KallpaInsightCard"
import RecommendationsCard from "@/frontend/components/RecommendationsCard"

export default function DashboardPanel({
  analysis,
}: {
  analysis: KallpaAnalysis | null
}) {
  if (!analysis) {
    return (
      <div className="h-full bg-white rounded-xl shadow-sm flex flex-col items-center justify-center p-6 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3"
          style={{ backgroundColor: "#F8F5F0" }}
          aria-hidden
        >
          📊
        </div>
        <p className="font-semibold text-gray-700">
          Tu análisis aparecerá acá
        </p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Contale a Kallpa de tu negocio en el chat. Cuando tenga suficiente
          info, vas a ver acá tus KPIs, gráficos y consejos.
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
    <div className="h-full bg-white rounded-xl shadow-sm overflow-y-auto p-4 space-y-4 animate-fadeIn">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-bold text-[#374151]">{emprendedora.nombre}</h2>
        <p className="text-sm text-gray-600">
          {emprendedora.rubro} · {emprendedora.ciudad}
        </p>
        <p className="text-xs text-gray-400">
          Análisis del {emprendedora.fecha_analisis}
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
