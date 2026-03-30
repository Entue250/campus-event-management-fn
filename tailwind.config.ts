import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary blue palette
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        // Deep navy palette for sidebar/admin
        navy: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5b8f8",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#1e2a5e",
          800: "#162050",
          900: "#0f172a",
          950: "#0a0f23",
        },
        // Success / event status colours
        success: "#16a34a",
        warning: "#d97706",
        danger: "#dc2626",
        info: "#0891b2",
      },
      fontFamily: {
        // Display font for headings — loaded via Google Fonts in layout
        display: ["var(--font-display)", "serif"],
        // Body font
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,.08), 0 1px 2px -1px rgba(0,0,0,.06)",
        elevated:
          "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)",
        nav: "0 1px 0 0 rgba(0,0,0,.08)",
      },
      animation: {
        "fade-in": "fadeIn .25s ease-in-out",
        "slide-up": "slideUp .3s ease-out",
        "slide-in": "slideIn .2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(.4,0,.6,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
