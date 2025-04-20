// hooks/use-merge-data.ts

import { useCallback, useState } from "react";
import type { Metal, Crypto, Currency, Stock } from "@/types/market";

type UpdatedItemsState = {
  metals: Set<string>;
  crypto: Set<string>;
  stocks: Set<string>;
  currencies: Set<string>;
};

type AssetCommon = {
  id?: string;
  price?: number;
  symbol?: string;
  metal?: string;
  date?: string;
};

/**
 * Hook for merging market data and tracking updates
 * 
 * @returns Functions for merging different asset types and updated items tracking
 */
const useMergeData = () => {
  // Track which items have been recently updated to highlight them in the UI
  const [updatedItems, setUpdatedItems] = useState<UpdatedItemsState>({
    metals: new Set<string>(),
    crypto: new Set<string>(),
    stocks: new Set<string>(),
    currencies: new Set<string>(),
  });

  /**
   * Generic function to merge new data with existing data
   * @param current Current data array
   * @param newItem New item to merge
   * @param identifierKey Key to use for identifying matching items
   * @param setKey State key for updatedItems tracking
   * @returns Updated data array
   */
  const mergeData = useCallback(<T extends AssetCommon>(
    current: T[] | null,
    newItem: T,
    identifierKey: keyof T,
    setKey: keyof UpdatedItemsState
  ): T[] => {
    if (!current) return [newItem];

    // Find index of matching item
    const index = current.findIndex((item) => {
      // Match by ID if available
      if (item.id !== undefined && newItem.id !== undefined) {
        return item.id === newItem.id;
      }
      
      // Otherwise match by the specified identifier key
      const currentValue = item[identifierKey];
      const newValue = newItem[identifierKey];
      
      if (typeof currentValue === 'string' && typeof newValue === 'string') {
        return currentValue.toLowerCase() === newValue.toLowerCase();
      }
      
      return false;
    });

    if (index >= 0) {
      // Check if price has changed
      const priceChanged = current[index].price !== newItem.price;
      const updatedData = [...current];
      
      // Sort by date if available to keep the newest data
      if (newItem.date && current[index].date) {
        const newDate = new Date(newItem.date);
        const existingDate = new Date(current[index].date);
        
        // Only update if the new data is newer
        if (newDate > existingDate) {
          updatedData[index] = { ...current[index], ...newItem };
        }
      } else {
        updatedData[index] = { ...current[index], ...newItem };
      }

      // If price changed, highlight this item in the UI
      if (priceChanged) {
        setUpdatedItems((currentState) => {
          const newUpdatedItems = { ...currentState };
          const updateSet = new Set(currentState[setKey]);
          
          let identifier: string | undefined;
          
          // Determine the identifier based on asset type
          if (setKey === 'metals' && typeof newItem.metal === 'string') {
            identifier = newItem.metal.toLowerCase();
          } else if (typeof newItem.symbol === 'string') {
            identifier = newItem.symbol;
          }
          
          if (identifier) {
            updateSet.add(identifier);
            newUpdatedItems[setKey] = updateSet;
            
            // Remove highlight after 2 seconds
            setTimeout(() => {
              setUpdatedItems((currentUpdatedItems) => {
                const tempSet = { ...currentUpdatedItems };
                const updatedSet = new Set(currentUpdatedItems[setKey]);
                updatedSet.delete(identifier as string);
                tempSet[setKey] = updatedSet;
                return tempSet;
              });
            }, 2000);
          }
          
          return newUpdatedItems;
        });
      }
      
      return updatedData;
    }
    
    // If no match, add as new item
    return [...current, newItem];
  }, []);

  // Type-safe merge functions for each asset type
  const mergeMetalData = useCallback(
    (current: Metal[] | null, newItem: Metal): Metal[] =>
      mergeData(current, newItem, 'metal', 'metals'),
    [mergeData]
  );

  const mergeCryptoData = useCallback(
    (current: Crypto[] | null, newItem: Crypto): Crypto[] =>
      mergeData(current, newItem, 'symbol', 'crypto'),
    [mergeData]
  );

  const mergeStockData = useCallback(
    (current: Stock[] | null, newItem: Stock): Stock[] =>
      mergeData(current, newItem, 'symbol', 'stocks'),
    [mergeData]
  );

  const mergeCurrencyData = useCallback(
    (current: Currency[] | null, newItem: Currency): Currency[] =>
      mergeData(current, newItem, 'symbol', 'currencies'),
    [mergeData]
  );

  return {
    mergeMetalData,
    mergeCryptoData,
    mergeStockData,
    mergeCurrencyData,
    updatedItems,
  };
}

export default useMergeData;