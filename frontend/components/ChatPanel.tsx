"use client"

import { useState, useRef, useEffect } from "react"
import type {
  BusinessCanvas,
  CanvasDetection,
  CanvasProgress,
  CanvasType,
  ChatMessage,
  KallpaAnalysis,
  UIMessage,
} from "@/types/kallpa"

const WELCOME_TEXT =
  "¡Hola! Soy Kallpa, tu asesor financiero digital de la Fundación Kallpa. Contame de tu emprendimiento, pues — ¿qué vendés y desde dónde?"

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function ChatPanel({
  onAnalysisReady,
  onCanvasUpdate,
  onCanvasReady,
}: {
  onAnalysisReady: (data: KallpaAnalysis) => void
  onCanvasUpdate: (progress: CanvasProgress, tipo: CanvasType) => void
  onCanvasReady: (canvas: BusinessCanvas, tipo: CanvasType) => void
}) {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mount-only welcome message to avoid SSR/CSR Date mismatch
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: WELCOME_TEXT,
        timestamp: new Date(),
      },
    ])
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: UIMessage = {
      id: newId("u"),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    const priorHistory: ChatMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: priorHistory,
          lastUserMessage: text,
        }),
      })

      const data = (await res.json()) as {
        reply?: string
        analysis: KallpaAnalysis | null
        canvas_detection?: CanvasDetection
        canvas_progress?: CanvasProgress
        canvas_ready?: boolean
        canvas?: BusinessCanvas | null
      }

      const assistantMsg: UIMessage = {
        id: newId("a"),
        role: "assistant",
        content:
          data.reply ??
          "Disculpá, no entendí bien. ¿Podés decirmelo de otra forma?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      if (data.analysis) {
        onAnalysisReady(data.analysis)
      }

      if (
        data.canvas_detection &&
        data.canvas_detection.tipo !== "unknown" &&
        data.canvas_progress
      ) {
        onCanvasUpdate(data.canvas_progress, data.canvas_detection.tipo)
      }

      if (
        data.canvas_ready &&
        data.canvas &&
        data.canvas_detection?.tipo &&
        data.canvas_detection.tipo !== "unknown"
      ) {
        onCanvasReady(data.canvas, data.canvas_detection.tipo)
      }
    } catch (err) {
      console.error("[ChatPanel] fetch error:", err)
      setMessages((prev) => [
        ...prev,
        {
          id: newId("e"),
          role: "assistant",
          content:
            "Disculpá, tuve un problemita técnico nomás. ¿Podés intentar de nuevo?",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden">
      <div
        className="text-white px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: "#2D6A4F" }}
      >
        <div className="w-9 h-9 rounded-full bg-white text-[#2D6A4F] flex items-center justify-center font-bold text-sm flex-shrink-0">
          KA
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm">Kallpa · Asesor Financiero</p>
          <p className="text-green-200 text-xs">
            {loading ? "escribiendo…" : "en línea"}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ backgroundColor: "#ECE5DD" }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user"
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow whitespace-pre-line text-gray-800 ${
                  isUser ? "rounded-tr-none" : "rounded-tl-none"
                }`}
                style={{ backgroundColor: isUser ? "#DCF8C6" : "#FFFFFF" }}
              >
                <p>{msg.content}</p>
                <p
                  suppressHydrationWarning
                  className="text-[10px] text-gray-400 text-right mt-1"
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-lg rounded-tl-none px-3 py-2 shadow"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div className="flex gap-1" aria-label="escribiendo">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                ></span>
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-3 flex gap-2 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Escribí un mensaje…"
          className="flex-1 px-3 py-2 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-[#2D6A4F] text-sm"
          disabled={loading}
          aria-label="Mensaje al asesor"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-full text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          style={{ backgroundColor: "#2D6A4F" }}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
