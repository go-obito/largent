import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTransactionStore } from "@/store/transactions";
import { useBudgetStore } from "@/store/budgets";
import { budgetSpend, totals, transactionsInPeriod } from "@/lib/finance";
import { formatMoney } from "@/lib/currency";
import { categoryById } from "@/data/categories";
import { colors, radii, spacing, typography } from "@/theme";
import { Empty, ScreenTitle, TransactionRow, styles as ui } from "@/components/ui";
import { useUser } from "@clerk/expo";

export default function Home() {
	const transactions = useTransactionStore((state) => state.transactions);
	const budgets = useBudgetStore((state) => state.budgets);
	const { user } = useUser();
	const current = totals(transactionsInPeriod(transactions, "monthly"));
	const balance = totals(transactions);
	const greeting = user?.firstName || user?.primaryEmailAddress?.emailAddress || "there";

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
			<ScreenTitle>{`Good day, ${greeting}`}</ScreenTitle>
			<View style={styles.balance}>
				<Text style={styles.balanceLabel}>Total balance</Text>
				<Text style={styles.balanceAmount}>{formatMoney(balance.income - balance.expenses)}</Text>
				<View style={styles.totals}>
					<Text style={styles.income}>+ {formatMoney(current.income)}</Text>
					<Text style={styles.expense}>− {formatMoney(current.expenses)}</Text>
				</View>
			</View>
			<Text style={styles.section}>Budgets</Text>
			{budgets.length === 0 ? (
				<Empty title="No budgets yet" description="Create a budget to track your spending here." />
			) : budgets.map((budget) => {
				const spent = budgetSpend(transactions, budget.categoryId, budget.period);
				const ratio = spent / budget.limit;
				const fillColor = ratio > 1 ? colors.semantic.expense : ratio >= 0.8 ? colors.semantic.warning : colors.primary[600];
				return (
					<View key={budget.id} style={ui.card}>
						<View style={styles.budgetHeader}>
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
			<Text style={styles.section}>Recent transactions</Text>
			{transactions.length === 0 ? (
				<Empty title="No transactions yet" description="Your recent activity will appear here." />
			) : (
				<View style={ui.card}>
					{transactions.slice(0, 5).map((transaction) => (
						<TransactionRow key={transaction.id} transaction={transaction} />
					))}
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.neutral[50] },
	content: { padding: spacing[5], gap: spacing[3], paddingBottom: spacing[8] },
	balance: { backgroundColor: colors.primary[600], padding: spacing[5], borderRadius: radii.lg },
	balanceLabel: { ...typography.caption, color: colors.primary[100] },
	balanceAmount: { ...typography.display, color: colors.neutral.surface, fontVariant: ["tabular-nums"], marginTop: spacing[1] },
	totals: { flexDirection: "row", gap: spacing[5], marginTop: spacing[3] },
	income: { ...typography.caption, color: colors.neutral.surface },
	expense: { ...typography.caption, color: colors.primary[100] },
	section: { ...typography.title3, color: colors.neutral[900], marginTop: spacing[3] },
	budgetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	budgetName: { ...typography.bodyMedium, color: colors.neutral[900] },
	period: { ...typography.small, color: colors.neutral[500] },
	budgetValue: { ...typography.caption, color: colors.neutral[600], marginTop: spacing[1] },
	track: { height: 8, borderRadius: radii.full, backgroundColor: colors.neutral[200], overflow: "hidden", marginTop: spacing[3] },
	fill: { height: "100%", borderRadius: radii.full },
});
