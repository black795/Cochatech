import {
  calcularCostosFijosTotales,
  calcularCostosVariablesUnitarios,
  calcularMargenUnitario,
  calcularMargenPorcentual,
  calcularPuntoEquilibrio,
} from "../backend/lib/financialEngine"
import type { CostItem } from "../types/kallpa"

const lorenaItems: CostItem[] = [
  { id: "COST_001", concepto: "Harina (medio kilo)", tipo: "Variable", monto_bs: 4.0, frecuencia: "por_unidad" },
  { id: "COST_002", concepto: "Azúcar", tipo: "Variable", monto_bs: 3.0, frecuencia: "por_unidad" },
  { id: "COST_003", concepto: "Huevos (4 unidades)", tipo: "Variable", monto_bs: 6.0, frecuencia: "por_unidad" },
  { id: "COST_004", concepto: "Mantequilla", tipo: "Variable", monto_bs: 8.0, frecuencia: "por_unidad" },
  { id: "COST_005", concepto: "Leche condensada (relleno)", tipo: "Variable", monto_bs: 12.0, frecuencia: "por_unidad" },
  { id: "COST_006", concepto: "Colorante y vainilla", tipo: "Variable", monto_bs: 3.0, frecuencia: "por_unidad" },
  { id: "COST_007", concepto: "Fondant decorativo", tipo: "Variable", monto_bs: 27.0, frecuencia: "por_unidad" },
  { id: "COST_008", concepto: "Caja de cartón (empaque)", tipo: "Variable", monto_bs: 8.0, frecuencia: "por_unidad" },
  { id: "COST_009", concepto: "Cintas y papel tisú (decoración)", tipo: "Variable", monto_bs: 4.0, frecuencia: "por_unidad" },
  { id: "COST_010", concepto: "Gas proporcional por torta", tipo: "Variable", monto_bs: 2.0, frecuencia: "por_unidad" },
  { id: "COST_011", concepto: "Alquiler taller", tipo: "Fijo", monto_bs: 400.0, frecuencia: "mensual" },
  { id: "COST_012", concepto: "Electricidad (horno eléctrico)", tipo: "Fijo", monto_bs: 120.0, frecuencia: "mensual" },
  { id: "COST_013", concepto: "Internet (WhatsApp pedidos)", tipo: "Fijo", monto_bs: 89.0, frecuencia: "mensual" },
  { id: "COST_014", concepto: "Utensilios y moldes", tipo: "Fijo", monto_bs: 50.0, frecuencia: "mensual" },
  { id: "COST_015", concepto: "Flyers y publicidad impresa", tipo: "Fijo", monto_bs: 30.0, frecuencia: "mensual" },
  { id: "COST_016", concepto: "Muestras y promoción", tipo: "Fijo", monto_bs: 20.0, frecuencia: "mensual" },
  { id: "COST_017", concepto: "Transporte / delivery", tipo: "Fijo", monto_bs: 80.0, frecuencia: "mensual" },
]

describe("financialEngine — escenario Lorena Mamani", () => {
  test("calcularCostosFijosTotales suma los 7 costos fijos en 789 Bs", () => {
    expect(calcularCostosFijosTotales(lorenaItems)).toBe(789)
  })

  test("calcularCostosVariablesUnitarios suma los 10 costos variables en 77 Bs", () => {
    expect(calcularCostosVariablesUnitarios(lorenaItems)).toBe(77)
  })

  test("calcularMargenUnitario(150, 77) retorna 73", () => {
    expect(calcularMargenUnitario(150, 77)).toBe(73)
  })

  test("calcularMargenPorcentual(73, 150) retorna 48.67 (redondeo a 2 decimales)", () => {
    expect(calcularMargenPorcentual(73, 150)).toBe(48.67)
  })

  test("calcularPuntoEquilibrio(789, 73) retorna 11 (Math.ceil de 10.808...)", () => {
    expect(calcularPuntoEquilibrio(789, 73)).toBe(11)
  })
})

describe("financialEngine — invariantes", () => {
  test("punto de equilibrio siempre es un número entero", () => {
    const casos: Array<[number, number]> = [
      [789, 73],
      [1000, 17],
      [500, 23],
      [1234, 56],
      [10001, 99],
    ]
    for (const [cf, mu] of casos) {
      const pe = calcularPuntoEquilibrio(cf, mu)
      expect(Number.isInteger(pe)).toBe(true)
    }
  })

  test("margen porcentual siempre está entre 0 y 100", () => {
    const casos: Array<[number, number]> = [
      [73, 150],
      [50, 100],
      [25, 100],
      [10, 200],
      [1, 1000],
      [99, 100],
    ]
    for (const [mu, pv] of casos) {
      const pct = calcularMargenPorcentual(mu, pv)
      expect(pct).toBeGreaterThanOrEqual(0)
      expect(pct).toBeLessThanOrEqual(100)
    }
  })
})
