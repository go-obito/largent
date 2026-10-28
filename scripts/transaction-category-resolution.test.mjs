import assert from "node:assert/strict";
import test from "node:test";
import { categories, categoryById } from "../src/data/categories.ts";

function resolveTransactionCategory(transaction) {
  const id = typeof transaction.categoryId === "string" ? transaction.categoryId.trim() : "";
  const exact = categoryById(id);
  if (exact?.type === transaction.type) return exact;
  return categories.find((category) => category.id === id && category.type === transaction.type);
}

test("resolves selected expense and income categories by their IDs", () => {
  assert.equal(resolveTransactionCategory({ categoryId: "food", type: "expense" })?.name, "Food");
  assert.equal(resolveTransactionCategory({ categoryId: "salary", type: "income" })?.name, "Salary");
  assert.equal(resolveTransactionCategory({ categoryId: "transport", type: "expense" })?.icon, "car-outline");
});

test("handles whitespace around legacy category IDs", () => {
  assert.equal(resolveTransactionCategory({ categoryId: " food ", type: "expense" })?.name, "Food");
  assert.equal(resolveTransactionCategory({ categoryId: " salary ", type: "income" })?.name, "Salary");
});

test("does not match categories of the wrong transaction type", () => {
  assert.equal(resolveTransactionCategory({ categoryId: "salary", type: "expense" }), undefined);
  assert.equal(resolveTransactionCategory({ categoryId: "food", type: "income" }), undefined);
});

test("keeps invalid or unknown IDs uncategorized instead of guessing", () => {
  assert.equal(resolveTransactionCategory({ categoryId: "", type: "expense" }), undefined);
  assert.equal(resolveTransactionCategory({ categoryId: "unknown", type: "expense" }), undefined);
  assert.equal(resolveTransactionCategory({ categoryId: 0, type: "expense" }), undefined);
});
