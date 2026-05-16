import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "empleaemprende.bo — Fundación Kallpa",
  description:
    "Módulo financiero digital para emprendedoras bolivianas. Análisis de costos, márgenes y punto de equilibrio desde conversaciones de WhatsApp.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
