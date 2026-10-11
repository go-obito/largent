import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type OnboardingPage = {
  title: string;
  description: string;
  illustration: "balance" | "budget" | "insights";
};

const pages: OnboardingPage[] = [
  {
    title: "Take control\nof your money",
    description: "Track your income, expenses and savings in one place.",
    illustration: "balance",
  },
  {
    title: "Set budgets\nand stay on track",
    description: "Create budgets for what matters and see your progress in real time.",
    illustration: "budget",
  },
  {
    title: "Gain insights\nand make better\ndecisions",
    description: "Visualize your spending, spot trends and build better financial habits.",
    illustration: "insights",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex];
  const isLastPage = pageIndex === pages.length - 1;

  const actionLabel = useMemo(
    () => (isLastPage ? "Get Started" : "Next  →"),
    [isLastPage],
  );

  function advance() {
    if (isLastPage) {
      router.replace("/");
      return;
    }

    setPageIndex((current) => current + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        <View style={styles.topBar}>
          {pageIndex > 0 ? (
            <Pressable
              accessibilityLabel="Previous onboarding screen"
              hitSlop={12}
              onPress={() => setPageIndex((current) => current - 1)}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
          ) : (
            <View style={styles.topBarSpacer} />
          )}
          <Pressable onPress={() => router.replace("/")} hitSlop={12}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          {pageIndex === 0 ? (
            <View style={styles.brandRow}>
              <Image
                source={require("../../assets/largent-logo.svg")}
                style={styles.logo}
                contentFit="contain"
                accessibilityLabel="Largent logo"
              />
              <Text style={styles.brandName}>Largent</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{page.title}</Text>
          <Text style={styles.description}>{page.description}</Text>

          <View style={styles.illustrationWrap}>
            <OnboardingIllustration type={page.illustration} />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={advance}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>{actionLabel}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function OnboardingIllustration({ type }: { type: OnboardingPage["illustration"] }) {
  if (type === "balance") return <BalanceCard />;
  if (type === "budget") return <BudgetCard />;
  return <InsightsCard />;
}

function BalanceCard() {
  return (
    <View style={[styles.artBackdrop, styles.balanceBackdrop]}>
      <View style={styles.balanceCard}>
        <Text style={styles.cardEyebrow}>Total Balance</Text>
        <Text style={styles.balanceAmount}>€12,450.00</Text>
        <Text style={styles.positive}>↑ 8% <Text style={styles.muted}>from last month</Text></Text>
        <View style={styles.balanceStats}>
          <Stat label="Income" value="€18,200" icon="↑" positive />
          <Stat label="Expenses" value="€5,750" icon="↓" />
        </View>
        <BarChart values={[38, 60, 49, 63, 75, 86]} labels={["Apr", "May", "Jun", "Jul", "Aug", "Sep"]} />
      </View>
    </View>
  );
}

function BudgetCard() {
  return (
    <View style={[styles.artBackdrop, styles.budgetBackdrop]}>
      <View style={styles.budgetCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Monthly Budget</Text><Text style={styles.cardEyebrow}>Sep 2026⌄</Text></View>
        <View style={styles.budgetSummary}>
          <View style={styles.donut}><Text style={styles.donutNumber}>70%</Text><Text style={styles.donutCaption}>€1,050 left</Text></View>
          <View style={styles.legend}><Legend color="#0F7B54" label="Spent" value="€2,450" /><Legend color="#9DDEC1" label="Remaining" value="€1,050" /><Legend color="#DDE9E3" label="Total" value="€3,500" /></View>
        </View>
        <BudgetRow label="Food & Dining" value="€320 / €600" progress="53%" icon="🍴" />
        <BudgetRow label="Transportation" value="€180 / €400" progress="45%" icon="▰" />
        <BudgetRow label="Shopping" value="€450 / €800" progress="56%" icon="▢" />
      </View>
    </View>
  );
}

function InsightsCard() {
  return (
    <View style={[styles.artBackdrop, styles.insightsBackdrop]}>
      <View style={styles.insightsCard}>
        <Text style={styles.cardTitle}>Spending by category</Text>
        <View style={styles.insightsBody}>
          <View style={styles.pieOuter}><View style={styles.pieHole} /></View>
          <View style={styles.insightsLegend}>
            <Legend color="#0F7B54" label="Food & Dining" value="28%" /><Legend color="#138D62" label="Shopping" value="22%" /><Legend color="#31B980" label="Transport" value="15%" /><Legend color="#88D8B6" label="Bills" value="12%" /><Legend color="#D6E9DF" label="Others" value="23%" />
          </View>
        </View>
      </View>
      <View style={styles.trendCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>Monthly trend</Text><Text style={styles.cardEyebrow}>Expenses⌄</Text></View>
        <BarChart values={[48, 35, 62, 88, 63, 37, 72]} labels={["Apr", "May", "Jun", "Jul", "Jul", "Aug", "Sep"]} />
      </View>
    </View>
  );
}

function Stat({ label, value, icon, positive = false }: { label: string; value: string; icon: string; positive?: boolean }) {
  return <View style={styles.stat}><View style={[styles.statIcon, positive ? styles.incomeIcon : styles.expenseIcon]}><Text style={[styles.statIconText, positive ? styles.incomeText : styles.expenseText]}>{icon}</Text></View><View><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View></View>;
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.legendRow}><View style={[styles.legendDot, { backgroundColor: color }]} /><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendValue}>{value}</Text></View>;
}

function BudgetRow({ label, value, progress, icon }: { label: string; value: string; progress: `${number}%`; icon: string }) {
  return <View style={styles.budgetRow}><View style={styles.budgetIcon}><Text>{icon}</Text></View><View style={styles.budgetContent}><View style={styles.budgetLabelRow}><Text style={styles.budgetLabel}>{label}</Text><Text style={styles.budgetValue}>{value}</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: progress }]} /></View></View></View>;
}

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  return <View style={styles.chart}><View style={styles.bars}>{values.map((value, index) => <View key={`${labels[index]}-${index}`} style={styles.barColumn}><View style={[styles.bar, { height: `${value}%` }, index === values.length - 1 && styles.lastBar]} /></View>)}</View><View style={styles.chartLabels}>{labels.map((label, index) => <Text key={`${label}-${index}`} style={styles.chartLabel}>{label}</Text>)}</View></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFEFC" },
  screen: { flex: 1, paddingHorizontal: 28, paddingBottom: 20, backgroundColor: "#FFFEFC" },
  topBar: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topBarSpacer: { width: 32 },
  backButton: { width: 32, height: 32, justifyContent: "center" },
  backArrow: { fontFamily: "Inter_400Regular", fontSize: 42, lineHeight: 36, color: "#0B1320" },
  skip: { fontFamily: "Inter_600SemiBold", color: "#101820", fontSize: 16 },
  content: { flex: 1, paddingTop: 40 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 26 },
  logo: { width: 42, height: 42 },
  brandName: { fontFamily: "Inter_700Bold", fontSize: 40, letterSpacing: -1.6, color: "#0F6A47" },
  title: { fontFamily: "Inter_700Bold", fontSize: 36, lineHeight: 42, letterSpacing: -1.2, color: "#0B1320" },
  description: { marginTop: 14, maxWidth: 335, color: "#5D626C", fontFamily: "Inter_400Regular", fontSize: 17, lineHeight: 26 },
  illustrationWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 8 },
  primaryButton: { height: 60, borderRadius: 18, backgroundColor: "#0F7B54", alignItems: "center", justifyContent: "center", shadowColor: "#0F7B54", shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  primaryButtonText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 18 },
  artBackdrop: { width: "100%", maxWidth: 360, height: 420, justifyContent: "center", alignItems: "center" },
  balanceBackdrop: { backgroundColor: "#E8F7EF", borderRadius: 34, transform: [{ rotate: "-5deg" }] },
  budgetBackdrop: { backgroundColor: "#E1F4EA", borderRadius: 32, transform: [{ rotate: "-7deg" }] },
  insightsBackdrop: { backgroundColor: "#E5F7ED", borderRadius: 32, transform: [{ rotate: "-7deg" }] },
  balanceCard: { width: "91%", minHeight: 330, padding: 24, borderRadius: 24, backgroundColor: "#FFFFFF", shadowColor: "#173D2C", shadowOpacity: 0.1, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 4, transform: [{ rotate: "5deg" }] },
  cardEyebrow: { fontFamily: "Inter_400Regular", fontSize: 12, color: "#6B7280" },
  balanceAmount: { marginTop: 11, color: "#0B1320", fontFamily: "Inter_700Bold", fontSize: 26, letterSpacing: -0.8 },
  positive: { marginTop: 10, color: "#159B5C", fontFamily: "Inter_600SemiBold", fontSize: 12 },
  muted: { color: "#6B7280", fontFamily: "Inter_400Regular" },
  balanceStats: { flexDirection: "row", gap: 10, marginTop: 30 },
  stat: { flex: 1, minHeight: 68, padding: 10, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#FFFFFF", borderRadius: 12, shadowColor: "#0B1320", shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 },
  statIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  incomeIcon: { backgroundColor: "#D8F7E5" }, expenseIcon: { backgroundColor: "#FDE5E4" },
  statIconText: { fontSize: 22, fontFamily: "Inter_700Bold" }, incomeText: { color: "#159B5C" }, expenseText: { color: "#EF4444" },
  statLabel: { color: "#38404A", fontFamily: "Inter_400Regular", fontSize: 10 }, statValue: { marginTop: 3, color: "#0B1320", fontFamily: "Inter_700Bold", fontSize: 13 },
  chart: { height: 102, marginTop: 20 }, bars: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", borderBottomWidth: 1, borderBottomColor: "#EAF0EC" },
  barColumn: { height: "100%", width: "10%", justifyContent: "flex-end" }, bar: { width: "100%", borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: "#B6E5CE" }, lastBar: { backgroundColor: "#0F7B54" }, chartLabels: { flexDirection: "row", justifyContent: "space-around", paddingTop: 7 }, chartLabel: { color: "#6B7280", fontFamily: "Inter_400Regular", fontSize: 9 },
  budgetCard: { width: "94%", padding: 18, borderRadius: 24, backgroundColor: "#FFFFFF", shadowColor: "#173D2C", shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 7 }, elevation: 4, transform: [{ rotate: "7deg" }] },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, cardTitle: { color: "#0B1320", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  budgetSummary: { flexDirection: "row", alignItems: "center", gap: 18, marginVertical: 18 }, donut: { width: 114, height: 114, borderRadius: 57, borderWidth: 14, borderColor: "#0F7B54", borderLeftColor: "#9DDEC1", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-30deg" }] }, donutNumber: { color: "#0B1320", fontFamily: "Inter_700Bold", fontSize: 20, transform: [{ rotate: "30deg" }] }, donutCaption: { color: "#6B7280", fontFamily: "Inter_400Regular", fontSize: 9, transform: [{ rotate: "30deg" }] },
  legend: { flex: 1, gap: 9 }, legendRow: { flexDirection: "row", alignItems: "center", gap: 7 }, legendDot: { width: 10, height: 10, borderRadius: 5 }, legendLabel: { flex: 1, color: "#4B5563", fontFamily: "Inter_400Regular", fontSize: 11 }, legendValue: { color: "#111827", fontFamily: "Inter_600SemiBold", fontSize: 11 },
  budgetRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 11, marginTop: 5, borderTopWidth: 1, borderTopColor: "#EEF2EF" }, budgetIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: "#E1F2E9", alignItems: "center", justifyContent: "center" }, budgetContent: { flex: 1 }, budgetLabelRow: { flexDirection: "row", justifyContent: "space-between" }, budgetLabel: { fontFamily: "Inter_500Medium", color: "#17212B", fontSize: 11 }, budgetValue: { fontFamily: "Inter_500Medium", color: "#3C4650", fontSize: 10 }, progressTrack: { marginTop: 9, height: 8, borderRadius: 4, backgroundColor: "#E8F0EB", overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 4, backgroundColor: "#159B5C" },
  insightsCard: { width: "94%", padding: 19, borderRadius: 22, backgroundColor: "#FFFFFF", shadowColor: "#173D2C", shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 7 }, elevation: 4, transform: [{ rotate: "7deg" }] }, insightsBody: { flexDirection: "row", alignItems: "center", marginTop: 18, gap: 18 }, pieOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: "#0F7B54", borderWidth: 20, borderRightColor: "#38B982", borderBottomColor: "#8DDDB8", borderLeftColor: "#BCEBD3", alignItems: "center", justifyContent: "center" }, pieHole: { width: 63, height: 63, borderRadius: 32, backgroundColor: "#FFFFFF" }, insightsLegend: { flex: 1, gap: 8 },
  trendCard: { width: "86%", marginTop: 8, padding: 19, borderRadius: 19, backgroundColor: "#FFFFFF", shadowColor: "#173D2C", shadowOpacity: 0.09, shadowRadius: 15, shadowOffset: { width: 0, height: 5 }, elevation: 3, transform: [{ rotate: "2deg" }] },
});
