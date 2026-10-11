import assert from "node:assert/strict";
import test from "node:test";
import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import { parseCsvDate, parseCsvRows } from "../src/lib/csv.ts";
import { formatMoney, parseCsvAmount, parseMoney } from "../src/lib/currency.ts";
import { budgetSpend, reportSummary, totals } from "../src/lib/finance.ts";
import {
    addBudgetToList,
    addTransactionToList,
    deleteBudgetFromList,
    deleteTransactionFromList,
    migratePersistedBudgets,
    migratePersistedTransactions,
    removeKnownSeedBudgets,
    removeKnownSeedTransactions,
    updateBudgetInList,
    updateTransactionInList,
} from "../src/store/finance-operations.ts";

const transactionInput = {
  type: "expense",
  amount: 1250,
  categoryId: "food",
  date: "2026-10-11T12:00:00.000Z",
  note: "Lunch",
  source: "manual",
};

function memoryStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (_key, nextValue) => { value = nextValue; },
    removeItem: () => { value = null; },
    read: () => value,
  };
}

test("money formatting and parsing use pesewas", () => {
  assert.equal(formatMoney(12345), "₵123.45");
  assert.equal(formatMoney(12345, { sign: "income" }), "+₵123.45");
  assert.equal(formatMoney(12345, { sign: "expense" }), "−₵123.45");
  assert.equal(parseMoney("12.50"), 1250);
  assert.equal(parseMoney("1.005"), null);
});

test("CSV amounts convert signs and decimal places without floats", () => {
  assert.deepEqual(parseCsvAmount("-1,234.50"), { amount: 123450, type: "expense" });
  assert.deepEqual(parseCsvAmount("(12.5)"), { amount: 1250, type: "expense" });
  assert.deepEqual(parseCsvAmount("50"), { amount: 5000, type: "income" });
  assert.equal(parseCsvAmount("12.345"), null);
});

test("CSV parser handles quoted commas and common dates", () => {
  assert.deepEqual(parseCsvRows('date,description,amount\r\n2026-10-11,"Lunch, cafe",-12.50'), [
    ["date", "description", "amount"],
    ["2026-10-11", "Lunch, cafe", "-12.50"],
  ]);
  assert.equal(parseCsvDate("31/12/2025"), "2025-12-31T12:00:00.000Z");
  assert.equal(parseCsvDate("02/03/2025"), "2025-03-02T12:00:00.000Z");
  assert.equal(parseCsvDate("2025-02-30"), null);
  assert.throws(() => parseCsvRows("date,description,amount\n2026-10-11,Lunch"));
  assert.throws(() => parseCsvRows('date,description,amount\n2026,"unfinished,-1'));
});

test("transaction store transitions add, update, delete, and reject floats", () => {
  const added = addTransactionToList([], transactionInput, "transaction-1", "2026-10-11T12:00:00.000Z");
  assert.equal(added[0].amount, 1250);
  const updated = updateTransactionInList(added, "transaction-1", { ...transactionInput, note: "Dinner" }, "2026-10-12T12:00:00.000Z");
  assert.equal(updated[0].note, "Dinner");
  assert.equal(deleteTransactionFromList(updated, "transaction-1").length, 0);
  assert.throws(() => addTransactionToList([], { ...transactionInput, amount: 12.5 }, "bad", "now"));
});

test("budget store transitions add, update, delete, and reject invalid limits", () => {
  const added = addBudgetToList([], { categoryId: "food", limit: 10000, period: "weekly" }, "budget-1");
  const updated = updateBudgetInList(added, "budget-1", { categoryId: "food", limit: 20000, period: "monthly" });
  assert.equal(updated[0].limit, 20000);
  assert.equal(deleteBudgetFromList(updated, "budget-1").length, 0);
  assert.throws(() => addBudgetToList([], { categoryId: "food", limit: 1.5, period: "weekly" }, "bad"));
});

