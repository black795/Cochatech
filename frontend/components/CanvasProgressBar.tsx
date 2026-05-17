"use client"

import type { CanvasProgress, CanvasType } from "@/types/kallpa"

const CANVAS_LABELS: Record<string, { emoji: string; label: string }> = {
  business_model_canvas: { emoji: "📋", label: "Business Model Canvas" },
  lean_canvas:           { emoji: "🚀", label: "Lean Canvas" },
  value_proposition:     { emoji: "💎", label: "Propuesta de Valor" },
  jobs_to_be_done:       { emoji: "🎯", label: "Jobs To Be Done" },
}

export default function CanvasProgressBar({
  progress,
  canvasType,
}: {
  progress: CanvasProgress | null
  canvasType: CanvasType | null
}) {
  if (!progress) return null

  const pct = Math.max(0, Math.min(100, progress.porcentaje ?? 0))
  const isComplete = progress.listo_para_generar === true
  const badge = canvasType ? (CANVAS_LABELS[canvasType] ?? { emoji: "🔍", label: "Detectando…" }) : { emoji: "🔍", label: "Detectando…" }

  const checkItems =
    progress.campos_completos.length > 0
      ? progress.campos_completos.map((f) => ({ label: f.label, done: f.completo }))
      : progress.campos_faltantes.length > 0
        ? [
            ...Array.from({ length: Math.round((pct / 100) * (progress.campos_faltantes.length + Math.round((pct / 100) * 5))) }).map((_, i) => ({ label: `Campo ${i + 1}`, done: true })),
            ...progress.campos_faltantes.map((f) => ({ label: f, done: false })),
          ]
        : []

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "var(--radius-lg)",
        padding: 18,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Canvas type pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "var(--green-pale)",
          border: "1.5px solid var(--green-light)",
          borderRadius: 100,
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 800,
          color: "var(--green-mid)",
          letterSpacing: "0.04em",
          alignSelf: "flex-start",
        }}
      >
        <span>{badge.emoji}</span>
        {badge.label}
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mid)" }}>
            Progreso del análisis estratégico
          </span>
          <span
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 16,
              fontWeight: 900,
              color: "var(--green-mid)",
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            background: "var(--green-pale)",
            borderRadius: 100,
            height: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, var(--green-mid), var(--green-bright))",
              height: "100%",
              borderRadius: 100,
              width: `${pct}%`,
              animation: "barFill 1.4s cubic-bezier(0.4,0,0.2,1) both 0.6s",
            }}
          />
        </div>
      </div>

      {/* Checklist */}
      {checkItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {checkItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  flexShrink: 0,
                  background: item.done ? "var(--green-bright)" : "var(--surface)",
                  border: item.done ? "none" : "1.5px solid var(--border)",
                  color: item.done ? "#fff" : "var(--text-muted)",
                }}
              >
                {item.done ? "✓" : "·"}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: item.done ? "var(--text-mid)" : "var(--text-muted)",
                  opacity: item.done ? 1 : 0.6,
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Missing fields fallback */}
      {checkItems.length === 0 && !isComplete && progress.campos_faltantes.length > 0 && (
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
          Falta:{" "}
          <span style={{ color: "var(--text-mid)" }}>{progress.campos_faltantes.join(", ")}</span>
        </p>
      )}

      {/* Ready message */}
      {isComplete && (
        <div
          style={{
            background: "var(--green-pale)",
            border: "1.5px solid var(--green-light)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            fontWeight: 800,
            color: "var(--green-mid)",
          }}
        >
          <span style={{ fontSize: 16 }}>✅</span>
          ¡Canvas listo! Generando tu análisis estratégico…
        </div>
      )}
    </div>
  )
}
