// components/Markets/components/EnhancedSubTabs.tsx

"use client";

import { memo } from "react";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
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
import { MiniChart } from "./MiniChart";

type Asset = Currency | CryptoType | Metal | Stock;

interface EnhancedSubTabProps {
  assets: Asset[];
  fullAssets: Asset[];
  assetType: AssetCategory;
  config: {
    icon: React.ReactNode;
    title: string;
    getSymbol: (asset: Asset) => string;
    getName: (asset: Asset) => string;
  };
  watchlist: LegacyWatchlistItem[];
  onToggleWatchlist: (category: AssetCategory, symbol: string) => void;
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: CryptoType[] | null;
    metals?: Metal[] | null;
  };
  calculatePriceChange: (symbol: string) => { changePercent: number; isPositive: boolean };
  updatedItems: Set<string>;
  formatLargeNumber: (value: number) => string;
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

// UNIFIED Enhanced View - Works for ALL asset types
export const UnifiedEnhancedView = memo(function UnifiedEnhancedView({
  assets,
  fullAssets,
  assetType,
  config,
  watchlist,
  onToggleWatchlist,
  selectedCurrency,
  currencyRates,
  calculatePriceChange,
  updatedItems
}: EnhancedSubTabProps) {
  const { convertValue, formatPreciseValue } = useCurrencyConverter();

  // Dynamic grid columns based on asset type
  const getGridCols = () => {
    switch (assetType) {
      case "Crypto":
        return "grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr,1.2fr,1.2fr]";
      case "Stocks & Indexes":
        return "grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr,1.2fr]";
      case "Precious Metals":
        return "grid-cols-[auto,auto,2fr,1.2fr,1.2fr,1.2fr,1fr,1.2fr]";
      case "Cash":
        return "grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr]";
      default:
        return "grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr]";
    }
  };

  // Dynamic header based on asset type
  const renderHeader = () => {
    switch (assetType) {
      case "Crypto":
        return [
          <div key="star" className="text-center"></div>,
          <div key="number" className="text-center">#</div>,
          <div key="name">Name</div>,
          <div key="price" className="text-right">Price</div>,
          <div key="change" className="text-right">Change</div>,
          <div key="marketcap" className="text-right">Market Cap</div>,
          <div key="volume" className="text-right">Volume 24h</div>,
          <div key="chart" className="text-right">30 Days</div>
        ];
      case "Stocks & Indexes":
        return [
          <div key="star" className="text-center"></div>,
          <div key="number" className="text-center">#</div>,
          <div key="name">Name</div>,
          <div key="price" className="text-right">Price</div>,
          <div key="change" className="text-right">Change</div>,
          <div key="volume" className="text-right">Volume</div>,
          <div key="chart" className="text-right">30 Days</div>
        ];
      case "Precious Metals":
        return [
          <div key="star" className="text-center"></div>,
          <div key="number" className="text-center">#</div>,
          <div key="name">Name</div>,
          <div key="price" className="text-right">Price (g)</div>,
          <div key="priceoz" className="text-right">Price (oz)</div>,
          <div key="pricekg" className="text-right">Price (kg)</div>,
          <div key="change" className="text-right">Change</div>,
          <div key="chart" className="text-right">30 Days</div>
        ];
      case "Cash":
        return [
          <div key="star" className="text-center"></div>,
          <div key="number" className="text-center">#</div>,
          <div key="name">Name</div>,
          <div key="price" className="text-right">Price</div>,
          <div key="change" className="text-right">Change</div>,
          <div key="chart" className="text-right">30 Days</div>
        ];
      default:
        return [
          <div key="star" className="text-center"></div>,
          <div key="number" className="text-center">#</div>,
          <div key="name">Name</div>,
          <div key="price" className="text-right">Price</div>
        ];
    }
  };

  // Dynamic row content based on asset type
  const renderRowContent = (asset: Asset, index: number) => {
    const symbol = config.getSymbol(asset);
    const name = config.getName(asset);
    const isInWatchlist = watchlist.some(
      (item) => item.category === assetType && 
      (assetType === "Precious Metals" 
        ? item.symbol.toLowerCase() === symbol.toLowerCase()
        : item.symbol === symbol)
    );
    const priceChange = calculatePriceChange(symbol);
    const rawPrice = convertValue(asset.price, currencyRates, symbol);
    const displayPrice = formatPreciseValue(rawPrice);
    const hasRecentUpdate = updatedItems.has(symbol);

    const baseContent = [
      // Star/Watchlist Icon
      <div key="star" className="flex justify-center">
        <button
          onClick={() => onToggleWatchlist(assetType, symbol)}
          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Star
            className={`h-3 w-3 ${
              isInWatchlist
                ? "fill-[var(--accent-primary)] text-[var(--accent-primary)]"
                : ""
            }`}
          />
        </button>
      </div>,
      // Row Number
      <div key="number" className="text-center text-[var(--text-secondary)]">
        {index + 1}
      </div>,
      // Asset Info
      <div key="name" className="flex items-center gap-2">
        <span className="text-[var(--text-primary)] font-medium text-xs">
          {symbol}
        </span>
        {name && (
          <span className="text-[var(--text-secondary)] text-xs">
            ({name})
          </span>
        )}
      </div>,
      // Price
      <div key="price" className="text-right">
        <span
          className={`text-[var(--text-primary)] font-medium text-xs ${
            hasRecentUpdate ? "bg-green-500/10 rounded px-1 py-0.5" : ""
          }`}
        >
          {displayPrice}
        </span>
      </div>
    ];

    switch (assetType) {
      case "Crypto":
        const cryptoAsset = asset as CryptoType;
        return [
          ...baseContent,
          // Change %
          <div key="change" className="text-right">
            <div className="flex items-center justify-end gap-1">
              {priceChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`font-medium text-xs ${
                  priceChange.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>,
          // Market Cap
          <div key="marketcap" className="text-right">
            <span className="text-[var(--text-primary)] font-medium text-xs">
              {cryptoAsset.market_cap ? formatLargeNumber(cryptoAsset.market_cap) : 'N/A'}
            </span>
          </div>,
          // Volume 24h
          <div key="volume" className="text-right">
            <span className="text-[var(--text-primary)] font-medium text-xs">
              {cryptoAsset.volume_24h ? formatLargeNumber(cryptoAsset.volume_24h) : 'N/A'}
            </span>
          </div>,
          // Mini Chart
          <div key="chart" className="flex justify-end">
            <MiniChart 
              symbol={symbol} 
              priceChange={priceChange} 
              assets={fullAssets} 
              assetType={assetType}
            />
          </div>
        ];

      case "Stocks & Indexes":
        const stockAsset = asset as Stock;
        return [
          ...baseContent,
          // Change %
          <div key="change" className="text-right">
            <div className="flex items-center justify-end gap-1">
              {priceChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`font-medium text-xs ${
                  priceChange.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>,
          // Volume
          <div key="volume" className="text-right">
            <span className="text-[var(--text-primary)] font-medium text-xs">
              {stockAsset.volume ? formatLargeNumber(stockAsset.volume) : 'N/A'}
            </span>
          </div>,
          // Mini Chart
          <div key="chart" className="flex justify-end">
            <MiniChart 
              symbol={symbol} 
              priceChange={priceChange} 
              assets={fullAssets} 
              assetType={assetType}
            />
          </div>
        ];

      case "Precious Metals":
        const metalAsset = asset as Metal;
        // Calculate price per oz and kg from base price per gram
        const pricePerGram = rawPrice;
        const pricePerOz = pricePerGram * 31.1035; // Convert from gram to oz
        const pricePerKg = pricePerGram * 1000; // Convert from gram to kg
        return [
          ...baseContent,
          // Price (oz)
          <div key="priceoz" className="text-right">
            <span className="text-[var(--text-primary)] font-medium text-xs">
              {formatPreciseValue(pricePerOz)}
            </span>
          </div>,
          // Price (kg)
          <div key="pricekg" className="text-right">
            <span className="text-[var(--text-primary)] font-medium text-xs">
              {formatPreciseValue(pricePerKg)}
            </span>
          </div>,
          // Change %
          <div key="change" className="text-right">
            <div className="flex items-center justify-end gap-1">
              {priceChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`font-medium text-xs ${
                  priceChange.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>,
          // Mini Chart
          <div key="chart" className="flex justify-end">
            <MiniChart 
              symbol={symbol} 
              priceChange={priceChange} 
              assets={fullAssets} 
              assetType={assetType}
            />
          </div>
        ];

      case "Cash":
        return [
          ...baseContent,
          // Change %
          <div key="change" className="text-right">
            <div className="flex items-center justify-end gap-1">
              {priceChange.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`font-medium text-xs ${
                  priceChange.isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {priceChange.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>,
          // Mini Chart
          <div key="chart" className="flex justify-end">
            <MiniChart 
              symbol={symbol} 
              priceChange={priceChange} 
              assets={fullAssets} 
              assetType={assetType}
            />
          </div>
        ];

      default:
        return baseContent;
    }
  };

  return (
    <div className="space-y-2 transition-all duration-300 ease-in-out">
      <div className="space-y-1">
        {/* Header */}
        <div className={`grid ${getGridCols()} gap-4 px-2 py-0 text-xs font-medium text-[var(--text-tertiary)]`}>
          {renderHeader()}
        </div>
        
        {/* Rows */}
        {assets.map((asset, index) => (
          <div
            key={`${assetType}-${config.getSymbol(asset)}`}
            className={`grid ${getGridCols()} gap-4 items-center px-2 py-2 text-xs transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)]/20 border-b border-[var(--bg-hover)]`}
          >
            {renderRowContent(asset, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

// Keep the old exports for backward compatibility, but they all use the unified component now
export const CryptoEnhancedView = UnifiedEnhancedView;
export const StocksEnhancedView = UnifiedEnhancedView;
export const MetalsEnhancedView = UnifiedEnhancedView;
export const CurrenciesEnhancedView = UnifiedEnhancedView;