// components/Portfolios/components/CategoryItem.tsx

'use client'

import { ChevronUp, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { CategoryIcon } from './CategoryIcon'
import { AssetList } from './AssetList'
import { AssetCategory, CategorySummary, PortfolioAsset } from '@/types'

interface CategoryItemProps {
  category: AssetCategory
  categoryData: CategorySummary
  isExpanded: boolean
  toggleCategory: () => void
  assets: PortfolioAsset[]
  hideBalances: boolean
  onBuy: (asset: PortfolioAsset) => void
  onSell: (asset: PortfolioAsset) => void
}

export function CategoryItem({
  category,
  categoryData,
  isExpanded,
  toggleCategory,
  assets,
  hideBalances,
  onBuy,
  onSell
}: CategoryItemProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  return (
    <div className="bg-[var(--bg-hover)]/50 rounded-xl px-2 sm:px-4 md:px-4 py-2 md:py-1">
      {/* Category Header - Make entire header clickable */}
      <div 
        className="grid grid-cols-[1fr_120px_120px_180px_40px] items-center pb-2 border-b border-gray-700 cursor-pointer gap-2"
        onClick={toggleCategory}
      >
        {/* Left side - Category info (takes remaining space) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CategoryIcon type={category} />
          <div>
            <h3 className="text-sm sm:text-base text-[var(--text-primary)] font-medium">{category}</h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {categoryData.asset_count} {categoryData.asset_count === 1 ? 'asset' : 'assets'}
            </p>
          </div>
        </div>

        {/* Total Value - Even further left */}
        {!hideBalances ? (
          <div className="flex flex-col items-end">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Value</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {formatPreciseValue(categoryData.total_value)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Value</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">******</p>
          </div>
        )}

        {/* Empty spacer column for separation */}
        <div></div>
        
        {/* Profit/Loss - Wider column to prevent wrapping */}
        {!hideBalances ? (
          <div className="flex flex-col items-end">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Profit/Loss</p>
            <div className="flex items-center justify-end gap-1 whitespace-nowrap">
              {categoryData.profit_loss >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${categoryData.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPreciseValue(Math.abs(categoryData.profit_loss))} ({categoryData.profit_loss_percentage.toFixed(2)}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Profit/Loss</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">******</p>
          </div>
        )}
        
        {/* Chevron - Fixed width */}
        <div className="flex items-center justify-center">
          {isExpanded ? 
            <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" /> : 
            <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
          }
        </div>
      </div>

      {/* Asset List */}
      {isExpanded && (
        <AssetList 
          assets={assets} 
          hideBalances={hideBalances}
          onBuy={onBuy}
          onSell={onSell}
        />
      )}
    </div>
  )
}