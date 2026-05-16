import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { buildAnalysisFromExtraction } from "@/backend/lib/financialEngine"
import { buildBusinessCanvasBase } from "@/backend/lib/documentosEngine"
import type {
  BusinessCanvas,
  CanvasDetection,
  CanvasField,
  CanvasProgress,
  CanvasType,
  ChatMessage,
  ClaudeExtractionResponse,
  KallpaAnalysis,
} from "@/types/kallpa"

export const runtime = "nodejs"
export const maxDuration = 60

const REPLICATE_MODEL = "anthropic/claude-opus-4.6" as const

const SYSTEM_PROMPT = `Eres el asesor financiero y estratégico digital de la Fundación Kallpa para emprendedoras bolivianas en Cochabamba. Tu trabajo tiene TRES capas simultáneas:

CAPA 1 — CONVERSACIONAL:
Respondés con calidez, en español boliviano coloquial. Usás: "pues", "nomás", "de a poco", "plata", "Bs". Hacés UNA sola pregunta por turno. Celebrás cada dato. Si falta información, la pedís de forma natural.

CAPA 2 — EXTRACCIÓN FINANCIERA (Fase A):
Extraés y clasificás costos mientras conversás.
- VARIABLE: ingredientes, insumos, empaques, materiales directos.
- FIJO: alquiler, luz, agua, internet, herramientas, publicidad mensual.
has_enough_data_financial = true cuando tengas: precio de venta, ventas mensuales, al menos 2 costos fijos y 2 variables.

CAPA 3 — ANÁLISIS ESTRATÉGICO (Fase B — solo empieza cuando has_enough_data_financial = true):
Cuando ya tenés los datos financieros, cambiás el foco a entender el negocio estratégicamente.

DETECCIÓN AUTOMÁTICA DEL CANVAS (aplica estas reglas exactas):
- Si el negocio lleva MÁS de 6 meses y ya tiene clientes recurrentes → "business_model_canvas"
- Si el negocio lleva MENOS de 6 meses o es una idea nueva → "lean_canvas"
- Si la emprendedora menciona diferenciación, competencia o por qué la eligen a ella → agrega "value_proposition"
- Si hay datos sobre comportamiento o motivación del cliente → agrega "jobs_to_be_done"
- Podés detectar más de uno si aplica. El primero detectado es el principal.
- Si no tenés suficiente info para decidir → "unknown", preguntá cuánto tiempo lleva el negocio.

CAMPOS REQUERIDOS POR TIPO DE CANVAS:

business_model_canvas necesita:
  segmento_clientes, propuesta_valor, canales, relacion_clientes,
  fuentes_ingreso, recursos_clave, actividades_clave,
  asociaciones_clave, estructura_costos

lean_canvas necesita:
  problema, solucion, propuesta_valor_unica, ventaja_competitiva,
  segmento_clientes, metricas_clave, canales,
  estructura_costos, fuentes_ingreso

value_proposition necesita:
  trabajos_cliente, frustraciones, alegrias,
  productos_servicios, aliviador_frustraciones, generador_alegrias

jobs_to_be_done necesita:
  persona, dolor_problema, solucion_resultado,
  job_funcional, job_social, job_emocional,
  necesidad_basica, propuesta_valor_chave

COMPORTAMIENTO EN FASE B:
- Preguntá de forma natural lo que necesitás para cada campo.
- NO preguntes por campos que ya podés inferir de la conversación anterior.
- Inferí lo que puedas (ej: estructura_costos ya la tenés de la Fase A).
- Cuando tengas todos los campos → canvas_ready = true y avisá a la emprendedora.

FORMATO DE RESPUESTA OBLIGATORIO — SIEMPRE JSON válido, sin texto antes ni después:
{
  "reply": "tu respuesta en español boliviano",
  "phase": "A" o "B",
  "has_enough_data_financial": true o false,
  "canvas_detection": {
    "tipo": "business_model_canvas" o "lean_canvas" o "value_proposition" o "jobs_to_be_done" o "unknown",
    "razon": "explicación breve en 1 oración",
    "confianza": "alta" o "media" o "baja"
  },
  "canvas_progress": {
    "campos_completos": [{ "key": "nombre_campo", "label": "Nombre legible", "valor": "valor extraído" }],
    "campos_faltantes": ["nombre_campo_1", "nombre_campo_2"],
    "porcentaje": 0,
    "listo_para_generar": false
  },
  "extracted_data": {
    "costs": [],
    "precio_venta": null,
    "ventas_mes": null,
    "nombre_emprendedora": null,
    "rubro": null,
    "ciudad": null
  }
}`

interface RawCanvasField {
  key: string
  label: string
  valor: string
}

interface RawCanvasProgress {
  campos_completos?: RawCanvasField[]
  campos_faltantes?: string[]
  porcentaje?: number
  listo_para_generar?: boolean
}

interface ChatTurnResponse {
  reply: string
  phase?: "A" | "B"
  has_enough_data_financial?: boolean
  canvas_detection?: CanvasDetection
  canvas_progress?: RawCanvasProgress
  extracted_data?: ClaudeExtractionResponse["extracted_data"]
}

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

