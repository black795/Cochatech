import { NextResponse } from "next/server"
import Replicate from "replicate"
import { buildFullAnalysis } from "@/lib/financialEngine"
import { parseChatToItems } from "@/lib/chatProcessor"
import type { KallpaAnalysis } from "@/types/kallpa"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM_PROMPT =
  "Eres el asesor financiero digital de la Fundación Kallpa para emprendedoras bolivianas. Tu tono es cálido, cercano y empático. Usas español boliviano coloquial: Bs, plata, de a poco, nomás, pues. Nunca usas jerga contable sin explicarla. Celebras cada avance concreto. Siempre cierras con una acción pequeña y posible. Máximo 4 oraciones."

const REPLICATE_MODEL = "anthropic/claude-opus-4.6" as const

function coerceInsight(output: unknown): string {
  if (typeof output === "string") return output.trim()
  if (Array.isArray(output)) {
    return output
      .map((chunk) => (typeof chunk === "string" ? chunk : String(chunk ?? "")))
      .join("")
      .trim()
  }
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>
    if (typeof obj.output === "string") return obj.output.trim()
    if (Array.isArray(obj.output)) return coerceInsight(obj.output)
  }
  return ""
}

function buildFallbackInsight(nombre: string): string {
  return `¡${nombre}, tu negocio ya está caminando bien de a poco! Tus números están ordenados nomás, seguí registrando cada gasto.`
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      chat_text?: unknown
    } | null

    const chatText =
      body && typeof body.chat_text === "string" ? body.chat_text : ""

    if (!chatText || chatText.trim().length <= 20) {
      return NextResponse.json(
        { error: "El texto del chat es inválido o muy corto" },
        { status: 400 }
      )
    }

    const parsed = parseChatToItems(chatText)
    const analysis: KallpaAnalysis = buildFullAnalysis(
      parsed.items,
      parsed.precioVenta,
      parsed.ventasMes,
      parsed.nombreEmprendedora,
      parsed.rubro,
      parsed.ciudad
    )

    const fi = analysis.financial_indicators
    const dd = analysis.dashboard_data

    const userMessage =
      `Genera un kallpa_insight personalizado en español boliviano para esta emprendedora:\n` +
      `- Nombre: ${dd.emprendedora.nombre}\n` +
      `- Rubro: ${dd.emprendedora.rubro}\n` +
      `- Costos fijos totales: Bs ${fi.costos_fijos_totales}\n` +
      `- Costo variable por unidad: Bs ${fi.costos_variables_unitarios}\n` +
      `- Precio de venta: Bs ${fi.precio_de_venta}\n` +
      `- Margen de ganancia: ${fi.margen_ganancia_porcentual}%\n` +
      `- Punto de equilibrio: ${fi.punto_de_equilibrio_unidades} unidades/mes\n` +
      `- Ventas actuales: ${dd.ventas_actuales_mes} unidades/mes\n` +
      `- ¿Supera el punto de equilibrio?: ${dd.supera_punto_equilibrio ? "Sí" : "No"}\n` +
      `- Ganancia neta estimada: Bs ${dd.ganancia_neta_mensual_bs}/mes\n\n` +
      `Escribe máximo 4 oraciones, tono cálido, modismos bolivianos sutiles.`

    let insightText = ""
    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      })

      const output = await replicate.run(REPLICATE_MODEL, {
        input: {
          prompt: userMessage,
          system_prompt: SYSTEM_PROMPT,
          max_tokens: 1024,
        },
      })
      insightText = coerceInsight(output)
    } catch (llmError) {
      console.error("[analizar-chat] LLM call failed:", llmError)
    }

    analysis.dashboard_data.kallpa_insight =
      insightText && insightText.length > 10
        ? insightText
        : buildFallbackInsight(dd.emprendedora.nombre)

    return NextResponse.json(analysis, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("[analizar-chat] fatal error:", error)
    return NextResponse.json(
      { error: "Error interno al procesar el análisis" },
      { status: 500 }
    )
  }
}
