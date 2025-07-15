// components/Markets/components/Watchlist.tsx

"use client";

import { useMemo } from "react";
import {
  Metal,
  Stock,
  Currency,
  CurrencyCode,
  AssetCategory,
  Crypto as CryptoType,
  LegacyWatchlistItem
} from "@/types";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { UnifiedEnhancedView } from "./EnhancedSubTabs";

type Asset = Currency | CryptoType | Metal | Stock;

interface WatchlistProps {
  watchlist: LegacyWatchlistItem[];
  onToggleWatchlist: (category: AssetCategory, symbol: string) => void;
  marketData: {
    metals: Metal[] | null;
    crypto: CryptoType[] | null;
    stocks: Stock[] | null;
    currencies: Currency[] | null;
  };
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: CryptoType[] | null;
    metals?: Metal[] | null;
  };
  selectedPeriod: "24H" | "7D";
  updatedItems: {
    crypto: Set<string>;
    stocks: Set<string>;
    metals: Set<string>;
    currencies: Set<string>;
  };
}

// Helper function for formatting large numbers
const formatLargeNumber = (value: number): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

export function Watchlist({
  watchlist,
  onToggleWatchlist,
  marketData,
  selectedCurrency,
  currencyRates,
  selectedPeriod,
  updatedItems,
}: WatchlistProps) {
  
  // Group watchlist items by category
  const groupedWatchlist = useMemo(() => {
    const groups: Record<AssetCategory, { items: LegacyWatchlistItem[], assets: Asset[] }> = {
      "Crypto": { items: [], assets: [] },
      "Stocks & Indexes": { items: [], assets: [] },
      "Precious Metals": { items: [], assets: [] },
      "Cash": { items: [], assets: [] },
      "Bonds": { items: [], assets: [] },
      "REIT": { items: [], assets: [] },
      "Commodities": { items: [], assets: [] },
      "Real Estate": { items: [], assets: [] }
    };

    watchlist.forEach(item => {
      if (!groups[item.category]) return;
      
      groups[item.category].items.push(item);
      
      // Find the corresponding asset data
      let asset: Asset | null = null;
      
      switch (item.category) {
        case "Crypto":
          asset = marketData.crypto?.find(c => c.symbol === item.symbol) || null;
          break;
        case "Stocks & Indexes":
          asset = marketData.stocks?.find(s => s.symbol === item.symbol) || null;
          break;
        case "Precious Metals":
          asset = marketData.metals?.find(m => 
            m.metal.toLowerCase() === item.symbol.toLowerCase()
          ) || null;
          break;
        case "Cash":
          asset = marketData.currencies?.find(c => c.symbol === item.symbol) || null;
          break;
      }
      
      if (asset) {
        groups[item.category].assets.push(asset);
      }
    });

    // Filter out empty groups
    return Object.entries(groups).filter(([_, group]) => group.assets.length > 0);
  }, [watchlist, marketData]);

  // Calculate price changes for watchlist assets
  const calculatePriceChange = useMemo(() => {
    return (symbol: string, assetType: AssetCategory): { changePercent: number; isPositive: boolean } => {
      let allAssets: Asset[] = [];
      
      switch (assetType) {
        case "Crypto":
          allAssets = marketData.crypto || [];
          break;
        case "Stocks & Indexes":
          allAssets = marketData.stocks || [];
          break;
        case "Precious Metals":
          allAssets = marketData.metals || [];
          break;
        case "Cash":
          allAssets = marketData.currencies || [];
          break;
        default:
          return { changePercent: 0, isPositive: true };
      }

      const allPricesForSymbol = allAssets.filter((a) => {
        if (assetType === "Crypto") {
          return (a as CryptoType).symbol === symbol;
        } else if (assetType === "Cash") {
          return (a as Currency).symbol === symbol;
        } else if (assetType === "Precious Metals") {
          return (a as Metal).metal.toLowerCase() === symbol.toLowerCase();
        } else if (assetType === "Stocks & Indexes") {
          return (a as Stock).symbol === symbol;
        }
        return false;
      }).sort(
        (a, b) =>
          new Date((b as Asset).date).getTime() -
          new Date((a as Asset).date).getTime()
      );

      if (allPricesForSymbol.length === 0)
        return { changePercent: 0, isPositive: true };

      const currentPrice = allPricesForSymbol[0].price;
      const comparisonDate = new Date();

      if (selectedPeriod === "24H") {
        comparisonDate.setHours(comparisonDate.getHours() - 24);
      } else {
        comparisonDate.setDate(comparisonDate.getDate() - 7);
      }

      const oldPriceData = allPricesForSymbol.find(
        (p) => new Date(p.date) <= comparisonDate
      );
      
      if (!oldPriceData) return { changePercent: 0, isPositive: true };

      const changePercent =
        ((currentPrice - oldPriceData.price) / oldPriceData.price) * 100;
      
      return {
        changePercent,
        isPositive: changePercent >= 0,
      };
    };
  }, [marketData, selectedPeriod]);

  // Asset type specific configurations
  const getConfig = (assetType: AssetCategory) => {
    switch (assetType) {
      case "Crypto":
        return {
          icon: <CategoryIcon type="Crypto" size={5} />,
          title: "Crypto",
          getSymbol: (asset: Asset) => (asset as CryptoType).symbol,
          getName: (asset: Asset) => (asset as CryptoType).name,
        };
      case "Cash":
        return {
          icon: <CategoryIcon type="Cash" size={5} />,
          title: "Currencies",
          getSymbol: (asset: Asset) => (asset as Currency).symbol,
          getName: (asset: Asset) => (asset as Currency).name,
        };
      case "Precious Metals":
        return {
          icon: <CategoryIcon type="Precious Metals" size={5} />,
          title: "Precious Metals",
          getSymbol: (asset: Asset) => (asset as Metal).metal,
          getName: (asset: Asset) => (asset as Metal).metal,
        };
      case "Stocks & Indexes":
        return {
          icon: <CategoryIcon type="Stocks & Indexes" size={5} />,
          title: "Stocks & ETFs",
          getSymbol: (asset: Asset) => (asset as Stock).symbol,
          getName: (asset: Asset) => (asset as Stock).name,
        };
      case "Real Estate":
        return {
          icon: <CategoryIcon type="Real Estate" size={5} />,
          title: "Real Estate",
          getSymbol: (asset: Asset) => (asset as any).symbol || (asset as any).id,
          getName: (asset: Asset) => (asset as any).name || (asset as any).title,
        };
      case "Bonds":
        return {
          icon: <CategoryIcon type="Bonds" size={5} />,
          title: "Bonds",
          getSymbol: (asset: Asset) => (asset as any).symbol,
          getName: (asset: Asset) => (asset as any).name,
        };
      case "REIT":
        return {
          icon: <CategoryIcon type="REIT" size={5} />,
          title: "REIT",
          getSymbol: (asset: Asset) => (asset as any).symbol,
          getName: (asset: Asset) => (asset as any).name,
        };
      case "Commodities":
        return {
          icon: <CategoryIcon type="Commodities" size={5} />,
          title: "Commodities",
          getSymbol: (asset: Asset) => (asset as any).symbol,
          getName: (asset: Asset) => (asset as any).name,
        };
      default:
        return {
          icon: null,
          title: "",
          getSymbol: () => "",
          getName: () => "",
        };
    }
  };

  if (groupedWatchlist.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No assets in watchlist yet
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedWatchlist.map(([categoryKey, group]) => {
        const assetType = categoryKey as AssetCategory;
        const config = getConfig(assetType);
        
        // Create calculatePriceChangeForCategory function for this specific category
        const calculatePriceChangeForCategory = (symbol: string) => 
          calculatePriceChange(symbol, assetType);

        // Get updated items for this category
        const getUpdatedItemsForCategory = () => {
          switch (assetType) {
            case "Crypto":
              return updatedItems.crypto;
            case "Stocks & Indexes":
              return updatedItems.stocks;
            case "Precious Metals":
              return updatedItems.metals;
            case "Cash":
              return updatedItems.currencies;
            default:
              return new Set<string>();
          }
        };

        const enhancedProps = {
          assets: group.assets,
          fullAssets: group.assets, // Use the same assets for charts
          assetType,
          config,
          watchlist,
          onToggleWatchlist,
          selectedCurrency,
          currencyRates,
          calculatePriceChange: calculatePriceChangeForCategory,
          updatedItems: getUpdatedItemsForCategory(),
          formatLargeNumber
        };

        return (
          <div key={categoryKey} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center gap-2">
              {config.icon}
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                {config.title} ({group.assets.length})
              </h3>
            </div>
            
            {/* Use the same UnifiedEnhancedView component */}
            <UnifiedEnhancedView {...enhancedProps} />
          </div>
        );
      })}
    </div>
  );
}