// app/dashboard/components/portfolio/category-list.tsx

import { CategoryItem } from './category-item'
import { AssetCategory, CurrencyCode, PortfolioAsset } from '@/types'
import { CategorySummary } from '@/types/index'

interface CategoryListProps {
  categories: Record<AssetCategory, CategorySummary>
  portfolioAssets: PortfolioAsset[]
  expandedCategories: AssetCategory[]
  selectedCurrency: CurrencyCode
  hideBalances: boolean
  onBuy: (asset: PortfolioAsset) => void
  onSell: (asset: PortfolioAsset) => void
  toggleCategory: (category: AssetCategory) => void
}

export function CategoryList({
  categories,
  portfolioAssets,
  expandedCategories,
  selectedCurrency,
  hideBalances,
  onBuy,
  onSell,
  toggleCategory
}: CategoryListProps) {
  return (
    <div className="space-y-2 sm:space-y-4 md:space-y-4">
      {Object.entries(categories)
        .filter(([, data]) => data.asset_count > 0)
        .map(([category, data]) => (
          <CategoryItem
            key={category}
            category={category as AssetCategory}
            categoryData={data}
            isExpanded={expandedCategories.includes(category as AssetCategory)}
            toggleCategory={() => toggleCategory(category as AssetCategory)}
            assets={portfolioAssets.filter(asset => asset.category === category)}
            selectedCurrency={selectedCurrency}
            hideBalances={hideBalances}
            onBuy={onBuy}
            onSell={onSell}
          />
        ))}
    </div>
  )
}