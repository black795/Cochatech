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
  ExtractedCost,
  ExtractedFinancialData,
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
- VARIABLE: ingredientes, insumos, empaques, materiales directos, comisiones por venta.
- FIJO: alquiler, luz, agua, internet, herramientas, publicidad mensual.

REGLAS DE EXTRACCIÓN OBLIGATORIAS:
1. PORCENTAJES como costos: si la emprendedora dice "5% de comisión sobre 150" o "3% del precio", convertí el porcentaje al monto absoluto y registralo. Ej: "5% de 150" = 7.50 Bs.
2. RANGOS de ventas: si te dan un rango (ej: "30 a 40 al mes"), tomá el PROMEDIO (35). Si te dan ventas DIARIAS (ej: "60 por día"), multiplicá por 30 (1800/mes).
3. PRODUCTO PRINCIPAL: identificá el sustantivo del producto que vende y registralo en producto_singular y producto_plural (ej: "vendo camisas" → singular: "camisa", plural: "camisas"). NUNCA inventes ejemplos genéricos como "torta" o "pan" si no son su producto real.
4. NO MARQUES has_enough_data_financial = true hasta tener: precio de venta, ventas mensuales, al menos 2 costos fijos y 2 costos variables, todos con montos numéricos en Bs.
5. ACUMULACIÓN OBLIGATORIA — CRÍTICO: si en turnos anteriores ya extrajiste costos, precio o ventas, DEBÉS volver a emitirlos COMPLETOS en cada respuesta. NUNCA omitas un costo ya mencionado, aunque la emprendedora no lo repita. NUNCA pongas precio_venta=null si ya te lo dijo. El campo "costs" debe contener TODOS los costos vistos hasta ahora, no solo los del último mensaje. La lista [Datos extraídos hasta ahora] que te paso es tu fuente de verdad — completala con lo nuevo, no la reemplaces.

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
    "costs": [
      { "concepto": "Texto del costo", "tipo": "Fijo o Variable", "monto_bs": 123.45, "frecuencia": "mensual o por_unidad" }
    ],
    "precio_venta": null,
    "ventas_mes": null,
    "nombre_emprendedora": null,
    "rubro": null,
    "ciudad": null,
    "producto_singular": null,
    "producto_plural": null
  }
}

