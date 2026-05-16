import type { CostItem, CostType } from "@/types/kallpa"

const VARIABLE_KEYWORDS = [
  "harina",
  "azúcar",
  "azucar",
  "huevo",
  "mantequilla",
  "leche",
  "colorante",
  "vainilla",
  "fondant",
  "caja",
  "cartón",
  "carton",
  "cinta",
  "papel",
  "gas por torta",
  "ingrediente",
  "insumo",
  "empaque",
  "etiqueta",
  "envase",
]

const FIXED_KEYWORDS = [
  "alquiler",
  "luz",
  "electricidad",
  "internet",
  "wifi",
  "molde",
  "utensilio",
  "herramienta",
  "publicidad",
  "flyer",
  "muestra",
  "transporte",
  "pasaje",
  "trufi",
  "taxi",
  "agua",
  "servicio básico",
  "servicio basico",
]

const KNOWN_CITIES = [
  "Sacaba",
  "Quillacollo",
  "Tiquipaya",
  "El Alto",
  "Cochabamba",
  "La Paz",
  "Santa Cruz",
  "Sucre",
  "Oruro",
  "Potosí",
  "Potosi",
  "Tarija",
  "Trinidad",
  "Cobija",
]

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function extractAmount(segment: string): number | null {
  const re =
    /(\d+(?:[.,]\d+)?)\s*(?:bs\.?|bolivianos?)\b|\bbs\.?\s*(\d+(?:[.,]\d+)?)/i
  const m = segment.match(re)
  if (!m) return null
  const raw = m[1] ?? m[2]
  return parseFloat(raw.replace(",", "."))
}

function isSalePriceContext(segment: string): boolean {
  return /\b(?:vendo|cobro|precio|sale\s+a|cuesta\s+(?:a|al\s+cliente))\b/i.test(
    segment
  )
}

function isMonthlySalesContext(segment: string): boolean {
  return (
    /(?:hago|preparo|elaboro|saco|vendo|produzco)\s+(?:unas?\s+|alrededor\s+de\s+|aproximadamente\s+)?\d+/i.test(
      segment
    ) ||
    /\d+\s+(?:tortas?|unidades?|pasteles?|panes?|productos?|piezas?)\s+(?:al\s+mes|por\s+mes|mensuales?)/i.test(
      segment
    )
  )
}

function classifyType(segment: string): CostType | null {
  const lower = segment.toLowerCase()
  for (const kw of VARIABLE_KEYWORDS) {
    if (lower.includes(kw)) return "Variable"
  }
  for (const kw of FIXED_KEYWORDS) {
    if (lower.includes(kw)) return "Fijo"
  }
  return null
}

function extractConcepto(segment: string): string {
  let s = segment
    .replace(/(\d+(?:[.,]\d+)?)\s*(?:bs\.?|bolivianos?)/gi, " ")
    .replace(/\bbs\.?\s*(\d+(?:[.,]\d+)?)/gi, " ")
    .replace(
      /\b(?:me\s+cuesta|cuestan?|pago|pagamos|gasto|gasta|gastamos|compro|sale|es|son|por\s+torta|por\s+unidad|al\s+mes|por\s+mes|mensuales?|también|tambien)\b/gi,
      " "
    )
    .replace(/^[\s,;.:\-—]+|[\s,;.:\-—]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
  if (s.length === 0) return "Costo"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function findSalePrice(text: string): number | null {
  const patterns = [
    /(?:vendo\s+(?:cada\s+\w+\s+)?a|los?\s+vendo\s+a|las?\s+vendo\s+a|cobro|precio\s+(?:de\s+venta\s+)?(?:es\s+)?(?:de\s+)?|sale\s+a)\s+[^\n,;.]{0,30}?(\d+(?:[.,]\d+)?)\s*(?:bs|bolivianos)?/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) return parseFloat(m[1].replace(",", "."))
  }
  return null
}

function findMonthlySales(text: string): number | null {
  const patterns = [
    /(\d+)\s+(?:tortas?|unidades?|pasteles?|panes?|productos?|piezas?)\s+(?:al\s+mes|por\s+mes|mensuales?)/i,
    /(?:hago|preparo|elaboro|saco|vendo|produzco)\s+(?:unas?\s+|alrededor\s+de\s+|m[áa]s\s+o\s+menos\s+|aproximadamente\s+)?(\d+)\s+(?:[^.\n,;]{0,20})?(?:al\s+mes|por\s+mes|en\s+el\s+mes|mensuales?)/i,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m) return parseInt(m[1], 10)
  }
  return null
}

