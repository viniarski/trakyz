// components/Markets/Watchlist.tsx

'use client'

import { useState, useMemo } from 'react'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { 
  Metal, 
  Stock, 
  Currency, 
  CurrencyCode, 
  AssetCategory,
  Crypto,
  LegacyWatchlistItem  // FIXED: Changed from WatchlistItem to LegacyWatchlistItem
} from '@/types'
import { AssetContextMenu } from '@/components/ui/ContextMenu'

interface WatchlistProps {
  watchlist: LegacyWatchlistItem[];  // FIXED: Changed from WatchlistItem[] to LegacyWatchlistItem[]
  onToggleWatchlist: (category: AssetCategory, symbol: string) => void;
  marketData: {
    metals: Metal[] | null;
    crypto: Crypto[] | null;
    stocks: Stock[] | null;
    currencies: Currency[] | null;
  };
  selectedCurrency: CurrencyCode;
  currencyRates: {
    currencies: Currency[] | null;
    crypto: Crypto[] | null;
    metals?: Metal[] | null;
  };
  selectedPeriod: '24H' | '7D';
  updatedItems?: Record<string, Set<string>>;
}

interface AssetData {
  currentData: Metal | Stock | Currency | Crypto | null;
  historicalData: (Metal | Stock | Currency | Crypto)[] | null;
}

export function Watchlist({
  watchlist,
  onToggleWatchlist,
  marketData,
  selectedCurrency,
  currencyRates,
  selectedPeriod,
  updatedItems = {
    crypto: new Set<string>(),
    stocks: new Set<string>(),
    metals: new Set<string>(),
    currencies: new Set<string>()
  }
}: WatchlistProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null);
  
  // Use our currency converter
  const { convertValue, formatPreciseValue } = useCurrencyConverter();

  // Group watchlist items by category
  const categorizedWatchlist = useMemo(() => {
    const grouped: Record<string, Array<LegacyWatchlistItem>> = {};  // FIXED: Updated type
    
    // Group items by category
    watchlist.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    
    return grouped;
  }, [watchlist]);

  const getAssetData = (category: AssetCategory, symbol: string): AssetData => {
    switch (category) {
      case 'Crypto':
        return {
          currentData: marketData.crypto?.find(c => c.symbol === symbol) || null,
          historicalData: currencyRates.crypto
        };
      case 'Stocks & Indexes':
        return {
          currentData: marketData.stocks?.find(s => s.symbol === symbol) || null,
          historicalData: marketData.stocks
        };
      case 'Precious Metals':
        return {
          currentData: marketData.metals?.find(m => 
            m.metal.toLowerCase() === symbol.toLowerCase()
          ) || null,
          historicalData: currencyRates.metals || marketData.metals
        };
      case 'Cash':
        return {
          currentData: marketData.currencies?.find(c => c.symbol === symbol) || null,
          historicalData: currencyRates.currencies
        };
      default:
        return { currentData: null, historicalData: null };
    }
  };

  const calculatePriceChange = (current: number, historical: (Metal | Stock | Currency | Crypto)[] | null, symbol: string, category: AssetCategory) => {
    if (!historical || historical.length === 0) {
      return { changePercent: 0, isPositive: true };
    }

    // Find historical data based on category
    let historicalPrice = 0;
    
    switch (category) {
      case 'Crypto':
      case 'Stocks & Indexes':
      case 'Cash':
        const asset = historical.find((item: any) => item.symbol === symbol);
        historicalPrice = asset?.price || current;
        break;
      case 'Precious Metals':
        const metal = historical.find((item: any) => 
          item.metal?.toLowerCase() === symbol.toLowerCase()
        );
        historicalPrice = metal?.price || current;
        break;
    }

    const changePercent = historicalPrice > 0 
      ? ((current - historicalPrice) / historicalPrice) * 100 
      : 0;
    
    return {
      changePercent,
      isPositive: changePercent >= 0
    };
  };

  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No assets in watchlist yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(categorizedWatchlist).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <CategoryIcon type={category as AssetCategory} size={16} /> {/* FIXED: Changed category to type */}
            <span>{category}</span>
            <span className="text-xs opacity-60">({items.length})</span>
          </div>
          
          <div className="space-y-2">
            {items.map((item) => {
              const { currentData } = getAssetData(item.category, item.symbol);
              
              if (!currentData) {
                return (
                  <div 
                    key={item.id} 
                    className="bg-[var(--bg-primary)] border border-red-500/20 rounded-lg p-3"
                  >
                    <div className="text-red-400 text-sm">
                      Asset not found: {item.symbol}
                    </div>
                  </div>
                );
              }

              const currentPrice = currentData.price;
              const convertedPrice = convertValue(currentPrice, currencyRates);  // FIXED: Pass rates object
              const displayPrice = formatPreciseValue(convertedPrice);  // FIXED: Remove selectedCurrency param
              
              // Calculate price change
              const priceChange = calculatePriceChange(
                currentPrice, 
                getAssetData(item.category, item.symbol).historicalData,
                item.symbol,
                item.category
              );

              const isUpdated = updatedItems[item.category.toLowerCase().replace(/\s+/g, '')]?.has(item.symbol);

              return (
                <div 
                  key={item.id}
                  className={`bg-[var(--bg-primary)] border border-gray-800/50 rounded-lg p-3 hover:border-gray-700/70 transition-all ${
                    isUpdated ? 'ring-1 ring-blue-500/30' : ''
                  }`}
                  onMouseEnter={() => setIsHovering(item.id)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon type={item.category} size={20} /> {/* FIXED: Changed category to type */}
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {item.symbol}
                        </div>
                        {/* Show name if available */}
                        {'name' in currentData && currentData.name && (
                          <div className="text-xs text-[var(--text-secondary)] mt-1">
                            {currentData.name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <span className={`font-medium ${
                      isUpdated ? 'bg-green-500/10 rounded px-1' : ''
                    }`}>
                      {displayPrice}
                    </span>
                    <div className="flex items-center gap-1 min-w-[80px] justify-end">
                      {priceChange.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={
                        priceChange.isPositive ? 'text-green-500' : 'text-red-500'
                      }>
                        {Math.abs(priceChange.changePercent).toFixed(2)}%
                      </span>
                    </div>
                    <AssetContextMenu 
                      isInWatchlist={true}
                      onToggleWatchlist={() => onToggleWatchlist(item.category, item.symbol)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )
}