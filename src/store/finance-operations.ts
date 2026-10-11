import type { Budget, Transaction } from "@/types/finance";

export type TransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
export type BudgetInput = Omit<Budget, "id">;

export function validateTransactionInput(input: TransactionInput) {
  if (!Number.isSafeInteger(input.amount) || input.amount <= 0
    || !input.categoryId.trim()
    || !Number.isFinite(new Date(input.date).getTime())
    || typeof input.note !== "string"
    || (input.type !== "income" && input.type !== "expense")
    || (input.source !== "manual" && input.source !== "csv_import")) {
    throw new Error("Invalid transaction.");
  }
}

export function addTransactionToList(transactions: Transaction[], input: TransactionInput, id: string, now: string): Transaction[] {
  validateTransactionInput(input);
  return [{ ...input, id, createdAt: now, updatedAt: now }, ...transactions];
}

export function updateTransactionInList(transactions: Transaction[], id: string, input: TransactionInput, now: string): Transaction[] {
  validateTransactionInput(input);
  return transactions.map((item) => item.id === id ? { ...item, ...input, updatedAt: now } : item);
}

export function deleteTransactionFromList(transactions: Transaction[], id: string): Transaction[] {
  return transactions.filter((item) => item.id !== id);
}

export function validateBudgetInput(input: BudgetInput) {
  if (!Number.isSafeInteger(input.limit) || input.limit <= 0
    || !input.categoryId.trim()
    || (input.period !== "weekly" && input.period !== "monthly")) {
    throw new Error("Invalid budget.");
  }
}

export function addBudgetToList(budgets: Budget[], input: BudgetInput, id: string): Budget[] {
  validateBudgetInput(input);
  return [...budgets, { ...input, id }];
}

export function updateBudgetInList(budgets: Budget[], id: string, input: BudgetInput): Budget[] {
  validateBudgetInput(input);
  return budgets.map((item) => item.id === id ? { ...input, id } : item);
}

export function deleteBudgetFromList(budgets: Budget[], id: string): Budget[] {
  return budgets.filter((item) => item.id !== id);
}