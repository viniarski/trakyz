// components/Markets/MarketRatesMerge.tsx

"use client";

import { useCallback, useState } from "react";
import type { Metal, Stock, Currency, Crypto as CryptoType } from "@/types";

const identifierKeys: Record<string, string> = {
  metals: "metal",
  crypto: "symbol",
  stocks: "symbol",
  currencies: "symbol",
};

type UpdatedItemsState = {
  [K in "metals" | "crypto" | "stocks" | "currencies"]: Set<string>;
} & {
  [key: string]: Set<string>;
};

// Create a safer solution without using 'any'
type AssetCommon = {
  id?: string;
  price?: number;
  symbol?: string;
  metal?: string;
};

// This function safely gets the identifier from an asset based on the data type
function getIdentifier<T extends AssetCommon>(item: T, dataType: keyof UpdatedItemsState): string | undefined {
  const key = identifierKeys[dataType as string];
  
  if (key === "symbol" && typeof item.symbol === "string") {
    return item.symbol;
  }
  
  if (key === "metal" && typeof item.metal === "string") {
    return item.metal;
  }
  
  return undefined;
}

// This is a type-safe implementation without 'any'
function mergeData<T extends AssetCommon>(
  current: T[] | null,
  newItem: T,
  dataType: keyof UpdatedItemsState,
  setUpdatedItems: React.Dispatch<React.SetStateAction<UpdatedItemsState>>
): T[] {
  if (!current) return [newItem];
  
  const index = current.findIndex((item) => {
    // Check for ID match
    if (item.id !== undefined && newItem.id !== undefined && item.id === newItem.id) {
      return true;
    }
    
    // Check for identifier (symbol/metal) match
    const currentId = getIdentifier(item, dataType);
    const newId = getIdentifier(newItem, dataType);
    
    if (typeof currentId === "string" && typeof newId === "string") {
      return currentId.toLowerCase() === newId.toLowerCase();
    }
    
    return false;
  });

  if (index >= 0) {
    const priceChanged = current[index].price !== newItem.price;
    const updatedData = [...current];
    updatedData[index] = { ...current[index], ...newItem };

    if (priceChanged) {
      setUpdatedItems((currentState) => {
        const newUpdatedItems = { ...currentState };
        const setKey = dataType;
        newUpdatedItems[setKey] = new Set(currentState[setKey]);

        // Get the identifier
        const identifier = getIdentifier(newItem, dataType);
        if (typeof identifier === "string") {
          (newUpdatedItems[setKey] as Set<string>).add(identifier);

          setTimeout(() => {
            setUpdatedItems((currentUpdatedItems) => {
              const tempSet = { ...currentUpdatedItems };
              tempSet[setKey] = new Set(currentUpdatedItems[setKey]);
              tempSet[setKey].delete(identifier);
              return tempSet;
            });
          }, 2000);
        }
        
        return newUpdatedItems;
      });
    }
    return updatedData;
  }
  return [...current, newItem];
}

// Type-safe merge functions for each asset type
const useMergeData = () => {
  const [updatedItems, setUpdatedItems] = useState<UpdatedItemsState>({
    metals: new Set(),
    crypto: new Set(),
    stocks: new Set(),
    currencies: new Set(),
  });

  const mergeMetalData = useCallback(
    (current: Metal[] | null, newItem: Metal) =>
      mergeData(current, newItem, "metals", setUpdatedItems),
    []
  );

  const mergeCryptoData = useCallback(
    (current: CryptoType[] | null, newItem: CryptoType) =>
      mergeData(current, newItem, "crypto", setUpdatedItems),
    []
  );

  const mergeStockData = useCallback(
    (current: Stock[] | null, newItem: Stock) =>
      mergeData(current, newItem, "stocks", setUpdatedItems),
    []
  );

  const mergeCurrencyData = useCallback(
    (current: Currency[] | null, newItem: Currency) =>
      mergeData(current, newItem, "currencies", setUpdatedItems),
    []
  );

  return {
    mergeMetalData,
    mergeCryptoData,
    mergeStockData,
    mergeCurrencyData,
    updatedItems,
  };
};

export default useMergeData;

