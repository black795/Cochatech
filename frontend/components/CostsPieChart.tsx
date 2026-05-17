"use client"

import type { ChartDataPoint } from "@/types/kallpa"

export default function CostsPieChart({ data }: { data: ChartDataPoint[] }) {
  const r = 70
  const C = 2 * Math.PI * r
  const total = data.reduce((s, d) => s + d.value, 0)

  let offset = C / 4
  const segments = data.map((d) => {
    const len = (d.value / total) * C
    const seg = { ...d, len, offset }
    offset -= len
    return seg
  })

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        padding: 20,
      }}
    >
      <h3
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 15,
          fontWeight: 900,
          color: "var(--text-dark)",
          marginBottom: 20,
        }}
      >
        ¿En qué se va tu plata? 💸
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 180 180"
          style={{
            filter: "drop-shadow(0 6px 16px rgba(10,74,50,0.15))",
            flexShrink: 0,
          }}
        >
          <circle cx="90" cy="90" r={r} fill="none" stroke="#e2ece7" strokeWidth="30" />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={r}
              fill="none"
              stroke={s.fill}
              strokeWidth="30"
              strokeDasharray={`${s.len} ${C}`}
              strokeDashoffset={s.offset}
            />
          ))}
          <text
            x="90"
            y="86"
            textAnchor="middle"
            fontFamily="Nunito"
            fontWeight="900"
            fontSize="20"
            fill="#0a4a32"
          >
            Bs
          </text>
          <text
            x="90"
            y="106"
            textAnchor="middle"
            fontFamily="Nunito"
            fontWeight="700"
            fontSize="13"
            fill="#7a9088"
          >
            {total.toLocaleString()}
          </text>
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: d.fill,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark)" }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>
                  {Math.round((d.value / total) * 100)}% · Bs {d.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
