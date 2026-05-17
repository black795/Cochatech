"use client"

import type { FinancialIndicators } from "@/types/kallpa"

export default function RecommendationsCard({
  indicators,
  ventasActuales,
  productoPlural = "unidades",
}: {
  indicators: FinancialIndicators
  ventasActuales: number
  productoPlural?: string
}) {
  const gap =
    indicators.punto_de_equilibrio_unidades - ventasActuales
  if (gap <= 0) return null

  const ticketPromedio = indicators.precio_de_venta
  const ingresoFaltante = gap * indicators.margen_ganancia_unitario

  const recs = [
    {
      icono: "🤝",
      titulo: "Apuntá al cliente corporativo / mayorista",
      detalle: `Un pedido B2B de ${Math.max(
        Math.ceil(gap / 2),
        5
      )} ${productoPlural} de una sola vez te cubre la mitad del faltante. Ofrecé paquetes a oficinas, eventos o tiendas que revenden.`,
    },
    {
      icono: "🎁",
      titulo: "Descuentos por volumen para subir el ticket",
      detalle: `Promoción tipo "3 ${productoPlural} a Bs ${(
        ticketPromedio * 3 -
        ticketPromedio * 0.1 * 3
      ).toFixed(2)}" (10% off comprando 3). Subís el ticket promedio sin tocar tus costos fijos.`,
    },
    {
      icono: "📲",
      titulo: "Acelerá ventas por canales digitales",
      detalle:
        "Stories de WhatsApp Business con catálogo, pedidos automáticos por Marketplace de Facebook, y un grupo de WhatsApp con clientas frecuentes para anunciar nuevos lotes.",
    },
  ]

  return (
    <div
      className="rounded-xl shadow-sm p-5 border-l-4"
      style={{
        backgroundColor: "#FFFBEB",
        borderLeftColor: "#E76F51",
      }}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl" aria-hidden>
          💡
        </span>
        <div>
          <h3 className="font-bold text-[#374151]">
            Recomendaciones para llegar al equilibrio
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Te faltan <strong>{gap}</strong> {productoPlural} al mes para cubrir
            tus costos fijos · ~Bs {ingresoFaltante.toFixed(0)} en margen
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {recs.map((r) => (
          <li key={r.titulo} className="flex gap-2.5">
            <span className="text-lg flex-shrink-0" aria-hidden>
              {r.icono}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#374151]">
                {r.titulo}
              </p>
              <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                {r.detalle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
