import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        jarvis: {
          cyan: "#4CD6E8",
          blue: "#2E8FE8",
          deep: "#0A1220",
          panel: "#0D1B2E",
          amber: "#E8A23C",
          red: "#E84C4C",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.03)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        blink: {
          "0%, 92%, 100%": { transform: "scaleY(1)" },
          "96%": { transform: "scaleY(0.1)" },
        },
        "float-particle": {
          "0%": { transform: "translate(0,0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translate(var(--px), var(--py))", opacity: "0" },
        },
        "talk-wave": {
          "0%, 100%": { height: "20%" },
          "50%": { height: "100%" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 8s linear infinite",
        "spin-reverse": "spin-reverse 12s linear infinite",
        "spin-slower": "spin-slow 20s linear infinite",
        "pulse-ring": "pulse-ring 2.4s ease-in-out infinite",
        scan: "scan 3s linear infinite",
        blink: "blink 4.5s ease-in-out infinite",
        "float-particle": "float-particle 4s ease-in infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
