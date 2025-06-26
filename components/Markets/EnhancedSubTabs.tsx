// components/Markets/EnhancedSubTabs.tsx

"use client";

import { memo } from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
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
import { MiniChart } from "./MiniChart";

type Asset = Currency | CryptoType | Metal | Stock;

interface EnhancedSubTabProps {
  assets: Asset[];
  fullAssets: Asset[]; // Full assets array for historical data
  assetType: AssetCategory;
  config: {
    getSymbol: (asset: Asset) => string;
    getName: (asset: Asset) => string;
  };
  watchlist: WatchlistItem[];
  onToggleWatchlist: (category: AssetCategory, symbol: string) => void;
  selectedCurrency: CurrencyCode; // Add selectedCurrency prop
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
    return `${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  } else {
    return `${value.toFixed(2)}`;
  }
};

// Crypto Enhanced View
export const CryptoEnhancedView = memo(function CryptoEnhancedView({
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
}: EnhancedSubTabProps & { assets: CryptoType[]; fullAssets: Asset[] }) {
  const { convertValue, formatPreciseValue } = useCurrencyConverter();
  
  console.log("CryptoEnhancedView - Selected Currency:", selectedCurrency);

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
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
        {assets.map((asset, index) => {
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

              {/* Mini Chart */}
              <div className="flex justify-end">
                <MiniChart 
                  symbol={symbol} 
                  priceChange={priceChange} 
                  assets={fullAssets} 
                  assetType={assetType}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Stocks Enhanced View
export const StocksEnhancedView = memo(function StocksEnhancedView({
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
}: EnhancedSubTabProps & { assets: Stock[]; fullAssets: Asset[] }) {
  const { convertValue, formatPreciseValue } = useCurrencyConverter();
  
  console.log("StocksEnhancedView - Selected Currency:", selectedCurrency);

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
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
        {assets.map((asset, index) => {
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

              {/* Mini Chart */}
              <div className="flex justify-end">
                <MiniChart 
                  symbol={symbol} 
                  priceChange={priceChange} 
                  assets={fullAssets} 
                  assetType={assetType}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Metals Enhanced View
export const MetalsEnhancedView = memo(function MetalsEnhancedView({
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
}: EnhancedSubTabProps & { assets: Metal[]; fullAssets: Asset[] }) {
  const { convertValue, formatPreciseValue } = useCurrencyConverter();
  
  console.log("MetalsEnhancedView - Selected Currency:", selectedCurrency);

  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[auto,auto,2fr,1fr,1fr,1fr,1fr,1.2fr] gap-4 px-4 py-3 text-sm font-medium text-[var(--text-tertiary)] border-b border-gray-700/30">
          <div className="text-center"></div>
          <div className="text-center">#</div>
          <div>Name</div>
          <div className="text-right">Price (g)</div>
          <div className="text-right">Price (oz)</div>
          <div className="text-right">Price (kg)</div>
          <div className="text-right">Change</div>
          <div className="text-right">30 Days</div>
        </div>
        
        {/* Metal rows */}
        {assets.map((asset, index) => {
          const metalAsset = asset as Metal;
          const symbol = config.getSymbol(asset);
          const name = config.getName(asset);

          const isInWatchlist = watchlist.some(
            (item) => item.category === assetType && item.symbol.toLowerCase() === symbol.toLowerCase()
          );

          const priceChange = calculatePriceChange(symbol);
          
          // Convert prices for different units (assuming base price is per ounce)
          const pricePerOz = convertValue(asset.price, currencyRates, symbol);
          const pricePerGram = pricePerOz / 31.1035; // 1 troy ounce = 31.1035 grams
          const pricePerKg = pricePerOz * 32.15; // 1 kg = 32.15 troy ounces
          
          const displayPricePerGram = formatPreciseValue(pricePerGram);
          const displayPricePerOz = formatPreciseValue(pricePerOz);
          const displayPricePerKg = formatPreciseValue(pricePerKg);
          
          const hasRecentUpdate = updatedItems.has(symbol.toLowerCase());

          return (
            <div
              key={symbol}
              className="grid grid-cols-[auto,auto,2fr,1fr,1fr,1fr,1fr,1.2fr] gap-4 items-center px-4 py-3 text-sm transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)]/20 rounded-lg"
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
                <span className="text-[var(--text-primary)] font-medium text-base capitalize">
                  {symbol}
                </span>
              </div>

              {/* Price per Gram */}
              <div className="text-right">
                <span
                  className={`text-[var(--text-primary)] font-medium text-sm ${
                    hasRecentUpdate ? "bg-green-500/10 rounded px-2 py-1" : ""
                  }`}
                >
                  {displayPricePerGram}
                </span>
              </div>

              {/* Price per Ounce */}
              <div className="text-right">
                <span
                  className={`text-[var(--text-primary)] font-medium text-sm ${
                    hasRecentUpdate ? "bg-green-500/10 rounded px-2 py-1" : ""
                  }`}
                >
                  {displayPricePerOz}
                </span>
              </div>

              {/* Price per Kg */}
              <div className="text-right">
                <span
                  className={`text-[var(--text-primary)] font-medium text-sm ${
                    hasRecentUpdate ? "bg-green-500/10 rounded px-2 py-1" : ""
                  }`}
                >
                  {displayPricePerKg}
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

              {/* Mini Chart */}
              <div className="flex justify-end">
                <MiniChart 
                  symbol={symbol} 
                  priceChange={priceChange} 
                  assets={fullAssets} 
                  assetType={assetType}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// Currencies Enhanced View
export const CurrenciesEnhancedView = memo(function CurrenciesEnhancedView({
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
}: EnhancedSubTabProps & { assets: Currency[]; fullAssets: Asset[] }) {
  const { convertValue, formatPreciseValue } = useCurrencyConverter();
  
  console.log("CurrenciesEnhancedView - Selected Currency:", selectedCurrency);

  console.log("Rendering enhanced currencies view with", assets.length, "assets");
  
  return (
    <div className="space-y-4 transition-all duration-300 ease-in-out">
      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr] gap-4 px-4 py-3 text-sm font-medium text-[var(--text-tertiary)] border-b border-gray-700/30">
          <div className="text-center"></div>
          <div className="text-center">#</div>
          <div>Name</div>
          <div className="text-right">Price</div>
          <div className="text-right">Change</div>
          <div className="text-right">30 Days</div>
        </div>
        
        {/* Currency rows */}
        {assets.map((asset, index) => {
          const currencyAsset = asset as Currency;
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
              className="grid grid-cols-[auto,auto,2fr,1.2fr,1fr,1.2fr] gap-4 items-center px-4 py-3 text-sm transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)]/20 rounded-lg"
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

              {/* Mini Chart */}
              <div className="flex justify-end">
                <MiniChart 
                  symbol={symbol} 
                  priceChange={priceChange} 
                  assets={fullAssets} 
                  assetType={assetType}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});