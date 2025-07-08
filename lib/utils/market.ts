// lib/utils/market.ts

import type { Metal, Stock, Currency, Crypto as CryptoType } from "@/types";

export function sortByPreferredOrder<T>(
  items: T[],
  preferredOrder: string[],
  keyGetter: (item: T) => string
): T[] {
  return [...items].sort((a, b) => {
    const keyA = keyGetter(a);
    const keyB = keyGetter(b);
    const indexA = preferredOrder.indexOf(keyA);
    const indexB = preferredOrder.indexOf(keyB);

    if (indexA === -1 && indexB === -1) return keyA.localeCompare(keyB);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

export function handleRealtimeUpdate<T extends { id: number | string }>(
  current: T[],
  payload: any
): T[] {
  const { eventType, new: newRecord, old: oldRecord } = payload;

  switch (eventType) {
    case "INSERT":
      return [...current, newRecord];
    case "UPDATE":
      return current.map((item) =>
        item.id === newRecord.id ? newRecord : item
      );
    case "DELETE":
      return current.filter((item) => item.id !== oldRecord.id);
    default:
      return current;
  }
}

type DataType = Metal | CryptoType | Stock | Currency;
type SetStateFunction<T> = React.Dispatch<React.SetStateAction<T[] | null>>;
type MergeFunction<T> = (current: T[], newData: T) => T[];
type RemoveFunction<T> = (current: T[], oldData: T) => T[];

export const createGenericChangeHandler = <T extends DataType>(
  setState: SetStateFunction<T>,
  mergeFunction: MergeFunction<T>,
  removeFunction: RemoveFunction<T>,
  label: string
) => {
  return (payload: Record<string, unknown>) => {
    if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
      console.log(`Handling ${label} ${payload.eventType}:`, payload.new);
      setState((current) => {
        const currentArray = current ?? [];
        return mergeFunction(currentArray, payload.new as T);
      });
    } else if (payload.eventType === "DELETE") {
      setState((current) => {
        if (!current) return null;
        const updatedArray = removeFunction(current, payload.old as T);
        return updatedArray.length > 0 ? updatedArray : null;
      });
    }
  };
};
