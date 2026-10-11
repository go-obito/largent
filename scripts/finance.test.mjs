import assert from "node:assert/strict";
import test from "node:test";
import { parseCsvDate, parseCsvRows } from "../src/lib/csv.ts";
import { formatMoney, parseCsvAmount, parseMoney } from "../src/lib/currency.ts";
import {
    addBudgetToList,
    addTransactionToList,
    deleteBudgetFromList,
    deleteTransactionFromList,
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