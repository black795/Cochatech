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
  canvas_detection?: CanvasDetection
  canvas_progress?: CanvasProgress
  canvas_ready?: boolean
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

export interface PlanillaProducto {
  nombre: string
  descripcion: string
  precioVenta: number
  costoTotal: number
  ganancia: number
}

export interface PlanillaCostos {
  emprendedora: string
  emprendimiento: string
  fechaActualizacion: string
  productos: PlanillaProducto[]
  tablaCostos: CostItem[]
  costoFijoTotal: number
  costoVariableTotal: number
  costoTotalUnitario: number
  puntoEquilibrio: number
}

export interface CanvasSeccion {
  titulo: string
  criterios: {
    nombre: string
    respuesta: string
  }[]
}

export interface BusinessCanvas {
  datosGenerales: {
    nombreEmprendedora: string
    nombreEmprendimiento: string
    telefono: string
    actividadPrincipal: string
    lugarVenta: string
    horarioVenta: string
    diasVenta: string
  }
  segmentosClientes: CanvasSeccion
  propuestaValor: CanvasSeccion
  canales: CanvasSeccion
  relacionClientes: CanvasSeccion
  fuentesIngresos: {
    lineas: { producto: string; metodoPago: string; precioEstimado: number }[]
  }
  recursosClaves: CanvasSeccion
  actividadesClaves: CanvasSeccion
  asociacionesClaves: {
    socios: { nombre: string; aporte: string }[]
  }
  estructuraCostos: {
    costos: { concepto: string; tipo: string; prioridad: string }[]
  }
  leanCanvas?: {
    problema: string
    solucion: string
    propuestaValorUnica: string
    ventajaCompetitiva: string
    segmentoClientes: string
    metricasClave: string
    canales: string
    estructuraCostos: string
    fuentesIngreso: string
  }
  valueProposition?: {
    buyerPersona: {
      trabajosCliente: string
      frustraciones: string
      alegrias: string
    }
    propuestaValor: {
      productosServicios: string
      aliviadorFrustraciones: string
      generadorAlegrias: string
    }
  }
  jobsToBeDone?: {
    persona: string
    dolorProblema: string
    solucionResultado: string
    jobFuncional: string
    jobSocial: string
    jobEmocional: string
    necesidadBasica: string
    propuestaValorChave: string
  }
}

export interface DocumentosOutput {
  planillaCostos: PlanillaCostos
  businessCanvas: BusinessCanvas
}

export type CanvasType =
  | "business_model_canvas"
  | "lean_canvas"
  | "value_proposition"
  | "jobs_to_be_done"
  | "unknown"

export interface CanvasDetection {
  tipo: CanvasType
  razon: string
  confianza: "alta" | "media" | "baja"
}

export interface CanvasField {
  key: string
  label: string
  valor: string
  completo: boolean
}

export interface CanvasProgress {
  tipo: CanvasType | null
  campos_completos: CanvasField[]
  campos_faltantes: string[]
  porcentaje: number
  listo_para_generar: boolean
}

export interface ConversationState {
  financial_phase_complete: boolean
  canvas_detection_done: boolean
  canvas_progress: CanvasProgress | null
}
