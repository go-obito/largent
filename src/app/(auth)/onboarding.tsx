import { images } from "@/constants/images";
import { colors, fontFamily, radii, spacing, typography } from "@/theme";
import { Image } from "expo-image";
import { type Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OnboardingScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.brand}>
          <Image source={images.logo} style={styles.logo} contentFit="contain" />
          <Text style={styles.brandName}>Largent</Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.illustration}>
            <View style={styles.balanceCard}>
              <Text style={styles.eyebrow}>YOUR MONEY, CLEARLY</Text>
              <Text style={styles.mockBalance}>₵12,450.00</Text>
              <View style={styles.mockRow}>
                <Text style={styles.income}>+ Income</Text>
                <Text style={styles.expense}>− Expenses</Text>
              </View>
            </View>
          </View>
          <Text style={styles.title}>Money clarity,{"\n"}every day.</Text>
          <Text style={styles.description}>Track income and expenses, set budgets, import bank statements, and see the reports that help you move forward.</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push("/sign-up" as Href)}>
            <Text style={styles.primaryLabel}>Get started</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.push("/sign-in" as Href)}>
            <Text style={styles.secondaryLabel}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral[50] },
  screen: { flex: 1, paddingHorizontal: spacing[5], paddingBottom: spacing[5] },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing[2], minHeight: 64 },
  logo: { width: 32, height: 32 },
  brandName: { ...typography.title2, color: colors.neutral[900] },
  hero: { flex: 1, justifyContent: "center" },
  illustration: { height: 270, borderRadius: radii.xl, backgroundColor: colors.primary[50], justifyContent: "center", padding: spacing[6] },
  balanceCard: { backgroundColor: colors.neutral.surface, borderColor: colors.primary[100], borderWidth: 1, borderRadius: radii.lg, padding: spacing[5], gap: spacing[3] },
  eyebrow: { ...typography.small, color: colors.neutral[500] },
  mockBalance: { ...typography.title1, color: colors.neutral[900], fontVariant: ["tabular-nums"] },
  mockRow: { flexDirection: "row", gap: spacing[4] },
  income: { ...typography.caption, color: colors.semantic.income },
  expense: { ...typography.caption, color: colors.semantic.expense },
  title: { ...typography.display, color: colors.neutral[900], marginTop: spacing[8] },
  description: { ...typography.body, color: colors.neutral[600], marginTop: spacing[3] },
  actions: { gap: spacing[3] },
  primaryButton: { height: 52, borderRadius: radii.md, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center" },
  primaryLabel: { ...typography.bodyMedium, fontFamily: fontFamily.semiBold, color: colors.neutral.surface },
  secondaryButton: { height: 52, borderRadius: radii.md, borderColor: colors.neutral[200], borderWidth: 1, backgroundColor: colors.neutral.surface, alignItems: "center", justifyContent: "center" },
  secondaryLabel: { ...typography.bodyMedium, fontFamily: fontFamily.semiBold, color: colors.neutral[900] },
});