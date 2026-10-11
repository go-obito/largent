import { Empty, ScreenTitle, styles as ui } from "@/components/ui";
import { categoryById } from "@/data/categories";
import { formatMoney } from "@/lib/currency";
import { budgetSpend } from "@/lib/finance";
import { useBudgetStore } from "@/store/budgets";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Budgets() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const budgets = useBudgetStore((state) => state.budgets);
  const transactions = useTransactionStore((state) => state.transactions);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenTitle>Budgets</ScreenTitle>
        {budgets.length === 0 ? (
          <Empty title="No budgets yet" description="Create a weekly or monthly spending limit." />
        ) : (
          budgets.map((budget) => {
            const spent = budgetSpend(transactions, budget.categoryId, budget.period);
            const ratio = budget.limit === 0 ? 0 : spent / budget.limit;
            const color = spent > budget.limit ? colors.semantic.expense : ratio >= 0.8 ? colors.semantic.warning : colors.primary[600];
            return (
              <Pressable key={budget.id} style={ui.card} onPress={() => router.push(`/budget/${budget.id}` as never)} accessibilityRole="button">
                <View style={styles.row}>
                  <Text style={styles.name}>{categoryById(budget.categoryId)?.name ?? "Other"}</Text>
                  <Text style={styles.period}>{budget.period}</Text>
                </View>
                <Text style={styles.amount}>{formatMoney(spent)} of {formatMoney(budget.limit)}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: color }]} />
                </View>
                {ratio >= 0.8 ? <Text style={[styles.notice, { color }]}>{ratio > 1 ? "Over budget" : "Close to limit"}</Text> : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <Pressable style={[styles.add, { bottom: Math.max(spacing[4], insets.bottom + spacing[2]) }]} onPress={() => router.push("/budget/new" as never)} accessibilityRole="button">
        <Text style={styles.addText}>Create budget</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { flexGrow: 1, padding: spacing[5], gap: spacing[3], paddingBottom: 88 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { ...typography.bodyMedium, color: colors.neutral[900] },
  period: { ...typography.small, color: colors.neutral[500], textTransform: "capitalize" },
  amount: { ...typography.caption, color: colors.neutral[600], marginTop: spacing[2] },
  track: { height: 8, borderRadius: radii.full, backgroundColor: colors.neutral[200], overflow: "hidden", marginTop: spacing[3] },
  fill: { height: "100%", borderRadius: radii.full },
  notice: { ...typography.small, marginTop: spacing[2] },
  add: { position: "absolute", left: spacing[5], right: spacing[5], bottom: spacing[4], minHeight: 52, borderRadius: radii.md, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center" },
  addText: { ...typography.bodyMedium, color: colors.neutral.surface },
});
