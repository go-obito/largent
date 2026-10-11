import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, fontFamily, typography } from "@/theme";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mark}>
          <Text style={styles.markGlyph}>L</Text>
        </View>
        <Text style={styles.eyebrow}>PERSONAL FINANCE, MADE CLEAR</Text>
        <Text style={styles.title}>Welcome to Largent</Text>
        <Text style={styles.description}>
          Your money overview starts here. Explore the onboarding flow to see how
          Largent helps you track spending, set budgets, and understand your money.
        </Text>
        <Pressable
          onPress={() => router.push("/onboarding")}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Preview onboarding</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
      </View>
      <Text style={styles.footer}>A calmer way to manage your money.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 28,
    backgroundColor: colors.neutral.background,
  },
  content: {
    width: "100%",
    maxWidth: 420,
    flex: 1,
    justifyContent: "center",
  },
  mark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.forest,
    marginBottom: 32,
  },
  markGlyph: {
    color: colors.neutral.background,
    fontFamily: fontFamily.bold,
    fontSize: 29,
  },
  eyebrow: {
    color: colors.brand.green,
    fontFamily: fontFamily.bold,
    fontSize: 10,
    letterSpacing: 1.6,
    marginBottom: 12,
  },
  title: {
    ...typography.h1,
    color: colors.brand.charcoal,
    marginBottom: 14,
  },
  description: {
    ...typography.bodyLarge,
    color: colors.neutral.textSecondary,
    marginBottom: 28,
  },
  button: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.brand.forest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    color: colors.neutral.background,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  buttonArrow: {
    color: colors.neutral.background,
    fontFamily: fontFamily.medium,
    fontSize: 19,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  footer: {
    color: colors.neutral.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 11,
    textAlign: "center",
  },
});
