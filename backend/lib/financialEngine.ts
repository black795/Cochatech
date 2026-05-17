import type {
  CostItem,
  KallpaAnalysis,
  FinancialIndicators,
  DashboardData,
  ChartDataPoint,
  EquilibriumProgress,
  ClaudeExtractionResponse,
} from "@/types/kallpa"

export function calcularCostosFijosTotales(items: CostItem[]): number {
  return items
    .filter((item) => item.tipo === "Fijo")
    .reduce((acc, item) => acc + (item.monto_bs || 0), 0)
}

export function calcularCostosVariablesUnitarios(items: CostItem[]): number {
  return items
    .filter((item) => item.tipo === "Variable")
    .reduce((acc, item) => acc + (item.monto_bs || 0), 0)
}

export function calcularMargenUnitario(
  precioVenta: number,
  costoVariableUnitario: number
): number {
  return precioVenta - costoVariableUnitario
}

export function calcularMargenPorcentual(
  margenUnitario: number,
  precioVenta: number
): number {
  return parseFloat(((margenUnitario / precioVenta) * 100).toFixed(2))
}

export function calcularPuntoEquilibrio(
  costosFijos: number,
  margenUnitario: number
): number {
  if (margenUnitario <= 0) return 0
  return Math.ceil(costosFijos / margenUnitario)
}

export function buildFullAnalysis(
  rawItems: CostItem[],
  precioVenta: number,
  ventasMes: number,
  nombre: string,
  rubro: string,
  ciudad: string,
  productoSingular: string = "unidad",
  productoPlural: string = "unidades"
): KallpaAnalysis {
  const costosFijos = calcularCostosFijosTotales(rawItems)
  const costoVariableUnitario = calcularCostosVariablesUnitarios(rawItems)
  const margenUnitario = calcularMargenUnitario(precioVenta, costoVariableUnitario)
  const margenPorcentual = calcularMargenPorcentual(margenUnitario, precioVenta)
  const puntoEquilibrio = calcularPuntoEquilibrio(costosFijos, margenUnitario)

  const ingresoMensual = ventasMes * precioVenta
  const gananciaNetaMensual =
    ventasMes * precioVenta - ventasMes * costoVariableUnitario - costosFijos
  const superaPuntoEquilibrio = ventasMes >= puntoEquilibrio
  const unidadesSobreEquilibrio = ventasMes - puntoEquilibrio

  const financialIndicators: FinancialIndicators = {
    costos_fijos_totales: costosFijos,
    costos_variables_unitarios: costoVariableUnitario,
    precio_de_venta: precioVenta,
    margen_ganancia_unitario: margenUnitario,
    margen_ganancia_porcentual: margenPorcentual,
    punto_de_equilibrio_unidades: puntoEquilibrio,
  }

  const distribucionCostos: ChartDataPoint[] = [
    {
      name: "Costos Fijos",
      value: costosFijos,
      fill: "#2D6A4F",
      descripcion: "Costos mensuales que no dependen del volumen de ventas",
    },
    {
      name: "Costos Variables (mensual estimado)",
      value: costoVariableUnitario * ventasMes,
      fill: "#E76F51",
      descripcion: "Costos variables totales del mes según ventas estimadas",
    },
  ]

  const desgloseVariablesPorUnidad: ChartDataPoint[] = rawItems
    .filter((item) => item.tipo === "Variable")
    .map((item) => ({
      name: item.concepto,
      value: item.monto_bs,
      fill: "#E9C46A",
    }))

  const porcentajeAvance =
    puntoEquilibrio > 0
      ? Math.min(
          parseFloat(((ventasMes / puntoEquilibrio) * 100).toFixed(1)),
          100
        )
      : 0

  const equilibrioProgress: EquilibriumProgress = {
    ventas_actuales: ventasMes,
    punto_equilibrio: puntoEquilibrio,
    porcentaje_avance: porcentajeAvance,
    excedente_unidades: unidadesSobreEquilibrio,
  }

  const dashboardData: DashboardData = {
    emprendedora: {
      nombre,
      rubro,
      ciudad,
      canal_principal: "WhatsApp",
      fecha_analisis: new Date().toISOString().split("T")[0],
    },
    ventas_actuales_mes: ventasMes,
    ingreso_mensual_estimado_bs: ingresoMensual,
    ganancia_neta_mensual_bs: gananciaNetaMensual,
    supera_punto_equilibrio: superaPuntoEquilibrio,
    unidades_sobre_equilibrio: unidadesSobreEquilibrio,
    producto_singular: productoSingular,
    producto_plural: productoPlural,
    charts: {
      distribucion_costos: distribucionCostos,
      desglose_variables_por_unidad: desgloseVariablesPorUnidad,
      equilibrio_progress: equilibrioProgress,
    },
    kallpa_insight: "",
  }

  return {
    excel_simulation: rawItems,
    financial_indicators: financialIndicators,
    dashboard_data: dashboardData,
  }
}

export function buildAnalysisFromExtraction(
  extracted: ClaudeExtractionResponse["extracted_data"]
): KallpaAnalysis {
  const rawItems: CostItem[] = (extracted.costs || [])
    .filter((cost) => cost.concepto && cost.monto_bs != null)
    .map((cost, index) => ({
      id: `COST_${String(index + 1).padStart(3, "0")}`,
      concepto: cost.concepto,
      tipo: cost.tipo || "Variable",
      monto_bs: cost.monto_bs || 0,
      frecuencia: cost.frecuencia || "mensual",
    }))

  return buildFullAnalysis(
    rawItems,
    extracted.precio_venta ?? 0,
    extracted.ventas_mes ?? 0,
    extracted.nombre_emprendedora ?? "Emprendedora",
    extracted.rubro ?? "Emprendimiento",
    extracted.ciudad ?? "Cochabamba",
    extracted.producto_singular ?? "unidad",
    extracted.producto_plural ?? "unidades"
  )
}
