import type { NeedItem } from "@/types/finance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addNeedToList, deleteNeedFromList, moveNeedInList, updateNeedInList, type NeedInput, type NeedMoveDirection } from "./needs-operations";

type State = {
  needs: NeedItem[];
  add: (input: NeedInput) => void;
  update: (id: string, input: NeedInput) => void;
  remove: (id: string) => void;
  move: (id: string, direction: NeedMoveDirection) => void;
  clear: () => void;
};

export const useNeedsStore = create<State>()(persist((set) => ({
  needs: [],
  add: (input) => set((state) => ({ needs: addNeedToList(state.needs, input, randomUUID()) })),
  update: (id, input) => set((state) => ({ needs: updateNeedInList(state.needs, id, input) })),
  remove: (id) => set((state) => ({ needs: deleteNeedFromList(state.needs, id) })),
  move: (id, direction) => set((state) => ({ needs: moveNeedInList(state.needs, id, direction) })),
  clear: () => set({ needs: [] }),
}), { name: "largent-needs", version: 1, storage: createJSONStorage(() => AsyncStorage) }));