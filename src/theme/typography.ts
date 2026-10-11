export const fontFamily = { regular: "Inter_400Regular", medium: "Inter_500Medium", semiBold: "Inter_600SemiBold", bold: "Inter_700Bold" } as const;
export const typography = {
  display: { fontSize: 36, lineHeight: 44, fontFamily: fontFamily.bold }, title1: { fontSize: 28, lineHeight: 36, fontFamily: fontFamily.bold }, title2: { fontSize: 22, lineHeight: 28, fontFamily: fontFamily.semiBold }, title3: { fontSize: 18, lineHeight: 24, fontFamily: fontFamily.semiBold }, body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular }, bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.medium }, caption: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular }, small: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.medium },
} as const;
