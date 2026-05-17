"use client"

import type { BusinessCanvas, CanvasType } from "@/types/kallpa"

function getCriterio(
  seccion?: { criterios?: { nombre: string; respuesta: string }[] }
): string {
  return seccion?.criterios?.[0]?.respuesta ?? ""
}

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
      <h4 className="text-xs font-bold uppercase tracking-wide opacity-80">
        {title}
      </h4>
      <p className="text-sm leading-snug whitespace-pre-line">
        {text || (
          <span className="italic opacity-50">(pendiente)</span>
        )}
      </p>
    </div>
  )
}

function BMCView({ canvas }: { canvas: BusinessCanvas }) {
  const socios =
    canvas.asociacionesClaves?.socios?.[0]?.aporte ?? ""
  const ingresos =
    (canvas.fuentesIngresos?.lineas ?? [])
      .map((l) =>
        l.producto
          ? `${l.producto}${l.precioEstimado ? ` (Bs ${l.precioEstimado})` : ""}`
          : ""
      )
      .filter(Boolean)
      .join(" · ") || ""
  const costos =
    (canvas.estructuraCostos?.costos ?? [])
      .filter((c) => c.concepto)
      .map((c) => `${c.concepto} (${c.tipo || "N/A"})`)
      .join(" · ") || ""

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Block
        title="Asociaciones Claves"
        text={socios}
        bg="#EBF5EB"
      />
      <Block
        title="Actividades Claves"
        text={getCriterio(canvas.actividadesClaves)}
        bg="#EBF5EB"
      />
      <Block
        title="Segmentos de Clientes"
        text={getCriterio(canvas.segmentosClientes)}
        bg="#FFF3E0"
      />

      <Block
        title="Recursos Claves"
        text={getCriterio(canvas.recursosClaves)}
        bg="#EBF5EB"
      />
      <Block
        title="Propuesta de Valor"
        text={getCriterio(canvas.propuestaValor)}
        bg="#2D6A4F"
        textColor="#FFFFFF"
      />
      <Block
        title="Relación con Clientes"
        text={getCriterio(canvas.relacionClientes)}
        bg="#FFF3E0"
      />

      <Block title="Estructura de Costos" text={costos} bg="#FAFAFA" />
      <Block title="Fuentes de Ingreso" text={ingresos} bg="#E8F5E9" />
      <Block
        title="Canales"
        text={getCriterio(canvas.canales)}
        bg="#F3E5F5"
      />
    </div>
  )
}

function LeanView({ canvas }: { canvas: BusinessCanvas }) {
  const lc = canvas.leanCanvas
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Block title="Problema" text={lc?.problema ?? ""} bg="#E3F2FD" />
      <Block title="Solución" text={lc?.solucion ?? ""} bg="#E3F2FD" />
      <Block
        title="Propuesta de Valor Única"
        text={lc?.propuestaValorUnica ?? ""}
        bg="#E3F2FD"
      />

      <Block title="Métricas Clave" text={lc?.metricasClave ?? ""} bg="#F1F8E9" />
      <Block
        title="Ventaja Competitiva"
        text={lc?.ventajaCompetitiva ?? ""}
        bg="#2D6A4F"
        textColor="#FFFFFF"
      />
      <Block title="Canales" text={lc?.canales ?? ""} bg="#FFF3E0" />

      <Block
        title="Estructura de Costos"
        text={lc?.estructuraCostos ?? ""}
        bg="#F1F8E9"
      />
      <Block
        title="Fuentes de Ingreso"
        text={lc?.fuentesIngreso ?? ""}
        bg="#F1F8E9"
      />
      <Block
        title="Segmento de Clientes"
        text={lc?.segmentoClientes ?? ""}
        bg="#FFF3E0"
      />
    </div>
  )
}

function ValuePropositionView({ canvas }: { canvas: BusinessCanvas }) {
  const vp = canvas.valueProposition
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#E3F2FD" }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
          Buyer Persona
        </h3>
        <Block
          title="🔧 Trabajos del Cliente"
          text={vp?.buyerPersona.trabajosCliente ?? ""}
          bg="#FFFFFF"
        />
        <Block
          title="😤 Frustraciones"
          text={vp?.buyerPersona.frustraciones ?? ""}
          bg="#FFFFFF"
        />
        <Block
          title="😊 Alegrías"
          text={vp?.buyerPersona.alegrias ?? ""}
          bg="#FFFFFF"
        />
      </div>

      <div
        className="rounded-xl p-4 space-y-3"
        style={{ backgroundColor: "#E8F5E9" }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-green-900">
          Propuesta de Valor
        </h3>
        <Block
          title="📦 Productos y Servicios"
          text={vp?.propuestaValor.productosServicios ?? ""}
          bg="#FFFFFF"
        />
        <Block
          title="💊 Aliviador de Frustraciones"
          text={vp?.propuestaValor.aliviadorFrustraciones ?? ""}
          bg="#FFFFFF"
        />
        <Block
          title="✨ Generador de Alegrías"
          text={vp?.propuestaValor.generadorAlegrias ?? ""}
          bg="#FFFFFF"
        />
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
      <Block
        title="Solución / Resultado"
        text={j?.solucionResultado ?? ""}
        bg="#E3F2FD"
      />
      <Block title="Job Funcional" text={j?.jobFuncional ?? ""} bg="#F1F8E9" />
      <Block title="Job Social" text={j?.jobSocial ?? ""} bg="#FFF3E0" />
      <Block title="Job Emocional" text={j?.jobEmocional ?? ""} bg="#F3E5F5" />
      <Block
        title="Necesidad Básica"
        text={j?.necesidadBasica ?? ""}
        bg="#FAFAFA"
      />
      <Block
        title="Propuesta de Valor Chave"
        text={j?.propuestaValorChave ?? ""}
        bg="#2D6A4F"
        textColor="#FFFFFF"
        className="md:col-span-2"
      />
    </div>
  )
}

function CanvasHeader({ tipo }: { tipo: CanvasType }) {
  const titulos: Record<CanvasType, string> = {
    business_model_canvas: "📋 Business Model Canvas",
    lean_canvas: "🚀 Lean Canvas",
    value_proposition: "💎 Propuesta de Valor",
    jobs_to_be_done: "🎯 Jobs To Be Done",
    unknown: "Canvas estratégico",
  }
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <h3 className="font-bold text-[#374151]">{titulos[tipo]}</h3>
      <button
        onClick={() => {
          if (typeof window !== "undefined") window.print()
        }}
        className="print:hidden px-3 py-1.5 text-sm rounded-lg text-white font-medium transition"
        style={{ backgroundColor: "#2D6A4F" }}
      >
        Exportar PDF
      </button>
    </div>
  )
}

export default function BusinessCanvasView({
  canvas,
  tipo,
}: {
  canvas: BusinessCanvas | null
  tipo: CanvasType | null
}) {
  if (!canvas || !tipo || tipo === "unknown") return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <CanvasHeader tipo={tipo} />
      {tipo === "business_model_canvas" && <BMCView canvas={canvas} />}
      {tipo === "lean_canvas" && <LeanView canvas={canvas} />}
      {tipo === "value_proposition" && <ValuePropositionView canvas={canvas} />}
      {tipo === "jobs_to_be_done" && <JobsToBeDoneView canvas={canvas} />}
    </div>
  )
}
