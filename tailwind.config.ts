import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kallpa: {
          primary: "#2D6A4F",
          accent: "#E76F51",
          warm: "#E9C46A",
        },
      },
    },
  },
  plugins: [],
}

export default config