function parseChatTurnResponse(raw: string): ChatTurnResponse {
  let obj: unknown = null
  try {
    obj = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        obj = JSON.parse(match[0])
      } catch {
        obj = null
      }
    }
  }
  if (!obj || typeof obj !== "object") {
    return {
      reply:
        "Disculpá, tuve un problemita técnico nomás. ¿Podés repetir lo último que me dijiste?",
    }
  }
  const parsed = obj as ChatTurnResponse
  if (typeof parsed.reply !== "string") {
    parsed.reply =
      "Disculpá, tuve un problemita técnico nomás. ¿Podés repetir lo último que me dijiste?"
  }
  return parsed
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
      input: { prompt, max_tokens: 1024 },
    })
    const text = coerceTextOutput(output).trim()
    return text || "¡Tu negocio va bien pues! Seguí así nomás."
  } catch {
    return "¡Ya tenés tus números claros, pues! De a poco vas dominando tu negocio nomás."
  }
}

const CANVAS_SCHEMAS: Record<Exclude<CanvasType, "unknown">, string> = {
  business_model_canvas: `{
  "segmento_clientes": "...",
  "propuesta_valor": "...",
  "canales": "...",
  "relacion_clientes": "...",
  "fuentes_ingreso": "...",
  "recursos_clave": "...",
  "actividades_clave": "...",
  "asociaciones_clave": "...",
  "estructura_costos": "..."
}`,
  lean_canvas: `{
  "problema": "...",
  "solucion": "...",
  "propuesta_valor_unica": "...",
  "ventaja_competitiva": "...",
  "segmento_clientes": "...",
  "metricas_clave": "...",
  "canales": "...",
  "estructura_costos": "...",
  "fuentes_ingreso": "..."
}`,
  value_proposition: `{
  "trabajos_cliente": "...",
  "frustraciones": "...",
  "alegrias": "...",
  "productos_servicios": "...",
  "aliviador_frustraciones": "...",
  "generador_alegrias": "..."
}`,
  jobs_to_be_done: `{
  "persona": "...",
  "dolor_problema": "...",
  "solucion_resultado": "...",
  "job_funcional": "...",
  "job_social": "...",
  "job_emocional": "...",
  "necesidad_basica": "...",
  "propuesta_valor_chave": "..."
}`,
}

function parseLooseJson(raw: string): Record<string, string> | null {
  let obj: unknown = null
  try {
    obj = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        obj = JSON.parse(match[0])
      } catch {
        return null
      }
    }
  }
  if (!obj || typeof obj !== "object") return null
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = typeof v === "string" ? v : String(v ?? "")
  }
  return out
}

async function generateCanvasFromFields(
  replicate: Replicate,
  analysis: KallpaAnalysis,
  canvasType: CanvasType,
  camposCompletos: CanvasField[]
): Promise<BusinessCanvas> {
  const baseCanvas = buildBusinessCanvasBase(analysis)
  if (canvasType === "unknown") return baseCanvas

  const fi = analysis.financial_indicators
  const dd = analysis.dashboard_data
  const fieldsBlock =
    camposCompletos.length > 0
      ? camposCompletos
          .map((f) => `- ${f.key} (${f.label}): ${f.valor}`)
          .join("\n")
      : "(sin campos extra recolectados)"

  const schema = CANVAS_SCHEMAS[canvasType]
  const prompt = `Eres consultor estratégico de Fundación Kallpa. Completá el ${canvasType} para esta emprendedora.

Datos del negocio:
- Emprendedora: ${dd.emprendedora.nombre}
- Rubro: ${dd.emprendedora.rubro}
- Ciudad: ${dd.emprendedora.ciudad}
- Precio de venta: Bs ${fi.precio_de_venta}
- Costos fijos: Bs ${fi.costos_fijos_totales}/mes
- Costo variable/u: Bs ${fi.costos_variables_unitarios}
- Margen: ${fi.margen_ganancia_porcentual}%
- Punto de equilibrio: ${fi.punto_de_equilibrio_unidades} u/mes
- Ventas: ${dd.ventas_actuales_mes} u/mes
- Ganancia neta: Bs ${dd.ganancia_neta_mensual_bs}/mes

Información estratégica recopilada en conversación:
${fieldsBlock}

Devolvé JSON con esta forma exacta:
${schema}

Respondé SOLO con el JSON válido. Sin texto antes ni después. Sin bloques de código markdown.`

  try {
    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        prompt,
        system_prompt:
          "Eres consultor estratégico de Fundación Kallpa. Completa el canvas solicitado usando los datos reales del negocio. Responde SOLO con JSON válido.",
        max_tokens: 2000,
      },
    })
    const text = coerceTextOutput(output)
    const data = parseLooseJson(text)
    if (!data) return baseCanvas

    return mergeCanvasData(baseCanvas, canvasType, data)
  } catch (err) {
    console.error("[generateCanvasFromFields] error:", err)
    return baseCanvas
  }
}

