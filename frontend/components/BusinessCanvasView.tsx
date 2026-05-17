"use client"

import type { BusinessCanvas, CanvasProgress, CanvasType } from "@/types/kallpa"

// ─── Canvas block ─────────────────────────────────────────────────────────────

function Block({
  title,
  text,
  bg,
  textColor = "#374151",
  className = "",
}: {
  title: string
  text: string
  bg: string
  textColor?: string
  className?: string
}) {
  return (
    <div
      className={`rounded-lg p-3 flex flex-col gap-1.5 ${className}`}
      style={{ backgroundColor: bg, color: textColor }}
    >
      <h4 className="text-xs font-bold uppercase tracking-wide opacity-80">{title}</h4>
      <p className="text-sm leading-snug whitespace-pre-line">
        {text || <span className="italic opacity-50">(pendiente)</span>}
      </p>
    </div>
  )
}

// ─── Canvas progress section ──────────────────────────────────────────────────

const CANVAS_LABELS: Record<string, { emoji: string; label: string }> = {
  business_model_canvas: { emoji: "📋", label: "Business Model Canvas" },
  lean_canvas:           { emoji: "🚀", label: "Lean Canvas" },
  value_proposition:     { emoji: "💎", label: "Propuesta de Valor" },
  jobs_to_be_done:       { emoji: "🎯", label: "Jobs To Be Done" },
}

function ProgressSection({
  progress,
  tipo,
}: {
  progress: CanvasProgress
  tipo: CanvasType | null
}) {
  const pct = Math.max(0, Math.min(100, progress.porcentaje ?? 0))
  const isComplete = progress.listo_para_generar === true
  const resolvedType = tipo ?? progress.tipo
  const badge = resolvedType
    ? (CANVAS_LABELS[resolvedType] ?? { emoji: "🔍", label: "Detectando…" })
    : { emoji: "🔍", label: "Detectando…" }

  const checkItems: { label: string; done: boolean }[] =
    progress.campos_completos.length > 0
      ? progress.campos_completos.map((f) => ({ label: f.label, done: f.completo }))
      : progress.campos_faltantes.map((f) => ({ label: f, done: false }))

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "var(--radius-lg)",
        padding: 18,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Type pill */}
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
          marginBottom: 14,
          letterSpacing: "0.04em",
        }}
      >
        <span>{badge.emoji}</span>
        {badge.label}
      </div>

      {/* Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
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
          marginBottom: 14,
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

      {/* Checklist */}
      {checkItems.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
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

      {/* Missing fields (when no detailed checklist) */}
      {checkItems.length === 0 && !isComplete && progress.campos_faltantes.length > 0 && (
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 14 }}>
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

// ─── Canvas view variants ─────────────────────────────────────────────────────

function getCriterio(seccion?: { criterios?: { nombre: string; respuesta: string }[] }): string {
  return seccion?.criterios?.[0]?.respuesta ?? ""
}

function BMCView({ canvas }: { canvas: BusinessCanvas }) {
  const socios = canvas.asociacionesClaves?.socios?.[0]?.aporte ?? ""
  const ingresos =
    (canvas.fuentesIngresos?.lineas ?? [])
      .map((l) => (l.producto ? `${l.producto}${l.precioEstimado ? ` (Bs ${l.precioEstimado})` : ""}` : ""))
      .filter(Boolean)
      .join(" · ") || ""
  const costos =
    (canvas.estructuraCostos?.costos ?? [])
      .filter((c) => c.concepto)
      .map((c) => `${c.concepto} (${c.tipo || "N/A"})`)
      .join(" · ") || ""

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Block title="Asociaciones Claves" text={socios} bg="#EBF5EB" />
      <Block title="Actividades Claves" text={getCriterio(canvas.actividadesClaves)} bg="#EBF5EB" />
      <Block title="Segmentos de Clientes" text={getCriterio(canvas.segmentosClientes)} bg="#FFF3E0" />
      <Block title="Recursos Claves" text={getCriterio(canvas.recursosClaves)} bg="#EBF5EB" />
      <Block title="Propuesta de Valor" text={getCriterio(canvas.propuestaValor)} bg="#2D6A4F" textColor="#FFFFFF" />
      <Block title="Relación con Clientes" text={getCriterio(canvas.relacionClientes)} bg="#FFF3E0" />
      <Block title="Estructura de Costos" text={costos} bg="#FAFAFA" />
      <Block title="Fuentes de Ingreso" text={ingresos} bg="#E8F5E9" />
      <Block title="Canales" text={getCriterio(canvas.canales)} bg="#F3E5F5" />
    </div>
  )
}

