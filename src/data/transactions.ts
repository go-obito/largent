import type { Transaction } from "@/types/finance";
const now = new Date().toISOString();
/** Development-only seed data. Remove this export before production release. */
export const sampleTransactions: Transaction[] = [
  { id: "seed-salary", type: "income", amount: 850000, categoryId: "salary", date: now, note: "Monthly salary", source: "manual", createdAt: now, updatedAt: now },
  { id: "seed-food", type: "expense", amount: 12850, categoryId: "food", date: now, note: "Groceries", source: "manual", createdAt: now, updatedAt: now },
  { id: "seed-transport", type: "expense", amount: 6400, categoryId: "transport", date: now, note: "Transport", source: "manual", createdAt: now, updatedAt: now },
];
