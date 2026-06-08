import type { Config } from "tailwindcss";

/** Design tokens — single source for Tailwind theme (mockup parity). */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./screens/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF7",
        surface: "#FFFFFF",
        text: {
          DEFAULT: "#1A1A1A",
          secondary: "#5C564F",
        },
        muted: "#9B9B9B",
        gold: "#C9A96E",
        "on-gold": "#FFFFFF",
        red: "#E85454",
        border: "#EBEBEB",
        "error-surface": "#FDECEC",
        "success-surface": "#ECF7F0",
        "success-text": "#2F7D52",
        "gold-10": "#C9A96E1A",
        "gold-15": "#C9A96E26",
        "gold-30": "#C9A96E4D",
        "gold-deep": "#A8824A",
        "dashed-border": "#D8D5CE",
        background: "#FAFAF7",
        "error-bg": "#FDECEC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "8px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 24px rgba(26, 26, 26, 0.06)",
        record: "0 8px 28px rgba(201, 169, 110, 0.16)",
        "record-hover": "0 12px 36px rgba(201, 169, 110, 0.22)",
      },
      keyframes: {
        "record-pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "idle-breathe": {
          "0%, 100%": {
            boxShadow: "0 8px 28px rgba(201, 169, 110, 0.16)",
            transform: "scale(1)",
          },
          "50%": { transform: "scale(1.04)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "skeleton-shimmer": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.52" },
        },
      },
      animation: {
        "record-pulse-ring": "record-pulse-ring 2s ease-out infinite",
        "idle-breathe": "idle-breathe 3s ease-in-out infinite",
        "spin-slow": "spin 1.4s linear infinite",
        "fade-in": "fade-in 0.25s ease-out forwards",
        "sheet-up": "sheet-up 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards",
        "skeleton-shimmer": "skeleton-shimmer 1.5s ease-in-out infinite",
      },
    },
  },
};

export default config;
