"use client"

import type { CanvasProgress, CanvasType } from "@/types/kallpa"

type BadgeStyle = {
  emoji: string
  label: string
  bg: string
  text: string
}

function badgeFor(type: CanvasType | null): BadgeStyle {
  switch (type) {
    case "business_model_canvas":
      return {
        emoji: "📋",
        label: "Business Model Canvas",
        bg: "#2D6A4F",
        text: "#FFFFFF",
      }
    case "lean_canvas":
      return {
        emoji: "🚀",
        label: "Lean Canvas",
        bg: "#1E40AF",
        text: "#FFFFFF",
      }
    case "value_proposition":
      return {
        emoji: "💎",
        label: "Propuesta de Valor",
        bg: "#E76F51",
        text: "#FFFFFF",
      }
    case "jobs_to_be_done":
      return {
        emoji: "🎯",
        label: "Jobs To Be Done",
        bg: "#7C3AED",
        text: "#FFFFFF",
      }
    default:
      return {
        emoji: "🔍",
        label: "Detectando tipo de negocio…",
        bg: "#9CA3AF",
        text: "#FFFFFF",
      }
  }
}

export default function CanvasProgressBar({
  progress,
  canvasType,
}: {
  progress: CanvasProgress | null
  canvasType: CanvasType | null
}) {
  if (!progress) return null

  const badge = badgeFor(canvasType)
  const pct = Math.max(0, Math.min(100, progress.porcentaje ?? 0))
  const isComplete = progress.listo_para_generar === true

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          <span aria-hidden>{badge.emoji}</span>
          <span>{badge.label}</span>
        </span>
      </div>

      <div>
        <div
          className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: "#2D6A4F" }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-600">{pct}% completado</p>
      </div>

      {pct < 100 && progress.campos_faltantes.length > 0 && (
        <p className="text-xs text-gray-500">
          Falta:{" "}
          <span className="text-gray-700">
            {progress.campos_faltantes.join(", ")}
          </span>
        </p>
      )}

      {isComplete && (
        <p className="text-sm font-semibold text-[#2D6A4F] flex items-center gap-1">
          <span aria-hidden>✅</span>
          ¡Canvas listo! Generando tu análisis estratégico…
        </p>
      )}
    </div>
  )
}
