import { mockKallpaAnalysis } from "@/backend/lib/mockDatabase"
import type { KallpaAnalysis } from "@/types/kallpa"
import KPICards from "@/frontend/components/KPICards"
import EquilibriumBadge from "@/frontend/components/EquilibriumBadge"
import CostsTable from "@/frontend/components/CostsTable"
import CostsPieChart from "@/frontend/components/CostsPieChart"
import KallpaInsightCard from "@/frontend/components/KallpaInsightCard"

const CHAT_SIMULADO =
  `Soy Lorena Mamani, hago tortas decoradas en Sacaba, Cochabamba.\n` +
  `Vendo a 150 Bs. Hago 18 tortas al mes.\n` +
  `Alquiler 400 Bs, luz 120 Bs, internet 89 Bs, utensilios 50 Bs, publicidad 30 Bs, muestras 20 Bs, transporte 80 Bs.\n` +
  `Harina 4 Bs, azúcar 3 Bs, huevos 6 Bs, mantequilla 8 Bs, leche condensada 12 Bs, colorante 3 Bs, fondant 27 Bs, caja 8 Bs, cinta y papel tisú 4 Bs, gas por torta 2 Bs.`

async function fetchAnalysis(): Promise<KallpaAnalysis> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
    const res = await fetch(`${baseUrl}/api/analizar-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_text: CHAT_SIMULADO }),
      cache: "no-store",
    })
    if (res.ok) {
      return (await res.json()) as KallpaAnalysis
    }
  } catch {
    // fallback to mock below
  }
  return mockKallpaAnalysis
}

export default async function DashboardPage() {
  const analysis = await fetchAnalysis()
  const { dashboard_data, financial_indicators, excel_simulation } = analysis
  const { emprendedora, charts, supera_punto_equilibrio, kallpa_insight } =
    dashboard_data

  return (
    <div className="bg-[#F8F5F0] min-h-screen text-[#374151]">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: "#2D6A4F" }}
            aria-label="Logo Kallpa"
          >
            KA
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-[#374151]">
              Fundación Kallpa
            </h1>
            <p className="text-sm text-gray-700 truncate">
              <span className="font-semibold">{emprendedora.nombre}</span>
              {" · "}
              {emprendedora.rubro}
              {" · "}
              {emprendedora.ciudad}
            </p>
            <p className="text-xs text-gray-400">
              Análisis del {emprendedora.fecha_analisis}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="lg:col-span-2">
            <KPICards indicators={financial_indicators} />
          </section>

          <section className="lg:col-span-1">
            <EquilibriumBadge
              progress={charts.equilibrio_progress}
              supera={supera_punto_equilibrio}
            />
          </section>

          <section className="lg:col-span-1">
            <CostsPieChart data={charts.distribucion_costos} />
          </section>

          <section className="lg:col-span-2">
            <CostsTable items={excel_simulation} />
          </section>

          <section className="lg:col-span-2">
            <KallpaInsightCard insight={kallpa_insight} />
          </section>
        </div>
      </main>
    </div>
  )
}
