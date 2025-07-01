// app/dashboard/components/portfolio/PortfolioDisplay.tsx

'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, Plus, Minus, Trash2 } from 'lucide-react'
import { AssetCategory, PortfolioSummary, PortfolioAsset, MarketData } from '@/types'
import { CategoryIcon } from '@/components/ui/CategoryIcon'

interface PortfolioDisplayProps {
  summary: PortfolioSummary
  expandedCategories: AssetCategory[]
  toggleCategory: (category: AssetCategory) => void
  onBuy: (asset: PortfolioAsset) => void
  onSell: (asset: PortfolioAsset) => void
  onDeletePortfolio: () => void
  marketData: MarketData
}

export function PortfolioDisplay({
  summary,
  expandedCategories,
  toggleCategory,
  onBuy,
  onSell,
  onDeletePortfolio,
  marketData
}: PortfolioDisplayProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatQuantity = (value: number): string => {
    return value.toFixed(8).replace(/\.?0+$/, '')
  }

  // Group assets by category
  const assetsByCategory = summary.assets?.reduce((acc: Record<AssetCategory, PortfolioAsset[]>, asset: PortfolioAsset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = []
    }
    acc[asset.category].push(asset)
    return acc
  }, {} as Record<AssetCategory, PortfolioAsset[]>) || {}

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    onDeletePortfolio()
    setShowDeleteConfirm(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="bg-[var(--bg-hover)] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Total Value</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {formatCurrency(summary.total_value)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Total Cost</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {formatCurrency(summary.total_cost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Profit/Loss</p>
            <p className={`text-lg font-semibold ${
              summary.total_profit_loss >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatCurrency(summary.total_profit_loss)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">P/L %</p>
            <div className="flex items-center gap-1">
              {summary.total_profit_loss_percentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <p className={`text-lg font-semibold ${
                summary.total_profit_loss_percentage >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPercentage(summary.total_profit_loss_percentage)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets by Category */}
      <div className="space-y-2">
        {Object.entries(assetsByCategory).map(([category, assets]) => {
          const isExpanded = expandedCategories.includes(category as AssetCategory)
          const categoryTotal = assets.reduce((sum: number, asset: PortfolioAsset) => sum + asset.total_value, 0)
          const categoryPnL = assets.reduce((sum: number, asset: PortfolioAsset) => sum + asset.profit_loss, 0)
          const categoryPnLPercent = categoryTotal > 0 ? (categoryPnL / (categoryTotal - categoryPnL)) * 100 : 0

          return (
            <div key={category} className="bg-[var(--bg-hover)] rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category as AssetCategory)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-tertiary)]/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon type={category as AssetCategory} size={5} />
                  <div className="text-left">
                    <p className="font-medium text-[var(--text-primary)]">{category}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {assets.length} asset{assets.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-[var(--text-primary)]">
                      {formatCurrency(categoryTotal)}
                    </p>
                    <p className={`text-xs ${
                      categoryPnL >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(categoryPnLPercent)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[var(--text-secondary)]" />
                  )}
                </div>
              </button>

              {/* Assets List */}
              {isExpanded && (
                <div className="border-t border-[var(--bg-tertiary)]">
                  {assets.map((asset) => (
                    <div key={`${asset.category}-${asset.asset_type}`} 
                         className="p-4 border-b border-[var(--bg-tertiary)] last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-[var(--text-primary)]">
                              {asset.asset_type}
                            </p>
                            <span className="text-xs text-[var(--text-secondary)]">
                              {formatQuantity(asset.quantity)} units
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="text-[var(--text-secondary)]">Avg Cost: </span>
                              <span className="text-[var(--text-primary)]">
                                ${asset.average_cost?.toFixed(6) || '0.00'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--text-secondary)]">Current: </span>
                              <span className="text-[var(--text-primary)]">
                                ${asset.current_price?.toFixed(6) || '0.00'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--text-secondary)]">Value: </span>
                              <span className="text-[var(--text-primary)]">
                                {formatCurrency(asset.total_value)}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--text-secondary)]">P/L: </span>
                              <span className={asset.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {formatCurrency(asset.profit_loss)} ({formatPercentage(asset.profit_loss_percentage)})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => onBuy(asset)}
                            className="p-1.5 bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors"
                            title="Buy more"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => onSell(asset)}
                            className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                            title="Sell"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Portfolio Actions */}
      <div className="flex justify-end pt-4 border-t border-[var(--bg-hover)]">
        <button
          onClick={handleDeleteClick}
          className="flex items-center gap-2 px-3 py-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Portfolio
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Delete Portfolio
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete this portfolio? This action cannot be undone and will remove all associated transactions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}