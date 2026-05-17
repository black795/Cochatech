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
    <div
      style={{
        background: "#fff",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 20px 0",
        }}
      >
        <h3
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 15,
            fontWeight: 900,
            color: "var(--text-dark)",
          }}
        >
          Costos Detallados
        </h3>
        <button
          onClick={() => downloadCSV(items)}
          style={{
            background: "var(--green-deep)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "8px 16px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          ⬇ Exportar CSV
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14 }}>
          <thead>
            <tr>
              {["#", "Concepto", "Tipo", "Monto (Bs)"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 20px",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    background: "var(--surface)",
                    textAlign: h === "Monto (Bs)" ? "right" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "12px 20px", fontSize: 12, color: "var(--text-muted)" }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>
                  {item.concepto}
                </td>
                <td style={{ padding: "12px 20px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      borderRadius: 100,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 800,
                      background: item.tipo === "Fijo" ? "#e3f5ed" : "var(--amber-light)",
                      color: item.tipo === "Fijo" ? "var(--green-mid)" : "var(--amber)",
                    }}
                  >
                    {item.tipo}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 20px",
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: "right",
                    color: "var(--text-dark)",
                  }}
                >
                  {(item.monto_bs || 0).toFixed(2)}
                </td>
              </tr>
            ))}

            {/* Totals row */}
            <tr>
              <td
                colSpan={2}
                style={{
                  padding: "14px 20px",
                  background: "var(--green-pale)",
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 14,
                  fontWeight: 900,
                  borderTop: "2px solid var(--green-light)",
                  color: "var(--text-dark)",
                }}
              >
                Totales
              </td>
              <td
                colSpan={2}
                style={{
                  padding: "14px 20px",
                  background: "var(--green-pale)",
                  borderTop: "2px solid var(--green-light)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "5px 12px",
                      borderRadius: 8,
                      background: "#e3f5ed",
                      color: "var(--green-mid)",
                    }}
                  >
                    Fijos: Bs {totalFijos.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: "5px 12px",
                      borderRadius: 8,
                      background: "var(--amber-light)",
                      color: "var(--amber)",
                    }}
                  >
                    Variables/u: Bs {totalVariables.toLocaleString()}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
