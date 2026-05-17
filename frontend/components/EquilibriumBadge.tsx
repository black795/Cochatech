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
  const {
    ventas_actuales,
    punto_equilibrio,
    porcentaje_avance,
    excedente_unidades,
  } = progress

  const containerCls = supera
    ? "bg-green-50 border-green-200"
    : "bg-yellow-50 border-yellow-200"
  const textCls = supera ? "text-green-700" : "text-yellow-700"
  const icon = supera ? "✅" : "⚠️"
  const message = supera
    ? "¡Estás en ganancia, pues!"
    : "Necesitás vender más unidades nomás"
  const barColor = supera ? "#2D6A4F" : "#E76F51"

  return (
    <div className={`${containerCls} border rounded-xl p-5 shadow-sm`}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-2xl"
          role="img"
          aria-label={supera ? "ok" : "warning"}
        >
          {icon}
        </span>
        <h3 className={`font-bold text-lg ${textCls}`}>{message}</h3>
      </div>
      <p className="text-sm text-gray-700 mb-3">
        Vendés <strong>{ventas_actuales}</strong> {productoPlural} · Necesitás{" "}
        <strong>{punto_equilibrio}</strong> {productoPlural} · Excedente:{" "}
        <strong>{excedente_unidades}</strong> {productoPlural}
      </p>
      <div
        className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={porcentaje_avance}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${Math.max(0, Math.min(100, porcentaje_avance))}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {porcentaje_avance}% del punto de equilibrio
      </p>
    </div>
  )
}
