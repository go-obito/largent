import { createClerkSupabaseClient, requireSupabaseConfig } from "@/lib/supabase";
import type { Budget, NeedItem, Transaction } from "@/types/finance";

type CloudRow = Record<string, unknown>;

function asText(value: unknown, field: string): string {
  if (typeof value !== "string") throw new Error(`Invalid cloud ${field}.`);
  return value;
}
function asInt(value: unknown, field: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error(`Invalid cloud ${field}.`);
  return parsed;
}
function asTransaction(row: CloudRow): Transaction {
  return {
    id: asText(row.id, "transaction id"),
    type: row.type === "income" || row.type === "expense" ? row.type : (() => { throw new Error("Invalid cloud transaction type."); })(),
    amount: asInt(row.amount, "amount"),
    categoryId: asText(row.category_id, "category"),
    date: asText(row.date, "date"),
    note: asText(row.note, "note"),
    source: row.source === "manual" || row.source === "csv_import" ? row.source : (() => { throw new Error("Invalid cloud transaction source."); })(),
    createdAt: asText(row.created_at, "created_at"),
    updatedAt: asText(row.updated_at, "updated_at"),
  };
}
function asBudget(row: CloudRow): Budget {
  const period = row.period;
  if (period !== "weekly" && period !== "monthly") throw new Error("Invalid cloud budget period.");
  return {
    id: asText(row.id, "budget id"),
    categoryId: asText(row.category_id, "category"),
    limit: asInt(row.limit, "budget limit"),
    period,
  };
}
function asNeed(row: CloudRow): NeedItem & { position: number } {
  return {
    id: asText(row.id, "need id"),
    name: asText(row.name, "need name"),
    estimatedCost: asInt(row.estimated_cost, "estimated cost"),
    position: asInt(row.position, "position"),
  };
}
const transactionToRow = (userId: string, value: Transaction) => ({
  id: value.id, user_id: userId, type: value.type, amount: value.amount,
  category_id: value.categoryId, date: value.date, note: value.note,
  source: value.source, created_at: value.createdAt, updated_at: value.updatedAt,
});
const budgetToRow = (userId: string, value: Budget) => ({
  id: value.id, user_id: userId, category_id: value.categoryId, limit: value.limit, period: value.period,
});
const needToRow = (userId: string, value: NeedItem, position: number) => ({
  id: value.id, user_id: userId, name: value.name, estimated_cost: value.estimatedCost, position,
});

export function createCloudFinance(getToken: () => Promise<string | null>, userId: string) {
  const client = createClerkSupabaseClient(getToken);
  if (!userId) throw new Error("A signed-in Clerk user is required.");

  async function readTable<T>(table: string, parse: (row: CloudRow) => T, order?: { column: string; ascending: boolean }) {
    let query = client.from(table).select("*");
    if (order) query = query.order(order.column, { ascending: order.ascending });
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => parse(row as CloudRow));
  }
  async function upsertRows(table: string, rows: Record<string, unknown>[]) {
    if (!rows.length) return;
    const { error } = await client.from(table).upsert(rows, { onConflict: "id" });
    if (error) throw new Error(error.message);
  }

  return {
    async pull() {
      requireSupabaseConfig();
      const [transactions, budgets, needs] = await Promise.all([
        readTable("transactions", asTransaction, { column: "date", ascending: false }),
        readTable("budgets", asBudget, { column: "period", ascending: true }),
        readTable("prioritized_needs", asNeed, { column: "position", ascending: true }),
      ]);
      return { transactions, budgets, needs: needs.map(({ position: _position, ...need }) => need) };
    },
    async pushSnapshot(snapshot: { transactions: Transaction[]; budgets: Budget[]; needs: NeedItem[] }) {
      requireSupabaseConfig();
      // Never delete remote rows during sync. Upserts allow retries and use stable IDs.
      await Promise.all([
        upsertRows("transactions", snapshot.transactions.map((row) => transactionToRow(userId, row))),
        upsertRows("budgets", snapshot.budgets.map((row) => budgetToRow(userId, row))),
        upsertRows("prioritized_needs", snapshot.needs.map((row, index) => needToRow(userId, row, index))),
      ]);
    },
    async deleteTransaction(id: string) {
      const { error } = await client.from("transactions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    async deleteBudget(id: string) {
      const { error } = await client.from("budgets").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    async deleteNeed(id: string) {
      const { error } = await client.from("prioritized_needs").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}
