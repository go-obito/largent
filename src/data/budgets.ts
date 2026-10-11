import type { Budget } from "@/types/finance";
/** Development-only seed data. Remove this export before production release. */
export const sampleBudgets: Budget[] = [{ id: "seed-food-budget", categoryId: "food", limit: 100000, period: "monthly" }, { id: "seed-transport-budget", categoryId: "transport", limit: 50000, period: "monthly" }];
