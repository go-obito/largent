import type { NeedItem } from "@/types/finance";

export function needsTotal(needs: NeedItem[]): number {
  return needs.reduce((total, need) => total + need.estimatedCost, 0);
}