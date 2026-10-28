import { categories, categoryById } from "@/data/categories";
import { formatMoney } from "@/lib/currency";
import { colors, radii, spacing, typography } from "@/theme";
import type { Category, Transaction } from "@/types/finance";
import { StyleSheet, Text, View } from "react-native";

export function ScreenTitle({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Empty({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{description}</Text>
    </View>
  );
}

/**
 * Resolve a transaction's category strictly by ID first. The second pass handles
 * legacy persisted records whose category IDs may have been stored as numbers or
 * with accidental surrounding whitespace. Type matching prevents displaying an
 * income category for an expense (or vice versa).
 */
export function resolveTransactionCategory(transaction: Pick<Transaction, "categoryId" | "type">): Category | undefined {
  const id = typeof transaction.categoryId === "string" ? transaction.categoryId.trim() : "";
  const exact = categoryById(id);
  if (exact?.type === transaction.type) return exact;

  // Do not guess based on transaction type alone; "Other" exists for both kinds.
  return categories.find((category) => category.id === id && category.type === transaction.type);
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const category = resolveTransactionCategory(transaction);
  const isIncome = transaction.type === "income";

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: isIncome ? colors.semantic.incomeTint : colors.semantic.expenseTint }]}>
        <Text style={[styles.iconMark, { color: isIncome ? colors.semantic.income : colors.semantic.expense }]}>{isIncome ? "+" : "−"}</Text>
      </View>
      <View style={styles.rowText}>
        <Text numberOfLines={1} style={styles.rowTitle}>{category?.name ?? "Uncategorized"}</Text>
        <Text numberOfLines={1} style={styles.rowNote}>{transaction.note || new Date(transaction.date).toLocaleDateString()}</Text>
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[styles.amount, { color: isIncome ? colors.semantic.income : colors.neutral[900] }]}
      >
        {formatMoney(transaction.amount, { sign: transaction.type })}
      </Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  title: {
    ...typography.title2,
    color: colors.neutral[900],
    marginBottom: spacing[4],
    flexShrink: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: colors.neutral.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radii.lg,
    padding: spacing[4],
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[5],
  },
  emptyTitle: {
    ...typography.title3,
    color: colors.neutral[900],
    textAlign: "center",
  },
  emptyBody: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: "center",
    marginTop: spacing[2],
  },
  row: {
    minHeight: 64,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    paddingVertical: spacing[2],
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconMark: {
    ...typography.bodyMedium,
    fontSize: 18,
    lineHeight: 18,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    ...typography.bodyMedium,
    color: colors.neutral[900],
  },
  rowNote: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: 2,
  },
  amount: {
    ...typography.bodyMedium,
    flexShrink: 1,
    maxWidth: "45%",
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});
