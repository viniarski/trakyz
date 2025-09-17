// components/Analytics/components/AnalyticsOverview.tsx

'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react'
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter'
import type { Transaction, Crypto, Stock, Metal, Currency } from '@/types'

interface AnalyticsOverviewProps {
  transactions: Transaction[]
  currentPrices: Record<string, number>
  selectedCurrency: string
  selectedPeriod: '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'
  historicalData: {
    crypto: Crypto[]
    stocks: Stock[]
    metals: Metal[]
    currencies: Currency[]
  } | null
}

export function AnalyticsOverview({
  transactions,
  currentPrices,
  selectedCurrency,
  selectedPeriod,
  historicalData
}: AnalyticsOverviewProps) {
  const { formatPreciseValue } = useCurrencyConverter()

  // Calculate portfolio allocation and insights
  const { allocationData, assetPerformance, diversificationMetrics } = useMemo(() => {
    // Calculate portfolio allocation
    const assetHoldings = new Map<string, { quantity: number; totalCost: number; category: string }>()
    
    transactions.forEach(transaction => {
      const key = `${transaction.category}-${transaction.asset_type}`
      const existing = assetHoldings.get(key) || { 
        quantity: 0, 
        totalCost: 0, 
        category: transaction.category 
      }
      
      if (transaction.transaction_type === 'BUY') {
        existing.quantity += transaction.quantity
        existing.totalCost += transaction.quantity * transaction.price
      } else if (transaction.transaction_type === 'SELL') {
        existing.quantity -= transaction.quantity
        existing.totalCost -= transaction.quantity * transaction.price
      }
      
      assetHoldings.set(key, existing)
    })

    // Calculate category allocations
    const categoryData = new Map<string, { value: number; cost: number; count: number }>()
    
    assetHoldings.forEach((holding, key) => {
      if (holding.quantity > 0) {
        const [category, asset] = key.split('-', 2)
        const currentPrice = currentPrices[asset] || 0
        const currentValue = holding.quantity * currentPrice
        
        const existing = categoryData.get(category) || { value: 0, cost: 0, count: 0 }
        existing.value += currentValue
        existing.cost += holding.totalCost
        existing.count += 1
        
        categoryData.set(category, existing)
      }
    })

    const totalValue = Array.from(categoryData.values()).reduce((sum, cat) => sum + cat.value, 0)
    
    // Create allocation data
    const allocations = Array.from(categoryData.entries()).map(([category, data]) => ({
      category,
      value: data.value,
      cost: data.cost,
      count: data.count,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      profitLoss: data.value - data.cost,
      profitPercentage: data.cost > 0 ? ((data.value - data.cost) / data.cost) * 100 : 0
    })).sort((a, b) => b.value - a.value)

    // Calculate asset performance
    const performance: Array<{
      asset: string
      category: string
      currentValue: number
      profitPercentage: number
    }> = []

    assetHoldings.forEach((holding, key) => {
      if (holding.quantity > 0) {
        const [category, asset] = key.split('-', 2)
        const currentPrice = currentPrices[asset] || 0
        const currentValue = holding.quantity * currentPrice
        const profitPercentage = holding.totalCost > 0 ? ((currentValue - holding.totalCost) / holding.totalCost) * 100 : 0
        
        performance.push({
          asset,
          category,
          currentValue,
          profitPercentage
        })
      }
    })

    performance.sort((a, b) => b.currentValue - a.currentValue)

    // Calculate diversification metrics
    const diversification = {
      categories: categoryData.size,
      totalAssets: Array.from(assetHoldings.values()).filter(h => h.quantity > 0).length,
      largestAllocation: allocations.length > 0 ? allocations[0].percentage : 0,
      concentration: allocations.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0),
      diversificationScore: Math.min(100, (categoryData.size / 8) * 50 + (1 - (allocations[0]?.percentage || 0) / 100) * 50)
    }

    return {
      allocationData: allocations,
      assetPerformance: performance,
      diversificationMetrics: diversification
    }
  }, [transactions, currentPrices])

  // Helper functions
  const formatCurrency = (value: number) => formatPreciseValue(value)
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  // Colors for pie chart
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#EC4899']

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--bg-hover)] shadow-lg">
          <p className="text-[var(--text-primary)] font-medium">{data.category}</p>
          <p className="text-[var(--accent-primary)]">{formatCurrency(data.value)}</p>
          <p className="text-[var(--text-secondary)] text-sm">{data.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  if (allocationData.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <div className="text-center py-8">
          <PieChart className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No Portfolio Data</h3>
          <p className="text-[var(--text-secondary)]">
            Add some transactions to see your portfolio overview and allocation insights.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Portfolio Allocation</h3>
          
          {/* Pie Chart */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Allocation Legend */}
          <div className="space-y-2">
            {allocationData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-[var(--text-primary)] text-sm">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-[var(--text-primary)] font-medium text-sm">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-[var(--text-secondary)] text-xs">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assets */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Top Assets</h3>
          <div className="space-y-3">
            {assetPerformance.slice(0, 5).map((asset, index) => (
              <div key={asset.asset} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)]/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--accent-primary-10)] rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-[var(--accent-primary)]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-[var(--text-primary)]">{asset.asset}</span>
                    <div className="text-sm text-[var(--text-secondary)]">{asset.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(asset.currentValue)}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {asset.profitPercentage >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm ${asset.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(asset.profitPercentage)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allocation Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diversification Analysis */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Diversification</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)]">Score</span>
              <span className="text-xl font-bold text-[var(--accent-primary)]">
                {diversificationMetrics.diversificationScore.toFixed(0)}/100
              </span>
            </div>
            <div className="w-full bg-[var(--bg-hover)] rounded-full h-2">
              <div 
                className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${diversificationMetrics.diversificationScore}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-[var(--bg-hover)]/50 rounded-lg">
                <div className="text-lg font-semibold text-[var(--accent-primary)]">
                  {diversificationMetrics.categories}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Categories</div>
              </div>
              <div className="text-center p-3 bg-[var(--bg-hover)]/50 rounded-lg">
                <div className="text-lg font-semibold text-[var(--accent-primary)]">
                  {diversificationMetrics.totalAssets}
                </div>
                <div className="text-sm text-[var(--text-secondary)]">Assets</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
            <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
            Risk Analysis
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] text-sm">Largest Position</span>
              <span className={`font-medium ${diversificationMetrics.largestAllocation > 50 ? 'text-orange-500' : 'text-[var(--text-primary)]'}`}>
                {diversificationMetrics.largestAllocation.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)] text-sm">Top 3 Concentration</span>
              <span className={`font-medium ${diversificationMetrics.concentration > 75 ? 'text-orange-500' : 'text-[var(--text-primary)]'}`}>
                {diversificationMetrics.concentration.toFixed(1)}%
              </span>
            </div>
            <div className="mt-4 p-3 bg-[var(--bg-hover)]/30 rounded-lg">
              <p className="text-xs text-[var(--text-secondary)]">
                {diversificationMetrics.largestAllocation > 50 
                  ? '⚠️ High concentration risk detected'
                  : diversificationMetrics.categories < 3
                  ? '⚠️ Low diversification - consider more categories'
                  : '✓ Healthy diversification levels'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Allocation Insights */}
        <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
            <Target className="h-5 w-5 mr-2 text-[var(--accent-primary)]" />
            Quick Insights
          </h3>
          <div className="space-y-3 text-sm">
            {diversificationMetrics.categories >= 4 ? (
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-[var(--text-primary)]">Well-diversified across {diversificationMetrics.categories} categories</span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">!</span>
                <span className="text-[var(--text-primary)]">Consider diversifying into more categories</span>
              </div>
            )}
            
            {diversificationMetrics.largestAllocation < 50 ? (
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-[var(--text-primary)]">No single position is over-concentrated</span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">!</span>
                <span className="text-[var(--text-primary)]">Consider rebalancing largest position</span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-[var(--accent-primary)] mt-0.5">•</span>
              <span className="text-[var(--text-primary)]">Portfolio spans {diversificationMetrics.totalAssets} different assets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--bg-hover)]">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Category Performance</h3>
        <div className="space-y-3">
          {allocationData.map((item, index) => (
            <div key={item.category} className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-hover)]/50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div>
                  <span className="font-medium text-[var(--text-primary)]">{item.category}</span>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {item.count} asset{item.count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-medium text-[var(--text-primary)]">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {item.profitLoss >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-sm ${item.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(item.profitPercentage)}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {formatCurrency(Math.abs(item.profitLoss))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}