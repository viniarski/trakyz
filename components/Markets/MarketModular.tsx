// components/Markets/MarketModular.tsx

"use client";

import { useMemo, memo } from "react";
import {
  Bitcoin,
  DollarSign,
  Coins,
  LineChart,
  TrendingUp,
  TrendingDown,
  Star,
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
  isSubtabView?: boolean; // New prop to determine if this is a subtab view
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

    // asset type specific configurations
    const config = useMemo(() => {
      switch (assetType) {
        case "Crypto":
          return {
            icon: <Bitcoin className="h-5 w-5 text-orange-500" />,
            title: "Crypto",
            getSymbol: (asset: Asset) => (asset as CryptoType).symbol,
            getName: (asset: Asset) => (asset as CryptoType).name,
          };
        case "Cash":
          return {
            icon: <DollarSign className="h-5 w-5 text-green-500" />,
            title: "Currencies",
            getSymbol: (asset: Asset) => (asset as Currency).symbol,
            getName: (asset: Asset) => (asset as Currency).name,
          };
        case "Precious Metals":
          return {
            icon: <Coins className="h-5 w-5 text-yellow-500" />,
            title: "Precious Metals",
            getSymbol: (asset: Asset) => (asset as Metal).metal,
            getName: (asset: Asset) => (asset as Metal).metal,
          };
        case "Stocks & Indexes":
          return {
            icon: <LineChart className="h-5 w-5 text-blue-500" />,
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

    // Updated Mini chart component with real historical data
    const MiniChart = ({ 
      symbol, 
      priceChange, 
      assets: allAssets 
    }: { 
      symbol: string; 
      priceChange: { isPositive: boolean }; 
      assets: Asset[] 
    }) => {
      
      // Get historical data for the last 30 days for this specific symbol
      const getHistoricalData = () => {
        if (assetType !== "Crypto" && assetType !== "Stocks & Indexes") return [];
        
        // Filter all price data for this symbol
        let allPricesForSymbol;
        
        if (assetType === "Crypto") {
          allPricesForSymbol = (allAssets as CryptoType[])
            .filter(asset => asset.symbol === symbol)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (assetType === "Stocks & Indexes") {
          allPricesForSymbol = (allAssets as Stock[])
            .filter(asset => asset.symbol === symbol)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        if (!allPricesForSymbol || allPricesForSymbol.length === 0) return [];

        // Get last 30 days of data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30Days = allPricesForSymbol
          .filter(asset => new Date(asset.date) >= thirtyDaysAgo)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort ascending for chart
          .slice(-30); // Get last 30 entries
        
        return last30Days.map(asset => asset.price);
      };

      const points = getHistoricalData();
      
      // Calculate 30-day trend for chart color (independent of the "Change" column)
      const calculate30DayTrend = () => {
        if (points.length < 2) return true; // Default to positive if no data
        
        const firstPrice = points[0]; // 30 days ago price
        const lastPrice = points[points.length - 1]; // Current/latest price
        
        return lastPrice >= firstPrice; // True if price went up over 30 days
      };
      
      const is30DayPositive = calculate30DayTrend();
      const chartColor = is30DayPositive ? "#10b981" : "#ef4444";
      
      // If we don't have enough historical data, don't render the chart
      if (points.length < 2) {
        return (
          <div className="w-20 h-6 flex items-center justify-center">
            <span className="text-xs text-[var(--text-tertiary)]">No data</span>
          </div>
        );
      }

      // Create SVG path
      const width = 80;
      const height = 24;
      const max = Math.max(...points);
      const min = Math.min(...points);
      const range = max - min || 1;

      const path = points
        .map((point, i) => {
          const x = (i / (points.length - 1)) * width;
          const y = height - ((point - min) / range) * height;
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

      return (
        <div className="w-20 h-6 flex items-center justify-center">
          <svg width={width} height={height} className="overflow-visible">
            <path
              d={path}
              stroke={chartColor}
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    };

    // Render enhanced crypto view for subtab
    if (assetType === "Crypto" && isSubtabView) {
      console.log("Rendering enhanced crypto view with", displayAssets.length, "assets");
      return (
        <div className="space-y-4 transition-all duration-300 ease-in-out">
          {/* Enhanced crypto table */}
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr,1.2fr,1.2fr] gap-4 px-4 py-3 text-sm font-medium text-[var(--text-tertiary)] border-b border-gray-700/30">
              <div className="text-center"></div>
              <div className="text-center">#</div>
              <div>Name</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
              <div className="text-right">Market Cap</div>
              <div className="text-right">Volume 24h</div>
              <div className="text-right">30 Days</div>
            </div>
            
            {/* Crypto rows */}
            {displayAssets.map((asset, index) => {
              const cryptoAsset = asset as CryptoType;
              const symbol = config.getSymbol(asset);
              const name = config.getName(asset);

              const isInWatchlist = watchlist.some(
                (item) => item.category === assetType && item.symbol === symbol
              );

              const priceChange = calculatePriceChange(symbol);
              const rawPrice = convertValue(asset.price, currencyRates, symbol);
              const displayPrice = formatPreciseValue(rawPrice);
              
              const hasRecentUpdate = updatedItems.has(symbol);

              return (
                <div
                  key={symbol}
                  className="grid grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr,1.2fr,1.2fr] gap-4 items-center px-4 py-3 text-sm transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)]/20 rounded-lg"
                >
                  {/* Star/Watchlist Icon */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => onToggleWatchlist(assetType, symbol)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isInWatchlist
                            ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row Number */}
                  <div className="text-center text-[var(--text-secondary)]">
                    {index + 1}
                  </div>

                  {/* Asset Info */}
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-primary)] font-medium text-base">
                      {symbol}
                    </span>
                    {name && (
                      <span className="text-[var(--text-secondary)] text-sm">
                        ({name})
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span
                      className={`text-[var(--text-primary)] font-medium text-base ${
                        hasRecentUpdate ? "bg-green-500/10 rounded px-2 py-1" : ""
                      }`}
                    >
                      {displayPrice}
                    </span>
                  </div>

                  {/* Change % */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {priceChange.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-medium ${
                          priceChange.isPositive
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {priceChange.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Market Cap */}
                  <div className="text-right">
                    <span className="text-[var(--text-primary)] font-medium">
                      {cryptoAsset.market_cap ? formatLargeNumber(cryptoAsset.market_cap) : 'N/A'}
                    </span>
                  </div>

                  {/* Volume 24h */}
                  <div className="text-right">
                    <span className="text-[var(--text-primary)] font-medium">
                      {cryptoAsset.volume_24h ? formatLargeNumber(cryptoAsset.volume_24h) : 'N/A'}
                    </span>
                  </div>

                  {/* Mini Chart - Updated to use real data */}
                  <div className="flex justify-end">
                    <MiniChart 
                      symbol={symbol} 
                      priceChange={priceChange} 
                      assets={assets || []} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Render enhanced stocks view for subtab
    if (assetType === "Stocks & Indexes" && isSubtabView) {
      console.log("Rendering enhanced stocks view with", displayAssets.length, "assets");
      return (
        <div className="space-y-4 transition-all duration-300 ease-in-out">
          {/* Enhanced stocks table */}
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr,1.2fr] gap-4 px-4 py-3 text-sm font-medium text-[var(--text-tertiary)] border-b border-gray-700/30">
              <div className="text-center"></div>
              <div className="text-center">#</div>
              <div>Name</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
              <div className="text-right">Volume</div>
              <div className="text-right">30 Days</div>
            </div>
            
            {/* Stock rows */}
            {displayAssets.map((asset, index) => {
              const stockAsset = asset as Stock;
              const symbol = config.getSymbol(asset);
              const name = config.getName(asset);

              const isInWatchlist = watchlist.some(
                (item) => item.category === assetType && item.symbol === symbol
              );

              const priceChange = calculatePriceChange(symbol);
              const rawPrice = convertValue(asset.price, currencyRates, symbol);
              const displayPrice = formatPreciseValue(rawPrice);
              
              const hasRecentUpdate = updatedItems.has(symbol);

              return (
                <div
                  key={symbol}
                  className="grid grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr,1.2fr] gap-4 items-center px-4 py-3 text-sm transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)]/20 rounded-lg"
                >
                  {/* Star/Watchlist Icon */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => onToggleWatchlist(assetType, symbol)}
                      className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          isInWatchlist
                            ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Row Number */}
                  <div className="text-center text-[var(--text-secondary)]">
                    {index + 1}
                  </div>

                  {/* Asset Info */}
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-primary)] font-medium text-base">
                      {symbol}
                    </span>
                    {name && (
                      <span className="text-[var(--text-secondary)] text-sm">
                        ({name})
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span
                      className={`text-[var(--text-primary)] font-medium text-base ${
                        hasRecentUpdate ? "bg-green-500/10 rounded px-2 py-1" : ""
                      }`}
                    >
                      {displayPrice}
                    </span>
                  </div>

                  {/* Change % */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {priceChange.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-medium ${
                          priceChange.isPositive
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {priceChange.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="text-right">
                    <span className="text-[var(--text-primary)] font-medium">
                      {stockAsset.volume ? formatLargeNumber(stockAsset.volume) : 'N/A'}
                    </span>
                  </div>

                  {/* Mini Chart - Updated to use real data */}
                  <div className="flex justify-end">
                    <MiniChart 
                      symbol={symbol} 
                      priceChange={priceChange} 
                      assets={assets || []} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Original style for all other cases (including "All" view)
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
                key={`${symbol}`}
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
                  <button
                    onClick={() => onToggleWatchlist(assetType, symbol)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        isInWatchlist
                          ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                          : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);