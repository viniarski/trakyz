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
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-gray-700 gap-2 sm:gap-0 cursor-pointer"
        onClick={toggleCategory}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 sm:gap-3">
            <CategoryIcon type={category} />
            <div>
              <h3 className="text-sm sm:text-base text-[var(--text-primary)] font-medium">{category}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                {categoryData.asset_count} {categoryData.asset_count === 1 ? 'asset' : 'assets'}
              </p>
            </div>
          </div>
          <div className="flex items-center sm:hidden">
            {isExpanded ? 
              <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" /> : 
              <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
            }
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 sm:gap-10">
          {!hideBalances && (
            <>
              <div className="flex flex-col items-start sm:items-end">
                <p className="text-xs sm:text-sm sm:text-[var(--text-secondary)] md:text-[var(--text-secondary)]">Total Value</p>
                <p className="text-xs sm:text-lg text-[var(--text-primary)] sm:font-medium md:text-[var(--text-primary)]">
                  {formatPreciseValue(categoryData.total_value)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-xs sm:text-sm sm:text-[var(--text-secondary)] md:text-[var(--text-secondary)]">Profit/Loss</p>
                <div className="flex items-center gap-1">
                  {categoryData.profit_loss >= 0 ? (
                    <TrendingUp className="h-3 sm:h-4 w-3 sm:w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 sm:h-4 w-3 sm:w-4 text-red-500" />
                  )}
                  <span className={`text-xs sm:text-sm ${categoryData.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPreciseValue(Math.abs(categoryData.profit_loss))} ({categoryData.profit_loss_percentage.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </>
          )}
          <div className="hidden sm:flex items-center">
            {isExpanded ? 
              <ChevronUp className="h-4 w-4 text-[var(--text-secondary)]" /> : 
              <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
            }
          </div>
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