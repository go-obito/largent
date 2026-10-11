import { Empty, ScreenTitle, TransactionRow, styles as ui } from "@/components/ui";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Transactions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactions = useTransactionStore((state) => state.transactions);
  const sorted = [...transactions].sort((left, right) => right.date.localeCompare(left.date));
  const groups = sorted.reduce<{ date: string; transactions: typeof sorted }[]>((result, transaction) => {
    const date = transaction.date.slice(0, 10);
    const group = result.find((item) => item.date === date);
    if (group) group.transactions.push(transaction);
    else result.push({ date, transactions: [transaction] });
    return result;
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ScreenTitle>Transactions</ScreenTitle>
          <Pressable onPress={() => router.push("/import" as never)} accessibilityRole="button">
            <Text style={styles.importLink}>Import CSV</Text>
          </Pressable>
        </View>

        {groups.length === 0 ? (
          <Empty title="No transactions yet" description="Add an income or expense to get started." />
        ) : (
          groups.map((group) => (
            <View key={group.date}>
              <Text style={styles.dateHeading}>{new Date(`${group.date}T12:00:00`).toLocaleDateString()}</Text>
              <View style={ui.card}>
                {group.transactions.map((transaction) => (
                  <Pressable key={transaction.id} onPress={() => router.push(`/transaction/${transaction.id}` as never)} accessibilityRole="button">
                    <TransactionRow transaction={transaction} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable style={[styles.add, { bottom: Math.max(spacing[4], insets.bottom + spacing[2]) }]} onPress={() => router.push("/transaction/new" as never)} accessibilityRole="button">
        <Text style={styles.addText}>Add transaction</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { flexGrow: 1, padding: spacing[5], paddingBottom: 88, gap: spacing[3] },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateHeading: { ...typography.caption, color: colors.neutral[600], marginBottom: spacing[2], textTransform: "capitalize" },
  importLink: { ...typography.bodyMedium, color: colors.primary[600] },
  add: { position: "absolute", left: spacing[5], right: spacing[5], bottom: spacing[4], minHeight: 52, borderRadius: radii.md, backgroundColor: colors.primary[600], alignItems: "center", justifyContent: "center" },
  addText: { ...typography.bodyMedium, color: colors.neutral.surface },
});
