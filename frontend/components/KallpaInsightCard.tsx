"use client"

const FALLBACK_INSIGHT =
  "¡Tu negocio ya está tomando forma, pues! De a poco vamos ordenando los números nomás."

export default function KallpaInsightCard({ insight }: { insight: string }) {
  const displayInsight =
    insight && insight.trim().length > 10 ? insight : FALLBACK_INSIGHT

  return (
    <div className="max-w-sm mx-auto">
      <div
        className="rounded-2xl rounded-tl-none shadow p-4"
        style={{ backgroundColor: "#DCF8C6" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold">
            KA
          </div>
          <p className="text-xs text-gray-500">
            Kallpa · Asesor Financiero Digital
          </p>
        </div>

        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
          {displayInsight}
        </p>

        <div className="flex justify-end items-center gap-1 mt-3">
          <span className="text-xs text-gray-500">10:47 a.m.</span>
          <span className="text-blue-500 text-xs">✓✓</span>
        </div>
      </div>
    </div>
  )
}
