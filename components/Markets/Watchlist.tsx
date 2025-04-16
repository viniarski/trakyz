'use client'

import { useState, useMemo } from 'react'
import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import { CategoryIcon } from '@/components/ui/category-icon'
import { formatCurrency, convertCurrency } from '@/lib/utils'
import type { 
  Metal, 
  Stock, 
  Currency, 
  CurrencyCode, 
  AssetCategory,
  Crypto
} from '@/types'
import { AssetContextMenu } from '../ui/context-menu'

interface WatchlistProps {
  watchlist: {
    id: string;
    category: AssetCategory;
    symbol: string;
    order: number;
  }[];
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
    crypto: new Set(),
    stocks: new Set(),
    metals: new Set(),
    currencies: new Set()
  }
}: WatchlistProps) {
  const [isHovering, setIsHovering] = useState<string | null>(null)

  // Group watchlist items by category
  const categorizedWatchlist = useMemo(() => {
    const grouped: Record<string, Array<typeof watchlist[number]>> = {};
    
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
          historicalData: marketData.crypto?.filter(c => 
            c.symbol === symbol && new Date(c.date) <= new Date()
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || null
        }
      case 'Precious Metals':
        return {
          currentData: marketData.metals?.find(m => m.metal.toLowerCase() === symbol.toLowerCase()) || null,
          historicalData: marketData.metals?.filter(m => 
            m.metal.toLowerCase() === symbol.toLowerCase() && new Date(m.date) <= new Date()
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || null
        }
      case 'Stocks & Indexes':
        return {
          currentData: marketData.stocks?.find(s => s.symbol === symbol) || null,
          historicalData: marketData.stocks?.filter(s => 
            s.symbol === symbol && new Date(s.date) <= new Date()
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || null
        }
      case 'Cash':
        return {
          currentData: marketData.currencies?.find(c => c.symbol === symbol) || null,
          historicalData: marketData.currencies?.filter(c => 
            c.symbol === symbol && new Date(c.date) <= new Date()
          ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || null
        }
      default:
        return {
          currentData: null,
          historicalData: null
        }
    }
  }

  const getAssetName = (category: AssetCategory, data: Metal | Stock | Currency | Crypto | null): string => {
    if (!data) return ''
    
    switch (category) {
      case 'Crypto':
        return (data as Crypto).name || ''
      case 'Stocks & Indexes':
        return (data as Stock).name || ''
      case 'Cash':
        return (data as Currency).name || ''
      case 'Precious Metals':
        return (data as Metal).metal || ''
      default:
        return ''
    }
  }

  const calculatePriceChange = (category: AssetCategory, symbol: string) => {
    const { currentData, historicalData } = getAssetData(category, symbol)
    if (!currentData || !historicalData || historicalData.length === 0) {
      return { changePercent: 0, isPositive: true }
    }

    const currentPrice = 'price' in currentData ? currentData.price : 0

    if (selectedPeriod === '24H') {
      const oneDayAgo = new Date()
      oneDayAgo.setHours(oneDayAgo.getHours() - 24)
      
      const oldPriceData = historicalData.find(d => new Date(d.date) <= oneDayAgo)
      const oldPrice = oldPriceData && 'price' in oldPriceData ? oldPriceData.price : currentPrice
      const changePercent = ((currentPrice - oldPrice) / oldPrice) * 100

      return {
        changePercent,
        isPositive: changePercent >= 0
      }
    } else {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const oldPriceData = historicalData.find(d => new Date(d.date) <= sevenDaysAgo)
      const oldPrice = oldPriceData && 'price' in oldPriceData ? oldPriceData.price : currentPrice
      const changePercent = ((currentPrice - oldPrice) / oldPrice) * 100

      return {
        changePercent,
        isPositive: changePercent >= 0
      }
    }
  }

  // Check if an item has been recently updated
  const hasRecentUpdate = (category: AssetCategory, symbol: string): boolean => {
    const categoryKey = category.toLowerCase().replace(/\s+&\s+/g, '').replace(/\s+/g, '') as keyof typeof updatedItems;
    if (category === 'Precious Metals') {
      return updatedItems.metals?.has(symbol) || false;
    }
    
    return updatedItems[categoryKey]?.has(symbol) || false;
  };

  if (Object.keys(categorizedWatchlist).length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No assets in watchlist yet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Render each category group */}
      {Object.entries(categorizedWatchlist).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-base font-medium text-[var(--text-primary)]">{category}</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const { currentData } = getAssetData(item.category as AssetCategory, item.symbol);
              const priceChange = calculatePriceChange(item.category as AssetCategory, item.symbol);
              
              if (!currentData) return null;

              const rawPrice = convertCurrency(
                'price' in currentData ? currentData.price : 0,
                'USD',
                selectedCurrency,
                currencyRates
              );

              // Format the price directly instead of using the hook
              const displayPrice = formatCurrency(rawPrice, selectedCurrency);

              const assetName = getAssetName(item.category as AssetCategory, currentData);
              const isUpdated = hasRecentUpdate(item.category as AssetCategory, item.symbol);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[var(--bg-hover)]/50 p-3 rounded-lg transition-all duration-300 ease-in-out"
                  onMouseEnter={() => setIsHovering(item.id)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon type={item.category} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--text-primary)]">
                          {item.symbol}
                        </span>
                        {isHovering === item.id && (
                          <button
                            onClick={() => onToggleWatchlist(item.category, item.symbol)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                        )}
                      </div>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {assetName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`text-[var(--text-primary)] font-medium transition-all duration-300 ease-in-out ${
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