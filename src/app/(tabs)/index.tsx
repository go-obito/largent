import { Empty, ScreenTitle, TransactionRow, styles as ui } from "@/components/ui";
import { categoryById } from "@/data/categories";
import { formatMoney, parseMoney } from "@/lib/currency";
import { budgetSpend, totals, transactionsInPeriod } from "@/lib/finance";
import { needsTotal } from "@/lib/needs";
import { useBudgetStore } from "@/store/budgets";
import { useNeedsStore } from "@/store/needs";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const router = useRouter();
  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const needs = useNeedsStore((state) => state.needs);
  const addNeed = useNeedsStore((state) => state.add);
  const updateNeed = useNeedsStore((state) => state.update);
  const removeNeed = useNeedsStore((state) => state.remove);
  const moveNeed = useNeedsStore((state) => state.move);
  const { user } = useUser();
  const current = totals(transactionsInPeriod(transactions, "monthly"));
  const balance = totals(transactions);
  const greeting = user?.firstName || user?.primaryEmailAddress?.emailAddress || "there";
  const recentTransactions = [...transactions].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 5);
  const [needEditorVisible, setNeedEditorVisible] = useState(false);
  const [editingNeedId, setEditingNeedId] = useState<string | null>(null);
  const [needName, setNeedName] = useState("");
  const [needCost, setNeedCost] = useState("");
  const [needError, setNeedError] = useState("");

  function openNeedEditor(need?: (typeof needs)[number]) {
    setEditingNeedId(need?.id ?? null);
    setNeedName(need?.name ?? "");
    setNeedCost(need ? (need.estimatedCost / 100).toFixed(2) : "");
    setNeedError("");
    setNeedEditorVisible(true);
  }

  function saveNeed() {
    const estimatedCost = parseMoney(needCost);
    if (!needName.trim() || !estimatedCost) {
      setNeedError("Enter an item name and an estimated cost greater than zero.");
      return;
    }
    try {
      const input = { name: needName, estimatedCost };
      if (editingNeedId) updateNeed(editingNeedId, input);
      else addNeed(input);
      setNeedEditorVisible(false);
    } catch (error) {
      setNeedError(error instanceof Error ? error.message : "Unable to save this item.");
    }
  }

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
          <Text style={styles.sectionTitle}>Prioritized needs</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => openNeedEditor()} style={styles.addNeedButton}>
            <Ionicons name="add" size={18} color={colors.primary[600]} />
            <Text style={styles.utility}>Add item</Text>
          </TouchableOpacity>
        </View>
        <View style={ui.card}>
          {needs.length === 0 ? (
            <Text style={styles.needEmpty}>Add something you are saving or planning for.</Text>
          ) : needs.map((need, index) => (
            <View key={need.id} style={styles.needRow}>
              <Text style={styles.needRank}>{index + 1}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${need.name}`} onPress={() => openNeedEditor(need)} style={styles.needDescription}>
                <Text numberOfLines={1} style={styles.needName}>{need.name}</Text>
                <Text style={styles.needCost}>{formatMoney(need.estimatedCost)}</Text>
              </Pressable>
              <View style={styles.needActions}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Move ${need.name} up`} disabled={index === 0} onPress={() => moveNeed(need.id, -1)} style={styles.iconButton}>
                  <Ionicons name="chevron-up" size={18} color={index === 0 ? colors.neutral[300] : colors.neutral[700]} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Move ${need.name} down`} disabled={index === needs.length - 1} onPress={() => moveNeed(need.id, 1)} style={styles.iconButton}>
                  <Ionicons name="chevron-down" size={18} color={index === needs.length - 1 ? colors.neutral[300] : colors.neutral[700]} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${need.name}`} onPress={() => removeNeed(need.id)} style={styles.iconButton}>
                  <Ionicons name="close" size={18} color={colors.neutral[500]} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.needTotalRow}>
            <Text style={styles.needTotalLabel}>Estimated total</Text>
            <Text style={styles.needTotal}>{formatMoney(needsTotal(needs))}</Text>
          </View>
          <Text style={styles.needFootnote}>Planning only. Record a purchase separately in Transactions.</Text>
        </View>

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
      <Modal visible={needEditorVisible} transparent animationType="fade" onRequestClose={() => setNeedEditorVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingNeedId ? "Edit need" : "Add a need"}</Text>
            <Text style={styles.inputLabel}>Item</Text>
            <TextInput value={needName} onChangeText={setNeedName} placeholder="e.g. Laptop" maxLength={80} returnKeyType="next" style={styles.input} />
            <Text style={styles.inputLabel}>Estimated cost</Text>
            <TextInput value={needCost} onChangeText={setNeedCost} placeholder="0.00" keyboardType="decimal-pad" style={styles.input} />
            {needError ? <Text accessibilityRole="alert" style={styles.errorText}>{needError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable onPress={() => setNeedEditorVisible(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <Pressable onPress={saveNeed} style={styles.saveButton}><Text style={styles.saveText}>Save item</Text></Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addNeedButton: { flexDirection: "row", alignItems: "center", gap: spacing[1] },
  needEmpty: { ...typography.body, color: colors.neutral[600], paddingVertical: spacing[2] },
  needRow: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.neutral[200], paddingVertical: spacing[2] },
  needRank: { ...typography.caption, color: colors.primary[600], width: 22, textAlign: "center", fontVariant: ["tabular-nums"] },
  needDescription: { flex: 1, minWidth: 0, justifyContent: "center" },
  needName: { ...typography.bodyMedium, color: colors.neutral[900] },
  needCost: { ...typography.caption, color: colors.neutral[600], marginTop: 2, fontVariant: ["tabular-nums"] },
  needActions: { flexDirection: "row", alignItems: "center" },
  iconButton: { width: 32, height: 36, alignItems: "center", justifyContent: "center" },
  needTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: spacing[3] },
  needTotalLabel: { ...typography.bodyMedium, color: colors.neutral[700] },
  needTotal: { ...typography.bodyMedium, color: colors.neutral[900], fontVariant: ["tabular-nums"] },
  needFootnote: { ...typography.small, color: colors.neutral[500], marginTop: spacing[2] },
  modalBackdrop: { flex: 1, justifyContent: "center", backgroundColor: "rgba(17,19,24,0.45)", padding: spacing[5] },
  modalContent: { backgroundColor: colors.neutral.surface, borderRadius: radii.lg, padding: spacing[5] },
  modalTitle: { ...typography.title3, color: colors.neutral[900], marginBottom: spacing[4] },
  inputLabel: { ...typography.caption, color: colors.neutral[700], marginBottom: spacing[1] },
  input: { ...typography.body, color: colors.neutral[900], minHeight: 48, borderWidth: 1, borderColor: colors.neutral[300], borderRadius: radii.md, paddingHorizontal: spacing[3], marginBottom: spacing[3] },
  errorText: { ...typography.caption, color: colors.semantic.expense, marginBottom: spacing[3] },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing[2], marginTop: spacing[2] },
  cancelButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[4] },
  cancelText: { ...typography.bodyMedium, color: colors.neutral[700] },
  saveButton: { minHeight: 44, justifyContent: "center", alignItems: "center", backgroundColor: colors.primary[600], borderRadius: radii.md, paddingHorizontal: spacing[4] },
  saveText: { ...typography.bodyMedium, color: colors.neutral.surface },
});
