import type { NeedItem } from "@/types/finance";

export type NeedInput = Omit<NeedItem, "id">;
export type NeedMoveDirection = -1 | 1;

export function validateNeedInput(input: NeedInput) {
  if (typeof input.name !== "string" || !input.name.trim() || input.name.trim().length > 80
    || !Number.isSafeInteger(input.estimatedCost) || input.estimatedCost <= 0) {
    throw new Error("Enter an item name and an estimated cost greater than zero.");
  }
}

export function addNeedToList(needs: NeedItem[], input: NeedInput, id: string): NeedItem[] {
  validateNeedInput(input);
  return [...needs, { ...input, name: input.name.trim(), id }];
}

export function updateNeedInList(needs: NeedItem[], id: string, input: NeedInput): NeedItem[] {
  validateNeedInput(input);
  return needs.map((need) => need.id === id ? { ...input, name: input.name.trim(), id } : need);
}

export function deleteNeedFromList(needs: NeedItem[], id: string): NeedItem[] {
  return needs.filter((need) => need.id !== id);
}

export function moveNeedInList(needs: NeedItem[], id: string, direction: NeedMoveDirection): NeedItem[] {
  const index = needs.findIndex((need) => need.id === id);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= needs.length) return needs;
  const reordered = [...needs];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return reordered;
}