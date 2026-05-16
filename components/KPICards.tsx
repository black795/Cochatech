"use client"

import type { FinancialIndicators } from "@/types/kallpa"

type Card = {
  label: string
  value: string
  subtitle: string
  borderColor: string
}

export default function KPICards({
  indicators,
}: {
  indicators: FinancialIndicators
}) {
  const cards: Card[] = [
    {
      label: "Costos Fijos Totales",
      value: `Bs ${indicators.costos_fijos_totales}`,
      subtitle: "Gastos fijos al mes",
      borderColor: "#2D6A4F",
    },
    {
      label: "Costo Variable por Unidad",
      value: `Bs ${indicators.costos_variables_unitarios}`,
      subtitle: "Costo de producir 1 torta",
      borderColor: "#E76F51",
    },
    {
      label: "Precio de Venta",
      value: `Bs ${indicators.precio_de_venta}`,
      subtitle: "Precio por torta",
      borderColor: "#E9C46A",
    },
    {
      label: "Margen de Ganancia",
      value: `${indicators.margen_ganancia_porcentual}%`,
      subtitle: "Margen por unidad vendida",
      borderColor: "#2D6A4F",
    },
    {
      label: "Punto de Equilibrio",
      value: `${indicators.punto_de_equilibrio_unidades} unidades/mes`,
      subtitle: "Mínimo para no perder",
      borderColor: "#E76F51",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-xl shadow-sm p-4"
          style={{ borderLeft: `4px solid ${card.borderColor}` }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#374151]">{card.value}</p>
          <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
        </div>
      ))}
    </div>
  )
}
