// components/Markets/MarketModular.tsx

"use client";

import { useMemo, memo } from "react";
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Metal,
  Stock,
  Currency,
  CurrencyCode,
  AssetCategory,
  Crypto as CryptoType,
  WatchlistItem
} from "@/types";
import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import { AssetContextMenu } from "../ui/ContextMenu";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { 
  CryptoEnhancedView, 
  StocksEnhancedView, 
  MetalsEnhancedView, 
  CurrenciesEnhancedView 
} from "./EnhancedSubTabs";

type Asset = Currency | CryptoType | Metal | Stock;

interface MarketAssetsProps {
  assets: Asset[] | null;
  limit: number;
  watchlist: WatchlistItem[];
  onToggleWatchlist: (category: AssetCategory, symbol: string) => void;
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: CryptoType[] | null;
    metals?: Metal[] | null;
  };
  selectedPeriod: "24H" | "7D";
  updatedItems?: Set<string>;
  assetType: AssetCategory;
  isSubtabView?: boolean;
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

export const MarketAssets = memo(
  function MarketAssets({
    assets,
    limit,
    watchlist,
    onToggleWatchlist,
    selectedCurrency,
    currencyRates,
    selectedPeriod,
    updatedItems = new Set(),
    assetType,
    isSubtabView = false,
  }: MarketAssetsProps) {
    // Use the currency converter hook
    const { convertValue, formatPreciseValue } = useCurrencyConverter();
    
    const calculatePriceChange = useMemo(() => {
      return (symbol: string): { changePercent: number; isPositive: boolean } => {
        if (!assets) return { changePercent: 0, isPositive: true };
        
        const allPricesForSymbol = assets.filter((a) => {
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
    }, [assets, selectedPeriod, assetType]);

    const displayAssets = useMemo(() => {
      if (!assets) return [];

      const uniqueAssets = Array.from(
        assets.reduce((map: Map<string, Asset>, asset: Asset) => {
          let key: string;
          switch (assetType) {
            case "Crypto":
              key = (asset as CryptoType).symbol;
              break;
            case "Cash":
              key = (asset as Currency).symbol;
              break;
            case "Precious Metals":
              key = (asset as Metal).metal;
              break;
            case "Stocks & Indexes":
              key = (asset as Stock).symbol;
              break;
            default:
              key = "";
          }

          const existingAsset = map.get(key);
          if (
            !existingAsset ||
            new Date(asset.date) > new Date(existingAsset.date)
          ) {
            map.set(key, asset);
          }
          return map;
        }, new Map<string, Asset>())
      )
        .map(([, asset]) => asset)
        .slice(0, limit);

      return uniqueAssets;
    }, [assets, limit, assetType]);

    // Asset type specific configurations - NOW USING CategoryIcon
    const config = useMemo(() => {
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
        default:
          return {
            icon: null,
            title: "",
            getSymbol: () => "",
            getName: () => "",
          };
      }
    }, [assetType]);

    if (!displayAssets || displayAssets.length === 0) {
      return (
        <div className="text-center py-8 text-[var(--text-secondary)]">
          No {config.title.toLowerCase()} data available
        </div>
      );
    }

    // Enhanced sub-tab views
    if (isSubtabView) {
      console.log("🔥 Enhanced view requested for:", assetType, "with", displayAssets.length, "assets");
      console.log("🔥 IsSubtabView:", isSubtabView);
      console.log("🔥 Full assets array length:", assets?.length);
      
      const enhancedProps = {
        assets: displayAssets,
        fullAssets: assets || [], // Pass full assets array for charts
        assetType,
        config,
        watchlist,
        onToggleWatchlist,
        selectedCurrency, // Add selectedCurrency prop
        currencyRates,
        calculatePriceChange,
        updatedItems,
        formatLargeNumber
      };

      switch (assetType) {
        case "Crypto":
          console.log("🚀 Rendering Crypto enhanced view");
          return <CryptoEnhancedView {...enhancedProps} assets={displayAssets as CryptoType[]} />;
        case "Stocks & Indexes":
          console.log("📈 Rendering Stocks enhanced view");
          return <StocksEnhancedView {...enhancedProps} assets={displayAssets as Stock[]} />;
        case "Precious Metals":
          console.log("🥇 Rendering Metals enhanced view");
          return <MetalsEnhancedView {...enhancedProps} assets={displayAssets as Metal[]} />;
        case "Cash":
          console.log("💰 Rendering Currencies enhanced view");
          return <CurrenciesEnhancedView {...enhancedProps} assets={displayAssets as Currency[]} />;
        default:
          console.log("❌ No enhanced view for asset type:", assetType);
          break;
      }
    }

    console.log("📝 Rendering original 'All' view for:", assetType);

    // Original "All" view with 3-dots context menu
    return (
      <div className="space-y-3 transition-all duration-300 ease-in-out">
        <div className="flex items-center gap-2">
          {config.icon}
          <h3 className="text-sm font-medium text-[var(--text-secondary)]">
            {config.title}
          </h3>
        </div>

        <div className="space-y-2">
          {displayAssets.map((asset) => {
            const symbol = config.getSymbol(asset);
            const name = config.getName(asset);

            const isInWatchlist = watchlist.some(
              (item) =>
                item.category === assetType &&
                (assetType === "Precious Metals"
                  ? item.symbol.toLowerCase() === symbol.toLowerCase()
                  : item.symbol === symbol)
            );

            const priceChange = calculatePriceChange(symbol);
            
            // Convert the price from USD to the selected currency, passing the asset symbol
            const rawPrice = convertValue(asset.price, currencyRates, symbol);
            
            // Format the price with the appropriate currency symbol
            const displayPrice = formatPreciseValue(rawPrice);
            
            const hasRecentUpdate = updatedItems.has(
              assetType === "Precious Metals" ? symbol.toLowerCase() : symbol
            );

            return (
              <div
                key={`${assetType}-${symbol}`}
                className="flex justify-between items-center text-sm py-1.5 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[var(--text-secondary)] ${
                      assetType === "Precious Metals" ? "capitalize" : ""
                    }`}
                  >
                    {symbol}
                  </span>
                  {name && name !== symbol && (
                    <span className="text-[var(--text-tertiary)] text-xs">
                      ({name})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[var(--text-primary)] font-medium ${
                      hasRecentUpdate ? "bg-green-500/10 rounded px-2 py-1" : ""
                    }`}
                  >
                    {displayPrice}
                  </span>
                  <div className="flex items-center gap-1">
                    {priceChange.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        priceChange.isPositive
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {priceChange.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <AssetContextMenu 
                    isInWatchlist={isInWatchlist}
                    onToggleWatchlist={() => onToggleWatchlist(assetType, symbol)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);