test("legacy seed migration removes only the exact known record IDs", () => {
  const userTransaction = { ...transactionInput, id: "user-transaction", createdAt: "2026-10-11T12:00:00.000Z", updatedAt: "2026-10-11T12:00:00.000Z" };
  const similarUserTransaction = { ...userTransaction, id: "user-food", amount: 12850, note: "Groceries" };
  const migratedTransactions = removeKnownSeedTransactions([
    userTransaction,
    similarUserTransaction,
    { ...userTransaction, id: "seed-food" },
    { ...userTransaction, id: "seed-salary" },
    { ...userTransaction, id: "seed-transport" },
  ]);
  assert.deepEqual(migratedTransactions, [userTransaction, similarUserTransaction]);

  const userBudget = { id: "user-budget", categoryId: "food", limit: 100000, period: "monthly" };
  const similarUserBudget = { ...userBudget, id: "user-food-budget" };
  assert.deepEqual(removeKnownSeedBudgets([
    userBudget,
    similarUserBudget,
    { ...userBudget, id: "seed-food-budget" },
    { ...userBudget, id: "seed-transport-budget" },
  ]), [userBudget, similarUserBudget]);
});

test("empty collections produce zero totals and empty report categories", () => {
  assert.deepEqual(totals([]), { income: 0, expenses: 0 });
  assert.deepEqual(reportSummary([], "monthly"), { income: 0, expenses: 0, net: 0, byCategory: [], byDate: [] });
  assert.equal(budgetSpend([], "food", "monthly"), 0);
});

test("financial summaries use user-created records", async () => {
  const transactions = [
    { ...transactionInput, id: "user-expense", amount: 2500, date: new Date().toISOString() },
    { ...transactionInput, id: "user-income", type: "income", categoryId: "salary", amount: 10000, date: new Date().toISOString() },
  ];
  assert.deepEqual(totals(transactions), { income: 10000, expenses: 2500 });
  assert.equal(reportSummary(transactions, "monthly").net, 7500);
  assert.equal(budgetSpend(transactions, "food", "monthly"), 2500);
});

test("Zustand hydration preserves user data, removes legacy seeds, and keeps clear empty", async () => {
  const userTransaction = { ...transactionInput, id: "user-transaction", createdAt: "2026-10-11T12:00:00.000Z", updatedAt: "2026-10-11T12:00:00.000Z" };
  const userBudget = { id: "user-budget", categoryId: "food", limit: 100000, period: "monthly" };
  const transactionStorage = memoryStorage(JSON.stringify({
    state: { transactions: [userTransaction, { ...userTransaction, id: "seed-salary" }] },
    version: 1,
  }));
  const budgetStorage = memoryStorage(JSON.stringify({
    state: { budgets: [userBudget, { ...userBudget, id: "seed-food-budget" }] },
    version: 1,
  }));
  const transactionStore = createStore(persist((set) => ({
    transactions: [],
    clear: () => set({ transactions: [] }),
  }), {
    name: "transaction-test",
    version: 2,
    storage: createJSONStorage(() => transactionStorage),
    migrate: migratePersistedTransactions,
    skipHydration: true,
  }));
  const budgetStore = createStore(persist((set) => ({
    budgets: [],
    clear: () => set({ budgets: [] }),
  }), {
    name: "budget-test",
    version: 2,
    storage: createJSONStorage(() => budgetStorage),
    migrate: migratePersistedBudgets,
    skipHydration: true,
  }));

  await transactionStore.persist.rehydrate();
  await budgetStore.persist.rehydrate();
  assert.deepEqual(transactionStore.getState().transactions, [userTransaction]);
  assert.deepEqual(budgetStore.getState().budgets, [userBudget]);
  assert.equal(JSON.parse(transactionStorage.read()).version, 2);
  assert.equal(JSON.parse(budgetStorage.read()).version, 2);

  transactionStore.getState().clear();
  budgetStore.getState().clear();
  await transactionStore.persist.rehydrate();
  await budgetStore.persist.rehydrate();
  assert.deepEqual(transactionStore.getState().transactions, []);
  assert.deepEqual(budgetStore.getState().budgets, []);

  const freshTransactions = createStore(persist(() => ({ transactions: [] }), {
    name: "fresh-transactions-test",
    version: 2,
    storage: createJSONStorage(() => memoryStorage()),
    skipHydration: true,
  }));
  const freshBudgets = createStore(persist(() => ({ budgets: [] }), {
    name: "fresh-budgets-test",
    version: 2,
    storage: createJSONStorage(() => memoryStorage()),
    skipHydration: true,
  }));
  await freshTransactions.persist.rehydrate();
  await freshBudgets.persist.rehydrate();
  assert.deepEqual(freshTransactions.getState().transactions, []);
  assert.deepEqual(freshBudgets.getState().budgets, []);
});