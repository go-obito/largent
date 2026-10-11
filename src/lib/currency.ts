export const CURRENCY = { code: "GHS", symbol: "₵", minorUnit: 100 } as const;
export function formatMoney(amount: number, options: { sign?: "income" | "expense" } = {}) { const sign = options.sign === "income" ? "+" : options.sign === "expense" ? "−" : ""; const absolute = Math.abs(Math.trunc(amount)); return `${sign}${CURRENCY.symbol}${Math.floor(absolute / CURRENCY.minorUnit).toLocaleString("en-GH")}.${String(absolute % CURRENCY.minorUnit).padStart(2, "0")}`; }
export function parseMoney(value: string): number | null { const normalized = value.trim().replace(/,/g, ""); if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null; const [whole, decimal = ""] = normalized.split("."); const result = Number(whole) * CURRENCY.minorUnit + Number(decimal.padEnd(2, "0")); return Number.isSafeInteger(result) && result > 0 ? result : null; }

export function parseCsvAmount(value: string): { amount: number; type: "income" | "expense" } | null {
	const normalized = value.trim().replace(/[₵\s,]/g, "");
	const parentheses = normalized.startsWith("(") && normalized.endsWith(")");
	const numeric = parentheses ? normalized.slice(1, -1) : normalized;
	const match = /^([+-]?)(\d+)(?:\.(\d{1,2}))?$/.exec(numeric);
	if (!match) return null;
	const amount = Number(match[2]) * CURRENCY.minorUnit + Number((match[3] ?? "").padEnd(2, "0"));
	if (!Number.isSafeInteger(amount) || amount <= 0) return null;
	return { amount, type: parentheses || match[1] === "-" ? "expense" : "income" };
}
