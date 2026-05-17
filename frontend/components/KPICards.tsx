"use client"

import type { FinancialIndicators } from "@/types/kallpa"

function KpiCard({
  label,
  value,
  sub,
  barColor,
  valueColor,
}: {
  label: string
  value: string
  sub: string
  barColor: string
  valueColor: string
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "var(--radius-md)",
        padding: 20,
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: barColor,
        }}
      />
      <p
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginBottom: 10,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 28,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: valueColor,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 6 }}>
        {sub}
      </p>
    </div>
  )
}

export default function KPICards({
  indicators,
  productoSingular = "unidad",
  productoPlural = "unidades",
}: {
  indicators: FinancialIndicators
  productoSingular?: string
  productoPlural?: string
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <KpiCard
        label="Costos Fijos Totales"
        value={`Bs ${indicators.costos_fijos_totales.toLocaleString()}`}
        sub="Gastos fijos al mes"
        barColor="var(--red-soft)"
        valueColor="var(--red-soft)"
      />
      <KpiCard
        label="Costo por Unidad"
        value={`Bs ${indicators.costos_variables_unitarios}`}
        sub={`Costo de 1 ${productoSingular}`}
        barColor="var(--amber)"
        valueColor="var(--amber)"
      />
      <KpiCard
        label="Precio de Venta"
        value={`Bs ${indicators.precio_de_venta}`}
        sub={`Por ${productoSingular}`}
        barColor="#6b8f80"
        valueColor="var(--text-mid)"
      />
      <KpiCard
        label="Margen de Ganancia"
        value={`${indicators.margen_ganancia_porcentual}%`}
        sub={`Por ${productoSingular} vendida`}
        barColor="var(--green-bright)"
        valueColor="var(--green-mid)"
      />

      {/* Full-width break-even card */}
      <div
        style={{
          gridColumn: "1 / -1",
          background: "#fff",
          borderRadius: "var(--radius-md)",
          padding: "20px 22px",
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "var(--green-bright)",
          }}
        />
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 8,
            }}
          >
            Punto de Equilibrio
          </p>
          <p
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 32,
              fontWeight: 900,
              lineHeight: 1,
              color: "var(--green-mid)",
            }}
          >
            {indicators.punto_de_equilibrio_unidades} {productoPlural}/mes
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginTop: 6 }}>
            Lo mínimo para no perder
          </p>
        </div>
        <span
          style={{
            background: "var(--green-pale)",
            border: "1px solid var(--green-light)",
            borderRadius: 100,
            padding: "6px 14px",
            fontSize: 11,
            fontWeight: 800,
            color: "var(--green-mid)",
            letterSpacing: "0.06em",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          🎯 Meta mensual
        </span>
      </div>
    </div>
  )
}
