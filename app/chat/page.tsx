"use client"

import { useState } from "react"
import ChatPanel from "@/frontend/components/ChatPanel"
import DashboardPanel from "@/frontend/components/DashboardPanel"
import CanvasProgressBar from "@/frontend/components/CanvasProgressBar"
import BusinessCanvasView from "@/frontend/components/BusinessCanvasView"
import type {
  BusinessCanvas,
  CanvasProgress,
  CanvasType,
  KallpaAnalysis,
} from "@/types/kallpa"

export default function ChatPage() {
  const [analysis, setAnalysis] = useState<KallpaAnalysis | null>(null)
  const [canvasProgress, setCanvasProgress] = useState<CanvasProgress | null>(
    null
  )
  const [canvasType, setCanvasType] = useState<CanvasType | null>(null)
  const [canvas, setCanvas] = useState<BusinessCanvas | null>(null)

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

      <div className="flex flex-col lg:flex-row gap-4 p-4 lg:h-[calc(100vh-56px)]">
        <div className="lg:w-1/2 h-[500px] lg:h-full">
          <ChatPanel
            onAnalysisReady={(data) => setAnalysis(data)}
            onCanvasUpdate={(progress, tipo) => {
              setCanvasProgress(progress)
              setCanvasType(tipo)
            }}
            onCanvasReady={(c, tipo) => {
              setCanvas(c)
              setCanvasType(tipo)
            }}
          />
        </div>

        <div className="lg:w-1/2 h-[500px] lg:h-full flex flex-col gap-3 min-h-0">
          <div className="flex-1 min-h-0">
            <DashboardPanel analysis={analysis} />
          </div>
          {canvasProgress && (
            <div className="flex-shrink-0">
              <CanvasProgressBar
                progress={canvasProgress}
                canvasType={canvasType}
              />
            </div>
          )}
        </div>
      </div>

      {canvas && (
        <div className="w-full px-4 pb-6 animate-fadeIn">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-[#2D6A4F]">
              Tu análisis estratégico
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <BusinessCanvasView canvas={canvas} tipo={canvasType} />
        </div>
      )}
    </main>
  )
}
