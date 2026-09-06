import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/styles/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#E84C89",
        secondary: "#F5A3C7",
        accent: "#C72B7F",
        light_bg: "#FFF8FC",
        dark: "#2A2A2A",
        border: "#DCDCE0",
        success: { light: "#D1FAE5", DEFAULT: "#10B981", dark: "#065F46" },
        warning: { light: "#FEF3C7", DEFAULT: "#F59E0B", dark: "#92400E" },
        danger: { light: "#FEE2E2", DEFAULT: "#EF4444", dark: "#991B1B" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        // Radio base del sistema de diseño
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};

export default config;
