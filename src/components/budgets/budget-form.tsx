import { categories } from "@/data/categories";
import { parseMoney } from "@/lib/currency";
import { useBudgetStore } from "@/store/budgets";
import { colors, radii, spacing, typography } from "@/theme";
import type { BudgetPeriod } from "@/types/finance";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Draft = { categoryId: string; limit: string; period: BudgetPeriod };

export function BudgetForm({ budgetId }: { budgetId?: string }) {
  const router = useRouter();
  const budget = useBudgetStore((state) => state.budgets.find((item) => item.id === budgetId));
  const add = useBudgetStore((state) => state.add);
  const update = useBudgetStore((state) => state.update);
  const remove = useBudgetStore((state) => state.remove);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const value = draft ?? (budget
    ? { categoryId: budget.categoryId, limit: `${Math.floor(budget.limit / 100)}.${String(budget.limit % 100).padStart(2, "0")}`, period: budget.period }
    : { categoryId: "", limit: "", period: "monthly" as const });

  function setField<K extends keyof Draft>(key: K, next: Draft[K]) {
    setDraft((current) => ({ ...(current ?? value), [key]: next }));
    setError("");
  }

  function save() {
    const limit = parseMoney(value.limit);
    if (limit === null) return setError("Enter a budget limit greater than zero.");
    if (!categories.some((category) => category.id === value.categoryId && category.type === "expense")) return setError("Choose an expense category.");
    if (budgetId) {
      if (!budget) return setError("This budget is no longer available.");
      update(budgetId, { categoryId: value.categoryId, limit, period: value.period });
    } else {
      add({ categoryId: value.categoryId, limit, period: value.period });
    }
    router.back();
  }

  function confirmDelete() {
    if (!budgetId || !budget) return;
    Alert.alert("Delete budget?", "This spending limit will be removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { remove(budgetId); router.back(); } },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{budgetId ? "Edit budget" : "Create budget"}</Text>
      {budgetId && !budget ? <Text style={styles.error}>This budget could not be found.</Text> : <>
        <Text style={styles.label}>Category</Text>
        <View style={styles.choices}>
          {categories.filter((category) => category.type === "expense").map((category) => (
            <Pressable key={category.id} onPress={() => setField("categoryId", category.id)} style={[styles.category, value.categoryId === category.id && styles.selected]} accessibilityRole="button" accessibilityState={{ selected: value.categoryId === category.id }}>
              <Text style={[styles.choiceText, value.categoryId === category.id && styles.selectedText]}>{category.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Limit (GHS)</Text>
        <TextInput value={value.limit} onChangeText={(text) => setField("limit", text)} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.neutral[400]} style={styles.input} />
        <Text style={styles.label}>Period</Text>
        <View style={styles.toggle}>
          {(["weekly", "monthly"] as const).map((period) => (
            <Pressable key={period} onPress={() => setField("period", period)} style={[styles.period, value.period === period && styles.selected]}>
              <Text style={[styles.choiceText, value.period === period && styles.selectedText]}>{period === "weekly" ? "Weekly" : "Monthly"}</Text>
            </Pressable>
          ))}
        </View>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.save} onPress={save} accessibilityRole="button"><Text style={styles.saveText}>Save budget</Text></Pressable>
        {budgetId ? <Pressable style={styles.delete} onPress={confirmDelete} accessibilityRole="button"><Text style={styles.deleteText}>Delete budget</Text></Pressable> : null}
      </>}
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing[5], paddingBottom: spacing[8], gap: spacing[3] },
  title: { ...typography.title1, color: colors.neutral[900], marginBottom: spacing[3] },
  label: { ...typography.caption, color: colors.neutral[700] },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  category: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing[3], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, backgroundColor: colors.neutral.surface },
  selected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  choiceText: { ...typography.small, color: colors.neutral[700] },
  selectedText: { color: colors.primary[600] },
  input: { minHeight: 52, borderRadius: radii.md, backgroundColor: colors.neutral[100], paddingHorizontal: spacing[4], color: colors.neutral[900], ...typography.body },
  toggle: { flexDirection: "row", backgroundColor: colors.neutral[100], borderRadius: radii.md, padding: spacing[1] },
  period: { flex: 1, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radii.sm },
  error: { ...typography.caption, color: colors.semantic.expense },
  save: { minHeight: 52, borderRadius: radii.md, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center", marginTop: spacing[2] },
  saveText: { ...typography.bodyMedium, color: colors.neutral.surface },
  delete: { minHeight: 52, alignItems: "center", justifyContent: "center" },
  deleteText: { ...typography.bodyMedium, color: colors.semantic.expense },
});