function LeanView({ canvas }: { canvas: BusinessCanvas }) {
  const lc = canvas.leanCanvas
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Block title="Problema" text={lc?.problema ?? ""} bg="#E3F2FD" />
      <Block title="Solución" text={lc?.solucion ?? ""} bg="#E3F2FD" />
      <Block title="Propuesta de Valor Única" text={lc?.propuestaValorUnica ?? ""} bg="#E3F2FD" />
      <Block title="Métricas Clave" text={lc?.metricasClave ?? ""} bg="#F1F8E9" />
      <Block title="Ventaja Competitiva" text={lc?.ventajaCompetitiva ?? ""} bg="#2D6A4F" textColor="#FFFFFF" />
      <Block title="Canales" text={lc?.canales ?? ""} bg="#FFF3E0" />
      <Block title="Estructura de Costos" text={lc?.estructuraCostos ?? ""} bg="#F1F8E9" />
      <Block title="Fuentes de Ingreso" text={lc?.fuentesIngreso ?? ""} bg="#F1F8E9" />
      <Block title="Segmento de Clientes" text={lc?.segmentoClientes ?? ""} bg="#FFF3E0" />
    </div>
  )
}

function ValuePropositionView({ canvas }: { canvas: BusinessCanvas }) {
  const vp = canvas.valueProposition
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#E3F2FD" }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">Buyer Persona</h3>
        <Block title="🔧 Trabajos del Cliente" text={vp?.buyerPersona.trabajosCliente ?? ""} bg="#FFFFFF" />
        <Block title="😤 Frustraciones" text={vp?.buyerPersona.frustraciones ?? ""} bg="#FFFFFF" />
        <Block title="😊 Alegrías" text={vp?.buyerPersona.alegrias ?? ""} bg="#FFFFFF" />
      </div>
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#E8F5E9" }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-green-900">Propuesta de Valor</h3>
        <Block title="📦 Productos y Servicios" text={vp?.propuestaValor.productosServicios ?? ""} bg="#FFFFFF" />
        <Block title="💊 Aliviador de Frustraciones" text={vp?.propuestaValor.aliviadorFrustraciones ?? ""} bg="#FFFFFF" />
        <Block title="✨ Generador de Alegrías" text={vp?.propuestaValor.generadorAlegrias ?? ""} bg="#FFFFFF" />
      </div>
    </div>
  )
}

function JobsToBeDoneView({ canvas }: { canvas: BusinessCanvas }) {
  const j = canvas.jobsToBeDone
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Block title="Persona" text={j?.persona ?? ""} bg="#EBF5EB" />
      <Block title="Dolor / Problema" text={j?.dolorProblema ?? ""} bg="#FFF3E0" />
      <Block title="Solución / Resultado" text={j?.solucionResultado ?? ""} bg="#E3F2FD" />
      <Block title="Job Funcional" text={j?.jobFuncional ?? ""} bg="#F1F8E9" />
      <Block title="Job Social" text={j?.jobSocial ?? ""} bg="#FFF3E0" />
      <Block title="Job Emocional" text={j?.jobEmocional ?? ""} bg="#F3E5F5" />
      <Block title="Necesidad Básica" text={j?.necesidadBasica ?? ""} bg="#FAFAFA" />
      <Block title="Propuesta de Valor Clave" text={j?.propuestaValorChave ?? ""} bg="#2D6A4F" textColor="#FFFFFF" className="md:col-span-2" />
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function BusinessCanvasView({
  canvas,
  tipo,
  progress,
}: {
  canvas: BusinessCanvas | null
  tipo: CanvasType | null
  progress?: CanvasProgress | null
}) {
  if (!canvas && !progress) return null

  const resolvedTipo = tipo ?? progress?.tipo ?? null

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress section — always shown when available */}
      {progress && <ProgressSection progress={progress} tipo={resolvedTipo} />}

      {/* Canvas grid — shown when canvas is ready */}
      {canvas && resolvedTipo && resolvedTipo !== "unknown" && (
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-[#374151]">
              {
                {
                  business_model_canvas: "📋 Business Model Canvas",
                  lean_canvas: "🚀 Lean Canvas",
                  value_proposition: "💎 Propuesta de Valor",
                  jobs_to_be_done: "🎯 Jobs To Be Done",
                  unknown: "Canvas estratégico",
                }[resolvedTipo]
              }
            </h3>
            <button
              onClick={() => { if (typeof window !== "undefined") window.print() }}
              className="print:hidden px-3 py-1.5 text-sm rounded-lg text-white font-medium"
              style={{ backgroundColor: "#2D6A4F" }}
            >
              Exportar PDF
            </button>
          </div>

          {resolvedTipo === "business_model_canvas" && <BMCView canvas={canvas} />}
          {resolvedTipo === "lean_canvas" && <LeanView canvas={canvas} />}
          {resolvedTipo === "value_proposition" && <ValuePropositionView canvas={canvas} />}
          {resolvedTipo === "jobs_to_be_done" && <JobsToBeDoneView canvas={canvas} />}
        </div>
      )}
    </div>
  )
}
