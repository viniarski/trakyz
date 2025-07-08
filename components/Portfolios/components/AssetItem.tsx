// components/Portfolios/components/AssetItem.tsx
'use client'

import { Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import { PortfolioAsset } from '@/types'

interface AssetItemProps {
  asset: PortfolioAsset
  hideBalances: boolean
  onBuy: () => void
  onSell: () => void
}

export function AssetItem({
  asset,
  hideBalances,
  onBuy,
  onSell
}: AssetItemProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg p-2 sm:p-3 md:bg-transparent md:rounded-none md:p-0 md:hover:bg-[var(--bg-hover)] md:border-b md:border-gray-700">
      {/* Small Screen Card Layout */}
      <div className="md:hidden grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-[var(--text-primary)] font-medium">{asset.asset_type}</p>
          <p className="text-xs text-[var(--text-secondary)]">
            Qty: {hideBalances ? '******' : asset.quantity.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-primary)]">
            {hideBalances ? '******' : formatPreciseValue(asset.total_value || 0)}
          </p>
          {!hideBalances && (
            <div className="flex items-center justify-end gap-1">
              {(asset.profit_loss || 0) >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${(asset.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPreciseValue(Math.abs(asset.profit_loss || 0))} ({asset.profit_loss_percentage?.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
        <div className="col-span-2 flex justify-between text-xs text-[var(--text-secondary)]">
          <p>Price: {hideBalances ? '******' : formatPreciseValue(asset.current_price || 0)}</p>
          <p>Avg: {hideBalances ? '******' : formatPreciseValue(asset.average_cost || 0)}</p>
        </div>
        <div className="col-span-2 flex gap-2 justify-end">
          <button
            onClick={onBuy}
            className="p-1 text-green-500 hover:bg-green-500/20 rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onSell}
            className="p-1 text-red-500 hover:bg-red-500/20 rounded"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Medium+ Screen Table Layout */}
      <div className="hidden md:grid md:grid-cols-[2fr,1fr,1fr,1fr,1fr,1.5fr,0.5fr] gap-4 items-center px-2 py-3">
        <div className="text-[var(--text-primary)]">{asset.asset_type}</div>
        <div className="text-[var(--text-primary)] text-right">
          {hideBalances ? '******' : asset.quantity.toLocaleString()}
        </div>
        <div className="text-[var(--text-primary)] text-right">
          {hideBalances ? '******' : formatPreciseValue(asset.current_price || 0)}
        </div>
        <div className="text-[var(--text-primary)] text-right">
          {hideBalances ? '******' : formatPreciseValue(asset.average_cost || 0)}
        </div>
        <div className="text-[var(--text-primary)] text-right">
          {hideBalances ? '******' : formatPreciseValue(asset.total_value || 0)}
        </div>
        <div className="flex flex-col items-end">
          {!hideBalances && (
            <>
              <div className="flex items-center gap-1">
                {(asset.profit_loss || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={(asset.profit_loss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {asset.profit_loss_percentage?.toFixed(2)}%
                </span>
              </div>
              <span className={`${(asset.profit_loss || 0) >= 0 ? 'text-green-500/80' : 'text-red-500/80'} text-xs`}>
                {formatPreciseValue(Math.abs(asset.profit_loss || 0))}
              </span>
            </>
          )}
          {hideBalances && (
            <span className="text-[var(--text-primary)]">******</span>
          )}
        </div>
        <div className="flex gap-1 justify-end">
          <button
            onClick={onBuy}
            className="p-1 text-green-500 hover:bg-green-500/20 rounded"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onSell}
            className="p-1 text-red-500 hover:bg-red-500/20 rounded"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}