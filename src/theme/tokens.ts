/**
 * Source-of-truth design tokens for TypeScript consumers.
 * NativeWind utilities with matching names are declared in global.css.
 */
export const colors = {
  brand: {
    forest: "#0F5D3B",
    green: "#16A34A",
    mint: "#34D399",
    lightGreen: "#E6F9EE",
    charcoal: "#0B1320",
  },
  semantic: {
    success: "#16A34A",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  neutral: {
    textPrimary: "#0F172A",
    textSecondary: "#64748B",
    border: "#E5E7EB",
    surface: "#F8FAFC",
    background: "#FFFFFF",
  },
} as const;

export const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const typography = {
  h1: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 38.4 },
  h2: { fontFamily: fontFamily.semiBold, fontSize: 24, lineHeight: 31.2 },
  h3: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 26 },
  h4: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22.4 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 25.6 },
  bodyMedium: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 22.4 },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 20.8 },
  caption: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 15.4 },
} as const;
