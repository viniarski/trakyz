// components/Portfolios/components/CategoryItem.tsx

'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { CategoryIcon } from './CategoryIcon'
import { AssetList } from './AssetList'
import { ExpandableCategory } from '@/components/ui/ExpandableCategory'
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

  const rightContent = (
    <div className="flex items-center gap-8">
      {/* Total Value */}
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
      
      {/* Profit/Loss */}
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
    </div>
  )

  return (
    <ExpandableCategory
      icon={<CategoryIcon type={category} />}
      title={category}
      subtitle={`${categoryData.asset_count} ${categoryData.asset_count === 1 ? 'asset' : 'assets'}`}
      isExpanded={isExpanded}
      onToggle={toggleCategory}
      rightContent={rightContent}
    >
      <AssetList 
        assets={assets} 
        hideBalances={hideBalances}
        onBuy={onBuy}
        onSell={onSell}
      />
    </ExpandableCategory>
  )
}