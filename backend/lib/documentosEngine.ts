import type {
  BusinessCanvas,
  CanvasSeccion,
  DocumentosOutput,
  KallpaAnalysis,
  PlanillaCostos,
  PlanillaProducto,
} from "@/types/kallpa"

function emptySeccion(titulo: string): CanvasSeccion {
  return { titulo, criterios: [] }
}

export function buildPlanillaCostos(analysis: KallpaAnalysis): PlanillaCostos {
  const { financial_indicators: fi, dashboard_data: dd, excel_simulation } =
    analysis
  const { emprendedora } = dd

  const costoTotalUnitario = fi.costos_variables_unitarios

  const productoBase: PlanillaProducto = {
    nombre: emprendedora.rubro,
    descripcion: "",
    precioVenta: fi.precio_de_venta,
    costoTotal: costoTotalUnitario,
    ganancia: fi.precio_de_venta - costoTotalUnitario,
  }

  return {
    emprendedora: emprendedora.nombre,
    emprendimiento: emprendedora.rubro,
    fechaActualizacion: new Date().toLocaleDateString("es-BO"),
    productos: [productoBase],
    tablaCostos: excel_simulation,
    costoFijoTotal: fi.costos_fijos_totales,
    costoVariableTotal: fi.costos_variables_unitarios,
    costoTotalUnitario,
    puntoEquilibrio: fi.punto_de_equilibrio_unidades,
  }
}

export function buildBusinessCanvasBase(
  analysis: KallpaAnalysis
): BusinessCanvas {
  const { financial_indicators: fi, dashboard_data: dd, excel_simulation } =
    analysis
  const { emprendedora } = dd

  return {
    datosGenerales: {
      nombreEmprendedora: emprendedora.nombre,
      nombreEmprendimiento: emprendedora.rubro,
      telefono: "",
      actividadPrincipal: emprendedora.rubro,
      lugarVenta: emprendedora.ciudad,
      horarioVenta: "",
      diasVenta: "",
    },
    segmentosClientes: emptySeccion("Segmentos de Clientes"),
    propuestaValor: emptySeccion("Propuesta de Valor"),
    canales: emptySeccion("Canales"),
    relacionClientes: emptySeccion("Relación con Clientes"),
    fuentesIngresos: {
      lineas: [
        {
          producto: emprendedora.rubro,
          metodoPago: "",
          precioEstimado: fi.precio_de_venta,
        },
      ],
    },
    recursosClaves: emptySeccion("Recursos Claves"),
    actividadesClaves: emptySeccion("Actividades Claves"),
    asociacionesClaves: {
      socios: [],
    },
    estructuraCostos: {
      costos: excel_simulation
        .filter((item) => item.concepto)
        .map((item) => ({
          concepto: item.concepto,
          tipo: item.tipo || "N/A",
          prioridad: item.tipo === "Fijo" ? "Alta" : "Media",
        })),
    },
  }
}

export function buildDocumentosOutput(
  analysis: KallpaAnalysis
): DocumentosOutput {
  return {
    planillaCostos: buildPlanillaCostos(analysis),
    businessCanvas: buildBusinessCanvasBase(analysis),
  }
}
