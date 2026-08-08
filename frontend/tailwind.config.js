/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0B0F19",
        panel: "#0F1524",
        panel2: "#131B2E",
        border: "#1E293B",
        cyan: {
          glow: "#00F0FF",
        },
        emerald: {
          glow: "#10B981",
        },
        amber: {
          glow: "#F59E0B",
        },
        rose: {
          glow: "#FB7185",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,240,255,0.25)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.25)",
        "glow-rose": "0 0 20px rgba(251,113,133,0.25)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(0,240,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [],
};