function findName(text: string): string | null {
  const re =
    /(?:me\s+llamo|mi\s+nombre\s+es|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2})/iu
  const m = text.match(re)
  return m ? m[1].trim() : null
}

function findCiudad(text: string): string | null {
  for (const city of KNOWN_CITIES) {
    const re = new RegExp(`\\b${escapeRegex(city)}\\b`, "i")
    if (re.test(text)) return city
  }
  return null
}

function findRubro(text: string): string | null {
  const rubroKeywords: Array<[RegExp, string]> = [
    [/\btortas?\s+decoradas?\b/i, "Repostería artesanal — Tortas decoradas"],
    [/\btortas?\b/i, "Repostería artesanal"],
    [/\b(?:repostería|reposteria)\b/i, "Repostería artesanal"],
    [/\b(?:pasteles?|pastelería|pasteleria)\b/i, "Pastelería"],
    [/\bpan(?:es|adería|aderia)?\b/i, "Panadería"],
    [/\b(?:almuerzos?|comidas?\s+preparadas?)\b/i, "Comida preparada"],
    [/\btejidos?\b/i, "Tejidos artesanales"],
    [/\b(?:costura|confección|confeccion|ropa|prendas)\b/i, "Confección textil"],
    [/\b(?:joyería|joyeria|bisutería|bisuteria)\b/i, "Joyería artesanal"],
    [/\b(?:artesanías?|artesanias?)\b/i, "Artesanías"],
  ]
  for (const [re, rubro] of rubroKeywords) {
    if (re.test(text)) return rubro
  }
  return null
}

function splitSegments(text: string): string[] {
  const primary = text
    .split(/[\n.;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const result: string[] = []
  const amountRe =
    /\d+(?:[.,]\d+)?\s*(?:bs\.?|bolivianos?)|bs\.?\s*\d+(?:[.,]\d+)?/gi
  for (const seg of primary) {
    const amounts = seg.match(amountRe)
    if (amounts && amounts.length > 1) {
      result.push(
        ...seg
          .split(/,\s+|\s+y\s+/)
          .map((s) => s.trim())
          .filter(Boolean)
      )
    } else {
      result.push(seg)
    }
  }
  return result
}

export function parseChatToItems(textoChat: string): {
  items: CostItem[]
  precioVenta: number
  ventasMes: number
  nombreEmprendedora: string
  rubro: string
  ciudad: string
} {
  const segments = splitSegments(textoChat)

  const items: CostItem[] = []
  let idx = 1

  for (const segment of segments) {
    if (isSalePriceContext(segment)) continue
    if (isMonthlySalesContext(segment)) continue

    const amount = extractAmount(segment)
    if (amount === null) continue

    const tipo = classifyType(segment)
    if (tipo === null) continue

    const concepto = extractConcepto(segment)

    items.push({
      id: `COST_${String(idx).padStart(3, "0")}`,
      concepto,
      tipo,
      monto_bs: amount,
      frecuencia: tipo === "Variable" ? "por_unidad" : "mensual",
    })
    idx++
  }

  return {
    items,
    precioVenta: findSalePrice(textoChat) ?? 0,
    ventasMes: findMonthlySales(textoChat) ?? 0,
    nombreEmprendedora: findName(textoChat) ?? "Emprendedora",
    rubro: findRubro(textoChat) ?? "Emprendimiento",
    ciudad: findCiudad(textoChat) ?? "Cochabamba",
  }
}
