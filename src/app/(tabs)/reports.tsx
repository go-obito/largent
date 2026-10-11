import { Empty, ScreenTitle, styles as ui } from "@/components/ui";
import { categoryById } from "@/data/categories";
import { formatMoney } from "@/lib/currency";
import { reportSummary, spendingOverTime } from "@/lib/finance";
import { useTransactionStore } from "@/store/transactions";
import { colors, radii, spacing, typography } from "@/theme";
import type { ReportPeriod } from "@/types/finance";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
export default function Reports() {
	const transactions = useTransactionStore((state) => state.transactions);
	const [period, setPeriod] = useState<ReportPeriod>("monthly");
	const summary = reportSummary(transactions, period);
	const buckets = spendingOverTime(transactions, period);
	const maxBucket = Math.max(...buckets.map((bucket) => bucket.amount), 0);

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
			<ScreenTitle>Reports</ScreenTitle>
			<View style={styles.toggle}>
				{(["weekly", "monthly"] as const).map((value) => (
					<Pressable key={value} onPress={() => setPeriod(value)} style={[styles.choice, value === period && styles.selected]}>
						<Text style={[styles.choiceText, value === period && styles.selectedText]}>{value}</Text>
					</Pressable>
				))}
			</View>
			{transactions.length === 0 ? <Empty title="Nothing to report yet" description="Add transactions to see your money story." /> : <>
				<View style={ui.card}>
					<Text style={styles.label}>Net balance</Text>
					<Text style={styles.net}>{formatMoney(summary.net)}</Text>
					<Text style={styles.income}>Income {formatMoney(summary.income)}</Text>
					<Text style={styles.expense}>Expenses {formatMoney(summary.expenses)}</Text>
				</View>
				<Text style={styles.heading}>Spending over time</Text>
				<View style={ui.card}>
					{maxBucket === 0 ? <Text style={styles.emptyChart}>No spending during this period.</Text> : buckets.map((bucket) => (
						<View key={bucket.label} style={styles.bucket}>
							<Text style={styles.bucketLabel}>{bucket.label}</Text>
							<View style={styles.barTrack}>
								{bucket.amount > 0 ? <View style={[styles.bar, { width: `${(bucket.amount / maxBucket) * 100}%` }]} /> : null}
							</View>
							<Text style={styles.bucketAmount}>{formatMoney(bucket.amount)}</Text>
						</View>
					))}
				</View>
				<Text style={styles.heading}>Spending by category</Text>
				{summary.byCategory.length === 0 ? <View style={ui.card}><Text style={styles.emptyChart}>No expenses during this period.</Text></View> : summary.byCategory.map((item) => (
					<View key={item.categoryId} style={ui.card}>
						<Text style={styles.label}>{categoryById(item.categoryId)?.name ?? "Other"}</Text>
						<Text style={styles.amount}>{formatMoney(item.amount, { sign: "expense" })}</Text>
					</View>
				))}
			</>}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.neutral[50] },
	content: { flexGrow: 1, padding: spacing[5], gap: spacing[3] },
	toggle: { flexDirection: "row", backgroundColor: colors.neutral[100], borderRadius: radii.md, padding: spacing[1] },
	choice: { flex: 1, height: 36, justifyContent: "center", alignItems: "center", borderRadius: radii.sm },
	selected: { backgroundColor: colors.neutral.surface },
	choiceText: { ...typography.caption, color: colors.neutral[600] },
	selectedText: { color: colors.primary[600] },
	label: { ...typography.caption, color: colors.neutral[600] },
	net: { ...typography.title1, color: colors.neutral[900] },
	income: { ...typography.caption, color: colors.semantic.income, marginTop: spacing[2] },
	expense: { ...typography.caption, color: colors.semantic.expense, marginTop: spacing[1] },
	heading: { ...typography.title3, color: colors.neutral[900], marginTop: spacing[3] },
	amount: { ...typography.bodyMedium, color: colors.neutral[900], marginTop: spacing[1] },
	emptyChart: { ...typography.caption, color: colors.neutral[600] },
	bucket: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: spacing[2] },
	bucketLabel: { ...typography.small, color: colors.neutral[600], width: 48 },
	barTrack: { flex: 1, height: 8, backgroundColor: colors.neutral[200], borderRadius: radii.full, overflow: "hidden" },
	bar: { height: "100%", backgroundColor: colors.primary[600], borderRadius: radii.full },
	bucketAmount: { ...typography.small, color: colors.neutral[700], fontVariant: ["tabular-nums"], minWidth: 76, textAlign: "right" },
});
