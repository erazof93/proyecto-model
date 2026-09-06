// ============================================================================
// Design tokens compartidos entre client y admin.
// Mantener sincronizado con tailwind.config.ts de cada app.
// ============================================================================

export const colors = {
  primary: "#E84C89",
  secondary: "#F5A3C7",
  accent: "#C72B7F",
  light_bg: "#FFF8FC",
  dark: "#2A2A2A",
  border: "#DCDCE0",
  success: { light: "#D1FAE5", DEFAULT: "#10B981", dark: "#065F46" },
  warning: { light: "#FEF3C7", DEFAULT: "#F59E0B", dark: "#92400E" },
  danger: { light: "#FEE2E2", DEFAULT: "#EF4444", dark: "#991B1B" },
} as const;

export const radius = {
  sm: "8px",
  base: "12px",
  lg: "16px",
  xl: "24px",
} as const;
