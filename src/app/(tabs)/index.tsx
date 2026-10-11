import { Empty, ScreenTitle, TransactionRow, styles as ui } from "@/components/ui";
import { categoryById } from "@/data/categories";
import { formatMoney } from "@/lib/currency";
import { budgetSpend, totals, transactionsInPeriod } from "@/lib/finance";
import { useBudgetStore } from "@/store/budgets";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const { user } = useUser();
  const current = totals(transactionsInPeriod(transactions, "monthly"));
  const balance = totals(transactions);
  const greeting = user?.firstName || user?.primaryEmailAddress?.emailAddress || "there";
  const recentTransactions = [...transactions].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 5);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Overview</Text>
            <ScreenTitle>{`Hi ${greeting}`}</ScreenTitle>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open onboarding" onPress={() => router.push("/onboarding" as Href)}>
            <Text style={styles.utility}>View tour</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total balance</Text>
            <View style={styles.balancePill}>
              <Text style={styles.balancePillText}>This month</Text>
            </View>
          </View>
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.balanceAmount}>
            {formatMoney(balance.income - balance.expenses)}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValueIncome}>{formatMoney(current.income, { sign: "income" })}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryValueExpense}>{formatMoney(current.expenses, { sign: "expense" })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budgets</Text>
          <TouchableOpacity onPress={() => router.push("/budgets" as Href)}>
            <Text style={styles.utility}>See all</Text>
          </TouchableOpacity>
        </View>
        {budgets.length === 0 ? (
          <Empty title="No budgets yet" description="Create a spending limit to stay on track." />
        ) : (
          <View style={ui.card}>
            {budgets.slice(0, 2).map((budget) => {
              const spent = budgetSpend(transactions, budget.categoryId, budget.period);
              const ratio = budget.limit === 0 ? 0 : spent / budget.limit;
              const fillColor = spent > budget.limit ? colors.semantic.expense : ratio >= 0.8 ? colors.semantic.warning : colors.primary[600];
              return (
                <View key={budget.id} style={styles.budgetRow}>
                  <View style={styles.budgetHeaderRow}>
                    <Text style={styles.budgetName}>{categoryById(budget.categoryId)?.name ?? "Other"}</Text>
                    <Text style={styles.period}>{budget.period}</Text>
                  </View>
                  <Text style={styles.budgetValue}>{formatMoney(spent)} of {formatMoney(budget.limit)}</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: fillColor }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <TouchableOpacity onPress={() => router.push("/transactions" as Href)}>
            <Text style={styles.utility}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentTransactions.length === 0 ? (
          <Empty title="No transactions yet" description="Your recent activity will appear here." />
        ) : (
          <View style={ui.card}>
            {recentTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing[5], gap: spacing[4], paddingBottom: spacing[8] },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing[1] },
  kicker: { ...typography.caption, color: colors.neutral[500], marginBottom: spacing[1] },
  utility: { ...typography.caption, color: colors.primary[600], fontFamily: "Inter_600SemiBold" },
  balanceCard: { backgroundColor: colors.navy, borderRadius: radii.xl, padding: spacing[5], paddingBottom: spacing[4] },
  balanceHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balanceLabel: { ...typography.caption, color: "rgba(255,255,255,0.72)" },
  balancePill: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: radii.full, paddingHorizontal: spacing[2], paddingVertical: 4 },
  balancePillText: { ...typography.small, color: colors.neutral.surface },
  balanceAmount: { ...typography.display, color: colors.neutral.surface, fontVariant: ["tabular-nums"], marginTop: spacing[3] },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing[4], gap: spacing[3] },
  summaryItem: { flex: 1, minWidth: 0 },
  summaryLabel: { ...typography.caption, color: "rgba(255,255,255,0.7)" },
  summaryValueIncome: { ...typography.bodyMedium, fontVariant: ["tabular-nums"], color: colors.neutral.surface, marginTop: 2 },
  summaryValueExpense: { ...typography.bodyMedium, fontVariant: ["tabular-nums"], color: "rgba(255,255,255,0.85)", marginTop: 2 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing[1] },
  sectionTitle: { ...typography.title3, color: colors.neutral[900] },
  budgetRow: { paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  budgetHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  budgetName: { ...typography.bodyMedium, color: colors.neutral[900] },
  period: { ...typography.small, color: colors.neutral[500], textTransform: "capitalize" },
  budgetValue: { ...typography.caption, color: colors.neutral[600], marginTop: spacing[1] },
  track: { height: 8, borderRadius: radii.full, backgroundColor: colors.neutral[200], marginTop: spacing[2], overflow: "hidden" },
  fill: { height: "100%", borderRadius: radii.full },
});