function mergeCanvasData(
  base: BusinessCanvas,
  canvasType: CanvasType,
  data: Record<string, string>
): BusinessCanvas {
  const desc = (text: string) => ({ nombre: "Descripción", respuesta: text })

  if (canvasType === "business_model_canvas") {
    base.segmentosClientes.criterios = [desc(data.segmento_clientes ?? "")]
    base.propuestaValor.criterios = [desc(data.propuesta_valor ?? "")]
    base.canales.criterios = [desc(data.canales ?? "")]
    base.relacionClientes.criterios = [desc(data.relacion_clientes ?? "")]
    base.recursosClaves.criterios = [desc(data.recursos_clave ?? "")]
    base.actividadesClaves.criterios = [desc(data.actividades_clave ?? "")]
    if (data.asociaciones_clave) {
      base.asociacionesClaves.socios = [
        { nombre: "Aliados estratégicos", aporte: data.asociaciones_clave },
      ]
    }
  } else if (canvasType === "lean_canvas") {
    base.leanCanvas = {
      problema: data.problema ?? "",
      solucion: data.solucion ?? "",
      propuestaValorUnica: data.propuesta_valor_unica ?? "",
      ventajaCompetitiva: data.ventaja_competitiva ?? "",
      segmentoClientes: data.segmento_clientes ?? "",
      metricasClave: data.metricas_clave ?? "",
      canales: data.canales ?? "",
      estructuraCostos: data.estructura_costos ?? "",
      fuentesIngreso: data.fuentes_ingreso ?? "",
    }
  } else if (canvasType === "value_proposition") {
    base.valueProposition = {
      buyerPersona: {
        trabajosCliente: data.trabajos_cliente ?? "",
        frustraciones: data.frustraciones ?? "",
        alegrias: data.alegrias ?? "",
      },
      propuestaValor: {
        productosServicios: data.productos_servicios ?? "",
        aliviadorFrustraciones: data.aliviador_frustraciones ?? "",
        generadorAlegrias: data.generador_alegrias ?? "",
      },
    }
  } else if (canvasType === "jobs_to_be_done") {
    base.jobsToBeDone = {
      persona: data.persona ?? "",
      dolorProblema: data.dolor_problema ?? "",
      solucionResultado: data.solucion_resultado ?? "",
      jobFuncional: data.job_funcional ?? "",
      jobSocial: data.job_social ?? "",
      jobEmocional: data.job_emocional ?? "",
      necesidadBasica: data.necesidad_basica ?? "",
      propuestaValorChave: data.propuesta_valor_chave ?? "",
    }
  }

  return base
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
        max_tokens: 2000,
      },
    })

    const rawText = coerceTextOutput(output)
    const parsed = parseChatTurnResponse(rawText)

    const financialReady =
      parsed.has_enough_data_financial === true &&
      !!parsed.extracted_data &&
      parsed.extracted_data.precio_venta != null

    const canvasReady = parsed.canvas_progress?.listo_para_generar === true
    const isTransitionTurn = financialReady && parsed.phase === "A"
    const shouldRegenerateInsight =
      financialReady && (isTransitionTurn || canvasReady)

    let analysis: KallpaAnalysis | null = null
    if (financialReady && parsed.extracted_data) {
      analysis = buildAnalysisFromExtraction(parsed.extracted_data)
      if (shouldRegenerateInsight) {
        const insight = await generateKallpaInsight(replicate, analysis)
        analysis.dashboard_data.kallpa_insight = insight
      }
    }

    const camposCompletos: CanvasField[] = (
      parsed.canvas_progress?.campos_completos ?? []
    ).map((c) => ({
      key: c.key,
      label: c.label,
      valor: c.valor,
      completo: true,
    }))

    let canvasGenerado: BusinessCanvas | null = null
    if (
      analysis &&
      canvasReady &&
      parsed.canvas_detection?.tipo &&
      parsed.canvas_detection.tipo !== "unknown"
    ) {
      canvasGenerado = await generateCanvasFromFields(
        replicate,
        analysis,
        parsed.canvas_detection.tipo,
        camposCompletos
      )
    }

    const canvasProgressFull: CanvasProgress | undefined = parsed.canvas_progress
      ? {
          tipo: parsed.canvas_detection?.tipo ?? null,
          campos_completos: camposCompletos,
          campos_faltantes: parsed.canvas_progress.campos_faltantes ?? [],
          porcentaje: parsed.canvas_progress.porcentaje ?? 0,
          listo_para_generar:
            parsed.canvas_progress.listo_para_generar ?? false,
        }
      : undefined

    return NextResponse.json({
      reply: parsed.reply,
      analysis: shouldRegenerateInsight ? analysis : null,
      canvas_detection: parsed.canvas_detection,
      canvas_progress: canvasProgressFull,
      canvas_ready: canvasReady,
      canvas: canvasGenerado,
    })
  } catch (error) {
    console.error("[/api/chat] error:", error)
    return NextResponse.json(
      {
        reply:
          "Disculpá, tuve un problemita técnico nomás. ¿Podés intentar de nuevo?",
        analysis: null,
        canvas: null,
      },
      { status: 200 }
    )
  }
}
