import type { KallpaAnalysis, CostItem } from "../types/kallpa"
import { buildFullAnalysis } from "./financialEngine"

const rawItems: CostItem[] = [
  {
    id: "COST_001",
    concepto: "Harina (medio kilo)",
    tipo: "Variable",
    monto_bs: 4.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_002",
    concepto: "Azúcar",
    tipo: "Variable",
    monto_bs: 3.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_003",
    concepto: "Huevos (4 unidades)",
    tipo: "Variable",
    monto_bs: 6.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_004",
    concepto: "Mantequilla",
    tipo: "Variable",
    monto_bs: 8.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_005",
    concepto: "Leche condensada (relleno)",
    tipo: "Variable",
    monto_bs: 12.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_006",
    concepto: "Colorante y vainilla",
    tipo: "Variable",
    monto_bs: 3.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_007",
    concepto: "Fondant decorativo",
    tipo: "Variable",
    monto_bs: 27.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_008",
    concepto: "Caja de cartón (empaque)",
    tipo: "Variable",
    monto_bs: 8.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_009",
    concepto: "Cintas y papel tisú (decoración)",
    tipo: "Variable",
    monto_bs: 4.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_010",
    concepto: "Gas proporcional por torta",
    tipo: "Variable",
    monto_bs: 2.0,
    frecuencia: "por_unidad",
  },
  {
    id: "COST_011",
    concepto: "Alquiler taller",
    tipo: "Fijo",
    monto_bs: 400.0,
    frecuencia: "mensual",
  },
  {
    id: "COST_012",
    concepto: "Electricidad (horno eléctrico)",
    tipo: "Fijo",
    monto_bs: 120.0,
    frecuencia: "mensual",
  },
  {
    id: "COST_013",
    concepto: "Internet (WhatsApp pedidos)",
    tipo: "Fijo",
    monto_bs: 89.0,
    frecuencia: "mensual",
  },
  {
    id: "COST_014",
    concepto: "Utensilios y moldes",
    tipo: "Fijo",
    monto_bs: 50.0,
    frecuencia: "mensual",
  },
  {
    id: "COST_015",
    concepto: "Flyers y publicidad impresa",
    tipo: "Fijo",
    monto_bs: 30.0,
    frecuencia: "mensual",
  },
  {
    id: "COST_016",
    concepto: "Muestras y promoción",
    tipo: "Fijo",
    monto_bs: 20.0,
    frecuencia: "mensual",
  },
  {
    id: "COST_017",
    concepto: "Transporte / delivery",
    tipo: "Fijo",
    monto_bs: 80.0,
    frecuencia: "mensual",
  },
]

export const mockKallpaAnalysis: KallpaAnalysis = buildFullAnalysis(
  rawItems,
  150,
  18,
  "Lorena Mamani",
  "Repostería artesanal — Tortas decoradas",
  "Sacaba, Cochabamba"
)
