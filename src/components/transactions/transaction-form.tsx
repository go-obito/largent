import { categories } from "@/data/categories";
import { parseMoney } from "@/lib/currency";
import type { TransactionType } from "@/types/finance";
import { colors, radii, spacing, typography } from "@/theme";
import { useTransactionStore } from "@/store/transactions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Draft = { type: TransactionType; amount: string; categoryId: string; date: string; note: string };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function TransactionForm({ transactionId }: { transactionId?: string }) {
  const router = useRouter();
  const transaction = useTransactionStore((state) => state.transactions.find((item) => item.id === transactionId));
  const add = useTransactionStore((state) => state.add);
  const update = useTransactionStore((state) => state.update);
  const remove = useTransactionStore((state) => state.remove);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const value = draft ?? (transaction ? {
    type: transaction.type,
    amount: `${Math.floor(transaction.amount / 100)}.${String(transaction.amount % 100).padStart(2, "0")}`,
    categoryId: transaction.categoryId,
    date: transaction.date.slice(0, 10),
    note: transaction.note,
  } : { type: "expense" as const, amount: "", categoryId: "", date: today(), note: "" });
  const visibleCategories = categories.filter((category) => category.type === value.type);

  function setField<K extends keyof Draft>(key: K, next: Draft[K]) {
    setDraft((current) => ({ ...(current ?? value), [key]: next }));
    setError("");
  }

  function save() {
    const amount = parseMoney(value.amount);
    if (amount === null) return setError("Enter an amount greater than zero, with up to two decimal places.");
    if (!visibleCategories.some((category) => category.id === value.categoryId)) return setError("Choose a category.");
    if (!isValidDate(value.date)) return setError("Enter a valid date in YYYY-MM-DD format.");

    const input = {
      type: value.type,
      amount,
      categoryId: value.categoryId,
      date: `${value.date}T12:00:00.000Z`,
      note: value.note.trim(),
      source: transaction?.source ?? "manual" as const,
    };
    if (transactionId) {
      if (!transaction) return setError("This transaction is no longer available.");
      update(transactionId, input);
    } else {
      add(input);
    }
    router.back();
  }

  function confirmDelete() {
    if (!transactionId || !transaction) return;
    Alert.alert("Delete transaction?", "This transaction will be removed from your local records.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { remove(transactionId); router.back(); } },
    ]);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{transactionId ? "Edit transaction" : "Add transaction"}</Text>
      {transactionId && !transaction ? (
        <Text style={styles.error}>This transaction could not be found.</Text>
      ) : (
        <>
          <View style={styles.toggle}>
            {(["expense", "income"] as const).map((type) => (
              <Pressable key={type} onPress={() => setField("type", type)} style={[styles.choice, value.type === type && styles.selected]}>
                <Text style={[styles.choiceText, value.type === type && styles.selectedText]}>{type === "expense" ? "Expense" : "Income"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Amount (GHS)</Text>
          <TextInput value={value.amount} onChangeText={(text) => setField("amount", text)} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.neutral[400]} style={styles.input} accessibilityLabel="Amount in Ghanaian cedi" />
          <Text style={styles.label}>Category</Text>
          <View style={styles.categories}>
            {visibleCategories.map((category) => (
              <Pressable key={category.id} onPress={() => setField("categoryId", category.id)} style={[styles.category, value.categoryId === category.id && styles.categorySelected]} accessibilityRole="button" accessibilityState={{ selected: value.categoryId === category.id }}>
                <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={18} color={value.categoryId === category.id ? colors.primary[600] : colors.neutral[600]} />
                <Text style={[styles.categoryLabel, value.categoryId === category.id && styles.selectedText]}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Date</Text>
          <TextInput value={value.date} onChangeText={(text) => setField("date", text)} placeholder="YYYY-MM-DD" placeholderTextColor={colors.neutral[400]} style={styles.input} autoCapitalize="none" />
          <Text style={styles.label}>Note</Text>
          <TextInput value={value.note} onChangeText={(text) => setField("note", text)} placeholder="Add a note (optional)" placeholderTextColor={colors.neutral[400]} style={styles.input} />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.save} onPress={save} accessibilityRole="button"><Text style={styles.saveText}>Save transaction</Text></Pressable>
          {transactionId ? <Pressable style={styles.delete} onPress={confirmDelete} accessibilityRole="button"><Text style={styles.deleteText}>Delete transaction</Text></Pressable> : null}
        </>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing[5], paddingBottom: spacing[8], gap: spacing[3] },
  title: { ...typography.title1, color: colors.neutral[900], marginBottom: spacing[3] },
  toggle: { flexDirection: "row", backgroundColor: colors.neutral[100], borderRadius: radii.md, padding: spacing[1] },
  choice: { flex: 1, height: 40, alignItems: "center", justifyContent: "center", borderRadius: radii.sm },
  selected: { backgroundColor: colors.neutral.surface },
  choiceText: { ...typography.bodyMedium, color: colors.neutral[600] },
  selectedText: { color: colors.primary[600] },
  label: { ...typography.caption, color: colors.neutral[700] },
  input: { minHeight: 52, borderRadius: radii.md, backgroundColor: colors.neutral[100], paddingHorizontal: spacing[4], color: colors.neutral[900], ...typography.body },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
  category: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: spacing[2], paddingHorizontal: spacing[3], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, backgroundColor: colors.neutral.surface },
  categorySelected: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  categoryLabel: { ...typography.small, color: colors.neutral[700] },
  error: { ...typography.caption, color: colors.semantic.expense },
  save: { minHeight: 52, borderRadius: radii.md, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center", marginTop: spacing[2] },
  saveText: { ...typography.bodyMedium, color: colors.neutral.surface },
  delete: { minHeight: 52, alignItems: "center", justifyContent: "center" },
  deleteText: { ...typography.bodyMedium, color: colors.semantic.expense },
});