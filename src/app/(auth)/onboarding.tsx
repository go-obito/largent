import { images } from "@/constants/images";
import { colors, fontFamily, spacing, typography } from "@/theme";
import { Image } from "expo-image";
import { type Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const illustrationScale = Math.min(1, (width - spacing[8]) / 360, height / 760);
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <Image source={images.logo} style={styles.logo} contentFit="contain" />
          <Text style={styles.brandName}>Largent</Text>
        </View>
        <View style={styles.illustration}>
          <View style={[styles.illustrationContent, { transform: [{ scale: illustrationScale }] }]}>
            <View style={styles.backdrop} />
            <View style={styles.blueSweep} />
            <View style={styles.phoneShadow} />
            <View style={styles.phone}>
            <View style={styles.phoneScreen}>
              <View style={styles.camera} />
              <View style={styles.phoneHeader}>
                <View>
                  <Text style={styles.greeting}>Good morning,</Text>
                  <Text style={styles.userName}>Michael 👋</Text>
                </View>
                <View style={styles.avatar}><Text style={styles.avatarLetter}>M</Text></View>
              </View>
              <View style={styles.balanceCard}>
                <Text style={styles.eyebrow}>Total Balance</Text>
                <Text style={styles.mockBalance}>₵5,430.00</Text>
                <View style={styles.mockRow}>
                  <View><Text style={styles.metricLabel}>↗ Income</Text><Text style={styles.metricValue}>₵7,200.00</Text></View>
                  <View><Text style={styles.metricLabel}>↘ Expenses</Text><Text style={styles.metricValue}>₵1,770.00</Text></View>
                </View>
              </View>
              <View style={styles.transactionsHeader}>
                <Text style={styles.transactionsTitle}>Recent Transactions</Text>
                <Text style={styles.seeAll}>See all</Text>
              </View>
              <View style={styles.transactionRow}>
                <View style={[styles.transactionIcon, styles.incomeIcon]}><Text style={styles.incomeMark}>↓</Text></View>
                <View style={styles.transactionText}><Text style={styles.transactionName}>Salary</Text><Text style={styles.transactionDate}>Today, 9:41 AM</Text></View>
                <Text style={styles.transactionAmount}>+₵4,000.00</Text>
              </View>
              <View style={styles.transactionRow}>
                <View style={styles.transactionIcon}><Text style={styles.blueMark}>▤</Text></View>
                <View style={styles.transactionText}><Text style={styles.transactionName}>Groceries</Text><Text style={styles.transactionDate}>Yesterday, 6:30 PM</Text></View>
                <Text style={styles.transactionAmount}>−₵320.00</Text>
              </View>
              <View style={styles.transactionRow}>
                <View style={styles.transactionIcon}><Text style={styles.blueMark}>▱</Text></View>
                <View style={styles.transactionText}><Text style={styles.transactionName}>Transport</Text><Text style={styles.transactionDate}>Sep 24, 2026</Text></View>
                <Text style={styles.transactionAmount}>−₵50.00</Text>
              </View>
            </View>
            </View>
            <View style={styles.chartTile}>
              <View style={[styles.chartBar, { height: 21 }]} />
              <View style={[styles.chartBar, { height: 34 }]} />
              <View style={[styles.chartBar, { height: 48 }]} />
            </View>
            <View style={styles.walletTile}><Text style={styles.walletMark}>▰</Text><View style={styles.walletLine} /></View>
          </View>
        </View>
        <Text style={styles.title}>Take control{"\n"}of your money</Text>
        <Text style={styles.description}>Track expenses, set budgets and build better money habits with Largent.</Text>
        <View style={styles.actions}>
          <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => router.push("/sign-up" as Href)}>
            <Text style={styles.primaryLabel}>Get started</Text>
            <Text style={styles.primaryArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.push("/sign-in" as Href)}>
            <Text style={styles.secondaryLabel}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral.surface },
  screen: { flexGrow: 1, paddingHorizontal: spacing[5], paddingBottom: spacing[5] },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing[2], height: 52 },
  logo: { width: 30, height: 30 },
  brandName: { ...typography.title3, fontFamily: fontFamily.bold, color: colors.neutral[900] },
  illustration: { height: 440, overflow: "hidden", alignItems: "center", justifyContent: "center", marginHorizontal: -spacing[5] },
  illustrationContent: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  backdrop: { position: "absolute", width: "128%", height: "95%", top: 10, left: "-14%", borderRadius: 260, backgroundColor: "#DCEEFF", transform: [{ rotate: "-18deg" }] },
  blueSweep: { position: "absolute", width: "92%", height: "86%", top: 20, right: "-12%", borderRadius: 260, backgroundColor: "#1683F5", transform: [{ rotate: "-24deg" }] },
  phoneShadow: { position: "absolute", width: 226, height: 407, top: 29, borderRadius: 43, backgroundColor: "#86B7EB", transform: [{ rotate: "-5deg" }, { translateX: 7 }, { translateY: 7 }] },
  phone: { width: 226, height: 407, padding: 7, borderRadius: 43, borderWidth: 2, borderColor: "#101D30", backgroundColor: "#16243A", transform: [{ rotate: "-5deg" }], elevation: 12, shadowColor: "#173D72", shadowOpacity: 0.26, shadowRadius: 18, shadowOffset: { width: 4, height: 10 } },
  phoneScreen: { flex: 1, overflow: "hidden", borderRadius: 34, backgroundColor: "#F8FAFD", paddingHorizontal: 11, paddingTop: 39 },
  camera: { position: "absolute", top: 10, alignSelf: "center", width: 68, height: 16, borderRadius: 10, backgroundColor: "#101D30" },
  phoneHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  greeting: { color: colors.neutral[500], fontSize: 8, lineHeight: 11, fontFamily: fontFamily.regular },
  userName: { color: colors.neutral[900], fontSize: 12, lineHeight: 16, fontFamily: fontFamily.bold },
  avatar: { width: 27, height: 27, borderRadius: 14, backgroundColor: colors.primary[100], alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: colors.primary[700], fontSize: 12, fontFamily: fontFamily.medium },
  balanceCard: { backgroundColor: colors.primary[600], borderRadius: 13, padding: 12, gap: 3, elevation: 4, shadowColor: colors.primary[900], shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  eyebrow: { color: colors.primary[100], fontSize: 8, lineHeight: 12, fontFamily: fontFamily.regular },
  mockBalance: { color: colors.neutral.surface, fontSize: 21, lineHeight: 27, fontFamily: fontFamily.bold, fontVariant: ["tabular-nums"] },
  mockRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  metricLabel: { color: colors.primary[100], fontSize: 7, lineHeight: 11, fontFamily: fontFamily.regular },
  metricValue: { color: colors.neutral.surface, fontSize: 8, lineHeight: 12, fontFamily: fontFamily.medium },
  transactionsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14, marginBottom: 4 },
  transactionsTitle: { color: colors.neutral[900], fontSize: 10, lineHeight: 14, fontFamily: fontFamily.semiBold },
  seeAll: { color: colors.primary[600], fontSize: 8, lineHeight: 12, fontFamily: fontFamily.medium },
  transactionRow: { height: 46, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  transactionIcon: { width: 29, height: 29, borderRadius: 15, backgroundColor: colors.primary[50], alignItems: "center", justifyContent: "center" },
  incomeIcon: { backgroundColor: "#E5F8EF" },
  incomeMark: { color: colors.semantic.income, fontSize: 17, lineHeight: 20, fontFamily: fontFamily.bold },
  blueMark: { color: colors.primary[600], fontSize: 15, lineHeight: 18, fontFamily: fontFamily.bold },
  transactionText: { flex: 1 },
  transactionName: { color: colors.neutral[800], fontSize: 9, lineHeight: 12, fontFamily: fontFamily.medium },
  transactionDate: { color: colors.neutral[400], fontSize: 7, lineHeight: 10, fontFamily: fontFamily.regular },
  transactionAmount: { color: colors.neutral[700], fontSize: 8, lineHeight: 12, fontFamily: fontFamily.semiBold, fontVariant: ["tabular-nums"] },
  chartTile: { position: "absolute", left: 27, top: 142, height: 75, width: 90, borderRadius: 20, backgroundColor: colors.neutral.surface, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 6, paddingBottom: 17, transform: [{ rotate: "-12deg" }], elevation: 5, shadowColor: colors.primary[800], shadowOpacity: 0.13, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  chartBar: { width: 12, borderRadius: 4, backgroundColor: colors.primary[500] },
  walletTile: { position: "absolute", right: 22, top: 245, width: 92, height: 77, borderRadius: 20, backgroundColor: colors.neutral.surface, alignItems: "center", justifyContent: "center", transform: [{ rotate: "12deg" }], elevation: 5, shadowColor: colors.primary[800], shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  walletMark: { color: colors.primary[600], fontSize: 43, lineHeight: 53, transform: [{ rotate: "180deg" }] },
  walletLine: { position: "absolute", left: 25, top: 26, width: 43, height: 2, backgroundColor: colors.primary[100] },
  title: { ...typography.display, textAlign: "center", color: colors.neutral[900], marginTop: spacing[2] },
  description: { ...typography.body, textAlign: "center", color: colors.neutral[600], marginTop: spacing[3], marginBottom: spacing[6], paddingHorizontal: spacing[2] },
  actions: { gap: spacing[2] },
  primaryButton: { minHeight: 52, borderRadius: 18, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center", elevation: 3, shadowColor: colors.primary[700], shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  primaryLabel: { ...typography.title3, fontFamily: fontFamily.semiBold, color: colors.neutral.surface },
  primaryArrow: { position: "absolute", right: 19, color: colors.neutral.surface, fontSize: 32, lineHeight: 36, fontFamily: fontFamily.regular },
  secondaryButton: { minHeight: 52, borderRadius: 18, borderColor: colors.neutral[200], borderWidth: 1, backgroundColor: colors.neutral.surface, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing[3] },
  secondaryLabel: { ...typography.bodyMedium, fontFamily: fontFamily.semiBold, color: colors.primary[600] },
});