import { Empty, ScreenTitle, TransactionRow, styles as ui } from "@/components/ui";
import { categoryById } from "@/data/categories";
import { formatMoney } from "@/lib/currency";
import { budgetSpend, spendingOverTime, totals, transactionsInPeriod } from "@/lib/finance";
import { useBudgetStore } from "@/store/budgets";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const { user } = useUser();
  const balance = totals(transactions);
  const weekTotals = totals(transactionsInPeriod(transactions, "weekly"));
  const weekExpenses = weekTotals.expenses;
  const weeklyBudgets = budgets.filter((budget) => budget.period === "weekly");
  const weeklyLimit = weeklyBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const remaining = Math.max(weeklyLimit - weekExpenses, 0);
  const spendRatio = weeklyLimit > 0 ? Math.min(weekExpenses / weeklyLimit, 1) : 0;
  const weeklyBars = spendingOverTime(transactions, "weekly");
  const maxBar = Math.max(...weeklyBars.map((item) => item.amount), 1);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const firstName = user?.firstName?.trim() || "there";
  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";
  const recentTransactions = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>YOUR MONEY, CLEARLY</Text>
            <ScreenTitle>{"Good " + greeting + ", " + firstName}</ScreenTitle>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push("/profile" as Href)} style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.slice(0, 1).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceTitleRow}><View style={styles.balanceDot} /><Text style={styles.balanceLabel}>TOTAL BALANCE</Text></View>
            <View style={styles.balancePill}><Text style={styles.balancePillText}>All time</Text><Ionicons name="chevron-down" size={13} color="rgba(255,255,255,0.8)" /></View>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.balanceAmount}>{formatMoney(balance.income - balance.expenses)}</Text>
          <View style={styles.balanceDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}><View style={[styles.summaryDot, styles.incomeDot]} /><Text style={styles.summaryLabel}>Income this week</Text></View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryValue}>{formatMoney(weekTotals.income, { sign: "income" })}</Text>
            </View>
            <View style={styles.summaryItem}>
              <View style={styles.summaryLabelRow}><View style={[styles.summaryDot, styles.expenseDot]} /><Text style={styles.summaryLabel}>Spent this week</Text></View>
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.summaryValue}>{formatMoney(weekExpenses, { sign: "expense" })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Weekly spending</Text><Text style={styles.sectionSubtitle}>Keep this week on track</Text></View>
          <Pressable accessibilityRole="button" onPress={() => router.push("/reports" as Href)} style={styles.roundAction}><Ionicons name="arrow-up-right" size={19} color={colors.primary[700]} /></Pressable>
        </View>

        <View style={styles.spendingCard}>
          <View style={styles.spendingTop}>
            <View><Text style={styles.spentCaption}>YOU'VE SPENT</Text><Text style={styles.spentAmount}>{formatMoney(weekExpenses)}</Text></View>
            {weeklyLimit > 0 ? (
              <View style={styles.remainingBadge}>
                <Ionicons name={weekExpenses > weeklyLimit ? "alert-circle" : "checkmark-circle"} size={15} color={weekExpenses > weeklyLimit ? colors.semantic.expense : colors.semantic.income} />
                <Text style={[styles.remainingText, weekExpenses > weeklyLimit && styles.overBudgetText]}>{weekExpenses > weeklyLimit ? "Over budget" : "On track"}</Text>
              </View>
            ) : (
              <Pressable onPress={() => router.push("/budgets" as Href)} style={styles.setBudgetButton}><Text style={styles.setBudgetText}>Set a limit</Text><Ionicons name="arrow-forward" size={13} color={colors.primary[700]} /></Pressable>
            )}
          </View>
          {weeklyLimit > 0 ? (
            <>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: String(spendRatio * 100) + "%", backgroundColor: weekExpenses > weeklyLimit ? colors.semantic.expense : colors.primary[600] }]} /></View>
              <View style={styles.budgetMeta}>
                <Text style={styles.budgetMetaText}>{formatMoney(weekExpenses)} of {formatMoney(weeklyLimit)}</Text>
                <Text style={[styles.budgetMetaText, weekExpenses > weeklyLimit && styles.overBudgetText]}>{weekExpenses > weeklyLimit ? formatMoney(weekExpenses - weeklyLimit) + " over" : formatMoney(remaining) + " left"}</Text>
              </View>
            </>
          ) : <Text style={styles.noLimitText}>Create a weekly budget to give your spending a clear limit.</Text>}
          <View style={styles.chartDivider} />
          <View style={styles.chartHeader}><Text style={styles.chartTitle}>Daily breakdown</Text><Text style={styles.chartHint}>This week</Text></View>
          <View style={styles.chart}>
            {weeklyBars.map((item, index) => {
              const barHeight = item.amount > 0 ? Math.max(8, (item.amount / maxBar) * 66) : 4;
              const isToday = index === todayIndex;
              return (
                <View key={item.label} style={styles.barColumn}>
                  <View style={styles.barTrack}><View style={[styles.bar, { height: barHeight }, isToday && styles.todayBar, item.amount === 0 && styles.emptyBar]} /></View>
                  <Text style={[styles.barLabel, isToday && styles.todayLabel]}>{item.label.slice(0, 1)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Your budgets</Text><Text style={styles.sectionSubtitle}>Small steps add up</Text></View>
          <Pressable onPress={() => router.push("/budgets" as Href)} accessibilityRole="button"><Text style={styles.link}>See all</Text></Pressable>
        </View>
        {budgets.length === 0 ? (
          <Pressable onPress={() => router.push("/budgets" as Href)} style={styles.budgetEmpty}>
            <View style={styles.emptyIcon}><Ionicons name="pie-chart-outline" size={21} color={colors.primary[700]} /></View>
            <View style={styles.emptyCopy}><Text style={styles.emptyTitle}>Make a plan for your money</Text><Text style={styles.emptyDescription}>Set a limit for the things you spend on.</Text></View>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral[500]} />
          </Pressable>
        ) : (
          <View style={styles.budgetList}>
            {budgets.slice(0, 2).map((budget) => {
              const spent = budgetSpend(transactions, budget.categoryId, budget.period);
              const ratio = budget.limit === 0 ? 0 : spent / budget.limit;
              const fillColor = spent > budget.limit ? colors.semantic.expense : ratio >= 0.8 ? colors.semantic.warning : colors.primary[600];
              return (
                <Pressable key={budget.id} onPress={() => router.push("/budgets" as Href)} style={styles.budgetItem}>
                  <View style={styles.budgetIcon}><Ionicons name="wallet-outline" size={19} color={colors.primary[700]} /></View>
                  <View style={styles.budgetInfo}>
                    <View style={styles.budgetNameRow}><Text style={styles.budgetName}>{categoryById(budget.categoryId)?.name ?? "Other"}</Text><Text style={styles.budgetPeriod}>{budget.period}</Text></View>
                    <Text style={styles.budgetAmount}>{formatMoney(spent)} <Text style={styles.budgetOf}>of {formatMoney(budget.limit)}</Text></Text>
                    <View style={styles.miniTrack}><View style={[styles.miniFill, { width: String(Math.min(ratio, 1) * 100) + "%", backgroundColor: fillColor }]} /></View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionTitle}>Recent activity</Text><Text style={styles.sectionSubtitle}>Your latest money moves</Text></View>
          <Pressable onPress={() => router.push("/transactions" as Href)} accessibilityRole="button"><Text style={styles.link}>View all</Text></Pressable>
        </View>
        {recentTransactions.length === 0 ? (
          <View style={styles.activityEmpty}>
            <View style={styles.emptyIcon}><Ionicons name="receipt-outline" size={21} color={colors.primary[700]} /></View>
            <Empty title="Your story starts here" description="Add your first income or expense to see where your money goes." />
            <Pressable onPress={() => router.push("/transaction/new" as Href)} style={styles.emptyCta}><Text style={styles.emptyCtaText}>Add first transaction</Text></Pressable>
          </View>
        ) : (
          <View style={styles.transactionCard}>
            {recentTransactions.map((transaction) => (
              <Pressable key={transaction.id} onPress={() => router.push(("/transaction/" + transaction.id) as Href)} accessibilityRole="button"><TransactionRow transaction={transaction} /></Pressable>
            ))}
          </View>
        )}
        <Pressable onPress={() => router.push("/transaction/new" as Href)} accessibilityRole="button" style={styles.addTransaction}><Ionicons name="add" size={21} color={colors.neutral.surface} /><Text style={styles.addTransactionText}>Add transaction</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { paddingHorizontal: spacing[5], paddingTop: spacing[4], paddingBottom: spacing[8], gap: spacing[4] },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[3] },
  headerText: { flex: 1, minWidth: 0 },
  kicker: { ...typography.small, color: colors.neutral[500], letterSpacing: 1.1, marginBottom: spacing[1] },
  avatar: { width: 44, height: 44, borderRadius: radii.full, backgroundColor: colors.primary[100], borderWidth: 1, borderColor: colors.primary[200], alignItems: "center", justifyContent: "center" },
  avatarText: { ...typography.bodyMedium, color: colors.primary[800] },
  balanceCard: { backgroundColor: colors.navy, borderRadius: radii.xl, padding: spacing[5], overflow: "hidden" },
  balanceHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[2] },
  balanceTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  balanceDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6EE7B7" },
  balanceLabel: { ...typography.small, color: "rgba(255,255,255,0.72)", letterSpacing: 1 },
  balancePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radii.full, paddingHorizontal: spacing[3], paddingVertical: 6 },
  balancePillText: { ...typography.small, color: "rgba(255,255,255,0.9)" },
  balanceAmount: { ...typography.display, color: "#FFFFFF", fontVariant: ["tabular-nums"], marginTop: spacing[4], marginBottom: spacing[4] },
  balanceDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.13)" },
  summaryRow: { flexDirection: "row", gap: spacing[4], paddingTop: spacing[4] },
  summaryItem: { flex: 1, minWidth: 0 },
  summaryLabelRow: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  summaryDot: { width: 7, height: 7, borderRadius: 4 },
  incomeDot: { backgroundColor: "#6EE7B7" },
  expenseDot: { backgroundColor: "#FDA4AF" },
  summaryLabel: { ...typography.small, color: "rgba(255,255,255,0.68)" },
  summaryValue: { ...typography.title3, color: "#FFFFFF", fontVariant: ["tabular-nums"], marginTop: spacing[2] },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[3], marginTop: spacing[1] },
  sectionTitle: { ...typography.title3, color: colors.neutral[900] },
  sectionSubtitle: { ...typography.small, color: colors.neutral[500], marginTop: 3 },
  link: { ...typography.caption, color: colors.primary[700], fontFamily: "Inter_600SemiBold" },
  roundAction: { width: 36, height: 36, borderRadius: radii.full, backgroundColor: colors.primary[50], alignItems: "center", justifyContent: "center" },
  spendingCard: { backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.xl, padding: spacing[4] },
  spendingTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[3] },
  spentCaption: { ...typography.small, color: colors.neutral[500], letterSpacing: 0.8 },
  spentAmount: { ...typography.title1, color: colors.neutral[900], fontVariant: ["tabular-nums"], marginTop: 3 },
  remainingBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.neutral[50], borderRadius: radii.full, paddingHorizontal: spacing[3], paddingVertical: 7 },
  remainingText: { ...typography.small, color: colors.semantic.income, fontFamily: "Inter_600SemiBold" },
  overBudgetText: { color: colors.semantic.expense },
  setBudgetButton: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.primary[50], borderRadius: radii.full, paddingHorizontal: spacing[3], paddingVertical: 8 },
  setBudgetText: { ...typography.small, color: colors.primary[700], fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 8, borderRadius: radii.full, backgroundColor: colors.neutral[100], overflow: "hidden", marginTop: spacing[4] },
  progressFill: { height: "100%", borderRadius: radii.full },
  budgetMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing[2], marginTop: spacing[2] },
  budgetMetaText: { ...typography.small, color: colors.neutral[600] },
  noLimitText: { ...typography.caption, color: colors.neutral[600], lineHeight: 20, marginTop: spacing[3] },
  chartDivider: { height: 1, backgroundColor: colors.neutral[100], marginVertical: spacing[4] },
  chartHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chartTitle: { ...typography.bodyMedium, color: colors.neutral[900] },
  chartHint: { ...typography.small, color: colors.neutral[500] },
  chart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing[2], height: 94, marginTop: spacing[3] },
  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%", gap: spacing[2] },
  barTrack: { width: "100%", height: 70, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "62%", maxWidth: 22, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: colors.primary[200] },
  todayBar: { backgroundColor: colors.primary[600] },
  emptyBar: { backgroundColor: colors.neutral[200] },
  barLabel: { ...typography.small, color: colors.neutral[500] },
  todayLabel: { color: colors.primary[700], fontFamily: "Inter_700Bold" },
  budgetEmpty: { flexDirection: "row", alignItems: "center", gap: spacing[3], backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.lg, padding: spacing[4] },
  emptyIcon: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.primary[50], alignItems: "center", justifyContent: "center" },
  emptyCopy: { flex: 1, minWidth: 0 },
  emptyTitle: { ...typography.bodyMedium, color: colors.neutral[900] },
  emptyDescription: { ...typography.caption, color: colors.neutral[600], marginTop: 3 },
  budgetList: { backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.lg, paddingHorizontal: spacing[4] },
  budgetItem: { flexDirection: "row", alignItems: "center", gap: spacing[3], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  budgetIcon: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.primary[50], alignItems: "center", justifyContent: "center" },
  budgetInfo: { flex: 1, minWidth: 0 },
  budgetNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing[2] },
  budgetName: { ...typography.bodyMedium, color: colors.neutral[900], flexShrink: 1 },
  budgetPeriod: { ...typography.small, color: colors.neutral[500], textTransform: "capitalize" },
  budgetAmount: { ...typography.caption, color: colors.neutral[900], marginTop: 4, fontVariant: ["tabular-nums"] },
  budgetOf: { color: colors.neutral[500] },
  miniTrack: { height: 5, backgroundColor: colors.neutral[100], borderRadius: radii.full, overflow: "hidden", marginTop: spacing[2] },
  miniFill: { height: "100%", borderRadius: radii.full },
  activityEmpty: { alignItems: "center", backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.lg, padding: spacing[4] },
  emptyCta: { backgroundColor: colors.primary[600], paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderRadius: radii.md, marginTop: spacing[2] },
  emptyCtaText: { ...typography.caption, color: colors.neutral.surface, fontFamily: "Inter_600SemiBold" },
  transactionCard: { backgroundColor: colors.neutral.surface, borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.lg, paddingHorizontal: spacing[4] },
  addTransaction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing[2], minHeight: 52, borderRadius: radii.lg, backgroundColor: colors.primary[600], marginTop: spacing[1] },
  addTransactionText: { ...typography.bodyMedium, color: colors.neutral.surface },
});
