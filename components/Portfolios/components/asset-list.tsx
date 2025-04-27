// app/dashboard/components/portfolio/asset-list.tsx

import { AssetItem } from './asset-item'
import { CurrencyCode, PortfolioAsset } from '@/types'

interface AssetListProps {
  assets: PortfolioAsset[]
  selectedCurrency: CurrencyCode
  hideBalances: boolean
  onBuy: (asset: PortfolioAsset) => void
  onSell: (asset: PortfolioAsset) => void
}

export function AssetList({
  assets,
  selectedCurrency,
  hideBalances,
  onBuy,
  onSell
}: AssetListProps) {
  return (
    <div className="mt-2 space-y-2 md:mt-0">
      {/* Column Headers (Big Screens Only) */}
      <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1.5fr,0.5fr] gap-4 px-2 py-3 border-b border-gray-700">
        <div className="text-[var(--text-secondary)] text-sm">Asset</div>
        <div className="text-[var(--text-secondary)] text-sm text-right">Quantity</div>
        <div className="text-[var(--text-secondary)] text-sm text-right">Current Price</div>
        <div className="text-[var(--text-secondary)] text-sm text-right">Avg. Purchase</div>
        <div className="text-[var(--text-secondary)] text-sm text-right">Value</div>
        <div className="text-[var(--text-secondary)] text-sm text-right">Profit/Loss</div>
        <div className="text-[var(--text-secondary)] text-sm text-right">Actions</div>
      </div>

      {/* Asset Rows */}
      <div className="space-y-2">
        {assets.map(asset => (
          <AssetItem
            key={`${asset.category}-${asset.asset_type}`}
            asset={asset}
            selectedCurrency={selectedCurrency}
            hideBalances={hideBalances}
            onBuy={() => onBuy(asset)}
            onSell={() => onSell(asset)}
          />
        ))}
      </div>
    </div>
  )
}