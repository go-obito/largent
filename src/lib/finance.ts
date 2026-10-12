import type { BudgetPeriod, ReportSummary, Transaction } from "@/types/finance";
export function periodStart(period: BudgetPeriod, date = new Date()) { const start = new Date(date); if (period === "monthly") start.setDate(1); else start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0); return start; }
function dateKey(date: Date) { return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"); }
export function transactionsInPeriod(transactions: Transaction[], period: BudgetPeriod, date = new Date()) {
	const startKey = dateKey(periodStart(period, date));
	const endKey = dateKey(date);
	return transactions.filter((transaction) => {
		const transactionDay = transaction.date.slice(0, 10);
		return transactionDay >= startKey && transactionDay <= endKey;
	});
}
export function totals(transactions: Transaction[]) { return transactions.reduce((result, transaction) => ({ income: result.income + (transaction.type === "income" ? transaction.amount : 0), expenses: result.expenses + (transaction.type === "expense" ? transaction.amount : 0) }), { income: 0, expenses: 0 }); }
export function reportSummary(transactions: Transaction[], period: BudgetPeriod): ReportSummary { const scoped = transactionsInPeriod(transactions, period); const summary = totals(scoped); const categories = new Map<string, number>(); const dates = new Map<string, number>(); scoped.filter((item) => item.type === "expense").forEach((item) => { categories.set(item.categoryId, (categories.get(item.categoryId) ?? 0) + item.amount); const date = item.date.slice(0, 10); dates.set(date, (dates.get(date) ?? 0) + item.amount); }); return { ...summary, net: summary.income - summary.expenses, byCategory: [...categories].map(([categoryId, amount]) => ({ categoryId, amount })), byDate: [...dates].map(([date, amount]) => ({ date, amount })) }; }
export function budgetSpend(transactions: Transaction[], categoryId: string, period: BudgetPeriod) { return transactionsInPeriod(transactions, period).filter((item) => item.type === "expense" && item.categoryId === categoryId).reduce((total, item) => total + item.amount, 0); }

export type SpendingBucket = { label: string; amount: number };

export function spendingOverTime(transactions: Transaction[], period: BudgetPeriod, date = new Date()): SpendingBucket[] {
	const start = periodStart(period, date);
	const scoped = transactionsInPeriod(transactions, period, date).filter((item) => item.type === "expense");

	if (period === "weekly") {
		const amounts = Array<number>(7).fill(0);
		scoped.forEach((transaction) => {
			const transactionDate = new Date(transaction.date);
			const offset = Math.floor((transactionDate.getTime() - start.getTime()) / 86_400_000);
			if (offset >= 0 && offset < 7) amounts[offset] += transaction.amount;
		});
		return amounts.map((amount, index) => ({ label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index], amount }));
	}

	const mondayOffset = (start.getDay() + 6) % 7;
	const bucketCount = Math.ceil((mondayOffset + new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()) / 7);
	const amounts = Array<number>(bucketCount).fill(0);
	scoped.forEach((transaction) => {
		const transactionDate = new Date(transaction.date);
		const index = Math.floor((mondayOffset + transactionDate.getDate() - 1) / 7);
		if (index >= 0 && index < amounts.length) amounts[index] += transaction.amount;
	});
	return amounts.map((amount, index) => ({ label: `Week ${index + 1}`, amount }));
}
