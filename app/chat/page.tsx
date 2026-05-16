"use client"

import { useState } from "react"
import ChatPanel from "@/components/ChatPanel"
import DashboardPanel from "@/components/DashboardPanel"
import type { KallpaAnalysis } from "@/types/kallpa"

export default function ChatPage() {
  const [analysis, setAnalysis] = useState<KallpaAnalysis | null>(null)

  return (
    <main className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-[#2D6A4F] text-white px-6 py-3 flex items-center gap-3 shadow-md">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
          <span className="text-[#2D6A4F] font-bold text-xs">K</span>
        </div>
        <div>
          <h1 className="font-bold text-sm">empleaemprende.bo</h1>
          <p className="text-green-200 text-xs">
            Fundación Kallpa · Módulo Financiero
          </p>
        </div>
        {analysis && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span className="text-green-200 text-xs">Análisis listo</span>
          </div>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-56px)]">
        <div className="lg:w-1/2 h-[500px] lg:h-full">
          <ChatPanel onAnalysisReady={(data) => setAnalysis(data)} />
        </div>

        <div className="lg:w-1/2 h-[500px] lg:h-full">
          <DashboardPanel analysis={analysis} />
        </div>
      </div>
    </main>
  )
}
