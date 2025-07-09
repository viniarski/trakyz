// components/Analytics/components/AnalyticsAssets.tsx

'use client'

import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Search, Filter, ArrowUpDown } from 'lucide-react'
import type { Transaction } from '@/types'

interface AnalyticsAssetsProps {
  transactions: Transaction[]
  currentPrices: Record<string, number>
  selectedCurrency: string
}

export function AnalyticsAssets({
  transactions,
  currentPrices,
  selectedCurrency
}: AnalyticsAssetsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'value' | 'percentage' | 'quantity' | 'asset'>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Calculate asset performance
  const assetPerformance = useMemo(() => {
    const performance: Record<string, any> = {}
    
    transactions.forEach(transaction => {
      if (!performance[transaction.asset_type]) {
        performance[transaction.asset_type] = {
          asset: transaction.asset_type,
          category: transaction.category,
          quantity: 0,
          totalCost: 0,
          currentValue: 0,
          firstPurchaseDate: transaction.date,
          lastTransactionDate: transaction.date,
          transactions: []
        }
      }
      
      const cost = transaction.quantity * transaction.price
      if (transaction.transaction_type === 'BUY') {
        performance[transaction.asset_type].quantity += transaction.quantity
        performance[transaction.asset_type].totalCost += cost
      } else {
        performance[transaction.asset_type].quantity -= transaction.quantity
        performance[transaction.asset_type].totalCost -= cost
      }
      
      // Update dates
      if (new Date(transaction.date) < new Date(performance[transaction.asset_type].firstPurchaseDate)) {
        performance[transaction.asset_type].firstPurchaseDate = transaction.date
      }
      if (new Date(transaction.date) > new Date(performance[transaction.asset_type].lastTransactionDate)) {
        performance[transaction.asset_type].lastTransactionDate = transaction.date
      }
      
      performance[transaction.asset_type].transactions.push(transaction)
      
      const currentPrice = currentPrices[transaction.asset_type] || transaction.price
      performance[transaction.asset_type].currentValue = 
        performance[transaction.asset_type].quantity * currentPrice
      performance[transaction.asset_type].currentPrice = currentPrice
    })

    return Object.values(performance)
      .filter((p: any) => p.quantity > 0)
      .map((p: any) => ({
        ...p,
        profitLoss: p.currentValue - p.totalCost,
        profitPercentage: p.totalCost > 0 ? ((p.currentValue - p.totalCost) / p.totalCost) * 100 : 0,
        averageCost: p.totalCost / p.quantity,
        daysSinceFirstPurchase: Math.floor((new Date().getTime() - new Date(p.firstPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
      }))
  }, [transactions, currentPrices])

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assetPerformance

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset => 
        asset.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === filterCategory)
    }

    // Sort assets
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'value':
          aValue = a.currentValue
          bValue = b.currentValue
          break
        case 'percentage':
          aValue = a.profitPercentage
          bValue = b.profitPercentage
          break
        case 'quantity':
          aValue = a.quantity
          bValue = b.quantity
          break
        case 'asset':
          aValue = a.asset
          bValue = b.asset
          break
        default:
          aValue = a.currentValue
          bValue = b.currentValue
      }

      if (sortBy === 'asset') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [assetPerformance, searchTerm, filterCategory, sortBy, sortOrder])

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(assetPerformance.map(asset => asset.category)))
    return uniqueCategories.sort()
  }, [assetPerformance])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency === 'BTC' ? 'USD' : selectedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column as any)
      setSortOrder('desc')
    }
  }

  const SortButton = ({ column, children }: {
    column: string
    children: React.ReactNode
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 hover:text-[var(--accent-primary)] transition-colors"
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortBy === column ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`} />
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)] appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-[var(--text-secondary)]">
          {filteredAndSortedAssets.length} of {assetPerformance.length} assets
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-hover)]">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">
                  <SortButton column="asset">Asset</SortButton>
                </th>
                <th className="text-left py-4 px-6 font-medium text-[var(--text-secondary)]">Category</th>
                <th className="text-right py-4 px-6 font-medium text-[var(--text-secondary)]">
                  <SortButton column="quantity">Quantity</SortButton>
                </th>
                <th className="text-right py-4 px-6 font-medium text-[var(--text-secondary)]">Avg Cost</th>
                <th className="text-right py-4 px-6 font-medium text-[var(--text-secondary)]">Current Price</th>
                <th className="text-right py-4 px-6 font-medium text-[var(--text-secondary)]">
                  <SortButton column="value">Current Value</SortButton>
                </th>
                <th className="text-right py-4 px-6 font-medium text-[var(--text-secondary)]">
                  <SortButton column="percentage">P&L</SortButton>
                </th>
                <th className="text-right py-4 px-6 font-medium text-[var(--text-secondary)]">First Purchase</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAssets.map((asset, index) => (
                <tr key={asset.asset} className={`border-t border-[var(--border-primary)] ${index % 2 === 0 ? 'bg-[var(--bg-secondary)]' : 'bg-[var(--bg-hover)]/30'}`}>
                  <td className="py-4 px-6">
                    <div className="font-medium text-[var(--text-primary)]">{asset.asset}</div>
                    <div className="text-sm text-[var(--text-secondary)]">{asset.transactions.length} transactions</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[var(--text-primary)]">
                    {asset.quantity.toFixed(6)}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(asset.averageCost)}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(asset.currentPrice)}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(asset.currentValue)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {asset.profitLoss >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <div className="text-right">
                        <div className={`font-mono ${asset.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercentage(asset.profitPercentage)}
                        </div>
                        <div className={`text-sm font-mono ${asset.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(Math.abs(asset.profitLoss))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-[var(--text-secondary)]">
                    <div className="text-sm">{formatDate(asset.firstPurchaseDate)}</div>
                    <div className="text-xs">{asset.daysSinceFirstPurchase} days ago</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
          <div className="text-sm text-[var(--text-secondary)]">Total Assets</div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{assetPerformance.length}</div>
          <div className="text-xs text-[var(--text-secondary)]">Across {categories.length} categories</div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
          <div className="text-sm text-[var(--text-secondary)]">Profitable Assets</div>
          <div className="text-2xl font-bold text-green-500">
            {assetPerformance.filter(a => a.profitPercentage > 0).length}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {((assetPerformance.filter(a => a.profitPercentage > 0).length / assetPerformance.length) * 100).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
          <div className="text-sm text-[var(--text-secondary)]">Best Performer</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {assetPerformance.length > 0 ? assetPerformance.reduce((best, current) => 
              current.profitPercentage > best.profitPercentage ? current : best
            ).asset : 'N/A'}
          </div>
          <div className="text-xs text-green-500">
            {assetPerformance.length > 0 ? formatPercentage(assetPerformance.reduce((best, current) => 
              current.profitPercentage > best.profitPercentage ? current : best
            ).profitPercentage) : 'N/A'}
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
          <div className="text-sm text-[var(--text-secondary)]">Worst Performer</div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {assetPerformance.length > 0 ? assetPerformance.reduce((worst, current) => 
              current.profitPercentage < worst.profitPercentage ? current : worst
            ).asset : 'N/A'}
          </div>
          <div className="text-xs text-red-500">
            {assetPerformance.length > 0 ? formatPercentage(assetPerformance.reduce((worst, current) => 
              current.profitPercentage < worst.profitPercentage ? current : worst
            ).profitPercentage) : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}