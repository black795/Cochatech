export type CostType = "Fijo" | "Variable"
export type Frequency = "mensual" | "por_unidad" | "semanal"

export interface CostItem {
  id: string
  concepto: string
  tipo: CostType
  monto_bs: number
  frecuencia: Frequency
}

export interface FinancialIndicators {
  costos_fijos_totales: number
  costos_variables_unitarios: number
  precio_de_venta: number
  margen_ganancia_unitario: number
  margen_ganancia_porcentual: number
  punto_de_equilibrio_unidades: number
}

export interface ChartDataPoint {
  name: string
  value: number
  fill: string
  descripcion?: string
}

export interface EquilibriumProgress {
  ventas_actuales: number
  punto_equilibrio: number
  porcentaje_avance: number
  excedente_unidades: number
}

export interface DashboardCharts {
  distribucion_costos: ChartDataPoint[]
  desglose_variables_por_unidad: ChartDataPoint[]
  equilibrio_progress: EquilibriumProgress
}

export interface EmprendedoraInfo {
  nombre: string
  rubro: string
  ciudad: string
  canal_principal: string
  fecha_analisis: string
}

export interface DashboardData {
  emprendedora: EmprendedoraInfo
  ventas_actuales_mes: number
  ingreso_mensual_estimado_bs: number
  ganancia_neta_mensual_bs: number
  supera_punto_equilibrio: boolean
  unidades_sobre_equilibrio: number
  charts: DashboardCharts
  kallpa_insight: string
}

export interface KallpaAnalysis {
  excel_simulation: CostItem[]
  financial_indicators: FinancialIndicators
  dashboard_data: DashboardData
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  lastUserMessage: string
}

export interface ChatResponse {
  reply: string
  analysis: KallpaAnalysis | null
}

export interface UIMessage {
  id: string
  role: "assistant" | "user"
  content: string
  timestamp: Date
}

export interface ExtractedCost {
  concepto: string
  tipo: "Fijo" | "Variable"
  monto_bs: number
  frecuencia: "mensual" | "por_unidad"
}

export interface ClaudeExtractionResponse {
  reply: string
  has_enough_data: boolean
  extracted_data: {
    costs: ExtractedCost[]
    precio_venta: number | null
    ventas_mes: number | null
    nombre_emprendedora: string | null
    rubro: string | null
    ciudad: string | null
  }
}
