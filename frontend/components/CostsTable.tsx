"use client"

import type { CostItem } from "@/types/kallpa"

function downloadCSV(items: CostItem[]) {
  const headers = "id,concepto,tipo,monto_bs,frecuencia"
  const rows = items.map((i) => {
    const concepto = `"${(i.concepto || "").replace(/"/g, '""')}"`
    return `${i.id || ""},${concepto},${i.tipo || ""},${i.monto_bs || 0},${i.frecuencia || ""}`
  })
  const csv = [headers, ...rows].join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "kallpa-costos.csv"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function CostsTable({ items }: { items: CostItem[] }) {
  const totalFijos = items
    .filter((i) => i.tipo === "Fijo")
    .reduce((a, b) => a + (b.monto_bs || 0), 0)
  const totalVariables = items
    .filter((i) => i.tipo === "Variable")
    .reduce((a, b) => a + (b.monto_bs || 0), 0)

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-bold text-[#374151]">Costos Detallados</h3>
        <button
          onClick={() => downloadCSV(items)}
          className="px-3 py-1.5 text-sm bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1f4a37] transition"
        >
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Concepto</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-right">Monto (Bs)</th>
              <th className="px-4 py-2 text-left">Frecuencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">
                  {item.id}
                </td>
                <td className="px-4 py-2 text-[#374151]">{item.concepto}</td>
                <td className="px-4 py-2">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-semibold text-white"
                    style={{
                      backgroundColor:
                        item.tipo === "Fijo" ? "#2D6A4F" : "#E76F51",
                    }}
                  >
                    {item.tipo}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-[#374151] font-medium">
                  {(item.monto_bs || 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-gray-600">{item.frecuencia}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold text-[#374151]">
              <td className="px-4 py-3" colSpan={2}>
                Totales
              </td>
              <td className="px-4 py-3" style={{ color: "#2D6A4F" }}>
                Total Fijos: Bs {totalFijos}
              </td>
              <td
                className="px-4 py-3 text-right"
                style={{ color: "#E76F51" }}
              >
                Total Variables/u: Bs {totalVariables}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
