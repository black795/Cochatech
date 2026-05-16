import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { buildAnalysisFromExtraction } from "@/lib/financialEngine"
import type {
  ChatMessage,
  ClaudeExtractionResponse,
  KallpaAnalysis,
} from "@/types/kallpa"

export const runtime = "nodejs"
export const maxDuration = 60

const REPLICATE_MODEL = "anthropic/claude-opus-4.6" as const

const SYSTEM_PROMPT = `Eres el asesor financiero digital de la Fundación Kallpa para emprendedoras bolivianas en Cochabamba. Tu trabajo tiene DOS capas simultáneas:

CAPA 1 — CONVERSACIONAL (lo que la emprendedora ve):
Respondés con calidez, en español boliviano coloquial. Usás: "pues", "nomás", "de a poco", "plata", "Bs". NUNCA usás jerga contable sin explicarla antes. Hacés UNA sola pregunta por turno. Celebrás cada dato que te dan.

CAPA 2 — EXTRACCIÓN SILENCIOSA:
Mientras conversás, extraés y clasificás todos los costos mencionados.
Reglas de clasificación:
- VARIABLE: ingredientes, insumos, empaques, materiales directos. Solo existen si se produce una unidad.
- FIJO: alquiler, luz, agua, internet, transporte mensual, publicidad, utensilios, herramientas. Se pagan aunque no se produzca nada.

CUÁNDO MARCAR has_enough_data = true:
Solo cuando tengas TODOS estos datos confirmados:
- Al menos 2 costos fijos identificados con monto en Bs
- Al menos 2 costos variables identificados con monto en Bs
- El precio de venta por unidad confirmado
- Una estimación de ventas mensuales confirmada

ACUMULACIÓN: Recordás y acumulás costos de TODOS los mensajes anteriores. No duplicás costos ya mencionados.

FORMATO DE RESPUESTA OBLIGATORIO — Respondés ÚNICAMENTE con JSON válido, sin texto antes ni después, sin bloques de código markdown:
{
  "reply": "tu respuesta conversacional en español boliviano",
  "has_enough_data": false,
  "extracted_data": {
    "costs": [
      {
        "concepto": "nombre del costo",
        "tipo": "Fijo",
        "monto_bs": 0,
        "frecuencia": "mensual"
      }
    ],
    "precio_venta": null,
    "ventas_mes": null,
    "nombre_emprendedora": null,
    "rubro": null,
    "ciudad": null
  }
}`

function coerceTextOutput(output: unknown): string {
  if (typeof output === "string") return output
  if (Array.isArray(output)) {
    return output
      .map((chunk) =>
        typeof chunk === "string" ? chunk : String(chunk ?? "")
      )
      .join("")
  }
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>
    if (typeof obj.output === "string") return obj.output
    if (Array.isArray(obj.output)) return coerceTextOutput(obj.output)
  }
  return ""
}

function formatConversation(
  messages: ChatMessage[],
  lastUserMessage: string
): string {
  const history = messages
    .map((m) => {
      const speaker = m.role === "user" ? "Emprendedora" : "Kallpa"
      return `${speaker}: ${m.content}`
    })
    .join("\n")

  const sections: string[] = []
  if (history) {
    sections.push(`[Historial de la conversación]\n${history}`)
  }
  sections.push(`[Mensaje actual de la emprendedora]\n${lastUserMessage}`)
  sections.push(
    `[Tu respuesta — SOLO el objeto JSON, sin texto antes ni después]`
  )
  return sections.join("\n\n")
}

function parseClaudeResponse(raw: string): ClaudeExtractionResponse {
  try {
    return JSON.parse(raw) as ClaudeExtractionResponse
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0]) as ClaudeExtractionResponse
      } catch {
        // fallthrough
      }
    }
  }
  return {
    reply:
      "Disculpá, tuve un problemita técnico nomás. ¿Podés repetir lo último que me dijiste?",
    has_enough_data: false,
    extracted_data: {
      costs: [],
      precio_venta: null,
      ventas_mes: null,
      nombre_emprendedora: null,
      rubro: null,
      ciudad: null,
    },
  }
}

async function generateKallpaInsight(
  replicate: Replicate,
  analysis: KallpaAnalysis
): Promise<string> {
  const { financial_indicators: fi, dashboard_data: dd } = analysis
  const prompt = `Eres asesor de Fundación Kallpa. Genera un mensaje de felicitación y análisis financiero en español boliviano coloquial (máximo 4 oraciones) para:
- Emprendedora: ${dd.emprendedora.nombre}, rubro: ${dd.emprendedora.rubro}
- Costos fijos: Bs ${fi.costos_fijos_totales}
- Costo variable/unidad: Bs ${fi.costos_variables_unitarios}
- Precio de venta: Bs ${fi.precio_de_venta}
- Margen: ${fi.margen_ganancia_porcentual}%
- Punto de equilibrio: ${fi.punto_de_equilibrio_unidades} unidades/mes
- Ventas actuales: ${dd.ventas_actuales_mes} unidades/mes
- ¿Supera equilibrio?: ${dd.supera_punto_equilibrio ? "Sí" : "No"}
- Ganancia neta: Bs ${dd.ganancia_neta_mensual_bs}/mes
Usá modismos bolivianos: "pues", "nomás", "de a poco". Tono cálido y motivador. Respondé solo con el texto del mensaje, sin JSON, sin marcadores.`

  try {
    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        prompt,
        max_tokens: 1024,
      },
    })
    const text = coerceTextOutput(output).trim()
    return text || "¡Tu negocio va bien pues! Seguí así nomás."
  } catch {
    return "¡Ya tenés tus números claros, pues! De a poco vas dominando tu negocio nomás."
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, lastUserMessage } = body as {
      messages: ChatMessage[]
      lastUserMessage: string
    }

    if (!lastUserMessage || lastUserMessage.trim().length < 3) {
      return NextResponse.json(
        { error: "Mensaje muy corto" },
        { status: 400 }
      )
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    const promptText = formatConversation(messages, lastUserMessage)

    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        prompt: promptText,
        system_prompt: SYSTEM_PROMPT,
        max_tokens: 1024,
      },
    })

    const rawText = coerceTextOutput(output)
    const parsed = parseClaudeResponse(rawText)

    let analysis: KallpaAnalysis | null = null

    if (parsed.has_enough_data && parsed.extracted_data.precio_venta) {
      analysis = buildAnalysisFromExtraction(parsed.extracted_data)
      const insight = await generateKallpaInsight(replicate, analysis)
      analysis.dashboard_data.kallpa_insight = insight
    }

    return NextResponse.json({
      reply: parsed.reply,
      analysis,
    })
  } catch (error) {
    console.error("[/api/chat] error:", error)
    return NextResponse.json(
      {
        reply:
          "Disculpá, tuve un problemita técnico nomás. ¿Podés intentar de nuevo?",
        analysis: null,
      },
      { status: 200 }
    )
  }
}