ATENCIÓN — NOMBRES DE CAMPOS DEL JSON: usá EXACTAMENTE estos nombres de propiedad. NO inventes alias.
- "concepto" (NO uses "nombre", "name", "item", "descripcion")
- "monto_bs" (NO uses "monto", "amount", "valor", "precio")
- "frecuencia" (NO uses "unidad", "periodo", "frequency")
- "tipo": exactamente "Fijo" o "Variable" con primera mayúscula (NO "fijo", "FIJO", "fix")
- "frecuencia": exactamente "mensual" o "por_unidad" (NO "mes", "month", "por unidad" con espacio)`

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
  extracted_data?: ExtractedFinancialData
}

function emptyExtraction(): ExtractedFinancialData {
  return {
    costs: [],
    precio_venta: null,
    ventas_mes: null,
    nombre_emprendedora: null,
    rubro: null,
    ciudad: null,
    producto_singular: null,
    producto_plural: null,
  }
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.,-]/g, "").replace(",", ".")
    const num = parseFloat(cleaned)
    if (Number.isFinite(num)) return num
  }
  return null
}

function pickString(raw: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = raw[k]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return ""
}

function normalizeCost(c: unknown): ExtractedCost | null {
  if (!c || typeof c !== "object") return null
  const raw = c as Record<string, unknown>

  const concepto = pickString(raw, [
    "concepto",
    "nombre",
    "name",
    "descripcion",
    "item",
  ])
  if (!concepto) return null

  const monto = coerceNumber(
    raw.monto_bs ?? raw.monto ?? raw.amount ?? raw.valor ?? raw.precio
  )
  if (monto === null) return null

  const tipoRaw = pickString(raw, ["tipo", "type", "categoria"]).toLowerCase()
  const tipo: "Fijo" | "Variable" = tipoRaw.startsWith("fij")
    ? "Fijo"
    : "Variable"

  const frecRaw = pickString(raw, [
    "frecuencia",
    "frequency",
    "unidad",
    "periodicidad",
    "periodo",
  ])
    .toLowerCase()
    .replace(/\s+/g, "_")

  const frecuencia: "mensual" | "por_unidad" =
    frecRaw === "por_unidad" ||
    frecRaw.includes("unidad") ||
    frecRaw.includes("por")
      ? "por_unidad"
      : frecRaw.includes("mes") || frecRaw.includes("month")
        ? "mensual"
        : tipo === "Variable"
          ? "por_unidad"
          : "mensual"

  return { concepto, tipo, monto_bs: monto, frecuencia }
}

function mergeExtractions(
  prev: ExtractedFinancialData | null | undefined,
  curr: ExtractedFinancialData | null | undefined
): ExtractedFinancialData {
  const base = prev ?? emptyExtraction()
  if (!curr) return base

  const seen = new Map<string, ExtractedCost>()
  const keyOf = (c: ExtractedCost) =>
    `${c.concepto.toLowerCase().trim()}|${c.tipo}`

  let prevAccepted = 0
  let prevRejected = 0
  let currAccepted = 0
  let currRejected = 0

  for (const c of base.costs ?? []) {
    const normalized = normalizeCost(c)
    if (normalized) {
      seen.set(keyOf(normalized), normalized)
      prevAccepted++
    } else {
      prevRejected++
    }
  }
  for (const c of curr.costs ?? []) {
    const normalized = normalizeCost(c)
    if (normalized) {
      seen.set(keyOf(normalized), normalized)
      currAccepted++
    } else {
      currRejected++
      console.warn("[mergeExtractions] cost rejected:", JSON.stringify(c))
    }
  }

  console.log(
    `[mergeExtractions] result — prev: ${prevAccepted}✓/${prevRejected}✗, curr: ${currAccepted}✓/${currRejected}✗, final unique: ${seen.size}`
  )

  return {
    costs: Array.from(seen.values()),
    precio_venta: coerceNumber(curr.precio_venta) ?? base.precio_venta,
    ventas_mes: coerceNumber(curr.ventas_mes) ?? base.ventas_mes,
    nombre_emprendedora:
      curr.nombre_emprendedora ?? base.nombre_emprendedora,
    rubro: curr.rubro ?? base.rubro,
    ciudad: curr.ciudad ?? base.ciudad,
    producto_singular: curr.producto_singular ?? base.producto_singular,
    producto_plural: curr.producto_plural ?? base.producto_plural,
  }
}

async function runReplicateWithRetry(
  replicate: Replicate,
  input: Record<string, unknown>,
  maxRetries = 2
): Promise<unknown> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await replicate.run(REPLICATE_MODEL, { input })
    } catch (err) {
      lastError = err
      const status =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined
      const retryAfter =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { headers?: Headers } }).response?.headers?.get(
              "retry-after"
            )
          : null
      if (status === 429 && attempt < maxRetries) {
        const waitMs = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 15000)
          : 3000 * (attempt + 1)
        console.warn(
          `[Replicate 429] Retry ${attempt + 1}/${maxRetries} after ${waitMs}ms`
        )
        await new Promise((r) => setTimeout(r, waitMs))
        continue
      }
      throw err
    }
  }
  throw lastError
}

function summarizeExtraction(data: ExtractedFinancialData): string {
  const lines: string[] = []
  if (data.nombre_emprendedora) lines.push(`- Nombre: ${data.nombre_emprendedora}`)
  if (data.rubro) lines.push(`- Rubro: ${data.rubro}`)
  if (data.ciudad) lines.push(`- Ciudad: ${data.ciudad}`)
  if (data.producto_singular)
    lines.push(`- Producto (singular): ${data.producto_singular}`)
  if (data.producto_plural)
    lines.push(`- Producto (plural): ${data.producto_plural}`)
  if (data.precio_venta != null)
    lines.push(`- Precio de venta: Bs ${data.precio_venta}`)
  if (data.ventas_mes != null)
    lines.push(`- Ventas mensuales: ${data.ventas_mes}`)
  if (data.costs?.length) {
    lines.push(`- Costos ya extraídos (${data.costs.length}):`)
    for (const c of data.costs) {
      lines.push(
        `    · ${c.concepto} — ${c.tipo} — Bs ${c.monto_bs} (${c.frecuencia})`
      )
    }
  }
  return lines.length > 0
    ? lines.join("\n")
    : "(ningún dato extraído todavía)"
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
  lastUserMessage: string,
  previousExtraction: ExtractedFinancialData | null
): string {
  const history = messages
    .map((m) => {
      const speaker = m.role === "user" ? "Emprendedora" : "Kallpa"
      return `${speaker}: ${m.content}`
    })
    .join("\n")

  const sections: string[] = []
  if (previousExtraction) {
    sections.push(
      `[Datos extraídos hasta ahora — FUENTE DE VERDAD, completala con lo nuevo, NO LA REEMPLACES]\n${summarizeExtraction(
        previousExtraction
      )}`
    )
  }
  if (history) {
    sections.push(`[Historial de la conversación]\n${history}`)
  }
  sections.push(`[Mensaje actual de la emprendedora]\n${lastUserMessage}`)
  sections.push(
    `[Tu respuesta — SOLO el objeto JSON, sin texto antes ni después. RECORDÁ: en "extracted_data" debés repetir TODOS los datos de la lista de arriba más los nuevos.]`
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
- Ventas actuales: ${dd.ventas_actuales_mes} ${dd.producto_plural}/mes
- ¿Supera equilibrio?: ${dd.supera_punto_equilibrio ? "Sí" : "No"}
- Ganancia neta: Bs ${dd.ganancia_neta_mensual_bs}/mes

Usá modismos bolivianos: "pues", "nomás", "de a poco". Tono cálido y motivador. Hablá específicamente de las "${dd.producto_plural}" de la emprendedora — NO uses ejemplos genéricos como "tortas" o "pan" si su producto es otro. Respondé solo con el texto del mensaje, sin JSON, sin marcadores.`

  try {
    const output = await runReplicateWithRetry(replicate, {
      prompt,
      max_tokens: 1024,
    })
    const text = coerceTextOutput(output).trim()
    return text || "¡Tu negocio va bien pues! Seguí así nomás."
  } catch (err) {
    console.warn("[generateKallpaInsight] failed:", err)
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

REGLAS ESTRICTAS:
- Usá EXCLUSIVAMENTE los datos del negocio listados arriba. NO inventes información.
- El producto de esta emprendedora es "${dd.producto_plural}" — usá esa palabra cuando hables del producto. PROHIBIDO mencionar "tortas", "pan", "salteñas" u otros productos que no sean los de ella.
- Si un campo no se puede inferir de los datos provistos, escribí "No especificado" (no inventes).

Respondé SOLO con el JSON válido. Sin texto antes ni después. Sin bloques de código markdown.`

  try {
    const output = await runReplicateWithRetry(replicate, {
      prompt,
      system_prompt:
        "Eres consultor estratégico de Fundación Kallpa. Completa el canvas solicitado usando los datos reales del negocio. Responde SOLO con JSON válido.",
      max_tokens: 2000,
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
  let savedPrior: ExtractedFinancialData | null = null
  try {
    const body = await req.json()
    const { messages, lastUserMessage, previous_extracted_data } = body as {
      messages: ChatMessage[]
      lastUserMessage: string
      previous_extracted_data?: ExtractedFinancialData | null
    }
    savedPrior = previous_extracted_data ?? null

    if (!lastUserMessage || lastUserMessage.trim().length < 3) {
      return NextResponse.json(
        { error: "Mensaje muy corto" },
        { status: 400 }
      )
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })

    const priorExtraction: ExtractedFinancialData | null =
      previous_extracted_data ?? null

    console.log("[/api/chat] turn start — prior costs:",
      priorExtraction?.costs?.length ?? 0,
      "| precio:", priorExtraction?.precio_venta,
      "| ventas:", priorExtraction?.ventas_mes
    )

    const promptText = formatConversation(
      messages,
      lastUserMessage,
      priorExtraction
    )

    const output = await runReplicateWithRetry(replicate, {
      prompt: promptText,
      system_prompt: SYSTEM_PROMPT,
      max_tokens: 2000,
    })

    const rawText = coerceTextOutput(output)
    const parsed = parseChatTurnResponse(rawText)

    console.log("[/api/chat] claude returned — costs:",
      parsed.extracted_data?.costs?.length ?? 0,
      "| precio:", parsed.extracted_data?.precio_venta,
      "| ventas:", parsed.extracted_data?.ventas_mes,
      "| has_enough_data_financial:", parsed.has_enough_data_financial,
      "| phase:", parsed.phase
    )

    // Merge prior extraction with what Claude returned this turn — defense
    // against Claude omitting previously-extracted costs in its response.
    const mergedExtraction = mergeExtractions(
      priorExtraction,
      parsed.extracted_data ?? null
    )

    console.log("[/api/chat] after merge — costs:",
      mergedExtraction.costs.length,
      "| precio:", mergedExtraction.precio_venta,
      "| ventas:", mergedExtraction.ventas_mes,
      "| producto_plural:", mergedExtraction.producto_plural
    )

    // Recompute readiness from the MERGED state, not just current turn
    const hasFinancialReadyFlag = parsed.has_enough_data_financial === true
    const hasMinimumData =
      mergedExtraction.precio_venta != null &&
      mergedExtraction.ventas_mes != null &&
      (mergedExtraction.costs?.length ?? 0) >= 4
    const financialReady = hasFinancialReadyFlag || hasMinimumData

    console.log("[/api/chat] financialReady:", financialReady,
      "(flag:", hasFinancialReadyFlag, ", minimumData:", hasMinimumData, ")"
    )

    if (parsed.canvas_detection || parsed.canvas_progress) {
      console.log("[/api/chat] canvas — tipo:",
        parsed.canvas_detection?.tipo ?? "n/a",
        "| confianza:", parsed.canvas_detection?.confianza ?? "n/a",
        "| completos:", parsed.canvas_progress?.campos_completos?.length ?? 0,
        "| faltantes:", parsed.canvas_progress?.campos_faltantes?.length ?? 0,
        "| porcentaje:", parsed.canvas_progress?.porcentaje ?? 0,
        "| listo_para_generar:", parsed.canvas_progress?.listo_para_generar ?? false
      )
    }

    const canvasReady = parsed.canvas_progress?.listo_para_generar === true
    const isTransitionTurn = financialReady && parsed.phase === "A"
    const shouldRegenerateInsight =
      financialReady && (isTransitionTurn || canvasReady)

    let analysis: KallpaAnalysis | null = null
    if (financialReady && mergedExtraction.precio_venta != null) {
      analysis = buildAnalysisFromExtraction(mergedExtraction)
      if (shouldRegenerateInsight) {
        const insight = await generateKallpaInsight(replicate, analysis)
        analysis.dashboard_data.kallpa_insight = insight
      } else {
        analysis.dashboard_data.kallpa_insight =
          "¡Ya tenés tus números claros, pues! De a poco vas dominando tu negocio nomás."
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
      analysis,
      canvas_detection: parsed.canvas_detection,
      canvas_progress: canvasProgressFull,
      canvas_ready: canvasReady,
      canvas: canvasGenerado,
      merged_extraction: mergedExtraction,
    })
  } catch (error) {
    console.error("[/api/chat] error:", error)
    return NextResponse.json(
      {
        reply:
          "Disculpá, Kallpa está saturada en este momento. Esperá unos segundos y volvé a mandarme tu mensaje, por favor.",
        analysis: null,
        canvas: null,
        // Preserve client-side accumulated state so subsequent turns don't lose context
        merged_extraction: savedPrior,
      },
      { status: 200 }
    )
  }
}
