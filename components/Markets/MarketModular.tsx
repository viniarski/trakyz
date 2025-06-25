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
            title: "Assets",
            getSymbol: () => "",
            getName: () => "",
          };
      }
    }, [assetType]);

    if (!displayAssets.length) return null;

    // Simple chart component using real price data
    const MiniChart = ({ symbol, priceChange }: { symbol: string; priceChange: { changePercent: number; isPositive: boolean } }) => {
      // Get historical data for this symbol
      const getHistoricalData = () => {
        if (!assets) return [];
        
        const symbolData = assets
          .filter((asset) => {
            if (assetType === "Crypto") {
              return (asset as CryptoType).symbol === symbol;
            }
            return false;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Last 7 data points
        
        return symbolData.map(asset => asset.price);
      };

      const historicalPrices = getHistoricalData();
      
      // If we don't have enough data, create a trend based on change
      let chartData = historicalPrices;
      if (chartData.length < 2) {
        // Generate trend data based on price change
        const basePrice = 100;
        const points = 7;
        chartData = [];
        
        for (let i = 0; i < points; i++) {
          const progress = i / (points - 1);
          const trend = priceChange.isPositive 
            ? basePrice + (progress * Math.abs(priceChange.changePercent) * 0.5)
            : basePrice - (progress * Math.abs(priceChange.changePercent) * 0.5);
          const noise = (Math.random() - 0.5) * Math.abs(priceChange.changePercent) * 0.1;
          chartData.push(trend + noise);
        }
      }

      const chartColor = priceChange.isPositive ? "#10b981" : "#ef4444";
      
      // Normalize data for chart
      const minPrice = Math.min(...chartData);
      const maxPrice = Math.max(...chartData);
      const priceRange = maxPrice - minPrice || 1;
      
      // Create SVG path
      const width = 80;
      const height = 24;
      const padding = 2;
      
      const path = chartData
        .map((price, index) => {
          const x = padding + (index / (chartData.length - 1)) * (width - padding * 2);
          const normalizedPrice = (price - minPrice) / priceRange;
          const y = height - padding - (normalizedPrice * (height - padding * 2));
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
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
            <div className="grid grid-cols-[auto,2fr,1.2fr,1fr,1.2fr,1.2fr,1.2fr] gap-4 px-4 py-3 text-sm font-medium text-[var(--text-tertiary)] border-b border-gray-700/30">
              <div className="text-center">#</div>
              <div>Name</div>
              <div className="text-right">Price</div>
              <div className="text-right">Change</div>
              <div className="text-right">Market Cap</div>
              <div className="text-right">Volume 24h</div>
              <div className="text-right">7 Days</div>
            </div>
            
            {/* Crypto rows */}
            {displayAssets.map((asset) => {
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
                  className="grid grid-cols-[2fr,1.2fr,1fr,1.2fr,1.2fr,1.2fr] gap-4 items-center px-4 py-3 text-sm transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)]/20 rounded-lg"
                >
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
                        {priceChange.isPositive ? '+' : ''}{priceChange.changePercent.toFixed(2)}%
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

                  {/* Mini Chart */}
                  <div className="flex justify-end items-center gap-3">
                    <MiniChart symbol={symbol} priceChange={priceChange} />
                    <AssetContextMenu
                      isInWatchlist={isInWatchlist}
                      onToggleWatchlist={() =>
                        onToggleWatchlist(assetType, symbol)
                      }
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
                  {name && assetType !== "Precious Metals" && (
                    <span className="text-[var(--text-secondary)] text-xs hidden sm:inline">
                      ({name})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-[var(--text-primary)] font-medium transition-all duration-300 ease-in-out ${
                      hasRecentUpdate ? "bg-green-500/10 rounded px-1" : ""
                    }`}
                  >
                    {displayPrice}
                  </span>
                  <div className="flex items-center gap-1 min-w-[80px] justify-end transition-all duration-300 ease-in-out">
                    {priceChange.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`${
                        priceChange.isPositive
                          ? "text-green-500"
                          : "text-red-500"
                      } transition-all duration-300 ease-in-out`}
                    >
                      {Math.abs(priceChange.changePercent).toFixed(2)}%
                    </span>
                  </div>
                  <AssetContextMenu
                    isInWatchlist={isInWatchlist}
                    onToggleWatchlist={() =>
                      onToggleWatchlist(assetType, symbol)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
  (prevProps: MarketAssetsProps, nextProps: MarketAssetsProps) => {
    return (
      prevProps.assets === nextProps.assets &&
      prevProps.limit === nextProps.limit &&
      prevProps.watchlist === nextProps.watchlist &&
      prevProps.selectedCurrency === nextProps.selectedCurrency &&
      prevProps.currencyRates === nextProps.currencyRates &&
      prevProps.selectedPeriod === nextProps.selectedPeriod &&
      prevProps.updatedItems === nextProps.updatedItems &&
      prevProps.assetType === nextProps.assetType &&
      prevProps.isSubtabView === nextProps.isSubtabView
    );
  }
);